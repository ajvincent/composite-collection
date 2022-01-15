/**
 * Canonicalize a string to be either empty, or trimmed at both ends of whitespace.
 *
 * @param {string}   value The original input string.
 * @returns {string} The canonical string.
 */
function validString(value) {
  return (typeof value === "string") && value.trim().length > 0 ? value : "";
}

/**
 * A catch-all for run-time options for CodeGenerator, and anyone who invokes it.
 *
 * @public
 */
export default class CompileTimeOptions {
  constructor(properties) {
    this.sourceFile       = validString(properties.sourceFile);
    this.sourcesDirectory = validString(properties.sourcesDirectory);

    this.licenseText      = validString(properties.licenseText);
    this.author           = validString(properties.author);
    this.copyright        = validString(properties.copyright);

    /**
     * If true, treat one map key as n map keys, one set key as n set keys.
     * This means including KeyHasher's, WeakKeyComposer's when you might not need to.
     *
     * @type {boolean}
     */
    this.disableKeyOptimization = Boolean(properties.disableKeyOptimization);
  }
}
Object.freeze(CompileTimeOptions);
Object.freeze(CompileTimeOptions.prototype);
