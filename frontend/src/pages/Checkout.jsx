import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Checkout.css';

/**
 * Load Razorpay SDK dynamically.
 */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const Checkout = () => {
  const navigate = useNavigate();
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [mobile, setMobile] = useState('');
  const [paymentMode, setPaymentMode] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (paymentMode === 'razorpay') {
        const ok = await loadRazorpayScript();
        if (!ok) { setError('Failed to load payment gateway'); setLoading(false); return; }

        // Create order on backend
        const { data } = await api.post('/orders/create/', {
          items: cart,
          address,
          city,
          state,
          pin_code: pinCode,
          mobile,
          payment_mode: paymentMode,
        });

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_SlyeZSQVRS6kuk',
          amount: data.amount,
          currency: 'INR',
          name: 'Eshop‑Toys',
          description: 'Toy Purchase',
          order_id: data.razorpay_order_id,
          handler: async (response) => {
            await api.post('/orders/verify/', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            localStorage.removeItem('cart');
            navigate('/success');
          },
          prefill: { contact: mobile },
          theme: { color: '#7c3aed' },
        };

        // If backend mocked the order due to missing keys, bypass the actual Razorpay UI
        if (data.razorpay_order_id?.startsWith('fake_rzp_')) {
          alert('Mock payment successful (No Razorpay keys configured)!');
          await options.handler({
            razorpay_payment_id: 'mock_pay_123',
            razorpay_order_id: data.razorpay_order_id,
            razorpay_signature: 'mock_signature'
          });
        } else {
          const razorpay = new window.Razorpay(options);
          razorpay.open();
        }
      } else {
        // COD
        await api.post('/orders/create/', {
          items: cart,
          address,
          city,
          state,
          pin_code: pinCode,
          mobile,
          payment_mode: 'cod',
        });
        localStorage.removeItem('cart');
        navigate('/success');
      }
    } catch (err) {
      setError('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page container fade-in">
      <h2>Checkout</h2>

      <div className="checkout-layout">
        <form className="checkout-form glass" onSubmit={handleCheckout}>
          <h3>Delivery Details</h3>
          <label>
            Address
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="Enter your full delivery address"
              rows={3}
            />
          </label>
          <label>
            City
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              placeholder="Enter city"
            />
          </label>
          <label>
            State
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              placeholder="Enter state"
            />
          </label>
          <label>
            Pin Code
            <input
              type="text"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              required
              placeholder="6-digit pin code"
              pattern="[0-9]{6}"
            />
          </label>
          <label>
            Mobile Number
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              placeholder="10‑digit mobile number"
              pattern="[0-9]{10}"
            />
          </label>
          <label>
            Payment Mode
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
              <option value="razorpay">Razorpay (Online)</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </label>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading || cart.length === 0}>
            {loading ? 'Processing…' : `Pay ₹${total.toLocaleString()}`}
          </button>
        </form>

        <div className="checkout-summary glass">
          <h3>Order Summary</h3>
          {cart.map((item) => (
            <div key={item.id} className="checkout-summary__item">
              <span>{item.name} × {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="checkout-summary__total">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
