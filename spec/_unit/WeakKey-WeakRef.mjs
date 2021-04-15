import WeakKeyComposer from "composite-collection/WeakKey-WeakRef";

describe("WeakKey-WeakRef composer", () => {
  it("class is frozen", () => {
    expect(Object.isFrozen(WeakKeyComposer)).toBe(true);
    expect(Object.isFrozen(WeakKeyComposer.prototype)).toBe(true);
  });

  xit("class exposes only the getKey(), hasKey() and deleteKey() methods", () => {
    expect(Reflect.ownKeys(WeakKeyComposer)).toEqual([
      "constructor",
      "getKey",
      "deleteKey"
    ]);
  });

  it("instances are frozen", () => {
    const composer = new WeakKeyComposer(["foo"]);
    expect(Object.isFrozen(composer)).toBe(true);
  });

  xit("instances have no public properties", () => {
    // I disabled this test because Mozilla Firefox and Safari don't support private properties.
    const composer = new WeakKeyComposer(["foo"]);
    expect(Reflect.ownKeys(composer)).toEqual([]);
  });

  describe("constructor throws for", () => {
    it("weakArgList not being a non-empty array of unique non-empty strings", () => {
      expect(
        () => new WeakKeyComposer("foo")
      ).toThrowError("weakArgList must be a string array of at least one argument!");

      expect(
        () => new WeakKeyComposer([])
      ).toThrowError("weakArgList must be a string array of at least one argument!");

      expect(
        () => new WeakKeyComposer([Symbol("foo")])
      ).toThrowError("weakArgList and strongArgList can only contain non-empty strings!");

      expect(
        () => new WeakKeyComposer(["foo", ""])
      ).toThrowError("weakArgList and strongArgList can only contain non-empty strings!");

      expect(
        () => new WeakKeyComposer(["foo", "foo"])
      ).toThrowError("There is a duplicate argument among weakArgList and strongArgList!");
    });

    it("strongArgList not being an array of unique non-empty strings", () => {
      expect(
        () => new WeakKeyComposer(["x"], "foo")
      ).toThrowError("strongArgList must be a string array!");

      expect(
        () => new WeakKeyComposer(["x"], [Symbol("foo")])
      ).toThrowError("weakArgList and strongArgList can only contain non-empty strings!");

      expect(
        () => new WeakKeyComposer(["x"], ["foo", ""])
      ).toThrowError("weakArgList and strongArgList can only contain non-empty strings!");

      expect(
        () => new WeakKeyComposer(["x"], ["foo", "foo"])
      ).toThrowError("There is a duplicate argument among weakArgList and strongArgList!");
    });

    it("weakArgList and strongArgList sharing arguments", () => {
      expect(
        () => new WeakKeyComposer(["foo"], ["foo"])
      ).toThrowError("There is a duplicate argument among weakArgList and strongArgList!");
    });
  });

  describe("with one weak argument:", () => {
    testWeakKeys(
      [ [ {name: "key1"} ], [] ],
      [ [ {name: "key2"} ], [] ],
      [ [ {name: "key3"} ], [] ],
      () => new WeakKeyComposer(["firstKey"])
    );
  });

  describe("with two weak arguments:", () => {
    testWeakKeys(
      [ [ {name: "key1"} , {name: "key4"}], [] ],
      [ [ {name: "key2"} , {name: "key4"}], [] ],
      [ [ {name: "key3"} , {name: "key5"}], [] ],
      () => new WeakKeyComposer(["firstKey", "secondKey"])
    );
  });

  describe("with one weak argument and one strong argument:", () => {
    testWeakKeys(
      [ [ {name: "key1"} ], [ {name: "key3"} ] ],
      [ [ {name: "key1"} ], [ {name: "key4"} ] ],
      [ [ {name: "key2"} ], [ {name: "key3"} ] ],
      () => new WeakKeyComposer(["firstKey"], ["secondKey"])
    );
  });

  describe("with one weak and two strong arguments:", () => {
    testWeakKeys(
      [ [ {name: "key1"} ], [ {name: "key2"}, {name: "key4"} ] ],
      [ [ {name: "key1"} ], [ {name: "key2"}, {name: "key5"} ] ],
      [ [ {name: "key1"} ], [ {name: "key3"}, {name: "key5"} ] ],
      () => new WeakKeyComposer(["firstKey"], ["secondKey", "thirdKey"])
    );
  });

  function testWeakKeys(keySet1, keySet2, keySet3, builder) {
    let composer;
    beforeEach(() => composer = builder());
    afterEach(() => composer = null);

    it(".getKey() builds an unique object key for a given key set", () => {
      const composite1 = composer.getKey(...keySet1);
      expect(composite1).toEqual({});
      expect(Object.isFrozen(composite1)).toBe(true);

      expect(composer.getKey(...keySet1)).toBe(composite1);

      const composite2 = composer.getKey(...keySet2);
      expect(composite2).toEqual({});
      expect(Object.isFrozen(composite2)).toBe(true);
      expect(composite2).not.toBe(composite1);

      expect(composer.getKey(...keySet1)).toBe(composite1);
      expect(composer.getKey(...keySet2)).toBe(composite2);

      const composite3 = composer.getKey(...keySet3);
      expect(composite3).toEqual({});
      expect(Object.isFrozen(composite3)).toBe(true);
      expect(composite3).not.toBe(composite1);
      expect(composite3).not.toBe(composite2);

      expect(composer.getKey(...keySet1)).toBe(composite1);
      expect(composer.getKey(...keySet2)).toBe(composite2);
      expect(composer.getKey(...keySet3)).toBe(composite3);

      /* No need to test for getKey returning a component key in any form.
      Each of the keys we passed in had properties, and the composite keys do not.
      */
    });

    it(".getKey() returns null for an incorrect number of weak arguments", () => {
      expect(composer.getKey([], [])).toBe(null);
      expect(composer.getKey([{}, {}, {}])).toBe(null);
      expect(composer.getKey([], [{}, {}, {}])).toBe(null);
    });

    it(".getKey() throws for a non-weak key passed", () => {
      const key = keySet1.slice();
      key[0] = key[0].slice();
      key[0][0] = Symbol("foo");

      expect(() => composer.getKey(...key)).toThrow();
    });

    it(".deleteKey() can delete the key when specifically directed to", () => {
      const composite1 = composer.getKey(...keySet1);
      expect(composer.deleteKey(...keySet1)).toBe(true);

      const composite2 = composer.getKey(...keySet1);
      expect(composite2).toEqual({});
      expect(Object.isFrozen(composite2)).toBe(true);
      expect(composite2).not.toBe(composite1);
    });

    it(".deleteKey() returns false for an unknown key", () => {
      expect(composer.deleteKey(...keySet1)).toBe(false);

      expect(composer.deleteKey([], [])).toBe(false);
      expect(composer.deleteKey([{}, {}, {}])).toBe(false);
      expect(composer.deleteKey([], [{}, {}, {}])).toBe(false);

      const composite1 = composer.getKey(...keySet1);
      composer.deleteKey(...keySet1);
      expect(composer.deleteKey(...keySet1)).toBe(false);
    });

    it(".deleteKey() does not throw for a non-weak key passed", () => {
      const key = keySet1.slice();
      key[0] = key[0].slice();
      key[0][0] = Symbol("foo");

      expect(() => composer.deleteKey(...key)).not.toThrow();
    });

    describe(".hasKey() returns", () => {
      it("false for an unknown key", () => {
        expect(composer.hasKey(...keySet1)).toBe(false);
      });

      it("false for an incorrect number of weak arguments", () => {
        expect(composer.hasKey([], [])).toBe(false);
        expect(composer.hasKey([{}, {}, {}])).toBe(false);
        expect(composer.hasKey([], [{}, {}, {}])).toBe(false);
      });

      it("false for an incorrect nmber of strong arguments", () => {
        expect(composer.hasKey(keySet1[0], [{}, {}, {}])).toBe(false);
        expect(composer.hasKey(keySet1[0], ["a", "b", "c"])).toBe(false);
      });

      it("true for a known key", () => {
        composer.getKey(...keySet1);
        expect(composer.hasKey(...keySet1)).toBe(true);
      });

      it("false for a deleted key", () => {
        composer.getKey(...keySet1);
        composer.deleteKey(...keySet1);
        expect(composer.hasKey(...keySet1)).toBe(false);
      });

      it("true for a re-added key", () => {
        composer.getKey(...keySet1);
        composer.deleteKey(...keySet1);
        composer.getKey(...keySet1);
        expect(composer.hasKey(...keySet1)).toBe(true);
      });
    });
  }

  describe("holds references to objects", () => {
    let composer = null;
    const finalizer = new FinalizationRegistry(resolver => resolver());
    const weakExternalKey = {};
    beforeEach(() => {
      composer = new WeakKeyComposer(["weakKey1", "weakKey2"], ["strongKey"]);
    });

    // Because of the nature of weak references and weak maps, I have to test this in more than one weak key dimension.
    it("weakly when defined as the first weak argument", async () => {
      const promiseArray = [];
      const methods = ["getKey", "hasKey", "deleteKey"];
      methods.forEach(methodName => {
        for (let i = 0; i < 20; i++) {
          const key = {};
          composer[methodName]([key, weakExternalKey], ["foo"]);
          promiseArray.push(new Promise(resolve => {
            finalizer.register(key, resolve);
          }));
        }
      });

      /* At this point, there should be no strong references to the keys we just created. */
      await new Promise(resolve => setImmediate(resolve));
      gc();

      await expectAsync(Promise.all(promiseArray)).toBeResolved();
    });

    it("weakly when defined as the second weak argument", async () => {
      const promiseArray = [];
      const methods = ["getKey", "hasKey", "deleteKey"];
      methods.forEach(methodName => {
        for (let i = 0; i < 20; i++) {
          const key = {};
          composer[methodName]([weakExternalKey, key], ["foo"]);
          promiseArray.push(new Promise(resolve => {
            finalizer.register(key, resolve);
          }));
        }
      });

      /* At this point, there should be no strong references to the keys we just created. */
      await new Promise(resolve => setImmediate(resolve));
      gc();

      await expectAsync(Promise.all(promiseArray)).toBeResolved();
    });

    it("strongly when we pass them as strong arguments to .getKey()", async () => {
      const promiseArray = [];

      for (let i = 0; i < 20; i++) {
        promiseArray.push(new Promise((resolve, reject) => {
          // resolve will never be invoked, but it also doubles nicely as a strong key
          composer.getKey([weakExternalKey, weakExternalKey], [resolve]);
          finalizer.register(resolve, () => reject("getKey() failed at index " + i));
        }));
      }

      /* At this point, calling gc() should force weak keys to be collected.  Abuse it. */
      for (let i = 0; i < 20; i++) {
        await new Promise(resolve => setImmediate(resolve));
        gc();
      }

      promiseArray.push(new Promise(resolve => setTimeout(resolve, 10)));
      await expectAsync(Promise.race(promiseArray)).toBeResolved();
    });

    it("weakly when we pass them as strong arguments to .hasKey()", async () => {
      const promiseArray = [];
      for (let i = 0; i < 20; i++) {
        const key = {};
        composer.hasKey([weakExternalKey, weakExternalKey], [key]);
        promiseArray.push(new Promise(
          resolve => finalizer.register(key, resolve)
        ));
      }

      /* At this point, there should be no strong references to the keys we just created. */
      await new Promise(resolve => setImmediate(resolve));
      gc();

      await expectAsync(Promise.all(promiseArray)).toBeResolved();
    });

    it("weakly when we pass them as strong arguments to .deleteKey()", async () => {
      const promiseArray = [];
      for (let i = 0; i < 20; i++) {
        const key = {};
        composer.deleteKey([weakExternalKey, weakExternalKey], [key]);
        promiseArray.push(new Promise(
          resolve => finalizer.register(key, resolve)
        ));
      }

      /* At this point, there should be no strong references to the keys we just created. */
      await new Promise(resolve => setImmediate(resolve));
      gc();

      await expectAsync(Promise.all(promiseArray)).toBeResolved();
    });
  });
});
