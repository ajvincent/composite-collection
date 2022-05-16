import WeakWeakMap from "../generated/WeakWeakMap.mjs";
import { ClassOne, ClassTwo } from "./stubClasses.mjs";

const a: WeakWeakMap<ClassOne, ClassTwo, number> = new WeakWeakMap;
void(a);
