import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const AdminForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(`If an admin account exists for ${email.trim()}, reset instructions will be sent to that email.`);
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card glass">
        <h2>Admin Password Reset</h2>
        <p className="auth-subtitle">Enter your admin email to reset your password.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Admin Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </label>
          <button type="submit" className="btn-primary">
            Send Reset Instructions
          </button>
        </form>
        {message && <p className="success-msg" style={{ marginTop: '1rem' }}>{message}</p>}
        <p className="auth-footer">
          <Link to="/admin/login">Back to admin login</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminForgotPassword;
