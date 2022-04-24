import ConfigurationData from "#source/generatorTools/ConfigurationData.mjs";
import CollectionType from "#source/generatorTools/CollectionType.mjs";

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
      "defineArgument",
      "weakMapKeys",
      "strongMapKeys",
      "weakSetElements",
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
      "importLines",
      "parameterToTypeMap",
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

  it(".importLines is settable", () => {
    const data = new ConfigurationData("Foo", "Bar");
    data.importLines = "import Something from './elsewhere.mjs';\n";

    expect(data.importLines).toBe("import Something from './elsewhere.mjs';\n");
    expect(isWritable(data, "importLines")).toBe(true);
  });

  describe(".defineArgument() lets us define a ", () => {
    let data;
    beforeEach(() => {
      data = new ConfigurationData("FooMap", "WeakMap", "Set");
    })

    it("weak map argument", () => {
      const value = new CollectionType(
        "weakArg1",
        "WeakMap",
        "Shape",
        "The shape of the object"
      );
      data.defineArgument(value);
      expect(data.parameterToTypeMap.get("weakArg1")).toBe(value);
      expect(data.weakMapKeys).toEqual(["weakArg1"]);
      expect(data.strongMapKeys).toEqual([]);
      expect(data.weakSetElements).toEqual([]);
    });

    it("strong map argument", () => {
      const value = new CollectionType(
        "strongArg1",
        "Map",
        "Shape",
        "The shape of the object"
      );
      data.defineArgument(value);
      expect(data.parameterToTypeMap.get("strongArg1")).toBe(value);
      expect(data.weakMapKeys).toEqual([]);
      expect(data.strongMapKeys).toEqual(["strongArg1"]);
      expect(data.weakSetElements).toEqual([]);
    });

    it("weak set argument", () => {
      const value = new CollectionType(
        "weakArg2",
        "WeakSet",
        "Shape",
        "The shape of the object"
      );
      data.defineArgument(value);
      expect(data.parameterToTypeMap.get("weakArg2")).toBe(value);
      expect(data.weakMapKeys).toEqual([]);
      expect(data.strongMapKeys).toEqual([]);
      expect(data.weakSetElements).toEqual(["weakArg2"]);
    });

    it("strong set argument", () => {
      const value = new CollectionType(
        "strongArg2",
        "Set",
        "Shape",
        "The shape of the object"
      );
      data.defineArgument(value);
      expect(data.parameterToTypeMap.get("strongArg2")).toBe(value);
      expect(data.weakMapKeys).toEqual([]);
      expect(data.strongMapKeys).toEqual([]);
      expect(data.weakSetElements).toEqual([]);
    });
  });

  describe(".cloneData() succeeds with", () => {
    it("just the className and the collection template", () => {
      const data = new ConfigurationData("Foo", "Bar");

      const clone = data.cloneData();
      expect(clone.className).toBe(data.className);
      expect(clone.collectionTemplate).toBe(data.collectionTemplate);

      expect(clone).not.toBe(data);
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

    it("the import lines", () => {
      const data = new ConfigurationData("Foo", "Bar");
      data.importLines = "import Something from './elsewhere.mjs';\n";

      const clone = data.cloneData();
      expect(clone.className).toBe(data.className);
      expect(clone.collectionTemplate).toBe(data.collectionTemplate);
      expect(clone.importLines).toBe("import Something from './elsewhere.mjs';\n");
      expect(isWritable(clone, "importLines")).toBe(true);
    });

    describe("defining arguments", () => {
      let data;
      beforeEach(() => {
        data = new ConfigurationData("FooMap", "WeakMap", "Set");
      })
  
      it("weak map argument", () => {
        const value = new CollectionType(
          "weakArg1",
          "WeakMap",
          "Shape",
          "The shape of the object"
        );
        data.defineArgument(value);

        const clone = data.cloneData();
        expect(clone.parameterToTypeMap.get("weakArg1")).toBe(value);
        expect(clone.weakMapKeys).toEqual(["weakArg1"]);
        expect(clone.strongMapKeys).toEqual([]);
        expect(clone.weakSetElements).toEqual([]);
      });

      it("strong map argument", () => {
        const value = new CollectionType(
          "strongArg1",
          "Map",
          "Shape",
          "The shape of the object"
        );
        data.defineArgument(value);

        const clone = data.cloneData();
        expect(clone.parameterToTypeMap.get("strongArg1")).toBe(value);
        expect(clone.weakMapKeys).toEqual([]);
        expect(clone.strongMapKeys).toEqual(["strongArg1"]);
        expect(clone.weakSetElements).toEqual([]);
      });

      it("weak set argument", () => {
        const value = new CollectionType(
          "weakArg2",
          "WeakSet",
          "Shape",
          "The shape of the object"
        );
        data.defineArgument(value);

        const clone = data.cloneData();
        expect(clone.parameterToTypeMap.get("weakArg2")).toBe(value);
        expect(clone.weakMapKeys).toEqual([]);
        expect(clone.strongMapKeys).toEqual([]);
        expect(clone.weakSetElements).toEqual(["weakArg2"]);
      });

      it("strong set argument", () => {
        const value = new CollectionType(
          "strongArg2",
          "Set",
          "Shape",
          "The shape of the object"
        );
        data.defineArgument(value);

        const clone = data.cloneData();
        expect(clone.parameterToTypeMap.get("strongArg2")).toBe(value);
        expect(clone.weakMapKeys).toEqual([]);
        expect(clone.strongMapKeys).toEqual([]);
        expect(clone.weakSetElements).toEqual([]);
      });
    });
  });
});
