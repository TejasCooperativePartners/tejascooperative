# Public site: uniform design with the client portal

Date: November 7, 2026. Presentation only. The hero background is unchanged.

## What changed
- `styles.css`: a shared tokens block at the top (`--cp-*`, identical values to `src/components/portal/portal.css` in the platform repo). The site's own variable names (`--navy`, `--gold`, `--sand`, ...) now point at those tokens, so site and portal cannot drift. The old rust accent is retired.
- A "Portal alignment layer" at the end of `styles.css`:
  - Buttons: navy primary on light backgrounds, gold primary on dark (hero, header, contact band, blog CTA, cookie notice), ghost buttons, 44px minimum height, full width on phones.
  - Cards, steps and chips use the portal card shadow and radius; tags are labeled pills; the pricing note is a portal notice; the feature card uses the portal gold tone.
  - Forms (Fit Review modal, Contact): portal field style, 44px fields, 16px text, gold focus ring, portal error color.
  - Links: navy with a gold underline in running text; gold on dark.
  - Page is sand with white alternate bands, as in the portal. Hero gets the portal's 3px gold bottom rule.
  - Tap targets at least 44px in header, menus, footer links, modal close, option chips.
- Not changed: copy, pricing, legal text, markup, GA4 and consent mode, Turnstile, form endpoints, phone mask, URLs, `assets/hero.webp` and its overlay gradients.

## Evidence
`Docs/site-portal-uniform/before/` and `after/`: desktop home (top and full), contact, Fit Review modal; 375px home, contact, Fit Review modal (375px shots use an iframe wrapper because headless Chrome has a minimum window width).

## Verified
Served locally with `wrangler dev`; rendered in headless Chrome at 1280px and 375px; hero background, gold buttons, cards, modal, contact form and cookie notice checked in the screenshots.

## Not verified
A real iPhone, the blog index and post pages (not re-screenshotted; they share the same classes), hover states, and the reduced-motion setting.

## Note
`index.html` had an uncommitted pricing copy change (Incumbent Re-Award paragraph) from before this work. It is not part of this commit and was kept out of the deploy; it is still uncommitted in the working tree.
