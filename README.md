# composite-collection

Composing Maps, WeakMaps, Sets and WeakSets into generated classes

## Summary

How often do you find yourself writing code like this?

```javascript
function setTwoKeyValue(key1, key2, value) {
  if (!outerMap.has(key1)) {
    outerMap.set(key1, new WeakMap);
  }
  const innerMap = outerMap.get(key1);

  innerMap.set(key2, value);
}
```

If the answer is "a lot", this package is for you.  It'd be much nicer to just write:

```javascript
compositeWeakWeakMap.set(key1, key2, value);
```

The composite-collection package provides several pre-defined two-key collection classes for your use:

- [composite-collection/StrongStrongMap](exports/StrongStrongMap.mjs)
- [composite-collection/StrongStrongSet](exports/StrongStrongSet.mjs)
- [composite-collection/WeakWeakMap](exports/WeakWeakMap.mjs)
- [composite-collection/WeakStrongMap](exports/WeakStrongMap.mjs)
- [composite-collection/WeakWeakSet](exports/WeakWeakSet.mjs)
- [composite-collection/WeakStrongSet](exports/WeakStrongSet.mjs)
- [composite-collection/StrongMapOfStrongSets](exports/StrongMapOfStrongSets.mjs)
- [composite-collection/WeakMapOfStrongSets](exports/WeakMapOfStrongSets.mjs)
- [composite-collection/WeakMapOfWeakSets](exports/WeakMapOfWeakSets.mjs)
- [composite-collection/WeakFunctionMultiMap](exports/WeakFunctionMultiMap.mjs)
  - This is a WeakMap of Sets, each of which must contain only functions
- [composite-collection/OneToOneSimpleMap](exports/OneToOneSimpleMap.mjs)
- [composite-collection/OneToOneStrongMap](exports/OneToOneStrongMap.mjs)
- [composite-collection/OneToOneWeakMap](exports/OneToOneWeakMap.mjs)

