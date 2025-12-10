import React from "react";
import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";

function Home() {
  return (
    <main>
      <Hero />
      <section className="section">
        <h2 className="section-title">Featured Sneakers</h2>
        <p className="section-subtitle">
          Hand-picked heat for your collection. New drops added soon!

        </p>
        <ProductGrid />
      </section>
    </main>
  );
}

export default Home;
