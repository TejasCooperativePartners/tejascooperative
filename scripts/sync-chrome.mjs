// Copies the header/footer from src/chrome.js into index.html between the CHROME markers.
import { readFileSync, writeFileSync } from "node:fs";
import { HEADER_HTML, FOOTER_HTML } from "../src/chrome.js";
let html = readFileSync("index.html", "utf8");
for (const [key, body] of [["HEADER", HEADER_HTML], ["FOOTER", FOOTER_HTML]]) {
  const re = new RegExp(`<!--CHROME:${key}-->[\\s\\S]*?<!--/CHROME:${key}-->`);
  if (!re.test(html)) throw new Error(`Missing CHROME:${key} markers in index.html`);
  html = html.replace(re, () => `<!--CHROME:${key}-->\n${body}\n<!--/CHROME:${key}-->`);
}
writeFileSync("index.html", html);
console.log("index.html chrome synced");
