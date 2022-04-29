import url from "url";
import path from "path";
import fs from "fs/promises";

const projectRoot = url.fileURLToPath(new URL("../../..", import.meta.url));
const specDir = url.fileURLToPath(new URL("..", import.meta.url));
import { generateCollections } from "#build/tools/generateCollectionTools.mjs";

/**
 * Create the export modules for test coverage.
 */
export default async function createExportsForCoverage() {
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
