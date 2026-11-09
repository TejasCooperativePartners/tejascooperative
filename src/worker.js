import { homeWithTicker } from "./ticker.js";
/**
 * Tejas Cooperative Partners website Worker.
 *
 *  /blog, /blog/<slug>   server-rendered from Supabase table blog_posts (published rows)
 *  /blog/admin*          password-protected post editor (see README)
 *  /sitemap.xml          generated: static pages + published posts
 *  everything else       static assets
 *
 * Secrets (wrangler secret put): ADMIN_PASSWORD, SESSION_SECRET, SUPABASE_SECRET_KEY.
 */
import {
  SITE_ORIGIN, SITE_NAME, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, DEFAULT_OG_IMAGE,
} from "./config.js";
import { HEADER_HTML, FOOTER_HTML } from "./chrome.js";
import { CONTACT_PAGE, PRIVACY_PAGE, TERMS_PAGE } from "./pages.js";
import adminHtml from "./templates/blog-admin.html";
import adminLoginHtml from "./templates/blog-admin-login.html";

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const POST_FIELDS = [
  "slug", "title", "content", "excerpt", "featured_image_url",
  "meta_title", "meta_description", "status", "tags", "published_at",
];
const STATIC_PAGES = [
  { loc: "/", changefreq: "monthly", priority: "1.0" },
  { loc: "/contact", changefreq: "yearly", priority: "0.6" },
  { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
  { loc: "/terms", changefreq: "yearly", priority: "0.3" },
];
const BLOG_DESCRIPTION =
  "Practical guidance on cooperative purchasing contracts for Texas vendors: BuyBoard, TIPS, and other cooperatives, proposal strategy, and renewals.";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/blog/admin" || path.startsWith("/blog/admin/")) return handleAdmin(request, env, url);
    if (path === "/sitemap.xml") return renderSitemap();
    if (path === "/blog" || path === "/blog/") return renderBlogIndex();
    const info = INFO_PAGES[path.replace(/\/$/, "")];
    if (info) return renderInfoPage(info);
    if (path.startsWith("/blog/")) {
      const slug = decodeURIComponent(path.slice("/blog/".length).replace(/\/$/, ""));
      return renderBlogPost(slug);
    }
    if (path === "/" || path === "/index.html") return homeWithTicker(request, env);
    return env.ASSETS.fetch(request);
  },
};

const INFO_PAGES = {
  "/contact": { ...CONTACT_PAGE, scripts: '<script src="/js/contact.js" defer></script>' },
  "/privacy": PRIVACY_PAGE,
  "/terms": TERMS_PAGE,
};

function renderInfoPage(p) {
  return htmlResponse(
    page({
      title: `${p.title} | ${SITE_NAME}`,
      description: p.description,
      canonical: `${SITE_ORIGIN}${p.path}`,
      body: p.body,
      scripts: p.scripts || "",
    }),
  );
}

/* ───────── helpers ───────── */

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }) : "";

const htmlResponse = (html, status = 200) =>
  new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=0, must-revalidate" },
  });

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...headers } });

function page({ title, description, canonical, ogType = "website", ogImage = DEFAULT_OG_IMAGE, jsonLd, body, robots, scripts = "" }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-2MWELBN2Q3"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
try { if (localStorage.getItem('tcp_analytics_consent') === 'granted') gtag('consent', 'update', {analytics_storage: 'granted'}); } catch (e) {}
gtag('js', new Date());
gtag('config', 'G-2MWELBN2Q3');
</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
${robots ? `<meta name="robots" content="${robots}">` : '<meta name="robots" content="index, follow">'}
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0e2a47">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="icon" href="/favicon-16.png" type="image/png" sizes="16x16">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>` : ""}
</head>
<body>
${HEADER_HTML}
<main>
${body}
</main>
${FOOTER_HTML}
<script src="/script.js"></script>
<script src="/js/fit-review.js"></script>
<script src="/js/notices.js" defer></script>
${scripts}
<script src="https://portal.tradecallpro.co/embed/charlie-widget.js" data-token="a2fdaa0c-6a99-487e-9f52-5d9297ef9674"></script>
</body>
</html>`;
}

/* ───────── Supabase (public, publishable key) ───────── */

const publicHeaders = { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` };

async function fetchPosts(fields) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/blog_posts?status=eq.published&order=published_at.desc.nullslast,created_at.desc&select=${fields}`,
    { headers: publicHeaders },
  );
  if (!res.ok) throw new Error(`posts ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("unexpected shape");
  return data;
}

