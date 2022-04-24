type CollectionConfiguration = object;
import CollectionType from "./CollectionType.mjs";
void(CollectionType);

class ParameterNames {
  WeakMap: string[] = [];
  Map: string[] = [];
  WeakSet: string[] = [];
  Set: string[] = [];
}

class OneToOneData {
  key: string;
  baseConfig: CollectionConfiguration;
  options: object;

  constructor(key: string, baseConfig: CollectionConfiguration, options: object) {
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
  static #configToDataMap: WeakMap<CollectionConfiguration, ConfigurationData> = new WeakMap;

  static cloneData(
    configuration: CollectionConfiguration,
  ) : ConfigurationData | undefined
  {
    const data = this.#configToDataMap.get(configuration);
    return data?.cloneData();
  }

  /** @type {string} @constant */
  className: string;

  /** @type {string} @constant */
  collectionTemplate: string;

  /** @type {string | null} */
  fileOverview: string | null = null;

  /** @type {string} */
  importLines = "";

  /** @type {Map<string, CollectionType>} */
  parameterToTypeMap: Map<string, CollectionType> = new Map;

  /** @type {ParameterNames} */
  #parameterNames = new ParameterNames;

  /** @type {CollectionType | null} */
  valueType: CollectionType | null = null;

  #oneToOneData: OneToOneData | null = null;

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

  defineArgument(collectionType: CollectionType) : void {
    this.parameterToTypeMap.set(collectionType.argumentName, collectionType);
    this.#parameterNames[collectionType.mapOrSetType].push(collectionType.argumentName);
  }

  get weakMapKeys() : string[] {
    return this.#parameterNames.WeakMap.slice();
  }

  get strongMapKeys(): string[] {
    return this.#parameterNames.Map.slice();
  }

  get weakSetElements() : string[] {
    return this.#parameterNames.WeakSet.slice();
  }

  get strongSetElements() : string[] {
    return this.#parameterNames.Set.slice();
  }

  /** @type {string} */
  get oneToOneKeyName() : string {
    return this.#oneToOneData?.key ?? "";
  }

  /** @type {object | null} */
  get oneToOneBase(): Partial<CollectionConfiguration> | null {
    return this.#oneToOneData?.baseConfig ?? null;
  }

  /** @type {object | null} */
  get oneToOneOptions() : object | null {
    return this.#oneToOneData?.options ?? null;
  }

  setOneToOne(key: string, baseConfig: CollectionConfiguration, options: object) : void {
    this.#oneToOneData = new OneToOneData(key, baseConfig, options);
  }

  cloneData() : ConfigurationData {
    const result = new ConfigurationData(this.className, this.collectionTemplate);
    this.#assignToClone(result);
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
    target.importLines = this.importLines;

    // Argument parameters
    for (let value of this.parameterToTypeMap.values())
      target.defineArgument(value);

    target.valueType = this.valueType;

    if (this.#oneToOneData) {
      target.setOneToOne(
        this.#oneToOneData.key,
        this.#oneToOneData.baseConfig,
        this.#oneToOneData.options
      );
    }
  }

  setConfiguration(configuration: CollectionConfiguration) : void {
    ConfigurationData.#configToDataMap.set(configuration, this);
  }
}

Object.freeze(ConfigurationData.prototype);
Object.freeze(ConfigurationData);
