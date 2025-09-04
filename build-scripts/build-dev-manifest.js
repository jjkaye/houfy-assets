// build-scripts/build-dev-manifest.js
import { readdirSync, writeFileSync } from "fs";

const srcDir = "./src/js";
const outFile = `${srcDir}/manifest-dev.json`;

// Collect all .js files in src/js (ignore manifest itself)
let files = readdirSync(srcDir)
  .filter(f => f.endsWith(".js") && f !== "manifest-dev.json");

// Ensure core.js is always first
files = files.sort((a, b) => {
  if (a === "core.js") return -1;
  if (b === "core.js") return 1;
  return a.localeCompare(b);
});

// Write manifest-dev.json
const manifest = { scripts: files };
writeFileSync(outFile, JSON.stringify(manifest, null, 2));

console.log(`✅ Generated dev manifest with ${files.length} scripts -> ${outFile}`);