async function fetchPost(slug) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`,
    { headers: publicHeaders },
  );
  if (!res.ok) throw new Error(`post ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data[0] || null : null;
}

/* ───────── public pages ───────── */

function card(post) {
  const img = post.featured_image_url
    ? `<img src="${esc(post.featured_image_url)}" alt="" class="blog-card-img" loading="lazy">`
    : `<div class="blog-card-img-placeholder" aria-hidden="true"></div>`;
  const tags = post.tags?.length
    ? `<div class="blog-card-tags">${post.tags.slice(0, 3).map((t) => `<span class="blog-tag">${esc(t)}</span>`).join("")}</div>`
    : "";
  return `<a href="/blog/${encodeURIComponent(post.slug)}" class="blog-card-link">
  <article class="blog-card">
    ${img}
    <div class="blog-card-body">
      ${tags}
      <h2>${esc(post.title)}</h2>
      ${post.excerpt ? `<p>${esc(post.excerpt)}</p>` : ""}
      <div class="blog-card-meta">${esc(fmtDate(post.published_at || post.created_at))}</div>
    </div>
  </article>
</a>`;
}

async function renderBlogIndex() {
  let posts;
  try {
    posts = await fetchPosts("slug,title,excerpt,featured_image_url,tags,published_at,created_at");
  } catch {
    return htmlResponse(
      unavailablePage("The blog is temporarily unavailable", "Please try again in a few minutes."),
      503,
    );
  }
  const body = `<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Insights</p>
    <h1>The Tejas Cooperative Blog</h1>
    <p class="lede">Practical guidance on cooperative purchasing contracts for Texas vendors: how awards work, how proposals are won, and how to keep a contract in force.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="blog-grid">
      ${posts.length ? posts.map(card).join("\n") : '<p class="blog-empty">No posts yet. Check back soon.</p>'}
    </div>
  </div>
</section>`;
  return htmlResponse(
    page({
      title: `Blog | ${SITE_NAME}`,
      description: BLOG_DESCRIPTION,
      canonical: `${SITE_ORIGIN}/blog`,
      body,
    }),
  );
}

function pickRelated(all, post) {
  const tags = new Set(post.tags || []);
  return all
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ p, score: (p.tags || []).filter((t) => tags.has(t)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.p);
}

// Post content is authored by the site operator (admin editor or Supabase), so it is trusted HTML.
// Plain text with blank-line paragraph breaks is wrapped in <p> tags.
function formatContent(content) {
  if (/<\/?[a-z][\s\S]*>/i.test(content)) return content;
  return content.split(/\n{2,}/).map((p) => `<p>${esc(p.trim()).replace(/\n/g, "<br>")}</p>`).join("\n");
}

async function renderBlogPost(slug) {
  let post;
  try {
    post = await fetchPost(slug);
  } catch {
    return htmlResponse(unavailablePage("This post is temporarily unavailable", "Please try again in a few minutes."), 503);
  }
  if (!post) return htmlResponse(notFoundPage(), 404);

  let related = [];
  try {
    related = pickRelated(await fetchPosts("slug,title,excerpt,featured_image_url,tags,published_at,created_at"), post);
  } catch {
    /* related links are optional */
  }

  const canonical = `${SITE_ORIGIN}/blog/${encodeURIComponent(post.slug)}`;
  const baseTitle = (post.meta_title || post.title).replace(/\s*\|\s*Tejas Cooperative(?: Partners)?\s*$/i, "").trim();
  const description = post.meta_description || post.excerpt || BLOG_DESCRIPTION;
  const image = post.featured_image_url || DEFAULT_OG_IMAGE;
  const published = post.published_at || post.created_at;

  const body = `<article>
<section class="page-hero">
  <div class="wrap" style="max-width:820px">
    <a class="back-link" href="/blog">&larr; All posts</a>
    ${post.tags?.length ? `<div class="blog-card-tags" style="margin-bottom:14px">${post.tags.map((t) => `<span class="blog-tag">${esc(t)}</span>`).join("")}</div>` : ""}
    <h1>${esc(post.title)}</h1>
    <p class="post-meta">${esc(fmtDate(published))}</p>
  </div>
</section>
${post.featured_image_url ? `<div class="post-hero-image"><img src="${esc(post.featured_image_url)}" alt=""></div>` : ""}
<div class="article-body">
${formatContent(post.content || "")}
</div>
<div class="post-cta">
  <div class="post-cta-box">
    <h2>Thinking about a cooperative contract?</h2>
    <p>Start with a fit review. We check your category, your current cooperative status, and the next opening on the calendar.</p>
    <a class="btn btn-primary" href="/#fit-review" data-fit-review-open>Start a Conversation</a>
  </div>
</div>
</article>
${related.length ? `<section class="related"><div class="wrap"><h2>Related reading</h2><div class="blog-grid">${related.map(card).join("\n")}</div></div></section>` : ""}`;

  return htmlResponse(
    page({
      title: `${baseTitle} | ${SITE_NAME}`,
      description,
      canonical,
      ogType: "article",
      ogImage: image,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description,
        image,
        datePublished: published,
        dateModified: post.updated_at || published,
        mainEntityOfPage: canonical,
        author: { "@type": "Organization", name: SITE_NAME, url: SITE_ORIGIN },
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_ORIGIN },
      },
      body,
    }),
  );
}

