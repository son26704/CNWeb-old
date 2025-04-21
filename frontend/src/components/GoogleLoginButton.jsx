import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';

const GoogleLoginButton = () => {
  const { handleGoogleLogin } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await handleGoogleLogin(credentialResponse.credential); // Gọi hàm từ useAuth
    } catch (error) {
      console.error('Lỗi đăng nhập Google:', error.message);
      alert('Đăng nhập Google thất bại. Vui lòng thử lại.');
    }
  };

  const handleGoogleError = () => {
    console.error('Đăng nhập Google thất bại');
    alert('Đăng nhập Google thất bại. Vui lòng thử lại.');
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        shape="circle"
        size="large"
      />
    </div>
  );
};

export default GoogleLoginButton;