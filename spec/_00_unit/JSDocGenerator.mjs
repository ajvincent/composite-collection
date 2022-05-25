import JSDocGenerator from "#source/generatorTools/JSDocGenerator.mjs";
import CollectionType from "#source/generatorTools/CollectionType.mjs";
import { ESLint } from "eslint";

/**
 * Run template code against ESLint.
 *
 * @param {JSDocGenerator} doc The code generator we're exercising.
 * @param {boolean} useYield Provide a generator memmber function instead.
 * @returns {string[]} The ESLint rules we broke.
 */
async function runAgainstESLint(doc, useYield = false) {
  const source = `
class DeliveryToken {}

class Vehicle {
${doc.buildBlock("deliver", 2)}
  ${useYield? "*" : ""}deliverToCustomer(name, atTime, foods) {
    void name;
    void foods;
    void atTime;

    ${useYield ? "yield" : "return"} new DeliveryToken();
  }
}

void Vehicle;
`.trim();

  const eslint = new ESLint;
  let result = (await eslint.lintText(source))[0];
  result = result.messages.map(message => message.ruleId);
  result.sort();
  return result;
}

describe("JSDocGenerator validation: ", () => {
  let methodParameter;

  /** @private */
  function setMethod() {
    doc.setMethodParametersDirectly([
      ["deliver", methodParameter]
    ]);
  }

  // #region CollectionType[]
  const nameType = new CollectionType(
    "name",
    "Map",
    "string",
    "object",
    "The customer's name.",
    ""
  );

  const atTimeTime = new CollectionType(
    "atTime",
    "WeakMap",
    "number",
    "object",
    "The delivery time.",
    ""
  );

  const foodsType = new CollectionType(
    "foods",
    "WeakMap",
    "string[]",
    "object",
    "The foods the customer ordered.",
    ""
  );
  // #endregion

  let doc;
  beforeEach(() => {
    doc = new JSDocGenerator("Vehicle", false);
    methodParameter = {
      description: "Deliver some foods to a customer.",
      includeArgs: "excludeValue",
      returnType: "DeliveryToken",
      returnDescription: "The delivery token.",
      footers: ["@public"],
    };
  });
  afterEach(() => {
    doc = null;
    methodParameter = null;
  });

  it("passes ESLint when everything is filled in", async () => {
    doc.addParameter(nameType);
    doc.addParameter(atTimeTime);
    doc.addParameter(foodsType);
    setMethod();

    const result = await runAgainstESLint(doc);
    expect(result).toEqual([]);
  });

  it("passes ESLint when we provide a generator", async () => {
    doc.addParameter(nameType);
    doc.addParameter(atTimeTime);
    doc.addParameter(foodsType);

    methodParameter.isGenerator = true;
    setMethod();

    const result = await runAgainstESLint(doc, true);
    expect(result).toEqual([]);
  });

  it("for a typedef requires includeArgs be 'none'", () => {
    doc.addParameter(nameType);
    doc.addParameter(atTimeTime);
    doc.addParameter(foodsType);

    methodParameter = {
      isTypeDef: true,
      includeArgs: "all",
      headers: [
        "@typedef __className__~valueAndKeySet",
        "@property {*}   value  The actual value we store.",
        "@property {*[]} keySet The set of keys we hashed.",
      ],
    };

    expect(
      () => setMethod()
    ).toThrowError(`At row 0 ("deliver"), value.includeArgs must be "none" for a type definition!`);
  });

  it("for a typedef requires a non-empty list of headers", () => {
    doc.addParameter(nameType);
    doc.addParameter(atTimeTime);
    doc.addParameter(foodsType);

    methodParameter = {
      isTypeDef: true,
      includeArgs: "none",
      headers: ["  "],
    };

    expect(
      () => setMethod()
    ).toThrowError(`At row 0 ("deliver"), value.headers[0] must be a non-empty string!`);

    methodParameter.headers = [];
    expect(
      () => setMethod()
    ).toThrowError(`At row 0 ("deliver"), value.headers is not an array of non-empty strings!`);

    delete methodParameter.headers;
    expect(
      () => setMethod()
    ).toThrowError(`At row 0 ("deliver"), value.headers is not an array of non-empty strings!`);
  });

  it("for a typedef has no other failing constraints", () => {
    doc.addParameter(nameType);
    doc.addParameter(atTimeTime);
    doc.addParameter(foodsType);

    methodParameter = {
      isTypeDef: true,
      includeArgs: "none",
      headers: [
        "@typedef __className__~valueAndKeySet",
        "@property {*}   value  The actual value we store.",
        "@property {*[]} keySet The set of keys we hashed.",
      ],
    };

    expect(
      () => setMethod()
    ).not.toThrow();
  });

  it("normally throws for a missing method description", () => {
    doc.addParameter(nameType);
    doc.addParameter(atTimeTime);
    doc.addParameter(foodsType);

    delete methodParameter.description;
    expect(
      () => setMethod()
    ).toThrowError(`At row 0 ("deliver"), value.description must be a non-empty string!`);
  });

  it("throws for a missing returnDescription", async () => {
    doc.addParameter(nameType);
    doc.addParameter(atTimeTime);
    doc.addParameter(foodsType);

    delete methodParameter.returnDescription;
    expect(
      () => setMethod()
    ).toThrowError(`At row 0 ("deliver"), value.returnDescription must be a non-empty string!`);
  });

  it("throws for a missing returnType", async () => {
    doc.addParameter(nameType);
    doc.addParameter(atTimeTime);
    doc.addParameter(foodsType);

    delete methodParameter.returnType;
    expect(
      () => setMethod()
    ).toThrowError(
      `At row 0 ("deliver"), value.returnType must be a non-empty string!  (Set value.returnVoid if there is no return value.)`
    );
  });

  it("throws for an invalid includeArgs", async () => {
    doc.addParameter(nameType);
    doc.addParameter(atTimeTime);
    doc.addParameter(foodsType);

    methodParameter.includeArgs = "Foo"

    expect(
      () => setMethod()
    ).toThrowError(`At row 0 ("deliver"), value.includeArgs must be one of: "none", "value", "all", "mapArguments", "setArguments", "excludeValue"`);
  });

  it("throws for a whitespace footer line prepended", async () => {
    doc.addParameter(nameType);
    doc.addParameter(atTimeTime);
    doc.addParameter(foodsType);

    methodParameter.footers.unshift("  ");
    expect(
      () => setMethod()
    ).toThrowError(`At row 0 ("deliver"), value.footers[0] must be a non-empty string!`);
  });

  it("throws for whitespace footer line appended", async () => {
    doc.addParameter(nameType);
    doc.addParameter(atTimeTime);
    doc.addParameter(foodsType);

    methodParameter.footers.push("  ");
    expect(
      () => setMethod()
    ).toThrowError(`At row 0 ("deliver"), value.footers[1] must be a non-empty string!`);
  });

  it("fails ESLint for an unknown JSDoc tag", async () => {
    doc.addParameter(nameType);
    doc.addParameter(atTimeTime);
    doc.addParameter(foodsType);

    methodParameter.footers.push("@allYourBase");
    setMethod();

    const result = await runAgainstESLint(doc);
    expect(result).toEqual(["jsdoc/check-tag-names"]);
  });

  it("fails ESLint with a missing parameter", async () => {
    doc.addParameter(nameType);
    doc.addParameter(atTimeTime);
    setMethod();

    const result = await runAgainstESLint(doc);
    expect(result).toEqual(['jsdoc/require-param']);
  });

  it("fails ESLint with an extra parameter", async () => {
    doc.addParameter(nameType);
    doc.addParameter(atTimeTime);
    doc.addParameter(foodsType);

    doc.addParameter(new CollectionType(
      "vendor",
      "WeakMap",
      "string",
      "object",
      "The company selling the foods.",
      ""
    ));
    setMethod();

    const result = await runAgainstESLint(doc);
    expect(result).toEqual(["jsdoc/check-param-names"]);
  });

  it("fails ESLint with an unknown parameter", async () => {
    doc.addParameter(nameType);
    doc.addParameter(atTimeTime);
    doc.addParameter(new CollectionType(
      "vendor",
      "WeakMap",
      "string",
      "object",
      "The company selling the foods.",
      ""
    ));
    setMethod();

    const result = await runAgainstESLint(doc);
    expect(result).toEqual([
      "jsdoc/check-param-names",
      "jsdoc/require-param",
    ]);
  });

  it("fails ESLint with an unknown parameter type", async () => {
    doc.addParameter(nameType);
    doc.addParameter(atTimeTime);
    doc.addParameter(new CollectionType(
      "foods",
      "WeakMap",
      "Color",
      "object",
      "The foods the customer ordered.",
      ""
    ));
    setMethod();

    const result = await runAgainstESLint(doc);
    expect(result).toEqual(["jsdoc/no-undefined-types"]);
  });
});

