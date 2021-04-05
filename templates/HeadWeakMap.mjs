/** @module templates/HeadWeakMap.mjs */

/* This module is generated code.  Don't bother editing it.
   If you have problems, you should edit __source__.
*/

void("__fileOverview__");

void("__importedNames__");

import KeyHasher from "./KeyHasher.mjs";

export default class __CLASSNAME__ {
  constructor() {
    this.__root__ = new __firstMapType__;
    this.__keyHasher__ = new KeyHasher(__argListAsStrings__);

    this.__knownHashes__ = new Set();
  }

  delete(__argList__) {
    const hash = this.__keyHasher__.buildHash(...arguments);
    if (!this.__knownHashes__.has(hash))
      return false;

    this.__iterateArguments__(__argList__);
    void("__stepsToDelete__");
  }

  get(__argList__) {
    this.__validateArguments__(__argList__);
    this.__iterateArguments__(__argList__);
    void("__stepsToGet__");
  }

  has(...args) {
    return this.__knownHashes__.has(this.__keyHasher__.buildHash(...args));
  }

  set(__argList__, __value__) {
    this.__validateArguments__(__argList__);
    this.__validateValue__(__value__);
    this.__iterateArguments__(__argList__, true);
    void("__stepsToSet__");

    const hash = this.__keyHasher__.buildHash(...arguments);
    this.__knownHashes__.add(hash);
    return this;
  }

  __validateArguments__(__argName__) {
    void("__argumentsFilter__");
  }

  __validateValue__(__value__) {
    void("__valueFilter__");
  }
}
