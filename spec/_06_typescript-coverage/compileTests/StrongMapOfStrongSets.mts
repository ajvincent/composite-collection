import StrongMapOfStrongSets, { ReadonlyStrongMapOfStrongSets } from "../generated/StrongMapOfStrongSets.mjs";
import { ClassOne, ClassTwo } from "./stubClasses.mjs";

const key1a = new ClassOne, key1b = new ClassTwo,
      key2a = new ClassOne, key2b = new ClassTwo;

const a: StrongMapOfStrongSets<ClassOne, ClassTwo> = new StrongMapOfStrongSets;
a.add(key1a, key1b);
void(a.delete(key2a, key1b));
void(a.has(key1a, key2b));
void(a.size);
void(a.getSizeOfSet(key1a));
void(a.mapSize);
void(a.clear());
void(a.deleteSets(key2a));
void(a.hasSets(key1a));

const b: StrongMapOfStrongSets<ClassOne, ClassTwo> = new StrongMapOfStrongSets([
  [key1a, key1b],
  [key2a, key2b],
]);

b.forEach((key1, key2, set) => {
  void(key1);
  void(key2);
  void(set);
}, {});


b.forEach((key1, key2, set) => {
  void(key1);
  void(key2);
  void(set);
});

b.forEachMap((key1, set) => {
  void(key1);
  void(set);
}, {});

b.forEachMap((key1, set) => {
  void(key1);
  void(set);
});

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

const rb: ReadonlyStrongMapOfStrongSets<ClassOne, ClassTwo> = b;

void(rb.has(key2a, key2b));

{
  const iter = rb.values();
  void(iter); // because for...of doesn't seem to register for eslint
  for (const value of iter) {
    void(value);
  }
}

{
  const iter = rb.valuesSet(key1a);
  void(iter); // because for...of doesn't seem to register for eslint
  for (const value of iter) {
    void(value);
  }
}

rb.forEach((key1, key2, set) => {
  void(key1);
  void(key2);
  void(set);
}, {});

rb.forEach((key1, key2, set) => {
  void(key1);
  void(key2);
  void(set);
});

rb.forEachMap((key1, set) => {
  void(key1);
  void(set);
}, {});

rb.forEachMap((key1, set) => {
  void(key1);
  void(set);
});

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