If you want to generate your own composite collections, this package is also for you.  Each of the above collections comes from [a short configuration file](source/exports), some [hand-written templates](templates), and a [code-generating set of modules](source) to transform the templates into [working collection modules](exports), complete with [JSDoc comments](https://jsdoc.app/).  Here's the [WeakFunctionMultiMap configuration file](source/exports/WeakFunctionMultiMap.mjs):

```javascript
import CollectionConfiguration from "composite-collection/Configuration";

const WeakFunctionMultiMap = new CollectionConfiguration("WeakFunctionMultiMap", "WeakMap", "Set");

WeakFunctionMultiMap.addMapKey("key", true);
WeakFunctionMultiMap.addSetKey("mapFunction", false, {
  argumentType: "Function",
  argumentValidator: function(mapFunction) {
    if (typeof mapFunction !== "function")
      return false;
  }
});

export default WeakFunctionMultiMap;
```

Here's code you could use to [generate this collection](spec/integration/fixtures/Driver/test.mjs).

```javascript
import CompositeDriver from "composite-collection/Driver";
import path from "path";

const driver = new CompositeDriver(
  path.join(process.cwd(), "configurations"),
  path.join(process.cwd(), "collections")
);

driver.start();
await driver.completionPromise;

// at this point, "./collections/WeakFunctionMultiMap.mjs" has everything you need
```

To use it:

```javascript
import WeakFunctionMultiMap from "./collections/WeakFunctionMultiMap.mjs";

const wfMM = new WeakFunctionMultiMap();
const key1 = {}, callback1 = function() {}, callback2 = function() {};
wfMM.add(key1, callback1);
wfMM.add(key1, callback2);
```

## Features

Currently supported (version 0.2.0):

- ECMAScript class modules with all the pieces you need
- A simple configuration API
- Generating code and matching JSDoc comments
  - Comprehensive API in each collection for setting, getting and iterating over entries
- Support for multiple weak keys, multiple strong keys
- Argument validation
  - Including user modules for types
- Maps, Sets and Maps of Sets available
- Weak keys subject to garbage collection
- Pre-compiled collections available as exports
- [Private class fields and methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)
- Using [WeakRef](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef) and [FinalizationRegistry](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry) to reduce the number of WeakMaps
- One-to-one hash tables with two-part keys:  `("red", redObj) <-> ("blue", blueObj)`

In the future:

- Declaring key groups
  - Key groups can be equal: `(arg1, arg2) === (arg3, arg4)` for the purpose of this collection
- Eliminating redundant use of KeyHasher, WeakKeyComposer when there's only one map key and/or one set key

## A note about one-to-one hashtables

Frequently, we see one-to-one hashtables implemented very simply:

```javascript
const map = new WeakMap;
const redObj = {}, blueObj = {};

// ...
map.set(redObj, blueObj);
map.set(blueObj, redObj);

// ...
map.get(redObj); // returns blueObj
map.get(blueObj); // returns redObj
```

The [`composite-collection/OneToOneSimpleMap`](exports/OneToOneSimpleMap.mjs) module implements this with its `bindOneToOne(value1, value2)` method.  Lookups via `.get(value)` point from the source value to the target value.  

However, this misses an important bit of context:  the _namespace_ each object belongs to.  You could easily declare a relationship of two tuples: `("red", redObj) === ("blue", blueObj)`.  This tuple arrangement adds the missing context with minimal overhead.

More significantly, having a second argument in each tuple allows you to define other namespaces and other relationships:  `("green", greenObj) === ("red", redObj)`.  
The simple hashtable above can't do this.  To support this, there are the [`composite-collection/OneToOneStrongMap`](exports/OneToOneStrongMap.mjs) and [`composite-collection/OneToOneWeakMap`](exports/OneToOneWeakMap.mjs) modules.

These modules work by wrapping an existing weak map collection and assuming ownership of a weak key argument.  Under the hood, the `redObj`, `blueObj` and `greenObj` would all point to a single weak key, which then goes into a `WeakStrongMap` along with the string argument as the strong key.  The values are then the original objects.  The binding would happen by calling `.bindOneToOne("red", redObj, "blue", blueObj)`.  Going from `blueObj` to `redObj` is as simple as calling `.get(blueObj, "red")`.

If you want a more complex hashtable structure (multiple keys, argument validation, etc.), you'll want to craft your own collection configuration.  See [`source/exports/OneToOneWeakMap.mjs`](source/exports/OneToOneWeakMap.mjs) for an example.

## How It All Works

1. The user writes a [CollectionConfiguration](source/CollectionConfiguration.mjs) instance, using several methods:
  - `setFileOverview()` to set a top-level file overview
  - `importLines()` to specify top-level module imports
  - `addMapKey()` to specify ordered keys for maps
  - `addSetKey()` to specify ordered keys for sets
  - `setValueType()` for maps, to specify the type of the value to store
  - `configureOneToOne()` for one-to-one hashtable configurations
  - `lock()` (optional) to lock the configuration.
2. The [`templates/Strong`](templates/Strong) and [`templates/Weak`](templates/Weak) directories hold template JavaScript files in [JavaScript template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), enclosed in functions taking a `defines` Map argument and a `docs` "JSDocGenerator" argument.
3. For strongly held keys, the [`CodeGenerator`](source/CodeGenerator.mjs) module writes an import for a [`KeyHasher`](source/exports/keys/Hasher.mjs) module, which the [`Driver`](source/Driver.mjs) module copies into the destination directory.
4. For weakly held keys (and strongly held keys associated with them), the `CodeGenerator` module writes an import for a [`WeakKeyComposer`](exports/keys/Composite.mjs) module.  The Driver module copies this module into the destination directory.
5. The `CodeGenerator` uses the configuration and fills a [`JSDocGenerator`](source/JSDocGenerator.mjs) instance with the necessary fields to format JSDoc comments for the code it will generate.
6. The `CodeGenerator` combines the template, the configuration and the `JSDocGenerator` into a [JavaScript module file](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) ready for either web browsers or [NodeJS](https://www.nodejs.org) applications to use.
