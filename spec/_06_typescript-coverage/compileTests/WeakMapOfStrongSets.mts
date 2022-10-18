import WeakMapOfStrongSets, { ReadonlyWeakMapOfStrongSets } from "../generated/WeakMapOfStrongSets.mjs";
import { ClassOne, ClassTwo } from "./stubClasses.mjs";

const key1a = new ClassOne, key1b = new ClassTwo,
      key2a = new ClassOne, key2b = new ClassTwo;

const a: WeakMapOfStrongSets<ClassOne, ClassTwo> = new WeakMapOfStrongSets;
a.add(key1a, key1b);
void(a.delete(key2a, key1b));
void(a.has(key1a, key2b));
void(a.getSizeOfSet(key1a));
void(a.deleteSets(key2a));
void(a.hasSets(key1a));

const b: WeakMapOfStrongSets<ClassOne, ClassTwo> = new WeakMapOfStrongSets([
  [key1a, key1b],
  [key2a, key2b],
]);

b.forEachSet(key1a, (key1, key2, set) => {
  void(key1);
  void(key2);
  void(set);
}, {});

b.forEachSet(key1a, (key1, key2, set) => {
  void(key1);
  void(key2);
  void(set);
});

const rb: ReadonlyWeakMapOfStrongSets<ClassOne, ClassTwo> = b;

void(rb.has(key2a, key2b));

{
  const iter = rb.valuesSet(key1a);
  void(iter); // because for...of doesn't seem to register for eslint
  for (const value of iter) {
    void(value);
  }
}

rb.forEachSet(key1a, (key1, key2, set) => {
  void(key1);
  void(key2);
  void(set);
}, {});

rb.forEachSet(key1a, (key1, key2, set) => {
  void(key1);
  void(key2);
  void(set);
});
