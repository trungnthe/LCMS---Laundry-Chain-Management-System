using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public UploadController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File không hợp lệ.");

            try
            {
                string uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", "avatar-employee");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                string filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                string fileUrl = $"/uploads/{fileName}"; // Đường dẫn ảnh để lưu vào DB

                return Ok(new { url = fileUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi server: " + ex.Message);
            }
        }

        [HttpGet("get-image")]
        public IActionResult GetImage([FromQuery] string relativePath)
        {
            try
            {
                // Loại bỏ dấu / đầu nếu có
                if (relativePath.StartsWith("/"))
                    relativePath = relativePath.Substring(1);

                string fullPath = Path.Combine(_env.WebRootPath, relativePath.Replace("/", Path.DirectorySeparatorChar.ToString()));

                if (!System.IO.File.Exists(fullPath))
                {
                    return NotFound("Ảnh không tồn tại.");
                }

                byte[] fileBytes = System.IO.File.ReadAllBytes(fullPath);

                var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
                if (!provider.TryGetContentType(fullPath, out string contentType))
                {
                    contentType = "application/octet-stream";
                }
                return File(fileBytes, contentType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi server: " + ex.Message);
            }
        }


    }
}
