import JSDocGenerator from "../../source/JSDocGenerator.mjs";

describe("JSDocGenerator for maps", () => {
  let generator;
  beforeEach(() => {
    generator = new JSDocGenerator("SoloStrongMap", false);
  });

  it("doesn't throw for invoking addParameter()", () => {
    expect(() => generator.addParameter("Car", "car", "The car.")).not.toThrow();
  });

  describe(".buildBlock() with two arguments and no value type builds a valid comment block for the template name", () => {
    beforeEach(() => {
      generator.addParameter("Car", "car", "The car.");
      generator.addParameter("Person", "driver", "The driver of the car.");
    });

    it("rootContainer", () => {
      const generated = generator.buildBlock("rootContainer", 2);
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
   * @property {void}   value  The actual value we store.
   * @property {void[]} keySet The set of keys we hashed.
   *
   * @private
   * @readonly
   */`);
    });

    it("getSize", () => {
      const generated = generator.buildBlock("getSize", 2);
      expect(generated).toEqual(`  /**
   * The number of elements in this map.
   *
   * @public
   * @readonly
   */`);
    });

    it("clear", () => {
      const generated = generator.buildBlock("clear", 2);
      expect(generated).toEqual(`  /**
   * Clear the map.
   *
   * @public
   */`);
    });

    it("delete", () => {
      const generated = generator.buildBlock("delete", 2);
      expect(generated).toEqual(`  /**
   * Delete an element from the map by the given key sequence.
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
   * Return a new iterator for the key-value pairs of the map.
   *
   * @returns {Iterator<car, driver, value>}
   * @public
   */`);
    });

    it("forEach", () => {
      const generated = generator.buildBlock("forEach", 2);
      expect(generated).toEqual(`  /**
   * Iterate over the keys and values.
   *
   * @param {SoloStrongMap~ForEachCallback} callback A function to invoke for each key set.
   *
   * @public
   */`);
    });

    it("forEachCallback", () => {
      const generated = generator.buildBlock("forEachCallback", 2);
      expect(generated).toEqual(`  /**
   * @callback SoloStrongMap~ForEachCallback
   *
   * @param {Car}           car     The car.
   * @param {Person}        driver  The driver of the car.
   * @param {SoloStrongMap} __map__ The map.
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
   * @returns {void?} The value.  Undefined if it isn't in the map.
   * @public
   */`);
    });

    it("has", () => {
      const generated = generator.buildBlock("has", 2);
      expect(generated).toEqual(`  /**
   * Report if the map has a value for a key set.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   *
   * @returns {boolean} True if the key set refers to a value in the map.
   * @public
   */`);
    });

    it("keys", () => {
      const generated = generator.buildBlock("keys", 2);
      expect(generated).toEqual(`  /**
   * Return a new iterator for the key sets of the map.
   *
   * @returns {Iterator<car, driver>}
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
   * @param {void}   value  The value to set.
   *
   * @returns {SoloStrongMap} This map.
   * @public
   */`);
    });

    it("values", () => {
      const generated = generator.buildBlock("values", 2);
      expect(generated).toEqual(`  /**
   * Return a new iterator for the values of the map.
   *
   * @returns {Iterator<void>}
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
   * @returns {Iterator<void>}
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
      generator.addParameter("Car", "car", "The car.");
      generator.addParameter("Person", "driver", "The driver of the car.");
      generator.addParameter("State", "value", "The state of registration.");
    });

    it("rootContainer", () => {
      const generated = generator.buildBlock("rootContainer", 2);
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
   * @property {void}   value  The actual value we store.
   * @property {void[]} keySet The set of keys we hashed.
   *
   * @private
   * @readonly
   */`);
    });

    it("getSize", () => {
      const generated = generator.buildBlock("getSize", 2);
      expect(generated).toEqual(`  /**
   * The number of elements in this map.
   *
   * @public
   * @readonly
   */`);
    });

    it("clear", () => {
      const generated = generator.buildBlock("clear", 2);
      expect(generated).toEqual(`  /**
   * Clear the map.
   *
   * @public
   */`);
    });

    it("delete", () => {
      const generated = generator.buildBlock("delete", 2);
      expect(generated).toEqual(`  /**
   * Delete an element from the map by the given key sequence.
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
   * Return a new iterator for the key-value pairs of the map.
   *
   * @returns {Iterator<car, driver, value>}
   * @public
   */`);
    });

    it("forEach", () => {
      const generated = generator.buildBlock("forEach", 2);
      expect(generated).toEqual(`  /**
   * Iterate over the keys and values.
   *
   * @param {SoloStrongMap~ForEachCallback} callback A function to invoke for each key set.
   *
   * @public
   */`);
    });

    it("forEachCallback", () => {
      const generated = generator.buildBlock("forEachCallback", 2);
      expect(generated).toEqual(`  /**
   * @callback SoloStrongMap~ForEachCallback
   *
   * @param {Car}           car     The car.
   * @param {Person}        driver  The driver of the car.
   * @param {SoloStrongMap} __map__ The map.
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
   * @returns {State?} The state of registration.  Undefined if it isn't in the map.
   * @public
   */`);
    });

    it("has", () => {
      const generated = generator.buildBlock("has", 2);
      expect(generated).toEqual(`  /**
   * Report if the map has a value for a key set.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   *
   * @returns {boolean} True if the key set refers to a value in the map.
   * @public
   */`);
    });

    it("keys", () => {
      const generated = generator.buildBlock("keys", 2);
      expect(generated).toEqual(`  /**
   * Return a new iterator for the key sets of the map.
   *
   * @returns {Iterator<car, driver>}
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
   * @returns {SoloStrongMap} This map.
   * @public
   */`);
    });

    it("values", () => {
      const generated = generator.buildBlock("values", 2);
      expect(generated).toEqual(`  /**
   * Return a new iterator for the values of the map.
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
   * @returns {Iterator<void>}
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

  it("indents based on the baseIndent passed in", () => {
    generator.addParameter("Car", "car", "The car.");
    generator.addParameter("Person", "driver", "The driver of the car.");

    const generated = generator.buildBlock("rootContainer", 4);
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
