import './Footer.css';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-col footer-brand">
          <img src="/logo.png" alt="Eshop Toys" className="footer-logo" />
          <p>Small independent toy store — quality toys for curious kids.</p>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/">Products</a></li>
            <li><a href="/cart">Cart</a></li>
            <li><a href="/history">Orders</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="/admin">Admin</a></li>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Help</h4>
          <ul>
            <li><a href="#">Shipping</a></li>
            <li><a href="#">Returns</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Support</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Eshop‑Toys. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
