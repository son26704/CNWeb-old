import React, { useState, useEffect } from 'react'; // Thêm useEffect
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom'; // Thêm useLocation
import GoogleLoginButton from '../components/GoogleLoginButton';
import GithubLoginButton from '../components/GithubLoginButton'; // Thêm GithubLoginButton

const API_URL = import.meta.env.VITE_API_URL;

const LoginPage = () => {
  const { login, handleGoogleLogin, handleGithubLogin } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation(); 
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0); // 0: đăng nhập, 1: nhập email, 2: nhập mã, 3: đổi mật khẩu
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Tài khoản hoặc mật khẩu không đúng');
      }

      const { user, token } = data;
      login(user, token);

      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    } catch (error) {
      setError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await handleGoogleLogin(credentialResponse.credential);
      navigate('/profile', { replace: true });
    } catch (error) {
      setError(error.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
    }
  };

  const handleGoogleError = () => {
    setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        setForgotPasswordStep(2); // Chuyển sang nhập mã
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Lỗi server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetCode = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/users/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, code: resetCode }),
      });
      const data = await response.json();
      if (response.ok) {
        setForgotPasswordStep(3); // Chuyển sang đổi mật khẩu
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Lỗi server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, code: resetCode, newPassword, confirmPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setForgotPasswordStep(0);
        navigate('/login');
        alert('Đổi mật khẩu thành công!');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Lỗi server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {forgotPasswordStep === 0 ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>
            <div className="mt-4 text-center">
              <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
              <GithubLoginButton /> 
            </div>
            <div className="mt-4 text-center space-y-2">
              <p>
                <button
                  onClick={() => setForgotPasswordStep(1)}
                  className="text-blue-500 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </p>
              <p className="text-gray-600">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-blue-500 hover:underline">
                  Đăng ký
                </Link>
              </p>
            </div>
          </>
        ) : forgotPasswordStep === 1 ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Quên mật khẩu</h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 mt-4"
            >
              {loading ? 'Đang gửi...' : 'Gửi mã xác thực'}
            </button>
            <button
              onClick={() => setForgotPasswordStep(0)}
              className="mt-2 text-gray-500 hover:underline w-full"
            >
              Quay lại
            </button>
          </>
        ) : forgotPasswordStep === 2 ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Xác thực mã</h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <input
              type="text"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              placeholder="Nhập mã xác thực 6 số"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={handleVerifyResetCode}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 mt-4"
            >
              {loading ? 'Đang xác thực...' : 'Xác thực'}
            </button>
            <button
              onClick={() => setForgotPasswordStep(0)}
              className="mt-2 text-gray-500 hover:underline w-full"
            >
              Quay lại
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Đổi mật khẩu</h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mật khẩu mới"
              className="w-full px-4 py-2 border definition-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
              disabled={loading}
            />
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 mt-4"
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
            <button
              onClick={() => setForgotPasswordStep(0)}
              className="mt-2 text-gray-500 hover:underline w-full"
            >
              Quay lại
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;