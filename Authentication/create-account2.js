(function () {
  const STORAGE_KEY = "signupStep1";
  const form = document.getElementById("step2-form");
  const button = document.getElementById("create-account-btn");
  const statusEl = document.getElementById("form-status");

  let step1 = null;
  try { step1 = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null"); } catch (e) {}
  if (!step1) {
    window.location.replace("create-account1.html");
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = form.elements.email.value.trim().toLowerCase();
    const number = form.elements.number.value.trim().replace(/[\s-]/g, "");
    const password = form.elements.password.value;
    const confirm = form.elements.confirm_password.value;

    if (!EMAIL_RE.test(email)) {
      setStatus(statusEl, "Enter a valid email address.", "error");
      return;
    }
    if (!PHONE_RE.test(number)) {
      setStatus(statusEl, "Enter a valid mobile number, like +639171234567 or 09171234567.", "error");
      return;
    }
    const pwError = passwordError(password);
    if (pwError) {
      setStatus(statusEl, pwError, "error");
      return;
    }
    if (password !== confirm) {
      setStatus(statusEl, "Passwords do not match.", "error");
      return;
    }

    button.disabled = true;
    setStatus(statusEl, "Creating your account...", "");

    const result = await api("register", {
      firstName: step1.firstname,
      lastName: step1.lastname,
      middleName: step1.middlename,
      nameExtension: step1.name_extension,
      age: step1.age,
      sex: step1.sex,
      address: step1.address,
      birthdate: step1.birthdate,
      bloodType: step1.blood_type,
      email: email,
      number: number,
      password: password
    });

    if (result.ok) {
      sessionStorage.removeItem(STORAGE_KEY);
      setStatus(statusEl, "Account created! Taking you to log in...", "ok");
      setTimeout(function () { window.location.href = "signin.html"; }, 1500);
    } else {
      setStatus(statusEl, result.message || "Could not create the account.", "error");
      button.disabled = false;
    }
  });
})();