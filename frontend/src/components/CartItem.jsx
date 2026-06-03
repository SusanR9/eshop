import { resolveImage } from '../api';
import './CartItem.css';

/**
 * CartItem – a single line‑item in the shopping cart.
 * Props: item { id, name, image, price, quantity }, onUpdate(id, qty), onRemove(id)
 */
const CartItem = ({ item, onUpdate, onRemove }) => {
  const increment = () => onUpdate(item.id, item.quantity + 1);
  const decrement = () => {
    if (item.quantity > 1) onUpdate(item.id, item.quantity - 1);
  };

  return (
    <div className="cart-item glass fade-in">
      <img
        className="cart-item__img"
        src={resolveImage(item.image) || 'https://placehold.co/120x120/1a1a2e/7c3aed?text=Toy'}
        alt={item.name}
      />
      <div className="cart-item__details">
        <h4 className="cart-item__name">{item.name}</h4>
        <p className="cart-item__price">₹{Number(item.price).toLocaleString()}</p>
      </div>
      <div className="cart-item__qty">
        <button className="qty-btn" onClick={decrement} disabled={item.quantity <= 1}>−</button>
        <span className="qty-value">{item.quantity}</span>
        <button className="qty-btn" onClick={increment}>+</button>
      </div>
      <p className="cart-item__subtotal">
        ₹{(item.price * item.quantity).toLocaleString()}
      </p>
      <button className="btn-danger cart-item__remove" onClick={() => onRemove(item.id)}>
        ✕
      </button>
    </div>
  );
};

export default CartItem;
