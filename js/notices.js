/* Accessibility statement (floating icon + dialog) and cookie notice (banner + dialog).
   Loaded on every public page. No tracking: the notice only remembers that it was acknowledged. */
(function () {
  var KEY = "tcp_cookie_notice";
  var UPDATED = "November 5, 2026";

  var A11Y_HTML =
    '<h2 id="a11y-title">Accessibility Statement</h2>' +
    "<p>Tejas Cooperative Partners wants this website to be usable by everyone, including people who use screen readers, keyboards, voice control, magnification, or other assistive technology.</p>" +
    "<h3>Our goal</h3>" +
    "<p>We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA. We have not yet had an independent accessibility audit, so we do not claim full conformance.</p>" +
    "<h3>What we do</h3>" +
    "<ul>" +
    "<li>Use semantic page structure, headings, and landmarks so assistive technology can navigate the site.</li>" +
    "<li>Support keyboard navigation, including the menus and this dialog, with visible focus indicators.</li>" +
    "<li>Keep text and background colors at readable contrast levels.</li>" +
    "<li>Provide text alternatives for meaningful images, and respect the reduced-motion setting on your device.</li>" +
    "<li>Let text be resized and the page be zoomed without losing content.</li>" +
    "</ul>" +
    "<h3>Known limitations</h3>" +
    "<p>Images and formatting in blog posts are added by our team and may occasionally miss an alternative description. Third-party content we link to, including cooperative websites, is outside our control.</p>" +
    '<h3>Tell us about a problem</h3>' +
    '<p>If something on this site is hard to use, tell us and we will work to fix it or give you the information another way. Reach Tony or Chris directly, or use the <a href="/#contact">contact section</a>. Please say which page you were on and what kind of assistive technology you use.</p>' +
    '<p class="notice-meta">Last updated ' + UPDATED + ".</p>";

  var COOKIE_HTML =
    '<h2 id="cookie-title">Cookie Notice</h2>' +
    "<p>This website does not use advertising, tracking, or analytics cookies, and it does not sell or share visitor data.</p>" +
    "<h3>What may be stored</h3>" +
    "<ul>" +
    "<li><strong>This notice.</strong> Your browser remembers that you acknowledged it, so we do not ask again. It stays on your device and is not sent to us.</li>" +
    "<li><strong>Sign-in cookies.</strong> If you sign in to the client portal or the blog editor, a strictly necessary session cookie keeps you signed in. It is used only for that purpose.</li>" +
    "</ul>" +
    "<h3>Third-party fonts</h3>" +
    "<p>Our pages load fonts from Google Fonts. When a page loads, Google receives your IP address and browser details in order to deliver the fonts. We do not control what Google does with that information; see Google's privacy policy for details.</p>" +
    "<h3>Your choices</h3>" +
    "<p>You can delete or block cookies in your browser settings. Blocking sign-in cookies will prevent you from signing in.</p>" +
    '<p class="notice-meta">Last updated ' + UPDATED + ".</p>";

  var ICON =
    '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false">' +
    '<circle cx="12" cy="4.2" r="2.2" fill="currentColor"/>' +
    '<path d="M4 8.2c0-.6.5-1 1-1h14c.6 0 1 .4 1 1s-.4 1-1 1h-4.6v3.1l2.1 6.9c.2.6-.1 1.2-.7 1.4-.6.2-1.2-.1-1.4-.7L12 14.6l-1.4 5.3c-.2.6-.8.9-1.4.7-.6-.2-.9-.8-.7-1.4l2.1-6.9V9.2H6c-.6 0-1-.4-1-1z" fill="currentColor"/></svg>';

  function el(html) {
    var t = document.createElement("div");
    t.innerHTML = html.trim();
    return t.firstChild;
  }

  function makeDialog(id, titleId, body) {
    var d = el(
      '<dialog class="notice-dialog" id="' + id + '" aria-labelledby="' + titleId + '">' +
        '<div class="notice-dialog-inner">' + body +
        '<div class="notice-dialog-actions"><button type="button" class="notice-btn" data-close>Close</button></div>' +
        "</div></dialog>"
    );
    d.addEventListener("click", function (e) {
      if (e.target === d || (e.target.closest && e.target.closest("[data-close]"))) d.close();
    });
    d.addEventListener("close", function () {
      if (d._opener && document.body.contains(d._opener)) d._opener.focus();
    });
    return d;
  }

  function init() {
    var a11yDialog = makeDialog("a11y-dialog", "a11y-title", A11Y_HTML);
    var cookieDialog = makeDialog("cookie-dialog", "cookie-title", COOKIE_HTML);

    var fab = el(
      '<button type="button" class="a11y-fab" aria-label="Accessibility statement" title="Accessibility statement" aria-haspopup="dialog">' + ICON + "</button>"
    );

    var banner = el(
      '<div class="cookie-notice" role="region" aria-label="Cookie notice" hidden>' +
        '<p class="cookie-notice-label">Cookie Notice</p>' +
        "<p>We do not use advertising or tracking cookies. Only essential cookies are used, such as keeping you signed in to the portal. " +
        '<button type="button" class="notice-link" data-open="cookie">Read the full notice</button>.</p>' +
        '<div class="cookie-notice-actions"><button type="button" class="notice-btn notice-btn-primary" data-ack>Got it</button></div>' +
        "</div>"
    );

    document.body.appendChild(a11yDialog);
    document.body.appendChild(cookieDialog);
    document.body.appendChild(fab);
    document.body.appendChild(banner);

    function open(which, opener) {
      var d = which === "a11y" ? a11yDialog : cookieDialog;
      d._opener = opener || null;
      if (typeof d.showModal === "function") d.showModal();
      else d.setAttribute("open", "");
    }

    var seen = false;
    try { seen = !!localStorage.getItem(KEY); } catch (e) {}
    if (!seen) banner.hidden = false;

    banner.querySelector("[data-ack]").addEventListener("click", function () {
      try { localStorage.setItem(KEY, "acknowledged"); } catch (e) {}
      banner.hidden = true;
      fab.focus();
    });

    fab.addEventListener("click", function () { open("a11y", fab); });
    document.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("[data-open]");
      if (t) { e.preventDefault(); open(t.getAttribute("data-open"), t); }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
