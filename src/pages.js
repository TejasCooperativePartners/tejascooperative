/* Body HTML and metadata for the Contact, Privacy Policy, and Terms of Service pages.
   Rendered by src/worker.js inside the shared header and footer. */

const UPDATED = "November 5, 2026";
const PRIVACY_EMAIL = "cooperativetejas@gmail.com";

const hero = (eyebrow, title, lede) => `<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">${eyebrow}</p>
    <h1>${title}</h1>
    ${lede ? `<p class="lede">${lede}</p>` : ""}
  </div>
</section>`;

export const CONTACT_PAGE = {
  path: "/contact",
  title: "Contact Us",
  description:
    "Contact Tejas Cooperative Partners about cooperative purchasing contracts for your Texas business. Send your name, company, phone, email, and a few details and we will get back to you.",
  body: `${hero("Contact", "Contact Us", "Tell us a little about your business and what you need. We read every message and reply by email or phone. Call us at <a href='tel:+17372398700'>(737) 239-8700</a>.")}
<section class="section">
  <div class="wrap contact-page-grid">
    <form class="contact-form" id="contact-form" novalidate>
      <div class="cf-field"><label for="cf-full_name">Full name <span class="cf-req" aria-hidden="true">*</span></label>
        <input id="cf-full_name" name="full_name" type="text" autocomplete="name" maxlength="200" required aria-describedby="cf-full_name-error">
        <p class="cf-error" id="cf-full_name-error" role="alert" hidden></p></div>
      <div class="cf-field"><label for="cf-company_name">Company name <span class="cf-req" aria-hidden="true">*</span></label>
        <input id="cf-company_name" name="company_name" type="text" autocomplete="organization" maxlength="200" required aria-describedby="cf-company_name-error">
        <p class="cf-error" id="cf-company_name-error" role="alert" hidden></p></div>
      <div class="cf-row">
        <div class="cf-field"><label for="cf-phone">Phone number <span class="cf-req" aria-hidden="true">*</span></label>
          <input id="cf-phone" name="phone" type="tel" autocomplete="tel" maxlength="40" required aria-describedby="cf-phone-error">
          <p class="cf-error" id="cf-phone-error" role="alert" hidden></p></div>
        <div class="cf-field"><label for="cf-email">Email address <span class="cf-req" aria-hidden="true">*</span></label>
          <input id="cf-email" name="email" type="email" autocomplete="email" maxlength="254" required aria-describedby="cf-email-error">
          <p class="cf-error" id="cf-email-error" role="alert" hidden></p></div>
      </div>
      <div class="cf-field"><label for="cf-details">Inquiry details <span class="cf-req" aria-hidden="true">*</span></label>
        <textarea id="cf-details" name="details" rows="6" maxlength="3000" required aria-describedby="cf-details-help cf-details-error"></textarea>
        <p class="cf-help" id="cf-details-help">What do you sell, and what would you like help with?</p>
        <p class="cf-error" id="cf-details-error" role="alert" hidden></p></div>
      <div class="cf-hp" aria-hidden="true"><label for="cf-company_fax">Fax</label><input id="cf-company_fax" name="company_fax" type="text" tabindex="-1" autocomplete="off"></div>
      <div class="cf-field cf-consent"><label class="cf-check"><input id="cf-consent_to_contact" name="consent_to_contact" type="checkbox" required aria-describedby="cf-consent_to_contact-error">
        <span>I agree that Tejas Cooperative Partners may contact me about this inquiry. See the <a href="/privacy">Privacy Policy</a>.</span></label>
        <p class="cf-error" id="cf-consent_to_contact-error" role="alert" hidden></p></div>
      <div id="cf-turnstile" class="cf-turnstile"></div>
      <p class="cf-error cf-form-error" id="cf-form-error" role="alert" hidden></p>
      <button type="submit" class="btn btn-primary" id="cf-submit">Send Message</button>
    </form>
    <div class="contact-success" id="contact-success" role="status" tabindex="-1" hidden>
      <h2>Thank you. Your message was sent.</h2>
      <p>We will reply to the email address or phone number you gave. Your reference is <strong id="cf-ref"></strong>.</p>
      <p><a class="btn btn-ghost-dark" href="/">Back to the home page</a></p>
    </div>
    <aside class="contact-side" aria-label="Other ways to start">
      <h2>What happens next</h2>
      <p>A partner reads your message and replies, usually within one business day.</p>
      <h2>Ready to talk about a contract?</h2>
      <p>The fit review checks your category, your current cooperative status, and the next opening on the calendar.</p>
      <p><a class="btn btn-primary" href="/#fit-review" data-fit-review-open>Start a Fit Review</a></p>
      <p class="contact-side-note">Please do not send sensitive information such as tax IDs, bank details, or passwords through this form.</p>
    </aside>
  </div>
</section>`,
};

