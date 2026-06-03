import { useNavigate } from 'react-router-dom';
import './Success.css';

function Success() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <div className="success-page container">
      <h2>🎉 Order Successful!</h2>
      <p>Thank you for your purchase. Your order has been placed.</p>
      <button className="continue-btn" onClick={handleContinue}>
        Continue Shopping
      </button>
    </div>
  );
}

export default Success;
