(function () {
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");
  var menus = Array.prototype.slice.call(document.querySelectorAll(".has-menu"));

  function closeMenus(except) {
    menus.forEach(function (m) {
      if (m !== except) {
        m.classList.remove("open");
        var b = m.querySelector(".menu-btn");
        if (b) b.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (!open) closeMenus();
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        closeMenus();
      }
    });
  }

  menus.forEach(function (m) {
    var btn = m.querySelector(".menu-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var open = !m.classList.contains("open");
      closeMenus(m);
      m.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest || !e.target.closest(".has-menu")) closeMenus();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMenus();
      if (nav && nav.classList.contains("open") && window.innerWidth > 1080) nav.classList.remove("open");
    }
  });

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
