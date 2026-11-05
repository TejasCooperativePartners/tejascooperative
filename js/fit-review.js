/* Fit review modal. Opens from any control with [data-fit-review-open] and from the #fit-review hash.
   Posts JSON to the platform endpoint below. No Supabase key or direct database access lives here. */
(function () {
  "use strict";
  var ENDPOINT = "https://portal.tejascooperative.com/api/public/fit-review-requests";
  var TURNSTILE_SITE_KEY = window.TEJAS_TURNSTILE_SITE_KEY || "0x4AAAAAAF1HYbeNeZyQhFrn";
  var tsWidget = null;

  var STATUSES = [
    ["currently_holds", "Currently hold a cooperative contract"],
    ["registered_never_awarded", "Registered, but never awarded"],
    ["lapsed", "Held a contract before, now lapsed"],
    ["applied_not_awarded", "Applied before and was not awarded"],
    ["never_registered", "Never registered or applied"],
    ["not_sure", "Not sure"]
  ];
  var OBSTACLES = [
    ["choosing_cooperative_or_category", "Choosing the right cooperative or category"],
    ["finding_next_opening", "Finding the next opening"],
    ["forms_and_documents", "Forms and documents"],
    ["recommendation_letters", "Recommendation letters"],
    ["catalog_and_pricing", "Catalog and pricing"],
    ["prior_rejection", "A prior rejection"],
    ["time_or_staff_capacity", "Time or staff capacity"],
    ["something_else", "Something else"]
  ];
  var COOPS = ["BuyBoard", "TIPS", "Choice Partners", "HGACBuy", "Sourcewell", "OMNIA Partners", "Texas state term contracts", "Not sure yet"];
  var METHODS = [["email", "Email"], ["phone_call", "Phone call"], ["text_message", "Text message"], ["no_preference", "No preference"]];

  var root, dialog, opener, step = 1, idemKey = null, submitting = false, sent = false, retryKey = false, turnstileToken = "";
  var inerted = [];

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var a = new Uint8Array(16); crypto.getRandomValues(a);
    return Array.prototype.map.call(a, function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
  }

  function field(id, label, control, help) {
    return '<div class="fr-field" data-field="' + id + '"><label for="fr-' + id + '">' + label + '</label>' + control +
      (help ? '<p class="fr-help" id="fr-' + id + '-help">' + help + '</p>' : '') +
      '<p class="fr-error" id="fr-' + id + '-error" role="alert" hidden></p></div>';
  }
  function text(id, type, extra) {
    return '<input id="fr-' + id + '" name="' + id + '" type="' + type + '" ' + (extra || "") + ' aria-describedby="fr-' + id + '-help fr-' + id + '-error">';
  }
  function select(id, opts, placeholder) {
    return '<select id="fr-' + id + '" name="' + id + '" aria-describedby="fr-' + id + '-error"><option value="">' + placeholder + '</option>' +
      opts.map(function (o) { return '<option value="' + o[0] + '">' + esc(o[1]) + '</option>'; }).join("") + '</select>';
  }

  function build() {
    root = document.createElement("div");
    root.className = "fr-root";
    root.hidden = true;
    root.innerHTML =
      '<div class="fr-backdrop" data-fr-close></div>' +
      '<div class="fr-dialog" role="dialog" aria-modal="true" aria-labelledby="fr-title" aria-describedby="fr-sub" tabindex="-1">' +
        '<div class="fr-head"><div><h2 id="fr-title">Start a Conversation</h2>' +
          '<p id="fr-sub" class="fr-sub">Request a free fit review. Two short steps, about two minutes.</p></div>' +
          '<button type="button" class="fr-x" data-fr-close aria-label="Close">&times;</button></div>' +
        '<form class="fr-form" novalidate>' +
          '<p class="fr-progress" id="fr-progress" aria-live="polite">Step 1 of 2</p>' +
          '<div class="fr-body">' +
            '<div class="fr-step" data-step="1">' +
              field("contact_name", "Your name", text("contact_name", "text", 'autocomplete="name" maxlength="200" required')) +
              field("company_name", "Company name", text("company_name", "text", 'autocomplete="organization" maxlength="200" required')) +
              field("email", "Work email", text("email", "email", 'autocomplete="email" maxlength="254" required')) +
              field("phone", "Phone", text("phone", "tel", 'autocomplete="tel" maxlength="40"'), "Optional. Add it if you want a call or text about your fit review.") +
              '<fieldset class="fr-field" data-field="preferred_contact_method"><legend>Best way to reach you</legend><div class="fr-seg">' +
                METHODS.map(function (m, i) {
                  return '<label class="fr-seg-opt"><input type="radio" name="preferred_contact_method" value="' + m[0] + '"' + (m[0] === "no_preference" ? " checked" : "") + '><span>' + m[1] + '</span></label>';
                }).join("") + '</div><p class="fr-error" id="fr-preferred_contact_method-error" role="alert" hidden></p></fieldset>' +
              field("company_website", "Company website", text("company_website", "text", 'inputmode="url" autocomplete="url" maxlength="255" placeholder="yourcompany.com"'), "Optional.") +
            '</div>' +
            '<div class="fr-step" data-step="2" hidden>' +
              field("offerings", "What does your company sell or provide?", '<textarea id="fr-offerings" name="offerings" rows="3" maxlength="1000" required aria-describedby="fr-offerings-help fr-offerings-error"></textarea>', "Products, services, brands, or category names.") +
              field("service_area", "Where do you sell or provide services?", '<textarea id="fr-service_area" name="service_area" rows="2" maxlength="300" required placeholder="Rio Grande Valley and Texas statewide" aria-describedby="fr-service_area-help fr-service_area-error"></textarea>', "Include your home base and the areas you cover.") +
              field("cooperative_status", "What is your current cooperative status?", select("cooperative_status", STATUSES, "Choose one")) +
              '<fieldset class="fr-field" data-field="cooperative_interests"><legend>Which cooperatives are you considering? <span class="fr-opt">Optional</span></legend><div class="fr-chips">' +
                COOPS.map(function (c) { return '<label class="fr-chip"><input type="checkbox" name="cooperative_interests" value="' + esc(c) + '"><span>' + esc(c) + '</span></label>'; }).join("") +
              '</div><p class="fr-error" id="fr-cooperative_interests-error" role="alert" hidden></p></fieldset>' +
              field("target_invitation", "Is there a specific invitation, category, or deadline you already have in mind?", text("target_invitation", "text", 'maxlength="200"'), "Optional.") +
              field("primary_obstacle", "What is your biggest obstacle right now?", select("primary_obstacle", OBSTACLES, "Choose one")) +
              field("additional_notes", "Anything else we should know?", '<textarea id="fr-additional_notes" name="additional_notes" rows="3" maxlength="1000" aria-describedby="fr-additional_notes-help fr-additional_notes-error"></textarea>', "Optional.") +
              '<p class="fr-privacy">We use these details only to review fit and contact you about the review. We do not share them with a cooperative.</p>' +
              '<div class="fr-field fr-consent" data-field="consent_to_contact"><label class="fr-check"><input type="checkbox" id="fr-consent_to_contact" name="consent_to_contact" aria-describedby="fr-consent_to_contact-error"><span>Contact me about this fit review.</span></label>' +
                '<p class="fr-error" id="fr-consent_to_contact-error" role="alert" hidden></p></div>' +
              (TURNSTILE_SITE_KEY ? '<div id="fr-turnstile" class="cf-turnstile"></div>' : '') +
            '</div>' +
            '<div class="fr-hp" aria-hidden="true"><input type="text" name="company_fax" tabindex="-1" autocomplete="off"></div>' +
            '<div class="fr-fail" id="fr-fail" role="alert" hidden><p>Your request was not sent. Your answers are still here. Please try again.</p></div>' +
          '</div>' +
          '<div class="fr-actions"><button type="button" class="fr-btn fr-btn-ghost" id="fr-back" hidden>Back</button>' +
            '<button type="button" class="fr-btn fr-btn-primary" id="fr-next">Continue</button>' +
            '<button type="submit" class="fr-btn fr-btn-primary" id="fr-submit" hidden>Request Fit Review</button></div>' +
          '<p class="fr-submit-note" id="fr-submit-note" hidden>Submitting this form sends your information to Tejas Cooperative Partners. See our <a href="/privacy">Privacy Policy</a>.</p>' +
        '</form>' +
        '<div class="fr-done" id="fr-done" hidden>' +
          '<h3 tabindex="-1" id="fr-done-title">Request received</h3>' +
          '<p>Thank you. A partner reviews every fit review request before platform access is offered. If your category and timing look like a fit, we will contact you using the method you selected.</p>' +
          '<p class="fr-ref">Your reference <strong id="fr-ref"></strong></p>' +
          '<div class="fr-actions"><button type="button" class="fr-btn fr-btn-primary" id="fr-finish">Done</button></div></div>' +
      '</div>';
    document.body.appendChild(root);
    dialog = root.querySelector(".fr-dialog");
    var form = root.querySelector("form");

    root.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("[data-fr-close]")) close(); });
    root.querySelector("#fr-next").addEventListener("click", function () { if (validateStep(1)) showStep(2); });
    root.querySelector("#fr-back").addEventListener("click", function () { showStep(1); });
    root.querySelector("#fr-finish").addEventListener("click", function () { reset(); close(); });
    form.addEventListener("submit", function (e) { e.preventDefault(); submit(); });
    form.addEventListener("input", function (e) { clearError(e.target); });
    form.addEventListener("change", function (e) {
      clearError(e.target);
      if (e.target.name === "preferred_contact_method") clearError(form.elements.phone);
    });
    dialog.addEventListener("keydown", trap);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !root.hidden) { e.preventDefault(); close(); } });
  }

  function form() { return root.querySelector("form"); }
  function val(name) { var el = form().elements[name]; return el ? String(el.value || "").trim() : ""; }

  function setError(name, msg) {
    var p = root.querySelector("#fr-" + name + "-error");
    if (p) { p.textContent = msg; p.hidden = false; }
    var el = form().elements[name];
    if (el && el.setAttribute && el.type !== "radio") el.setAttribute("aria-invalid", "true");
    var f = root.querySelector('[data-field="' + name + '"]'); if (f) f.classList.add("fr-invalid");
  }
  function clearError(el) {
    if (!el || !el.name) return;
    var p = root.querySelector("#fr-" + el.name + "-error");
    if (p) { p.hidden = true; p.textContent = ""; }
    if (el.removeAttribute) el.removeAttribute("aria-invalid");
    var f = root.querySelector('[data-field="' + el.name + '"]'); if (f) f.classList.remove("fr-invalid");
  }
  function focusFirstInvalid() {
    var f = root.querySelector(".fr-invalid:not([hidden]) input, .fr-invalid:not([hidden]) select, .fr-invalid:not([hidden]) textarea");
    var visible = Array.prototype.filter.call(root.querySelectorAll(".fr-invalid"), function (n) { return !n.closest("[hidden]"); })[0];
    var target = visible && visible.querySelector("input, select, textarea");
    if (target) target.focus(); else if (f) f.focus();
  }

  function validateStep(n) {
    var ok = true, f = form();
    Array.prototype.forEach.call(root.querySelectorAll('[data-step="' + n + '"] [name]'), clearError);
    function bad(name, msg) { setError(name, msg); ok = false; }
    if (n === 1) {
      if (!val("contact_name")) bad("contact_name", "Enter your name.");
      if (!val("company_name")) bad("company_name", "Enter your company name.");
      var em = val("email");
      if (!em) bad("email", "Enter your work email.");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) bad("email", "Enter a valid email address.");
      var m = f.querySelector('input[name="preferred_contact_method"]:checked');
      var method = m ? m.value : "no_preference";
      if ((method === "phone_call" || method === "text_message") && !val("phone")) bad("phone", "Add a phone number so we can reach you that way.");
      if (val("phone") && val("phone").replace(/\D/g, "").length < 7) bad("phone", "Enter a valid phone number.");
    } else {
      if (!val("offerings")) bad("offerings", "Tell us what you sell or provide.");
      if (!val("service_area")) bad("service_area", "Tell us where you sell or provide services.");
      if (!val("cooperative_status")) bad("cooperative_status", "Choose your current cooperative status.");
      if (!val("primary_obstacle")) bad("primary_obstacle", "Choose your biggest obstacle.");
      if (!f.elements.consent_to_contact.checked) bad("consent_to_contact", "Please confirm you want us to contact you.");
    }
    if (!ok) focusFirstInvalid();
    return ok;
  }

  function showStep(n) {
    step = n;
    root.querySelector('[data-step="1"]').hidden = n !== 1;
    root.querySelector('[data-step="2"]').hidden = n !== 2;
    root.querySelector("#fr-progress").textContent = "Step " + n + " of 2";
    root.querySelector("#fr-back").hidden = n === 1;
    root.querySelector("#fr-next").hidden = n === 2;
    root.querySelector("#fr-submit").hidden = n === 1;
    root.querySelector("#fr-submit-note").hidden = n === 1;
    root.querySelector("#fr-fail").hidden = true;
    root.querySelector(".fr-body").scrollTop = 0;
    if (n === 2) loadTurnstile();
    var first = root.querySelector('[data-step="' + n + '"] input:not([type=radio]), [data-step="' + n + '"] textarea');
    if (first) first.focus();
  }

  function payload() {
    var f = form(), p = {};
    ["contact_name", "company_name", "email", "phone", "company_website", "offerings", "service_area", "cooperative_status", "target_invitation", "primary_obstacle", "additional_notes"].forEach(function (k) { p[k] = val(k); });
    var m = f.querySelector('input[name="preferred_contact_method"]:checked');
    p.preferred_contact_method = m ? m.value : "no_preference";
    p.cooperative_interests = Array.prototype.map.call(f.querySelectorAll('input[name="cooperative_interests"]:checked'), function (c) { return c.value; });
    p.consent_to_contact = f.elements.consent_to_contact.checked === true;
    p.company_fax = f.elements.company_fax.value;
    p.idempotency_key = idemKey;
    p.source_page_path = location.pathname;
    p.referrer = document.referrer || "";
    var q = new URLSearchParams(location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) { p[k] = q.get(k) || ""; });
    if (TURNSTILE_SITE_KEY) p.turnstile_token = turnstileToken;
    return p;
  }

  function submit() {
    if (submitting) return;
    if (!validateStep(1)) { showStep(1); validateStep(1); return; }
    if (!validateStep(2)) return;
    submitting = true; retryKey = true;
    var btn = root.querySelector("#fr-submit");
    btn.disabled = true; btn.textContent = "Sending...";
    root.querySelector("#fr-fail").hidden = true;
    fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload()) })
      .then(function (res) { return res.json().catch(function () { return {}; }).then(function (b) { return { status: res.status, body: b }; }); })
      .then(function (r) {
        if ((r.status === 201 || r.status === 409) && r.body && r.body.reference_code) { success(r.body.reference_code); return; }
        resetTurnstile();
        if (r.status === 400 && r.body && r.body.errors && r.body.errors.form) { failure(); return; }
        if (r.status === 400 && r.body && r.body.errors) {
          var firstStep = 2;
          Object.keys(r.body.errors).forEach(function (k) {
            if (["contact_name", "company_name", "email", "phone", "preferred_contact_method", "company_website"].indexOf(k) > -1) firstStep = 1;
            setError(k, r.body.errors[k]);
          });
          showStep(firstStep); focusFirstInvalid();
          return;
        }
        failure();
      })
      .catch(function () { resetTurnstile(); failure(); })
      .then(function () { submitting = false; btn.disabled = false; btn.textContent = root.querySelector("#fr-fail").hidden ? "Request Fit Review" : "Try Again"; });
  }
  function failure() {
    var fail = root.querySelector("#fr-fail"); fail.hidden = false;
    root.querySelector(".fr-body").scrollTop = root.querySelector(".fr-body").scrollHeight;
  }
  function success(code) {
    sent = true;
    root.querySelector("form").hidden = true;
    root.querySelector("#fr-ref").textContent = code;
    var d = root.querySelector("#fr-done"); d.hidden = false;
    root.querySelector("#fr-progress").textContent = "";
    root.querySelector("#fr-sub").hidden = true;
    root.querySelector("#fr-done-title").focus();
  }
  function reset() {
    var f = form(); f.reset(); f.hidden = false;
    root.querySelector("#fr-done").hidden = true;
    root.querySelector("#fr-sub").hidden = false;
    Array.prototype.forEach.call(root.querySelectorAll(".fr-error"), function (p) { p.hidden = true; p.textContent = ""; });
    Array.prototype.forEach.call(root.querySelectorAll(".fr-invalid"), function (n) { n.classList.remove("fr-invalid"); });
    sent = false; retryKey = false; idemKey = null;
    var b = root.querySelector("#fr-submit"); b.textContent = "Request Fit Review"; b.disabled = false;
    showStep(1);
  }

  function focusables() {
    return Array.prototype.filter.call(dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select, textarea, [tabindex]:not([tabindex="-1"])'), function (n) {
      return !n.closest("[hidden]") && n.offsetParent !== null;
    });
  }
  function trap(e) {
    if (e.key !== "Tab") return;
    var f = focusables(); if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open(from) {
    if (!root) build();
    if (!root.hidden) return;
    opener = from || document.activeElement;
    if (!retryKey || !idemKey) idemKey = uuid();
    var scrollY = window.scrollY;
    root.hidden = false;
    document.documentElement.classList.add("fr-lock");
    inerted = [];
    Array.prototype.forEach.call(document.body.children, function (n) {
      if (n !== root && n.tagName !== "SCRIPT" && !n.hasAttribute("inert")) { n.setAttribute("inert", ""); inerted.push(n); }
    });
    window.scrollTo(0, scrollY);
    if (!sent) showStep(step); else dialog.focus();
    loadTurnstile();
  }
  function loadTurnstile() {
    if (!TURNSTILE_SITE_KEY) return;
    function draw() {
      if (tsWidget !== null || !window.turnstile || step !== 2) return;
      tsWidget = window.turnstile.render("#fr-turnstile", {
        sitekey: TURNSTILE_SITE_KEY, action: "fit-review",
        callback: function (t) { turnstileToken = t; },
        "expired-callback": function () { turnstileToken = ""; },
        "error-callback": function () { turnstileToken = ""; }
      });
    }
    if (window.turnstile) { draw(); return; }
    if (document.getElementById("fr-turnstile-api")) return;
    var sc = document.createElement("script");
    sc.id = "fr-turnstile-api"; sc.async = true; sc.defer = true;
    sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    sc.onload = draw;
    document.head.appendChild(sc);
  }
  function resetTurnstile() {
    turnstileToken = "";
    if (window.turnstile && tsWidget !== null) { try { window.turnstile.reset(tsWidget); } catch (e) { /* widget gone */ } }
  }
  function close() {
    if (!root || root.hidden) return;
    root.hidden = true;
    document.documentElement.classList.remove("fr-lock");
    inerted.forEach(function (n) { n.removeAttribute("inert"); });
    inerted = [];
    if (location.hash === "#fit-review") history.replaceState(null, "", location.pathname + location.search);
    var back = [opener, document.getElementById("navToggle"), document.querySelector("[data-fit-review-open]")];
    for (var i = 0; i < back.length; i++) {
      if (back[i] && document.contains(back[i]) && back[i].focus) { back[i].focus(); if (document.activeElement === back[i]) break; }
    }
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-fit-review-open]");
    if (!a) return;
    e.preventDefault();
    open(a);
  });
  function fromHash() { if (location.hash === "#fit-review") open(null); }
  window.addEventListener("hashchange", fromHash);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fromHash); else fromHash();
})();
