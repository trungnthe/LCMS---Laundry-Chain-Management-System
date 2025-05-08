// Hàm refresh token
const apiUrl = import.meta.env.VITE_API_URL;


export const refreshToken = async () => {
    try {
        const response = await fetch(`${apiUrl}/api/Auth/refresh-token`, {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) {
            const errorText = await response.text();
            return null;
        }

        const data = await response.json();
        const newToken = data.accessToken || data.token;
        if (!newToken) {
            return null;
        }

        localStorage.setItem("token", newToken);
        return newToken;
    } catch (error) {
        return null;
    }
};

export const fetchWithRefresh = async (url, options = {}) => {
    let token = localStorage.getItem("token");

    if (!token) {
        redirectToLogin();
        return null;
    }

    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    let response;
    try {
        response = await fetch(url, options);
    } catch (err) {
        return null;
    }

    if (response.status === 401) {
        const newToken = await refreshToken();

        if (!newToken) {
            localStorage.removeItem("token");
            redirectToLogin();
            return null;
        }

        options.headers.Authorization = `Bearer ${newToken}`;
        try {
            response = await fetch(url, options);
        } catch (err) {
            return null;
        }
    }

    if (!response) {
        return null;
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API lỗi: ${response.status} - ${response.statusText}. Chi tiết: ${errorText}`);
    }

    try {
        const result = await response.json();
        return result;
    } catch (err) {
        return null;
    }
};

// Hàm chuyển hướng về trang đăng nhập
const redirectToLogin = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // Chuyển hướng về trang đăng nhập
};
