import fs from "fs/promises";
import path from "path";
import readDirsDeep from "#source/utilities/readDirsDeep.mjs";

/**
 * Clean the tree.
 */
export default async function() {
  const rmTargets = (await Promise.all([
    readDirsDeep(
      path.join(process.cwd(), "exports")
    ).then((propertyBag => propertyBag.files.filter(file => path.extname(file) === ".mjs"))),
  
    readDirsDeep(
      path.join(process.cwd(), "spec")
    ).then(propertyBag => propertyBag.files.filter(file => /\/spec\/.*\/generated\/.*\.mjs$/.test(file))),
  ])).flat(Infinity);
  
  await Promise.all(rmTargets.map(
    rmTarget => fs.rm(rmTarget, { recursive: true })
  ));
}
