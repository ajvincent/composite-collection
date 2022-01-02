# Linking Keys Design

To make key groups (`(arg1, arg2) === (arg3, arg4)`) possible, there must be a set of rules for users to follow.  This document is to explain how the linking of keys works, and what the rules are.

## The configuration method: defineKeyLinker()

CollectionConfiguration's `.defineKeyLinker()` method takes at least four arguments:

- The linker's method name, which must be:
  - A string which hasn't been used in `.defineKeyLinker()` before as a method name
  - At least five characters long
  - Starts with "link"
- A replacement argument name.
- The argument names to replace (must be at least two).

A simple argument:

```javascript
configuration.defineKeyLinker("linkTwoArgs", "args1And2", "firstKey", "secondKey");
```

This will output a method:

```javascript
  linkTwoArgs(firstKey1, secondKey1, firstKey2, secondKey2) {
    // ...
  }
```

A more complex argument:

```javascript
configuration.defineKeyLinker("linkTwoArgs", "keys1And2", "firstKey", "secondKey");
configuration.defineKeyLinker("linkThreeArgs", "allArgs", "keys1And2", "thirdKey");
```

This will output:

```javascript
  linkTwoArgs(firstKey1, secondKey1, firstKey2, secondKey2) {
    // ...
  }

  linkThreeArgs(firstKey, secondKey, thirdKey1, thirdKey2) {
    // ...
  }
```

For those familiar with computer language design, think of this in terms of a [context-free grammar](https://en.wikipedia.org/wiki/Context-free_grammar).  The replacement argument is to replace multiple keys with one key.

## The rules

### All key names must be complete when you start defining key linkers

This is for consistency.  The CodeGenerator will rearrange key arguments to populate KeyHasher's and WeakKeyComposer's, then create a bootstrap class to combine all remaining keys.

Invalid:

```javascript
configuration.addMapKey("shared1");
configuration.addMapKey("shared2");
configuration.defineKeyLinker("linkShared", "shared1And2", "shared1", "shared2");
configuration.addMapKey("unique"); // throws an exception
```

Valid:

```javascript
configuration.addMapKey("shared1");
configuration.addMapKey("shared2");
configuration.addMapKey("unique");
configuration.defineKeyLinker("linkShared", "shared1And2", "shared1", "shared2");
```

### For maps, you cannot define a key linker after calling `.setValueType()`

This is also for consistency.  The `.setValueType()` call is to specify restrictions on the value, which should come after all key handling is complete.

Invalid:

```javascript
configuration.addMapKey("shared1");
configuration.addMapKey("shared2");
configuration.setValueType("object", "The object to store.", value => Object(value) === value);
configuration.defineKeyLinker("linkShared", "shared1And2", "shared1", "shared2"); // throws an exception
```

Valid:

```javascript
configuration.addMapKey("shared1");
configuration.addMapKey("shared2");
configuration.defineKeyLinker("linkShared", "shared1And2", "shared1", "shared2");
configuration.setValueType("object", "The object to store.", value => Object(value) === value);
```

### No mixing of map and set keys

Mixing map keys and set keys leads to a map of sets.  This is meaningless in the sense of keys for a map or a set.

Invalid:

```javascript
configuration.addMapKey("shared1");
configuration.addSetKey("shared2");
configuration.defineKeyLinker("linkShared", "shared1And2", "shared1", "shared2"); // throws an exception
```

### The array of key names must only contain known keys

Introducing an unknown key is just asking for trouble.

Invalid:

```javascript
configuration.addMapKey("shared1");
configuration.addMapKey("shared2");
configuration.defineKeyLinker("linkShared", "shared1And2", "shared1", "unique"); // throws an exception
```

### No reusing of key names

Every key must have at most one linker.  If two or more linkers exist for the same key, then the code generator must have a way to resolve multiple replacement keys.  This is probably not "context-free" in the parlance of languages, and so is prohibited.

Illegal:

```javascript
configuration.addMapKey("shared1");
configuration.addMapKey("shared2");
configuration.addMapKey("shared3");
configuration.defineKeyLinker("linkShared12", "shared1And2", "shared1", "shared2");
configuration.defineKeyLinker("linkShared23", "shared2And3", "shared2", "shared3"); // throws an exception
```

### The key linker's method name must follow the naming convention

This is to prevent conflicts in both the key composers and the composite collections.  None of the templates include a method whose name starts with the letters "link".  So the configuration reserves those names for this purpose.
