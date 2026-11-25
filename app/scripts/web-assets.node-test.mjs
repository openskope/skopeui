import { test } from "node:test";
import assert from "node:assert/strict";
import { cp, mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { importBundle, checkBundle } from "./web-assets.mjs";
const source = fileURLToPath(new URL("../vendor/web-assets/", import.meta.url));
const revision = "a".repeat(40);
async function temporary(run) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "web-assets-"));
  try {
    await run(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
test("an exact source export can be imported and verified offline", () =>
  temporary(async (dir) => {
    await importBundle(source, dir, revision);
    assert.equal((await checkBundle(dir)).revision, revision);
  }));
test("modified vendored CSS fails integrity verification", () =>
  temporary(async (dir) => {
    await importBundle(source, dir, revision);
    await writeFile(path.join(dir, "vendor/web-assets/footer.css"), "changed");
    await assert.rejects(checkBundle(dir), /checksum mismatch/);
  }));
test("floating revisions are rejected before writing", () =>
  temporary(async (dir) => {
    await assert.rejects(importBundle(source, dir, "main"), /commit SHA/);
    await assert.rejects(readFile(path.join(dir, "web-assets.lock.json")), {
      code: "ENOENT",
    });
  }));
test("an incomplete source does not overwrite an accepted bundle", () =>
  temporary(async (dir) => {
    await importBundle(source, dir, revision);
    const before = await readFile(
      path.join(dir, "web-assets.lock.json"),
      "utf8",
    );
    await assert.rejects(importBundle(dir, dir, "b".repeat(40)));
    assert.equal(
      await readFile(path.join(dir, "web-assets.lock.json"), "utf8"),
      before,
    );
    await checkBundle(dir);
  }));
test("source substitution in the lock fails verification", () =>
  temporary(async (dir) => {
    await importBundle(source, dir, revision);
    const file = path.join(dir, "web-assets.lock.json"),
      lock = JSON.parse(await readFile(file, "utf8"));
    lock.repository = "https://example.org/other.git";
    await writeFile(file, JSON.stringify(lock));
    await assert.rejects(checkBundle(dir), /source lock/);
  }));

test("an unsupported schema does not replace an accepted bundle or root citation", () =>
  temporary(async (dir) => {
    const destination = path.join(dir, "accepted");
    const candidate = path.join(dir, "candidate");
    const rootCitation = path.join(dir, "CITATION.cff");
    await importBundle(source, destination, revision, rootCitation);
    const before = await readFile(
      path.join(destination, "web-assets.lock.json"),
      "utf8",
    );
    const citationBefore = await readFile(rootCitation, "utf8");
    await cp(source, candidate, { recursive: true });
    const file = path.join(candidate, "footer.json");
    const footer = JSON.parse(await readFile(file, "utf8"));
    footer.schema_version = 2;
    await writeFile(file, JSON.stringify(footer));
    await assert.rejects(
      importBundle(candidate, destination, "b".repeat(40), rootCitation),
      /Unsupported web-assets schema/,
    );
    assert.equal(
      await readFile(path.join(destination, "web-assets.lock.json"), "utf8"),
      before,
    );
    assert.equal(await readFile(rootCitation, "utf8"), citationBefore);
    await checkBundle(destination);
  }));
