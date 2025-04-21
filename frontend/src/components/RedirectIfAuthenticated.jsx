import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RedirectIfAuthenticated = () => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user.role === 'admin' ? "/admin" : "/profile"} replace />;
  }

  return <Outlet />;
};

export default RedirectIfAuthenticated;
