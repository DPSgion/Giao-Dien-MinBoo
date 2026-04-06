import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // [API 2.2] POST /auth/login
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err?.message || "Tên đăng nhập hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="bg-white border border-gray-200 rounded-sm px-10 py-8 mb-3">
          <h1 className="text-center font-bold text-3xl mb-8 tracking-tight"
            style={{ fontFamily: "'Dancing Script', cursive, sans-serif", fontSize: "42px" }}>
            MinBoo
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded px-3 py-2 mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              name="username"
              type="text"
              placeholder="Tên người dùng"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400 placeholder-gray-500"
            />
            <input
              name="password"
              type="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400 placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={loading || !form.username || !form.password}
              className="w-full bg-blue-500 text-white font-semibold text-sm py-1.5 rounded-lg mt-2 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-4 text-xs font-semibold text-gray-500">HOẶC</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          <button className="w-full flex items-center justify-center gap-2 text-sm text-blue-900 font-semibold hover:opacity-70 transition-opacity">
            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Đăng nhập bằng Facebook
          </button>

          <div className="text-center mt-4">
            <a href="#" className="text-xs text-gray-900 font-semibold hover:underline">
              Quên mật khẩu?
            </a>
          </div>
        </div>

        {/* Register link */}
        <div className="bg-white border border-gray-200 rounded-sm p-5 text-center text-sm">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-500 font-semibold hover:underline">
            Đăng ký
          </Link>
        </div>

        {/* App download */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-900 mb-3">Tải ứng dụng.</p>
          <div className="flex justify-center gap-2">
            <img src="https://static.cdninstagram.com/rsrc.php/v3/yz/r/c5Rp7Ym-Klz.png"
              alt="App Store" className="h-10 object-contain" />
            <img src="https://static.cdninstagram.com/rsrc.php/v3/yu/r/EHY6QnZYdNX.png"
              alt="Google Play" className="h-10 object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}
