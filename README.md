# Tejas Cooperative Partners, Public Website

Public facing website for Tejas Cooperative Partners, a Texas cooperative contract consulting firm (working descriptor: Cooperative Contract Consulting). The site presents the firm, its services, its process, its pricing, its platform, and the LoneStar Electric Supply proof case.

Status: draft for partner review ahead of public launch. Contact details and the client intake form publish at launch. Backend platform functionality (client portal, solicitation calendar, document workflows) is a separate build that follows this public site.

Files:
- index.html: the single page site
- styles.css: styling
- script.js: mobile navigation and footer year
- favicon.svg: lone star mark
- assets/: logo images (header icon, footer lockup)
- wrangler.jsonc and .assetsignore: Cloudflare Worker static-assets configuration

## Hosting and deploy

The site is plain static files: no framework, no build step. It is served by a Cloudflare Worker with static assets, worker name `tejascooperative`, in the Cloudflare account that owns the tejascooperative.com zone. `wrangler.jsonc` describes it (assets directory is the repo root; files in `.assetsignore` are not served).

Deploy route used for the first deploy (November 4, 2026): Cloudflare dashboard direct upload of the site files (Workers & Pages, Create, Upload your static files). To redeploy from this repo:

```
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
