import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repository =
  "https://github.com/openskope/openskope.github.io.git";
export const files = [
  "footer.json",
  "tokens.json",
  "footer.css",
  "application-policy.json",
  "CITATION.cff",
];
const root = fileURLToPath(new URL("../", import.meta.url));
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const validRevision = (revision) =>
  typeof revision === "string" && /^[a-f0-9]{40}$/.test(revision);
const nonempty = (value) =>
  typeof value === "string" && value.trim().length > 0;

export function validateBundle(bundle) {
  const footer = JSON.parse(bundle["footer.json"]);
  const tokens = JSON.parse(bundle["tokens.json"]);
  const policy = JSON.parse(bundle["application-policy.json"]);
  if (footer.schema_version !== 1 || tokens.schema_version !== 1)
    throw Error("Unsupported web-assets schema");
  if (
    !Number.isInteger(footer.copyright?.start_year) ||
    !nonempty(footer.copyright?.holder)
  )
    throw Error("Invalid footer copyright");
  if (
    !Array.isArray(footer.acknowledgments) ||
    footer.acknowledgments.length === 0
  )
    throw Error("Missing footer acknowledgments");
  for (const paragraph of footer.acknowledgments) {
    if (!Array.isArray(paragraph) || paragraph.length === 0)
      throw Error("Invalid acknowledgment paragraph");
    for (const segment of paragraph) {
      if (
        !nonempty(segment.text) ||
        (segment.href !== undefined && !/^https:\/\//.test(segment.href))
      )
        throw Error("Invalid acknowledgment segment");
    }
  }
  for (const label of ["citation", "terms", "build", "source"])
    if (!nonempty(footer.labels?.[label])) throw Error("Missing footer label");
  for (const name of ["citation", "terms"])
    if (!/^\/(?!\/)/.test(footer.content_links?.[name] ?? ""))
      throw Error("Invalid content link");
  if (!tokens.css_variables || Object.keys(tokens.css_variables).length === 0)
    throw Error("Missing style tokens");
  for (const [key, value] of Object.entries(tokens.css_variables)) {
    if (
      !/^--skope-[a-z-]+$/.test(key) ||
      !nonempty(value) ||
      /[;{}<>]/.test(value)
    )
      throw Error("Invalid style token");
  }
  if (!nonempty(policy.terms) || !nonempty(policy.citationGuidance))
    throw Error("Missing application policy");
  if (!bundle["CITATION.cff"].includes("cff-version:"))
    throw Error("Missing citation metadata");
}

async function readBundle(directory) {
  return Object.fromEntries(
    await Promise.all(
      files.map(async (name) => [
        name,
        await readFile(path.join(directory, name), "utf8"),
      ]),
    ),
  );
}

export async function importBundle(
  source,
  destination,
  revision,
  citationOutput,
) {
  if (!validRevision(revision))
    throw Error(
      "WEB_ASSETS_REVISION must be a full lowercase 40-character commit SHA",
    );
  const bundle = await readBundle(source);
  validateBundle(bundle); // Validate the complete export before changing any destination files.
  const lock = {
    schema_version: 1,
    repository,
    revision,
    source_directory: "shared/web",
    files: Object.fromEntries(
      files.map((name) => [name, sha256(bundle[name])]),
    ),
  };
  await mkdir(path.join(destination, "vendor/web-assets"), { recursive: true });
  for (const name of files)
    await writeFile(
      path.join(destination, "vendor/web-assets", name),
      bundle[name],
    );
  if (citationOutput) await writeFile(citationOutput, bundle["CITATION.cff"]);
  await writeFile(
    path.join(destination, "web-assets.lock.json"),
    JSON.stringify(lock, null, 2) + "\n",
  );
}

export async function checkBundle(destination) {
  const lock = JSON.parse(
    await readFile(path.join(destination, "web-assets.lock.json"), "utf8"),
  );
  if (
    lock.schema_version !== 1 ||
    lock.repository !== repository ||
    lock.source_directory !== "shared/web" ||
    !validRevision(lock.revision) ||
    JSON.stringify(Object.keys(lock.files ?? {}).sort()) !==
      JSON.stringify([...files].sort())
  )
    throw Error("Invalid web-assets source lock");
  const bundle = await readBundle(path.join(destination, "vendor/web-assets"));
  for (const name of files)
    if (sha256(bundle[name]) !== lock.files[name])
      throw Error(
        `Web-assets checksum mismatch: ${name}; import from the reviewed source commit`,
      );
  validateBundle(bundle);
  return lock;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    if (process.argv[2] === "--import") {
      if (!process.argv[3]) throw Error("Missing export directory");
      await importBundle(
        process.argv[3],
        root,
        process.env.WEB_ASSETS_REVISION,
        process.env.WEB_ASSETS_CITATION_OUTPUT,
      );
    } else if (process.argv.length > 2 && process.argv[2] !== "--check")
      throw Error("Use --check or --import <export-directory>");
    const lock = await checkBundle(root);
    console.log(
      `Shared web assets verified: ${lock.revision} (${files.length} files)`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
