// Sets the ticker's scroll duration from its rendered width (~48 px/s) so longer lists do not move faster.
(function () {
  var track = document.querySelector("[data-ticker-track]");
  if (!track) return;
  function size() {
    var first = track.querySelector(".ticker-list");
    if (!first) return;
    var w = first.getBoundingClientRect().width;
    var secs = Math.min(90, Math.max(60, w / 48));
    track.style.setProperty("--ticker-duration", secs.toFixed(1) + "s");
  }
  size();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
})();
