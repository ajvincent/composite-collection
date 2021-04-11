import KeyHasher from "./KeyHasher.mjs";

class WeakKey extends Set {
  constructor(weakArguments, strongArguments, finalizer) {
    weakArguments.forEach(arg => {
      super.add(new WeakRef(arg));
      finalizer.register(arg, this, this);
    });
    strongArguments.forEach(arg => super.add(arg));
  }
}

export default class WeakKeyComposer {
  constructor(weakArgList, strongArgList) {
    if (weakArgList.length === 0)
      throw new Error("weakArgList must have at least one argument");

    /**
     * @type {WeakMap<object, Map<hash, WeakKey>>}
     */
    this.__keyOwner__ = new WeakMap;
    this.__weakArgList__ = weakArgList.slice();
    this.__strongArgList__ = strongArgList.slice();
    this.__keyHasher__ = new KeyHasher(weakArgList.concat(strongArgList));

    /** @type {WeakMap<WeakKey, WeakRef<object>} */
    this.__weakKeyToFirstWeak__ = new WeakMap;

    /** @type {WeakMap<WeakKey, hash>} */
    this.__weakKeyToHash__ = new WeakMap;

    this.__keyFinalizer__ = new FinalizationRegistry(
      weakKey => this.__deleteWeakKey__(weakKey)
    );

    Object.freeze(this);
  }

  __getHash__(weakArguments, strongArguments) {
    if (weakArguments.length !== this.__weakArgList__.length)
      return null;
    if (strongArguments.length !== this.__strongArgList__.length)
      return null;
    return this.__keyHasher__.buildHash(weakArguments.concat(strongArguments));
  }

  getKey(weakArguments, strongArguments) {
    const hash = this.__getHash__(weakArguments, strongArguments);
    if (!hash)
      return null;

    const firstWeak = weakArguments[0];
    if (!this.__keyOwner__.has(firstWeak)) {
      this.__keyOwner__.set(firstWeak, new Map);
    }
    const hashMap = this.__keyOwner__.get(firstWeak);

    if (!hashMap.has(hash)) {
      const weakKey = new WeakKey(weakArguments, strongArguments, this.__keyFinalizer__);

      this.__weakKeyToFirstWeak__.set(weakKey, new WeakRef(weakArguments[0]));
      this.__weakKeyToHash__.set(weakKey, hash);
      hashMap.set(hash, weakKey);
    }

    return hashMap.get(hash);
  }

  deleteKey(weakArguments, strongArguments) {
    const hash = this.__getHash__(weakArguments, strongArguments);
    if (!hash)
      return false;

    const firstWeak = weakArguments[0];
    if (!this.__keyOwner__.has(firstWeak))
      return false;

    const hashMap = this.__keyOwner__.get(firstWeak);
    const weakKey = hashMap.get(hash);
    if (weakKey) {
      this.__keyFinalizer__.unregister(weakKey);
      this.__weakKeyToFirstWeak__.delete(weakKey);
      hashMap.delete(hash);
    }
    return Boolean(weakKey);
  }

  __deleteWeakKey__(weakKey) {
    const firstKeyRef = this.__weakKeyToFirstWeak__.get(weakKey);
    const firstWeak = firstKeyRef.deref();
    if (!firstWeak)
      return;

    const hash = this.__weakKeyToHash__.get(weakKey);
    this.__weakKeyToHash__.delete(weakKey);
    this.__weakKeyToFirstWeak__.delete(weakKey);

    const hashMap = this.__keyOwner__.get(firstWeak);
    hashMap.delete(hash);
  }
}
