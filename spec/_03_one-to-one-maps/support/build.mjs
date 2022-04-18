import { copyFileTasks, generateCollections } from "#build/tools/generateCollectionTools.mjs";

/**
 * Generate additional support files for the collections in ../generated.
 */
export default async function buildAdditionalFiles() {
  await copyFileTasks(
    "source/exports",
    "spec/_03_one-to-one-maps/generated",
    [
      "keys/Hasher.mjs",
      "keys/Composite.mjs",
    ]
  );

  await generateCollections(
    "source/exports",
    "spec/_03_one-to-one-maps/generated",
    [
      "WeakWeakMap.mjs",
      "WeakStrongMap.mjs",
    ]
  );
}
