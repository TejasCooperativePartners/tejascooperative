/* Beta questionnaire modal. Any [data-beta-cta] link opens the portal questionnaire (embed mode) in a dialog.
   Without JavaScript the link goes to the full questionnaire page. */
(function () {
  "use strict";
  var root, frame, opener;
  function build() {
    root = document.createElement("div");
    root.className = "bm-root";
    root.hidden = true;
    root.innerHTML =
      '<div class="bm-backdrop" data-bm-close></div>' +
      '<div class="bm-dialog" role="dialog" aria-modal="true" aria-label="Beta seat questionnaire" tabindex="-1">' +
      '<div class="bm-head"><p>Request a beta seat</p><button type="button" class="bm-x" data-bm-close aria-label="Close the questionnaire">&times;</button></div>' +
      '<iframe class="bm-frame" title="Beta seat questionnaire"></iframe></div>';
    document.body.appendChild(root);
    frame = root.querySelector("iframe");
    root.addEventListener("click", function (e) { if (e.target.closest("[data-bm-close]")) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !root.hidden) close(); });
  }
  function embedUrl(href) {
    var u = new URL(href);
    u.searchParams.set("embed", "1");
    return u.toString();
  }
  function open(a) {
    if (!root) build();
    opener = a;
    frame.src = embedUrl(a.href);
    root.hidden = false;
    document.documentElement.classList.add("bm-lock");
    root.querySelector(".bm-dialog").focus();
  }
  function close() {
    root.hidden = true;
    frame.src = "about:blank";
    document.documentElement.classList.remove("bm-lock");
    if (opener) opener.focus();
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-beta-cta]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault();
    open(a);
  });
})();
