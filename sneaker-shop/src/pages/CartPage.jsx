// sneaker-shop/src/pages/CartPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, updateCartItem, deleteCartItem } from "../api";

const BACKEND_BASE_URL = "http://localhost:8000";

const qtyButtonBaseStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "999px",
  border: "none",
  background: "#1e293b",
  color: "#fff",
  fontSize: "1.1rem",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease",
};

function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  // ---------- load cart ----------
  useEffect(() => {
    async function loadCart() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await getCart(token);
        setItems(data);
      } catch (err) {
        console.error(err);
        setError("Could not load cart.");
      } finally {
        setLoading(false);
      }
    }
    loadCart();
  }, [token]);

  function calcTotal() {
    return items.reduce(
      (sum, item) => sum + item.sneaker.price * item.quantity,
      0
    );
  }

  // ---------- quantity change ----------
  async function handleQuantityChange(itemId, newQty) {
    if (!token) return;

    try {
      if (newQty <= 0) {
        // remove item
        await deleteCartItem(token, itemId);
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        return;
      }

      const updated = await updateCartItem(token, itemId, newQty);
      if (!updated) return;

      setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
    } catch (err) {
      console.error(err);
      // if backend sends "Only X items left..." we want to show it
      alert(err.message || "Could not update quantity.");
    }
  }

  // ---------- UI ----------
  if (loading) {
    return (
      <main className="section">
        <p>Loading cart...</p>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="section">
        <p>You must be signed in to view your cart.</p>
      </main>
    );
  }

  return (
    <main className="section">
      <h1 className="section-title">Your cart</h1>
      {error && <p className="login-error">{error}</p>}

      {items.length === 0 ? (
        <p>Your cart is empty. Go add some sneakers!</p>
      ) : (
        <>
          {/* GRID OF CART CARDS */}
          <div
            className="cart-list"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "2rem",
              marginTop: "1.5rem",
            }}
          >
            {items.map((item) => {
              const s = item.sneaker;
              const imageUrl = s.image_url
                ? s.image_url.startsWith("http")
                  ? s.image_url
                  : `${BACKEND_BASE_URL}${s.image_url}`
                : null;

              return (
                <div
                  key={item.id}
                  className="cart-item"
                  style={{
                    background: "rgba(15, 23, 42, 0.9)",
                    borderRadius: "24px",
                    padding: "1.25rem 1.5rem",
                    boxShadow: "0 18px 45px rgba(0, 0, 0, 0.45)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  {/* image */}
                  <div
                    className="cart-item-image"
                    style={{
                      width: "100%",
                      height: "160px",
                      borderRadius: "18px",
                      background:
                        "radial-gradient(circle at top, #1e293b 0%, #020617 60%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={s.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                          display: "block",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "2rem" }}>👟</span>
                    )}
                  </div>

                  {/* text */}
                  <h3
                    className="cart-item-name"
                    style={{
                      fontWeight: 600,
                      color: "#e5e7eb",
                      marginBottom: "0.15rem",
                    }}
                  >
                    {s.name}
                  </h3>

                  {/* brand + size */}
                  <p
                    className="cart-item-brand"
                    style={{
                      fontSize: "0.9rem",
                      color: "#9ca3af",
                      marginBottom: "0.35rem",
                    }}
                  >
                    {s.brand} — EU {item.size}
                  </p>

                  <p
                    className="cart-item-price"
                    style={{
                      fontWeight: 600,
                      color: "#a7f3d0",
                      marginBottom: "0.75rem",
                    }}
                  >
                    ${s.price.toFixed(2)}
                  </p>

                  {/* quantity controls */}
                  <div
                    className="cart-item-actions"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginTop: "auto", // push to bottom of card
                    }}
                  >
                    <button
                      style={qtyButtonBaseStyle}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.12)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                      onMouseDown={(e) =>
                        (e.currentTarget.style.transform = "scale(0.92)")
                      }
                      onMouseUp={(e) =>
                        (e.currentTarget.style.transform = "scale(1.12)")
                      }
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                    >
                      -
                    </button>
                    <span
                      style={{
                        width: "32px",
                        textAlign: "center",
                        display: "inline-block",
                        color: "#e5e7eb",
                      }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      style={qtyButtonBaseStyle}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.12)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                      onMouseDown={(e) =>
                        (e.currentTarget.style.transform = "scale(0.92)")
                      }
                      onMouseUp={(e) =>
                        (e.currentTarget.style.transform = "scale(1.12)")
                      }
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* total + checkout */}
          <div
            className="cart-total"
            style={{
              marginTop: "2rem",
              fontSize: "1.1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              maxWidth: "600px",
            }}
          >
            <div>
              <span>Total:</span>{" "}
              <strong>${calcTotal().toFixed(2)}</strong>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate("/checkout")}
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </main>
  );
}

export default CartPage;
