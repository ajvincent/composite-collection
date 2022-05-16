import WeakWeakMap from "../generated/WeakWeakMap.mjs";
import { ClassOne, ClassTwo } from "./stubClasses.mjs";

const a: WeakWeakMap<ClassOne, ClassTwo, number> = new WeakWeakMap;
void(a);

const b: WeakWeakMap<ClassOne, ClassTwo, number> = new WeakWeakMap([
  [new ClassOne, new ClassTwo, 0],
  [new ClassOne, new ClassTwo, 1],
]);
void(b);
