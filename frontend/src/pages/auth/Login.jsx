import { useState, useContext } from "react";
import { login } from "../../api/auth.api";
import AuthContext from "../../context/AuthContext";

const Login = () => {
  const { login: loginUser } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await login(form);
      loginUser(res.data);
      alert("Đăng nhập thành công!");
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 429) {
        setError("Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Đăng nhập</h2>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            id="email"
            name="email" 
            type="email" 
            placeholder="Nhập email của bạn" 
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input 
            id="password"
            name="password" 
            type="password" 
            placeholder="Nhập mật khẩu của bạn" 
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className={loading ? 'loading' : ''}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
};

export default Login;
