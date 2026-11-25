import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const lock = path.join(root, "fonts.lock.json");
const config = JSON.parse(await readFile(lock, "utf8"));
const checkOnly = process.argv.includes("--check");
const update = !checkOnly && process.env.FONT_UPDATE_LOCK === "1";
const files = await Promise.all(
  [...config.faces, ...config.licenses].map(async (entry) => {
    const url = new URL(entry.source_url);
    if (
      url.protocol !== "https:" ||
      !["fonts.gstatic.com", "raw.githubusercontent.com"].includes(url.hostname)
    ) {
      throw new Error("Font source must use an approved HTTPS upstream");
    }
    const relative = entry.asset
      ? path.join("assets", entry.asset)
      : entry.path;
    const dest = path.resolve(root, relative);
    if (
      ![
        path.join(root, "assets/fonts") + path.sep,
        path.join(root, "public/fonts") + path.sep,
      ].some((prefix) => dest.startsWith(prefix))
    ) {
      throw new Error("Font destination escapes the fonts directories");
    }
    let bytes;
    if (checkOnly) {
      bytes = await readFile(dest);
    } else {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok)
        throw new Error(`Font download failed: ${response.status} ${url}`);
      bytes = Buffer.from(await response.arrayBuffer());
    }
    if (entry.asset && bytes.subarray(0, 4).toString() !== "wOF2")
      throw new Error(`Not WOFF2: ${url}`);
    const hash = createHash("sha256").update(bytes).digest("hex");
    if (!update && hash !== entry.sha256)
      throw new Error(
        `Checksum mismatch for ${relative}; review upstream before updating the lock`,
      );
    entry.sha256 = hash;
    return { dest, bytes };
  }),
);
// Verify the entire set before changing any source files.
for (const { dest, bytes } of checkOnly ? [] : files) {
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, bytes);
}
if (update) await writeFile(lock, JSON.stringify(config, null, 2) + "\n");
console.log(
  `${checkOnly ? "Checked" : "Installed"} ${config.faces.length} WOFF2 faces and ${config.licenses.length} licenses; checksums ${update ? "recorded" : "verified"}`,
);
