import { PromiseAllParallel } from "../utilities/PromiseTypes.mjs";
/**
 * @type {Map<string, Function>}
 * @package
 */
const TemplateGenerators = new Map();
import readDirsDeep from "../utilities/readDirsDeep.mjs";
const templateDirURL = new URL("../../templates", import.meta.url);
const templateDir = templateDirURL.pathname;
const allFiles = (await readDirsDeep(templateDir)).files;
await PromiseAllParallel(allFiles, async (fullPath) => {
    let baseName = fullPath.substring(templateDir.length + 1);
    if (!baseName.endsWith(".in.mjs"))
        return;
    const generator = (await import(fullPath)).default;
    if (typeof generator !== "function")
        throw new Error("generator isn't a function?");
    TemplateGenerators.set(baseName.replace(/\.in\.mjs$/, ""), generator);
});
export default TemplateGenerators;
//# sourceMappingURL=TemplateGenerators.mjs.map