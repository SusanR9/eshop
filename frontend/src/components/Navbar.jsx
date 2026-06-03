import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
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
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <NavLink to="/" className="logo">
          <img src="/logo.svg" alt="Eshop Toys" className="logo-icon" />
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

      <div className="navbar-right">
        <NavLink to="/" className="nav-item">Home</NavLink>
        <NavLink to="/cart" className="nav-item">🛒 Cart</NavLink>
        {token && <NavLink to="/history" className="nav-item">Orders</NavLink>}
        {isAdmin && <NavLink to="/admin" className="nav-item">Admin</NavLink>}
        {token ? (
          <button onClick={handleLogout} className="nav-item logout-btn">
            Logout
          </button>
        ) : (
          <NavLink to="/login" className="nav-item">Login / Sign‑up</NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
