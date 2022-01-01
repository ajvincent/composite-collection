import TemplateGenerators from "./TemplateGenerators.mjs";

import beautify from "js-beautify";

export default async function KeyClassGenerator(isComposite, defines) {
  {
    const argCount = defines.get("argList").length;
    if (argCount < 2)
      throw new Error("You do not have enough defined arguments to justify a key class!");
  }

  const template = TemplateGenerators.get("Keys/" + (isComposite ? "Composite" : "Hash"));
  let source = template(defines);

  source = beautify(source, {
    "indent_size": 2,
    "indent_char": " ",
    "end_with_newline": true,
  });

  source = source.replace(/\n{3,}/g, "\n\n");
  return source;
}
