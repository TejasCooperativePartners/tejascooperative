// Single source for the site header and footer. index.html carries a copy between
// <!--CHROME:HEADER--> / <!--CHROME:FOOTER--> markers; run `node scripts/sync-chrome.mjs`
// after editing this file to refresh it. The Worker injects the same markup into blog pages.
export const PORTAL_URL = "https://portal.tejascooperative.com";

export const HEADER_HTML = `<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/" aria-label="Tejas Cooperative Partners, home">
      <img class="brand-logo" src="/assets/logo-header.svg" alt="Tejas Cooperative Partners" width="221" height="45">
    </a>
    <button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="siteNav">
      <span></span><span></span><span></span>
    </button>
    <nav class="site-nav" id="siteNav" aria-label="Main">
      <ul class="nav-list">
        <li class="has-menu">
          <button class="nav-link menu-btn" type="button" aria-expanded="false">Services</button>
          <ul class="submenu">
            <li><a href="/#services">What We Do</a></li>
            <li><a href="/#process">How It Works</a></li>
            <li><a href="/#pricing">Pricing</a></li>
            <li><a href="/#serve">Who We Serve</a></li>
          </ul>
        </li>
        <li class="has-menu">
          <button class="nav-link menu-btn" type="button" aria-expanded="false">Cooperatives</button>
          <ul class="submenu">
            <li><a href="/#cooperative">What a Cooperative Is</a></li>
            <li><a href="/#cooperatives">Cooperatives We Work With</a></li>
            <li><a href="/#problem">Why Vendors Call Us</a></li>
          </ul>
        </li>
        <li><a class="nav-link" href="/#platform">Platform</a></li>
        <li><a class="nav-link" href="/#benefits">Results</a></li>
        <li class="has-menu">
          <button class="nav-link menu-btn" type="button" aria-expanded="false">About</button>
          <ul class="submenu">
            <li><a href="/#about">The Firm</a></li>
            <li><a href="/#faq">Questions</a></li>
          </ul>
        </li>
        <li><a class="nav-link" href="/blog">Blog</a></li>
        <li><a class="nav-link" href="/contact">Contact</a></li>
      </ul>
      <div class="nav-actions">
        <a class="nav-login" href="${PORTAL_URL}" rel="noopener">Portal Login</a>
        <a class="nav-cta" href="/#fit-review" data-fit-review-open>Start a Conversation</a>
      </div>
    </nav>
  </div>
</header>`;

export const FOOTER_HTML = `<footer class="site-footer">
  <div class="wrap footer-inner">
    <div class="footer-top">
      <img class="footer-lockup" src="/assets/logo-lockup.svg" alt="Tejas Cooperative Partners, Cooperative Contract Consulting" width="300" height="104">
      <nav class="footer-nav" aria-label="Footer">
        <a href="/#services">Services</a>
        <a href="/#pricing">Pricing</a>
        <a href="/#platform">Platform</a>
        <a href="/#benefits">Results</a>
        <a href="/#about">About</a>
        <a href="/blog">Blog</a>
        <a href="/contact">Contact</a>
        <a href="${PORTAL_URL}" rel="noopener">Portal Login</a>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
        <button type="button" data-open="a11y">Accessibility</button>
        <button type="button" data-open="cookie">Cookie Notice</button>
      </nav>
    </div>
    <p class="footer-legal">Tejas Cooperative Partners is an independent consulting firm. It is not a cooperative purchasing organization, and it is not affiliated with BuyBoard, The Local Government Purchasing Cooperative, the Texas Association of School Boards, TIPS, The Interlocal Purchasing System, or any other cooperative.</p>
    <p class="footer-copy">Phone: <a href="tel:+17372398700">(737) 239-8700</a></p>
    <p class="footer-copy">&copy; <span id="year">2026</span> Tejas Cooperative Partners. All rights reserved.</p>
  </div>
</footer>
<aside class="social-rail" aria-label="Social media">
  <a href="https://x.com/TejasCooP" target="_blank" rel="noopener noreferrer" aria-label="Tejas Cooperative Partners on X (opens in a new tab)">
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  </a>
  <a href="https://www.linkedin.com/company/tejascooperative/" target="_blank" rel="noopener noreferrer" aria-label="Tejas Cooperative Partners on LinkedIn (opens in a new tab)">
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  </a>
</aside>`;
