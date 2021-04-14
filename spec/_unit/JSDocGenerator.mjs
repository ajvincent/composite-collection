import JSDocGenerator from "../../source/JSDocGenerator.mjs";

describe("JSDocGenerator for maps", () => {
  let generator;
  afterEach(() => generator = null);

  it("doesn't throw for invoking addParameter()", () => {
    generator = new JSDocGenerator("SoloStrongMap", false);
    expect(() => generator.addParameter("Car", "car", "The car.")).not.toThrow();
  });

  describe(".buildBlock() with two arguments and no value type builds a valid comment block for the template name", () => {
    beforeEach(() => {
      generator = new JSDocGenerator("SoloStrongMap", false);
      generator.addParameter("Car", "car", "The car.");
      generator.addParameter("Person", "driver", "The driver of the car.");
    });

    it("rootContainerMap", () => {
      const generated = generator.buildBlock("rootContainerMap", 2);
      expect(generated).toEqual(`  /**
   * The root map holding keys and values.
   *
   * @type {Map<string, SoloStrongMap~valueAndKeySet>}
   *
   * @private
   * @readonly
   */`);
    });

    it("valueAndKeySet", () => {
      const generated = generator.buildBlock("valueAndKeySet", 2);
      expect(generated).toEqual(`  /**
   * @typedef SoloStrongMap~valueAndKeySet
   * @property {*}   value  The actual value we store.
   * @property {*[]} keySet The set of keys we hashed.
   *
   * @private
   * @readonly
   */`);
    });

    it("getSize", () => {
      const generated = generator.buildBlock("getSize", 2);
      expect(generated).toEqual(`  /**
   * The number of elements in this collection.
   *
   * @public
   * @readonly
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
   *
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */`);
    });

    it("entries", () => {
      const generated = generator.buildBlock("entries", 2);
      expect(generated).toEqual(`  /**
   * Return a new iterator for the key-value pairs of the collection.
   *
   * @returns {Iterator<[car, driver, value]>}
   * @public
   */`);
    });

    it("forEachMap", () => {
      const generated = generator.buildBlock("forEachMap", 2);
      expect(generated).toEqual(`  /**
   * Iterate over the keys and values.
   *
   * @param {SoloStrongMap~ForEachCallback} callback A function to invoke for each iteration.
   *
   * @public
   */`);
    });

    it("forEachCallbackMap", () => {
      const generated = generator.buildBlock("forEachCallbackMap", 2);
      expect(generated).toEqual(`  /**
   * @callback SoloStrongMap~ForEachCallback
   *
   * @param {*}             value          The value.
   * @param {Car}           car            The car.
   * @param {Person}        driver         The driver of the car.
   * @param {SoloStrongMap} __collection__ This collection.
   *
   */`);
    });

    it("get", () => {
      const generated = generator.buildBlock("get", 2);
      expect(generated).toEqual(`  /**
   * Get a value for a key set.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   *
   * @returns {*?} The value.  Undefined if it isn't in the collection.
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
   *
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */`);
    });

    it("keys", () => {
      const generated = generator.buildBlock("keys", 2);
      expect(generated).toEqual(`  /**
   * Return a new iterator for the key sets of the collection.
   *
   * @returns {Iterator<[car, driver]>}
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
   *
   * @returns {SoloStrongMap} This collection.
   * @public
   */`);
    });

    it("values", () => {
      const generated = generator.buildBlock("values", 2);
      expect(generated).toEqual(`  /**
   * Return a new iterator for the values of the collection.
   *
   * @returns {Iterator<*>}
   * @public
   */`);
    });

    it("wrapIteratorMap", () => {
      const generated = generator.buildBlock("wrapIteratorMap", 2);
      expect(generated).toEqual(`  /**
   * Bootstrap from the native Map's values() iterator to the kind of iterator we want.
   *
   * @param {function} unpacker The transforming function for values.
   *
   * @returns {Iterator<*>}
   * @private
   */`);
    });

    it("validateArguments", () => {
      const generated = generator.buildBlock("validateArguments", 2);
      expect(generated).toEqual(`  /**
   * Validate the arguments.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   *
   * @private
   */`);
    });
  });

  describe(".buildBlock() with two arguments and a value type builds a valid comment block for the template name", () => {
    beforeEach(() => {
      generator = new JSDocGenerator("SoloStrongMap", false);
      generator.addParameter("Car", "car", "The car.");
      generator.addParameter("Person", "driver", "The driver of the car.");
      generator.addParameter("State", "value", "The state of registration.");
    });

    it("rootContainerMap", () => {
      const generated = generator.buildBlock("rootContainerMap", 2);
      expect(generated).toEqual(`  /**
   * The root map holding keys and values.
   *
   * @type {Map<string, SoloStrongMap~valueAndKeySet>}
   *
   * @private
   * @readonly
   */`);
    });

    it("valueAndKeySet", () => {
      const generated = generator.buildBlock("valueAndKeySet", 2);
      expect(generated).toEqual(`  /**
   * @typedef SoloStrongMap~valueAndKeySet
   * @property {*}   value  The actual value we store.
   * @property {*[]} keySet The set of keys we hashed.
   *
   * @private
   * @readonly
   */`);
    });

    it("getSize", () => {
      const generated = generator.buildBlock("getSize", 2);
      expect(generated).toEqual(`  /**
   * The number of elements in this collection.
   *
   * @public
   * @readonly
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
   *
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */`);
    });

    it("entries", () => {
      const generated = generator.buildBlock("entries", 2);
      expect(generated).toEqual(`  /**
   * Return a new iterator for the key-value pairs of the collection.
   *
   * @returns {Iterator<[car, driver, value]>}
   * @public
   */`);
    });

    it("forEachMap", () => {
      const generated = generator.buildBlock("forEachMap", 2);
      expect(generated).toEqual(`  /**
   * Iterate over the keys and values.
   *
   * @param {SoloStrongMap~ForEachCallback} callback A function to invoke for each iteration.
   *
   * @public
   */`);
    });

    it("forEachCallbackMap", () => {
      const generated = generator.buildBlock("forEachCallbackMap", 2);
      expect(generated).toEqual(`  /**
   * @callback SoloStrongMap~ForEachCallback
   *
   * @param {State}         value          The state of registration.
   * @param {Car}           car            The car.
   * @param {Person}        driver         The driver of the car.
   * @param {SoloStrongMap} __collection__ This collection.
   *
   */`);
    });

    it("get", () => {
      const generated = generator.buildBlock("get", 2);
      expect(generated).toEqual(`  /**
   * Get a value for a key set.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   *
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
   *
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */`);
    });

    it("keys", () => {
      const generated = generator.buildBlock("keys", 2);
      expect(generated).toEqual(`  /**
   * Return a new iterator for the key sets of the collection.
   *
   * @returns {Iterator<[car, driver]>}
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
   *
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
   *
   * @returns {SoloStrongMap} This collection.
   * @public
   */`);
    });

    it("values", () => {
      const generated = generator.buildBlock("values", 2);
      expect(generated).toEqual(`  /**
   * Return a new iterator for the values of the collection.
   *
   * @returns {Iterator<State>}
   * @public
   */`);
    });

    it("wrapIteratorMap", () => {
      const generated = generator.buildBlock("wrapIteratorMap", 2);
      expect(generated).toEqual(`  /**
   * Bootstrap from the native Map's values() iterator to the kind of iterator we want.
   *
   * @param {function} unpacker The transforming function for values.
   *
   * @returns {Iterator<*>}
   * @private
   */`);
    });

    it("validateArguments", () => {
      const generated = generator.buildBlock("validateArguments", 2);
      expect(generated).toEqual(`  /**
   * Validate the arguments.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   *
   * @private
   */`);
    });
  });

  it(".buildBlock() with no arguments and no value type builds a valid comment block for the template name forEachCallbackSet", () => {
    generator = new JSDocGenerator("SoloStrongMap", false);

    const generated = generator.buildBlock("forEachCallbackSet", 2);
    expect(generated).toEqual(`  /**
   * @callback SoloStrongMap~ForEachCallback
   *
   * @param {*}             value          The value.
   * @param {SoloStrongMap} __collection__ This collection.
   *
   */`);
  });

  it("indents based on the baseIndent passed in", () => {
    generator = new JSDocGenerator("SoloStrongMap", false);
    generator.addParameter("Car", "car", "The car.");
    generator.addParameter("Person", "driver", "The driver of the car.");

    const generated = generator.buildBlock("rootContainerMap", 4);
    expect(generated).toEqual(`    /**
     * The root map holding keys and values.
     *
     * @type {Map<string, SoloStrongMap~valueAndKeySet>}
     *
     * @private
     * @readonly
     */`);
  });
});

