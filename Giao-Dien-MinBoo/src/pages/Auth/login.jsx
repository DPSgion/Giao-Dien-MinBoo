import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Mocking API call for demonstration as per Instagram UI focus
            // await authService.login(formData);
            console.log('Login attempt:', formData);
            localStorage.setItem('token', 'mock-token');
            navigate('/');
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-[350px] bg-white border border-gray-300 p-10 flex flex-col items-center mb-4">
                <h1 className="text-4xl font-bold mb-8 font-serif tracking-tight">MinBOO</h1>

                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
                    <input
                        type="text"
                        name="email"
                        placeholder="Phone number, username, or email"
                        className="w-full px-2 py-2 bg-gray-50 border border-gray-300 rounded-sm text-xs focus:outline-none focus:border-gray-400"
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="w-full px-2 py-2 bg-gray-50 border border-gray-300 rounded-sm text-xs focus:outline-none focus:border-gray-400"
                        onChange={handleChange}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#0095f6] text-white font-semibold py-1.5 rounded-lg mt-2 text-sm disabled:opacity-70"
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>

                    <div className="flex items-center my-4">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-4 text-xs text-gray-400 font-semibold uppercase">OR</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    <button type="button" className="text-[#385185] font-semibold text-sm flex items-center justify-center gap-2">
                        <span className="bg-[#385185] text-white rounded-sm w-4 h-4 flex items-center justify-center text-[10px]">f</span>
                        Log in with Facebook
                    </button>

                    {error && <p className="text-red-500 text-xs text-center mt-4">{error}</p>}
                    <Link to="#" className="text-[#00376b] text-xs text-center mt-3">Forgot password?</Link>
                </form>
            </div>

            <div className="w-full max-w-[350px] bg-white border border-gray-300 p-5 text-center">
                <p className="text-sm">
                    Don't have an account? <Link to="/register" className="text-[#0095f6] font-semibold">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