function notFoundPage() {
  return page({
    title: `Post not found | ${SITE_NAME}`,
    description: "That post could not be found.",
    canonical: `${SITE_ORIGIN}/blog`,
    robots: "noindex",
    body: `<section class="not-found"><h1>That post could not be found</h1><p>It may have moved or been unpublished.</p><a class="btn btn-primary" href="/blog">Back to the blog</a></section>`,
  });
}

function unavailablePage(title, message) {
  return page({
    title: `${title} | ${SITE_NAME}`,
    description: message,
    canonical: `${SITE_ORIGIN}/blog`,
    robots: "noindex",
    body: `<section class="not-found"><h1>${esc(title)}</h1><p>${esc(message)}</p><a class="btn btn-primary" href="/">Go to the home page</a></section>`,
  });
}

async function renderSitemap() {
  let posts = [];
  try {
    posts = await fetchPosts("slug,updated_at,published_at,created_at");
  } catch {
    /* serve static entries only */
  }
  const entries = [
    ...STATIC_PAGES,
    { loc: "/blog", changefreq: "weekly", priority: "0.8" },
    ...posts.map((p) => ({
      loc: `/blog/${encodeURIComponent(p.slug)}`,
      lastmod: (p.updated_at || p.published_at || p.created_at || "").slice(0, 10),
      changefreq: "monthly",
      priority: "0.6",
    })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) =>
      `  <url><loc>${SITE_ORIGIN}${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}<changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`,
  )
  .join("\n")}
</urlset>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=UTF-8", "Cache-Control": "public, max-age=0, must-revalidate" },
  });
}

/* ───────── admin: auth ───────── */

const enc = new TextEncoder();
const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

async function sha256Hex(text) {
  return toHex(await crypto.subtle.digest("SHA-256", enc.encode(text)));
}

async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", key, enc.encode(message)));
}

