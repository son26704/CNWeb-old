import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { register } from "../../api/auth.api";

const schema = yup.object().shape({
  username: yup.string().required("Tên không được để trống"),
  email: yup.string().email("Email không hợp lệ").required("Email không được để trống"),
  password: yup.string().min(6, "Mật khẩu ít nhất 6 ký tự").required("Mật khẩu không được để trống"),
});

const Register = () => {
  const { register: formRegister, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await register(data);
      alert("Đăng ký thành công!");
    } catch (err) {
      alert(err.response.data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...formRegister("username")} placeholder="Tên người dùng" />
      <p>{errors.username?.message}</p>

      <input {...formRegister("email")} type="email" placeholder="Email" />
      <p>{errors.email?.message}</p>

      <input {...formRegister("password")} type="password" placeholder="Mật khẩu" />
      <p>{errors.password?.message}</p>

      <button type="submit">Đăng ký</button>
    </form>
  );
};

export default Register;
