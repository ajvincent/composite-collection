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

The *composite-collection* package provides several pre-defined two-key collection classes for your use:

- [composite-collection/StrongStrongMap](exports/StrongStrongMap.mjs)
- [composite-collection/StrongStrongSet](exports/StrongStrongSet.mjs)
- [composite-collection/WeakWeakMap](exports/WeakWeakMap.mjs)
- [composite-collection/WeakStrongMap](exports/WeakStrongMap.mjs)
- [composite-collection/WeakWeakSet](exports/WeakWeakSet.mjs)
- [composite-collection/WeakStrongSet](exports/WeakStrongSet.mjs)
- [composite-collection/StrongMapOfStrongSets](exports/StrongMapOfStrongSets.mjs)
- [composite-collection/WeakMapOfStrongSets](exports/WeakMapOfStrongSets.mjs)
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
import CompileTimeOptions from "composite-collection/CompileTimeOptions";
import path from "path";

const options = new CompileTimeOptions({
  licenseText: "// insert your license text here, commented out",
  license: "short-license-string for JSDoc",
  author: "author name <author e-mail>",
  copyright: "© copyright string",
});

const driver = new CompositeDriver(
  path.join(process.cwd(), "configurations"),
  path.join(process.cwd(), "collections"),
  options
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

const key3 = {}, callback3 = function() {};
wfMM.add(key3, callback3);

wfMM.forEachSet(key1, callback => callback());
/*
This executes callback1() and callback2(), in that order, but not callback3().
*/
```

The [CompileTimeOptions](source/CompileTimeOptions.mjs) modify the generated output to include metadata such as the license, author and copyright.

## Definitions

A composite collection is a class to implement two- or three-key maps and sets.  (Or any number of keys you need.)  If you only need one key, this technically is not a composite collection, but this library still supports this use-case for key and value validation.  The ordering of keys is significant:

```javascript
compositeWeakWeakSet.add(key1, key2, value);

compositeWeakWeakSet.has(key2, key1); // returns false
compositeWeakWeakSet.has(key1, key2); // returns true

// The user must provide both keys the collection requires, in the right order.
compositeWeakWeakSet.has(key1); // return false
compositeWeakWeakSet.has(key2); // return false
```

### Strong and weak references

By a "strong" key, I mean the collection holds a strong reference to the argument.  This means that unless the user explicitly deletes the key in the collection,
or the collection itself is inaccessible, the argument will remain held in memory.

By a "weak" key, I mean the collection does not hold a strong reference to the argument.  Any such arguments are unreachable by JavaScript code, if there are no
other variables or objects holding a reference to them.  The JavaScript engine may delete unreachable and any objects they alone reference at any time.

The developer.mozilla.org website has [a great explainer about weak and strong references](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap#why_weakmap).

### "Maps of sets", or, sets you can search

A "map of sets" is a special set data structure.  Think of the map keys as the terms you search for, and the set keys as the values you store.  When you use a method like `.forEachSet()` or `.valuesSet()`, the collection will iterate only over the elements matching the map keys you've provided.  There are other methods for manipulating these subsets:

- `.addSets(_mapKeys_, [ _setKeys1_, _setKeys2_, ...]);`
- `.deleteSets(_mapKeys_)`
- `.getSizeOfSet(_mapKeys_)`

Currently, this module supports strong maps of strong sets, and weak maps of strong sets.  

Maps of weak sets don't make sense right now:  they turn into glorified composite sets, providing only a little functionality you can replicate via subclassing in exchange for greater internal complexity (and probable memory leaks).

## Guidelines for using this package

I suggest the following practices for developers using this package to follow.

- If you want one or two or even three of this package's exported collection modules, copy and paste the modules into your project as-is.  They already have license boilerplate and JSDoc specifying the copyright and author information.
  - Don't forget to copy the `exports/keys` directory to your destination as well!  Almost all the collection modules depend on the files in there.
- If you are developing more complex collections, `npm install --save-dev composite-collection` as a development dependency.
  - Maintain a "configurations" subdirectory that has only `CollectionConfiguration` export modules in it.
  - Maintain a "collections" subdirectory to receive the modules which *composite-collection* generates.  Feel free to import modules from this subdirectory and use them, but do not edit them.
  - Invoke the Driver only when you need to rebuild the modules in your collections subdirectory.  Sure, it's really fast at generating modules, but why add extra build steps?  The collections themselves should be fairly stable.
- Consider using [rollup.js](https://rollupjs.org/guide/en/) to bundle files from the collections subdirectory into another subdirectory you import from, particularly if you only use one composite collection.
  - Use `--format=es` to preserve the ECMAScript Modules output.
- Feel free to file GitHub issues for support!

## Features

Currently supported (version 1.0.0):

- ECMAScript class modules with all the pieces you need
- A simple configuration API
- Generating code and matching JSDoc comments
  - Comprehensive API in each collection for setting, getting and iterating over entries
  - Support for [@license](https://jsdoc.app/tags-license.html), [@author](https://jsdoc.app/tags-author.html), and [@copyright](https://jsdoc.app/tags-copyright.html) tags via [composite-collection/CompileTimeOptions](source/CompileTimeOptions.mjs)
  - Inserting license boilerplate at the top via the `.licenseText` property of CompileTimeOptions
- Support for multiple weak keys, multiple strong keys
- Argument validation
  - Including user modules for types
- Maps, Sets and Maps of Sets available
- Weak keys subject to garbage collection
- Pre-compiled collections available as exports
- [Private class fields and methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)
- Using [WeakRef](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef) and [FinalizationRegistry](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry) to reduce the number of WeakMaps
- One-to-one hash tables with two-part keys:  `("red", redObj) <-> ("blue", blueObj)`
- Eliminating redundant use of KeyHasher, WeakKeyComposer when there's only one map key and/or one set key

In the future:

- Declaring key groups
  - Key groups can be equal: `(arg1, arg2) === (arg3, arg4)` for the purpose of this collection
- Configuring to support unsorted key collections: `(arg1, arg2) === (arg2, arg1)` for the purposes of a specific composite collection

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

## Collection Configuration API: How To Create A Collection

- `new CollectionConfiguration(className, outerType, innerType);`
  - `className` is the exported class's name, a valid identifier.
  - `outerType` is:
    - "Map" for strong maps
    - "WeakMap" for weak maps
    - "Set" for strong sets
    - "WeakSet" for weak sets
  - `innerType` is:
    - "Set" for maps of strong sets
    - "WeakSet" for weak maps of weak sets
    - Maps of weak sets are illegal because it's unclear when we would hold references to the strong map keys.
- `setFileOverview(overview);` to set a top-level file overview
- `importLines(blockOfTest);` to specify top-level module imports
- `addMapKey(argumentName, description, holdWeak, options);` to specify keys in order (one at a time)
  - `argumentName` is the name of the argument, a valid identifier.
  - `description` is the description of the argument for JSDoc.
  - `holdWeak` is true if the key represents a weakly held key, false for a strongly held key.
  - `options` is an object taking optional properties:
    - `argumentType` is a JSDoc-printable type for the argument.
    - `argumentValidator` is a lambda function with one argument, the same as argumentName, to validate the argument value in the class's methods.  
    - The validator *must not throw*, and only return false when the validation for that argument fails.  It must not do - or *return* - anything else.
    - The CodeGenerator will combine all the argument validators into a single "isValidKey" function.
- `addSetKey(argumentName, description, holdWeak, options);` to specify ordered keys for sets
  - The arguments for `addSetKey` are the same as for `addMapKey`.
- `setValueType(type, description, validator);` for maps, to specify the type of the value to store.
  - `type` is the type to provide to JSDoc.
  - `description` is the description to provide to JSDoc.
  - `validator` is an optional lambda function with one argument, `value`, to validate the value in the class's methods.
- `lock();` to lock the configuration.
- `export default` the configuration.

One-to-one hashtables go through an additional set of steps.

- `const baseConfig = new CollectionConfiguration(className, "WeakMap");`.
  - Fill this out as you normally would, with one weak key argument specifically reserved for the hashtable.
  - Call `baseConfig.lock();`.
  - You may import this configuration module instead of defining it inline if you wish.
  - Do not export this configuration.
- `const hashTableConfig = new CollectionConfiguration(className, "OneToOne");` for the hashtable.
- `hashTableConfig.configureOneToOne(baseConfig, privateKeyName, options);`
  - `baseConfig` in exactly three cases may be a string, but all three cases have existing exports:
    - "WeakMap" to indicate a value-only hashtable.  See [composite-collection/OneToOneSimpleMap](exports/OneToOneSimpleMap.mjs).
    - "composite-collection/WeakStrongMap" to indicate a strong-key hashtable.  See [composite-collection/OneToOneStrongMap](exports/OneToOneStrongMap.mjs).
    - "composite-collection/WeakWeakMap" to indicate a weak-key hashtable.  See [composite-collection/OneToOneWeakMap](exports/OneToOneWeakMap.mjs).
    - Anything more complex (argument validation, value validation, more than one key, etc.) requires a custom base configuration.
  - `privateKeyName` is the reserved weak key argument.
  - `options` is an object taking optional properties:
    - `pathToBaseModule` is a module path to the base configuration module, for the generated code to import.  This allows you to keep the base configuration in another file for the `Driver` to generate sepearately in the same directory.
- `lock();` to lock the hashtable configuration.
- `export default` the hashtable configuration.

## How It All Works

1. The user writes a [CollectionConfiguration](source/CollectionConfiguration.mjs) instance as I document above.
2. The [`templates`](templates) directory holds template JavaScript files in [JavaScript template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), enclosed in functions taking a `defines` Map argument and at least one `docs` "JSDocGenerator" argument.
3. For strongly held keys, the template specifies a [`KeyHasher`](source/exports/keys/Hasher.mjs) module to import, which the [`Driver`](source/Driver.mjs) module copies into the destination directory.  The `KeyHasher` holds weak references to objects, and returns a string hash for the module's use.
4. For weakly held keys (and strongly held keys associated with them), the template specifies a [`WeakKeyComposer`](exports/keys/Composite.mjs) module to import.  The `Driver` module copies this module into the destination directory.  The `WeakKeyComposer` holds the weak and strong references as the collection specified.  It returns vanilla objects (`WeakKey` objects) for the module's use.
5. The `CodeGenerator` uses the configuration and fills a [`JSDocGenerator`](source/JSDocGenerator.mjs) instance with the necessary fields to format JSDoc comments for the code it will generate.
6. The `CodeGenerator` combines the template, the configuration and the `JSDocGenerator` into a [JavaScript module file](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) ready for either web browsers or [NodeJS](https://www.nodejs.org) applications to use.  The module will store `WeakKey` objects in a private WeakMap, and hashes in a private Map.  The module will `export default` the final collection class.
