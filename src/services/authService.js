import axiosClient from "./axiosClient";
import axios from "axios";

const BASE_URL = "https://www.minboo-be.io.vn";

const authService = {
  // ============================================================
  // [API 2.1] POST /auth/register - Đăng ký tài khoản mới
  // Backend Java: AuthController.register()
  // Body: { name, username, password, email, sdt, birth?, sex?, address? }
  // Response 201: { success, data: { user, access_token, refresh_token } }
  // ============================================================
  register: (data) => axiosClient.post("/auth/register", data),

  // ============================================================
  // [API 2.2] POST /auth/login - Đăng nhập
  // Backend Java: AuthController.login()
  // Body: { username, password }
  // Response 200: { success, data: { user, access_token, refresh_token } }
  // ============================================================
  login: (data) => axiosClient.post("/auth/login", data),

  // ============================================================
  // [API 2.3] POST /auth/refresh-token - Lấy token mới
  // Backend Java: AuthController.refreshToken()
  // Body: { refresh_token }
  // Response 200: { success, data: { access_token, refresh_token } }
  // Lưu ý: KHÔNG cần Authorization header
  // ============================================================
  refreshToken: (refresh_token) =>
    axios.post(`${BASE_URL}/auth/refresh-token`, { refresh_token }),

  // ============================================================
  // [API 2.4] POST /auth/logout - Đăng xuất
  // Backend Java: AuthController.logout()
  // Header: Authorization Bearer <access_token> (BẮT BUỘC)
  // Body: { refresh_token }
  // Response 200: { success, message }
  // ============================================================
  logout: (refresh_token) => axiosClient.post("/auth/logout", { refresh_token }),
};

export default authService;
