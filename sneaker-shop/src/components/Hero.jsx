import React from "react";

function Hero() {
  // For now, hardcode the backend URL – you can move this to an env var later
  const HERO_IMAGE_URL = "http://localhost:8000/static/sneakers/15.jpg";

  return (
    <section className="hero" id="home">
      <style>
            {`
            .hero-sneaker-img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
                }
            `}

      </style>

      <div className="hero-content">
        <h1 className="hero-title">
          Your Next <span>Favorite Sneakers</span> Are Here
        </h1>
        <p className="hero-subtitle">
          Discover limited drops, classics, and everyday pairs.
        </p>
        <div className="hero-actions">
          <button className="btn-primary">Shop now</button>
          <button className="btn-secondary">Browse collections</button>
        </div>
        <p className="hero-note">
          This is just the home page for now. Next steps: connect FastAPI & MySQL
          for real products and user accounts.
        </p>
      </div>

      <div className="hero-image">
        <div className="hero-sneaker-card">
          <div className="hero-sneaker-photo">
            <img src={HERO_IMAGE_URL} className="hero-sneaker-img" />
          </div>
          <div className="hero-sneaker-info">
            <h3>Nike High Blazers</h3>
            <p>Lightweight, bold, and built for everyday flex.</p>
            <span className="hero-price">$499.99</span>
          </div>
        </div>
      </div>
    </section>
  );
}




export default Hero;
