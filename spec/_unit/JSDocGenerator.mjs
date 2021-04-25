import JSDocGenerator from "../../source/JSDocGenerator.mjs";
import CollectionType from "../../source/CollectionType.mjs";

describe("JSDocGenerator for maps", () => {
  let generator;
  afterEach(() => generator = null);

  it("doesn't throw for invoking addParameter() with a CollectionType", () => {
    generator = new JSDocGenerator("SoloStrongMap", false);
    expect(
      () => generator.addParameter(new CollectionType("car", "Map", "Car", "The car."))
    ).not.toThrow();
  });

  describe(".buildBlock() with two arguments and no value type builds a valid comment block for the template name", () => {
    beforeEach(() => {
      generator = new JSDocGenerator("SoloStrongMap", false);
      generator.addParameter(new CollectionType("car", "Map", "Car", "The car."));
      generator.addParameter(new CollectionType("driver", "Map", "Person", "The driver of the car."));
    });

    it("rootContainerMap", () => {
      const generated = generator.buildBlock("rootContainerMap", 2);
      expect(generated).toEqual(`  /**
   * The root map holding keys and values.
   *
   * @type {Map<string, SoloStrongMap~valueAndKeySet>}
   *
   * @private
   * @const
   */`);
    });

    it("rootContainerWeakMap", () => {
      const generated = generator.buildBlock("rootContainerWeakMap", 2);
      expect(generated).toEqual(`  /**
   * The root map holding weak composite keys and values.
   *
   * @type {WeakMap<object, WeakMap<WeakKey, *>>}
   *
   * @private
   * @const
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
   * @const
   */`);
    });

    it("getSize", () => {
      const generated = generator.buildBlock("getSize", 2);
      expect(generated).toEqual(`  /**
   * The number of elements in this collection.
   *
   * @public
   * @const
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

    it("isValidKeyPublic", () => {
      const generated = generator.buildBlock("isValidKeyPublic", 2);
      expect(generated).toEqual(`  /**
   * Determine if a set of keys is valid.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   *
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
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @private
   */`);
    });

    it("requireValidKey", () => {
      const generated = generator.buildBlock("requireValidKey", 2);
      expect(generated).toEqual(`  /**
   * Throw if the key set is not valid.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   *
   * @throws for an invalid key set.
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
  });

  describe(".buildBlock() with two arguments and a value type builds a valid comment block for the template name", () => {
    beforeEach(() => {
      generator = new JSDocGenerator("SoloStrongMap", false);
      generator.addParameter(new CollectionType("car", "Map", "Car", "The car."));
      generator.addParameter(new CollectionType("driver", "Map", "Person", "The driver of the car."));
      generator.addParameter(new CollectionType("value", "Map", "State", "The state of registration."));
    });

    it("rootContainerMap", () => {
      const generated = generator.buildBlock("rootContainerMap", 2);
      expect(generated).toEqual(`  /**
   * The root map holding keys and values.
   *
   * @type {Map<string, SoloStrongMap~valueAndKeySet>}
   *
   * @private
   * @const
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
   * @const
   */`);
    });

    it("getSize", () => {
      const generated = generator.buildBlock("getSize", 2);
      expect(generated).toEqual(`  /**
   * The number of elements in this collection.
   *
   * @public
   * @const
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

    it("isValidKeyPublic", () => {
      const generated = generator.buildBlock("isValidKeyPublic", 2);
      expect(generated).toEqual(`  /**
   * Determine if a set of keys is valid.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   *
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
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @private
   */`);
    });

    it("requireValidKey", () => {
      const generated = generator.buildBlock("requireValidKey", 2);
      expect(generated).toEqual(`  /**
   * Throw if the key set is not valid.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   *
   * @throws for an invalid key set.
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
    generator.addParameter(new CollectionType("car", "Map", "Car", "The car."));
    generator.addParameter(new CollectionType("driver", "Map", "Person", "The driver of the car."));

    const generated = generator.buildBlock("rootContainerMap", 4);
    expect(generated).toEqual(`    /**
     * The root map holding keys and values.
     *
     * @type {Map<string, SoloStrongMap~valueAndKeySet>}
     *
     * @private
     * @const
     */`);
  });

  it("throws for invoking addParameter with a first argument that isn't a CollectionType", () => {
    generator = new JSDocGenerator("SoloStrongMap", false);
    expect(() => generator.addParameter("Car", "car", "The car.")).toThrowError("parameter must be a CollectionType!");
  });
});

describe("JSDocGenerator for sets", () => {
  let generator;
  beforeEach(() => {
    generator = new JSDocGenerator("SoloStrongSet", true);
  });

  it("doesn't throw for invoking addParameter() with a CollectionType", () => {
    expect(
      () => generator.addParameter(new CollectionType("car", "Set", "Car", "The car."))
    ).not.toThrow();
  });

  describe(".buildBlock() with two arguments and no value type builds a valid comment block for the template name", () => {
    beforeEach(() => {
      generator.addParameter(new CollectionType("car", "Set", "Car", "The car."));
      generator.addParameter(new CollectionType("driver", "Set", "Person", "The driver of the car."));
    });

    it("rootContainerSet", () => {
      const generated = generator.buildBlock("rootContainerSet", 2);
      expect(generated).toEqual(`  /**
   * Storage of the Set's contents for quick iteration in .values().  The values are always frozen arrays.
   *
   * @type {Map<hash, *[]>}
   *
   * @private
   * @const
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
   * @const
   */`);
    });

    it("getSize", () => {
      const generated = generator.buildBlock("getSize", 2);
      expect(generated).toEqual(`  /**
   * The number of elements in this collection.
   *
   * @public
   * @const
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

    it("isValidKeyPublic", () => {
      const generated = generator.buildBlock("isValidKeyPublic", 2);
      expect(generated).toEqual(`  /**
   * Determine if a set of keys is valid.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   *
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
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @private
   */`);
    });

    it("requireValidKey", () => {
      const generated = generator.buildBlock("requireValidKey", 2);
      expect(generated).toEqual(`  /**
   * Throw if the key set is not valid.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   *
   * @throws for an invalid key set.
   */`);
    });
  });

  describe(".buildBlock() with three arguments including a value type builds a valid comment block for the template name", () => {
    beforeEach(() => {
      generator.addParameter(new CollectionType("car", "Set", "Car", "The car."));
      generator.addParameter(new CollectionType("driver", "Set", "Person", "The driver of the car."));
      generator.addParameter(new CollectionType("value", "Set", "State", "The state of registration."));
    });

    it("rootContainerSet", () => {
      const generated = generator.buildBlock("rootContainerSet", 2);
      expect(generated).toEqual(`  /**
   * Storage of the Set's contents for quick iteration in .values().  The values are always frozen arrays.
   *
   * @type {Map<hash, *[]>}
   *
   * @private
   * @const
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
   * @const
   */`);
    });

    it("getSize", () => {
      const generated = generator.buildBlock("getSize", 2);
      expect(generated).toEqual(`  /**
   * The number of elements in this collection.
   *
   * @public
   * @const
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

    it("isValidKeyPublic", () => {
      const generated = generator.buildBlock("isValidKeyPublic", 2);
      expect(generated).toEqual(`  /**
   * Determine if a set of keys is valid.
   *
   * @param {Car}    car    The car.
   * @param {Person} driver The driver of the car.
   * @param {State}  value  The state of registration.
   *
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
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @private
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
   *
   * @throws for an invalid key set.
   */`);
    });
  });

  it(".buildBlock() with no arguments and a value type builds a valid comment block for the template name forEachCallbackSet", () => {
    generator.addParameter(new CollectionType("value", "Set", "State", "The state of registration."));

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
    generator.addParameter(new CollectionType("car", "Set", "Car", "The car."));
    generator.addParameter(new CollectionType("driver", "Set", "Person", "The driver of the car."));

    const generated = generator.buildBlock("rootContainerMap", 4);
    expect(generated).toEqual(`    /**
     * The root map holding keys and values.
     *
     * @type {Map<string, SoloStrongSet~valueAndKeySet>}
     *
     * @private
     * @const
     */`);
  });

  it("throws for invoking addParameter with a first argument that isn't a CollectionType", () => {
    generator = new JSDocGenerator("SoloStrongSet", true);
    expect(() => generator.addParameter("Car", "car", "The car.")).toThrowError("parameter must be a CollectionType!");
  });
});

describe("JSDocGenerator for maps of sets", () => {
  let generator;
  beforeEach(() => {
    generator = new JSDocGenerator("WeakMapOfStrongSets", false);
    generator.addParameter(new CollectionType("car", "WeakMap", "Car", "The car."));
    generator.addParameter(new CollectionType("driver", "Set", "Person", "The driver of the car."));
  });
  afterEach(() => generator = null);

  it("requireInnerCollectionPrivate", () => {
    const generated = generator.buildBlock("requireInnerCollectionPrivate", 2);
    expect(generated).toEqual(`  /**
   * Require an inner collection exist for the given map keys.
   *
   * @param {Car} car The car.
   *
   * @private
   */`);
  });

  it("getExistingInnerCollectionPrivate", () => {
    const generated = generator.buildBlock("getExistingInnerCollectionPrivate", 2);
    expect(generated).toEqual(`  /**
   * Get an existing inner collection for the given map keys.
   *
   * @param {Car} car The car.
   *
   * @returns {WeakMapOfStrongSets~InnerMap}
   * @private
   */`);
  });

  it("requireValidMapKey", () => {
    const generated = generator.buildBlock("requireValidMapKey", 2);
    expect(generated).toEqual(`  /**
   * Throw if the map key set is not valid.
   *
   * @param {Car} car The car.
   *
   * @throws for an invalid key set.
   * @private
   */`);
  });

  it("isValidMapKeyPrivate", () => {
    const generated = generator.buildBlock("isValidMapKeyPrivate", 2);
    expect(generated).toEqual(`  /**
   * Determine if a set of map keys is valid.
   *
   * @param {Car} car The car.
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @private
   */`);
  });

  it("isValidSetKeyPrivate", () => {
    const generated = generator.buildBlock("isValidSetKeyPrivate", 2);
    expect(generated).toEqual(`  /**
   * Determine if a set of set keys is valid.
   *
   * @param {Person} driver The driver of the car.
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @private
   */`);
  });
});
