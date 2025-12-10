import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { addToCart } from "../api";

const BACKEND_BASE_URL = "http://localhost:8000";

function SneakerDetailPage() {
  const { id } = useParams();
  const [sneaker, setSneaker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSneaker() {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/sneakers/${id}`);
        if (!res.ok) throw new Error("Failed to load sneaker");
        const data = await res.json();
        setSneaker(data);
      } catch (err) {
        console.error(err);
        setError("Could not load that sneaker.");
      } finally {
        setLoading(false);
      }
    }
    fetchSneaker();
  }, [id]);

  const token = localStorage.getItem("access_token");

  async function handleAddToCart() {
    if (!token) {
      alert("Please sign in to add items to your cart.");
      return;
    }
    await addToCart(token, sneaker.id, 1);
  }

  if (loading) {
    return (
      <main className="section">
        <p>Loading sneaker...</p>
      </main>
    );
  }

  if (error || !sneaker) {
    return (
      <main className="section">
        <p>{error || "Sneaker not found."}</p>
      </main>
    );
  }

  const imageUrl = sneaker.image_url
    ? sneaker.image_url.startsWith("http")
      ? sneaker.image_url
      : `${BACKEND_BASE_URL}${sneaker.image_url}`
    : null;

  const isWomen = sneaker.gender === "women";
  const sizeRange = isWomen ? [35, 36, 37, 38, 39, 40, 41] : [41, 42, 43, 44, 45, 46];

  return (
    <main className="section">
      <div className="detail-layout">
        <div className="detail-image-card">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={sneaker.name}
              className="detail-image"
            />
          )}
        </div>

        <div className="detail-info">
          <h1 className="section-title">{sneaker.name}</h1>
          <p className="detail-brand">{sneaker.brand}</p>
          <p className="detail-price">${sneaker.price.toFixed(2)}</p>
          {sneaker.colorway && <p className="detail-color">Colorway: {sneaker.colorway}</p>}
          {sneaker.gender && (
            <p className="detail-gender">
              Category: {sneaker.gender === "women" ? "Women" : "Men"}
            </p>
          )}

          {sneaker.description && (
            <p className="detail-description">{sneaker.description}</p>
          )}

          <div className="detail-sizes">
            <h3>EU sizes</h3>
            <div className="detail-sizes-grid">
              {sizeRange.map((size) => (
                <button key={size} className="size-pill">
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button className="product-btn" onClick={handleAddToCart}>
            Add to cart
          </button>
        </div>
      </div>
    </main>
  );
}

export default SneakerDetailPage;
