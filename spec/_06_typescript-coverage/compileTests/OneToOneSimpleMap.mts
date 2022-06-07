import OneToOneSimpleMap, { ReadonlyOneToOneSimpleMap } from "../generated/OneToOneSimpleMap.mjs";
import { ClassOne } from "./stubClasses.mjs";

const key1a = new ClassOne, key2a = new ClassOne, key3a = new ClassOne;

const a = new OneToOneSimpleMap<ClassOne>();
a.bindOneToOne(key1a, key2a);
void(a.hasIdentity(key1a, false));
void(a.hasIdentity(key3a, true));
void(a.isValidValue(key3a));
try {
  a.set(key1a, key2a);
}
catch (ex) {
  void(ex);
}

const ra: ReadonlyOneToOneSimpleMap<ClassOne> = a;
void(ra.hasIdentity(key2a, true));
void(ra.isValidValue(key2a));
