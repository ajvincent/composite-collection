function validString(value) {
  return (typeof value === "string") && value.trim().length > 0 ? value : "";
}

/**
 * A catch-all for run-time options for CodeGenerator, and anyone who invokes it.
 */
export default class CompileTimeOptions {
  constructor(properties) {
    this.sourceFile       = validString(properties.sourceFile);
    this.sourcesDirectory = validString(properties.sourcesDirectory);

    this.licenseText      = validString(properties.licenseText);
    this.author           = validString(properties.author);
    this.copyright        = validString(properties.copyright);
  }
}
Object.freeze(CompileTimeOptions);
Object.freeze(CompileTimeOptions.prototype);
