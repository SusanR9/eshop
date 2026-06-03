import { Navigate, Outlet } from 'react-router-dom';

/**
 * Guard for authenticated user routes.
 * Checks for JWT token in localStorage; redirects to /login if missing.
 */
const ProtectedRoute = () => {
  const token = localStorage.getItem('accessToken');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
