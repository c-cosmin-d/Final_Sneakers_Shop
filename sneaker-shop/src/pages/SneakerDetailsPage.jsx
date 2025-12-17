// src/pages/SneakerDetailPage.jsx  (or wherever it lives)
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addToCart } from "../api";

const BACKEND_BASE_URL = "http://localhost:8000";

function SneakerDetailPage() {

  const navigate = useNavigate();

  const { id } = useParams();
  const [sneaker, setSneaker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [adding, setAdding] = useState(false);

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
    if (!sneaker) return;

    if (!selectedSize) {
      alert("Please choose a size first.");
      return;
    }

    try {
      setAdding(true);
      await addToCart(token, sneaker.id, 1, selectedSize);
      alert(`Added ${sneaker.name} (EU ${selectedSize}) to your cart.`);
      navigate("/cart");
    } catch (err) {
      console.error(err);
      alert(err.message || "Could not add to cart.");
    } finally {
      setAdding(false);
    }
  }



  if (loading) {
    return (
      <main className="product-page">
        <div className="product-shell">
          <p>Loading sneaker...</p>
        </div>
      </main>
    );
  }

  if (error || !sneaker) {
    return (
      <main className="product-page">
        <div className="product-shell">
          <p>{error || "Sneaker not found."}</p>
        </div>
      </main>
    );
  }

  const imageUrl = sneaker.image_url
    ? sneaker.image_url.startsWith("http")
      ? sneaker.image_url
      : `${BACKEND_BASE_URL}${sneaker.image_url}`
    : null;
const gender = (sneaker.gender || "").toLowerCase();

const isWomen = gender === "women";
const isMen = gender === "men";

const sizeRange = isWomen
  ? [35, 36, 37, 38, 39, 40, 41]
  : [41, 42, 43, 44, 45, 46];

const genderLabel = isWomen ? "Women" : isMen ? "Men" : "Unisex";


  return (
    <main className="product-page">
      <div className="product-shell">
        {/* LEFT: image */}
        <div className="product-media">
          <div className="product-image">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={sneaker.name}
                className="product-image-img"
              />
            ) : (
              <span>No image</span>
            )}
          </div>
          <p className="product-tagline">
            The perfect shoe for{" "}
            {genderLabel === "Women"
              ? "her."
              : genderLabel === "Men"
              ? "him."
              : "everyone."}
          </p>
        </div>

        {/* RIGHT: info */}
        <div className="product-info">
          <h1 className="product-title">{sneaker.name}</h1>
          <p className="product-brand">{sneaker.brand}</p>
          <p className="product-price">${sneaker.price.toFixed(2)}</p>

          {sneaker.colorway && (
            <p className="product-meta">
              <span>Colorway:</span> {sneaker.colorway}
            </p>
          )}

          {gender && (
            <p className="product-meta">
              <span>Category:</span> {genderLabel}
            </p>
          )}

          {sneaker.description && (
            <p className="product-description">{sneaker.description}</p>
          )}

          <div className="sizes-block">
            <p className="sizes-label">EU sizes</p>
            <div className="sizes-row">
              {sizeRange.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={
                    "size-pill" + (selectedSize === size ? " selected" : "")
                  }
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleAddToCart}
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SneakerDetailPage;
