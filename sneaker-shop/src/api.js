// src/api.js
const API_BASE = "http://localhost:8000";
export const BACKEND_BASE_URL = "http://localhost:8000";
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

export async function addToCart(token, sneakerId, quantity, size) {
  const res = await fetch(`${BACKEND_BASE_URL}/cart/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      sneaker_id: sneakerId,
      quantity,
      size,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data.detail || "Could not add to cart.";
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
export async function clearCartAfterCheckout(token) {
  const res = await fetch(`${API_BASE}/cart/clear-after-checkout/all`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    throw new Error("Failed to clear cart after checkout");
  }

  return true;
}

export async function createOrder(token) {
  const res = await fetch(`${API_BASE}/orders/checkout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to create order");
  }

  return res.json();
}


export async function getMyOrders(token) {
  const res = await fetch(`${API_BASE}/orders/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Could not load orders");
  }

  return res.json(); // adapt to whatever your backend returns
}






