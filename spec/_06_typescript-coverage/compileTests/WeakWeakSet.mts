import WeakWeakSet, { ReadonlyWeakWeakSet } from "../generated/WeakWeakSet.mjs";
import { ClassOne, ClassTwo } from "./stubClasses.mjs";

const key1a = new ClassOne, key1b = new ClassTwo,
      key2a = new ClassOne, key2b = new ClassTwo;

const a: WeakWeakSet<ClassOne, ClassTwo> = new WeakWeakSet;
a.add(key1a, key1b);
void(a.delete(key2a, key1b));
void(a.has(key1a, key2b));

const b: WeakWeakSet<ClassOne, ClassTwo> = new WeakWeakSet([
  [key1a, key1b],
  [key2a, key2b],
]);

const rb: ReadonlyWeakWeakSet<ClassOne, ClassTwo> = b;

void(rb.has(key2a, key2b));
void(rb.isValidKey(key1a, key2b));
