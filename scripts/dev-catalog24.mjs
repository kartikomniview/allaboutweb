// `npm run dev:catalog24`: the dev server with every host treated as catalog24.in,
// for testing the Catalog24 site from a phone on the LAN (see src/proxy.ts).
// On this machine you can just open http://catalog24.localhost:3000 with `npm run dev`.
import { spawn } from "node:child_process";

const child = spawn("npx", ["next", "dev", ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, DEV_SITE: "catalog24" },
});
child.on("exit", (code) => process.exit(code ?? 0));
