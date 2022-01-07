import { copyFileTasks, generateCollections } from "#support/generateCollectionTools.mjs";

export default async function buildAdditionalFiles() {
  await copyFileTasks(
    "source/exports",
    "spec/_02_one-to-one-maps/generated",
    [
      "keys/Hasher.mjs",
      "keys/Composite.mjs",
    ]
  );

  await generateCollections(
    "source/exports",
    "spec/_02_one-to-one-maps/generated",
    [
      "WeakWeakMap.mjs",
      "WeakStrongMap.mjs",
    ]
  );
}
