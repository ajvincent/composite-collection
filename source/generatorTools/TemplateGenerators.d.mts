import JSDocGenerator from "./JSDocGenerator.mjs";
import type { ReadonlyDefines } from "./PreprocessorDefines.mjs";
export declare type TemplateFunction = (defines: ReadonlyDefines, ...docGenerators: JSDocGenerator[]) => string;
import { ReadonlyRequiredMap } from "../utilities/RequiredMap.mjs";
declare const TemplateGenerators: ReadonlyRequiredMap<string, TemplateFunction>;
export default TemplateGenerators;
