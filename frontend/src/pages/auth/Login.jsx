import { useState, useContext } from "react";
import { login } from "../../api/auth.api";
import AuthContext from "../../context/AuthContext";

const Login = () => {
  const { login: loginUser } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form);
      loginUser(res.data);  // Lưu user vào Context
      alert("Đăng nhập thành công!");
    } catch (err) {
      alert("Lỗi đăng nhập!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Mật khẩu" onChange={handleChange} />
      <button type="submit">Đăng nhập</button>
    </form>
  );
};

export default Login;
