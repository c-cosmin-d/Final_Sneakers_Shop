import React from "react";
import Login from "../components/Login";

function LoginPage({ onLogin }) {
  return (
    <main>
      <section className="section">
        <h1 className="section-title">Welcome back</h1>
        <p className="section-subtitle">
          Sign in to manage your orders, wishlist, and more.
        </p>
      </section>
      <Login onLogin={onLogin} />
    </main>
  );
}

export default LoginPage;
