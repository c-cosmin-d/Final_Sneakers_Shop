import React from "react";
import ProductGrid from "../components/ProductGrid";

function MenPage() {
  return (
    <main className="section">
      <h1 className="section-title">Men&apos;s Sneakers</h1>
      <ProductGrid gender="men" />
    </main>
  );
}

export default MenPage;
