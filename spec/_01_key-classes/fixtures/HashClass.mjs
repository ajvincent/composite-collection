import KeyClassGenerator from "#source/KeyClassGenerator.mjs";

const defines = new Map([
  ["className", "HashClass"],
  ["suffix", "hash"],
  ["argList", [ "key1", "key2" ]],
]);

const source = "export default " + await KeyClassGenerator(false, defines);

export default source;
