// build-scripts/build-js.js
import { execSync } from "child_process";
import { readdirSync, writeFileSync, readFileSync } from "fs";
import path from "path";
import { minify } from "terser";

const srcDir = "./src/js";       // source files (you edit these)
const outDir = "./public/js";    // output (served to site)

// 1. Get short git commit hash
const gitHash = execSync("git rev-parse --short HEAD").toString().trim();

// 2. Collect all feature JS files
let files = readdirSync(srcDir).filter(f => f.endsWith(".js"));

// Ensure core.js is always first
files = files.sort((a, b) => {
  if (a === "core.js") return -1;
  if (b === "core.js") return 1;
  return a.localeCompare(b);
});

// 3. Concatenate code
let code = "";
for (const file of files) {
  const src = readFileSync(path.join(srcDir, file), "utf8");
  code += `\n/* ===== ${file} ===== */\n` + src + "\n";
}

// 4. Minify
const result = await minify(code, { compress: true, mangle: true });

// 5. Write versioned bundle
const outFile = `bundle.${gitHash}.js`;
writeFileSync(`${outDir}/${outFile}`, result.code);

// 6. Write manifest.json (for dev + workers)
const manifest = {
  gitHash,
  bundle: outFile,
  scripts: files
};
writeFileSync(`${outDir}/manifest.json`, JSON.stringify(manifest, null, 2));

console.log(`✅ Built ${outFile} with ${files.length} scripts -> manifest.json`);
