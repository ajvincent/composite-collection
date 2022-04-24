type CollectionConfiguration = object;

/**
 * Configuration data class for internal use.  This class should never throw exceptions intentionally.
 */
export default class ConfigurationData {
  static #configToDataMap: WeakMap<CollectionConfiguration, ConfigurationData> = new WeakMap;

  static cloneData(
    configuration: CollectionConfiguration,
    properties: object
  ) : ConfigurationData | undefined
  {
    const data = this.#configToDataMap.get(configuration);
    return data?.cloneData(properties);
  }

  /** @type {string} @constant */
  className = "";

  /** @type {string} @constant */
  collectionTemplate: string;

  /** @type {string | null} */
  fileOverview: string | null = null;

  /** @type {string} */
  importLines = "";

  constructor(className: string, collectionTemplate: string) {
    this.className = className;
    this.collectionTemplate = collectionTemplate;
    this.#markReadonly("className");
  }

  #markReadonly(...keys: string[]) : void {
    keys.forEach(key => {
      Reflect.defineProperty(this, key, ConfigurationData.#readonlyDesc);
    })
  }

  static #readonlyDesc: Readonly<PropertyDescriptor> = {
    writable: false,
    enumerable: true,
    configurable: false
  };

  get requiresKeyHasher() : boolean {
    return this.collectionTemplate.includes("Strong");
  }

  get requiresWeakKey() : boolean {
    return this.collectionTemplate.includes("Weak");
  }

  setFileOverview(overview: string) : void {
    this.fileOverview = overview;
    this.#markReadonly("fileOverview");
  }

  cloneData(properties: object = {}) : ConfigurationData {
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
  #assignToClone(target: ConfigurationData) : void {
    if (this.fileOverview)
      target.setFileOverview(this.fileOverview);
    if (this.importLines)
      target.importLines = this.importLines;
  }

  /**
   * Temporary method to define additional properties.
   *
   * @param {ConfigurationData} target     The target.
   * @param {object}            properties A property bag.
   */
  #extend(target: ConfigurationData, properties: object) : void {
    const keys = Reflect.ownKeys(properties);
    keys.forEach(key => {
      const desc = Reflect.getOwnPropertyDescriptor(properties, key)!;
      Reflect.defineProperty(target, key, desc);
    });
  }

  setConfiguration(configuration: CollectionConfiguration) : void {
    ConfigurationData.#configToDataMap.set(configuration, this);
  }
}

Object.freeze(ConfigurationData.prototype);
Object.freeze(ConfigurationData);
