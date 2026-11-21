(function () {
  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const rememberBox = document.getElementById("remember");
  const toggleBtn = form.querySelector(".toggle-pw");
  const button = form.querySelector(".btn");
  const statusEl = form.querySelector(".form-status");
  const emailError = emailInput.closest(".field").querySelector(".error-msg");
  const passwordError_ = passwordInput.closest(".field").querySelector(".error-msg");

  (async function autoLogin() {
    const token = getToken();
    if (!token) return;
    const result = await api("validate", { token: token });
    if (result.ok) {
      window.location.replace(DONOR_DB_PAGE);
    } else {
      clearSession();
    }
  })();

  toggleBtn.addEventListener("click", function () {
    const hidden = passwordInput.type === "password";
    passwordInput.type = hidden ? "text" : "password";
    toggleBtn.textContent = hidden ? "Hide" : "Show";
  });

  emailInput.addEventListener("input", function () { emailError.textContent = ""; });
  passwordInput.addEventListener("input", function () { passwordError_.textContent = ""; });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const remember = rememberBox.checked;

    emailError.textContent = "";
    passwordError_.textContent = "";
    setStatus(statusEl, "", "");

    let valid = true;
    if (!EMAIL_RE.test(email)) {
      emailError.textContent = "Enter a valid email address.";
      valid = false;
    }
    if (!password) {
      passwordError_.textContent = "Enter your password.";
      valid = false;
    }
    if (!valid) return;

    button.disabled = true;
    setStatus(statusEl, "Logging in...", "");

    const result = await api("login", { email: email, password: password, remember: remember });

    if (result.ok) {
      saveSession(result.token, remember);
      window.location.href = DONOR_DB_PAGE;
    } else {
      setStatus(statusEl, result.message || "Could not log in.", "error");
      button.disabled = false;
    }
  });
})();