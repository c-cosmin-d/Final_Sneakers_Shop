import React from "react";

function Footer() {
  return (
    <footer className="footer" id="contact">
      <p className="footer-title">Sneaker Shop</p>
      <p className="footer-text">
        This is the sneaker shop you all have been waiting for.
      </p>
      <p className="footer-small">
        &copy; {new Date().getFullYear()} Sneaker Shop. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
