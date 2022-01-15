# Weak Map Of Weak Sets Files

This directory is for the mothballed Weak/MapOfWeakSets code.  The API for these is impossible to justify in production code right now.

A WeakMapOfWeakSets has six public methods:

- .add()
- .addSets()
- .delete()
- .deleteSets()
- .has()
- .isValidKey()

Compare this to a WeakWeakSet:

- .add()
- .delete()
- .has()
- .isValidKey()

The `.addSets()` operation is easy to replicate in ordinary JavaScript:

```javascript
class WeakMapOfWeakSets extends WeakWeakSet {
  /**
   * Add several sets to a map in this collection.
   *
   * @param {object}      mapKey   The map key.
   * @param {object[][]}  sets     The sets to add.
   * @returns {WeakMapOfWeakSets} This collection.
   * @public
   */
  addSets(mapKey, sets) {
    const completedKeys = sets.map(s => [mapKey, ...s]);
    if (!completedKeys.every(ck => this.isValidKey(...ck)))
      throw new Error("At least one of the ordered key sets is not valid!");

    completedKeys.forEach(ck => this.add(...ck));
    return this;
  }
}
```

The `.deleteSets()` operation is harder, because you'd have to get rid of every case, but it's still not a strong enough reason to keep them around.

Also, the existing implementation would leak WeakSets in the private `#root`.  This is particularly when we delete all sets under a map composite key:  deciding when to delete the WeakSet the map composite key references would involve reference counting, finalizer registries, or something else really complicated for this purpose.  For similar reasons, I removed the `.hasSets()` method.  It's ultimately for this reason I removed `Strong/MapOfWeakSets` some time ago as well.

Because it's not entirely clear users will _never_ need them, I'm moving the files for WeakMapOfWeakSets into this directory.  Maybe I should delete them altogether, but recovering them or rebuilding them would be expensive.

As a final note, `Weak/MapOfStrongSets` will _not_ be mothballed in a similar manner.  The `WeakFunctionMultiMap` is actually quite useful, I think, because I can iterate over a set of functions bound weakly to one object.
