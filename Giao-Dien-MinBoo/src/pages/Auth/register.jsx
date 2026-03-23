/**
 * Register.jsx — MinBOO (Instagram-style)
 * Stack  : React 18 + TailwindCSS + Axios + React Router v6
 * API    : Java Spring Boot → POST /api/auth/register
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  TAILWIND DESIGN TOKENS — đổi tại đây để restyle toàn trang    ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Page bg       : bg-[#fafafa]                                   ║
 * ║  Card bg       : bg-white  border-[#dbdbdb]                     ║
 * ║  Input bg      : bg-[#fafafa]  focus: bg-white                  ║
 * ║  Primary btn   : bg-[#0095f6]  hover: bg-[#1877f2]              ║
 * ║  Facebook btn  : bg-[#385185]                                   ║
 * ║  Error         : text-[#ed4956]  border-[#ed4956]               ║
 * ║  Success       : text-[#2ecc71]                                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * 
 *   
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// ─── 🔧 API CONFIG ─────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
    // withCredentials: true,
});
// ───────────────────────────────────────────────────────────────────────────────

// ─── SPINNER ─────────────────────────────────────────────────────────────────
const Spinner = () => (
    <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
);

// ─── INPUT COMPONENT (tái sử dụng) ───────────────────────────────────────────
const IgInput = ({ hasError, className = '', ...props }) => (
    <input
        {...props}
        className={[
            'w-full h-[38px] px-2 bg-[#fafafa] border rounded-sm text-xs text-[#262626]',
            'placeholder-[#8e8e8e] outline-none transition-colors duration-150',
            'focus:bg-white',
            hasError ? 'border-[#ed4956]' : 'border-[#dbdbdb] focus:border-[#a8a8a8]',
            className,
        ].join(' ')}
    />
);

// ─── FIELD ERROR ─────────────────────────────────────────────────────────────
const FieldError = ({ msg }) =>
    msg ? <p className="text-[#ed4956] text-[10px] text-left mt-0.5 ml-0.5">{msg}</p> : null;

// ─── VALIDATION HELPERS ───────────────────────────────────────────────────────
const validators = {
    emailOrPhone: (v) => {
        if (!v.trim()) return 'Vui lòng nhập số điện thoại hoặc email.';
        const isEmail = v.includes('@');
        if (isEmail) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Email không hợp lệ.';
        return /^\+?[0-9]{9,15}$/.test(v.replace(/\s/g, '')) ? '' : 'Số điện thoại không hợp lệ.';
    },
    fullName: (v) => v.trim().length >= 2 ? '' : 'Họ tên tối thiểu 2 ký tự.',
    username: (v) => {
        if (!v.trim()) return 'Vui lòng nhập tên người dùng.';
        return /^[a-zA-Z0-9._]{3,30}$/.test(v) ? '' : 'Tên người dùng 3–30 ký tự, chỉ dùng chữ, số, dấu . và _';
    },
    password: (v) => v.length >= 6 ? '' : 'Mật khẩu tối thiểu 6 ký tự.',
};

const INITIAL = { emailOrPhone: '', fullName: '', username: '', password: '' };

// ─── MAIN: Register ───────────────────────────────────────────────────────────
const Register = () => {
    const [formData, setFormData] = useState(INITIAL);
    const [fieldErrors, setFieldErrors] = useState({});
    const [globalError, setGlobalError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
        if (globalError) setGlobalError('');
    };

    const validateAll = () => {
        const errors = Object.fromEntries(
            Object.entries(validators).map(([key, fn]) => [key, fn(formData[key] ?? '')])
        );
        setFieldErrors(errors);
        return Object.values(errors).every((e) => !e);
    };

    const isFormEmpty = Object.values(formData).some((v) => !v.trim());

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateAll()) return;

        setLoading(true);
        setGlobalError('');
        setSuccess('');

        try {
            // ───────────────────────────────────────────────────────────────────────
            // 🔌 GẮN API BACKEND JAVA — Register
            //
            // Endpoint : POST /api/auth/register
            //
            // Request body:
            //   {
            //     emailOrPhone : string,   // email hoặc số điện thoại
            //     fullName     : string,
            //     username     : string,
            //     password     : string,
            //   }
            //
            // Response (201 Created):
            //   { message: string, userId: number }
            //
            // const { data } = await api.post('/api/auth/register', {
            //   emailOrPhone : formData.emailOrPhone.trim(),
            //   fullName     : formData.fullName.trim(),
            //   username     : formData.username.trim(),
            //   password     : formData.password,
            // });
            //
            // setSuccess(data.message || 'Đăng ký thành công!');
            //
            // // Tuỳ flow: tự động login hay redirect sang trang xác minh OTP / email:
            // // navigate('/verify-email');
            // setTimeout(() => navigate('/login'), 1500);
            // ───────────────────────────────────────────────────────────────────────

            // 🚧 MOCK — xoá block này khi gắn API thật ─────────────────────────────
            await new Promise((r) => setTimeout(r, 1000));
            setSuccess('Đăng ký thành công! Đang chuyển hướng…');
            setTimeout(() => navigate('/login'), 1600);
            // ───────────────────────────────────────────────────────────────────────
        } catch (err) {
            // ───────────────────────────────────────────────────────────────────────
            // 🔌 XỬ LÝ LỖI TỪ BACKEND JAVA
            //
            // if (err.response) {
            //   const { status, data } = err.response;
            //   if (status === 409) {
            //     // Email/username đã tồn tại
            //     setGlobalError(data.message || 'Email hoặc tên người dùng đã được sử dụng.');
            //   } else if (status === 422) {
            //     // Validation lỗi từ server (field-level errors)
            //     // data.errors: { fieldName: 'error message' }
            //     setFieldErrors((prev) => ({ ...prev, ...(data.errors || {}) }));
            //   } else if (status === 429) {
            //     setGlobalError('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
            //   } else {
            //     setGlobalError(data?.message || 'Đã có lỗi xảy ra. Thử lại sau.');
            //   }
            // } else {
            //   setGlobalError('Không thể kết nối đến server.');
            // }
            // ───────────────────────────────────────────────────────────────────────
            setGlobalError('Đã có lỗi xảy ra. Thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleFacebookSignup = () => {
        // ───────────────────────────────────────────────────────────────────────
        // 🔌 GẮN API — Facebook OAuth2 (Spring Security)
        //
        // window.location.href = `${BASE_URL}/oauth2/authorization/facebook`;
        // ───────────────────────────────────────────────────────────────────────
        console.log('Facebook signup — chưa kết nối API');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafafa] py-10 px-4">

            {/* ── Register Card ───────────────────────────────────────────────────── */}
            <div className="bg-white border border-[#dbdbdb] px-10 pt-9 pb-6 flex flex-col items-center w-full max-w-[350px] mb-[10px]">

                {/* Logo */}
                <h1
                    className="text-[35px] font-black italic tracking-tight text-[#262626] mb-2 select-none leading-none"
                    style={{ fontFamily: "Georgia,'Times New Roman',serif" }}
                >
                    MinBOO
                </h1>

                {/* Tagline */}
                <p className="text-[#737373] text-[14px] font-semibold text-center mb-5 leading-snug">
                    Đăng ký để xem ảnh và video từ bạn bè.
                </p>

                {/* Facebook button */}
                <button
                    type="button"
                    onClick={handleFacebookSignup}
                    className="w-full h-[32px] bg-[#385185] hover:bg-[#2d4373] active:scale-[0.98] text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all duration-150 mb-4"
                >
                    <div className="w-[17px] h-[17px] bg-white rounded-sm flex items-center justify-center flex-shrink-0">
                        <span className="text-[#385185] text-[11px] font-black leading-none">f</span>
                    </div>
                    Đăng ký bằng Facebook
                </button>

                {/* OR divider */}
                <div className="flex items-center w-full mb-4">
                    <div className="flex-1 h-px bg-[#dbdbdb]" />
                    <span className="px-4 text-[13px] text-[#737373] font-semibold tracking-widest">HOẶC</span>
                    <div className="flex-1 h-px bg-[#dbdbdb]" />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[6px]" noValidate>

                    {/* Email or Phone */}
                    <div>
                        <IgInput
                            type="text"
                            name="emailOrPhone"
                            placeholder="Số điện thoại hoặc email"
                            value={formData.emailOrPhone}
                            onChange={handleChange}
                            autoComplete="email"
                            autoCapitalize="none"
                            hasError={!!fieldErrors.emailOrPhone}
                        />
                        <FieldError msg={fieldErrors.emailOrPhone} />
                    </div>

                    {/* Full Name */}
                    <div>
                        <IgInput
                            type="text"
                            name="fullName"
                            placeholder="Họ và tên đầy đủ"
                            value={formData.fullName}
                            onChange={handleChange}
                            autoComplete="name"
                            hasError={!!fieldErrors.fullName}
                        />
                        <FieldError msg={fieldErrors.fullName} />
                    </div>

                    {/* Username */}
                    <div>
                        <IgInput
                            type="text"
                            name="username"
                            placeholder="Tên người dùng"
                            value={formData.username}
                            onChange={handleChange}
                            autoComplete="username"
                            autoCapitalize="none"
                            hasError={!!fieldErrors.username}
                        />
                        <FieldError msg={fieldErrors.username} />
                    </div>

                    {/* Password with toggle */}
                    <div>
                        <div className="relative">
                            <IgInput
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                hasError={!!fieldErrors.password}
                                className="pr-14"
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
                        <FieldError msg={fieldErrors.password} />
                    </div>

                    {/* Global error / success */}
                    {globalError && <p className="text-[#ed4956] text-[12px] text-center mt-1 leading-snug">{globalError}</p>}
                    {success && <p className="text-[#2ecc71] text-[12px] text-center mt-1 leading-snug">{success}</p>}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || isFormEmpty}
                        className={[
                            'w-full h-[32px] mt-2 rounded-lg font-semibold text-sm text-white',
                            'flex items-center justify-center gap-2 transition-all duration-150',
                            loading || isFormEmpty
                                ? 'bg-[#0095f6] opacity-30 cursor-not-allowed'
                                : 'bg-[#0095f6] hover:bg-[#1877f2] active:scale-[0.98]',
                        ].join(' ')}
                    >
                        {loading ? <><Spinner />Đang đăng ký…</> : 'Đăng ký'}
                    </button>
                </form>

                {/* Terms */}
                <p className="text-[11px] text-[#737373] text-center mt-4 leading-relaxed">
                    Khi đăng ký, bạn đồng ý với{' '}
                    {/* 🔌 Thay href thành trang Terms/Privacy thật của bạn */}
                    <Link to="/terms" className="font-semibold text-[#262626] hover:underline">Điều khoản dịch vụ</Link>
                    {' '}và{' '}
                    <Link to="/privacy" className="font-semibold text-[#262626] hover:underline">Chính sách quyền riêng tư</Link>
                    {' '}của MinBOO.
                </p>
            </div>

            {/* ── Sub card — Login link ────────────────────────────────────────────── */}
            <div className="bg-white border border-[#dbdbdb] p-[18px] text-center w-full max-w-[350px] mb-[10px]">
                <p className="text-[14px] text-[#262626]">
                    Bạn đã có tài khoản?{' '}
                    <Link to="/login" className="text-[#0095f6] font-semibold hover:underline">Đăng nhập</Link>
                </p>
            </div>

        </div>
    );
};

export default Register;