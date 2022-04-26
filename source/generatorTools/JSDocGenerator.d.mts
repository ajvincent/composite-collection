import CollectionType from "./CollectionType.mjs";
import type { stringAndTemplate } from "../jsdoc-method-sets/MethodTemplateType.mjs";
/**
 * A generator of JSDoc block comments from Map/Set templates and user arguments.
 *
 * @package
 */
export default class JSDocGenerator {
    #private;
    /**
     * @param {string}  className The class name.
     * @param {boolean} isSet     True if we're documenting a set, false if a map.
     */
    constructor(className: string, isSet: boolean);
    setMethodParametersByModule(moduleName: string): Promise<void>;
    setMethodParametersDirectly(iterable: stringAndTemplate[]): void;
    /**
     * Add a parameter definition.
     *
     * @param {CollectionType} parameter The parameter type information.
     * @public
     */
    addParameter(parameter: CollectionType): void;
    /**
     * Build a JSDoc comment block.
     *
     * @param {string} templateName  The name of the template to use.
     * @param {number} baseIndent    The number of spaces each line should be indented.
     * @returns {string} The completed JSDoc comment to insert into the template.
     * @public
     */
    buildBlock(templateName: string, baseIndent: number): string;
}
