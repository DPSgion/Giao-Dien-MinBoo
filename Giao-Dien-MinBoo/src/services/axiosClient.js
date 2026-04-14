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

        // Tự động đính kèm user-id header cho backend Java nhận diện
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                let userId = parsed.user_id || parsed.id;
                
                // Chỉ set header nếu userId là một UUID hợp lệ, tránh lỗi gửi username
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);
                
                // QUAN TRỌNG: Chỉ gửi header user-id cho duy nhất API về bình luận (/comments)
                // Các API khác trên backend không yêu cầu header này và sẽ tự chặn ngang (lỗi CORS Network Error) nếu ta cố gắng đính kèm nó!
                const isCommentEndpoint = config.url && config.url.includes('/comments');

                if (userId && typeof userId === 'string' && isUUID && isCommentEndpoint) {
                    config.headers["user-id"] = userId;
                }
            } catch (e) {
                console.error("Lỗi parse user từ localStorage:", e);
            }
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
        console.error("[Axios Error] Endpoint:", originalRequest?.url, "- Message:", error.message, "- Response:", error.response);
        console.dir(error);

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
                console.log("[Axios Interceptor] Refreshing token...");
                // [API 2.3] POST /auth/refresh-token - Lấy token mới
                const res = await axios.post(`${BASE_URL}/auth/refresh-token`, {
                    refresh_token,
                });
                console.log("[Axios Interceptor] Refresh token success!");
                const { access_token, refresh_token: newRefresh } = res.data.data;
                localStorage.setItem("access_token", access_token);
                localStorage.setItem("refresh_token", newRefresh);
                axiosClient.defaults.headers.common.Authorization = `Bearer ${access_token}`;
                processQueue(null, access_token);
                return axiosClient(originalRequest);
            } catch (refreshError) {
                console.error("[Axios Interceptor] Refresh token failed:", refreshError.message, refreshError.response);
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
