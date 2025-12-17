// src/pages/CardPaymentPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createOrder } from "../api";

function CardPaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <main className="section">
        <h1 className="section-title">Card payment</h1>
        <p>No order data found. Please go back to your cart.</p>
        <button className="btn-primary" onClick={() => navigate("/cart")}>
          Back to cart
        </button>
      </main>
    );
  }

  const { city, street, number, total } = state;

  async function handlePay(e) {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // here you would integrate a real payment provider
      // for now we just "pretend" payment succeeds
      await createOrder(token);  // ✅ create order + backend clears cart
      alert("Payment successful! Your order has been placed.");
      navigate("/my-orders");
    } catch (err) {
      console.error(err);
      alert("Payment failed, please try again.");
    }
  }

  return (
    <main className="section">
      <h1 className="section-title">Card payment</h1>
      <p className="section-subtitle">
        Delivery to: {city}, {street} {number}
      </p>
      <p className="section-subtitle">Total: ${total.toFixed(2)}</p>

      <form className="checkout-form" onSubmit={handlePay}>
        <div className="checkout-group">
          <h3>Card details</h3>
          <input placeholder="Card number" required />
          <div className="checkout-grid">
            <input placeholder="MM/YY" required />
            <input placeholder="CVC" required />
          </div>
          <input placeholder="Name on card" required />
        </div>

        <button type="submit" className="btn-primary">
          Pay now
        </button>
      </form>
    </main>
  );
}

export default CardPaymentPage;
