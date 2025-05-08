from flask import Flask, request, jsonify  
from flask_cors import CORS  # Thêm vào dòng này  
import face_recognition  
import numpy as np  
from PIL import Image, UnidentifiedImageError  
import io  

app = Flask(__name__)  

# Bật CORS cho tất cả các routes  
CORS(app)  

def get_face_encoding(image_bytes):  
    """Chuyển đổi ảnh từ bytes sang encoding của face_recognition."""  
    try:  
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")  
        image = np.array(image)  
        face_encodings = face_recognition.face_encodings(image)  
        return face_encodings[0] if face_encodings else None  
    except UnidentifiedImageError:  
        return None  
    except Exception as e:  
        print(f"Error processing image: {e}")  
        return None  

def is_blurry(image):  
    """Kiểm tra ảnh có bị mờ không bằng cách tính độ biến thiên độ sáng."""  
    gray = np.dot(image[..., :3], [0.2989, 0.587, 0.114])  # Chuyển sang ảnh đen trắng  
    variance = np.var(gray)  # Tính phương sai  
    return variance < 500  # Nếu phương sai thấp, ảnh có thể bị mờ  

def is_brightness_abnormal(image):  
    """Kiểm tra độ sáng ảnh."""  
    gray = np.dot(image[..., :3], [0.2989, 0.587, 0.114])  # Chuyển sang ảnh đen trắng  
    mean_brightness = np.mean(gray)  
    return mean_brightness > 200 or mean_brightness < 50  # Quá sáng hoặc quá tối  

def is_face_too_small(image_bytes):  
    """Kiểm tra khuôn mặt có quá nhỏ không."""  
    image = face_recognition.load_image_file(io.BytesIO(image_bytes))  
    face_locations = face_recognition.face_locations(image)  
    if len(face_locations) == 0:  
        return True  # Không phát hiện khuôn mặt  

    height, width, _ = image.shape  
    top, right, bottom, left = max(face_locations, key=lambda box: (box[2] - box[0]) * (box[1] - box[3]))  

    face_width = right - left  
    face_height = bottom - top  

    return (face_width / width < 0.5 or face_height / height < 0.5)  # Nếu khuôn mặt quá nhỏ  

def is_photo_or_screen(image):  
    """Kiểm tra ảnh có phải chụp từ màn hình/giấy không."""  
    gray = np.dot(image[..., :3], [0.2989, 0.587, 0.114])  # Chuyển sang ảnh đen trắng  
    
    # Áp dụng biến đổi Fourier (FFT)  
    f = np.fft.fft2(gray)  
    fshift = np.fft.fftshift(f)  
    magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1e-10)  # Tránh log(0)  

    # Tính độ tương phản tần số cao  
    high_freq = np.mean(magnitude_spectrum[:10, :10])  # Lấy phần tần số cao  

    return high_freq < 10  # Nếu quá thấp, có thể là ảnh chụp từ màn hình  

@app.route("/compare_faces", methods=["POST"])
def compare_faces():
    try:
        file1 = request.files.get("image1")  # Ảnh gốc (CSDL)
        file2 = request.files.get("image2")  # Ảnh chụp mới

        if not file1 or not file2:
            return jsonify({"error": "Both images are required"}), 400

        image_bytes1 = file1.read()
        image_bytes2 = file2.read()

        # Kiểm tra ảnh 2 (ảnh chụp mới)
        try:
            image2 = Image.open(io.BytesIO(image_bytes2)).convert("RGB")
            image2 = np.array(image2)
        except UnidentifiedImageError:
            return jsonify({"error": "Invalid image format"}), 400

        # Kiểm tra các lỗi giả mạo
        if is_blurry(image2):
            return jsonify({"error": "Fake detection: Image is too blurry"}), 400
        if is_brightness_abnormal(image2):
            return jsonify({"error": "Fake detection: Image brightness is abnormal"}), 400
        if is_photo_or_screen(image2):
            return jsonify({"error": "Fake detection: Possible photo or screen image"}), 400

        # Kiểm tra xem có khuôn mặt trong ảnh không
        encoding1 = get_face_encoding(image_bytes1)
        encoding2 = get_face_encoding(image_bytes2)

        # Kiểm tra nếu không có khuôn mặt nào
        if encoding1 is None:
            return jsonify({"error": "No face detected in the first image"}), 400
        if encoding2 is None:
            return jsonify({"error": "No face detected in the second image"}), 400

        match_result = face_recognition.compare_faces([encoding1], encoding2)
        match = bool(match_result[0]) if match_result else False

        return jsonify({
            "face_match": match,
            "message": "Matching" if match else "Not Matching"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == "__main__":  
    app.run(host="0.0.0.0", port=5050, debug=True)  
