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

If you want to generate your own composite collections, this package is also for you.  Each of the above collections comes from a short configuration file, some hand-written templates, and a code-generating set of modules to transform the templates into working collection modules, complete with [JSDoc comments](https://jsdoc.app/).  Here's the [WeakFunctionMultiMap configuration file](source/exports/WeakFunctionMultiMap.mjs):

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

Currently supported (version 0.1.1):
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

In the future:
- Declaring key groups
  - Key groups can be equal: `[arg1, arg2] === [arg3, arg4]` for the purpose of this collection
- One-to-one hash tables with two-part keys:  `(arg1, "green") === (arg2, "green")` if the collection allows marking `arg1` equal to `arg2`, and the user actually does so
- Using [WeakRef](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef) and [FinalizationRegistry](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry) to reduce the number of WeakMaps
- Eliminating redundant use of KeyHasher, WeakKeyComposer when there's only one map key and/or one set key

## How It All Works

1. The user writes a [CollectionConfiguration](source/CollectionConfiguration.mjs) instance, using several methods:
  - `setFileOverview()` to set a top-level file overview
  - `importLines()` to specify top-level module imports
  - `addMapKey()` to specify ordered keys for maps
  - `addSetKey()` to specify ordered keys for sets
  - `setValueType()` for maps, to specify the type of the value to store
  - `lock()` (optional) to lock the configuration.
2. The [`templates/Strong`](templates/Strong) and [`templates/Weak`](templates/Weak) directories hold template JavaScript files in [JavaScript template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), enclosed in functions taking a `defines` Map argument and a `docs` "JSDocGenerator" argument.
1. For strongly held keys, the [`CodeGenerator`](source/CodeGenerator.mjs) module writes an import for a [`KeyHasher`](source/exports/keys/Hasher.mjs) module, which the [`Driver`](source/Driver.mjs) module copies into the destination directory.
1. For weakly held keys (and strongly held keys associated with them), the `CodeGenerator` module writes an import for a [`WeakKeyComposer`](exports/keys/Composite.mjs) module.  The Driver module copies this module into the destination directory.
1. The `CodeGenerator` uses the configuration and fills a [`JSDocGenerator`](source/JSDocGenerator.mjs) instance with the necessary fields to format JSDoc comments for the code it will generate.
1. The `CodeGenerator` combines the template, the configuration and the `JSDocGenerator` into a [JavaScript module file](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) ready for either web browsers or [NodeJS](https://www.nodejs.org) applications to use.

