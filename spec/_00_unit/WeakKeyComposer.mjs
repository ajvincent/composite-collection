import WeakKeyComposer from "#source/exports/keys/Composite.mjs";
import ToHoldRefsMatchers from "#support/toHoldReferences.mjs";

describe("WeakKeyComposer", () => {
  it("class is frozen", () => {
    expect(Object.isFrozen(WeakKeyComposer)).toBe(true);
    expect(Object.isFrozen(WeakKeyComposer.prototype)).toBe(true);
  });

  it("class cannot have subclasses", () => {
    class Subclass extends WeakKeyComposer {}
    expect(() => new Subclass).toThrowError("You cannot subclass WeakKeyComposer!");
  });

  it("class exposes only the public methods", () => {
    expect(Reflect.ownKeys(WeakKeyComposer.prototype)).toEqual([
      "constructor",
      "getKey",
      "hasKey",
      "getKeyIfExists",
      "deleteKey",
      "isValidForKey",
    ]);
  });

  it("instances are frozen", () => {
    const composer = new WeakKeyComposer(["foo"]);
    expect(Object.isFrozen(composer)).toBe(true);
  });

  it("instances have no public properties", () => {
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

  /**
   * Define specifications for WeakKeyComposer under different weak/strong argument combinations.
   *
   * @param {object[][]} keySet1 The first pair of weak and strong arguments.
   * @param {object[][]} keySet2 The second pair of weak and strong arguments.
   * @param {object[][]} keySet3 The third pair of weak and strong arguments.
   * @param {Function} builder   Returns a new WeakKeyComposer aligned with the weak and strong arguments.
   */
  function testWeakKeys(keySet1, keySet2, keySet3, builder) {
    let composer;
    beforeEach(() => composer = builder());
    afterEach(() => composer = null);

    it(".getKey() builds an unique object key for a given key set", () => {
      const composite1 = composer.getKey(...keySet1);
      expect(Object(composite1)).toBe(composite1);
      expect(Object.isFrozen(composite1)).toBe(true);

      expect(composer.getKey(...keySet1)).toBe(composite1);

      const composite2 = composer.getKey(...keySet2);
      expect(Object(composite2)).toBe(composite2);
      expect(Object.isFrozen(composite2)).toBe(true);
      expect(composite2).not.toBe(composite1);

      expect(composer.getKey(...keySet1)).toBe(composite1);
      expect(composer.getKey(...keySet2)).toBe(composite2);

      const composite3 = composer.getKey(...keySet3);
      expect(Object(composite3)).toBe(composite3);
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

    it(".getKey() throws for an incorrect number of weak arguments", () => {
      expect(
        () => composer.getKey([], [])
      ).toThrowError("Argument lists do not form a valid key!");
      expect(
        () => composer.getKey([{}, {}, {}])
      ).toThrowError("Argument lists do not form a valid key!");
      expect(
        () => composer.getKey([], [{}, {}, {}])
      ).toThrowError("Argument lists do not form a valid key!");
    });

    it(".getKey() throws for a non-weak key passed as a weak argument", () => {
      const key = keySet1.slice();
      key[0] = key[0].slice();
      key[0][0] = Symbol("foo");

      expect(
        () => composer.getKey(...key)
      ).toThrowError("Argument lists do not form a valid key!");
    });

    it(".deleteKey() can delete the key when specifically directed to", () => {
      const composite1 = composer.getKey(...keySet1);
      expect(composer.deleteKey(...keySet1)).toBe(true);

      const composite2 = composer.getKey(...keySet1);
      expect(Object(composite2)).toBe(composite2);
      expect(Object.isFrozen(composite2)).toBe(true);
      expect(composite2).not.toBe(composite1);
    });

    it(".deleteKey() returns false for an unknown key", () => {
      expect(composer.deleteKey(...keySet1)).toBe(false);

      expect(composer.deleteKey([], [])).toBe(false);
      expect(composer.deleteKey([{}, {}, {}])).toBe(false);
      expect(composer.deleteKey([], [{}, {}, {}])).toBe(false);

      void(composer.getKey(...keySet1));
      composer.deleteKey(...keySet1);
      expect(composer.deleteKey(...keySet1)).toBe(false);
    });

    it(".deleteKey() returns false for a non-weak key passed as a weak argument", () => {
      const key = keySet1.slice();
      key[0] = key[0].slice();
      key[0][0] = Symbol("foo");

      expect(composer.deleteKey(...key)).toBe(false);
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

      it("false for a non-weak key passed as a weak argument", () => {
        expect(composer.hasKey(keySet1[0].slice().splice(0, 1, "foo"))).toBe(false);
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

    describe(".getKeyIfExists() returns", () => {
      it(`the existing key if there is one`, () => {
        const composite1 = composer.getKey(...keySet1);
        expect(composer.getKeyIfExists(...keySet1)).toBe(composite1);
      });

      it("null if there is no key", () => {
        expect(composer.getKeyIfExists(...keySet1)).toBe(null);
      });
    });
  }

  describe("holds references to objects", () => {
    let composer;
    const weakExternalKey = {};

    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
      composer = new WeakKeyComposer(["weakKey1", "weakKey2"], ["strongKey"]);
    });

    // Because of the nature of weak references and weak maps, I have to test this in more than one weak key dimension.
    describe("weakly when defined as the first weak argument in", () => {
      it(".getKey()", async () => {
        await expectAsync(
          key => composer.getKey([key, weakExternalKey], ["foo"])
        ).toHoldReferencesWeakly();
      });

      it(".hasKey()", async () => {
        await expectAsync(
          key => composer.hasKey([key, weakExternalKey], ["foo"])
        ).toHoldReferencesWeakly();
      });

      it(".deleteKey()", async () => {
        await expectAsync(
          key => composer.deleteKey([key, weakExternalKey], ["foo"])
        ).toHoldReferencesWeakly();
      });

      it(".isValidForKey()", async () => {
        await expectAsync(
          key => composer.isValidForKey([key, weakExternalKey], ["foo"])
        ).toHoldReferencesWeakly();
      });
    });

    describe("weakly when defined as the second weak argument in", () => {
      it(".getKey()", async () => {
        await expectAsync(
          key => composer.getKey([weakExternalKey, key], ["foo"])
        ).toHoldReferencesWeakly();
      });

      it(".hasKey()", async () => {
        await expectAsync(
          key => composer.hasKey([weakExternalKey, key], ["foo"])
        ).toHoldReferencesWeakly();
      });

      it(".deleteKey()", async () => {
        await expectAsync(
          key => composer.deleteKey([weakExternalKey, key], ["foo"])
        ).toHoldReferencesWeakly();
      });

      it(".isValidForKey()", async () => {
        await expectAsync(
          key => composer.isValidForKey([weakExternalKey, key], ["foo"])
        ).toHoldReferencesWeakly();
      });
    });

    it("strongly when we pass them as strong arguments to .getKey() with valid arguments", async () => {
      await expectAsync(
        key => composer.getKey([weakExternalKey, weakExternalKey], [key])
      ).toHoldReferencesStrongly();
    });


    it("weakly when we pass them as strong arguments to .hasKey()", async () => {
      await expectAsync(
        key => composer.hasKey([weakExternalKey, weakExternalKey], [key])
      ).toHoldReferencesWeakly();
    });

    it("weakly when we pass them as strong arguments to .deleteKey()", async () => {
      await expectAsync(
        key => composer.deleteKey([weakExternalKey, weakExternalKey], [key])
      ).toHoldReferencesWeakly();
    });

    it("weakly when we pass them as strong arguments to .addKey(), then .deleteKey()", async () => {
      await expectAsync(
        key => {
          composer.getKey([weakExternalKey, weakExternalKey], [key]);
          composer.deleteKey([weakExternalKey, weakExternalKey], [key]);
        }
      ).toHoldReferencesWeakly();
    });

    it("weakly when we pass them as strong arguments to .isValidForKey()", async () => {
      await expectAsync(
        key => composer.isValidForKey([weakExternalKey, weakExternalKey], [key])
      ).toHoldReferencesWeakly();
    });
  });

  describe("holds references to getKey() results weakly", () => {
    let composer;
    const key1 = {}, key2 = {};
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
      composer = new WeakKeyComposer(["weakKey1", "weakKey2"], ["strongKey"]);
    });

    afterEach(() => {
      composer = null;
    });

    it("weakly when no key is held strongly", async () => {
      await expectAsync(
        () => composer.getKey([{}, {}], [{}])
      ).toHoldValuesWeakly();
    });

    it("weakly when only the first key is held strongly", async () => {
      // should be weak because the second key isn't held strongly
      await expectAsync(
        () => composer.getKey([key1, {}], [{}])
      ).toHoldValuesWeakly();
    });

    it("weakly when only the second key is held strongly", async () => {
      // should be weak because the first key isn't held strongly
      await expectAsync(
        () => composer.getKey([{}, key2], [{}])
      ).toHoldValuesWeakly();
    });

    it("strongly when both weak keys are held strongly", async () => {
      // should be weak because the first key isn't held strongly
      await expectAsync(
        () => composer.getKey([key1, key2], [{}])
      ).toHoldValuesStrongly();
    });

    it("weakly when the third key is held strongly", async () => {
      await expectAsync(
        () => composer.getKey([{}, {}], [key1])
      ).toHoldValuesWeakly();
    })
  });
});
