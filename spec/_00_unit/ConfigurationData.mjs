import ConfigurationData from "#source/generatorTools/ConfigurationData.mjs";

/**
 * @type {any}             value The value to check.
 * @type {string | symbol} key   The property name.
 * @returns {boolean} True if the property is writable.
 */
function isWritable(value, key) {
  const desc = Reflect.getOwnPropertyDescriptor(value, key);
  return desc.writable || desc.configurable;
}

describe("ConfigurationData", () => {
  it("class is frozen", () => {
    expect(Object.isFrozen(ConfigurationData.prototype)).toBe(true);
    expect(Reflect.ownKeys(ConfigurationData.prototype)).toEqual([
      "constructor",
      "requiresKeyHasher",
      "requiresWeakKey",
      "setFileOverview",
      "cloneData",
      "setConfiguration",
    ]);

    expect(Object.isFrozen(ConfigurationData)).toBe(true);
    expect(Reflect.ownKeys(ConfigurationData)).toEqual([
      // standard ECMAScript
      "length",
      "name",
      "prototype",

      // static methods
      "cloneData",
    ]);
  });

  it("initialized via constructor have className, collectionTemplate", () => {
    const data = new ConfigurationData("Foo", "Bar");
    expect(Object.isSealed(data)).toBe(false);
    expect(Reflect.ownKeys(data)).toEqual([
      "className",
      "collectionTemplate",
      "fileOverview",
    ]);

    expect(data.className).toBe("Foo");
    expect(isWritable(data, "className")).toBe(false);

    expect(data.collectionTemplate).toBe("Bar");
    expect(isWritable(data, "collectionTemplate")).toBe(true);

    expect(data.fileOverview).toBe(null);
    expect(isWritable(data, "fileOverview")).toBe(true);
  });

  it(".fileOverview is settable via .setFileOverview() once", () => {
    const data = new ConfigurationData("Foo", "Bar");
    data.setFileOverview("my overview");

    expect(data.fileOverview).toBe("my overview");
    expect(isWritable(data, "fileOverview")).toBe(false);
  });

  describe(".cloneData() succeeds with", () => {
    it("just the className and the collection template", () => {
      const data = new ConfigurationData("Foo", "Bar");

      const clone = data.cloneData();
      expect(clone.className).toBe(data.className);
      expect(clone.collectionTemplate).toBe(data.collectionTemplate);
    });

    it("the file overview", () => {
      const data = new ConfigurationData("Foo", "Bar");
      data.setFileOverview("my overview");

      const clone = data.cloneData();
      expect(clone.className).toBe(data.className);
      expect(clone.collectionTemplate).toBe(data.collectionTemplate);
      expect(clone.fileOverview).toBe("my overview");
      expect(isWritable(clone, "fileOverview")).toBe(false);
    });
  });
});
