import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const token = localStorage.getItem('accessToken');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('isAdmin');
    navigate('/');
    window.location.reload();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.elements.search.value.trim();
    if (query) {
      navigate(`/?search=${encodeURIComponent(query)}`);
      setMenuOpen(false);
    }
  };

  const handleMenuToggle = () => setMenuOpen((prev) => !prev);
  const handleNavClick = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <NavLink to="/" className="logo" onClick={handleNavClick}>
          <img src="/logo.png" alt="Eshop Toys" className="logo-icon" />
          <span>Eshop‑Toys</span>
        </NavLink>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            name="search"
            type="text"
            placeholder="Search toys..."
            aria-label="Search toys"
          />
          <button type="submit">🔍</button>
        </form>
      </div>

      <div className="navbar-right-wrapper">
        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={handleMenuToggle}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-right ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" className="nav-item" onClick={handleNavClick}>Home</NavLink>
          <NavLink to="/cart" className="nav-item" onClick={handleNavClick}>🛒 Cart</NavLink>
          {token && <NavLink to="/history" className="nav-item" onClick={handleNavClick}>Orders</NavLink>}
          {isAdmin && (
            <NavLink to="/admin" className="nav-item" onClick={handleNavClick}>Admin</NavLink>
          )}
          {token ? (
            <button onClick={() => { handleLogout(); handleNavClick(); }} className="nav-item logout-btn">
              Logout
            </button>
          ) : (
            <NavLink to="/login" className="nav-item" onClick={handleNavClick}>Login / Sign‑up</NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
