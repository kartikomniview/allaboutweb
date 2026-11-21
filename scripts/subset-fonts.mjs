// Regenerates the self-hosted fonts in src/fonts/ from the upstream google/fonts repo.
//
//   npm install --no-save subset-font@2 && node scripts/subset-fonts.mjs
//
// The fonts are self-hosted (next/font/local) so `next build` never needs to reach
// Google; with next/font/google a blocked or flaky fonts.gstatic.com fails the build
// with "Can't resolve '@vercel/turbopack-next/internal/font/google/font'".
//
// Each file is subset to Google Fonts' latin + latin-ext ranges (latin-ext carries ₹)
// and variable fonts are trimmed to the weights we use. Edit JOBS to add a weight or
// style, then update the matching definition file in src/fonts/.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import subsetFont from "subset-font";

const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/fonts");
const UPSTREAM = "https://raw.githubusercontent.com/google/fonts/main/ofl";

// The unicode-range of Google Fonts' latin and latin-ext @font-face rules.
const RANGES = `
U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,
U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD,
U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1D00-1DBF,U+1E00-1E9F,
U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF`;

const OPEN_SANS_AXES = { wdth: 100, wght: { min: 400, max: 800 } };
const JOBS = [
  { src: "opensans/OpenSans[wdth,wght].ttf", out: "OpenSans.woff2", axes: OPEN_SANS_AXES },
  { src: "opensans/OpenSans-Italic[wdth,wght].ttf", out: "OpenSans-Italic.woff2", axes: OPEN_SANS_AXES },
  { src: "plusjakartasans/PlusJakartaSans[wght].ttf", out: "PlusJakartaSans.woff2", axes: { wght: { min: 400, max: 800 } } },
  { src: "poppins/Poppins-Regular.ttf", out: "Poppins-Regular.woff2" },
  { src: "poppins/Poppins-Medium.ttf", out: "Poppins-Medium.woff2" },
  { src: "poppins/Poppins-SemiBold.ttf", out: "Poppins-SemiBold.woff2" },
  { src: "poppins/Poppins-Bold.ttf", out: "Poppins-Bold.woff2" },
];
const LICENSES = [
  { src: "opensans/OFL.txt", out: "OFL-OpenSans.txt" },
  { src: "plusjakartasans/OFL.txt", out: "OFL-PlusJakartaSans.txt" },
  { src: "poppins/OFL.txt", out: "OFL-Poppins.txt" },
];

const codePoints = [];
for (const part of RANGES.replace(/\s/g, "").split(",")) {
  const [lo, hi = lo] = part.slice(2).split("-").map((h) => parseInt(h, 16));
  for (let cp = Math.max(lo, 0x20); cp <= hi; cp++) codePoints.push(cp);
}
const text = String.fromCodePoint(...codePoints);
fs.mkdirSync(OUT_DIR, { recursive: true });

async function download(src) {
  const res = await fetch(`${UPSTREAM}/${encodeURI(src)}`);
  if (!res.ok) throw new Error(`${res.status} fetching ${src}`);
  return Buffer.from(await res.arrayBuffer());
}

for (const job of JOBS) {
  const font = await subsetFont(await download(job.src), text, {
    targetFormat: "woff2",
    noHinting: true, // Google serves these unhinted too
    ...(job.axes && { variationAxes: job.axes }),
  });
  fs.writeFileSync(path.join(OUT_DIR, job.out), font);
  console.log(`${job.out.padEnd(24)} ${(font.length / 1024).toFixed(1)} KB`);
}
for (const license of LICENSES) {
  fs.writeFileSync(path.join(OUT_DIR, license.out), await download(license.src));
}
