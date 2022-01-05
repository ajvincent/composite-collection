export default function OneToOneMethodParameters() {
  return [
    ["bindOneToOne", {
      description: "Bind two sets of keys and values together.",
      includeArgs: "excludeValue",
      footers: ["@public"],
    }],

    ["bindOneToOneSimple", {
      description: "Bind two values together.",
      includeArgs: "excludeValue",
      footers: ["@public"],
    }]
  ];
}
