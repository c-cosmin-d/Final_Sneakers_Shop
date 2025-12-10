// src/components/ProductGrid.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../api";

const BASE_API_URL = "http://localhost:8000/sneakers";
const BACKEND_BASE_URL = "http://localhost:8000";

async function handleAddToCart(shoeId) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    alert("Please sign in to add items to your cart.");
    return;
  }
  try {
    await addToCart(token, shoeId, 1);
  } catch (err) {
    alert(err.message);
  }
}

function ProductGrid({ gender }) {
  const [sneakers, setSneakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSneakers() {
      try {
        setLoading(true);
        setError(null);

        const url = gender
          ? `${BASE_API_URL}?gender=${gender}`
          : BASE_API_URL;

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        setSneakers(data);
      } catch (err) {
        console.error("Failed to load sneakers:", err);
        setError("Could not load sneakers. Try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchSneakers();
  }, [gender]);

  if (loading) {
    return (
      <div className="product-grid">
        <p>Loading sneakers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-grid">
        <p style={{ color: "#f87171" }}>{error}</p>
      </div>
    );
  }

  if (sneakers.length === 0) {
    return (
      <div className="product-grid">
        <p>No sneakers found. Add some via the API / Swagger UI.</p>
      </div>
    );
  }

  return (
    <div className="product-grid" id="featured">
      {sneakers.map((shoe) => {
        const imageUrl = shoe.image_url
          ? shoe.image_url.startsWith("http")
            ? shoe.image_url
            : `${BACKEND_BASE_URL}${shoe.image_url}`
          : null;

        return (
          <article
            key={shoe.id}
            className="product-card"
            onClick={() => navigate(`/sneakers/${shoe.id}`)}
            style={{ cursor: "pointer" }}
          >
            {shoe.tag && <div className="product-tag">{shoe.tag}</div>}

            <div
              className="product-image"
              style={{
                width: "100%",
                height: "180px",
                borderRadius: "24px",
                background:
                  "radial-gradient(circle at top, #1e293b 0%, #020617 60%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={shoe.name}
                  className="product-image-img"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",      // or "contain" if you prefer
                    objectPosition: "center",
                    display: "block",
                  }}
                />
              ) : (
                <span className="product-emoji">👟</span>
              )}
            </div>

            <div className="product-info">
              <h3 className="product-name">{shoe.name}</h3>
              <p className="product-brand">{shoe.brand}</p>
              {shoe.colorway && (
                <p className="product-colorway">{shoe.colorway}</p>
              )}

              {shoe.gender && (
                <p className="product-gender">
                  {shoe.gender === "women" ? "Women" : "Men"}
                </p>
              )}

              <div className="product-footer">
                <span className="product-price">
                  ${shoe.price.toFixed(2)}
                </span>
                <button
                  className="product-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // don’t trigger navigation when clicking button
                    handleAddToCart(shoe.id);
                  }}
                >
                  Add to cart
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default ProductGrid;
