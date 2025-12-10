// src/components/Login.jsx
import React, { useState } from "react";
import { login } from "../api";

function Login({ onLogin, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password); // { access_token, token_type }
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("logged_in_email", email);
      onLogin?.({ email, token: data.access_token });
    } catch (err) {
      console.error(err);
      setError("Email or password is incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section">
      <div className="login-card">
        <div className="login-header">
          <h2>Sign in</h2>
          {onClose && (
            <button className="login-close" type="button" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="login-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button className="btn-primary login-submit" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Login;
