declare type CollectionConfiguration = object;
import CollectionType from "./CollectionType.mjs";
/**
 * Configuration data class for internal use.  This class should never throw exceptions intentionally.
 */
export default class ConfigurationData {
    #private;
    static WeakMapConfiguration: symbol;
    static cloneData(configuration: CollectionConfiguration | symbol): ConfigurationData | undefined;
    /** @type {string} @constant */
    className: string;
    /** @type {string} @constant */
    collectionTemplate: string;
    /** @type {string | null} */
    fileOverview: string | null;
    /** @type {string} */
    importLines: string;
    /** @type {Map<string, CollectionType>} */
    parameterToTypeMap: Map<string, CollectionType>;
    /** @type {CollectionType | null} */
    valueType: CollectionType | null;
    constructor(className: string, collectionTemplate: string);
    get requiresKeyHasher(): boolean;
    get requiresWeakKey(): boolean;
    setFileOverview(overview: string): void;
    defineArgument(collectionType: CollectionType): void;
    get weakMapKeys(): string[];
    get strongMapKeys(): string[];
    get weakSetElements(): string[];
    get strongSetElements(): string[];
    /** @type {string} */
    get oneToOneKeyName(): string;
    /** @type {object | null} */
    get oneToOneBase(): Partial<CollectionConfiguration> | symbol | null;
    /** @type {object | null} */
    get oneToOneOptions(): object | null;
    setOneToOne(key: string, baseConfig: CollectionConfiguration | symbol, options: object): void;
    cloneData(): ConfigurationData;
    setConfiguration(configuration: CollectionConfiguration): void;
}
export {};
