import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Success from './pages/Success';
import History from './pages/History';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

/**
 * Application route definitions.
 * - Public routes: Home, Product, Login, Signup, AdminLogin, Success, * (fallback).
 * - Protected routes (user): Cart, Checkout, History.
 * - Admin protected route: AdminDashboard.
 */
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<Home />} />
    <Route path="/product/:id" element={<Product />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/adminlogin" element={<AdminLogin />} />
    <Route path="/admin-login" element={<AdminLogin />} />
    <Route path="/success" element={<Success />} />
    {/* User protected */}
    <Route element={<ProtectedRoute />}> 
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/history" element={<History />} />
    </Route>
    {/* Admin protected */}
    <Route element={<AdminProtectedRoute />}> 
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admindashboard" element={<AdminDashboard />} />
    </Route>
    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
