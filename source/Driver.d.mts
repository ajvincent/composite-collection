import InMemoryDriver from "./InMemoryDriver.mjs";
export default class Driver extends InMemoryDriver {
    #private;
    /**
     * @param {string}             configDir The configurations directory.
     * @param {string}             targetDir The destination directory.
     * @param {CompileTimeOptions} compileOptions Flags from an owner which may override configurations.
     */
    constructor(configDir: string, targetDir: string, compileOptions?: object);
    /**
     * @returns {Promise<void>}
     */
    run(): Promise<void>;
}
