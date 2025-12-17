import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CartPage from "./pages/CartPage";
import { getCurrentUser } from "./api";
import WomenPage from "./pages/WomenPage";
import MenPage from "./pages/MenPage";
import SneakerDetailsPage from "./pages/SneakerDetailsPage";
import CheckoutPage from "./pages/CheckoutPage";
import CardPaymentPage from "./pages/CardPaymentPage";
import MyOrdersPage from "./pages/MyOrdersPage";

function App() {
  const [loggedInEmail, setLoggedInEmail] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  // Restore session on first load
  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem("access_token");
      const email = localStorage.getItem("logged_in_email");
      if (!token) {
        setCheckingAuth(false);
        return;
      }
      try {
        await getCurrentUser(token);
        setLoggedInEmail(email || "");
      } catch (err) {
        console.warn("Stored token invalid, clearing.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("logged_in_email");
      } finally {
        setCheckingAuth(false);
      }
    }
    initAuth();
  }, []);

  //  THIS is what was missing / broken
  function handleLogin({ email }) {
    setLoggedInEmail(email);
    navigate("/"); // go to home after login
  }

  function handleSignup() {
    // after successful signup, go to login page
    navigate("/login");
  }

  function handleLogout() {
    setLoggedInEmail("");
    localStorage.removeItem("access_token");
    localStorage.removeItem("logged_in_email");
    navigate("/"); // back to home
  }

  return (
    <div className="app">
      <Navbar loggedInEmail={loggedInEmail} onLogout={handleLogout} />

      {/* you could show a loading spinner while checkingAuth if you want */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignupPage onSignup={handleSignup} />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/women" element={<WomenPage />} />
        <Route path="/men" element={<MenPage />} />
        <Route path="/sneakers/:id" element={<SneakerDetailsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/card" element={<CardPaymentPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />

      </Routes>

      <Footer />
    </div>
  );
}

export default App;
