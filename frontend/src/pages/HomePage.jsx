import React from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/profile';
    }
  }, [isAuthenticated]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold">Chào mừng đến với Website</h1>
      <p className="text-lg mt-2">Trang thương mại điện tử hiện đại</p>
      <div className="mt-4">
        <Link to="/login" className="px-4 py-2 bg-blue-500 text-white rounded-md mr-2">
          Đăng nhập
        </Link>
        <Link to="/register" className="px-4 py-2 bg-green-500 text-white rounded-md">
          Đăng ký
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
