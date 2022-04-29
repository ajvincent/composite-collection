import TemplateGenerators from "#source/generatorTools/TemplateGenerators.mjs"
void(TemplateGenerators);

import TypeScriptDefines from "#source/typescript-migration/TypeScriptDefines.mjs";

it("TypeScriptDefines.nonTypeScriptCount > 0", () => {
  // When this test fails, it's safe to merge TypeScriptDefines into PreprocessorDefines.
  // Disable this test first, so you'll be able to continue development before the merge.
  expect(TypeScriptDefines.nonTypeScriptCount).toBeGreaterThan(0);
});
