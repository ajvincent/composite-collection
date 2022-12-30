import url from "url";
import path from "path";
import fs from "fs/promises";

const projectRoot = url.fileURLToPath(new URL("../../..", import.meta.url));
const specDir = url.fileURLToPath(new URL("..", import.meta.url));
import { generateCollections } from "#build/tools/generateCollectionTools.mjs";
import { PromiseAllParallel } from "#source/utilities/PromiseTypes.mjs";

/** Do the build. */
export default async function build() {
  await copyAndRenameCompileTests();
  await createExportsForCoverage();
}

/** Copy and rename compile tests */
async function copyAndRenameCompileTests() {
  const sourceDir = path.join(specDir, "compileTests");
  const entries = (await fs.readdir(sourceDir, { encoding: "utf-8", withFileTypes: true}));

  const files = entries.reduce((fileList, entry) => {
    if (entry.isFile() && (entry.name.endsWith(".mts.in")))
      fileList.push(entry.name);
    return fileList;
  }, []);

  const targetDir = path.join(specDir, "generated", "compileTests");
  await fs.mkdir(targetDir, { recursive: true });

  await PromiseAllParallel(files, async leafName => {
    await fs.copyFile(
      path.join(sourceDir, leafName),
      path.join(targetDir, leafName.replace(/\.in$/, ""))
    );
  });
}

/**
 * Create the export modules for test coverage.
 */
async function createExportsForCoverage() {
  const sourceDir = "source/exports";
  const configsDir = path.join(projectRoot, sourceDir);
  const entries = (await fs.readdir(configsDir, { encoding: "utf-8", withFileTypes: true}));
  const files = entries.reduce((fileList, entry) => {
    if (entry.isFile() && (path.extname(entry.name) === ".mjs"))
      fileList.push(entry.name);
    return fileList;
  }, []);

  await generateCollections(sourceDir, path.join(specDir, "generated"), files);
}
