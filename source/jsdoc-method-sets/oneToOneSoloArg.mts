import MethodTemplate from "./MethodTemplateType.mjs";
import type { stringAndTemplate } from "./MethodTemplateType.mjs";

void(MethodTemplate);

/**
 * @returns {Array<string, MethodTemplate>[]} The templates to feed into a Map.
 */
export default function OneToOneMethodParameters(): stringAndTemplate[] {
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

    ["hasIdentity", {
      description: "Determine if a target value is an identity in this map.",
      includeArgs: "all",
      paramFooters: [
        ["boolean", "allowNotDefined", "If true, treat the absence of the value as an identity."]
      ],
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
