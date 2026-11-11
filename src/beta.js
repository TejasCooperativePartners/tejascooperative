/* Beta landing page, /beta. Rendered by src/worker.js inside the shared header and footer.
   Reads ?coop=tips|buyboard (and passes coop plus any utm_* parameters through to the questionnaire).
   Program state (open or closed per cooperative) comes from the portal's public program-status endpoint. */

const PORTAL = "https://portal.tejascooperative.com";
const LABEL = { tips: "TIPS", buyboard: "BuyBoard" };
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

export const BETA_META = {
  path: "/beta",
  title: "Beta program for BuyBoard and TIPS incumbents",
  description: "Keep your cooperative contract. Tejas Cooperative Partners runs a full renewal engagement for incumbent BuyBoard and TIPS vendors at no fee in our beta program.",
  heroAlt: "Vendor service trucks lined up at a Texas limestone school at sunset, ledgers and calendar in the foreground",
};

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function betaState() {
  try {
    const r = await fetch(`${PORTAL}/api/public/beta/program-status`, { signal: AbortSignal.timeout(2500) });
    const j = await r.json();
    return { tips: j.programs?.tips !== "closed", buyboard: j.programs?.buyboard !== "closed" };
  } catch {
    return { tips: true, buyboard: true }; // the questionnaire itself enforces closure
  }
}

export function betaBody(url, open, tickerHtml = "") {
  const raw = (url.searchParams.get("coop") || "").toLowerCase();
  const coop = raw === "tips" || raw === "buyboard" ? raw : "";
  const qs = new URLSearchParams();
  if (coop) qs.set("coop", coop);
  for (const k of UTM) { const v = url.searchParams.get(k); if (v) qs.set(k, v.slice(0, 200)); }
  const href = `${PORTAL}/beta/apply${qs.toString() ? "?" + qs.toString() : ""}`;

  let seatLine;
  if (coop) seatLine = `10 beta seats for ${LABEL[coop]} incumbents.`;
  else if (open.tips && open.buyboard) seatLine = "20 beta seats, 10 for BuyBoard incumbents and 10 for TIPS incumbents.";
  else if (open.tips) seatLine = "10 beta seats for TIPS incumbents.";
  else if (open.buyboard) seatLine = "10 beta seats for BuyBoard incumbents.";
  else seatLine = "";

  const closedFor = coop ? !open[coop] : !open.tips && !open.buyboard;
  const closedCoop = coop || (!open.tips ? "tips" : "buyboard");
  const ctaOpenCoop = coop || ""; // for the analytics parameter
  const cta = closedFor
    ? `<div class="beta-closed" role="status"><strong>The ${LABEL[closedCoop]} beta seats are filled.</strong> The beta program for ${LABEL[closedCoop]} incumbents is closed. If a seat opens, we will reach out to vendors who asked.</div>`
    : `<p class="beta-cta-row"><a class="btn btn-glow" href="${esc(href)}" data-beta-cta data-coop="${esc(ctaOpenCoop)}">Start the questionnaire</a></p>`;

  return `<section class="beta-hero">
  <div class="wrap">
    <p class="eyebrow">Beta program</p>
    <h1>Keep your cooperative contract. We will handle the renewal.</h1>
    <p class="lede">Tejas Cooperative Partners prepares and manages cooperative proposals for vendors. Our beta program runs a full renewal engagement for incumbent vendors at no fee.${seatLine ? " " + esc(seatLine) : ""}</p>
  </div>
</section>
${tickerHtml}
<section class="section">
  <div class="wrap beta-prose">
    <h2>What we do on your renewal</h2>
    <ul class="beta-list">
      <li>We track your successor solicitation and its addenda.</li>
      <li>We read the entire packet and build your checklist from the packet itself.</li>
      <li>We prepare the forms, documents, certifications, references, and pricing work the packet requires, from your confirmed company record.</li>
      <li>We bring the completed packet to you for review. You read the solicitation, review the packet, and approve it before we submit.</li>
      <li>You work through a client portal with your documents, questions, progress, and deadlines in one place.</li>
    </ul>
    ${cta}
  </div>
</section>
<section class="section section-alt">
  <div class="wrap beta-prose">
    <h2>Why this is free</h2>
    <p>Tejas is opening its platform and process to a first group of vendors in beta. In exchange for a waived fee, beta vendors give us direct feedback while they run a real renewal through the system. The fee we waive is the published Incumbent Re-Award fee of $12,500.</p>
    ${closedFor ? "" : cta}
    <h2>What beta vendors receive</h2>
    <ul class="beta-list">
      <li>The beta renewal engagement at $0. No kickoff amount and no attainment amount for that engagement.</li>
      <li>Free renewals of the same designated contract for five years, one active engagement at a time.</li>
      <li>Additional engagements opened in that period at 50% of the published fee in effect when the engagement opens.</li>
    </ul>
  </div>
</section>
<section class="section">
  <div class="wrap beta-prose">
    <h2>What we ask in return</h2>
    <ul class="beta-list">
      <li>Patience while we fix issues the beta surfaces.</li>
      <li>Feedback at set points during and after the engagement, good and bad, including short polls we send during the beta, three or four in total, a few minutes each.</li>
      <li>A designated contact who responds within two business days during the live window, and a signer who can sign within one business day.</li>
      <li>If the engagement results in an award, permission to publish a case study of the experience, with your review of the text before it runs.</li>
      <li>Availability for occasional reference calls with prospective clients, scheduled through Tejas and capped.</li>
    </ul>
    ${closedFor ? "" : cta}
  </div>
</section>
<section class="section">
  <div class="wrap beta-prose">
    <h2>Who this fits</h2>
    <p>Current BuyBoard or TIPS contract holders in Texas, with a successor window open or approaching, who can meet the response pace above. Seats are limited to 10 per cooperative. A completed questionnaire is a seat request. Tejas reviews each request and confirms seats in writing.</p>
  </div>
</section>
<section class="section section-alt">
  <div class="wrap beta-prose">
    <p class="beta-fine">Questions before you apply, reply to the email that brought you here or use the <a href="/contact">contact form</a>. Tejas Cooperative Partners is an independent firm, not a cooperative, and is not affiliated with BuyBoard, TASB, or TIPS. Tejas guarantees no award and no sales level.</p>
  </div>
</section>`;
}

export const BETA_SCRIPT = `<script src="/js/beta-modal.js" defer></script>\n<script>
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('[data-beta-cta]');
  if (!a || typeof gtag !== 'function') return;
  gtag('event', 'beta_cta_click', { coop: a.getAttribute('data-coop') || 'none', transport_type: 'beacon' });
});
</script>`;
