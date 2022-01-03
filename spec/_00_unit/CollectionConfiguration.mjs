import CollectionConfiguration from "#source/CollectionConfiguration.mjs";

describe("CollectionConfiguration", () => {
  it("class is frozen", () => {
    expect(typeof CollectionConfiguration).toBe("function");
    expect(Object.isFrozen(CollectionConfiguration)).toBe(true);
    expect(Object.isFrozen(CollectionConfiguration.prototype)).toBe(true);

    expect(Reflect.ownKeys(CollectionConfiguration.prototype)).toEqual([
      "constructor",
      "currentState",
      "setFileOverview",
      "cloneData",
      "importLines",
      "addMapKey",
      "addSetKey",
      "setValueType",
      "configureOneToOne",
      "lock",
    ]);
  });

  describe("constructor", () => {
    it("disallows setting undefined properties", () => {
      const config = new CollectionConfiguration("FooMap", "Map");
      expect(Object.isSealed(config)).toBe(true);
      expect(Reflect.ownKeys(config)).toEqual([]);
    });

    it(`throws for the names "Map", "WeakMap", "Set", and "WeakSet"`, () => {
      expect(() => {
        void(new CollectionConfiguration("Map", "Map"))
      }).toThrowError(`You can't override the Map primordial!`);

      expect(() => {
        void(new CollectionConfiguration("WeakMap", "WeakMap"))
      }).toThrowError(`You can't override the WeakMap primordial!`);

      expect(() => {
        void(new CollectionConfiguration("Set", "Set"))
      }).toThrowError(`You can't override the Set primordial!`);

      expect(() => {
        void(new CollectionConfiguration("WeakSet", "WeakSet"))
      }).toThrowError(`You can't override the WeakSet primordial!`);
    });

    it("throws for StrongMapOfWeakSets", () => {
      expect(() => {
        void(new CollectionConfiguration("FooMap", "Map", "WeakSet"))
      }).toThrowError("outerType must be a WeakMap when the innerType is a WeakSet!");
    });

    it("throws for a constructor starting and ending with double underscores", () => {
      expect(() => {
        void(new CollectionConfiguration("__FooMap__", "Map"));
      }).toThrowError("This module reserves variable names starting and ending with a double underscore for itself.");
    });
  });

  it("instances are frozen objects with no own properties", () => {
    const config = new CollectionConfiguration("FooMap", "Map");
    expect(Object.isFrozen(config)).toBe(true);
  });

  describe(".setFileOverview()", () => {
    let config;
    const overview = `
    This is a FooSet.  There are none like it but this is mine!

    This is still a FooSet!
    `.trim();

    beforeEach(() => config = new CollectionConfiguration("FooMap", "Map"));
    it("can be set once to a string", () => {
      expect(() => {
        config.setFileOverview(overview);
      }).not.toThrow();

      expect(config.cloneData().fileOverview).toBe(overview);
    });

    it("throws for setting twice", () => {
      config.setFileOverview(overview);
      expect(() => {
        config.setFileOverview("foo");
      }).toThrowError("fileoverview has already been set!");
    });

    it("throws for setting to a non-string value", () => {
      expect(() => {
        config.setFileOverview(Symbol("foo"));
      }).toThrowError(`fileoverview must be a non-empty string!`);
    });
  });

  describe(".addMapKey()", () => {
    let config, options, type1Args;
    beforeEach(() => {
      config = new CollectionConfiguration("FooMap", "WeakMap");
      options = {
        argumentType: "Cat",
        description: "The other cat",
      }

      type1Args = [
        "mother",
        true,
        options
      ];
      Object.freeze(type1Args);
    });

    const argumentValidator = mother => void(mother);

    it("defines a collection type when called without an argument filter", () => {
      config.addMapKey(...type1Args);

      const typeData = config.cloneData();
      expect(typeData.parameterToTypeMap.size).toBe(1);
      const firstType = typeData.parameterToTypeMap.get(type1Args[0]);
      expect(typeof firstType).toBe("object");
      if (firstType) {
        expect(Object.isFrozen(firstType)).toBe(true);
        expect(Reflect.ownKeys(firstType)).toEqual([
          "argumentName",
          "mapOrSetType",
          "argumentType",
          "description",
          "argumentValidator",
        ]);

        expect(firstType.argumentName).toBe(type1Args[0]);
        expect(firstType.mapOrSetType).toBe("WeakMap");
        expect(firstType.argumentType).toBe(options.argumentType);
        expect(firstType.description).toBe(options.description);
        expect(firstType.argumentValidator).toBe(null);
      }
    });

    it("defines a collection type when called with an argument filter", () => {
      options.argumentValidator = argumentValidator;
      config.addMapKey(...type1Args);

      const typeData = config.cloneData();
      expect(typeData.parameterToTypeMap.size).toBe(1);
      const firstType = typeData.parameterToTypeMap.get(type1Args[0]);
      expect(typeof firstType).toBe("object");
      if (firstType) {
        expect(Object.isFrozen(firstType)).toBe(true);
        expect(Reflect.ownKeys(firstType)).toEqual([
          "argumentName",
          "mapOrSetType",
          "argumentType",
          "description",
          "argumentValidator",
        ]);

        expect(firstType.argumentName).toBe(type1Args[0]);
        expect(firstType.mapOrSetType).toBe("WeakMap");
        expect(firstType.argumentType).toBe(options.argumentType);
        expect(firstType.description).toBe(options.description);
        expect(typeof firstType.argumentValidator).toBe("string");
      }
    });

    it("defaults to an argument type of 'object' when the argumentType is not specified and holdWeak is true", () => {
      delete options.argumentType;
      config.addMapKey(...type1Args);

      const typeData = config.cloneData();
      expect(typeData.parameterToTypeMap.size).toBe(1);
      const firstType = typeData.parameterToTypeMap.get(type1Args[0]);
      expect(typeof firstType).toBe("object");
      if (firstType) {
        expect(Object.isFrozen(firstType)).toBe(true);
        expect(Reflect.ownKeys(firstType)).toEqual([
          "argumentName",
          "mapOrSetType",
          "argumentType",
          "description",
          "argumentValidator",
        ]);

        expect(firstType.argumentName).toBe(type1Args[0]);
        expect(firstType.mapOrSetType).toBe("WeakMap");
        expect(firstType.argumentType).toBe("object");
        expect(firstType.description).toBe(options.description);
        expect(firstType.argumentValidator).toBe(null);
      }
    });

    it("defaults to an argument type of '*' when the argumentType is not specified and holdWeak is false", () => {
      delete options.argumentType;
      const args = type1Args.slice();
      args.splice(1, 1, false);
      config.addMapKey(...args);

      const typeData = config.cloneData();
      expect(typeData.parameterToTypeMap.size).toBe(1);
      const firstType = typeData.parameterToTypeMap.get(type1Args[0]);
      expect(typeof firstType).toBe("object");
      if (firstType) {
        expect(Object.isFrozen(firstType)).toBe(true);
        expect(Reflect.ownKeys(firstType)).toEqual([
          "argumentName",
          "mapOrSetType",
          "argumentType",
          "description",
          "argumentValidator",
        ]);

        expect(firstType.argumentName).toBe(type1Args[0]);
        expect(firstType.mapOrSetType).toBe("Map");
        expect(firstType.argumentType).toBe("*");
        expect(firstType.description).toBe(options.description);
        expect(firstType.argumentValidator).toBe(null);
      }
    });

    /* This is an extreme case.  Don't do this in production.

    (Who wants a 20-key set in JavaScript, anyway?)
    */
    it("can be called more than once", () => {
      const argMatrix = [];
      const argCount = 1;
      for (let i = 0; i < argCount; i++) {
        const args = type1Args.slice();
        args[0] += "_" + i;
        argMatrix.push(args);
        options.argumentValidator = eval(`${args[0]} => void(${args[0]})`);

        config.addMapKey(...args);
      }

      const typeData = config.cloneData();
      expect(typeData.parameterToTypeMap.size).toBe(argCount);

      Array.from(typeData.parameterToTypeMap.values()).forEach((t, index) => {
        expect(Object.isFrozen(t)).toBe(true);
        expect(Reflect.ownKeys(t)).toEqual([
          "argumentName",
          "mapOrSetType",
          "argumentType",
          "description",
          "argumentValidator",
        ]);
        const argRow = argMatrix[index];

        expect(t.argumentName).toBe(argRow[0]);
        expect(t.mapOrSetType).toBe("WeakMap");
        expect(t.argumentType).toBe(options.argumentType);
        expect(t.description).toBe(options.description);
        expect(typeof t.argumentValidator).toBe("string");
      });
    });

    describe("throws for", () => {
      let args;
      beforeEach(() => args = type1Args.slice());
      it("a symbol argument name", () => {
        args[0] = Symbol("foo");
        expect(
          () => config.addMapKey(...args)
        ).toThrowError(`argumentName must be a non-empty string!`);
      });

      it("an object for an argument name", () => {
        args[0] = {};
        expect(
          () => config.addMapKey(...args)
        ).toThrowError(`argumentName must be a non-empty string!`);
      });

      it("an empty string argument name", () => {
        expect(
          () => config.addMapKey("", true)
        ).toThrowError("argumentName must be a non-empty string!");
      });

      it(`an argument name of "value"`, () => {
        args[0] = "value";
        expect(
          () => config.addMapKey(...args)
        ).toThrowError(`The argument name "value" is reserved!`);
      });

      it("an argument name starting and ending with two underscores", () => {
        args[0] = "__value__";
        expect(
          () => config.addMapKey(...args)
        ).toThrowError("This module reserves variable names starting and ending with a double underscore for itself.");
      });

      it(`holdWeak being neither true nor false: `, () => {
        args[1] = Symbol("foo");
        expect(
          () => config.addMapKey(...args)
        ).toThrowError("holdWeak must be true or false!");
      });

      it("a non-string argument type", () => {
        options.argumentType = Symbol("foo");
        expect(
          () => config.addMapKey(...args)
        ).toThrowError(`argumentType must be a non-empty string or omitted!`);
      });

      it("a non-string description", () => {
        options.description = {};
        expect(
          () => config.addMapKey(...args)
        ).toThrowError(`description must be a non-empty string or omitted!`);
      });

      it("a non-function argument filter", () => {
        options.argumentValidator = Symbol("foo");
        expect(
          () => config.addMapKey(...args)
        ).toThrowError(`argumentValidator must be a function or omitted!`);
      });

      it("an argument filter that itself throws", () => {
        options.argumentValidator = (mother) => {
          void(mother);
          throw new Error("Hi, Mom");
        };
        expect(
          () => config.addMapKey(...args)
        ).toThrowError("Throw statements must not be in validator functions!");
      });

      it("a known argument name being passed in twice", () => {
        config.addMapKey(...args);
        expect(
          () => config.addMapKey(...args)
        ).toThrowError(`Argument name "${args[0]}" has already been defined!`);
      });

      it("a weak map argument we pass in for a collection that can't have one", () => {
        config = new CollectionConfiguration("FooMap", "Map");
        expect(
          () => config.addMapKey(...args)
        ).toThrowError("Strong maps cannot have weak map keys!");
      });

      it("a set collection", () => {
        config = new CollectionConfiguration("FooSet", "WeakSet");
        expect(
          () => config.addMapKey(...args)
        ).toThrowError("You must define map keys before calling .addSetElement(), .setValueType() or .lock()!");
      });

      describe("invalid identifiers:", () => {
        it("code injection with assignment", () => {
          expect(
            () => config.addMapKey("foo = 3", true)
          ).toThrowError(`"foo = 3" is not a valid JavaScript identifier!`);
        });

        it("code injection with function call", () => {
          expect(
            () => config.addMapKey("foo()", true)
          ).toThrowError(`"foo()" is not a valid JavaScript identifier!`);
        });

        it("single-line comment after the identifier", () => {
          expect(
            () => config.addMapKey("foo // no", true)
          ).toThrowError(`"foo // no" is not a valid JavaScript identifier!`);
        });

        it("comment before the identifier", () => {
          expect(
            () => config.addMapKey("/* no */ foo", true)
          ).toThrowError(`"/* no */ foo" is not a valid JavaScript identifier!`);
        });

        it("comment after the identifier", () => {
          expect(
            () => config.addMapKey("foo /* no */", true)
          ).toThrowError(`"foo /* no */" is not a valid JavaScript identifier!`);
        });

        it("a number", () => {
          expect(
            () => config.addMapKey("3", true)
          ).toThrowError(`"3" is not a valid JavaScript identifier!`);
        });

        it("a private field", () => {
          expect(
            () => config.addMapKey("#x", true)
          ).toThrowError(`"#x" is not a valid JavaScript identifier!`);
        });

        it("a keyword", () => {
          expect(
            () => config.addMapKey("let", true)
          ).toThrowError(`"let" is not a valid JavaScript identifier!`);
        });

        it("whitespace", () => {
          expect(
            () => config.addMapKey(" x ", true)
          ).toThrowError("argumentName must not have leading or trailing whitespace!");
        });
      });
    });
  });

  describe(".addSetKey()", () => {
    let config, options, type1Args;
    beforeEach(() => {
      config = new CollectionConfiguration("FooSet", "WeakSet");
      options = {
        argumentType: "Cat",
        description: "The other cat",
      }

      type1Args = [
        "mother",
        true,
        options
      ];
      Object.freeze(type1Args);
    });

    const argumentValidator = mother => void(mother);

    it("defines a collection type when called without an argument filter", () => {
      config.addSetKey(...type1Args);

      const typeData = config.cloneData();
      expect(typeData.parameterToTypeMap.size).toBe(1);
      const firstType = typeData.parameterToTypeMap.get(type1Args[0]);
      expect(typeof firstType).toBe("object");
      if (firstType) {
        expect(Object.isFrozen(firstType)).toBe(true);
        expect(Reflect.ownKeys(firstType)).toEqual([
          "argumentName",
          "mapOrSetType",
          "argumentType",
          "description",
          "argumentValidator",
        ]);

        expect(firstType.argumentName).toBe(type1Args[0]);
        expect(firstType.mapOrSetType).toBe("WeakSet");
        expect(firstType.argumentType).toBe(options.argumentType);
        expect(firstType.description).toBe(options.description);
        expect(firstType.argumentValidator).toBe(null);
      }
    });

    it("defines a collection type when called with an argument filter", () => {
      options.argumentValidator = argumentValidator;
      config.addSetKey(...type1Args);

      const typeData = config.cloneData();
      expect(typeData.parameterToTypeMap.size).toBe(1);
      const firstType = typeData.parameterToTypeMap.get(type1Args[0]);
      expect(typeof firstType).toBe("object");
      if (firstType) {
        expect(Object.isFrozen(firstType)).toBe(true);
        expect(Reflect.ownKeys(firstType)).toEqual([
          "argumentName",
          "mapOrSetType",
          "argumentType",
          "description",
          "argumentValidator",
        ]);

        expect(firstType.argumentName).toBe(type1Args[0]);
        expect(firstType.mapOrSetType).toBe("WeakSet");
        expect(firstType.argumentType).toBe(options.argumentType);
        expect(firstType.description).toBe(options.description);
        expect(typeof firstType.argumentValidator).toBe("string");
      }
    });

    it(`allows an argument name of "value"`, () => {
      expect(
        () => config.addSetKey("value", true, options)
      ).not.toThrow();
    });

    it("defaults to a argument type of 'object' when the argumentType is not specified and holdWeak is true", () => {
      delete options.argumentType;

      config.addSetKey(...type1Args);

      const typeData = config.cloneData();
      expect(typeData.parameterToTypeMap.size).toBe(1);
      const firstType = typeData.parameterToTypeMap.get(type1Args[0]);
      expect(typeof firstType).toBe("object");
      if (firstType) {
        expect(Object.isFrozen(firstType)).toBe(true);
        expect(Reflect.ownKeys(firstType)).toEqual([
          "argumentName",
          "mapOrSetType",
          "argumentType",
          "description",
          "argumentValidator",
        ]);

        expect(firstType.argumentName).toBe(type1Args[0]);
        expect(firstType.mapOrSetType).toBe("WeakSet");
        expect(firstType.argumentType).toBe("object");
        expect(firstType.description).toBe(options.description);
        expect(firstType.argumentValidator).toBe(null);
      }
    });

    it("defaults to a argument type of '*' when the argumentType is not specified and holdWeak is false", () => {
      delete options.argumentType;
      const args = type1Args.slice();
      args.splice(1, 1, false);

      config.addSetKey(...args);

      const typeData = config.cloneData();
      expect(typeData.parameterToTypeMap.size).toBe(1);
      const firstType = typeData.parameterToTypeMap.get(type1Args[0]);
      expect(typeof firstType).toBe("object");
      if (firstType) {
        expect(Object.isFrozen(firstType)).toBe(true);
        expect(Reflect.ownKeys(firstType)).toEqual([
          "argumentName",
          "mapOrSetType",
          "argumentType",
          "description",
          "argumentValidator",
        ]);

        expect(firstType.argumentName).toBe(type1Args[0]);
        expect(firstType.mapOrSetType).toBe("Set");
        expect(firstType.argumentType).toBe("*");
        expect(firstType.description).toBe(options.description);
        expect(firstType.argumentValidator).toBe(null);
      }
    });

    /* This is an extreme case.  Don't do this in production.

    (Who wants a 20-key set in JavaScript, anyway?)
    */
    it("can be called more than once", () => {
      const argMatrix = [];
      const argCount = 1;
      for (let i = 0; i < argCount; i++) {
        const args = type1Args.slice();
        args[0] += "_" + i;
        argMatrix.push(args);
        options.argumentValidator = eval(`${args[0]} => void(${args[0]})`);

        config.addSetKey(...args);
      }

      const typeData = config.cloneData();
      expect(typeData.parameterToTypeMap.size).toBe(argCount);

      Array.from(typeData.parameterToTypeMap.values()).forEach((t, index) => {
        expect(Object.isFrozen(t)).toBe(true);
        expect(Reflect.ownKeys(t)).toEqual([
          "argumentName",
          "mapOrSetType",
          "argumentType",
          "description",
          "argumentValidator",
        ]);
        const argRow = argMatrix[index];

        expect(t.argumentName).toBe(argRow[0]);
        expect(t.mapOrSetType).toBe("WeakSet");
        expect(t.argumentType).toBe(options.argumentType);
        expect(t.description).toBe(options.description);
        expect(typeof t.argumentValidator).toBe("string");
      });
    });

    describe("throws for", () => {
      let args;
      beforeEach(() => args = type1Args.slice());
      it("a symbol argument name", () => {
        args[0] = Symbol("foo");
        expect(
          () => config.addSetKey(...args)
        ).toThrowError(`argumentName must be a non-empty string!`);
      });

      it("an object for an argument name", () => {
        args[0] = {};
        expect(
          () => config.addSetKey(...args)
        ).toThrowError(`argumentName must be a non-empty string!`);
      });

      it("an empty string argument name", () => {
        expect(
          () => config.addSetKey("", true)
        ).toThrowError("argumentName must be a non-empty string!");
      });

      it("an argument name starting and ending with two underscores", () => {
        args[0] = "__value__";
        expect(
          () => config.addSetKey(...args)
        ).toThrowError("This module reserves variable names starting and ending with a double underscore for itself.");
      });

      it(`holdWeak being neither true nor false: `, () => {
        args[1] = Symbol("foo");
        expect(
          () => config.addSetKey(...args)
        ).toThrowError("holdWeak must be true or false!");
      });

      it("a non-string argument type", () => {
        options.argumentType = Symbol("foo");
        expect(
          () => config.addSetKey(...args)
        ).toThrowError(`argumentType must be a non-empty string or omitted!`);
      });

      it("a non-string description", () => {
        options.description = {};
        expect(
          () => config.addSetKey(...args)
        ).toThrowError(`description must be a non-empty string or omitted!`);
      });

      it("a non-function argument filter", () => {
        options.argumentValidator = Symbol("foo");
        expect(
          () => config.addSetKey(...args)
        ).toThrowError(`argumentValidator must be a function or omitted!`);
      });

      it("a known argument name being passed in twice", () => {
        config.addSetKey(...args);
        expect(
          () => config.addSetKey(...args)
        ).toThrowError(`Argument name "${args[0]}" has already been defined!`);
      });

      it("a weak set argument we pass in for a collection that can't have one", () => {
        config = new CollectionConfiguration("FooSet", "Set");
        expect(
          () => config.addSetKey(...args)
        ).toThrowError("Strong sets cannot have weak set keys!");
      });

      it("a map collection", () => {
        config = new CollectionConfiguration("FooMap", "WeakMap");
        expect(
          () => config.addSetKey(...args)
        ).toThrowError("You must define set keys before calling .setValueType() or .lock()!");
      });

      describe("invalid identifiers:", () => {
        it("code injection with assignment", () => {
          expect(
            () => config.addSetKey("foo = 3", true)
          ).toThrowError(`"foo = 3" is not a valid JavaScript identifier!`);
        });

        it("code injection with function call", () => {
          expect(
            () => config.addSetKey("foo()", true)
          ).toThrowError(`"foo()" is not a valid JavaScript identifier!`);
        });

        it("single-line comment after the identifier", () => {
          expect(
            () => config.addSetKey("foo // no", true)
          ).toThrowError(`"foo // no" is not a valid JavaScript identifier!`);
        });

        it("comment before the identifier", () => {
          expect(
            () => config.addSetKey("/* no */ foo", true)
          ).toThrowError(`"/* no */ foo" is not a valid JavaScript identifier!`);
        });

        it("comment after the identifier", () => {
          expect(
            () => config.addSetKey("foo /* no */", true)
          ).toThrowError(`"foo /* no */" is not a valid JavaScript identifier!`);
        });

        it("a number", () => {
          expect(
            () => config.addSetKey("3", true)
          ).toThrowError(`"3" is not a valid JavaScript identifier!`);
        });

        it("a private field", () => {
          expect(
            () => config.addSetKey("#x", true)
          ).toThrowError(`"#x" is not a valid JavaScript identifier!`);
        });

        it("a keyword", () => {
          expect(
            () => config.addSetKey("let", true)
          ).toThrowError(`"let" is not a valid JavaScript identifier!`);
        });

        it("whitespace", () => {
          expect(
            () => config.addSetKey(" x ", true)
          ).toThrowError("argumentName must not have leading or trailing whitespace!");
        });
      });
    });
  });

  describe(".setValueType()", () => {
    let config, wasCalled, valueFilter = (value) => { void(value); wasCalled = true; };
    beforeEach(() => {
      config = new CollectionConfiguration("FooMap", "WeakMap");
      wasCalled = false;
    });

    it("accepts a function for the value filter with a jsdoc argument", () => {
      config.addMapKey("mother", true);
      expect(() => config.setValueType("Car", "The car.", valueFilter)).not.toThrow();
      expect(wasCalled).toBe(false);

      const data = config.cloneData();
      expect(data.valueType).not.toBe(null);
      expect(data.valueType.mapOrSetType).toBe("");
      expect(data.valueType.argumentName).toBe("value");
      expect(data.valueType.argumentType).toBe("Car");
      expect(data.valueType.description).toBe("The car.");
      expect(data.valueType.argumentValidator).toBe("{ void(value); wasCalled = true; }");
    });

    describe("throws for", () => {
      it("invoking without having a map key first", () => {
        expect(
          () => config.setValueType("Car", "The car.", function() { return false })
        ).toThrowError("You can only call .setValueType() directly after calling .addMapKey()!");
      });

      it("setting a non-string jsdoc type", () => {
        config.addMapKey("mother", true);
        expect(
          () => config.setValueType(Symbol("Car"), "The car.", valueFilter, {})
        ).toThrowError(`type must be a non-empty string!`);
      });

      it("setting a non-string jsdoc description", () => {
        config.addMapKey("mother", true);
        expect(
          () => config.setValueType("Car", Symbol("The car."), valueFilter, {})
        ).toThrowError(`description must be a non-empty string!`);
      });

      it("setting a non-function validator", () => {
        config.addMapKey("mother", true);
        expect(
          () => config.setValueType("Car", "The car.", {})
        ).toThrowError(`validator must be a function or omitted!`);
      });

      it("calling after a successful .setValueType() application", () => {
        config.addMapKey("mother", true);
        config.setValueType("Car", "The car.", value => { void(value); return false; });
        expect(
          () => config.setValueType("Car", "The car.", value => { void(value); return false; } )
        ).toThrowError("You can only set the value type once!");
      });
    });
  });

  describe(".lock()", () => {
    let config, options, type1Args;
    afterEach(() => {
      config = null;
      options = null;
      type1Args = null;
    })

    describe("is the final state for a", () => {
      it("map", () => {
        config = new CollectionConfiguration("FooMap", "WeakMap");
        options = {
          argumentType: "Cat",
          description: "The other cat",
        }

        type1Args = [
          "mother",
          true,
          options
        ];

        config.addMapKey(...type1Args);
        expect(() => config.lock()).not.toThrow();
        expect(() => config.lock()).not.toThrow();
        expect(
          () => config.addMapKey("Dog", "The other dog")
        ).toThrowError("You have already locked this configuration!");
      });

      it("set", () => {
        config = new CollectionConfiguration("FooSet", "WeakSet");
        options = {
          argumentType: "Cat",
          description: "The other cat",
        }

        type1Args = [
          "mother",
          true,
          options
        ];

        config.addSetKey(...type1Args);
        expect(() => config.lock()).not.toThrow();
        expect(() => config.lock()).not.toThrow();
        expect(
          () => config.addSetKey("Dog", "The other dog")
        ).toThrowError("You have already locked this configuration!");
      });

      it("map of sets", () => {
        config = new CollectionConfiguration("FooMap", "WeakMap", "WeakSet");
        options = {
          argumentType: "Cat",
          description: "The other cat",
        }
  
        type1Args = [
          "mother",
          true,
          options
        ];
  
        config.addMapKey(...type1Args);
        config.addSetKey("dog", true);
        expect(() => config.lock()).not.toThrow();
        expect(() => config.lock()).not.toThrow();
        expect(
          () => config.addSetKey("Elephant", "You have an elephant?!?")
        ).toThrowError("You have already locked this configuration!");
      });
    });

    it("throws for a weak map key group missing any weak keys", () => {
      config = new CollectionConfiguration("FooMap", "WeakMap");
      options = {
        argumentType: "Cat",
        description: "The other cat",
      }

      type1Args = [
        "mother",
        false,
        options
      ];

      config.addMapKey(...type1Args);
      expect(() => config.lock()).toThrowError("A weak map keyset must have at least one weak key!");
    });

    it("throws for a weak set key group missing any weak keys", () => {
      config = new CollectionConfiguration("FooSet", "WeakSet");
      options = {
        argumentType: "Cat",
        description: "The other cat",
      }

      type1Args = [
        "mother",
        false,
        options
      ];

      config.addSetKey(...type1Args);
      expect(() => config.lock()).toThrowError("A weak set keyset must have at least one weak key!");
    });
  });

  it("disallows any further operations after throwing an exception", () => {
    const config = new CollectionConfiguration("FooMap", "WeakMap");
    expect(() => config.addMapKey("#x", true)).toThrow();

    expect(() => {
      config.cloneData()
    }).toThrowError("This configuration is dead due to a previous error!");
  });
});
