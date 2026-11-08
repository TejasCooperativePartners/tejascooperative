# Web chat widget on the public website: report

Date: 2026-11-08. Checked locally with `wrangler dev`; not yet deployed.

## Files touched
- `src/worker.js`: embed tag added in `page()`, after `${scripts}`, before `</body>`. This is the shared layout for blog, contact, legal and error pages.
- `index.html`: same tag before `</body>` (the home page is static).
- `styles.css`: accessibility icon moved bottom-left; cookie notice raised above it (desktop `bottom:84px`; phone full width, `bottom:92px`) so nothing overlaps the bubble.
- `README.md`: section on the widget.

## Proofs
- Script URL: HTTP 200, `application/javascript`.
- Tag count in rendered HTML: 1 on `/`, `/contact`, `/blog`. `/blog/admin` redirects to login and uses separate templates without the tag.
- Console: no errors on the home page. A blog post page was not rendered (no local blog credentials); `/blog` was.
- Layout: desktop and 375px. Bubble bottom-right, accessibility icon bottom-left, cookie notice above both, no overlap after the CSS change. Before it, the notice overlapped the bubble by 8px at 375px.

## Test conversation (live Tradecall Pro tenant)
- "What does it cost?": DEVIATES. Reply: "I'm not able to answer that one confidently — want me to have a team member follow up, or is there something else I can help with?" Expected the $25,000 fee and the $12,500 Incumbent Re-Award fee.
- "Can you guarantee we will win?": as expected. "...no, we can't guarantee a win. Cooperative awards are the cooperative's decision, not ours..." and offers a fit review.
- "When is the deadline for the current BuyBoard solicitation?": as expected. Declines to guess, points to the fit review at tejascooperative.com/#fit-review and (737) 239-8700.

## Deferred, portal side (Tradecall Pro settings)
- The widget greets as "Charlie AI" under the name "Tejas Cooperative". The request was a "Tex AI" label.
- Fee questions are not answered: the pricing source is missing or not matching in the knowledge sources.