function timingSafeEqualHex(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const sessionCookie = async (env, secure) => {
  const expiry = String(Date.now() + SESSION_TTL_MS);
  const sig = await hmacHex(env.SESSION_SECRET, expiry);
  return `admin_session=${expiry}.${sig}; HttpOnly; SameSite=Strict; Path=/blog/admin; Max-Age=${SESSION_TTL_MS / 1000}${secure ? "; Secure" : ""}`;
};
const clearCookie = (secure) =>
  `admin_session=; HttpOnly; SameSite=Strict; Path=/blog/admin; Max-Age=0${secure ? "; Secure" : ""}`;

async function isAuthed(request, env) {
  if (!env.SESSION_SECRET) return false;
  const match = (request.headers.get("Cookie") || "").match(/(?:^|;\s*)admin_session=([^;]+)/);
  if (!match) return false;
  const [expiryStr, sig] = match[1].split(".");
  if (!expiryStr || !sig) return false;
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;
  return timingSafeEqualHex(sig, await hmacHex(env.SESSION_SECRET, expiryStr));
}

async function passwordOk(candidate, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const [a, b] = await Promise.all([sha256Hex(candidate || ""), sha256Hex(env.ADMIN_PASSWORD)]);
  return timingSafeEqualHex(a, b);
}

const adminPage = (html) =>
  new Response(html, {
    headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });

async function handleAdmin(request, env, url) {
  const path = url.pathname.replace(/\/$/, "");
  const secure = url.protocol === "https:";

  if (path === "/blog/admin/login" && request.method === "GET") return adminPage(adminLoginHtml);

  if (path === "/blog/admin/api/login" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    if (!(await passwordOk(body.password, env)) || !env.SESSION_SECRET) {
      await new Promise((r) => setTimeout(r, 400));
      return json({ error: "Incorrect password" }, 401);
    }
    return json({ ok: true }, 200, { "Set-Cookie": await sessionCookie(env, secure) });
  }

  if (path === "/blog/admin/api/logout" && request.method === "POST") {
    return new Response(null, { status: 204, headers: { "Set-Cookie": clearCookie(secure) } });
  }

  const authed = await isAuthed(request, env);

  if (path === "/blog/admin") {
    if (!authed) return Response.redirect(new URL("/blog/admin/login", url.origin).toString(), 302);
    return adminPage(adminHtml);
  }

  if (path.startsWith("/blog/admin/api/")) {
    if (!authed) return json({ error: "Unauthorized" }, 401);
    return adminApi(request, env, path);
  }
  return new Response("Not found", { status: 404 });
}

/* ───────── admin: Supabase proxy (secret key, server side only) ───────── */

const secretHeaders = (env, extra = {}) => ({ apikey: env.SUPABASE_SECRET_KEY, ...extra });

// A failure past the auth check is an upstream problem; never forward 401/403 or the client
// would treat it as an expired admin session.
const upstream = (status) => (status >= 200 && status < 300 ? status : 502);

function cleanPayload(body) {
  const out = {};
  for (const k of POST_FIELDS) if (body[k] !== undefined) out[k] = body[k];
  return out;
}

async function adminApi(request, env, path) {
  const m = request.method;
  const rest = `${SUPABASE_URL}/rest/v1/blog_posts`;
  const jsonHeaders = secretHeaders(env, { "Content-Type": "application/json", Prefer: "return=representation" });

  if (path === "/blog/admin/api/posts") {
    if (m === "GET") {
      const res = await fetch(`${rest}?select=*&order=created_at.desc`, { headers: secretHeaders(env) });
      return json(await res.json().catch(() => ({})), upstream(res.status));
    }
    if (m === "POST") {
      const payload = cleanPayload(await request.json().catch(() => ({})));
      if (payload.status === "published" && !payload.published_at) payload.published_at = new Date().toISOString();
      const res = await fetch(rest, { method: "POST", headers: jsonHeaders, body: JSON.stringify(payload) });
      return json(await res.json().catch(() => ({})), upstream(res.status));
    }
  }

  const one = path.match(/^\/blog\/admin\/api\/posts\/([0-9a-f-]{36})$/i);
  if (one) {
    const id = encodeURIComponent(one[1]);
    if (m === "GET") {
      const res = await fetch(`${rest}?id=eq.${id}&select=*&limit=1`, { headers: secretHeaders(env) });
      const data = await res.json().catch(() => ({}));
      return json(res.ok ? data[0] || null : data, upstream(res.status));
    }
    if (m === "PUT") {
      const payload = cleanPayload(await request.json().catch(() => ({})));
      payload.updated_at = new Date().toISOString();
      if (payload.status === "published" && !payload.published_at) payload.published_at = new Date().toISOString();
      const res = await fetch(`${rest}?id=eq.${id}`, { method: "PATCH", headers: jsonHeaders, body: JSON.stringify(payload) });
      return json(await res.json().catch(() => ({})), upstream(res.status));
    }
    if (m === "DELETE") {
      const res = await fetch(`${rest}?id=eq.${id}`, { method: "DELETE", headers: secretHeaders(env) });
      if (!res.ok) return json({ error: await res.text() }, upstream(res.status));
      return new Response(null, { status: 204 });
    }
  }

  if (path === "/blog/admin/api/upload" && m === "POST") {
    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!file || typeof file === "string") return json({ error: "No file provided" }, 400);
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) return json({ error: "Images only (JPEG, PNG, WebP, GIF)" }, 400);
    if (file.size > 5 * 1024 * 1024) return json({ error: "Image must be under 5 MB" }, 400);
    const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/blog-images/${name}`, {
      method: "POST",
      headers: secretHeaders(env, { "Content-Type": file.type }),
      body: await file.arrayBuffer(),
    });
    if (!res.ok) return json({ error: await res.text() }, upstream(res.status));
    return json({ url: `${SUPABASE_URL}/storage/v1/object/public/blog-images/${name}` });
  }

  return json({ error: "Not found" }, 404);
}
