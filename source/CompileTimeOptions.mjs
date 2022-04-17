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
  constructor(properties = {}) {
    this.licenseText      = validString(properties.licenseText);
    this.license          = validString(properties.license);
    this.author           = validString(properties.author);
    this.copyright        = validString(properties.copyright);

    /**
     * If true, treat one map key as n map keys, one set key as n set keys.
     * This means including KeyHasher's, WeakKeyComposer's when you might not need to.
     *
     * @type {boolean}
     */
    this.disableKeyOptimization = Boolean(properties.disableKeyOptimization);

    /**
     * True if we should generate TypeScript .mts files, instead of .mjs files.
     */
    this.generateTypeScript = Boolean(properties.generateTypeScript);
  }
}
Object.freeze(CompileTimeOptions);
Object.freeze(CompileTimeOptions.prototype);
