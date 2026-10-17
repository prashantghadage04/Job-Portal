// Login and register pages share this file.

function handleAuthSuccess(data) {
  saveUser(data); // data = { token, name, email, role }
  window.location.href = "dashboard.html";
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    clearMessage("message");
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: {
          email: document.getElementById("email").value,
          password: document.getElementById("password").value,
        },
      });
      handleAuthSuccess(data);
    } catch (err) {
      showMessage("message", err.message, "error");
    }
  });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    clearMessage("message");
    try {
      const data = await api("/auth/register", {
        method: "POST",
        body: {
          name: document.getElementById("name").value,
          email: document.getElementById("email").value,
          password: document.getElementById("password").value,
          role: document.getElementById("role").value,
        },
      });
      handleAuthSuccess(data);
    } catch (err) {
      showMessage("message", err.message, "error");
    }
  });
}
