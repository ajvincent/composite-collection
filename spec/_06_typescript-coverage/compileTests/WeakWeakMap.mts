import WeakWeakMap, { ReadonlyWeakWeakMap } from "../generated/WeakWeakMap.mjs";
import { ClassOne, ClassTwo } from "./stubClasses.mjs";

const key1a = new ClassOne, key1b = new ClassTwo,
      key2a = new ClassOne, key2b = new ClassTwo;

const a: WeakWeakMap<ClassOne, ClassTwo, number> = new WeakWeakMap;
a.set(key1a, key1b, 0);
void(a.get(key2a, key2b));
void(a.getDefault(key2a, key2b, () => 1));
void(a.delete(key2a, key1b));
void(a.has(key1a, key2b));
void(a.isValidKey(key1a, key2b));

const b: WeakWeakMap<ClassOne, ClassTwo, number> = new WeakWeakMap([
  [key1a, key1b, 0],
  [key2a, key2b, 1],
]);
void(b);

const rb: ReadonlyWeakWeakMap<ClassOne, ClassTwo, number> = b;

void(rb.get(key1a, key1b));
void(rb.has(key2a, key2b));
void(rb.isValidKey(key1a, key2b));
