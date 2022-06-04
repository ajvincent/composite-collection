import StrongStrongMap, { ReadonlyStrongStrongMap } from "../generated/StrongStrongMap.mjs";
import { ClassOne, ClassTwo } from "./stubClasses.mjs";

const key1a = new ClassOne, key1b = new ClassTwo,
      key2a = new ClassOne, key2b = new ClassTwo;

const a: StrongStrongMap<ClassOne, ClassTwo, number> = new StrongStrongMap;
a.set(key1a, key1b, 0);
void(a.get(key2a, key2b));
void(a.getDefault(key2a, key2b, () => 1));
void(a.delete(key2a, key1b));
void(a.has(key1a, key2b));

const b: StrongStrongMap<ClassOne, ClassTwo, number> = new StrongStrongMap([
  [key1a, key1b, 0],
  [key2a, key2b, 1],
]);

b.forEach((num, key1, key2, map) => {
  void(num);
  void(key1);
  void(key2);
  void(map);
}, {});


b.forEach((num, key1, key2, map) => {
  void(num);
  void(key1);
  void(key2);
  void(map);
});

const rb: ReadonlyStrongStrongMap<ClassOne, ClassTwo, number> = b;

void(rb.get(key1a, key1b));
void(rb.has(key2a, key2b));

{
  let iter = rb.keys();
  void(iter); // because for...of doesn't seem to register for eslint
  for (let [c1, c2] of iter) {
    void(c1);
    void(c2);
  }
}

{
  let iter = rb.values();
  void(iter); // because for...of doesn't seem to register for eslint
  for (let value of iter) {
    void(value);
  }
}

{
  let iter = rb.entries();
  void(iter); // because for...of doesn't seem to register for eslint
  for (let [c1, c2, value] of iter) {
    void(c1);
    void(c2);
    void(value);
  }
}

rb.forEach((value, key1, key2, map) => {
  void(value);
  void(key1);
  void(key2);
  void(map);
}, {});

rb.forEach((value, key1, key2, map) => {
  void(value);
  void(key1);
  void(key2);
  void(map);
});