const legal = (eyebrow, title, intro, sections) =>
  `${hero(eyebrow, title, `Effective ${UPDATED}`)}
<section class="section">
  <div class="wrap legal">
    <p class="legal-intro">${intro}</p>
    ${sections.map(([h, html]) => `<h2>${h}</h2>\n${html}`).join("\n")}
  </div>
</section>`;

export const PRIVACY_PAGE = {
  path: "/privacy",
  title: "Privacy Policy",
  description: "How Tejas Cooperative Partners collects, uses, and protects information through its website and client platform.",
  // Text is the platform's templates/legal/privacy-policy.md, published verbatim (DRAFT banner line omitted).
  body: `${hero("Legal", "Privacy Policy", `Effective ${UPDATED}`)}
<section class="section">
  <div class="wrap legal">
    <p class="legal-intro">Tejas Cooperative Partners (the "Firm") is an independent consulting firm that helps businesses prepare and submit proposals to cooperative purchasing organizations. This policy describes what information the Firm collects through its website (tejascooperative.com) and its client platform (portal.tejascooperative.com), how it is used, and the choices a person or business has about it.</p>
    <h2>Information the Firm collects</h2>
    <p><strong>Fit review requests.</strong> When a visitor submits the fit review form on the website, the Firm collects the contact's name, company name, email address, phone number, what the company sells, where it sells, its current cooperative purchasing status, the cooperatives it is considering, any specific invitation or deadline it names, and the obstacle it describes. The submission is stored in the Firm's platform as an unvetted prospect record. Submitting the form does not create a user account.</p>
    <p><strong>Accounts and platform use.</strong> When the Firm invites a prospect or client to the platform, the Firm collects the user's name, email address, and account credentials, and records account activity such as sign-ins, terms acceptance, and signature consent.</p>
    <p><strong>Client business records.</strong> Clients provide business documents and data used to prepare cooperative proposals, which may include tax forms (including Form W-9), insurance certificates, licenses, financial information, catalogs, and pricing. Clients also provide the names and contact details of their authorized signers and references.</p>
    <p><strong>Email correspondence.</strong> Email sent or received through the platform is stored with the related prospect or client record, including delivery, bounce, and complaint status returned by the email provider.</p>
    <p><strong>Technical records.</strong> The platform records standard technical information, including IP addresses, browser type, and access times, in server and security logs.</p>
    <h2>How the Firm uses information</h2>
    <ul>
<li>To evaluate fit review requests and respond to the person who submitted one.</li>
<li>To provide the consulting services: building client profiles, preparing and tracking proposals, managing vendor registrations as the client's authorized agent, tracking recommendation letters, and monitoring cooperative solicitations.</li>
<li>To send email related to an engagement, including notifications about submissions, cooperative notices, deadlines, and messages sent through the platform.</li>
<li>To operate, secure, and improve the platform.</li>
<li>To meet legal, tax, and cooperative program requirements.</li>
</ul>
    <p>The Firm uses AI tools inside the platform to read and extract data from client documents, check letters against cooperative rules, and draft proposal content for partner review. Client data processed by these tools is not used to train AI models.</p>
    <h2>How information is shared</h2>
    <p>The Firm does not sell personal information and does not share client data with other clients.</p>
    <p>Information is shared only in these cases:</p>
    <ul>
<li><strong>With cooperatives, as part of a submission.</strong> Proposal packets, registration records, and signed forms are submitted to the cooperative the client is pursuing, at the client's direction. A submitted packet becomes part of that cooperative's procurement record and may be subject to the cooperative's own rules and to public information law.</li>
<li><strong>With service providers that run the platform.</strong> The Firm uses established providers for hosting and database (Vercel and Supabase), email delivery (Amazon Web Services), DNS and website delivery (Cloudflare), AI document processing (Anthropic), and electronic signatures (provider named in the platform when signing is used). Each provider processes information only to provide its service.</li>
<li><strong>When required by law,</strong> or to protect the rights, property, or safety of the Firm, its clients, or others.</li>
</ul>
    <h2>Retention</h2>
    <p>Fit review records for prospects that do not become clients are kept for a reasonable period for follow-up and then deleted or archived. Client records are kept while the engagement is active and afterward for the period needed for renewals, audits, and legal requirements. A business may ask the Firm to delete its prospect record at any time, using the contact below.</p>
    <h2>Security</h2>
    <p>The platform uses access controls, per-account permissions, encrypted connections, and a credential vault for cooperative account credentials. No system is perfectly secure; the Firm will notify affected clients without undue delay if it becomes aware of unauthorized access to their platform records.</p>
    <h2>Choices and contact</h2>
    <p>A person may ask what information the Firm holds about them or their business, ask for a correction, or ask for deletion of a prospect record, by writing to cooperativetejas@gmail.com. The Firm responds to requests from the business contact of record.</p>
    <h2>Changes to this policy</h2>
    <p>The Firm may update this policy as the platform changes. The current version is posted at tejascooperative.com/privacy with its effective date.</p>
    <h2>About the Firm</h2>
    <p>Tejas Cooperative Partners is an independent consulting firm. It is not a cooperative, it is not affiliated with BuyBoard, TASB, or TIPS, and it guarantees no award and no sales level.</p>
  </div>
</section>`,
};

