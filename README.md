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

The site is plain static files: no framework, no build step. It is served by a Cloudflare Worker with static assets, worker name `tejascooperative`, assets directory the repo root (files listed in `.assetsignore` are not served).

Deploy route: wrangler from this repo.

```
npx wrangler deploy
```

Custom domains (Cloudflare dashboard, Workers & Pages, tejascooperative, Settings, Domains & Routes):

- `tejascooperative.com` is the primary domain, attached as a Worker custom domain.
- `www.tejascooperative.com` redirects to the apex (a Redirect Rule: `https://tejascooperative.com/${1}`, 301).
- HTTPS is on, with Always Use HTTPS enabled for the zone.

Status (November 4, 2026): the repository side is ready on the `cloudflare-move` branch (Worker config, extracted logo files, canonical, Open Graph, sitemap and robots URLs set to https://tejascooperative.com). The deploy and domain attachment are pending a Cloudflare account connection that can see the tejascooperative.com zone.

## Retired: GitHub Pages

The `gh-pages` branch served the old GitHub Pages address and is retired by this move. Its history is intentionally left in place and is not deleted. No page element should reference github.io.
