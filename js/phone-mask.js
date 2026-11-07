/* Phone mask for every public form. Formats a US number as it is typed: (661) 596-6450.
   Mirrors src/lib/format/phone.ts in the platform repo (same cases, same tests there). The mask is display only:
   forms send TejasPhone.storage(value), which is digits. Loaded by js/fit-review.js, which is on every public page. */
(function () {
  "use strict";
  if (window.TejasPhone) return;
  var INTL = /^\s*\+(?!1\b|1[\s\d(.-])/, EXT = /[xX#]|ext/i;
  function passthrough(s) { return INTL.test(s) || EXT.test(s); }
  function digits(raw) {
    var d = String(raw == null ? "" : raw).replace(/\D/g, "");
    if (d.charAt(0) === "1") d = d.slice(1);
    return d.slice(0, 10);
  }
  function format(raw) {
    var s = String(raw == null ? "" : raw);
    if (passthrough(s)) return s;
    var d = digits(s);
    if (!d) return "";
    if (d.length <= 3) return "(" + d;
    if (d.length <= 6) return "(" + d.slice(0, 3) + ") " + d.slice(3);
    return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
  }
  function storage(raw) { var s = String(raw == null ? "" : raw); return passthrough(s) ? s.trim() : digits(s); }
  window.TejasPhone = { format: format, storage: storage };
  function isPhone(el) { return el && el.tagName === "INPUT" && el.type === "tel" && el.name === "phone"; }
  document.addEventListener("input", function (e) {
    var el = e.target;
    if (!isPhone(el)) return;
    var next = format(el.value);
    if (next !== el.value) el.value = next;
  });
})();