describe("JSDocGenerator for maps", () => {
  let generator;
  afterEach(() => generator = null);

  it("doesn't throw for invoking addParameter() with a CollectionType", () => {
    generator = new JSDocGenerator("SoloStrongMap", false);
    expect(
      () => generator.addParameter(new CollectionType("car", "Map", "Car", "object", "The car."))
    ).not.toThrow();
  });

  describe(".buildBlock() with two arguments and no value type builds a valid comment block for the template name", () => {
    beforeEach(() => {
      generator = new JSDocGenerator("SoloStrongMap", false);
      generator.addParameter(new CollectionType("car", "Map", "Car", "object", "The car."));
      generator.addParameter(new CollectionType("driver", "Map", "Person", "object", "The driver of the car."));
    });

    it("rootContainerMap", () => {
      const generated = generator.buildBlock("rootContainerMap", 2);
      expect(generated).toEqual(`  /**
   * The root map holding keys and values.
   *
   * @type {Map<string, __SoloStrongMap_valueAndKeySet__>}
   * @constant
   */`);
    });

    it("rootContainerWeakMap", () => {
      const generated = generator.buildBlock("rootContainerWeakMap", 2);
      expect(generated).toEqual(`  /**
   * The root map holding weak composite keys and values.
   *
   * @type {WeakMap<WeakKey, *>}
   * @constant
   */`);
    });

    it("valueAndKeySet", () => {
      const generated = generator.buildBlock("valueAndKeySet", 2);
      expect("\n" + generated + "\n").toEqual(`\n  /**
   * @typedef __SoloStrongMap_valueAndKeySet__
   * @property {*}   value  The actual value we store.
   * @property {*[]} keySet The set of keys we hashed.
   */\n`);
    });

    it("getSize", () => {
      const generated = generator.buildBlock("getSize", 2);
      expect(generated).toEqual(`  /**
   * The number of elements in this collection.
   *
   * @returns {number} The element count.
   * @public
   * @constant
   */`);
    });

    it("clear", () => {
      const generated = generator.buildBlock("clear", 2);
      expect(generated).toEqual(`  /**
   * Clear the collection.
   *
   * @public
   */`);
    });

    it("delete", () => {
      const generated = generator.buildBlock("delete", 2);
      expect(generated).toEqual(`  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */`);
    });

    it("entries", () => {
      const generated = generator.buildBlock("entries", 2);
      expect(generated).toEqual(`  /**
   * Yield the key-value tuples of the collection.
   *
   * @yields {*[]} The keys and values.
   * @public
   */`);
    });

    it("forEach_Map", () => {
      const generated = generator.buildBlock("forEach_Map", 2);
      expect(generated).toEqual(`  /**
   * Iterate over the keys and values.
   *
   * @param {__SoloStrongMap_ForEachCallback__} __callback__ A function to invoke for each iteration.
   * @param {object}                            __thisArg__  Value to use as this when executing callback.
   * @public
   */`);
    });

    it("forEach_Set", () => {
      const generated = generator.buildBlock("forEach_Set", 2);
      expect(generated).toEqual(`  /**
   * Iterate over the keys.
   *
   * @param {__SoloStrongMap_ForEachCallback__} __callback__ A function to invoke for each iteration.
   * @param {object}                            __thisArg__  Value to use as this when executing callback.
   * @public
   */`);
    });

    it("forEachSet_MapSet", () => {
      const generated = generator.buildBlock("forEachSet_MapSet", 2);
      expect(generated).toEqual(`  /**
   * Iterate over the keys under a map in this collection.
   *
   * @param {Car}                               car          The car.
   * @param {Person}                            driver       The driver of the car.
   * @param {__SoloStrongMap_ForEachCallback__} __callback__ A function to invoke for each iteration.
   * @param {object}                            __thisArg__  Value to use as this when executing callback.
   * @public
   */`);
    });

    it("forEach_Map_callback", () => {
      const generated = generator.buildBlock("forEach_Map_callback", 2);
      expect(generated).toEqual(`  /**
   * An user-provided callback to .forEach().
   *
   * @callback __SoloStrongMap_ForEachCallback__
   * @param {*}             value          The value.
   * @param {Car}           car            The car.
   * @param {Person}        driver         The driver of the car.
   * @param {SoloStrongMap} __collection__ This collection.
   */`);
    });

    it("get", () => {
      const generated = generator.buildBlock("get", 2);
      expect(generated).toEqual(`  /**
   * Get a value for a key set.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @returns {*?} The value.  Undefined if it isn't in the collection.
   * @public
   */`);
    });

    it("getDefault", () => {
      const generated = generator.buildBlock("getDefault", 2);
      expect(generated).toEqual(`  /**
   * Guarantee a value for a key set.
   *
   * @param {Car}                                  car         The car.
   * @param {Person}                               driver      The driver of the car.
   * @param {__SoloStrongMap_GetDefaultCallback__} __default__ A function to provide a default value if necessary.
   * @returns {*} The value.
   * @public
   */`);
    });

    it("getDefaultCallback", () => {
      const generated = generator.buildBlock("getDefaultCallback", 2);
      expect(generated).toEqual(`  /**
   * Provide a default value for .getDefault().
   *
   * @callback __SoloStrongMap_GetDefaultCallback__
   * @returns {*} The value.
   */`);
    });

    it("has", () => {
      const generated = generator.buildBlock("has", 2);
      expect(generated).toEqual(`  /**
   * Report if the collection has a value for a key set.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */`);
    });

    it("keys", () => {
      const generated = generator.buildBlock("keys", 2);
      expect(generated).toEqual(`  /**
   * Yield the key sets of the collection.
   *
   * @yields {*[]} The key sets.
   * @public
   */`);
    });

    it("set", () => {
      const generated = generator.buildBlock("set", 2);
      expect(generated).toEqual(`  /**
   * Set a value for a key set.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @param {*}      value  The value.
   * @returns {SoloStrongMap} This collection.
   * @public
   */`);
    });

    it("values", () => {
      const generated = generator.buildBlock("values", 2);
      expect(generated).toEqual(`  /**
   * Yield the values of the collection.
   *
   * @yields {*} The value.
   * @public
   */`);
    });

    it("isValidKeyPublic", () => {
      const generated = generator.buildBlock("isValidKeyPublic", 2);
      expect(generated).toEqual(`  /**
   * Determine if a set of keys is valid.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */`);
    });

    it("isValidKeyPrivate", () => {
      const generated = generator.buildBlock("isValidKeyPrivate", 2);
      expect(generated).toEqual(`  /**
   * Determine if a set of keys is valid.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */`);
    });

    it("requireValidKey", () => {
      const generated = generator.buildBlock("requireValidKey", 2);
      expect(generated).toEqual(`  /**
   * Throw if the key set is not valid.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @throws for an invalid key set.
   */`);
    });
  });

  describe(".buildBlock() with two arguments and no value type throws for the template name", () => {
    beforeEach(() => {
      generator = new JSDocGenerator("SoloStrongMap", false);
      generator.addParameter(new CollectionType("car", "Map", "Car", "object", "The car."));
      generator.addParameter(new CollectionType("driver", "Map", "Person", "object", "The driver of the car."));
    });


    it("isValidValuePublic", () => {
      expect(
        () => generator.buildBlock("isValidValuePublic", 2)
      ).toThrowError("value parameter is required!");
    });

    it("isValidValuePrivate", () => {
      expect(
        () => generator.buildBlock("isValidValuePrivate", 2)
      ).toThrowError("value parameter is required!");
    });
  });

  describe(".buildBlock() with two arguments and a value type builds a valid comment block for the template name", () => {
    beforeEach(() => {
      generator = new JSDocGenerator("SoloStrongMap", false);
      generator.addParameter(new CollectionType("car", "Map", "Car", "object", "The car."));
      generator.addParameter(new CollectionType("driver", "Map", "Person", "object", "The driver of the car."));
      generator.addParameter(new CollectionType("value", "Map", "State", "object", "The state of registration."));
    });

    it("rootContainerMap", () => {
      const generated = generator.buildBlock("rootContainerMap", 2);
      expect(generated).toEqual(`  /**
   * The root map holding keys and values.
   *
   * @type {Map<string, __SoloStrongMap_valueAndKeySet__>}
   * @constant
   */`);
    });

    it("valueAndKeySet", () => {
      const generated = generator.buildBlock("valueAndKeySet", 2);
      expect(generated).toEqual(`  /**
   * @typedef __SoloStrongMap_valueAndKeySet__
   * @property {*}   value  The actual value we store.
   * @property {*[]} keySet The set of keys we hashed.
   */`);
    });

    it("getSize", () => {
      const generated = generator.buildBlock("getSize", 2);
      expect(generated).toEqual(`  /**
   * The number of elements in this collection.
   *
   * @returns {number} The element count.
   * @public
   * @constant
   */`);
    });

    it("clear", () => {
      const generated = generator.buildBlock("clear", 2);
      expect(generated).toEqual(`  /**
   * Clear the collection.
   *
   * @public
   */`);
    });

    it("delete", () => {
      const generated = generator.buildBlock("delete", 2);
      expect(generated).toEqual(`  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */`);
    });

    it("entries", () => {
      const generated = generator.buildBlock("entries", 2);
      expect(generated).toEqual(`  /**
   * Yield the key-value tuples of the collection.
   *
   * @yields {*[]} The keys and values.
   * @public
   */`);
    });

    it("forEach_Map", () => {
      const generated = generator.buildBlock("forEach_Map", 2);
      expect(generated).toEqual(`  /**
   * Iterate over the keys and values.
   *
   * @param {__SoloStrongMap_ForEachCallback__} __callback__ A function to invoke for each iteration.
   * @param {object}                            __thisArg__  Value to use as this when executing callback.
   * @public
   */`);
    });

    it("forEach_Map_callback", () => {
      const generated = generator.buildBlock("forEach_Map_callback", 2);
      expect(generated).toEqual(`  /**
   * An user-provided callback to .forEach().
   *
   * @callback __SoloStrongMap_ForEachCallback__
   * @param {State}         value          The state of registration.
   * @param {Car}           car            The car.
   * @param {Person}        driver         The driver of the car.
   * @param {SoloStrongMap} __collection__ This collection.
   */`);
    });

    it("get", () => {
      const generated = generator.buildBlock("get", 2);
      expect(generated).toEqual(`  /**
   * Get a value for a key set.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @returns {State?} The state of registration.  Undefined if it isn't in the collection.
   * @public
   */`);
    });

    it("has", () => {
      const generated = generator.buildBlock("has", 2);
      expect(generated).toEqual(`  /**
   * Report if the collection has a value for a key set.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */`);
    });

    it("keys", () => {
      const generated = generator.buildBlock("keys", 2);
      expect(generated).toEqual(`  /**
   * Yield the key sets of the collection.
   *
   * @yields {*[]} The key sets.
   * @public
   */`);
    });

    it("set", () => {
      const generated = generator.buildBlock("set", 2);
      expect(generated).toEqual(`  /**
   * Set a value for a key set.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @param {State}  value  The state of registration.
   * @returns {SoloStrongMap} This collection.
   * @public
   */`);
    });

    it("add", () => {
      const generated = generator.buildBlock("add", 2);
      expect(generated).toEqual(`  /**
   * Add a key set to this collection.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @returns {SoloStrongMap} This collection.
   * @public
   */`);
    });

    it("values", () => {
      const generated = generator.buildBlock("values", 2);
      expect(generated).toEqual(`  /**
   * Yield the values of the collection.
   *
   * @yields {State} The value.
   * @public
   */`);
    });

    it("isValidKeyPublic", () => {
      const generated = generator.buildBlock("isValidKeyPublic", 2);
      expect(generated).toEqual(`  /**
   * Determine if a set of keys is valid.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */`);
    });

    it("isValidKeyPrivate", () => {
      const generated = generator.buildBlock("isValidKeyPrivate", 2);
      expect(generated).toEqual(`  /**
   * Determine if a set of keys is valid.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */`);
    });

    it("requireValidKey", () => {
      const generated = generator.buildBlock("requireValidKey", 2);
      expect(generated).toEqual(`  /**
   * Throw if the key set is not valid.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @throws for an invalid key set.
   */`);
    });
  });

  it(".buildBlock() with no arguments and no value type builds a valid comment block for the template name forEachCallbackSet", () => {
    generator = new JSDocGenerator("SoloStrongMap", false);

    const generated = generator.buildBlock("forEach_Set_callback", 2);
    expect(generated).toEqual(`  /**
   * An user-provided callback to .forEach().
   *
   * @callback __SoloStrongMap_ForEachCallback__
   * @param {*}             value          The value.
   * @param {SoloStrongMap} __collection__ This collection.
   */`);
  });

  it("indents based on the baseIndent passed in", () => {
    generator = new JSDocGenerator("SoloStrongMap", false);
    generator.addParameter(new CollectionType("car", "Map", "Car", "object", "The car."));
    generator.addParameter(new CollectionType("driver", "Map", "Person", "object", "The driver of the car."));

    const generated = generator.buildBlock("rootContainerMap", 4);
    expect(generated).toEqual(`    /**
     * The root map holding keys and values.
     *
     * @type {Map<string, __SoloStrongMap_valueAndKeySet__>}
     * @constant
     */`);
  });
});

