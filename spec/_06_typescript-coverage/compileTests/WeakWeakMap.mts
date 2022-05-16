import WeakWeakMap from "../generated/WeakWeakMap.mjs";

class ClassOne {}
class ClassTwo {}

const a: WeakWeakMap<ClassOne, ClassTwo, number> = new WeakWeakMap;
void(a);
