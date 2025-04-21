import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const GithubCallback = () => {
  const { handleGithubLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    if (code) {
      handleGithubCallback(code);
    }
  }, [location]);

  const handleGithubCallback = async (code) => {
    try {
      await handleGithubLogin(code);
      navigate('/profile', { replace: true });
    } catch (error) {
      navigate('/login', { replace: true, state: { error: 'Đăng nhập GitHub thất bại.' } });
    }
  };

  return <div>Đang xử lý đăng nhập GitHub...</div>;
};

export default GithubCallback;