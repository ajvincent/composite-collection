import CollectionType from "#source/generatorTools/CollectionType.mjs";

describe("CollectionType", () => {
  it("class is frozen", () => {
    expect(typeof CollectionType).toBe("function");
    expect(Object.isFrozen(CollectionType)).toBe(true);
    expect(Object.isFrozen(CollectionType.prototype)).toBe(true);

    expect(Reflect.ownKeys(CollectionType.prototype)).toEqual([
      "constructor",
      "isMapArgument",
    ]);
  });

  it("initialized via constructor is sealed with the required properties", () => {
    const type = new CollectionType(
      "item1",
      "WeakMap",
      "item2",
      "item3",
      "item4",
      "item5"
    );
    expect(Object.isFrozen(type)).toBe(true);
    expect(Reflect.ownKeys(type)).toEqual([
      "argumentName",
      "mapOrSetType",
      "jsDocType",
      "tsType",
      "description",
      "argumentValidator"
    ]);

    expect(type.argumentName).toBe("item1");
    expect(type.mapOrSetType).toBe("WeakMap");
    expect(type.jsDocType).toBe("item2");
    expect(type.tsType).toBe("item3");
    expect(type.description).toBe("item4");
    expect(type.argumentValidator).toBe("item5");
  });
});
