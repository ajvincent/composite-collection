export default class PreprocessorDefines {
  className = "";
  importLines = "";
  argList = "";

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

  // one-to-one
  baseClassName = "";
  weakKeyName = "";
  baseArgList: string[] = [];
  bindArgList: string[] = [];
  wrapBaseClass = false;
  baseClassValidatesKey = false;
  baseClassValidatesValue = false;

  // TypeScript support
  // '__MK1__'
  tsMapTypes: string[] = [];

  // `__SK1__`
  tsSetTypes : string[] = [];

  // `key1: __MK1__`
  tsMapKeys:  string[] = [];

  // `key1: __SK1__`
  tsSetKeys : string[] = [];

  tsValueType = "__V__";
  tsValueKey = "value: __V__";

  // The one-to-one key type (__MK0__, for example)
  tsOneToOneKeyType = "";

  /* `<
    __MK1__ extends object,
    __SK1__ extends unknown,
    __V__ extends unknown
  >` */
  tsGenericFull = "";
}

//#region readonly boilerplate
// Shamelessly copied from https://github.com/Microsoft/TypeScript/issues/13923
type primitive = string | number | boolean | undefined | null;
type DeepReadonly<T> =
  T extends primitive ? T :
  T extends Array<infer U extends primitive> ? ReadonlyArray<U> :
  T extends Array<infer U> ? DeepReadonlyArray<U> :
  DeepReadonlyObject<T>

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>
}

export type ReadonlyDefines = DeepReadonly<PreprocessorDefines>;
//#endregion readonly boilerplate
