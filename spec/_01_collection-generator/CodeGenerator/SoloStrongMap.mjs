import ToHoldRefsMatchers from "#support/toHoldReferences.mjs";

import SoloStrongMap from "../generated/SoloStrongMap.mjs";
import MockImportable from "../fixtures/MockImportable.mjs";

import fs from "fs/promises";
import { fileURLToPath } from 'url';
import path from "path";

describe("CodeGenerator(SoloStrongMap.mjs)", () => {
  let testMap, refMap = new Map;
  beforeEach(() => {
    refMap.clear();
    testMap = new SoloStrongMap();
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(SoloStrongMap)).toBe(true);
    expect(Object.isFrozen(SoloStrongMap.prototype)).toBe(true);
  });

  it("class only exposes public methods", () => {
    expect(SoloStrongMap.prototype).toBeInstanceOf(Map);

    expect(Reflect.ownKeys(SoloStrongMap.prototype)).toEqual([
      "constructor",
      "delete",
      "get",
      "has",
      "isValidKey",
      "isValidValue",
      "set",
    ]);
  });

  it("instances have only symbol public properties", () => {
    expect(Reflect.ownKeys(testMap)).toEqual([
      Symbol.toStringTag,
    ]);
  });

  it("instances stringify to a string with the className", () => {
    expect(testMap.toString().includes("SoloStrongMap")).toBe(true);
  });

  it("setting one value", () => {
    const key = new MockImportable({isKey: true}), value = new MockImportable("value");
    refMap.set(key, value);

    expect(testMap.set(key, value)).toBe(testMap);
    expect(testMap.size).toBe(refMap.size);
    expect(testMap.has(key)).toBe(refMap.has(key));
    expect(testMap.get(key)).toBe(refMap.get(key));

    {
      const iterator = testMap.keys();
      expect(iterator.next()).toEqual({value: key, done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const testIterator = testMap.values();
      const refIterator  = refMap.values();
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
    }

    {
      const testIterator = testMap.entries();
      const refIterator  = refMap.entries()
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
    }

    expect(testMap.delete(key)).toBe(true);
    expect(testMap.size).toBe(0);
    expect(testMap.delete(key)).toBe(false);
    expect(testMap.size).toBe(0);

    expect(testMap.set(key, value)).toBe(testMap);
    expect(testMap.size).toBe(refMap.size);
    expect(testMap.has(key)).toBe(refMap.has(key));
    expect(testMap.get(key)).toBe(refMap.get(key));

    const testSpy = jasmine.createSpy("testMap.forEach");
    testMap.forEach(testSpy);
    expect(testSpy).toHaveBeenCalledOnceWith(value, key, testMap);
  });

  it("setting two values", () => {
    const key1 = new MockImportable({isKey1: true}), value1 = new MockImportable("value1");
    refMap.set(key1, value1);
    const key2 = new MockImportable({isKey2: true}), value2 = new MockImportable("value2");
    refMap.set(key2, value2);

    expect(testMap.set(key1, value1)).toBe(testMap);
    expect(testMap.has(key1)).toBe(refMap.has(key1));
    expect(testMap.get(key1)).toBe(refMap.get(key1));

    expect(testMap.set(key2, value2)).toBe(testMap);
    expect(testMap.has(key2)).toBe(refMap.has(key2));
    expect(testMap.get(key2)).toBe(refMap.get(key2));
    expect(testMap.size).toBe(refMap.size);

    {
      const iterator = testMap.keys();
      expect(iterator.next()).toEqual({value: key1, done: false});
      expect(iterator.next()).toEqual({value: key2, done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const testIterator = testMap.values();
      const refIterator  = refMap.values();
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
    }

    {
      const testIterator = testMap.entries();
      const refIterator  = refMap.entries();
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
    }

    expect(testMap.delete(key1)).toBe(true);
    expect(testMap.size).toBe(1);
    expect(testMap.delete(key1)).toBe(false);
    expect(testMap.size).toBe(1);

    refMap.delete(key1);
    refMap.set(key1, value1);

    expect(testMap.set(key1, value1)).toBe(testMap);
    expect(testMap.size).toBe(refMap.size);
    expect(testMap.has(key1)).toBe(refMap.has(key1));
    expect(testMap.get(key1)).toBe(refMap.get(key1));

    {
      const iterator = testMap.keys();
      expect(iterator.next()).toEqual({value: key2, done: false});
      expect(iterator.next()).toEqual({value: key1, done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const testIterator = testMap.values();
      const refIterator  = refMap.values();
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
    }

    {
      const testIterator = testMap.entries();
      const refIterator  = refMap.entries()
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
    }

    const testSpy = jasmine.createSpy("testMap.forEach");
    testMap.forEach(testSpy);
    expect(testSpy).toHaveBeenCalledTimes(2);
    expect(testSpy.calls.argsFor(0)).toEqual([value2, key2, testMap]);
    expect(testSpy.calls.argsFor(1)).toEqual([value1, key1, testMap]);
  });

  it("throws for setting a non-validated key or value", () => {
    const key = new MockImportable({isKey: true}), value = new MockImportable("value");

    expect(() => {
      testMap.set({}, value)
    }).toThrowError("The ordered key set is not valid!");

    expect(() => {
      testMap.set(key, {})
    }).toThrowError("The value is not valid!");
  });

  describe("holds references to objects", () => {
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    it("weakly as the key in .delete()", async () => {
      await expectAsync(
        key => testMap.delete(new MockImportable(key))
      ).toHoldReferencesWeakly();
    });

    it("weakly as the key in .get()", async () => {
      await expectAsync(
        key => testMap.get(new MockImportable(key))
      ).toHoldReferencesWeakly();
    });

    it("weakly as the key in .has()", async () => {
      await expectAsync(
        key => testMap.has(new MockImportable(key))
      ).toHoldReferencesWeakly();
    });

    it("strongly as the key in .set()", async () => {
      await expectAsync(
        key => testMap.set(new MockImportable(key), new MockImportable({}))
      ).toHoldReferencesStrongly();
    });

    it("weakly as the key in .add(), then .delete()", async () => {
      await expectAsync(
        key => {
          key = new MockImportable(key);
          testMap.set(key, new MockImportable({}));
          testMap.delete(key);
        }
      ).toHoldReferencesWeakly();
    });

    it("as values when the keys are held externally", async () => {
      const externalKeys = [];
      await expectAsync(
        value => {
          let externalKey = new MockImportable({});
          testMap.set(externalKey, new MockImportable(value));
          externalKeys.push(externalKey);
          externalKey = null;
        }
      ).toHoldReferencesStrongly();
    });

    it("as values when the keys are not held externally", async () => {
      await expectAsync(
        value => testMap.set(new MockImportable({}), new MockImportable(value))
      ).toHoldReferencesStrongly();
    });
  });

  it("includes the file overview at the start of the file", async () => {
    const pathToModule = path.join(fileURLToPath(import.meta.url), "../../generated/SoloStrongMap.mjs");
    const moduleContents = await fs.readFile(pathToModule, { encoding: "utf-8"});
    const firstBlock = moduleContents.substr(0, moduleContents.indexOf("*/") + 2).trim();

    const expected = `/**
 * @file
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 * Template: Solo/Map
 * I generated this file for testing purposes.
 *
 * This is only a test.
 */`;

    expect(firstBlock).toBe(expected);
  });
});
