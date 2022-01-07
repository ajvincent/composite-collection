/**
 * @returns {Array<string, MethodTemplate>[]} The templates to feed into a Map.
 */
export default function OneToOneMethodParameters() {
  return [
    ["delete", {
      description: "Delete a target value.",
      includeArgs: "excludeValue",
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
      includeArgs: "all",
      returnType: "boolean",
      returnDescription: "True if the key is valid.",
      footers: [
        "@see the base map class for further constraints.",
        "@public",
      ],
    }],

    ["isValidValue", {
      description: "Determine if a value is valid.",
      includeArgs: "all",
      returnType: "boolean",
      returnDescription: "True if the value is valid.",
      footers: [
        "@see the base map class for further constraints.",
        "@public",
      ],
    }],
  ];
}
