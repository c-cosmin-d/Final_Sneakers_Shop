import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ loggedInEmail, onLogout }) {
  const navigate = useNavigate();

  function handleLogout() {
    onLogout?.();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="navbar-logo">
        <span className="logo-mark">SNK</span>
        <span className="logo-text">Sneaker Shop</span>
      </div>

      <nav className="navbar-links">
        <Link to="/">Home</Link>
        <a href="#featured">Featured</a>
        <a href="#collections">Collections</a>
        <a href="#contact">Contact</a>
        <Link to="/women">Women</Link>
        <Link to="/men">Men</Link>
      </nav>

      <div className="navbar-actions">
        {/* Left side of actions: auth state */}
        {loggedInEmail ? (
          <>
            <span className="nav-user">Logged in as {loggedInEmail}</span>
            <button
              className="nav-btn nav-btn-outline"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              className="nav-btn nav-btn-outline"
              type="button"
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
            <button
              className="nav-btn nav-btn-outline"
              type="button"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </button>
          </>
        )}

        {/* Right side of actions: Cart is ALWAYS visible */}
        <button
          className="nav-btn nav-btn-primary"
          type="button"
          onClick={() => navigate("/cart")}
        >
          Cart
        </button>
      </div>
    </header>
  );
}

export default Navbar;
