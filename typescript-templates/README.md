# composite-collection TypeScript support

This subproject is all about generating TypeScript modules (.mts file extension) you can use in your own projects.  You may be thinking, "why? JavaScript modules are TypeScript modules."  The answer is [generic TypeScript classes](https://www.typescriptlang.org/docs/handbook/2/classes.html#generic-classes).  These let us reuse the same base classes, and define specific types for them.

The goal of this subproject is to keep the same `CollectionConfiguration` class, but provide a different `Driver` with the same API to generate TypeScript code.
