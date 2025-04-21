import axios from 'axios';

// Sử dụng đúng VITE_API_URL và thêm /api vào baseURL
const API_URL = `${import.meta.env.VITE_API_URL}/api/users`;

// Tạo axios instance với baseURL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const register = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Profile APIs
export const getUserProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw error.response.data;
  }
};

export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/profile', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Address APIs
export const addAddress = async (addressData) => {
  try {
    const response = await api.post('/addresses', addressData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateAddress = async (addressId, addressData) => {
  try {
    const response = await api.put(`/addresses/${addressId}`, addressData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteAddress = async (addressId) => {
  try {
    const response = await api.delete(`/addresses/${addressId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getWishlist = async () => {
  try {
    const response = await api.get('/wishlist');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const addToWishlist = async (productId) => {
  try {
    const response = await api.post('/wishlist', { productId });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const removeFromWishlist = async (productId) => {
  try {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Password API
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/change-password', {
      currentPassword,
      newPassword,
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi không xác định' };
  }
};

export const getOrderHistory = async () => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Product API: Tạo instance riêng để gọi /api/products
const productApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

productApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getAllProducts = async () => {
  try {
    const response = await productApi.get('/products');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export default {
  register,
  login,
  getUserProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  changePassword,
  getOrderHistory,
  getAllProducts,
  uploadAvatar,
};