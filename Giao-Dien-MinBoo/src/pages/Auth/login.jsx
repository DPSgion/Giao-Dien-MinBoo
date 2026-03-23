/**
 * Login.jsx — MinBOO (Instagram-style)
 * Stack  : React 18 + TailwindCSS + Axios + React Router v6
 * API    : Java Spring Boot → POST /api/auth/login
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  TAILWIND DESIGN TOKENS — đổi tại đây để restyle toàn trang    ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Page bg       : bg-[#fafafa]                                   ║
 * ║  Card bg       : bg-white  border-[#dbdbdb]                     ║
 * ║  Input bg      : bg-[#fafafa]  focus: bg-white                  ║
 * ║  Primary btn   : bg-[#0095f6]  hover: bg-[#1877f2]              ║
 * ║  Facebook btn  : text-[#385185]                                 ║
 * ║  Forgot link   : text-[#00376b]                                 ║
 * ║  Error         : text-[#ed4956]                                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * OPTIONAL — Thêm vào index.css để dùng font chữ logo đẹp hơn:
 *   @import url('https://fonts.googleapis.com/css2?family=Grand+Hotel&display=swap');
 *   .font-logo { font-family: 'Grand Hotel', cursive; }
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// ─── 🔧 API CONFIG ─────────────────────────────────────────────────────────────
// Đổi BASE_URL thành domain Java Spring Boot của bạn
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
    // withCredentials: true,   // ← Bật nếu backend dùng HttpOnly Cookie / CORS
});
// ───────────────────────────────────────────────────────────────────────────────

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
const IconHeart = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;
const IconMessage = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const IconSend = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;
const IconBookmark = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>;
const IconSearch = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const IconMenu = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;

// ─── SPINNER ─────────────────────────────────────────────────────────────────
const Spinner = () => (
    <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
);

// ─── STORY COLORS ─────────────────────────────────────────────────────────────
const STORY_COLORS = ['#c8e6c9', '#bbdefb', '#fce4ec', '#fff9c4', '#e1f5fe'];
const STORY_NAMES = ['linh', 'minh', 'anna', 'huy', 'thy'];

// ─── PHONE SCREEN: Feed ───────────────────────────────────────────────────────
const ScreenFeed = () => (
    <div className="flex-shrink-0 bg-white overflow-hidden pt-[18px]" style={{ width: '33.333%' }}>
        <div className="flex items-center justify-between px-3 pb-2 border-b border-[#dbdbdb]">
            <span className="text-[13px] font-extrabold italic tracking-tight" style={{ fontFamily: "Georgia,serif" }}>MinBOO</span>
            <div className="flex gap-2"><IconHeart /><IconMessage /></div>
        </div>
        {/* Stories */}
        <div className="flex gap-1.5 px-2.5 py-2 border-b border-[#dbdbdb] overflow-hidden">
            {STORY_COLORS.map((c, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5 flex-shrink-0">
                    <div className="rounded-full p-[2px]" style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
                        <div className="w-8 h-8 rounded-full border-2 border-white" style={{ background: c }} />
                    </div>
                    <span className="text-[8px] text-[#262626]">{STORY_NAMES[i]}</span>
                </div>
            ))}
        </div>
        {/* Post */}
        <div>
            <div className="flex items-center gap-1.5 px-3 py-2">
                <div className="w-6 h-6 rounded-full bg-[#81c784] flex-shrink-0" />
                <span className="text-[10px] font-semibold text-[#262626]">linh_nt</span>
                <span className="ml-auto text-[9px] text-[#737373]">•••</span>
            </div>
            <div className="w-full aspect-square flex items-center justify-center" style={{ background: 'linear-gradient(160deg,#e8f5e9,#a5d6a7)' }}>
                <div className="w-12 h-12 rounded-full bg-white/60" />
            </div>
            <div className="px-3 py-2">
                <div className="flex items-center gap-2.5 mb-1">
                    <IconHeart /><IconMessage /><IconSend />
                    <span className="ml-auto"><IconBookmark /></span>
                </div>
                <div className="text-[9px] font-semibold text-[#262626]">1,248 lượt thích</div>
                <div className="text-[9px] text-[#262626] mt-0.5"><strong>linh_nt</strong> Buổi sáng đẹp ✨</div>
            </div>
        </div>
    </div>
);

