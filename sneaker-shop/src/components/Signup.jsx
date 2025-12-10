import React, { useState } from "react";
import { register } from "../api";

function Signup({ onSignup }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  function validateEmailFormat(value) {
    // very basic email check; backend will do strict validation anyway
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setEmailError("");

    if (!validateEmailFormat(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await register(email, fullName, password);
      onSignup?.(); // App.jsx will redirect to /login
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section">
      <div className="login-card">
        <div className="login-header">
          <h2>Create account</h2>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span>Full name</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>

          <label className="login-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          {emailError && <p className="login-error">{emailError}</p>}

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
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Signup;
