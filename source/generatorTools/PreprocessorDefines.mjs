export default class PreprocessorDefines {
    className = "";
    importLines = "";
    argList = "";
    mapArgList = "";
    setArgList = "";
    weakMapKeys = [];
    strongMapKeys = [];
    weakSetElements = [];
    strongSetElements = [];
    mapKeys = [];
    setKeys = [];
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
    baseArgList = [];
    bindArgList = [];
    wrapBaseClass = false;
    baseClassValidatesKey = false;
    baseClassValidatesValue = false;
    // TypeScript support
    // '__MK1__'
    tsMapTypes = [];
    // `__SK1__`
    tsSetTypes = [];
    // `key1: __MK1__`
    tsMapKeys = [];
    // `key1: __SK1__`
    tsSetKeys = [];
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
//#endregion readonly boilerplate
//# sourceMappingURL=PreprocessorDefines.mjs.map