// Copies the brand source of truth (design/) into the web app. Run: npm run sync:design
import { cpSync, mkdirSync, existsSync } from "node:fs";
const web = "apps/web";
if (!existsSync(web)) { console.error(`Missing ${web}. Create the Astro app first (prompt P0/P1).`); process.exit(1); }
const jobs = [
  ["design/fonts", `${web}/public/fonts`],
  ["design/tokens.css", `${web}/src/styles/tokens.css`],
  ["design/fonts.css", `${web}/src/styles/fonts.css`],
  ["design/base.css", `${web}/src/styles/base.css`],
  ["design/animations.css", `${web}/src/styles/animations.css`],
  // Optional: copied only if the logo files exist
  ["design/logo", `${web}/public/logo`],
  ["design/logo/favicon.svg", `${web}/public/favicon.svg`],
  ["design/logo/favicon.ico", `${web}/public/favicon.ico`],
  ["design/logo/apple-touch-icon.png", `${web}/public/apple-touch-icon.png`],
];
for (const [from, to] of jobs) {
  if (!existsSync(from)) { console.log(`skip (missing): ${from}`); continue; }
  mkdirSync(to.substring(0, to.lastIndexOf("/")), { recursive: true });
  cpSync(from, to, { recursive: true, filter: (src) => !src.endsWith("README.md") });
  console.log(`${from} -> ${to}`);
}
