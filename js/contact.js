/* Contact Us form. Posts JSON to the platform endpoint; no Supabase key or database access lives here. */
(function () {
  "use strict";
  var ENDPOINT = "https://portal.tejascooperative.com/api/public/contact-inquiries";
  var TURNSTILE_SITE_KEY = window.TEJAS_TURNSTILE_SITE_KEY || "0x4AAAAAAF1HYbeNeZyQhFrn";
  var form = document.getElementById("contact-form");
  if (!form) return;

  var FIELDS = ["full_name", "company_name", "phone", "email", "details", "consent_to_contact"];
  var LABELS = { full_name: "Full name", company_name: "Company name", phone: "Phone number", email: "Email address", details: "Inquiry details" };
  var btn = document.getElementById("cf-submit");
  var formError = document.getElementById("cf-form-error");
  var success = document.getElementById("contact-success");
  var token = "", widget = null, submitting = false, key = null;

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var a = new Uint8Array(16); crypto.getRandomValues(a);
    return Array.prototype.map.call(a, function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
  }
  function el(name) { return document.getElementById("cf-" + name); }
  function setError(name, msg) {
    var input = el(name), err = document.getElementById("cf-" + name + "-error");
    if (!err) return;
    err.textContent = msg || ""; err.hidden = !msg;
    if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
  }
  function clearErrors() { FIELDS.forEach(function (f) { setError(f, ""); }); formError.hidden = true; formError.textContent = ""; }

  function validate() {
    var errs = {};
    FIELDS.slice(0, 5).forEach(function (f) { if (!el(f).value.trim()) errs[f] = LABELS[f] + " is required."; });
    var email = el("email").value.trim();
    if (email && !/^[^\s@<>()[\]\\,;:"]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(email)) errs.email = "Enter a valid email address.";
    var phone = el("phone").value.trim(), digits = phone.replace(/\D/g, "");
    if (phone && (!/^[0-9+().\-\sxXext#]+$/.test(phone) || digits.length < 7 || digits.length > 15)) errs.phone = "Enter a valid phone number.";
    if (!el("consent_to_contact").checked) errs.consent_to_contact = "Please confirm you want us to contact you.";
    return errs;
  }
  function showErrors(errs) {
    var first = null;
    FIELDS.forEach(function (f) { if (errs[f]) { setError(f, errs[f]); if (!first) first = f; } });
    if (errs.form) { formError.textContent = errs.form; formError.hidden = false; }
    if (first) el(first).focus();
  }

  function loadTurnstile() {
    if (!TURNSTILE_SITE_KEY) return;
    var s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true; s.defer = true;
    s.onload = function () {
      if (!window.turnstile || widget !== null) return;
      widget = window.turnstile.render("#cf-turnstile", {
        sitekey: TURNSTILE_SITE_KEY, action: "contact",
        callback: function (t) { token = t; },
        "expired-callback": function () { token = ""; },
        "error-callback": function () { token = ""; }
      });
    };
    document.head.appendChild(s);
  }
  function resetTurnstile() { token = ""; if (widget !== null && window.turnstile) window.turnstile.reset(widget); }

  function failure(msg) {
    formError.textContent = msg || "We could not send your message. Please try again in a moment.";
    formError.hidden = false;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (submitting) return;
    clearErrors();
    var errs = validate();
    if (Object.keys(errs).length) { showErrors(errs); return; }
    if (TURNSTILE_SITE_KEY && !token) { failure("Please complete the security check, then send again."); return; }

    submitting = true; btn.disabled = true; btn.setAttribute("aria-busy", "true"); btn.textContent = "Sending...";
    if (!key) key = uuid().replace(/-/g, "");
    var payload = {
      idempotency_key: key,
      full_name: el("full_name").value, company_name: el("company_name").value,
      phone: (window.TejasPhone ? window.TejasPhone.storage(el("phone").value) : el("phone").value), email: el("email").value, details: el("details").value,
      consent_to_contact: true, company_fax: el("company_fax").value,
      source_page_path: location.pathname, turnstile_token: token
    };
    fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) { return { status: res.status, data: data }; });
      })
      .then(function (r) {
        if ((r.status === 201 || r.status === 409) && r.data.ok) {
          document.getElementById("cf-ref").textContent = r.data.reference_code || "";
          form.hidden = true; success.hidden = false; success.focus();
        } else if (r.status === 400 && r.data.errors) {
          resetTurnstile(); key = null; showErrors(r.data.errors);
        } else if (r.status === 429) {
          resetTurnstile(); failure("We have received several messages from you recently. Please try again later.");
        } else {
          resetTurnstile(); failure();
        }
      })
      .catch(function () { resetTurnstile(); failure(); })
      .then(function () { submitting = false; btn.disabled = false; btn.removeAttribute("aria-busy"); btn.textContent = "Send Message"; });
  });

  FIELDS.forEach(function (f) { var i = el(f); if (i) i.addEventListener("input", function () { setError(f, ""); }); });
  loadTurnstile();
})();
