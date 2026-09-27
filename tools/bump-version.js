// Stamps every script and stylesheet link in the HTML pages with a fresh
// ?v=... so phones and browsers can't keep running old copies after a deploy.
// Run before every commit that changes js/ or css/:   node tools/bump-version.js

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const version = Date.now().toString(36);

for (const page of ["index.html", "tv.html", "editor.html"]) {
  const file = path.join(root, page);
  const before = fs.readFileSync(file, "utf8");
  const after = before.replace(/((?:src|href)="(?:js|css)\/[^"?]+\.(?:js|css))(\?v=[^"]*)?"/g, `$1?v=${version}"`);
  fs.writeFileSync(file, after);
  console.log(page, (after.match(/\?v=/g) || []).length, "links stamped");
}
fs.writeFileSync(path.join(root, "version.json"), JSON.stringify({ v: version }) + "\n");
console.log("version", version);