export const TERMS_PAGE = {
  path: "/terms",
  title: "Terms of Service",
  description: "The terms that govern use of the Tejas Cooperative Partners website.",
  body: legal(
    "Legal",
    "Terms of Service",
    `These Terms of Service govern your use of tejascooperative.com (the "Site"), operated by Tejas Cooperative Partners (the "Firm," "we," or "us"). By using the Site you agree to these terms. If you do not agree, please do not use the Site.`,
    [
      ["About the Firm and the Site", `<p>The Firm is an independent consulting firm. It is not a cooperative purchasing organization and is not affiliated with BuyBoard, The Local Government Purchasing Cooperative, the Texas Association of School Boards, TIPS, The Interlocal Purchasing System, or any other cooperative. The Site provides general information about our services. It is not legal, financial, or procurement advice, and reading it does not create a client relationship.</p>`],
      ["Consulting services", `<p>Consulting services are provided only under a written Consulting Agreement signed by the Firm and the client. If these terms conflict with a signed Consulting Agreement, the Consulting Agreement controls. Use of the client portal (portal.tejascooperative.com) is governed by the Portal Terms of Use accepted when an account is activated.</p>`],
      ["No guarantee of results", `<p>Cooperative awards are decided by the cooperatives, not by the Firm. We do not guarantee that any proposal will be accepted, that any award will be made, or that any level of sales will result. Descriptions of past work are examples and are not predictions or promises of future results.</p>`],
      ["Acceptable use", `<p>You agree not to use the Site to break the law; to submit false, misleading, or unauthorized information; to send spam or malicious code; to interfere with or attempt to bypass the Site's security; or to scrape or copy the Site at scale without our permission.</p>`],
      ["Information you send us", `<p>When you submit a form or message, you confirm the information is accurate and that you may share it. We handle it as described in our <a href="/privacy">Privacy Policy</a>. Please do not send sensitive data such as tax IDs, bank details, or passwords through the Site's forms.</p>`],
      ["Intellectual property", `<p>The Site, including its text, design, logos, graphics, and software, is owned by the Firm or its licensors and is protected by law. You may view and share links to the Site for your own business purposes. You may not copy, modify, or redistribute our content without written permission. Cooperative names and marks belong to their owners and are used only to identify them.</p>`],
      ["Third-party links", `<p>The Site may link to websites we do not control, such as cooperative sites. We are not responsible for their content, availability, or practices.</p>`],
      ["Disclaimer of warranties", `<p>The Site is provided "as is" and "as available." To the fullest extent permitted by law, we disclaim all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement, and we do not warrant that the Site will be uninterrupted, accurate, or error free.</p>`],
      ["Limitation of liability", `<p>To the fullest extent permitted by law, the Firm and its partners, employees, and agents are not liable for any indirect, incidental, special, consequential, or punitive damages, or for lost profits or lost business, arising from your use of the Site. Our total liability for any claim relating to the Site is limited to one hundred dollars ($100). Nothing in these terms limits liability that cannot be limited by law.</p>`],
      ["Changes", `<p>We may update these terms and the Site at any time. The current terms are posted at tejascooperative.com/terms with their effective date. Continued use of the Site after an update means you accept the updated terms.</p>`],
      ["Governing law", `<p>These terms are governed by the laws of the State of Texas, without regard to conflict-of-law rules. Any dispute relating to the Site will be brought in the state or federal courts located in Texas, and you consent to their jurisdiction.</p>`],
      ["Contact", `<p>Questions about these terms? Use our <a href="/contact">Contact Us</a> page.</p>`],
    ],
  ),
};
