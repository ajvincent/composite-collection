import WeakKeyComposer from "composite-collection/WeakKey-WeakRef";

export default class __className__ {
  constructor(__weakArgNames__, __strongArgNames__) {
    /** @type {WeakKeyComposer} */
    this.__keyComposer__ = new WeakKeyComposer(__weakArgNames__, __strongArgNames__);

    /**
     * @type {WeakMap<WeakKey, Set<*> | object>}
     */
    this.__weakKeyToStrongKeys__ = new WeakMap;
  }

  add(__argList__) {
    const key = this.__keyComposer__.getKey([__weakArgList__], [__strongArgList__]);
    if (!key)
      return null;

    if (!this.__weakKeyToStrongKeys__.has(key))
      this.__weakKeyToStrongKeys__.set(
        key,
        this.__strongArgNames__.length == 0 ? {} : new Set([__strongArgList__])
      );

    return this;
  }

  delete(__argList__) {
    if (!this.has(__argList__))
      return false;

    const key = this.__keyComposer__.getKey([__weakArgList__], [__strongArgList__]);
    if (!key)
      return false;

    const rv = this.__weakKeyToStrongKeys__.delete(key);
    if (rv)
      this.__keyComposer__.deleteKey([__weakArgList__], [__strongArgList__])

    return rv;
  }

  has(__argList__) {
    if (!this.__keyComposer__.hasKey([__weakArgList__], [__strongArgList__]))
      return false;

    const key = this.__keyComposer__.getKey([__weakArgList__], [__strongArgList__]);
    return this.__weakKeyToStrongKeys__.has(key);
  }
}
