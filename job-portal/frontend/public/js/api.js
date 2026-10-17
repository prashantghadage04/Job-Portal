// Shared helpers used by every page.

// ---------- Logged-in user (stored in the browser) ----------
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

// ---------- Call the backend ----------
// Example: await api("/jobs"), await api("/jobs", { method: "POST", body: {...} })
async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json" };
  const user = getUser();
  if (user && user.token) {
    headers["Authorization"] = "Bearer " + user.token;
  }

  const res = await fetch("/api" + path, {
    method: options.method || "GET",
    headers: headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // read the body safely (it may be empty)
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = null;
    }
  }

  if (!res.ok) {
    // token expired or invalid on a protected page: send the user to login
    if (res.status === 401 && user && !path.startsWith("/auth/")) {
      localStorage.removeItem("user");
      window.location.href = "login.html";
    }
    throw new Error((data && data.message) || "Request failed (" + res.status + ")");
  }
  return data;
}

// ---------- Small UI helpers ----------
// Escape text before putting it into innerHTML (prevents XSS).
function esc(value) {
  const div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}

function showMessage(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = "msg " + type; // "error" or "success"
}

function clearMessage(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = "";
  el.className = "msg";
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function renderNav() {
  const user = getUser();
  const nav = document.getElementById("nav");
  if (!nav) return;

  let links = '<a href="index.html">Jobs</a>';
  if (user) {
    links +=
      '<a href="dashboard.html">Dashboard</a>' +
      '<span class="hello">Hi, ' + esc(user.name) + " (" + esc(user.role.toLowerCase()) + ")</span>" +
      '<button class="secondary small" onclick="logout()">Logout</button>';
  } else {
    links += '<a href="login.html">Login</a><a class="btn small" href="register.html">Register</a>';
  }

  nav.innerHTML = '<a class="brand" href="index.html">JobPortal</a><div class="links">' + links + "</div>";
}

renderNav();
