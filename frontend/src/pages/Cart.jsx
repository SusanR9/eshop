import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleUpdate = (id, qty) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, quantity: qty } : item
    );
    updateCart(updated);
  };

  const handleRemove = (id) => {
    const updated = cart.filter((item) => item.id !== id);
    updateCart(updated);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-page container fade-in">
      <h2>Your Cart</h2>

      {cart.length === 0 ? (
        <div className="cart-empty glass">
          <p>🛒 Your cart is empty.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Browse Toys
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
              />
            ))}
          </div>

          <div className="cart-summary glass">
            <div className="cart-summary__row">
              <span>Items</span>
              <span>{cart.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <div className="cart-summary__row cart-summary__total">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <button className="btn-primary" onClick={() => navigate('/checkout')}>
              Buy Now →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
