import { PromiseAllParallel } from "../utilities/PromiseTypes.mjs";
import { RequiredMap } from "../utilities/RequiredMap.mjs";
/**
 * @type {Map<string, Function>}
 * @package
 */
const __TemplateGenerators__ = new RequiredMap();
import readDirsDeep from "../utilities/readDirsDeep.mjs";
const templateDirURL = new URL("../../templates", import.meta.url);
const templateDir = templateDirURL.pathname;
const allFiles = (await readDirsDeep(templateDir)).files;
await PromiseAllParallel(allFiles, async (fullPath) => {
    const baseName = fullPath.substring(templateDir.length + 1);
    if (!baseName.endsWith(".in.mjs"))
        return;
    const generator = (await import(fullPath)).default;
    if (typeof generator !== "function")
        throw new Error("generator isn't a function?");
    __TemplateGenerators__.set(baseName.replace(/\.in\.mjs$/, ""), generator);
});
const TemplateGenerators = __TemplateGenerators__;
export default TemplateGenerators;
//# sourceMappingURL=TemplateGenerators.mjs.map