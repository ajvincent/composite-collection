# composite-collection: Generic Subclass support

This subdirectory will hold templates for subclassing [generic classes](https://www.typescriptlang.org/docs/handbook/2/classes.html#generic-classes).  Ideally, I'll move specific types and argument validation here.  It would also be a good place for sorting and reducing arguments, if I still find a need to do so.

The goal of this subproject is to keep the same `CollectionConfiguration` class, but provide a different `Driver` with the same API.
