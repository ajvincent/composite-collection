import fs from "fs/promises";
import path from "path";

export default async function readDirsDeep(root, excludeDirFilter = () => false) {
  const dirs = [path.normalize(root)], files = [];

  for (let i = 0; i < dirs.length; i++) {
    const currentDir = dirs[i];
    const entries = await fs.readdir(currentDir, { encoding: "utf-8", withFileTypes: true});

    entries.forEach(entry => {
      if (entry.isFile()) {
        files.push(path.join(currentDir, entry.name));
      }
      else if (entry.isDirectory()) {
        const fullPath = path.join(currentDir, entry.name);
        if (!excludeDirFilter(fullPath))
          dirs.push(fullPath);
      }
    });
  }

  dirs.sort();
  files.sort();
  return {dirs, files};
}
