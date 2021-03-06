import CollectionConfiguration from "#source/CollectionConfiguration.mjs";
import CollectionType from "#source/generatorTools/CollectionType.mjs";
import ConfigurationData from "#source/generatorTools/ConfigurationData.mjs";

describe("CollectionConfiguration", () => {
  it("class is frozen", () => {
    expect(typeof CollectionConfiguration).toBe("function");
    expect(Object.isFrozen(CollectionConfiguration)).toBe(true);
    expect(Object.isFrozen(CollectionConfiguration.prototype)).toBe(true);

    expect(Reflect.ownKeys(CollectionConfiguration.prototype)).toEqual([
      "constructor",
      "currentState",
      "setFileOverview",
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

    it(`throws for names starting with "Readonly"`, () => {
      expect(() => {
        void(new CollectionConfiguration("ReadonlyWeakWeakMap", "Map"))
      }).toThrowError(`You can't start a class name with "Readonly"!`);
    });

    it("throws for StrongMapOfWeakSets", () => {
      expect(() => {
        void(new CollectionConfiguration("FooMap", "Map", "WeakSet"))
      }).toThrowError("innerType must be a Set, or null!");
    });

    it("throws for WeakMapOfWeakSets", () => {
      expect(() => {
        void(new CollectionConfiguration("FooMap", "WeakMap", "WeakSet"))
      }).toThrowError("innerType must be a Set, or null!");
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

      expect(ConfigurationData.cloneData(config).fileOverview).toBe(overview);
    });

    it("throws for setting twice", () => {
      config.setFileOverview(overview);
      expect(() => {
        config.setFileOverview("foo");
      }).toThrowError("You may only define the file overview at the start of the configuration!");
    });

    it("throws for setting to a non-string value", () => {
      expect(() => {
        config.setFileOverview(Symbol("foo"));
      }).toThrowError(`fileOverview must be a non-empty string!`);
    });
  });

  describe(".importLines()", () => {
    let config;
    const lines = `import FooMap from "./FooMap.mjs";`.trim();

    beforeEach(() => config = new CollectionConfiguration("FooMap", "Map"));
    it("can be set once to a string", () => {
      expect(() => {
        config.importLines(lines);
      }).not.toThrow();

      expect(ConfigurationData.cloneData(config).importLines).toBe(lines);
    });

    it("throws for setting twice", () => {
      config.importLines(lines);
      expect(() => {
        config.importLines("foo");
      }).toThrowError("You may only define import lines at the start of the configuration or immediately after the file overview!");
    });

    it("throws for setting to a non-string value", () => {
      expect(() => {
        config.importLines(Symbol("foo"));
      }).toThrowError(`lines must be a non-empty string!`);
    });
  });

  describe(".addMapKey()", () => {
    let config, options, type1Args;
    beforeEach(() => {
      config = new CollectionConfiguration("FooMap", "WeakMap");
      options = {
        jsDocType: "Cat",
        tsType: "CatTS",
      };

      type1Args = [
        "mother",
        "The other cat",
        true,
        options
      ];
      Object.freeze(type1Args);
    });

    const argumentValidator = mother => void(mother);

    it("defines a collection type when called without an argument filter", () => {
      config.addMapKey(...type1Args);

      const typeData = ConfigurationData.cloneData(config);
      expect(typeData.parameterToTypeMap.size).toBe(1);
      const firstType = typeData.parameterToTypeMap.get(type1Args[0]);
      expect(typeof firstType).toBe("object");
      if (firstType) {
        expect(firstType).toEqual(new CollectionType(
          type1Args[0],
          "WeakMap",
          options.jsDocType,
          options.tsType,
          type1Args[1],
          null
        ));
      }
    });

    it("defines a collection type when called with an argument filter", () => {
      options.argumentValidator = argumentValidator;
      config.addMapKey(...type1Args);

      const typeData = ConfigurationData.cloneData(config);
      expect(typeData.parameterToTypeMap.size).toBe(1);
      const firstType = typeData.parameterToTypeMap.get(type1Args[0]);
      expect(typeof firstType).toBe("object");
      if (firstType) {
        expect(firstType).toEqual(new CollectionType(
          type1Args[0],
          "WeakMap",
          options.jsDocType,
          options.tsType,
          type1Args[1],
          "void(mother)"
        ));
      }
    });

    it("defaults to a JSDoc type of 'object' when the jsDocType is not specified and holdWeak is true", () => {
      delete options.jsDocType;
      config.addMapKey(...type1Args);

      const typeData = ConfigurationData.cloneData(config);
      expect(typeData.parameterToTypeMap.size).toBe(1);
      const firstType = typeData.parameterToTypeMap.get(type1Args[0]);
      expect(typeof firstType).toBe("object");
      if (firstType) {
        expect(firstType).toEqual(new CollectionType(
          type1Args[0],
          "WeakMap",
          "object",
          options.tsType,
          type1Args[1],
          null
        ));
      }
    });

    it("defaults to a JSDoc type of '*' when the jsDocType is not specified and holdWeak is false", () => {
      delete options.jsDocType;
      const args = type1Args.slice();
      args.splice(2, 1, false);
      config.addMapKey(...args);

      const typeData = ConfigurationData.cloneData(config);
      expect(typeData.parameterToTypeMap.size).toBe(1);
      const firstType = typeData.parameterToTypeMap.get(type1Args[0]);
      expect(typeof firstType).toBe("object");
      if (firstType) {
        expect(firstType).toEqual(new CollectionType(
          type1Args[0],
          "Map",
          "*",
          options.tsType,
          type1Args[1],
          null
        ));
      }
    });

    it("defaults to a TypeScript type of 'object' when the tsType is not specified and holdWeak is true", () => {
      delete options.tsType;
      config.addMapKey(...type1Args);

      const typeData = ConfigurationData.cloneData(config);
      expect(typeData.parameterToTypeMap.size).toBe(1);
      const firstType = typeData.parameterToTypeMap.get(type1Args[0]);
      expect(typeof firstType).toBe("object");
      if (firstType) {
        expect(firstType).toEqual(new CollectionType(
          type1Args[0],
          "WeakMap",
          "Cat",
          "object",
          type1Args[1],
          null
        ));
      }
    });

    it("defaults to a TypeScript type of 'unknown' when the tsType is not specified and holdWeak is false", () => {
      delete options.tsType;
      const args = type1Args.slice();
      args.splice(2, 1, false);
      config.addMapKey(...args);

      const typeData = ConfigurationData.cloneData(config);
      expect(typeData.parameterToTypeMap.size).toBe(1);
      const firstType = typeData.parameterToTypeMap.get(type1Args[0]);
      expect(typeof firstType).toBe("object");
      if (firstType) {
        expect(firstType).toEqual(new CollectionType(
          type1Args[0],
          "Map",
          "Cat",
          "unknown",
          type1Args[1],
          null
        ));
      }
    });

    /* This is an extreme case.  Don't do this in production.

    (Who wants a 20-key set in JavaScript, anyway?)
    */
    it("can be called more than once", () => {
      const argMatrix = [];
      const argCount = 20;
      const refTypes = [];

      for (let i = 0; i < argCount; i++) {
        const args = type1Args.slice();
        args[0] += "_" + i;
        argMatrix.push(args);
        options.argumentValidator = eval(`${args[0]} => void(${args[0]})`);

        refTypes.push(new CollectionType(
          args[0],
          "WeakMap",
          options.jsDocType,
          options.tsType,
          args[1],
          `void(mother_${i})`
        ));

        config.addMapKey(...args);
      }

      const typeData = ConfigurationData.cloneData(config);
      expect(typeData.parameterToTypeMap.size).toBe(argCount);

      Array.from(typeData.parameterToTypeMap.values()).forEach((t, index) => {
        expect(t).toEqual(refTypes[index]);
        expect(Object.isFrozen(t)).toBe(true);
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
        args[2] = Symbol("foo");
        expect(
          () => config.addMapKey(...args)
        ).toThrowError("holdWeak must be true or false!");
      });

      it("a non-string jsdoc type", () => {
        options.jsDocType = Symbol("foo");
        expect(
          () => config.addMapKey(...args)
        ).toThrowError(`jsDocType must be a non-empty string!`);
      });

      it("a non-string tsType", () => {
        options.tsType = Symbol("foo");
        expect(
          () => config.addMapKey(...args)
        ).toThrowError(`tsType must be a non-empty string!`);
      });

      it("a tsType starting and ending with two underscores", () => {
        options.tsType = "__foo__";
        expect(
          () => config.addMapKey(...args)
        ).toThrowError(`This module reserves variable names starting and ending with a double underscore for itself.`);
      });


      it("a non-string description", () => {
        args[1] = {};
        expect(
          () => config.addMapKey(...args)
        ).toThrowError(`description must be a non-empty string!`);
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
        jsDocType: "Cat",
        tsType: "CatTS",
      };

      type1Args = [
        "mother",
        "The other cat",
        true,
        options
      ];
      Object.freeze(type1Args);
    });

    const argumentValidator = mother => void(mother);

    it("defines a collection type when called without an argument filter", () => {
      config.addSetKey(...type1Args);

      const typeData = ConfigurationData.cloneData(config);
      expect(typeData.parameterToTypeMap.size).toBe(1);
      const firstType = typeData.parameterToTypeMap.get(type1Args[0]);
      expect(typeof firstType).toBe("object");
      if (firstType) {
        expect(firstType).toEqual(new CollectionType(
          type1Args[0],
          "WeakSet",
          options.jsDocType,
          options.tsType,
          type1Args[1],
          null
        ));
      }
    });

    it("defines a collection type when called with an argument filter", () => {
      options.argumentValidator = argumentValidator;
      config.addSetKey(...type1Args);

      const typeData = ConfigurationData.cloneData(config);
      expect(typeData.parameterToTypeMap.size).toBe(1);
      const firstType = typeData.parameterToTypeMap.get(type1Args[0]);
      expect(typeof firstType).toBe("object");
      if (firstType) {
        expect(firstType).toEqual(new CollectionType(
          type1Args[0],
          "WeakSet",
          options.jsDocType,
          options.tsType,
          type1Args[1],
          "void(mother)"
        ));
      }
    });

    it(`allows an argument name of "value"`, () => {
      expect(
        () => config.addSetKey("value", "The value", true, options)
      ).not.toThrow();
    });

    it("defaults to a argument type of 'object' when the jsDocType is not specified and holdWeak is true", () => {
      delete options.jsDocType;

      config.addSetKey(...type1Args);

      const typeData = ConfigurationData.cloneData(config);
      expect(typeData.parameterToTypeMap.size).toBe(1);
      const firstType = typeData.parameterToTypeMap.get(type1Args[0]);
      expect(typeof firstType).toBe("object");
      if (firstType) {
        expect(firstType).toEqual(new CollectionType(
          type1Args[0],
          "WeakSet",
          "object",
          options.tsType,
          type1Args[1],
          null
        ));
      }
    });

    it("defaults to a argument type of '*' when the jsDocType is not specified and holdWeak is false", () => {
      delete options.jsDocType;
      const args = type1Args.slice();
      args.splice(2, 1, false);

      config.addSetKey(...args);

      const typeData = ConfigurationData.cloneData(config);
      expect(typeData.parameterToTypeMap.size).toBe(1);
      const firstType = typeData.parameterToTypeMap.get(type1Args[0]);
      expect(typeof firstType).toBe("object");
      if (firstType) {
        expect(firstType).toEqual(new CollectionType(
          type1Args[0],
          "Set",
          "*",
          options.tsType,
          type1Args[1],
          null
        ));      }
    });

    /* This is an extreme case.  Don't do this in production.

    (Who wants a 20-key set in JavaScript, anyway?)
    */
    it("can be called more than once", () => {
      const argMatrix = [];
      const argCount = 20;

      const refTypes = [];

      for (let i = 0; i < argCount; i++) {
        const args = type1Args.slice();
        args[0] += "_" + i;
        argMatrix.push(args);
        options.argumentValidator = eval(`${args[0]} => void(${args[0]})`);

        config.addSetKey(...args);

        refTypes.push(new CollectionType(
          args[0],
          "WeakSet",
          options.jsDocType,
          options.tsType,
          args[1],
          `void(mother_${i})`
        ));
      }

      const typeData = ConfigurationData.cloneData(config);
      expect(typeData.parameterToTypeMap.size).toBe(argCount);

      Array.from(typeData.parameterToTypeMap.values()).forEach((t, index) => {
        expect(t).toEqual(refTypes[index]);
        expect(Object.isFrozen(t)).toBe(true);
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
        args[2] = Symbol("foo");
        expect(
          () => config.addSetKey(...args)
        ).toThrowError("holdWeak must be true or false!");
      });

      it("a non-string argument type", () => {
        options.jsDocType = Symbol("foo");
        expect(
          () => config.addSetKey(...args)
        ).toThrowError(`jsDocType must be a non-empty string!`);
      });

      it("a non-string description", () => {
        args[1] = {};
        expect(
          () => config.addSetKey(...args)
        ).toThrowError(`description must be a non-empty string!`);
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
      config.addMapKey("mother", "The mother.", true);
      expect(() => config.setValueType("The car.", {
        jsDocType: "Car",
        tsType: "CarTS",
        argumentValidator: valueFilter
      })).not.toThrow();
      expect(wasCalled).toBe(false);

      const data = ConfigurationData.cloneData(config);
      expect(data.valueType).toEqual(new CollectionType(
        "value",
        "Map",
        "Car",
        "CarTS",
        "The car.",
        "{ void(value); wasCalled = true; }"
      ));
    });

    describe("throws for", () => {
      it("invoking without having a map key first", () => {
        expect(
          () => config.setValueType("The car.", {
            jsDocType: "Car",
            argumentValidator: function() { return false }
          })
        ).toThrowError("You can only call .setValueType() directly after calling .addMapKey()!");
      });

      it("setting a non-string jsdoc type", () => {
        config.addMapKey("mother", "The mother.", true);
        expect(
          () => config.setValueType("The car.", {
            jsDocType: Symbol("Car"),
            argumentValidator: valueFilter
          })
        ).toThrowError(`type must be a non-empty string!`);
      });

      it("setting a non-string jsdoc description", () => {
        config.addMapKey("mother", "The mother.", true);
        expect(
          () => config.setValueType(Symbol("The car."), {
            jsDocType: "Car",
            argumentValidator: valueFilter
          })
        ).toThrowError(`description must be a non-empty string!`);
      });

      it("setting a non-function validator", () => {
        config.addMapKey("mother", "The mother.", true);
        expect(
          () => config.setValueType("The car.", {
            jsDocType: "Car",
            argumentValidator: {}
          })
        ).toThrowError(`validator must be a function or omitted!`);
      });

      it("calling after a successful .setValueType() application", () => {
        config.addMapKey("mother", "The mother.", true);

        config.setValueType("The car.", {
          jsDocType: "Car",
          argumentValidator: value => { void(value); return false; }
        });

        expect(
          () => config.setValueType("The car.", {
            jsDocType: "Car",
            argumentValidator: value => { void(value); return false; }
          })
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
          jsDocType: "Cat",
          description: "The other cat",
        }

        type1Args = [
          "mother",
          "The mother.",
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
          jsDocType: "Cat",
          description: "The other cat",
        }

        type1Args = [
          "mother",
          "The mother.",
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
        config = new CollectionConfiguration("FooMap", "WeakMap", "Set");
        options = {
          jsDocType: "Cat",
          description: "The other cat",
        }
  
        type1Args = [
          "mother",
          "The mother.",
          true,
          options
        ];
  
        config.addMapKey(...type1Args);
        config.addSetKey("dog", "The dog.", false);
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
        jsDocType: "Cat",
        description: "The other cat",
      }

      type1Args = [
        "mother",
        "The mother.",
        false,
        options
      ];

      config.addMapKey(...type1Args);
      expect(() => config.lock()).toThrowError("A weak map keyset must have at least one weak key!");
    });

    it("throws for a weak set key group missing any weak keys", () => {
      config = new CollectionConfiguration("FooSet", "WeakSet");
      options = {
        jsDocType: "Cat",
        description: "The other cat",
      }

      type1Args = [
        "mother",
        "The mother.",
        false,
        options
      ];

      config.addSetKey(...type1Args);
      expect(() => config.lock()).toThrowError("A weak set keyset must have at least one weak key!");
    });
  });
});
