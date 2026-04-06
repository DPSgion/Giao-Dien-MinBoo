import axios from "axios";

// BASE URL - Backend Java Spring Boot
const BASE_URL = "https://www.minboo-be.io.vn";

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
});

// ============================================================
// REQUEST INTERCEPTOR
// Tự động đính kèm access_token vào header Authorization
// ============================================================
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ============================================================
// RESPONSE INTERCEPTOR
// Xử lý lỗi 401 (TOKEN_EXPIRED) -> tự động refresh token
// ============================================================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

axiosClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và chưa retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Đang refresh -> xếp hàng chờ
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refresh_token = localStorage.getItem("refresh_token");
                // [API 2.3] POST /auth/refresh-token - Lấy token mới
                const res = await axios.post(`${BASE_URL}/auth/refresh-token`, {
                    refresh_token,
                });
                const { access_token, refresh_token: newRefresh } = res.data.data;
                localStorage.setItem("access_token", access_token);
                localStorage.setItem("refresh_token", newRefresh);
                axiosClient.defaults.headers.common.Authorization = `Bearer ${access_token}`;
                processQueue(null, access_token);
                return axiosClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Refresh thất bại -> logout
                localStorage.clear();
                window.location.href = "/login";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error.response?.data || error);
    }
);

export default axiosClient;
