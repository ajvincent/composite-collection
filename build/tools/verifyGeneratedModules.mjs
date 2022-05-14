import url from "url";

/**
 * Verify the generated modules are importable.
 *
 * @param {string[]} allFiles The collections directory.
 * @returns {Promise<void>}
 */
export default async function verifyGeneratedModules(allFiles) {
  const allFilesPromise = await Promise.allSettled(allFiles.map(async targetFile => {
    const targetFileURL = url.pathToFileURL(targetFile);
    let t;
    try {
      t = (await import(targetFileURL));
    }
    catch (ex) {
      throw targetFile;
    }

    if (targetFile.endsWith("/keys/DefaultMap.mjs")) {
      if (typeof t.DefaultMap !== "function") {
        throw targetFile;
      }
      if (typeof t.DefaultWeakMap !== "function") {
        throw targetFile;
      }
    }

    else if (typeof t.default !== "function")
      throw targetFile;
  }));
  
  const failedModules = allFilesPromise.filter(p => p.status === "rejected");
  if (failedModules.length) {
    throw new Error("No default export for these modules:\n  " + failedModules.map(p => p.reason).join("\n  "));
  }
}
