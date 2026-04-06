import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "", username: "", email: "", password: "", sdt: "",
        birth: "", sex: "", address: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            // [API 2.1] POST /auth/register
            // Bắt buộc: name, username, password, email, sdt
            // Tùy chọn: birth, sex, address
            await register(form);
            alert("Đăng ký thành công! Hãy đăng nhập bằng tài khoản vừa tạo.");
            navigate("/login");
        } catch (err) {
            const code = err?.error_code;
            if (code === "USERNAME_EXISTS") setError("Tên đăng nhập đã tồn tại");
            else if (code === "EMAIL_EXISTS") setError("Email đã được sử dụng");
            else setError(err?.message || "Đăng ký thất bại, thử lại sau");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-sm">
                <div className="bg-white border border-gray-200 rounded-sm px-10 py-8 mb-3">
                    <h1 className="text-center font-bold text-3xl mb-2 tracking-tight"
                        style={{ fontFamily: "'Dancing Script', cursive, sans-serif", fontSize: "42px" }}>
                        MinBoo
                    </h1>
                    <p className="text-center text-gray-500 font-semibold text-base mb-5 leading-tight">
                        Đăng ký để xem ảnh và video từ bạn bè.
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded px-3 py-2 mb-4 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-2">
                        <input name="email" type="email" placeholder="Email *" value={form.email}
                            onChange={handleChange} required
                            className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400 placeholder-gray-500" />
                        <input name="sdt" type="tel" placeholder="Số điện thoại *" value={form.sdt}
                            onChange={handleChange} required
                            className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400 placeholder-gray-500" />
                        <input name="name" type="text" placeholder="Họ và tên *" value={form.name}
                            onChange={handleChange} required
                            className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400 placeholder-gray-500" />
                        <input name="username" type="text" placeholder="Tên người dùng *" value={form.username}
                            onChange={handleChange} required
                            className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400 placeholder-gray-500" />
                        <input name="password" type="password" placeholder="Mật khẩu *" value={form.password}
                            onChange={handleChange} required
                            className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400 placeholder-gray-500" />

                        {/* Optional fields */}
                        <div className="pt-1 space-y-2">
                            <input name="address" type="text" placeholder="Địa chỉ / Thành phố" value={form.address}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400 placeholder-gray-500" />
                            <input name="birth" type="date" placeholder="Ngày sinh" value={form.birth}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400 text-gray-500" />
                            <select name="sex" value={form.sex} onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400 text-gray-500">
                                <option value="">Giới tính</option>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>

                        <p className="text-xs text-gray-400 text-center leading-relaxed">
                            Bằng cách đăng ký, bạn đồng ý với{" "}
                            <a href="#" className="text-blue-900 font-semibold hover:underline">Điều khoản</a>,{" "}
                            <a href="#" className="text-blue-900 font-semibold hover:underline">Chính sách quyền riêng tư</a> của chúng tôi.
                        </p>

                        <button type="submit" disabled={loading}
                            className="w-full bg-blue-500 text-white font-semibold text-sm py-1.5 rounded-lg mt-1 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                            {loading ? "Đang đăng ký..." : "Đăng ký"}
                        </button>
                    </form>
                </div>

                <div className="bg-white border border-gray-200 rounded-sm p-5 text-center text-sm">
                    Đã có tài khoản?{" "}
                    <Link to="/login" className="text-blue-500 font-semibold hover:underline">
                        Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}
