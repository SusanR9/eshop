import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(`If an account exists for ${email.trim()}, you will receive password reset instructions shortly.`);
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card glass">
        <h2>Forgot Password</h2>
        <p className="auth-subtitle">Enter your email to reset your password.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <button type="submit" className="btn-primary">
            Send Reset Instructions
          </button>
        </form>
        {message && <p className="success-msg" style={{ marginTop: '1rem' }}>{message}</p>}
        <p className="auth-footer">
          Remembered your password? <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
