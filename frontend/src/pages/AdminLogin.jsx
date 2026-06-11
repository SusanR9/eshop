import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import './Auth.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/admin-login/', {
        email: email.trim(),
        password: password.trim(),
      });

      localStorage.setItem('accessToken', res.data.access);
      localStorage.setItem('refreshToken', res.data.refresh);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminEmail', res.data.email);
      navigate('/admin');
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Login failed. Check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card glass">
        <h2>Admin Login</h2>
        <p style={{ color: 'var(--clr-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Sign in with your admin credentials
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Admin Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin1@gmail.com"
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="error-msg">{error}</p>}
          <p className="auth-footer">
            <Link to="/admin/forgot-password">Forgot password?</Link>
          </p>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Login to Dashboard'}
          </button>
        </form>

        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--clr-muted)', textAlign: 'center' }}>
          Use your admin_login table credentials
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
