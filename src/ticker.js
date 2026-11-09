// Homepage solicitation ticker: fetched server-side (cached ~1 hour at the edge) and injected under the stats band.
// Any failure, empty list, or stale feed means no band at all: the page is served exactly as the static file.

const FEED = "https://portal.tejascooperative.com/api/public/solicitation-ticker";
const MAX_AGE_MS = 48 * 60 * 60 * 1000;
const TITLE_MAX = 34;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function chicagoParts(d) {
  const f = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", year: "numeric" });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  return p;
}

function dueLabel(due, now) {
  const d = chicagoParts(due);
  const n = chicagoParts(now);
  return `Due ${d.month} ${d.day}${d.year !== n.year ? ", " + d.year : ""}`;
}

function trunc(t) {
  const s = String(t).trim();
  return s.length > TITLE_MAX ? s.slice(0, TITLE_MAX - 1).trimEnd() + "…" : s;
}

export async function loadTicker() {
  try {
    const res = await fetch(FEED, { cf: { cacheTtl: 3600, cacheEverything: true } });
    if (!res.ok) return null;
    const feed = await res.json();
    const now = new Date();
    const gen = Date.parse(feed.generated_at);
    if (!Number.isFinite(gen) || now.getTime() - gen > MAX_AGE_MS) return null;
    const items = (Array.isArray(feed.items) ? feed.items : [])
      .filter((i) => i && i.cooperative && i.number && i.title && Date.parse(i.due_at) > now.getTime());
    if (!items.length) return null;
    const list = items
      .map((i) => `<li><span class="tk-coop">${esc(i.cooperative)}</span> ${esc(i.number)} · ${esc(trunc(i.title))} · ${esc(dueLabel(new Date(i.due_at), now))}</li>`)
      .join("");
    return `<section class="ticker-band" aria-label="Latest cooperative solicitations Tejas Cooperative Partners is tracking">
  <div class="ticker-inner">
    <p class="ticker-label" aria-hidden="true">Solicitations we are tracking</p>
    <div class="ticker-viewport" tabindex="0" role="group" aria-label="Solicitation list">
      <div class="ticker-track" data-ticker-track>
        <ul class="ticker-list">${list}</ul>
        <ul class="ticker-list ticker-dup" aria-hidden="true">${list}</ul>
      </div>
    </div>
  </div>
</section>
<script src="/js/ticker.js" defer></script>`;
  } catch {
    return null;
  }
}

// The homepage body now varies with the feed, so the static asset's validators must not let a browser
// revalidate to a stale copy (a 304 would resurrect an old ticker, or none). Always send a full response.
export async function homeWithTicker(request, env) {
  const headers = new Headers(request.headers);
  headers.delete("if-none-match");
  headers.delete("if-modified-since");
  const asset = await env.ASSETS.fetch(new Request(request, { headers }));
  const html = asset.ok ? await loadTicker() : null;
  const res = html
    ? new HTMLRewriter()
        .on("section.stats-band", { element(el) { el.onEndTag((end) => end.after(html, { html: true })); } })
        .transform(asset)
    : new Response(asset.body, asset);
  res.headers.delete("etag");
  res.headers.delete("last-modified");
  res.headers.set("Cache-Control", "no-cache");
  return res;
}
