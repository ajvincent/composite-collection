import CollectionConfiguration from "./CollectionConfiguration.mjs";
export default class InMemoryDriver {
    #private;
    /**
     * @param {string}             targetDir      The destination directory.
     * @param {CompileTimeOptions} compileOptions Flags from an owner which may override configurations.
     */
    constructor(targetDir: string, compileOptions: object);
    /**
     * @param {CollectionConfiguration} configuration The configuration to add.
     * @param {string}                  relativePath  The path from the target directory to the destination module.
     */
    addConfiguration(configuration: CollectionConfiguration, relativePath: string): void;
    /**
     * @returns {Promise<void>}
     */
    run(): Promise<void>;
}
