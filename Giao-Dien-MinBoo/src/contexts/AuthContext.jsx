import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Khôi phục user từ localStorage khi app khởi động
        const savedUser = localStorage.getItem("user");
        const token = localStorage.getItem("access_token");
        if (savedUser && token) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        const res = await authService.login(credentials);
        // Hỗ trợ cả 2 trường hợp BE trả về { data: {...} } hoặc trả thẳng { access_token, user }
        const access_token = res.access_token || res.data?.access_token;
        const refresh_token = res.refresh_token || res.data?.refresh_token;
        const loggedInUser = res.user || res.data?.user || res; // Nếu BE trả gộp thì res chính là user

        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        return loggedInUser;
    };

    const register = async (data) => {
        const res = await authService.register(data);
        // BE chỉ trả về object User (không có data wrap, không có token) theo như test Postman
        // Do đó ta sẽ không set token vào localStorage ở bước này.
        return res;
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
