import { Link } from "react-router-dom";
import { resolveImage } from "../api";
import "./ProductCard.css";

/**
 * ProductCard - displays a single product in the grid.
 * Props: product { id, name, image, price, description }
 */
const ProductCard = ({ product }) => {
  const imageSrc =
    resolveImage(product.image) ||
    "https://placehold.co/300x300/FFE5F1/FF6B9D?text=🧸";

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card glass hover-lift fade-in">
      <div className="product-card__img-wrapper">
        <img src={imageSrc} alt={product.name} loading="lazy" />
      </div>
      <div className="product-card__info">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__price">Rs.{Number(product.price).toLocaleString()}</p>
        <button className="btn-primary product-card__btn" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
