import CodeGenerator from "../../source/CodeGenerator.mjs";
import url from "url";
import fs from "fs/promises";

const targetPath = "../generated/StrongStrongMap.mjs";
const targetFileURL = new URL(targetPath, import.meta.url);

let StrongStrongMap;

describe("CodeGenerator(StrongStrongMap.mjs), ", () => {
  it("creates a loadable StrongStrongMap class", async () => {
    const sourcePath = "./spec/fixtures/StrongStrongMap.mjs";
    const sourceFileURL = url.pathToFileURL(sourcePath);
    const SoloStringMapConfig = (await import(sourceFileURL)).default;

    let p = Promise.all(CodeGenerator.UTILITIES.map(
      leafName => fs.copyFile(
        url.pathToFileURL("./templates/" + leafName),
        url.pathToFileURL("./spec/generated/" + leafName)
      ),
    ));

    const generator = new CodeGenerator(SoloStringMapConfig, targetFileURL.pathname, p);
    await generator.completionPromise;

    StrongStrongMap = (await import(targetFileURL)).default;
    expect(typeof StrongStrongMap).toBe("function");
  });

  describe("matching behavior of Map() instances", () => {
    let testMap, refMap = new Map;
    beforeEach(() => {
      if (typeof StrongStrongMap !== "function")
        fail("cannot run test for StrongStrongMap");
      refMap.clear();
      testMap = new StrongStrongMap();
    });

    it("setting one value", () => {
      const key1 = {isKey1: true}, key2 = {isKey2: true}, value = "value";
      refMap.set(key1, value);

      expect(testMap.set(key1, key2, value)).toBe(testMap);
      expect(testMap.size).toBe(refMap.size);
      expect(testMap.has(key1, key2)).toBe(refMap.has(key1));
      expect(testMap.get(key1, key2)).toBe(refMap.get(key1));

      {
        const iterator = testMap.keys();
        expect(iterator.next()).toEqual({value: [key1, key2], done: false});
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
        expect(testIterator.next()).toEqual({value: [key1, key2, value], done: false});
        refIterator.next();
        expect(testIterator.next()).toEqual(refIterator.next());
        expect(testIterator.next()).toEqual(refIterator.next());
      }

      expect(testMap.delete(key1, key2)).toBe(true);
      expect(testMap.size).toBe(0);
      expect(testMap.delete(key1, key2)).toBe(false);
      expect(testMap.size).toBe(0);

      expect(testMap.set(key1, key2, value)).toBe(testMap);
      expect(testMap.size).toBe(refMap.size);
      expect(testMap.has(key1, key2)).toBe(refMap.has(key1));
      expect(testMap.get(key1, key2)).toBe(refMap.get(key1));

      const testSpy = jasmine.createSpy("testMap.forEach");
      testMap.forEach(testSpy);
      expect(testSpy).toHaveBeenCalledOnceWith(value, key1, key2, testMap);
    });

    it("setting two values with a constant second key", () => {
      const key1 = {isKey1: true}, key3 = {isKey3: true}, value1 = "value1";
      refMap.set(key1, value1);
      const key2 = {isKey2: true}, value2 = "value3";
      refMap.set(key2, value2);

      expect(testMap.set(key1, key3, value1)).toBe(testMap);
      expect(testMap.has(key1, key3)).toBe(refMap.has(key1));
      expect(testMap.get(key1, key3)).toBe(refMap.get(key1));

      expect(testMap.set(key2, key3, value2)).toBe(testMap);
      expect(testMap.has(key2, key3)).toBe(refMap.has(key2));
      expect(testMap.get(key2, key3)).toBe(refMap.get(key2));
      expect(testMap.size).toBe(refMap.size);

      {
        const iterator = testMap.keys();
        expect(iterator.next()).toEqual({value: [key1, key3], done: false});
        expect(iterator.next()).toEqual({value: [key2, key3], done: false});
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
        expect(testIterator.next()).toEqual({value: [key1, key3, value1], done: false});
        refIterator.next();
        expect(testIterator.next()).toEqual({value: [key2, key3, value2], done: false});
        refIterator.next();
        expect(testIterator.next()).toEqual(refIterator.next());
      }

      expect(testMap.delete(key1, key3)).toBe(true);
      expect(testMap.size).toBe(1);
      expect(testMap.delete(key1, key3)).toBe(false);
      expect(testMap.size).toBe(1);

      refMap.delete(key1);
      refMap.set(key1, value1);

      expect(testMap.set(key1, key3, value1)).toBe(testMap);
      expect(testMap.size).toBe(refMap.size);
      expect(testMap.has(key1, key3)).toBe(refMap.has(key1));
      expect(testMap.get(key1, key3)).toBe(refMap.get(key1));

      {
        const iterator = testMap.keys();
        expect(iterator.next()).toEqual({value: [key2, key3], done: false});
        expect(iterator.next()).toEqual({value: [key1, key3], done: false});
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
        expect(testIterator.next()).toEqual({value: [key2, key3, value2], done: false});
        refIterator.next();
        expect(testIterator.next()).toEqual({value: [key1, key3, value1], done: false});
        refIterator.next();
        expect(testIterator.next()).toEqual(refIterator.next());
      }

      const testSpy = jasmine.createSpy("testMap.forEach");
      testMap.forEach(testSpy);
      expect(testSpy).toHaveBeenCalledTimes(2);
      expect(testSpy.calls.argsFor(0)).toEqual([value2, key2, key3, testMap]);
      expect(testSpy.calls.argsFor(1)).toEqual([value1, key1, key3, testMap]);
    });

    it("setting two values with a constant first key", () => {
      const key1 = {isKey1: true}, key3 = {isKey3: true}, value1 = "value1";
      refMap.set(key1, value1);
      const key2 = {isKey2: true}, value2 = "value3";
      refMap.set(key2, value2);

      expect(testMap.set(key3, key1, value1)).toBe(testMap);
      expect(testMap.has(key3, key1)).toBe(refMap.has(key1));
      expect(testMap.get(key3, key1)).toBe(refMap.get(key1));

      expect(testMap.set(key3, key2, value2)).toBe(testMap);
      expect(testMap.has(key3, key2)).toBe(refMap.has(key2));
      expect(testMap.get(key3, key2)).toBe(refMap.get(key2));
      expect(testMap.size).toBe(refMap.size);

      {
        const iterator = testMap.keys();
        expect(iterator.next()).toEqual({value: [key3, key1], done: false});
        expect(iterator.next()).toEqual({value: [key3, key2], done: false});
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
        expect(testIterator.next()).toEqual({value: [key3, key1, value1], done: false});
        refIterator.next();
        expect(testIterator.next()).toEqual({value: [key3, key2, value2], done: false});
        refIterator.next();
        expect(testIterator.next()).toEqual(refIterator.next());
      }

      expect(testMap.delete(key3, key1)).toBe(true);
      expect(testMap.size).toBe(1);
      expect(testMap.delete(key3, key1)).toBe(false);
      expect(testMap.size).toBe(1);

      refMap.delete(key1);
      refMap.set(key1, value1);

      expect(testMap.set(key3, key1, value1)).toBe(testMap);
      expect(testMap.size).toBe(refMap.size);
      expect(testMap.has(key3, key1)).toBe(refMap.has(key1));
      expect(testMap.get(key3, key1)).toBe(refMap.get(key1));

      {
        const iterator = testMap.keys();
        expect(iterator.next()).toEqual({value: [key3, key2], done: false});
        expect(iterator.next()).toEqual({value: [key3, key1], done: false});
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
        expect(testIterator.next()).toEqual({value: [key3, key2, value2], done: false});
        refIterator.next();
        expect(testIterator.next()).toEqual({value: [key3, key1, value1], done: false});
        refIterator.next();
        expect(testIterator.next()).toEqual(refIterator.next());
      }

      const testSpy = jasmine.createSpy("testMap.forEach");
      testMap.forEach(testSpy);
      expect(testSpy).toHaveBeenCalledTimes(2);
      expect(testSpy.calls.argsFor(0)).toEqual([value2, key3, key2, testMap]);
      expect(testSpy.calls.argsFor(1)).toEqual([value1, key3, key1, testMap]);
    });

    it("setting two values with swapping keys", () => {
      const key1 = {isKey1: true}, value1 = "value1";
      refMap.set(key1, value1);
      const key2 = {isKey2: true}, value2 = "value3";
      refMap.set(key2, value2);
  
      expect(testMap.set(key1, key2, value1)).toBe(testMap);
      expect(testMap.has(key1, key2)).toBe(refMap.has(key1));
      expect(testMap.get(key1, key2)).toBe(refMap.get(key1));
  
      expect(testMap.set(key2, key1, value2)).toBe(testMap);
      expect(testMap.has(key2, key1)).toBe(refMap.has(key2));
      expect(testMap.get(key2, key1)).toBe(refMap.get(key2));
      expect(testMap.size).toBe(refMap.size);
  
      {
        const iterator = testMap.keys();
        expect(iterator.next()).toEqual({value: [key1, key2], done: false});
        expect(iterator.next()).toEqual({value: [key2, key1], done: false});
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
        expect(testIterator.next()).toEqual({value: [key1, key2, value1], done: false});
        refIterator.next();
        expect(testIterator.next()).toEqual({value: [key2, key1, value2], done: false});
        refIterator.next();
        expect(testIterator.next()).toEqual(refIterator.next());
      }
  
      expect(testMap.delete(key1, key2)).toBe(true);
      expect(testMap.size).toBe(1);
      expect(testMap.delete(key1, key2)).toBe(false);
      expect(testMap.size).toBe(1);
  
      refMap.delete(key1);
      refMap.set(key1, value1);
  
      expect(testMap.set(key1, key2, value1)).toBe(testMap);
      expect(testMap.size).toBe(refMap.size);
      expect(testMap.has(key1, key2)).toBe(refMap.has(key1));
      expect(testMap.get(key1, key2)).toBe(refMap.get(key1));
  
      {
        const iterator = testMap.keys();
        expect(iterator.next()).toEqual({value: [key2, key1], done: false});
        expect(iterator.next()).toEqual({value: [key1, key2], done: false});
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
        expect(testIterator.next()).toEqual({value: [key2, key1, value2], done: false});
        refIterator.next();
        expect(testIterator.next()).toEqual({value: [key1, key2, value1], done: false});
        refIterator.next();
        expect(testIterator.next()).toEqual(refIterator.next());
      }
  
      const testSpy = jasmine.createSpy("testMap.forEach");
      testMap.forEach(testSpy);
      expect(testSpy).toHaveBeenCalledTimes(2);
      expect(testSpy.calls.argsFor(0)).toEqual([value2, key2, key1, testMap]);
      expect(testSpy.calls.argsFor(1)).toEqual([value1, key1, key2, testMap]);
    });
  });

  afterAll(async () => {
    await fs.rm(targetFileURL.pathname);
  });
});