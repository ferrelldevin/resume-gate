// Template. Copy to make-letters.js (gitignored) and write the real paragraphs there.
// The letter bodies are first-person biography, so they stay out of the repo under
// standing-constraints.md (no personal information in artifacts) — same rule as profile.json.
// Run: node make-letters.js   → writes targets/<company>-letter.json
// Build: TARGET=<company> node build-coverletter-tailored.js out.docx
const fs = require("fs");
const path = require("path");

const L = {
  examplecorp: [
    "Opening paragraph: the role applied for, who you are, and the single requirement from their posting you meet most directly.",
    "Evidence paragraph: two or three concrete things you built or ran, with real numbers. No claim you could not discuss for five minutes under questioning.",
    "Closing paragraph: why this employer specifically, and the ask. One honest sentence about a gap beats three about strengths.",
  ],
};

const dir = path.join(__dirname, "targets");
for (const [k, paragraphs] of Object.entries(L)) {
  fs.writeFileSync(path.join(dir, k + "-letter.json"), JSON.stringify({ paragraphs }, null, 2) + "\n");
  console.log("wrote", k + "-letter.json");
}
