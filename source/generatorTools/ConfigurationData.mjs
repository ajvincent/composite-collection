import CollectionType from "./CollectionType.mjs";
void (CollectionType);
class ParameterNames {
    WeakMap = [];
    Map = [];
    WeakSet = [];
    Set = [];
}
/**
 * Configuration data class for internal use.  This class should never throw exceptions intentionally.
 */
export default class ConfigurationData {
    static #configToDataMap = new WeakMap;
    static cloneData(configuration, properties) {
        const data = this.#configToDataMap.get(configuration);
        return data?.cloneData(properties);
    }
    /** @type {string} @constant */
    className = "";
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
    cloneData(properties = {}) {
        const result = new ConfigurationData(this.className, this.collectionTemplate);
        this.#assignToClone(result);
        this.#extend(result, properties);
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
    }
    /**
     * Temporary method to define additional properties.
     *
     * @param {ConfigurationData} target     The target.
     * @param {object}            properties A property bag.
     */
    #extend(target, properties) {
        const keys = Reflect.ownKeys(properties);
        keys.forEach(key => {
            const desc = Reflect.getOwnPropertyDescriptor(properties, key);
            Reflect.defineProperty(target, key, desc);
        });
    }
    setConfiguration(configuration) {
        ConfigurationData.#configToDataMap.set(configuration, this);
    }
}
Object.freeze(ConfigurationData.prototype);
Object.freeze(ConfigurationData);
//# sourceMappingURL=ConfigurationData.mjs.map