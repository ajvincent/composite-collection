import CollectionType from "./CollectionType.mjs";
void (CollectionType);
class ParameterNames {
    WeakMap = [];
    Map = [];
    WeakSet = [];
    Set = [];
}
class OneToOneData {
    key;
    baseConfig;
    options;
    constructor(key, baseConfig, options) {
        this.key = key;
        this.baseConfig = baseConfig;
        this.options = JSON.parse(JSON.stringify(options));
        Object.freeze(this);
        Object.freeze(this.options);
    }
}
/**
 * Configuration data class for internal use.  This class should never throw exceptions intentionally.
 */
export default class ConfigurationData {
    static #configToDataMap = new WeakMap;
    static cloneData(configuration) {
        const data = this.#configToDataMap.get(configuration);
        return data?.cloneData();
    }
    /** @type {string} @constant */
    className;
    /** @type {string} @constant */
    collectionTemplate;
    /** @type {string | null} */
    fileOverview = null;
    /** @type {string} */
    importLines = "";
    /** @type {Map<string, CollectionType>} */
    parameterToTypeMap = new Map;
    /** @type {ParameterNames} */
    #parameterNames = new ParameterNames;
    /** @type {CollectionType | null} */
    valueType = null;
    #oneToOneData = null;
    constructor(className, collectionTemplate) {
        this.className = className;
        this.collectionTemplate = collectionTemplate;
        this.#markReadonly("className");
    }
    #markReadonly(...keys) {
        keys.forEach(key => {
            Reflect.defineProperty(this, key, ConfigurationData.#readonlyDesc);
        });
    }
    static #readonlyDesc = {
        writable: false,
        enumerable: true,
        configurable: false
    };
    get requiresKeyHasher() {
        return this.collectionTemplate.includes("Strong");
    }
    get requiresWeakKey() {
        return this.collectionTemplate.includes("Weak");
    }
    setFileOverview(overview) {
        this.fileOverview = overview;
        this.#markReadonly("fileOverview");
    }
    defineArgument(collectionType) {
        this.parameterToTypeMap.set(collectionType.argumentName, collectionType);
        this.#parameterNames[collectionType.mapOrSetType].push(collectionType.argumentName);
    }
    get weakMapKeys() {
        return this.#parameterNames.WeakMap.slice();
    }
    get strongMapKeys() {
        return this.#parameterNames.Map.slice();
    }
    get weakSetElements() {
        return this.#parameterNames.WeakSet.slice();
    }
    get strongSetElements() {
        return this.#parameterNames.Set.slice();
    }
    /** @type {string} */
    get oneToOneKeyName() {
        return this.#oneToOneData?.key ?? "";
    }
    /** @type {object | null} */
    get oneToOneBase() {
        return this.#oneToOneData?.baseConfig ?? null;
    }
    /** @type {object | null} */
    get oneToOneOptions() {
        return this.#oneToOneData?.options ?? null;
    }
    setOneToOne(key, baseConfig, options) {
        this.#oneToOneData = new OneToOneData(key, baseConfig, options);
    }
    cloneData() {
        const result = new ConfigurationData(this.className, this.collectionTemplate);
        this.#assignToClone(result);
        return result;
    }
    /**
     * Copy properties from this to the target.
     *
     * @param {ConfigurationData} target The target.
     */
    #assignToClone(target) {
        if (this.fileOverview)
            target.setFileOverview(this.fileOverview);
        target.importLines = this.importLines;
        // Argument parameters
        for (let value of this.parameterToTypeMap.values())
            target.defineArgument(value);
        target.valueType = this.valueType;
        if (this.#oneToOneData) {
            target.setOneToOne(this.#oneToOneData.key, this.#oneToOneData.baseConfig, this.#oneToOneData.options);
        }
    }
    setConfiguration(configuration) {
        ConfigurationData.#configToDataMap.set(configuration, this);
    }
}
Object.freeze(ConfigurationData.prototype);
Object.freeze(ConfigurationData);
//# sourceMappingURL=ConfigurationData.mjs.map