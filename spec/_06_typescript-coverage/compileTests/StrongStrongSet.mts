import StrongStrongSet, { ReadonlyStrongStrongSet } from "../generated/StrongStrongSet.mjs";
import { ClassOne, ClassTwo } from "./stubClasses.mjs";

const key1a = new ClassOne, key1b = new ClassTwo,
      key2a = new ClassOne, key2b = new ClassTwo;

const a: StrongStrongSet<ClassOne, ClassTwo> = new StrongStrongSet;
a.add(key1a, key1b);
void(a.delete(key2a, key1b));
void(a.has(key1a, key2b));

const b: StrongStrongSet<ClassOne, ClassTwo> = new StrongStrongSet([
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

const rb: ReadonlyStrongStrongSet<ClassOne, ClassTwo> = b;

void(rb.has(key2a, key2b));

{
  const iter = rb.values();
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
