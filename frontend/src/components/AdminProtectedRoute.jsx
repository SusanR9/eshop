import { Navigate, Outlet } from 'react-router-dom';

/**
 * Guard for admin-only routes.
 * Checks for isAdmin flag in localStorage; redirects to /admin/login if missing.
 */
const AdminProtectedRoute = () => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  return isAdmin ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default AdminProtectedRoute;
