import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { resolveImage } from "../api";
import "./Product.css";

function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(`/products/${id}/`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load product details.");
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
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

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  if (loading) return <div className="product-page-loading">Loading toy details...</div>;
  if (error) return <div className="product-page-error">{error}</div>;
  if (!product) return null;

  return (
    <div className="product-detail-page container fade-in">
      <div className="product-detail glass">
        <div className="product-detail__image-wrapper">
          <img
            src={resolveImage(product.image) || "https://placehold.co/500x500/FFE5F1/FF6B9D?text=🧸"}
            alt={product.name}
          />
        </div>

        <div className="product-detail__info">
          <h2>{product.name}</h2>
          <p className="product-price">Rs.{Number(product.price).toLocaleString()}</p>

          <div className="product-stock">
            {product.quantity > 0 ? (
              <span className="in-stock">In Stock ({product.quantity} available)</span>
            ) : (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </div>

          <p className="product-description">{product.description}</p>

          <div className="product-actions">
            <button
              className="btn-secondary"
              onClick={handleAddToCart}
              disabled={product.quantity <= 0}
            >
              Add to Cart
            </button>
            <button
              className="btn-primary"
              onClick={handleBuyNow}
              disabled={product.quantity <= 0}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
