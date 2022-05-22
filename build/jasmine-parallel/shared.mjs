import fs from "fs/promises";
import path from "path";
import url from "url";

const projectRoot = url.fileURLToPath(new URL("../..", import.meta.url));
const baseConfigContents = await fs.readFile(path.join(projectRoot, "spec/support/jasmine.json"), { encoding: "utf-8"})

/**
 * Get the base configuration.
 *
 * @returns {object} The configuration
 */
export default function getBaseConfig() {
  return JSON.parse(baseConfigContents);
}