// ─── PHONE SCREEN: Explore ────────────────────────────────────────────────────
const EXPLORE_COLORS = ['#bbdefb', '#c8e6c9', '#fce4ec', '#fff9c4', '#e1f5fe', '#f3e5f5', '#e8f5e9', '#fbe9e7', '#e0f7fa'];
const ScreenExplore = () => (
    <div className="flex-shrink-0 bg-white overflow-hidden pt-[18px]" style={{ width: '33.333%' }}>
        <div className="flex items-center px-2 py-2 border-b border-[#dbdbdb]">
            <div className="flex-1 bg-[#efefef] h-6 rounded-lg flex items-center px-2 gap-1">
                <IconSearch />
                <span className="text-[10px] text-[#8e8e8e]">Tìm kiếm</span>
            </div>
        </div>
        <div className="grid grid-cols-3 gap-px mt-px">
            {EXPLORE_COLORS.map((c, i) => (
                <div key={i} className="aspect-square" style={{ background: c, gridRow: i === 1 ? 'span 2' : undefined }} />
            ))}
        </div>
    </div>
);

// ─── PHONE SCREEN: Profile ────────────────────────────────────────────────────
const PROFILE_COLORS = ['#bbdefb', '#fce4ec', '#c8e6c9', '#fff9c4', '#e1f5fe', '#f3e5f5'];
const ScreenProfile = () => (
    <div className="flex-shrink-0 bg-white overflow-hidden pt-[18px]" style={{ width: '33.333%' }}>
        <div className="flex items-center justify-between px-3 pb-2 border-b border-[#dbdbdb]">
            <span className="text-[11px] font-bold text-[#262626]">minboo_user</span>
            <IconMenu />
        </div>
        <div className="px-3 pt-2.5">
            <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-12 h-12 rounded-full bg-[#ef9a9a] flex-shrink-0 border-2 border-white outline outline-2 outline-[#f48fb1]" />
                <div className="flex-1 flex justify-around text-center">
                    {[['42', 'bài viết'], ['1.2k', 'người theo'], ['380', 'đang theo']].map(([n, l]) => (
                        <div key={l}><div className="text-[11px] font-bold text-[#262626]">{n}</div><div className="text-[8px] text-[#737373]">{l}</div></div>
                    ))}
                </div>
            </div>
            <div className="text-[10px] font-semibold text-[#262626]">MinBOO User ✨</div>
            <div className="text-[8.5px] text-[#737373] mb-2">🌿 Sống chậm, cảm nhiều hơn</div>
            <button className="w-full bg-[#efefef] text-[#262626] text-[9px] font-semibold rounded-md py-1.5">Chỉnh sửa trang cá nhân</button>
        </div>
        <div className="grid grid-cols-3 gap-px mt-2">
            {PROFILE_COLORS.map((c, i) => (
                <div key={i} className="aspect-square" style={{ background: c }} />
            ))}
        </div>
    </div>
);

// ─── PHONE MOCKUP (desktop only) ─────────────────────────────────────────────
const PhoneMockup = () => {
    const [active, setActive] = useState(0);
    const total = 3;

    useEffect(() => {
        const t = setInterval(() => setActive((p) => (p + 1) % total), 3500);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="hidden lg:flex flex-col items-center mr-8 flex-shrink-0">
            {/* Phone frame */}
            <div
                className="relative overflow-hidden bg-white"
                style={{ width: 220, height: 436, border: '7px solid #1a1a1a', borderRadius: 32, outline: '2px solid #2d2d2d' }}
            >
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-[#1a1a1a] rounded-b-xl" style={{ width: 68, height: 18 }} />
                {/* Slide track */}
                <div
                    className="flex h-full transition-transform duration-700 ease-in-out"
                    style={{ width: `${total * 100}%`, transform: `translateX(-${(active * 100) / total}%)` }}
                >
                    <ScreenFeed />
                    <ScreenExplore />
                    <ScreenProfile />
                </div>
            </div>
            {/* Dots */}
            <div className="flex gap-1.5 mt-3">
                {Array.from({ length: total }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
                        style={{ background: i === active ? '#262626' : '#c7c7c7' }} />
                ))}
            </div>
        </div>
    );
};

// ─── MAIN: Login ─────────────────────────────────────────────────────────────
const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError('');
    };

    const isDisabled = loading || !formData.email.trim() || !formData.password.trim();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isDisabled) return;
        setLoading(true);
        setError('');

        try {
            // ───────────────────────────────────────────────────────────────────────
            // 🔌 GẮN API BACKEND JAVA — Login
            //
            // Endpoint : POST /api/auth/login
            // Request  : { email: string, password: string }
            // Response : { token: string, refreshToken?: string,
            //              user: { id, username, fullName, avatar, email } }
            //
            // const { data } = await api.post('/api/auth/login', {
            //   email   : formData.email.trim(),
            //   password: formData.password,
            // });
            //
            // localStorage.setItem('accessToken', data.token);
            // if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
            //
            // // Lưu user vào state management (Redux / Zustand / Context):
            // // dispatch(setUser(data.user));
            //
            // navigate('/');
            // ───────────────────────────────────────────────────────────────────────

            // 🚧 MOCK — xoá block này khi gắn API thật ─────────────────────────────
            await new Promise((r) => setTimeout(r, 900));
            localStorage.setItem('accessToken', 'mock-token-minboo');
            navigate('/');
            // ───────────────────────────────────────────────────────────────────────
        } catch (err) {
            // ───────────────────────────────────────────────────────────────────────
            // 🔌 XỬ LÝ LỖI TỪ BACKEND JAVA
            //
            // if (err.response) {
            //   const { status, data } = err.response;
            //   if (status === 401) setError('Mật khẩu hoặc tên người dùng không đúng.');
            //   else if (status === 403) setError('Tài khoản đã bị khóa. Liên hệ hỗ trợ.');
            //   else if (status === 429) setError('Quá nhiều lần thử. Vui lòng đợi vài phút.');
            //   else setError(data?.message || 'Đã có lỗi xảy ra. Thử lại sau.');
            // } else {
            //   setError('Không thể kết nối đến server.');
            // }
            // ───────────────────────────────────────────────────────────────────────
            setError('Mật khẩu hoặc tên người dùng không đúng.');
        } finally {
            setLoading(false);
        }
    };

    const handleFacebookLogin = () => {
        // ───────────────────────────────────────────────────────────────────────
        // 🔌 GẮN API — Facebook OAuth2 (Spring Security)
        //
        // window.location.href = `${BASE_URL}/oauth2/authorization/facebook`;
        // ───────────────────────────────────────────────────────────────────────
        console.log('Facebook login — chưa kết nối API');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafafa] py-8 px-4">
            <div className="flex items-center justify-center w-full max-w-[935px]">

                {/* Phone Mockup */}
                <PhoneMockup />

                {/* Right column */}
                <div className="flex flex-col w-full max-w-[350px]">

                    {/* ── Login Card ─────────────────────────────────────────────────── */}
                    <div className="bg-white border border-[#dbdbdb] px-10 pt-10 pb-6 flex flex-col items-center mb-[10px]">

                        {/* Logo — thêm class "font-logo" nếu đã cài Grand Hotel font */}
                        <h1
                            className="text-[35px] font-black italic tracking-tight text-[#262626] mb-7 select-none leading-none"
                            style={{ fontFamily: "Georgia,'Times New Roman',serif" }}
                        >
                            MinBOO
                        </h1>

                        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[6px]" noValidate>

                            {/* Email / Username */}
                            <input
                                type="text"
                                name="email"
                                placeholder="Số điện thoại, tên người dùng hoặc email"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="username"
                                autoCapitalize="none"
                                className={`w-full h-[38px] px-2 bg-[#fafafa] border rounded-sm text-xs text-[#262626] placeholder-[#8e8e8e] outline-none transition-colors duration-150 focus:bg-white ${error ? 'border-[#ed4956]' : 'border-[#dbdbdb] focus:border-[#a8a8a8]'}`}
                            />

                            {/* Password */}
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Mật khẩu"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    className={`w-full h-[38px] px-2 pr-14 bg-[#fafafa] border rounded-sm text-xs text-[#262626] placeholder-[#8e8e8e] outline-none transition-colors duration-150 focus:bg-white ${error ? 'border-[#ed4956]' : 'border-[#dbdbdb] focus:border-[#a8a8a8]'}`}
                                />
                                {formData.password && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#262626] hover:text-[#737373] transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? 'Ẩn' : 'Hiện'}
                                    </button>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isDisabled}
                                className={`w-full h-[32px] mt-2 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-150 ${isDisabled ? 'bg-[#0095f6] opacity-30 cursor-not-allowed' : 'bg-[#0095f6] hover:bg-[#1877f2] active:scale-[0.98]'}`}
                            >
                                {loading ? <><Spinner />Đang đăng nhập…</> : 'Đăng nhập'}
                            </button>
                        </form>

                        {/* OR divider */}
                        <div className="flex items-center w-full my-[18px]">
                            <div className="flex-1 h-px bg-[#dbdbdb]" />
                            <span className="px-4 text-[13px] text-[#737373] font-semibold tracking-widest">HOẶC</span>
                            <div className="flex-1 h-px bg-[#dbdbdb]" />
                        </div>

                        {/* Facebook */}
                        <button
                            type="button"
                            onClick={handleFacebookLogin}
                            className="flex items-center justify-center gap-2 text-[#385185] font-semibold text-sm hover:text-[#1e3a6e] transition-colors w-full"
                        >
                            <div className="w-[17px] h-[17px] bg-[#385185] rounded-sm flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-[11px] font-black leading-none">f</span>
                            </div>
                            Đăng nhập bằng Facebook
                        </button>

                        {error && <p className="text-[#ed4956] text-[12px] text-center mt-3 leading-snug">{error}</p>}

                        <Link to="/forgot-password" className="text-[#00376b] text-xs text-center mt-3 hover:underline">
                            Quên mật khẩu?
                        </Link>
                    </div>

                    {/* Sub card */}
                    <div className="bg-white border border-[#dbdbdb] p-[18px] text-center mb-[10px]">
                        <p className="text-[14px] text-[#262626]">
                            Bạn chưa có tài khoản?{' '}
                            <Link to="/register" className="text-[#0095f6] font-semibold hover:underline">Đăng ký</Link>
                        </p>
                    </div>

                    {/* App download */}
                    <div className="text-center mt-1">
                        <p className="text-[14px] text-[#262626] mb-3">Tải ứng dụng.</p>
                        <div className="flex justify-center gap-2">
                            {/* 🔌 Thay href thành link App Store / Google Play thật */}
                            <a href="#app-store" className="border border-[#262626] rounded-md px-3 py-1.5 text-[11px] font-semibold text-[#262626] hover:bg-[#f2f2f2] transition-colors">App Store</a>
                            <a href="#google-play" className="border border-[#262626] rounded-md px-3 py-1.5 text-[11px] font-semibold text-[#262626] hover:bg-[#f2f2f2] transition-colors">Google Play</a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;