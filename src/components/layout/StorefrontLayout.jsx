import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const StorefrontLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();

  const cartCount = (cart.items || []).reduce((sum, item) => sum + item.quantity, 0);
  const displayName = user?.fullName || user?.email || 'Reader';

  return (
    <>
      <header className="site-header">
        <nav className="navbar container">
          <NavLink className="logo" to="/">
            <i className="fa-solid fa-book-open-reader" /> Book Basqet
          </NavLink>
          <button
            className="menu-toggle"
            aria-label="Toggle menu"
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <i className="fa-solid fa-bars" />
          </button>
          <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <li>
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/shop" className={({ isActive }) => (isActive ? 'active' : '')}>
                Shop
              </NavLink>
            </li>
            <li>
              <NavLink to="/categories" className={({ isActive }) => (isActive ? 'active' : '')}>
                Categories
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : '')}>
                Contact
              </NavLink>
            </li>
          </ul>
          <div className="auth-actions">
            {isAuthenticated ? (
              <>
                <span className="auth-user">Hi, {displayName}</span>
                <button className="btn btn-secondary" type="button" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink className="btn btn-secondary" to="/login">
                  Login
                </NavLink>
                <NavLink className="btn btn-primary" to="/register">
                  Register
                </NavLink>
              </>
            )}
          </div>
          <NavLink className="cart-pill" to="/shop#cart">
            <i className="fa-solid fa-cart-shopping" /> <span>{cartCount}</span>
          </NavLink>
        </nav>
      </header>

      <Outlet />

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <h3>Book Basqet</h3>
            <p>Your online destination for books, novels, manga, comics, and storybooks.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <NavLink to="/privacy">Privacy Policy</NavLink>
            <NavLink to="/terms">Terms & Conditions</NavLink>
          </div>
          <div>
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <i className="fab fa-facebook-f" />
              </a>
              <a href="#" aria-label="Instagram">
                <i className="fab fa-instagram" />
              </a>
              <a href="#" aria-label="X">
                <i className="fab fa-x-twitter" />
              </a>
            </div>
          </div>
        </div>
        <p className="copyright">© {new Date().getFullYear()} Book Basqet. All rights reserved.</p>
      </footer>
    </>
  );
};

export default StorefrontLayout;
