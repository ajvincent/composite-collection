import KeyHasher from "./KeyHasher.mjs";
import WeakKeyComposer from "./WeakKeyComposer.mjs";

export default class __className__ {
  constructor() {
    this.__weakArgCount__ = __weakArgumentCount__;
    this.__strongArgCount__ = __strongArgumentCount__;
    this.__keyHasher__ = new KeyHasher(__argNames__);
    this.__keyComposer__ = new WeakKeyComposer(__weakArgNames__, __strongArgNames__);

    /** @type {WeakMap<object, WeakMap<WeakKey, *>>} */
    this.__root__ = new WeakMap;
  }

  delete(__argList__) {
    // validate arguments, including that weakArguments really are objects!
    const keyMap = this.__root__.get(__argument0__);
    if (!keyMap)
      return false;

    const key = this.__keyComposer__.deleteKey([__weakArguments__], [__strongArguments__]);
    if (!key)
      return false;
    return keyMap.delete(key);
  }

  get(__argList__) {
    // validate arguments, including that weakArguments really are objects!
    const keyMap = this.__root__.get(__argument0__);
    if (!keyMap)
      return undefined;

    const key = this.__keyComposer__.getKey([__weakArguments__], [__strongArguments__]);
    if (!key)
      return undefined;
    return keyMap.get(key);
  }

  has(__argList__) {
    // validate arguments, including that weakArguments really are objects!
    const keyMap = this.__root__.get(__argument0__);
    if (!keyMap)
      return false;

    const key = this.__keyComposer__.getKey([__weakArguments__], [__strongArguments__]);
    if (!key)
      return false;
    return keyMap.has(key);
  }

  set(__argList__, value) {
    // validate arguments, including that weakArguments really are objects!
    if (this.__root__.has(__argument0__))
      this.__root__.set(__argument0__, new WeakMap);

    const keyMap = this.__root__.get(__argument0__);
    const key = this.__keyComposer__.getKey([__weakArguments__], [__strongArguments__]);

    keyMap.set(key, value);
    return this;
  }
}
