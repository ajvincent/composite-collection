import type { oneToOneOptions } from "./ConfigurationData.mjs";

export default class PreprocessorDefines {
  className = "";
  importLines = "";
  argList = "";
  argNameList = "";

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

// Shamelessly copied from https://github.com/Microsoft/TypeScript/issues/13923
type primitive = string | number | boolean | undefined | null;
type DeepReadonly<T> =
  T extends primitive ? T :
  T extends Array<infer U> ? DeepReadonlyArray<U> :
  DeepReadonlyObject<T>

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>
}

export type ReadonlyDefines = DeepReadonly<PreprocessorDefines>;
