import React from "react";
import ProductGrid from "../components/ProductGrid";

function WomenPage() {
  return (
    <main className="section">
      <h1 className="section-title">Women&apos;s Sneakers</h1>
      <ProductGrid gender="women" />
    </main>
  );
}

export default WomenPage;