describe("JSDocGenerator for sets", () => {
  let generator;
  beforeEach(() => {
    generator = new JSDocGenerator("SoloStrongSet", true);
  });

  it("doesn't throw for invoking addParameter() with a CollectionType", () => {
    expect(
      () => generator.addParameter(new CollectionType("car", "Set", "Car", "object", "The car."))
    ).not.toThrow();
  });

  describe(".buildBlock() with two arguments and no value type builds a valid comment block for the template name", () => {
    beforeEach(() => {
      generator.addParameter(new CollectionType("car", "Set", "Car", "object", "The car."));
      generator.addParameter(new CollectionType("driver", "Set", "Person", "object", "The driver of the car."));
    });

    it("rootContainerSet", () => {
      const generated = generator.buildBlock("rootContainerSet", 2);
      expect(generated).toEqual(`  /**
   * Storage of the Set's contents for quick iteration in .values().  The values are always frozen arrays.
   *
   * @type {Map<hash, *[]>}
   * @constant
   */`);
    });

    it("valueAndKeySet", () => {
      const generated = generator.buildBlock("valueAndKeySet", 2);
      expect(generated).toEqual(`  /**
   * @typedef __SoloStrongSet_valueAndKeySet__
   * @property {*}   value  The actual value we store.
   * @property {*[]} keySet The set of keys we hashed.
   */`);
    });

    it("getSize", () => {
      const generated = generator.buildBlock("getSize", 2);
      expect(generated).toEqual(`  /**
   * The number of elements in this collection.
   *
   * @returns {number} The element count.
   * @public
   * @constant
   */`);
    });

    it("clear", () => {
      const generated = generator.buildBlock("clear", 2);
      expect(generated).toEqual(`  /**
   * Clear the collection.
   *
   * @public
   */`);
    });

    it("delete", () => {
      const generated = generator.buildBlock("delete", 2);
      expect(generated).toEqual(`  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */`);
    });

    it("forEach_Set", () => {
      const generated = generator.buildBlock("forEach_Set", 2);
      expect(generated).toEqual(`  /**
   * Iterate over the keys.
   *
   * @param {__SoloStrongSet_ForEachCallback__} __callback__ A function to invoke for each iteration.
   * @param {object}                            __thisArg__  Value to use as this when executing callback.
   * @public
   */`);
    });

    it("forEach_Set_callback", () => {
      const generated = generator.buildBlock("forEach_Set_callback", 2);
      expect(generated).toEqual(`  /**
   * An user-provided callback to .forEach().
   *
   * @callback __SoloStrongSet_ForEachCallback__
   * @param {Car}           car            The car.
   * @param {Person}        driver         The driver of the car.
   * @param {SoloStrongSet} __collection__ This collection.
   */`);
    });

    it("has", () => {
      const generated = generator.buildBlock("has", 2);
      expect(generated).toEqual(`  /**
   * Report if the collection has a value for a key set.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */`);
    });

    it("add", () => {
      const generated = generator.buildBlock("add", 2);
      expect(generated).toEqual(`  /**
   * Add a key set to this collection.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @returns {SoloStrongSet} This collection.
   * @public
   */`);
    });

    it("values", () => {
      const generated = generator.buildBlock("values", 2);
      expect(generated).toEqual(`  /**
   * Yield the values of the collection.
   *
   * @yields {*} The value.
   * @public
   */`);
    });

    it("isValidKeyPublic", () => {
      const generated = generator.buildBlock("isValidKeyPublic", 2);
      expect(generated).toEqual(`  /**
   * Determine if a set of keys is valid.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */`);
    });

    it("isValidKeyPrivate", () => {
      const generated = generator.buildBlock("isValidKeyPrivate", 2);
      expect(generated).toEqual(`  /**
   * Determine if a set of keys is valid.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */`);
    });

    it("requireValidKey", () => {
      const generated = generator.buildBlock("requireValidKey", 2);
      expect(generated).toEqual(`  /**
   * Throw if the key set is not valid.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @throws for an invalid key set.
   */`);
    });
  });

  describe(".buildBlock() with three arguments including a value type builds a valid comment block for the template name", () => {
    beforeEach(() => {
      generator.addParameter(new CollectionType("car", "Set", "Car", "object", "The car."));
      generator.addParameter(new CollectionType("driver", "Set", "Person", "object","The driver of the car."));
      generator.addParameter(new CollectionType("value", "Set", "State", "object","The state of registration."));
    });

    it("rootContainerSet", () => {
      const generated = generator.buildBlock("rootContainerSet", 2);
      expect(generated).toEqual(`  /**
   * Storage of the Set's contents for quick iteration in .values().  The values are always frozen arrays.
   *
   * @type {Map<hash, *[]>}
   * @constant
   */`);
    });

    it("valueAndKeySet", () => {
      const generated = generator.buildBlock("valueAndKeySet", 2);
      expect("\n" + generated + "\n").toEqual(`\n  /**
   * @typedef __SoloStrongSet_valueAndKeySet__
   * @property {*}   value  The actual value we store.
   * @property {*[]} keySet The set of keys we hashed.
   */\n`);
    });

    it("getSize", () => {
      const generated = generator.buildBlock("getSize", 2);
      expect(generated).toEqual(`  /**
   * The number of elements in this collection.
   *
   * @returns {number} The element count.
   * @public
   * @constant
   */`);
    });

    it("clear", () => {
      const generated = generator.buildBlock("clear", 2);
      expect(generated).toEqual(`  /**
   * Clear the collection.
   *
   * @public
   */`);
    });

    it("delete", () => {
      const generated = generator.buildBlock("delete", 2);
      expect(generated).toEqual(`  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @param {State}  value  The state of registration.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */`);
    });

    it("entries", () => {
      const generated = generator.buildBlock("entries", 2);
      expect(generated).toEqual(`  /**
   * Yield the key-value tuples of the collection.
   *
   * @yields {*[]} The keys and values.
   * @public
   */`);
    });

    it("forEach_Set", () => {
      const generated = generator.buildBlock("forEach_Set", 2);
      expect(generated).toEqual(`  /**
   * Iterate over the keys.
   *
   * @param {__SoloStrongSet_ForEachCallback__} __callback__ A function to invoke for each iteration.
   * @param {object}                            __thisArg__  Value to use as this when executing callback.
   * @public
   */`);
    });

    it("forEach_Set_callback", () => {
      const generated = generator.buildBlock("forEach_Set_callback", 2);
      expect(generated).toEqual(`  /**
   * An user-provided callback to .forEach().
   *
   * @callback __SoloStrongSet_ForEachCallback__
   * @param {Car}           car            The car.
   * @param {Person}        driver         The driver of the car.
   * @param {State}         value          The state of registration.
   * @param {SoloStrongSet} __collection__ This collection.
   */`);
    });

    it("has", () => {
      const generated = generator.buildBlock("has", 2);
      expect(generated).toEqual(`  /**
   * Report if the collection has a value for a key set.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @param {State}  value  The state of registration.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */`);
    });

    it("add", () => {
      const generated = generator.buildBlock("add", 2);
      expect(generated).toEqual(`  /**
   * Add a key set to this collection.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @param {State}  value  The state of registration.
   * @returns {SoloStrongSet} This collection.
   * @public
   */`);
    });

    it("values", () => {
      const generated = generator.buildBlock("values", 2);
      expect(generated).toEqual(`  /**
   * Yield the values of the collection.
   *
   * @yields {State} The value.
   * @public
   */`);
    });

    it("isValidKeyPublic", () => {
      const generated = generator.buildBlock("isValidKeyPublic", 2);
      expect(generated).toEqual(`  /**
   * Determine if a set of keys is valid.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @param {State}  value  The state of registration.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */`);
    });

    it("isValidKeyPrivate", () => {
      const generated = generator.buildBlock("isValidKeyPrivate", 2);
      expect(generated).toEqual(`  /**
   * Determine if a set of keys is valid.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @param {State}  value  The state of registration.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */`);
    });

    it("requireValidKey", () => {
      const generated = generator.buildBlock("requireValidKey", 2);
      expect(generated).toEqual(`  /**
   * Throw if the key set is not valid.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @param {State}  value  The state of registration.
   * @throws for an invalid key set.
   */`);
    });
  });

  it(".buildBlock() with no arguments and a value type builds a valid comment block for the template name forEachCallbackSet", () => {
    generator.addParameter(new CollectionType("value", "Set", "State", "object", "The state of registration."));

    const generated = generator.buildBlock("forEach_Set_callback", 2);
    expect(generated).toEqual(`  /**
   * An user-provided callback to .forEach().
   *
   * @callback __SoloStrongSet_ForEachCallback__
   * @param {State}         value          The state of registration.
   * @param {SoloStrongSet} __collection__ This collection.
   */`);
  });

  it("indents based on the baseIndent passed in", () => {
    generator.addParameter(new CollectionType("car", "Set", "Car", "object", "The car."));
    generator.addParameter(new CollectionType("driver", "Set", "Person", "object", "The driver of the car."));

    const generated = generator.buildBlock("rootContainerMap", 4);
    expect(generated).toEqual(`    /**
     * The root map holding keys and values.
     *
     * @type {Map<string, __SoloStrongSet_valueAndKeySet__>}
     * @constant
     */`);
  });
});

