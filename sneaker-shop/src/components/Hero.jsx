import React from "react";

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <h1 className="hero-title">
          Your Next <span>Favorite Sneakers</span> Are Here
        </h1>
        <p className="hero-subtitle">
          Discover limited drops, classics, and everyday pairs. Built with React, powered
          soon by FastAPI + MySQL.
        </p>
        <div className="hero-actions">
          <button className="btn-primary">Shop now</button>
          <button className="btn-secondary">Browse collections</button>
        </div>
        <p className="hero-note">
          This is just the home page for now. Next steps: connect FastAPI & MySQL for
          real products and user accounts.
        </p>
      </div>

      <div className="hero-image">
        <div className="hero-sneaker-card">
          <div className="hero-sneaker-photo">
            {/* You can change this to a real image later */}
            <span className="sneaker-emoji">👟</span>
          </div>
          <div className="hero-sneaker-info">
            <h3>Air Burst 9</h3>
            <p>Lightweight, bold, and built for everyday flex.</p>
            <span className="hero-price">$149</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
