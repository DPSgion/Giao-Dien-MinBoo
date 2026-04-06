import axiosClient from "./axiosClient";
import axios from "axios";

const BASE_URL = "https://www.minboo-be.io.vn";

const authService = {
    // [API 2.1] POST /auth/register
    // Body: { name, username, password, email, sdt, birth?, sex?, address? }
    register: (data) => {
        const payload = { ...data };
        if (payload.sdt) {
            payload.phone = payload.sdt;
            delete payload.sdt;
        }
        if (payload.sex === 'male') payload.sex = "1";
        else if (payload.sex === 'female') payload.sex = "0";
        else payload.sex = "2";
        
        return axiosClient.post("/auth/register", payload);
    },

    // [API 2.2] POST /auth/login
    // Body: { username, password }
    // Response 200: { success, data: { user, access_token, refresh_token } }
    login: (data) => axiosClient.post("/auth/login", data),

    // [API 2.3] POST /auth/refresh-token (KHÔNG cần Authorization header)
    // Body: { refresh_token }
    // Response 200: { success, data: { access_token, refresh_token } }
    refreshToken: (refresh_token) =>
        axios.post(`${BASE_URL}/auth/refresh-token`, { refresh_token }),

    // [API 2.4] POST /auth/logout (CÓ cần Authorization header)
    // Body: { refresh_token }
    // Response 200: { success, message }
    logout: (refresh_token) => axiosClient.post("/auth/logout", { refresh_token }),
};

export default authService;
