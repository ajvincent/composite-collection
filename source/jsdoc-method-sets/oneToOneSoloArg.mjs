/**
 * @typedef MethodTemplate
 * @property {boolean?}    isTypeDef          True if this is a type definition (no description, no returns)
 * @property {boolean?}    isProperty         True if this is a property definition (no returns).
 * @property {boolean?}    returnVoid         True if this is a method returning nothing.
 * @property {string}      description        The descrption of the method's purpose.
 * @property {string}      includeArgs        A flag to determine how public keys (and values) should be in the API.
 * @property {string[]?}   headers            JSDoc header lines before the parameter block.
 * @property {string[][]?} paramHeaders       Parameters from the template (not the user)
 * @property {string[][]?} paramFooters       Parameters from the template (not the user)
 * @property {string[]?}   footers            JSDoc footer lines after the parameters (and the return value).
 * @property {string?}     returnType         The return type for the specified function.
 * @property {string?}     returnDescription  A description of the return value to provide.
 * @property {boolean?}    isGenerator        If true, provides a 'yield' instead of a 'return'.
 * @see jsdoc-method-sets/default.mjs for typical objects.
 */

/**
 * @returns {Array<string, MethodTemplate>[]} The templates to feed into a Map.
 */
export default function OneToOneMethodParameters() {
  return [
    ["delete", {
      description: "Delete a target value.",
      includeArgs: "all",
      returnType: "boolean",
      returnDescription: "True if the target value was deleted.",
      footers: ["@public"],
    }],

    ["get", {
      description: "Get a target value.",
      includeArgs: "all",
      returnType: "*",
      returnDescription: "The target value.",
      footers: ["@public"],
    }],

    ["has", {
      description: "Determine if a target value exists.",
      includeArgs: "all",
      returnType: "boolean",
      returnDescription: "True if the target value exists.",
      footers: ["@public"],
    }],

    ["isValidKey", {
      description: "Determine if a key is valid.",
      includeArgs: "excludeValue",
      returnType: "boolean",
      returnDescription: "True if the key is valid.",
      footers: [
        "@see the base map class for further constraints.",
        "@public",
      ],
    }],

    ["isValidValue", {
      description: "Determine if a value is valid.",
      includeArgs: "value",
      returnType: "boolean",
      returnDescription: "True if the value is valid.",
      footers: [
        "@see the base map class for further constraints.",
        "@public",
      ],
    }],
  ];
}
