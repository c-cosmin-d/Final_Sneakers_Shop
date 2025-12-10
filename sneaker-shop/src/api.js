// src/api.js
const API_BASE = "http://localhost:8000";

// Login: sends email + password to /auth/login and returns { access_token, token_type }
export async function login(email, password) {
  const form = new URLSearchParams();
  // FastAPI OAuth2PasswordRequestForm expects "username" not "email"
  form.append("username", email);
  form.append("password", password);

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  if (!res.ok) {
    throw new Error("Invalid credentials");
  }

  return res.json();
}

// Get current logged-in user using the JWT token
export async function getCurrentUser(token) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Not authorized");
  }

  return res.json(); // { id, email, full_name, is_active }
}

export async function register(email, fullName, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      full_name: fullName,
      password,
    }),
  });

  if (!res.ok) {
    let msg = "Failed to register";
    try {
      const data = await res.json();
      if (data.detail) {
        msg = Array.isArray(data.detail)
          ? data.detail[0].msg || msg
          : data.detail;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(msg);
  }

  return res.json(); // { id, email, ... }
}
export async function getCart(token) {
  const res = await fetch(`${API_BASE}/cart/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Could not load cart");
  }

  return res.json(); // [{ id, quantity, sneaker: {...} }]
}

export async function addToCart(token, sneakerId, quantity = 1) {
  const res = await fetch(`${API_BASE}/cart/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sneaker_id: sneakerId, quantity }),
  });

  if (!res.ok) {
    // 👇 DEBUG LOGGING
    let msg = `Could not add to cart (status ${res.status})`;
    try {
      const data = await res.json();
      console.error("Add to cart error:", res.status, data);
      if (data.detail) msg = data.detail;
    } catch (e) {
      console.error("Add to cart error, no JSON:", res.status);
    }
    throw new Error(msg);
  }

  return res.json();
}

export async function updateCartItem(token, itemId, quantity) {
  const res = await fetch(`${API_BASE}/cart/${itemId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quantity }),
  });

  if (!res.ok && res.status !== 204) {
    throw new Error("Could not update cart");
  }

  if (res.status === 204) return null;
  return res.json();
}

export async function deleteCartItem(token, itemId) {
  await fetch(`${API_BASE}/cart/${itemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}


