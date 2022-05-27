import { getTemplatesWithoutModules } from "../support/build-coverage.mjs";

describe("TypeScript support: ", () => {
  it("There is code coverage of every template.", () => {
    expect(getTemplatesWithoutModules()).toEqual([]);
  });
});
