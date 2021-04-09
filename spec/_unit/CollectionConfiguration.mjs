import CollectionConfiguration from "../../source/CollectionConfiguration.mjs";

describe("CollectionConfiguration", () => {
  it("class is frozen", () => {
    expect(typeof CollectionConfiguration).toBe("function");
    expect(Object.isFrozen(CollectionConfiguration)).toBe(true);
    expect(Object.isFrozen(CollectionConfiguration.prototype)).toBe(true);

    expect(Reflect.ownKeys(CollectionConfiguration.prototype)).toEqual([
      "constructor",
      "setFileOverview",
      "cloneData",
      "addMapKey",
      "setValueFilter",
      "lock",
    ]);
  });

  describe("constructor", () => {
    it("accepts a custom map class name", () => {
      expect(() => {
        void(new CollectionConfiguration("FooMap"));
      }).not.toThrow();
    });

    xit("accepts a custom set class name", () => {
      expect(() => {
        void(new CollectionConfiguration("FooSet"));
      }).not.toThrow();
    });

    it("disallows setting undefined properties", () => {
      const config = new CollectionConfiguration("FooMap");
      expect(Object.isSealed(config)).toBe(true);
      expect(Reflect.ownKeys(config)).toEqual([]);
    });

    it("throws for a class name that doesn't end with 'Map' or 'Set'", () => {
      expect(() => {
        void(new CollectionConfiguration("Foo"))
      }).toThrowError(`The class name must end with "Map"!`);
    });

    it(`throws for the names "Map", "WeakMap", "Set", and "WeakSet"`, () => {
      expect(() => {
        void(new CollectionConfiguration("Map"))
      }).toThrowError(`You can't override the Map primordial!`);

      expect(() => {
        void(new CollectionConfiguration("WeakMap"))
      }).toThrowError(`You can't override the WeakMap primordial!`);

      expect(() => {
        void(new CollectionConfiguration("Set"))
      }).toThrowError(`You can't override the Set primordial!`);

      expect(() => {
        void(new CollectionConfiguration("WeakSet"))
      }).toThrowError(`You can't override the WeakSet primordial!`);
    });
  });

  it("instances are frozen objects with no own properties", () => {
    const config = new CollectionConfiguration("FooMap");
    expect(Object.isFrozen(config)).toBe(true);
  });

  describe(".setFileOverview()", () => {
    let config;
    const overview = `
    This is a FooSet.  There are none like it but this is mine!

    This is still a FooSet!
    `.trim();

    beforeEach(() => config = new CollectionConfiguration("FooMap"));
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
      config = new CollectionConfiguration("FooMap");
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

    const argumentValidator = mother => {};

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

      it("a known argument name being passed in twice", () => {
        config.addMapKey(...args);
        expect(
          () => config.addMapKey(...args)
        ).toThrowError(`Argument name "${args[0]}" has already been defined!`);
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

      xdescribe("invalid JSDoc fields:", () => {

      });
    });
  });

  describe(".setValueFilter()", () => {
    let config, wasCalled, valueFilter = value => { wasCalled = true; };
    beforeEach(() => {
      config = new CollectionConfiguration("FooMap");
      wasCalled = false;
    });

    describe("accepts a function for the value filter with", () => {
      it("no jsdoc argument", () => {
        config.addMapKey("mother", true);
        expect(() => config.setValueFilter(valueFilter)).not.toThrow();
        expect(wasCalled).toBe(false);

        const data = config.cloneData();
        expect(data.valueFilter).toBe("{ wasCalled = true; }");
      });

      it("a jsdoc argument", () => {
        config.addMapKey("mother", true);
        expect(() => config.setValueFilter(valueFilter, "foo")).not.toThrow();
        expect(wasCalled).toBe(false);

        const data = config.cloneData();
        expect(data.valueFilter).toBe("{ wasCalled = true; }");
      });
    });

    describe("throws for", () => {
      it("invoking without having a map key first", () => {
        expect(
          () => config.setValueFilter(function() { return false })
        ).toThrowError("You can only call .setValueFilter() directly after calling .addMapKey()!");
      });

      it("setting a non-function filter", () => {
        config.addMapKey("mother", true);
        expect(
          () => config.setValueFilter({})
        ).toThrowError(`valueFilter must be a function!`);
      });

      it("setting a non-string jsdoc argument", () => {
        config.addMapKey("mother", true);
        expect(
          () => config.setValueFilter(valueFilter, {})
        ).toThrowError(`valueJSDoc must be a non-empty string or omitted!`);
      });

      it("calling after a successful valueFilter application", () => {
        config.addMapKey("mother", true);
        config.setValueFilter(valueFilter);
        expect(
          () => config.setValueFilter(valueFilter)
        ).toThrowError("You can only set the value filter once!");
      });
    });
  });

  it("disallows any further operations after throwing an exception", () => {
    const config = new CollectionConfiguration("FooMap");
    expect(() => config.addMapKey("#x", true)).toThrow();

    expect(() => {
      config.cloneData()
    }).toThrowError("This configuration is dead due to a previous error!");
  });
});