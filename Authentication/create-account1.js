(function () {
  const STORAGE_KEY = "signupStep1";
  const form = document.getElementById("step1-form");
  const statusEl = document.getElementById("form-status");
  const fields = ["firstname", "lastname", "middlename", "name_extension",
                  "age", "sex", "address", "birthdate", "blood_type"];

  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    if (saved) {
      fields.forEach(function (name) {
        if (saved[name] !== undefined) form.elements[name].value = saved[name];
      });
    }
  } catch (e) {}

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const data = {};
    fields.forEach(function (name) { data[name] = form.elements[name].value.trim(); });

    const required = ["firstname", "lastname", "age", "sex", "address", "birthdate"];
    for (const name of required) {
      if (!data[name]) {
        setStatus(statusEl, "Please fill in all required fields.", "error");
        form.elements[name].focus();
        return;
      }
    }

    const age = Number(data.age);
    if (!Number.isInteger(age) || age < 1 || age > 120) {
      setStatus(statusEl, "Enter a valid age.", "error");
      form.elements.age.focus();
      return;
    }

    if (new Date(data.birthdate) > new Date()) {
      setStatus(statusEl, "Birthdate can't be in the future.", "error");
      form.elements.birthdate.focus();
      return;
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.location.href = "create-account2.html";
  });
})();