# Phone number update report

Date: 2026-11-05. New firm phone: (737) 239-8700, link `tel:+17372398700`.

## Search findings (before any change)

The whole repo was searched (phone-shaped patterns in any format, `tel:`, `mailto`, and fragments `5150`, `255-5`, `8700`, `239`), including `src/chrome.js`, `index.html`, `src/pages.js`, `src/config.js`, `js/`, `scripts/` and the README.

- **No firm phone number existed anywhere** in the repo or on the live site (home, `/contact`, `/contact/` had no number and no `tel:` link).
- The retired number +1 737-255-5150 was not found.
- The only "phone" matches were the Phone input and its validation in `js/contact.js`, `js/fit-review.js` and `src/pages.js`. These are form fields, not the firm's number, and were left untouched.

So this change was an addition, not a replacement, approved by the owner.

## Files changed

- `src/chrome.js`: footer line "Phone: (737) 239-8700" linked to `tel:+17372398700`.
- `index.html`: regenerated from `src/chrome.js` with `npm run sync-chrome`.
- `src/pages.js`: contact page intro ends with "Call us at (737) 239-8700." with the same `tel:` link.

## Deploy

`./verify-accounts.sh` passed, then `npx wrangler deploy` (version 8bc9801c-6252-4acb-9b22-53274eda2a54).

## Live verification (fetched after deploy, cache-busted, repeated)

- `https://tejascooperative.com/` line 452: `<p class="footer-copy">Phone: <a href="tel:+17372398700">(737) 239-8700</a></p>`
- `https://tejascooperative.com/contact` line 80: `...We read every message and reply by email or phone. Call us at <a href='tel:+17372398700'>(737) 239-8700</a>.</p>` and the footer (line 148) shows the same footer line as the home page.
