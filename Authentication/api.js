const TOKEN_KEY = "jpang_auth_token";

async function api(action, data = {}) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: action, ...data })
    });
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return { ok: false, message: "Unable to connect to the server. Please try again." };
  }
}

function setStatus(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.className = "form-status" + (type ? " " + type : "");
}

function passwordError(pw) {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Password needs letters and numbers.";
  return "";
}

function saveSession(token, remember) {
  clearSession();
  (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}
