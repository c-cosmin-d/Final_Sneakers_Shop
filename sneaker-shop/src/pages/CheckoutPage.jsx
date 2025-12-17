// src/pages/CheckoutPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart,createOrder } from "../api";

function CheckoutPage() {
  const [method, setMethod] = useState("cash");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [easyboxCode, setEasyboxCode] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // load cart on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      // not logged in → go to login
      navigate("/login");
      return;
    }

    async function loadCart() {
      try {
        const data = await getCart(token);
        setCartItems(data);
      } catch (err) {
        console.error(err);
        setError("Could not load cart.");
      } finally {
        setLoadingCart(false);
      }
    }

    loadCart();
  }, [navigate]);

  const total = cartItems.reduce(
    (sum, item) => sum + item.sneaker.price * item.quantity,
    0
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (method === "easybox") {
      if (!easyboxCode) {
        alert("Please choose an Easybox in your area.");
        return;
      }
          try {
          // ✅ create order here
          await createOrder(token);
          alert("Order placed with Easybox delivery!");
          navigate("/my-orders");
        } catch (err) {
          console.error(err);
          setError("Something went wrong placing your order.");
        }
        return;
    }

    // courier methods need address
    if (!city || !street || !number) {
      alert("Please fill in your address.");
      return;
    }

    if (method === "online_card") {
      // go to card page with address and total
      navigate("/checkout/card", {
        state: { city, street, number, method, total },
      });
    } else {
      // cash at courier
      try {
        await createOrder(token);         // ✅ create order
        alert("Order placed! You will pay cash to the courier.");
        navigate("/my-orders");
      } catch (err) {
        console.error(err);
        setError("Something went wrong placing your order.");
      }
    }
  }

  if (loadingCart) {
    return (
      <main className="section">
        <h1 className="section-title">Checkout</h1>
        <p>Loading your cart...</p>
      </main>
    );
  }

  return (
    <main className="section checkout-layout">
      <div className="checkout-left">
        <h1 className="section-title">Checkout</h1>
        <p className="section-subtitle">
          Choose your preferred delivery and payment method.
        </p>

        {error && <p className="error-text">{error}</p>}

        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="checkout-group">
            <h3>Payment & Delivery method</h3>

            <label>
              <input
                type="radio"
                value="cash"
                checked={method === "cash"}
                onChange={(e) => setMethod(e.target.value)}
              />
              Cash at courier
            </label>

            <label>
              <input
                type="radio"
                value="online_card"
                checked={method === "online_card"}
                onChange={(e) => setMethod(e.target.value)}
              />
              Online payment by card
            </label>

            <label>
              <input
                type="radio"
                value="easybox"
                checked={method === "easybox"}
                onChange={(e) => setMethod(e.target.value)}
              />
              Easybox in your area
            </label>
          </div>

          {method !== "easybox" && (
            <div className="checkout-group">
              <h3>Shipping address</h3>
              <div className="checkout-grid">
                <input
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <input
                  placeholder="Street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
                <input
                  placeholder="Number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
              </div>
            </div>
          )}

          {method === "easybox" && (
            <div className="checkout-group">
              <h3>Choose Easybox</h3>
              <input
                placeholder="Easybox code / address"
                value={easyboxCode}
                onChange={(e) => setEasyboxCode(e.target.value)}
              />
            </div>
          )}

          <button className="btn-primary" type="submit">
            Continue
          </button>
        </form>
      </div>

      {/* Order summary */}
      <aside className="checkout-summary">
        <h3>Order summary</h3>
        {cartItems.map((item) => (
          <div key={item.id} className="summary-item">
            <div>
              <strong>{item.sneaker.name}</strong> (EU {item.size})
              <div className="summary-meta">
                {item.quantity} x ${item.sneaker.price.toFixed(2)}
              </div>
            </div>
            <div>
              ${(item.sneaker.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
        <hr />
        <p className="summary-total">
          Total: <strong>${total.toFixed(2)}</strong>
        </p>
      </aside>
    </main>
  );
}

export default CheckoutPage;
