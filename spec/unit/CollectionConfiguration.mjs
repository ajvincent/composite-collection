import CollectionConfiguration from "../../source/CollectionConfiguration.mjs";

describe("CollectionConfiguration", () => {
  it("class is frozen", () => {
    expect(typeof CollectionConfiguration).toBe("function");
    expect(Object.isFrozen(CollectionConfiguration)).toBe(true);
    expect(Object.isFrozen(CollectionConfiguration.prototype)).toBe(true);

    expect(Reflect.ownKeys(CollectionConfiguration.prototype)).toEqual([
      "constructor",
      "className",
      "fileOverview",
      "getCollectionTypes",
      "getArgumentNames",
      "getImportedTypes",
      "addCollectionType",
      "getValueFilter",
      "setValueFilter",
    ]);
  });

  describe("constructor", () => {
    it("accepts a custom map class name", () => {
      expect(() => {
        void(new CollectionConfiguration("FooMap"));
      }).not.toThrow();
    });

    it("accepts a custom set class name", () => {
      expect(() => {
        void(new CollectionConfiguration("FooSet"));
      }).not.toThrow();
    });

    it("disallows setting undefined properties", () => {
      const config = new CollectionConfiguration("FooSet");
      expect(Object.isSealed(config)).toBe(true);
      expect(Reflect.ownKeys(config)).toEqual([]);
    });

    it("throws for a class name that doesn't end with 'Map' or 'Set'", () => {
      expect(() => {
        void(new CollectionConfiguration("Foo"))
      }).toThrowError(`The class name must end with "Map" or "Set"!`);
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

  it(".className is read-only", () => {
    const config = new CollectionConfiguration("FooSet");
    expect(config.className).toBe("FooSet");
    expect(() => {
      config.className = "FooMap";
    }).toThrow();
  });

  describe(".fileOverview", () => {
    let config;
    const overview = `
    This is a FooSet.  There are none like it but this is mine!

    This is still a FooSet!
    `.trim();

    beforeEach(() => config = new CollectionConfiguration("FooSet"));
    it("initially is null", () => {
      expect(config.fileOverview).toBe(null);
    });

    it("can be set once to a string", () => {
      expect(() => {
        config.fileOverview = overview;
      }).not.toThrow();

      expect(config.fileOverview).toBe(overview);
    });

    it("throws for setting twice", () => {
      config.fileOverview = overview;
      expect(() => {
        config.fileOverview = "foo";
      }).toThrowError("fileOverview has already been set!");
    });

    it("throws for setting to a non-string value", () => {
      expect(() => {
        config.fileOverview = Symbol("foo");
      }).toThrowError(`fileOverview must be a non-empty string!`);
    });
  });

  it(".getCollectionTypes() returns an unique array every time", () => {
    const config = new CollectionConfiguration("FooSet")

    const types1 = config.getCollectionTypes();
    expect(Array.isArray(types1)).toBe(true);
    expect(types1.length).toBe(0);

    const types2 = config.getCollectionTypes();
    expect(Array.isArray(types2)).toBe(true);
    expect(types2.length).toBe(0);
    expect(types2).not.toBe(types1);
  });

  it(".getArgumentNames() returns an unique Set() every time", () => {
    const config = new CollectionConfiguration("FooSet");

    const types1 = config.getArgumentNames();
    expect(types1 instanceof Set).toBe(true);
    expect(types1.size).toBe(0);

    const types2 = config.getArgumentNames();
    expect(types2 instanceof Set).toBe(true);
    expect(types2.size).toBe(0);
    expect(types2).not.toBe(types1);
  });

  it(".getImportedTypes() returns an unique Set() every time", () => {
    const config = new CollectionConfiguration("FooSet");

    const types1 = config.getImportedTypes();
    expect(types1 instanceof Set).toBe(true);
    expect(types1.size).toBe(0);

    const types2 = config.getImportedTypes();
    expect(types2 instanceof Set).toBe(true);
    expect(types2.size).toBe(0);
    expect(types2).not.toBe(types1);
  });

  describe(".addCollectionType()", () => {
    let config;
    beforeEach(() => config = new CollectionConfiguration("FooSet"));

    const type1Args = [
      "mother",
      "WeakMap",
      "Cat",
      "The mother cat"
    ];
    Object.freeze(type1Args);

    const argumentFilter = jasmine.createSpy("argumentFilter");

    it("defines a collection type when called without an argument filter", () => {
      config.addCollectionType(...type1Args);

      const types = config.getCollectionTypes();
      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBe(1);
      if (types.length > 0) {
        const firstType = types[0];
        expect(Object.isFrozen(firstType)).toBe(true);
        expect(Reflect.ownKeys(firstType)).toEqual([
          "argumentName",
          "mapOrSetType",
          "argumentType",
          "description",
          "argumentFilter",
        ]);
        expect([
          firstType.argumentName,
          firstType.mapOrSetType,
          firstType.argumentType,
          firstType.description,
          firstType.argumentFilter,
        ]).toEqual(type1Args.concat(null));
      }

      expect(Array.from(config.getArgumentNames())).toEqual([type1Args[0]]);
      expect(Array.from(config.getImportedTypes())).toEqual([]);
    });

    it("defines a collection type when called with an argument filter", () => {
      const args = type1Args.concat(argumentFilter);
      config.addCollectionType(...args);

      const types = config.getCollectionTypes();
      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBe(1);
      if (types.length > 0) {
        const firstType = types[0];
        expect(Object.isFrozen(firstType)).toBe(true);
        expect(Reflect.ownKeys(firstType)).toEqual([
          "argumentName",
          "mapOrSetType",
          "argumentType",
          "description",
          "argumentFilter",
        ]);
        expect([
          firstType.argumentName,
          firstType.mapOrSetType,
          firstType.argumentType,
          firstType.description,
          firstType.argumentFilter,
        ]).toEqual(args);

        expect(Array.from(config.getArgumentNames())).toEqual([type1Args[0]]);
        expect(Array.from(config.getImportedTypes())).toEqual([]);

        expect(argumentFilter).toHaveBeenCalledTimes(0);
      }
    });

    /* This is an extreme case.  Don't do this in production.

    (Who wants a 20-key set in JavaScript, anyway?)
    */
    it("can be called more than once", () => {
      const argMatrix = [];
      const argCount = 20;
      for (let i = 0; i < argCount; i++) {
        const args = type1Args.concat(argumentFilter);
        args[0] += "_" + i;
        argMatrix.push(args);

        config.addCollectionType(...args);
      }

      const types = config.getCollectionTypes();
      expect(types.length).toBe(argCount);

      types.forEach((t, index) => {
        expect(Object.isFrozen(t)).toBe(true);
        expect(Reflect.ownKeys(t)).toEqual([
          "argumentName",
          "mapOrSetType",
          "argumentType",
          "description",
          "argumentFilter",
        ]);

        expect([
          t.argumentName,
          t.mapOrSetType,
          t.argumentType,
          t.description,
          t.argumentFilter,
        ]).toEqual(argMatrix[index]);
      });

      expect(Array.from(config.getArgumentNames())).toEqual(argMatrix.map(row => row[0]));
      expect(Array.from(config.getImportedTypes())).toEqual([]);

      expect(argumentFilter).toHaveBeenCalledTimes(0);
    });

    it("adds an imported type for an unknown map or set type", () => {
      const args = type1Args.slice();
      args[1] = "BarMap";

      config.addCollectionType(...args);

      const types = config.getCollectionTypes();
      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBe(1);
      if (types.length > 0) {
        const firstType = types[0];
        expect(Object.isFrozen(firstType)).toBe(true);
        expect(Reflect.ownKeys(firstType)).toEqual([
          "argumentName",
          "mapOrSetType",
          "argumentType",
          "description",
          "argumentFilter",
        ]);
        expect([
          firstType.argumentName,
          firstType.mapOrSetType,
          firstType.argumentType,
          firstType.description,
          firstType.argumentFilter,
        ]).toEqual(args.concat(null));
      }

      expect(Array.from(config.getArgumentNames())).toEqual([type1Args[0]]);
      expect(Array.from(config.getImportedTypes())).toEqual([args[1]]);

      expect(argumentFilter).toHaveBeenCalledTimes(0);
    });

    describe("throws for", () => {
      let args;
      beforeEach(() => args = type1Args.slice());
      it("a non-string argument name", () => {
        args[0] = Symbol("foo");
        expect(
          () => config.addCollectionType(...args)
        ).toThrowError(`argumentName must be a non-empty string!`);

        args[0] = {};
        expect(
          () => config.addCollectionType(...args)
        ).toThrowError(`argumentName must be a non-empty string!`);
      });

      it(`an argument name of "value"`, () => {
        args[0] = "value";
        expect(
          () => config.addCollectionType(...args)
        ).toThrowError(`The argument name "value" is reserved!`);
      });

      it("a non-string map or set type", () => {
        args[1] = Symbol("foo");
        expect(
          () => config.addCollectionType(...args)
        ).toThrowError(`mapOrSetType must be a non-empty string!`);

        args[1] = {};
        expect(
          () => config.addCollectionType(...args)
        ).toThrowError(`mapOrSetType must be a non-empty string!`);
      });

      it("a non-string argument type", () => {
        args[2] = Symbol("foo");
        expect(
          () => config.addCollectionType(...args)
        ).toThrowError(`argumentType must be a non-empty string!`);

        args[2] = {};
        expect(
          () => config.addCollectionType(...args)
        ).toThrowError(`argumentType must be a non-empty string!`);
      });

      it("a non-string description", () => {
        args[3] = Symbol("foo");
        expect(
          () => config.addCollectionType(...args)
        ).toThrowError(`description must be a non-empty string!`);

        args[3] = {};
        expect(
          () => config.addCollectionType(...args)
        ).toThrowError(`description must be a non-empty string!`);
      });

      it("a non-function argument filter", () => {
        args[4] = Symbol("foo");
        expect(
          () => config.addCollectionType(...args)
        ).toThrowError(`argumentFilter must be a function or omitted!`);

        args[4] = {};
        expect(
          () => config.addCollectionType(...args)
        ).toThrowError(`argumentFilter must be a function or omitted!`);
      });

      it("a known argument name being passed in twice", () => {
        config.addCollectionType(...args);
        expect(
          () => config.addCollectionType(...args)
        ).toThrowError(`Argument name "${args[0]}" has already been defined!`);
      });

      it(`a map or set type that doesn't end in "Map" or "Set"`, () => {
        args[1] = "Foo";
        expect(
          () => config.addCollectionType(...args)
        ).toThrowError(`The map or set type must end with "Map" or "Set"!`);
      });

      xdescribe("invalid identifiers:", () => {

      });

      xdescribe("invalid JSDoc fields:", () => {

      });
    });
  });

  it(".getValueFilter() returns [null, null] by default", () => {
    const config = new CollectionConfiguration("FooSet");
    expect(config.getValueFilter()).toEqual([null, null]);
  });

  describe(".setValueFilter()", () => {
    let config, valueFilter = jasmine.createSpy("valueFilter");
    beforeEach(() => {
      config = new CollectionConfiguration("FooSet");
      valueFilter.calls.reset();
      valueFilter.and.stub();
    });

    describe("accepts a function for the value filter with", () => {
      it("no jsdoc argument", () => {
        expect(() => config.setValueFilter(valueFilter)).not.toThrow();
        expect(config.getValueFilter()).toEqual([valueFilter, null]);
        expect(valueFilter).toHaveBeenCalledTimes(0);
      });
  
      it("a jsdoc argument", () => {
        expect(() => config.setValueFilter(valueFilter, "foo")).not.toThrow();
        expect(config.getValueFilter()).toEqual([valueFilter, "foo"]);
        expect(valueFilter).toHaveBeenCalledTimes(0);
      });
    });

    describe("throws for", () => {
      it("setting a non-function filter", () => {
        expect(
          () => config.setValueFilter({})
        ).toThrowError(`valueFilter must be a function!`);
      });

      it("setting a non-string jsdoc argument", () => {
        expect(
          () => config.setValueFilter(valueFilter, {})
        ).toThrowError(`valueJSDoc must be a non-empty string or omitted!`);
      });

      it("calling after a successful valueFilter application", () => {
        config.setValueFilter(valueFilter);
        expect(
          () => config.setValueFilter(valueFilter)
        ).toThrowError("You can only set the value filter once!");
      });
    });
  });
});
