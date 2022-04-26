/**
 * A catch-all for run-time options for CodeGenerator, and anyone who invokes it.
 *
 * @public
 */
export default class CompileTimeOptions {
    licenseText: string;
    license: string;
    author: string;
    copyright: string;
    disableKeyOptimization: boolean;
    generateTypeScript: boolean;
    constructor(properties?: Partial<CompileTimeOptions>);
}
