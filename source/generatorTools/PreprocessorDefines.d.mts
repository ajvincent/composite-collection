import type { oneToOneOptions } from "./ConfigurationData.mjs";
export default class PreprocessorDefines {
    className: string;
    importLines: string;
    argList: string;
    argNameList: string;
    weakMapKeys: string[];
    strongMapKeys: string[];
    weakSetElements: string[];
    strongSetElements: string[];
    mapKeys: string[];
    setKeys: string[];
    validateArguments: string;
    invokeValidate: boolean;
    validateMapArguments: string;
    validateSetArguments: string;
    validateValue: string;
    mapArgument0Type: string;
    setArgument0Type: string;
    valueType: string;
    baseClassName: string;
    configureOptions: oneToOneOptions | null;
    weakKeyName: string;
    baseArgList: string[];
    bindArgList: string[];
    wrapBaseClass: boolean;
    baseClassValidatesKey: boolean;
    baseClassValidatesValue: boolean;
}
