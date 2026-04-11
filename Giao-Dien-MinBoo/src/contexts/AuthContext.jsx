import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";
import axiosClient from "../services/axiosClient";
import { userService } from "../services/apiServices";
const AuthContext = createContext(null);

// Helper: decode JWT payload (không cần thư viện ngoài)
function decodeJwtPayload(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

// Helper: chuẩn hoá user object từ BE → FE
function normalizeUser(raw) {
    if (!raw) return raw;
    // Chuẩn hoá UUID: thay khoảng trắng bằng dấu gạch ngang
    let id = raw.id || raw.user_id;
    if (id && typeof id === 'string') {
        id = id.replace(/\s+/g, '-');
    }
    return {
        ...raw,
        id: id,
        user_id: id,
        url_avt: raw.avatar || raw.url_avt,
    };
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const savedUser = localStorage.getItem("user");
            const token = localStorage.getItem("access_token");
            if (savedUser && token) {
                let parsed = JSON.parse(savedUser);

                // AUTO-REPAIR: nếu user cũ thiếu user_id, decode JWT và fetch lại profile
                if (!parsed.user_id && !parsed.id) {
                    const payload = decodeJwtPayload(token);
                    const userId = payload?.sub || payload?.user_id || payload?.id;
                    if (userId) {
                        const fullProfile = await fetchFullProfile(userId);
                        if (fullProfile) {
                            parsed = fullProfile;
                            localStorage.setItem("user", JSON.stringify(parsed));
                        } else {
                            parsed = { ...parsed, user_id: userId };
                            localStorage.setItem("user", JSON.stringify(parsed));
                        }
                    }
                }

                setUser(parsed);
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    // Lấy đầy đủ profile từ BE bằng user id
    const fetchFullProfile = async (userId) => {
        try {
            // Sử dụng getCurrentUser đã được bọc logic phân biệt UUID bên apiServices
            const profileRes = await userService.getCurrentUser();
            const profileData = profileRes.data?.data || profileRes.data || profileRes;
            return normalizeUser(profileData);
        } catch (e) {
            console.warn("Không lấy được profile sau login:", e);
            return null;
        }
    };

    // [API 2.2] Login
    const login = async (credentials) => {
        const res = await authService.login(credentials);

        const data = res.data || res;
        const access_token = data.accessToken || data.access_token || res.accessToken || res.access_token;
        const refresh_token = data.refreshToken || data.refresh_token || res.refreshToken || res.refresh_token;

        if (access_token) localStorage.setItem("access_token", access_token);
        if (refresh_token) localStorage.setItem("refresh_token", refresh_token);

        // Bước 1: Lấy userId từ response login (nếu BE trả kèm user)
        let loggedInUser = data.user ? normalizeUser(data.user) : null;
        let userId = loggedInUser?.user_id;

        // Bước 2: Nếu response login KHÔNG có user → decode JWT để lấy userId
        if (!userId && access_token) {
            const payload = decodeJwtPayload(access_token);
            // JWT thường chứa sub (subject = userId) hoặc user_id hoặc id
            userId = payload?.sub || payload?.user_id || payload?.id;
        }

        // Bước 3: Gọi GET /users/{id} để lấy TOÀN BỘ thông tin profile
        if (userId) {
            const fullProfile = await fetchFullProfile(userId);
            if (fullProfile) {
                loggedInUser = fullProfile;
            } else if (!loggedInUser) {
                // Fallback: tạo user tạm từ JWT
                loggedInUser = normalizeUser({ id: userId, username: credentials.username });
            }
        } else if (!loggedInUser) {
            // Fallback cuối cùng
            loggedInUser = { username: credentials.username };
        }

        localStorage.setItem("user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        return loggedInUser;
    };

    // [API 2.1] Register
    const register = async (dataPayload) => {
        const res = await authService.register(dataPayload);

        const data = res.data || res;
        const access_token = data.accessToken || data.access_token || res.accessToken || res.access_token;
        const refresh_token = data.refreshToken || data.refresh_token || res.refreshToken || res.refresh_token;

        if (access_token) localStorage.setItem("access_token", access_token);
        if (refresh_token) localStorage.setItem("refresh_token", refresh_token);

        let loggedInUser = data.user ? normalizeUser(data.user) : null;
        let userId = loggedInUser?.user_id;

        if (!userId && access_token) {
            const payload = decodeJwtPayload(access_token);
            userId = payload?.sub || payload?.user_id || payload?.id;
        }

        if (userId) {
            const fullProfile = await fetchFullProfile(userId);
            if (fullProfile) loggedInUser = fullProfile;
            else if (!loggedInUser) loggedInUser = normalizeUser({ id: userId, username: dataPayload.username });
        } else if (!loggedInUser) {
            loggedInUser = normalizeUser(data);
        }

        localStorage.setItem("user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        return loggedInUser;
    };

    const logout = async () => {
        try {
            const refresh_token = localStorage.getItem("refresh_token");
            await authService.logout(refresh_token);
        } catch (_) { }
        localStorage.clear();
        setUser(null);
    };

    const updateUser = (updatedUser) => {
        const merged = { ...user, ...updatedUser };
        localStorage.setItem("user", JSON.stringify(merged));
        setUser(merged);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
