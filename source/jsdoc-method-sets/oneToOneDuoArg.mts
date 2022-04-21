import { MethodTemplate } from "./MethodTemplateType.mjs";
import type { stringAndTemplate } from "./MethodTemplateType.mjs";

void(MethodTemplate);

/**
 * @returns {Array<string, MethodTemplate>[]} The templates to feed into a Map.
 */
export default function OneToOneMethodParameters(): stringAndTemplate[] {
  return [
    ["bindOneToOne", {
      returnVoid: true,
      description: "Bind two sets of keys and values together.",
      includeArgs: "excludeValue",
      footers: ["@public"],
    }],

    ["bindOneToOneSimple", {
      returnVoid: true,
      description: "Bind two values together.",
      includeArgs: "excludeValue",
      footers: ["@public"],
    }]
  ];
}
