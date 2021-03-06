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
      "strongSetElements",
      "oneToOneKeyName",
      "oneToOneBase",
      "oneToOneOptions",
      "setOneToOne",
      "cloneData",
      "setConfiguration",
    ]);

    expect(Object.isFrozen(ConfigurationData)).toBe(true);
    expect(Reflect.ownKeys(ConfigurationData)).toEqual([
      // standard ECMAScript
      "length",
      "name",
      "prototype",

      // static fields
      "cloneData",
      "WeakMapConfiguration",
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
      "valueType",
    ]);

    expect(data.className).toBe("Foo");
    expect(isWritable(data, "className")).toBe(false);

    expect(data.collectionTemplate).toBe("Bar");
    expect(isWritable(data, "collectionTemplate")).toBe(true);

    expect(data.oneToOneKeyName).toBe("");
    expect(data.oneToOneBase).toBe(null);
    expect(data.oneToOneOptions).toBe(null);
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
        "object",
        "The shape of the object"
      );
      data.defineArgument(value);
      expect(data.parameterToTypeMap.get("weakArg1")).toBe(value);
      expect(data.weakMapKeys).toEqual(["weakArg1"]);
      expect(data.strongMapKeys).toEqual([]);
      expect(data.weakSetElements).toEqual([]);
      expect(data.strongSetElements).toEqual([]);
    });

    it("strong map argument", () => {
      const value = new CollectionType(
        "strongArg1",
        "Map",
        "Shape",
        "object",
        "The shape of the object"
      );
      data.defineArgument(value);
      expect(data.parameterToTypeMap.get("strongArg1")).toBe(value);
      expect(data.weakMapKeys).toEqual([]);
      expect(data.strongMapKeys).toEqual(["strongArg1"]);
      expect(data.weakSetElements).toEqual([]);
      expect(data.strongSetElements).toEqual([]);
    });

    it("weak set argument", () => {
      const value = new CollectionType(
        "weakArg2",
        "WeakSet",
        "Shape",
        "object",
        "The shape of the object"
      );
      data.defineArgument(value);
      expect(data.parameterToTypeMap.get("weakArg2")).toBe(value);
      expect(data.weakMapKeys).toEqual([]);
      expect(data.strongMapKeys).toEqual([]);
      expect(data.weakSetElements).toEqual(["weakArg2"]);
      expect(data.strongSetElements).toEqual([]);
    });

    it("strong set argument", () => {
      const value = new CollectionType(
        "strongArg2",
        "Set",
        "Shape",
        "object",
        "The shape of the object"
      );
      data.defineArgument(value);
      expect(data.parameterToTypeMap.get("strongArg2")).toBe(value);
      expect(data.weakMapKeys).toEqual([]);
      expect(data.strongMapKeys).toEqual([]);
      expect(data.weakSetElements).toEqual([]);
      expect(data.strongSetElements).toEqual(["strongArg2"]);
    });
  });

  it(".valueType is settable", () => {
    const value = new CollectionType(
      "value",
      "WeakMap",
      "Shape",
      "object",
      "The shape of the object"
    );

    const data = new ConfigurationData("FooMap", "WeakMap", "Set");
    data.valueType = value;
    // this might seem obvious, but if we converted to just a setter...
    expect(data.valueType).toBe(value);
    expect(isWritable(data, "valueType")).toBe(true);
  });

  it(".setOneToOne() sets the one-to-one base configuration", () => {
    const baseData = new ConfigurationData("Foo", "Bar");
    const data = new ConfigurationData("Car", "Highway");
    const options = { distance: 200, units: "miles" };

    data.setOneToOne("direction", baseData, options);

    expect(data.oneToOneKeyName).toBe("direction");
    expect(data.oneToOneBase).toBe(baseData);
    expect(data.oneToOneOptions).toEqual(options);
    expect(data.oneToOneOptions).not.toBe(options);
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
          "object",
          "The shape of the object"
        );
        data.defineArgument(value);

        const clone = data.cloneData();
        expect(clone.parameterToTypeMap.get("weakArg1")).toBe(value);
        expect(clone.weakMapKeys).toEqual(["weakArg1"]);
        expect(clone.strongMapKeys).toEqual([]);
        expect(clone.weakSetElements).toEqual([]);
        expect(clone.strongSetElements).toEqual([]);
      });

      it("strong map argument", () => {
        const value = new CollectionType(
          "strongArg1",
          "Map",
          "Shape",
          "object",
          "The shape of the object"
        );
        data.defineArgument(value);

        const clone = data.cloneData();
        expect(clone.parameterToTypeMap.get("strongArg1")).toBe(value);
        expect(clone.weakMapKeys).toEqual([]);
        expect(clone.strongMapKeys).toEqual(["strongArg1"]);
        expect(clone.weakSetElements).toEqual([]);
        expect(clone.strongSetElements).toEqual([]);
      });

      it("weak set argument", () => {
        const value = new CollectionType(
          "weakArg2",
          "WeakSet",
          "Shape",
          "object",
          "The shape of the object"
        );
        data.defineArgument(value);

        const clone = data.cloneData();
        expect(clone.parameterToTypeMap.get("weakArg2")).toBe(value);
        expect(clone.weakMapKeys).toEqual([]);
        expect(clone.strongMapKeys).toEqual([]);
        expect(clone.weakSetElements).toEqual(["weakArg2"]);
        expect(clone.strongSetElements).toEqual([]);
      });

      it("strong set argument", () => {
        const value = new CollectionType(
          "strongArg2",
          "Set",
          "Shape",
          "object",
          "The shape of the object"
        );
        data.defineArgument(value);

        const clone = data.cloneData();
        expect(clone.parameterToTypeMap.get("strongArg2")).toBe(value);
        expect(clone.weakMapKeys).toEqual([]);
        expect(clone.strongMapKeys).toEqual([]);
        expect(clone.weakSetElements).toEqual([]);
        expect(clone.strongSetElements).toEqual(["strongArg2"]);
      });
    });

    it("the value type", () => {
      const value = new CollectionType(
        "value",
        "WeakMap",
        "Shape",
        "object",
        "The shape of the object"
      );
  
      const data = new ConfigurationData("FooMap", "WeakMap", "Set");
      data.valueType = value;

      const clone = data.cloneData();
      expect(clone.valueType).toEqual(data.valueType);
      expect(isWritable(clone, "valueType")).toBe(true);
    });

    it("a one-to-one base configuration", () => {
      const baseData = new ConfigurationData("Foo", "Bar");
      const data = new ConfigurationData("Car", "Highway");
      const options = { distance: 200, units: "miles" };
  
      data.setOneToOne("direction", baseData, options);
  
      const clone = data.cloneData();

      expect(clone.oneToOneKeyName).toBe("direction");
      expect(clone.oneToOneBase).toBe(baseData);
      expect(clone.oneToOneOptions).toEqual(data.oneToOneOptions);
      expect(clone.oneToOneOptions).not.toBe(data.oneToOneOptions);
      expect(clone.oneToOneOptions).not.toBe(options);
    });
  });
});