describe("JSDocGenerator for sets", () => {
  let generator;
  beforeEach(() => {
    generator = new JSDocGenerator("SoloStrongSet", true);
  });

  it("doesn't throw for invoking addParameter()", () => {
    expect(() => generator.addParameter("Car", "car", "The car.")).not.toThrow();
  });

  describe(".buildBlock() with two arguments and no value type builds a valid comment block for the template name", () => {
    beforeEach(() => {
      generator.addParameter("Car", "car", "The car.");
      generator.addParameter("Person", "driver", "The driver of the car.");
    });

    it("rootContainerSet", () => {
      const generated = generator.buildBlock("rootContainerSet", 2);
      expect(generated).toEqual(`  /**
   * Storage of the Set's contents for quick iteration in .values().  The values are always frozen arrays.
   *
   * @type {Map<hash, *[]>}
   *
   * @private
   * @readonly
   */`);
    });

    it("valueAndKeySet", () => {
      const generated = generator.buildBlock("valueAndKeySet", 2);
      expect(generated).toEqual(`  /**
   * @typedef SoloStrongSet~valueAndKeySet
   * @property {*}   value  The actual value we store.
   * @property {*[]} keySet The set of keys we hashed.
   *
   * @private
   * @readonly
   */`);
    });

    it("getSize", () => {
      const generated = generator.buildBlock("getSize", 2);
      expect(generated).toEqual(`  /**
   * The number of elements in this collection.
   *
   * @public
   * @readonly
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
   *
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */`);
    });

    it("forEachSet", () => {
      const generated = generator.buildBlock("forEachSet", 2);
      expect(generated).toEqual(`  /**
   * Iterate over the keys.
   *
   * @param {SoloStrongSet~ForEachCallback} callback A function to invoke for each iteration.
   *
   * @public
   */`);
    });

    it("forEachCallbackSet", () => {
      const generated = generator.buildBlock("forEachCallbackSet", 2);
      expect(generated).toEqual(`  /**
   * @callback SoloStrongSet~ForEachCallback
   *
   * @param {Car}           car            The car.
   * @param {Person}        driver         The driver of the car.
   * @param {SoloStrongSet} __collection__ This collection.
   *
   */`);
    });

    it("has", () => {
      const generated = generator.buildBlock("has", 2);
      expect(generated).toEqual(`  /**
   * Report if the collection has a value for a key set.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   *
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
   *
   * @returns {SoloStrongSet} This collection.
   * @public
   */`);
    });

    it("values", () => {
      const generated = generator.buildBlock("values", 2);
      expect(generated).toEqual(`  /**
   * Return a new iterator for the values of the collection.
   *
   * @returns {Iterator<*>}
   * @public
   */`);
    });

    it("wrapIteratorMap", () => {
      const generated = generator.buildBlock("wrapIteratorMap", 2);
      expect(generated).toEqual(`  /**
   * Bootstrap from the native Map's values() iterator to the kind of iterator we want.
   *
   * @param {function} unpacker The transforming function for values.
   *
   * @returns {Iterator<*>}
   * @private
   */`);
    });

    it("validateArguments", () => {
      const generated = generator.buildBlock("validateArguments", 2);
      expect(generated).toEqual(`  /**
   * Validate the arguments.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   *
   * @private
   */`);
    });
  });

  describe(".buildBlock() with three arguments including a value type builds a valid comment block for the template name", () => {
    beforeEach(() => {
      generator.addParameter("Car", "car", "The car.");
      generator.addParameter("Person", "driver", "The driver of the car.");
      generator.addParameter("State", "value", "The state of registration.");
    });

    it("rootContainerSet", () => {
      const generated = generator.buildBlock("rootContainerSet", 2);
      expect(generated).toEqual(`  /**
   * Storage of the Set's contents for quick iteration in .values().  The values are always frozen arrays.
   *
   * @type {Map<hash, *[]>}
   *
   * @private
   * @readonly
   */`);
    });

    it("valueAndKeySet", () => {
      const generated = generator.buildBlock("valueAndKeySet", 2);
      expect(generated).toEqual(`  /**
   * @typedef SoloStrongSet~valueAndKeySet
   * @property {*}   value  The actual value we store.
   * @property {*[]} keySet The set of keys we hashed.
   *
   * @private
   * @readonly
   */`);
    });

    it("getSize", () => {
      const generated = generator.buildBlock("getSize", 2);
      expect(generated).toEqual(`  /**
   * The number of elements in this collection.
   *
   * @public
   * @readonly
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
   *
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */`);
    });

    it("entries", () => {
      const generated = generator.buildBlock("entries", 2);
      expect(generated).toEqual(`  /**
   * Return a new iterator for the key-value pairs of the collection.
   *
   * @returns {Iterator<[car, driver, value]>}
   * @public
   */`);
    });

    it("forEachSet", () => {
      const generated = generator.buildBlock("forEachSet", 2);
      expect(generated).toEqual(`  /**
   * Iterate over the keys.
   *
   * @param {SoloStrongSet~ForEachCallback} callback A function to invoke for each iteration.
   *
   * @public
   */`);
    });

    it("forEachCallbackSet", () => {
      const generated = generator.buildBlock("forEachCallbackSet", 2);
      expect(generated).toEqual(`  /**
   * @callback SoloStrongSet~ForEachCallback
   *
   * @param {Car}           car            The car.
   * @param {Person}        driver         The driver of the car.
   * @param {State}         value          The state of registration.
   * @param {SoloStrongSet} __collection__ This collection.
   *
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
   *
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
   *
   * @returns {SoloStrongSet} This collection.
   * @public
   */`);
    });

    it("values", () => {
      const generated = generator.buildBlock("values", 2);
      expect(generated).toEqual(`  /**
   * Return a new iterator for the values of the collection.
   *
   * @returns {Iterator<State>}
   * @public
   */`);
    });

    it("wrapIteratorMap", () => {
      const generated = generator.buildBlock("wrapIteratorMap", 2);
      expect(generated).toEqual(`  /**
   * Bootstrap from the native Map's values() iterator to the kind of iterator we want.
   *
   * @param {function} unpacker The transforming function for values.
   *
   * @returns {Iterator<*>}
   * @private
   */`);
    });

    it("validateArguments", () => {
      const generated = generator.buildBlock("validateArguments", 2);
      expect(generated).toEqual(`  /**
   * Validate the arguments.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @param {State}  value  The state of registration.
   *
   * @private
   */`);
    });
  });

  it(".buildBlock() with no arguments and a value type builds a valid comment block for the template name forEachCallbackSet", () => {
    generator.addParameter("State", "value", "The state of registration.");

    const generated = generator.buildBlock("forEachCallbackSet", 2);
    expect(generated).toEqual(`  /**
   * @callback SoloStrongSet~ForEachCallback
   *
   * @param {State}         value          The state of registration.
   * @param {SoloStrongSet} __collection__ This collection.
   *
   */`);
  });

  it("indents based on the baseIndent passed in", () => {
    generator.addParameter("Car", "car", "The car.");
    generator.addParameter("Person", "driver", "The driver of the car.");

    const generated = generator.buildBlock("rootContainerMap", 4);
    expect(generated).toEqual(`    /**
     * The root map holding keys and values.
     *
     * @type {Map<string, SoloStrongSet~valueAndKeySet>}
     *
     * @private
     * @readonly
     */`);
  });
});