describe("JSDocGenerator for maps of sets", () => {
  let generator;
  beforeEach(() => {
    generator = new JSDocGenerator("WeakMapOfStrongSets", false);
    generator.addParameter(new CollectionType("car", "WeakMap", "Car", "object", "The car."));
    generator.addParameter(new CollectionType("driver", "Set", "Person", "object", "The driver of the car."));
  });
  afterEach(() => generator = null);

  it("requireInnerCollectionPrivate", () => {
    const generated = generator.buildBlock("requireInnerCollectionPrivate", 2);
    expect(generated).toEqual(`  /**
   * Require an inner collection exist for the given map keys.
   *
   * @param {Car} car The car.
   * @returns {__WeakMapOfStrongSets_InnerMap__} The inner collection.
   */`);
  });

  it("getExistingInnerCollectionPrivate", () => {
    const generated = generator.buildBlock("getExistingInnerCollectionPrivate", 2);
    expect(generated).toEqual(`  /**
   * Get an existing inner collection for the given map keys.
   *
   * @param {Car} car The car.
   * @returns {__WeakMapOfStrongSets_InnerMap__?} The inner collection.
   */`);
  });

  it("requireValidMapKey", () => {
    const generated = generator.buildBlock("requireValidMapKey", 2);
    expect(generated).toEqual(`  /**
   * Throw if the map key set is not valid.
   *
   * @param {Car} car The car.
   * @throws for an invalid key set.
   */`);
  });

  it("isValidMapKeyPrivate", () => {
    const generated = generator.buildBlock("isValidMapKeyPrivate", 2);
    expect(generated).toEqual(`  /**
   * Determine if a set of map keys is valid.
   *
   * @param {Car} car The car.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */`);
  });

  it("isValidSetKeyPrivate", () => {
    const generated = generator.buildBlock("isValidSetKeyPrivate", 2);
    expect(generated).toEqual(`  /**
   * Determine if a set of set keys is valid.
   *
   * @param {Person} driver The driver of the car.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */`);
  });
});
