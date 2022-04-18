import path from "path";
import fs from "fs/promises";

import { copyFileTasks, generateCollections } from "#build/tools/generateCollectionTools.mjs";

/**
 * Generate additional support files for the collections in ../generated.
 */
export default async function buildAdditionalFiles() {
  await copyFileTasks(
    "source/exports",
    "spec/_05_exports/generated",
    [
      "keys/Hasher.mjs",
      "keys/Composite.mjs",
    ]
  );

  const exportDir = path.join(process.cwd(), "source/exports");
  const entries = (await fs.readdir(exportDir, { encoding: "utf-8", withFileTypes: true}));
  const files = entries.reduce((fileList, entry) => {
    if (entry.isFile() && (path.extname(entry.name) === ".mjs"))
      fileList.push(entry.name);
    return fileList;
  }, []);

  await generateCollections(
    "source/exports",
    "spec/_05_exports/generated",
    files
  );
}
