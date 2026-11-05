// Single source for the site header and footer. index.html carries a copy between
// <!--CHROME:HEADER--> / <!--CHROME:FOOTER--> markers; run `node scripts/sync-chrome.mjs`
// after editing this file to refresh it. The Worker injects the same markup into blog pages.
export const PORTAL_URL = "https://portal.tejascooperative.com";

export const HEADER_HTML = `<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/" aria-label="Tejas Cooperative Partners, home">
      <img class="brand-icon" src="/assets/tejas-icon.jpg" alt="" aria-hidden="true">
      <span class="brand-text">
        <span class="brand-name">Tejas Cooperative Partners</span>
        <span class="brand-sub">Cooperative Contract Consulting</span>
      </span>
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
        <li><a class="nav-link" href="/#proof">Results</a></li>
        <li class="has-menu">
          <button class="nav-link menu-btn" type="button" aria-expanded="false">About</button>
          <ul class="submenu">
            <li><a href="/#about">The Partners</a></li>
            <li><a href="/#faq">Questions</a></li>
          </ul>
        </li>
        <li><a class="nav-link" href="/blog">Blog</a></li>
      </ul>
      <div class="nav-actions">
        <a class="nav-login" href="${PORTAL_URL}" rel="noopener">Portal Login</a>
        <a class="nav-cta" href="/#contact">Start a Conversation</a>
      </div>
    </nav>
  </div>
</header>`;

export const FOOTER_HTML = `<footer class="site-footer">
  <div class="wrap footer-inner">
    <div class="footer-top">
      <img class="footer-lockup" src="/assets/tejas-lockup.jpg" alt="Tejas Cooperative Partners, Cooperative Contract Consulting">
      <nav class="footer-nav" aria-label="Footer">
        <a href="/#services">Services</a>
        <a href="/#pricing">Pricing</a>
        <a href="/#platform">Platform</a>
        <a href="/#proof">Results</a>
        <a href="/#about">About</a>
        <a href="/blog">Blog</a>
        <a href="${PORTAL_URL}" rel="noopener">Portal Login</a>
      </nav>
    </div>
    <p class="footer-legal">Tejas Cooperative Partners is an independent consulting firm. It is not a cooperative purchasing organization, and it is not affiliated with BuyBoard, The Local Government Purchasing Cooperative, the Texas Association of School Boards, TIPS, The Interlocal Purchasing System, or any other cooperative. This site is in development and its content is subject to partner review.</p>
    <p class="footer-copy">&copy; <span id="year">2026</span> Tejas Cooperative Partners. All rights reserved.</p>
  </div>
</footer>`;
