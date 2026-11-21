(function () {
  const emailForm = document.getElementById("forgot-form");
  const codeForm = document.getElementById("code-form");
  const resetForm = document.getElementById("reset-form");

  const emailInput = document.getElementById("forgot-email");
  const emailError = emailForm.querySelector(".error-msg");
  const emailBtn = emailForm.querySelector(".btn");
  const emailStatus = emailForm.querySelector(".form-status");

  const otpBoxes = Array.prototype.slice.call(codeForm.querySelectorAll(".otp-box"));
  const codeError = codeForm.querySelector(".error-msg");
  const codeBtn = codeForm.querySelector(".btn");
  const resendBtn = document.getElementById("resend-btn");
  const codeStatus = codeForm.querySelector(".form-status");

  const newPw = document.getElementById("new-password");
  const confirmPw = document.getElementById("confirm-password");
  const resetError = resetForm.querySelector(".error-msg");
  const resetBtn = resetForm.querySelector(".btn");
  const resetStatus = resetForm.querySelector(".form-status");

  let currentEmail = "";
  let currentCode = "";

  emailInput.addEventListener("input", function () { emailError.textContent = ""; });

  emailForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();

    if (!EMAIL_RE.test(email)) {
      emailError.textContent = "Enter a valid email address.";
      return;
    }

    emailBtn.disabled = true;
    setStatus(emailStatus, "Sending...", "");

    const result = await api("forgot-password", { email: email });

    if (result.ok) {
      currentEmail = email;
      emailForm.hidden = true;
      codeForm.hidden = false;
      setStatus(codeStatus, "If an account exists for " + email + ", a code is on its way. Check your inbox and spam folder.", "ok");
      startResendCooldown();
      otpBoxes[0].focus();
    } else {
      setStatus(emailStatus, result.message || "Could not send the code.", "error");
      emailBtn.disabled = false;
    }
  });

  otpBoxes.forEach(function (box, i) {
    box.addEventListener("input", function () {
      box.value = box.value.replace(/\D/g, "").slice(0, 1);
      codeError.textContent = "";
      if (box.value && i < otpBoxes.length - 1) otpBoxes[i + 1].focus();
    });

    box.addEventListener("keydown", function (e) {
      if (e.key === "Backspace" && !box.value && i > 0) otpBoxes[i - 1].focus();
    });
    
    box.addEventListener("paste", function (e) {
      const digits = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
      if (!digits) return;
      e.preventDefault();
      otpBoxes.forEach(function (b, n) { b.value = digits[n] || ""; });
      otpBoxes[Math.min(digits.length, 6) - 1].focus();
    });
  });

  codeForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const code = otpBoxes.map(function (b) { return b.value; }).join("");

    if (!/^\d{6}$/.test(code)) {
      codeError.textContent = "Enter all six digits.";
      return;
    }

    codeBtn.disabled = true;
    setStatus(codeStatus, "Checking...", "");

    const result = await api("verify-code", { email: currentEmail, code: code });

    if (result.ok) {
      currentCode = code;
      codeForm.hidden = true;
      resetForm.hidden = false;
      newPw.focus();
    } else {
      setStatus(codeStatus, result.message || "Wrong code.", "error");
      codeBtn.disabled = false;
    }
  });

  let cooldownTimer = null;
  function startResendCooldown() {
    let seconds = 60;
    resendBtn.disabled = true;
    clearInterval(cooldownTimer);
    cooldownTimer = setInterval(function () {
      seconds--;
      if (seconds <= 0) {
        clearInterval(cooldownTimer);
        resendBtn.disabled = false;
        resendBtn.textContent = "Resend code";
      } else {
        resendBtn.textContent = "Resend code (" + seconds + "s)";
      }
    }, 1000);
    resendBtn.textContent = "Resend code (60s)";
  }

  resendBtn.addEventListener("click", async function () {
    resendBtn.disabled = true;
    const result = await api("forgot-password", { email: currentEmail });
    otpBoxes.forEach(function (b) { b.value = ""; });
    otpBoxes[0].focus();
    if (result.ok) {
      setStatus(codeStatus, "A new code was sent if the account exists.", "ok");
      startResendCooldown();
    } else {
      setStatus(codeStatus, result.message || "Could not resend the code.", "error");
      resendBtn.disabled = false;
    }
  });

  resetForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    resetError.textContent = "";

    const password = newPw.value;
    const pwError = passwordError(password);
    if (pwError) {
      resetError.textContent = pwError;
      return;
    }
    if (password !== confirmPw.value) {
      resetError.textContent = "Passwords do not match.";
      return;
    }

    resetBtn.disabled = true;
    setStatus(resetStatus, "Saving...", "");

    const result = await api("reset-password", {
      email: currentEmail,
      code: currentCode,
      password: password
    });

    if (result.ok) {
      clearSession();
      setStatus(resetStatus, "Password updated! Taking you to log in...", "ok");
      setTimeout(function () { window.location.href = "signin.html"; }, 1500);
    } else {
      setStatus(resetStatus, result.message || "Could not reset the password.", "error");
      resetBtn.disabled = false;
    }
  });
})();