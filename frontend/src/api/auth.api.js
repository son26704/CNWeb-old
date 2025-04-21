import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const register = async (userData) => {
  try {
    const response = await authApi.post('/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi đăng ký' };
  }
};

export const login = async (userData) => {
  try {
    const response = await authApi.post('/login', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi đăng nhập' };
  }
};

export const loginWithGoogle = async (googleToken) => {
  try {
    const response = await authApi.post('/google', { token: googleToken });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi đăng nhập bằng Google' };
  }
};

export const loginWithGithub = async (code) => {
  try {
    const response = await authApi.post('/github', { code });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi đăng nhập bằng GitHub' };
  }
};

export default {
  register,
  login,
  loginWithGoogle,
  loginWithGithub,
};