import type { oneToOneOptions } from "./ConfigurationData.mjs";

export default class PreprocessorDefines {
  className = "";
  importLines = "";
  argList = "";
  argNameList = "";

  mapArgList = "";
  setArgList = "";

  weakMapKeys: string[] = [];
  strongMapKeys: string[] = [];
  weakSetElements: string[] = [];
  strongSetElements: string[] = [];
  mapKeys: string[] = [];
  setKeys: string[] = [];

  // validators
  validateArguments = "";
  invokeValidate = false;
  validateMapArguments = "";
  validateSetArguments = "";
  validateValue = "";

  mapArgument0Type = "";
  setArgument0Type = "";
  valueType = "";

  // one-to-one
  baseClassName = "";
  configureOptions: oneToOneOptions | null = null;
  weakKeyName = "";
  baseArgList: string[] = [];
  bindArgList: string[] = [];
  wrapBaseClass = false;
  baseClassValidatesKey = false;
  baseClassValidatesValue = false;
}
