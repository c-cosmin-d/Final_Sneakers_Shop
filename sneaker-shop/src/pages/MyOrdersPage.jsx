// src/pages/MyOrdersPage.jsx
import React, { useEffect, useState } from "react";
import { getMyOrders } from "../api";

const BACKEND_BASE_URL = "http://localhost:8000";

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    async function loadOrders() {
      if (!token) {
          console.log("No token, cannot load orders.");
          setLoading(false);
          return;
      }

      try {
        const data = await getMyOrders(token);
        setOrders(data);
      } catch (err) {
        console.error(err);
        setError("Could not load your orders.");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [token]);

  // same idea as CartPage: block visitors
  if (!token) {
    return (
      <main className="section">
        <p>You must be signed in to view your orders.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="section">
        <p>Loading your orders...</p>
      </main>
    );
  }

  return (
    <main className="section">
      <h1 className="section-title">My orders</h1>
      {error && <p className="login-error">{error}</p>}

      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <div
          className="orders-list"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            marginTop: "1.5rem",
          }}
        >
          {orders.map((order) => (
            <div
              key={order.id}
              className="order-card"
              style={{
                background: "rgba(15, 23, 42, 0.9)",
                borderRadius: "24px",
                padding: "1.25rem 1.5rem",
                boxShadow: "0 18px 45px rgba(0, 0, 0, 0.45)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                }}
              >
                <div>
                  <h3 style={{ color: "#e5e7eb", marginBottom: "0.25rem" }}>
                    Order #{order.id}
                  </h3>
                  {order.created_at && (
                    <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <div style={{ fontWeight: 600, color: "#a7f3d0" }}>
                  ${order.total?.toFixed ? order.total.toFixed(2) : order.total}
                </div>
              </div>

              {/* items in this order */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {order.items?.map((item) => {
                  const s = item.sneaker || {};
                  const img = s.image_url
                    ? s.image_url.startsWith("http")
                      ? s.image_url
                      : `${BACKEND_BASE_URL}${s.image_url}`
                    : null;

                  return (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        alignItems: "center",
                      }}
                    >
                      {/* thumbnail */}
                      <div
                        style={{
                          width: "64px",
                          height: "64px",
                          borderRadius: "12px",
                          overflow: "hidden",
                          background:
                            "radial-gradient(circle at top, #1e293b 0%, #020617 60%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {img ? (
                          <img
                            src={img}
                            alt={s.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span>👟</span>
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            color: "#e5e7eb",
                            fontWeight: 500,
                            marginBottom: "0.1rem",
                          }}
                        >
                          {s.name}
                        </p>
                        <p
                          style={{
                            color: "#9ca3af",
                            fontSize: "0.85rem",
                            marginBottom: "0.1rem",
                          }}
                        >
                          {s.brand} — EU {item.size}
                        </p>
                        <p
                          style={{
                            color: "#9ca3af",
                            fontSize: "0.85rem",
                          }}
                        >
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <div
                        style={{
                          color: "#e5e7eb",
                          fontWeight: 500,
                        }}
                      >
                        $
                        {(
                          (s.price || 0) * (item.quantity || 0)
                        ).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}


export default MyOrdersPage;
