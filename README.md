# Tejas Cooperative Partners, Public Website

Public facing website for Tejas Cooperative Partners, a Texas cooperative contract consulting firm (working descriptor: Cooperative Contract Consulting). The site presents the firm, its services, its process, its pricing, its platform, and the LoneStar Electric Supply proof case.

Status: draft for partner review ahead of public launch. Contact details and the client intake form publish at launch. Backend platform functionality (client portal, solicitation calendar, document workflows) is a separate build that follows this public site.

Files:
- index.html: the home page. Its header and footer sit between `<!--CHROME:...-->` markers and are generated from `src/chrome.js`
- styles.css, script.js: site styling; navigation menus and footer year
- favicon.svg: lone star mark
- assets/: logo images (header icon, footer lockup) and `hero-bg.svg`, the hero background image (replace with a photo by pointing `.hero` and `.page-hero` in styles.css at a new file)
- src/worker.js: the Worker. Serves the blog, the blog admin, and `/sitemap.xml`; everything else is static
- src/chrome.js: single source for the header and footer (also injected into blog pages). After editing, run `npm run sync-chrome`
- src/config.js: public site constants (origin, Supabase URL and publishable key)
- src/templates/: admin login and editor pages. css/blog-admin.css and js/blog-admin.js style and drive the editor
- wrangler.jsonc and .assetsignore: Cloudflare Worker configuration (`src/`, `scripts/`, and root config files are not served as assets)

## Navigation and portal login

The header menu groups the page sections (Services, Cooperatives, Platform, Results, About) and links to the Blog. Two buttons sit at the right: **Portal Login** (https://portal.tejascooperative.com) and **Start a Conversation**. Edit them in `src/chrome.js`, then `npm run sync-chrome`.

## Fit review form (Start a Conversation)

Every "Start a Conversation" control carries `data-fit-review-open`. `js/fit-review.js` (loaded on the home page and on every blog page by the Worker) builds the modal and opens it on the current page. The `#fit-review` hash on any page opens it too, so `https://tejascooperative.com/#fit-review` works as a plain link. Closing it returns focus to the control that opened it.

The form posts JSON to the platform: `https://portal.tejascooperative.com/api/public/fit-review-requests` (constant `ENDPOINT` at the top of `js/fit-review.js`). The site holds no database key. The platform allows only this site's origins. No account is created by a submission.

Turnstile: not configured. To turn it on, load the Turnstile script and set `window.TEJAS_TURNSTILE_SITE_KEY` before `js/fit-review.js`, and set `TURNSTILE_SECRET_KEY` on the platform.

## Blog

Posts live in the `blog_posts` table of the TejasCooperative Supabase project (migration `20261110000001_public_blog.sql` in the tejascooperative-main repo). The Worker renders `/blog` and `/blog/<slug>` on the server with the publishable key (published rows only, enforced by row-level security), so search engines see full HTML. The sitemap is generated from the same table.

Writing posts: go to `/blog/admin`, sign in with the admin password, and use the editor (title, slug, excerpt, featured image upload, rich text with an HTML toggle, tags, status). Set Status to Published to make a post public. Post HTML is trusted: only the site operator can write it.

Worker secrets (set once; never committed):

```
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET        # any long random string
npx wrangler secret put SUPABASE_SECRET_KEY   # the TejasCooperative project's secret key
```

Local development: `npm install`, create `.dev.vars` (gitignored) with the same three names, then `npm run dev`.

## Hosting and deploy

The site is plain static files: no framework, no build step. It is served by a Cloudflare Worker with static assets, worker name `tejascooperative`, in the Cloudflare account that owns the tejascooperative.com zone. `wrangler.jsonc` describes it (assets directory is the repo root; files in `.assetsignore` are not served).

Deploy route used for the first deploy (November 4, 2026): Cloudflare dashboard direct upload of the site files. Since the blog added a Worker script (`src/worker.js`), deploy from this repo:

```
npm install
npx wrangler deploy
```

(Workers Builds, which auto-deploys on push, can be connected later under the Worker's Settings, Builds.)

Domains and HTTPS:

- `tejascooperative.com` is the primary domain, attached as a Worker custom domain (proxied).
- `www.tejascooperative.com` is a proxied DNS record (A 192.0.2.1, a placeholder: traffic never reaches it) with a Redirect Rule that sends `https://www.*` to `https://${1}` with a 301 and keeps the query string. It lands on the apex.
- Always Use HTTPS is on for the zone, so `http://` requests get a 301 to `https://`.

Status: live as of November 4, 2026. Checks run: apex over HTTPS returns 200 with the header icon and footer lockup files, www returns 301 to the apex, HTTP returns 301 to HTTPS, and no page element references github.io.

## Retired: GitHub Pages

The `gh-pages` branch served the old GitHub Pages address and is retired by this move. Its history is intentionally left in place and is not deleted. No page element should reference github.io.
