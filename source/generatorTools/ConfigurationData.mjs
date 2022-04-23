/**
 * Configuration data class for internal use.  This class should never throw exceptions.
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
    constructor(className, collectionTemplate) {
        this.className = className;
        Reflect.defineProperty(this, "className", {
            writable: false,
            enumerable: true,
            configurable: false,
        });
        this.collectionTemplate = collectionTemplate;
    }
    get requiresKeyHasher() {
        return this.collectionTemplate.includes("Strong");
    }
    get requiresWeakKey() {
        return this.collectionTemplate.includes("Weak");
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
        void (target);
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