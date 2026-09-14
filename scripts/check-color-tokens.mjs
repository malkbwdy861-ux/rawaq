import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const roots = ["app", "src"];
const extensions = new Set([".css", ".js", ".jsx", ".ts", ".tsx"]);
const allowedFiles = new Set([join("app", "globals.css")]);
const rawColorPatterns = [
  { label: "raw color function", pattern: /\b(?:color|hsl|hsla|hwb|lab|lch|oklab|oklch|rgb|rgba)\s*\(/i },
  { label: "hex color", pattern: /#[\da-f]{3}(?:[\da-f]{3})?(?:[\da-f]{2})?\b/i },
  { label: "white/black utility", pattern: /\b(?:bg|border|decoration|divide|fill|from|outline|ring|shadow|stroke|text|to|via)-(?:black|white)\b/i },
  { label: "Tailwind palette utility", pattern: /\b(?:bg|border|decoration|divide|fill|from|outline|ring|shadow|stroke|text|to|via)-(?:amber|blue|cyan|emerald|fuchsia|gray|green|indigo|lime|neutral|orange|pink|purple|red|rose|sky|slate|stone|teal|violet|yellow|zinc)-\d{2,3}\b/i },
];

const files = [];
for (const root of roots) await collect(root);

const violations = [];
for (const file of files) {
  if (allowedFiles.has(file)) continue;
  const lines = (await readFile(file, "utf8")).split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const { label, pattern } of rawColorPatterns) {
      if (pattern.test(line)) violations.push(`${file}:${index + 1} ${label}`);
    }
  });
}

if (violations.length) {
  console.error("Hardcoded UI colors found. Use semantic tokens from app/globals.css:\n");
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Color token check passed.");
}

async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (extensions.has(extname(entry.name))) files.push(relative(".", path));
  }
}
