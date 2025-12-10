import React from "react";
import Signup from "../components/Signup";

function SignupPage({ onSignup }) {
  return (
    <main>
      <section className="section">
        <h1 className="section-title">Join Sneaker Shop</h1>
        <p className="section-subtitle">
          Create an account to unlock wishlists, order history, and more.
        </p>
      </section>
      <Signup onSignup={onSignup} />
    </main>
  );
}

export default SignupPage;
