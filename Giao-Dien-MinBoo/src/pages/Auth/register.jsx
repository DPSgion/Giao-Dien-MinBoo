import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    username: '',
    password: '',
  });
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
      // await authService.register(formData);
      console.log('Register attempt:', formData);
      navigate('/login');
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-[350px] bg-white border border-gray-300 p-10 flex flex-col items-center mb-4">
        <h1 className="text-4xl font-bold mb-8 font-serif tracking-tight">
          MinBOO
        </h1>

        <p className="text-center font-bold text-gray-500 mb-6 text-sm">
          Sign up to see photos and videos from your friends.
        </p>

        <button className="w-full bg-[#0095f6] text-white font-semibold py-1.5 rounded-lg mb-6 text-sm flex items-center justify-center gap-2">
          <span className="bg-white text-[#0095f6] rounded-sm w-4 h-4 flex items-center justify-center text-[10px]">
            f
          </span>
          Log in with Facebook
        </button>

        <div className="flex items-center mb-6 w-full">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-xs text-gray-400 font-semibold uppercase">
            OR
          </span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-2 py-2 bg-gray-50 border border-gray-300 rounded-sm text-xs focus:outline-none focus:border-gray-400"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full px-2 py-2 bg-gray-50 border border-gray-300 rounded-sm text-xs focus:outline-none focus:border-gray-400"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
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

          <p className="text-center text-[10px] text-gray-500 mt-2">
            People who use our service may have uploaded your contact
            information to MinBOO.{' '}
            <Link to="#" className="text-blue-900">
              Learn More
            </Link>
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0095f6] text-white font-semibold py-1.5 rounded-lg mt-4 text-sm disabled:opacity-70"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>

          {error && (
            <p className="text-red-500 text-xs text-center mt-2">{error}</p>
          )}
        </form>
      </div>

      <div className="w-full max-w-[350px] bg-white border border-gray-300 p-5 text-center">
        <p className="text-sm">
          Have an account?{' '}
          <Link to="/login" className="text-[#0095f6] font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
