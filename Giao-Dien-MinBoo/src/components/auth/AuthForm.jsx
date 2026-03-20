import { useMemo, useState } from "react";
import { Eye, EyeOff, Facebook, LockKeyhole, Mail, UserRound } from "lucide-react";

const fieldIcons = {
    name: UserRound,
    email: Mail,
    password: LockKeyhole,
};

export default function AuthForm({
    mode = "login",
    fields,
    onSubmit,
    loading,
    switchLabel,
    switchAction,
    helperText,
    error,
    success,
}) {
    const [formData, setFormData] = useState(() =>
        fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
    );
    const [showPassword, setShowPassword] = useState(false);

    const isRegister = mode === "register";
    const buttonLabel = isRegister ? "Tạo tài khoản" : "Đăng nhập";

    const isDisabled = useMemo(
        () => fields.some((field) => field.required && !formData[field.name]?.trim()) || loading,
        [fields, formData, loading]
    );

    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        await onSubmit(formData, () => {
            setFormData(fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {}));
            setShowPassword(false);
        });
    };

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 rounded-2xl bg-zinc-100 p-1 text-sm font-medium text-zinc-500">
                <button
                    type="button"
                    onClick={() => mode !== "login" && switchAction("login")}
                    className={`rounded-xl px-4 py-3 transition ${mode === "login" ? "bg-white text-zinc-900 shadow-sm" : "hover:text-zinc-700"
                        }`}
                >
                    Đăng nhập
                </button>
                <button
                    type="button"
                    onClick={() => mode !== "register" && switchAction("register")}
                    className={`rounded-xl px-4 py-3 transition ${mode === "register" ? "bg-white text-zinc-900 shadow-sm" : "hover:text-zinc-700"
                        }`}
                >
                    Đăng ký
                </button>
            </div>

            <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-[#1877F2] px-4 py-3.5 font-medium text-white shadow-[0_12px_24px_rgba(24,119,242,0.25)] transition hover:brightness-105"
            >
                <Facebook className="h-5 w-5 fill-current" />
                Tiếp tục với Facebook
            </button>

            <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-300">
                <div className="h-px flex-1 bg-zinc-200" />
                Hoặc
                <div className="h-px flex-1 bg-zinc-200" />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                {fields.map((field) => {
                    const Icon = fieldIcons[field.icon] || Mail;
                    const isPasswordField = field.type === "password";

                    return (
                        <label key={field.name} className="group block">
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                                {field.label}
                            </span>
                            <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 transition group-focus-within:border-zinc-900 group-focus-within:bg-white group-focus-within:shadow-[0_0_0_4px_rgba(244,114,182,0.12)]">
                                <Icon className="h-4 w-4 text-zinc-400" />
                                <input
                                    type={isPasswordField ? (showPassword ? "text" : "password") : field.type}
                                    value={formData[field.name]}
                                    onChange={(event) => handleChange(field.name, event.target.value)}
                                    placeholder={field.placeholder}
                                    className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                                    required={field.required}
                                    autoComplete={field.autoComplete}
                                />
                                {isPasswordField ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="text-zinc-400 transition hover:text-zinc-700"
                                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                ) : null}
                            </div>
                        </label>
                    );
                })}

                {!isRegister ? (
                    <div className="flex items-center justify-end">
                        <button type="button" className="text-sm font-medium text-[#1877F2] transition hover:text-blue-700">
                            Quên mật khẩu?
                        </button>
                    </div>
                ) : null}

                {error ? (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
                ) : null}

                {success ? (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                        {success}
                    </div>
                ) : null}

                <button
                    type="submit"
                    disabled={isDisabled}
                    className="w-full rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(217,70,239,0.25)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                    {loading ? "Đang xử lý..." : buttonLabel}
                </button>
            </form>

            <div className="space-y-3 text-center">
                <p className="text-sm leading-6 text-zinc-500">{helperText}</p>
                <button
                    type="button"
                    onClick={() => switchAction(isRegister ? "login" : "register")}
                    className="text-sm font-semibold text-zinc-900 transition hover:text-pink-600"
                >
                    {switchLabel}
                </button>
            </div>
        </div>
    );
}
