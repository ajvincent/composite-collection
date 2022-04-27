/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    let invokeValidate = "";
    if (defines.invokeValidate) {
        invokeValidate = `\n    this.#requireValidKey(${defines.argList});\n`;
    }
    return `
${defines.importLines}
import KeyHasher from "./keys/Hasher.mjs";

class ${defines.className} {
  /** @typedef {string} hash */

  ${docs.buildBlock("rootContainerSet", 4)}
  #root = new Map;

  /** @type {KeyHasher} @constant */
  #hasher = new KeyHasher();

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.add(...entry);
      }
    }
  }

${docs.buildBlock("getSize", 2)}
  get size() {
    return this.#root.size;
  }

${docs.buildBlock("add", 2)}
  add(${defines.argList}) {${invokeValidate}
    const __hash__ = this.#hasher.getHash(${defines.argList});
    this.#root.set(__hash__, Object.freeze([${defines.argList}]));
    return this;
  }

${docs.buildBlock("clear", 2)}
  clear() {
    this.#root.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.argList}) {
    const __hash__ = this.#hasher.getHashIfExists(${defines.argList});
    return __hash__ ? this.#root.delete(__hash__) : false;
  }

${docs.buildBlock("forEachSet", 2)}
  forEach(__callback__, __thisArg__) {
    this.#root.forEach(valueSet => {
      __callback__.apply(__thisArg__, valueSet.concat(this));
    });
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("has", 2)}
  has(${defines.argList}) {
    const __hash__ = this.#hasher.getHashIfExists(${defines.argList});
    return __hash__ ? this.#root.has(__hash__) : false;
  }

${defines.validateArguments ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.argList}) {
    return this.#isValidKey(${defines.argList});
  }
` : ``}

${docs.buildBlock("values", 2)}
  * values() {
    for (let __value__ of this.#root.values())
      yield __value__;
  }
${defines.invokeValidate ?
        `
  ${docs.buildBlock("requireValidKey", 2)}
    #requireValidKey(${defines.argList}) {
      if (!this.#isValidKey(${defines.argList}))
        throw new Error("The ordered key set is not valid!");
    }

  ${docs.buildBlock("isValidKeyPrivate", 2)}
    #isValidKey(${defines.argList}) {
  ${defines.validateArguments}
      return true;
    }
` : ``}

  [Symbol.iterator]() {
    return this.values();
  }

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0LmluLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlNldC5pbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxHQUFxQixTQUFTLFVBQVUsQ0FBQyxPQUF3QixFQUFFLElBQW9CO0lBQ3JHLElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQztJQUN4QixJQUFJLE9BQU8sQ0FBQyxjQUFjLEVBQUU7UUFDMUIsY0FBYyxHQUFHLCtCQUErQixPQUFPLENBQUMsT0FBTyxNQUFNLENBQUM7S0FDdkU7SUFFRCxPQUFPO0VBQ1AsT0FBTyxDQUFDLFdBQVc7OztRQUdiLE9BQU8sQ0FBQyxTQUFTOzs7SUFHckIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7OztFQWV4QyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7Ozs7O0VBSzdCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsT0FBTyxNQUFNLGNBQWM7NENBQ0MsT0FBTyxDQUFDLE9BQU87OENBQ2IsT0FBTyxDQUFDLE9BQU87Ozs7RUFJM0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDOzs7OztFQUszQixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7V0FDbkIsT0FBTyxDQUFDLE9BQU87b0RBQzBCLE9BQU8sQ0FBQyxPQUFPOzs7O0VBSWpFLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQzs7Ozs7OztFQU9oQyxJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQzs7RUFFeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ25CLE9BQU8sQ0FBQyxPQUFPO29EQUM2QixPQUFPLENBQUMsT0FBTzs7OztFQUlqRSxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO0VBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO2VBQ3pCLE9BQU8sQ0FBQyxPQUFPOzhCQUNBLE9BQU8sQ0FBQyxPQUFPOztDQUU1QyxDQUFDLENBQUMsQ0FBQyxFQUFFOztFQUVKLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzs7Ozs7RUFLNUIsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3hCO0lBQ0UsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7dUJBQ2xCLE9BQU8sQ0FBQyxPQUFPOzhCQUNSLE9BQU8sQ0FBQyxPQUFPOzs7O0lBSXpDLElBQUksQ0FBQyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO2tCQUN6QixPQUFPLENBQUMsT0FBTztJQUM3QixPQUFPLENBQUMsaUJBQWlCOzs7Q0FHNUIsQ0FBQyxDQUFDLENBQUMsRUFBRTs7Ozs7OzRCQU1zQixPQUFPLENBQUMsU0FBUzs7O2dCQUc3QixPQUFPLENBQUMsU0FBUztnQkFDakIsT0FBTyxDQUFDLFNBQVM7Q0FDaEMsQ0FBQztBQUNGLENBQUMsQ0FBQTtBQUVELGVBQWUsVUFBVSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBSZWFkb25seURlZmluZXMsIEpTRG9jR2VuZXJhdG9yLCBUZW1wbGF0ZUZ1bmN0aW9uIH0gZnJvbSBcIi4uL3NoYXJlZFR5cGVzLm1qc1wiO1xuXG4vKipcbiAqIEBwYXJhbSB7TWFwfSAgICAgICAgICAgIGRlZmluZXMgVGhlIHByZXByb2Nlc3NvciBtYWNyb3MuXG4gKiBAcGFyYW0ge0pTRG9jR2VuZXJhdG9yfSBkb2NzICAgIFRoZSBwcmltYXJ5IGRvY3VtZW50YXRpb24gZ2VuZXJhdG9yLlxuICogQHJldHVybnMge3N0cmluZ30gICAgICAgICAgICAgICBUaGUgZ2VuZXJhdGVkIHNvdXJjZSBjb2RlLlxuICovXG5jb25zdCBwcmVwcm9jZXNzOiBUZW1wbGF0ZUZ1bmN0aW9uID0gZnVuY3Rpb24gcHJlcHJvY2VzcyhkZWZpbmVzOiBSZWFkb25seURlZmluZXMsIGRvY3M6IEpTRG9jR2VuZXJhdG9yKSB7XG4gIGxldCBpbnZva2VWYWxpZGF0ZSA9IFwiXCI7XG4gIGlmIChkZWZpbmVzLmludm9rZVZhbGlkYXRlKSB7XG4gICAgaW52b2tlVmFsaWRhdGUgPSBgXFxuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuYXJnTGlzdH0pO1xcbmA7XG4gIH1cblxuICByZXR1cm4gYFxuJHtkZWZpbmVzLmltcG9ydExpbmVzfVxuaW1wb3J0IEtleUhhc2hlciBmcm9tIFwiLi9rZXlzL0hhc2hlci5tanNcIjtcblxuY2xhc3MgJHtkZWZpbmVzLmNsYXNzTmFtZX0ge1xuICAvKiogQHR5cGVkZWYge3N0cmluZ30gaGFzaCAqL1xuXG4gICR7ZG9jcy5idWlsZEJsb2NrKFwicm9vdENvbnRhaW5lclNldFwiLCA0KX1cbiAgI3Jvb3QgPSBuZXcgTWFwO1xuXG4gIC8qKiBAdHlwZSB7S2V5SGFzaGVyfSBAY29uc3RhbnQgKi9cbiAgI2hhc2hlciA9IG5ldyBLZXlIYXNoZXIoKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGl0ZXJhYmxlID0gYXJndW1lbnRzWzBdO1xuICAgICAgZm9yIChsZXQgZW50cnkgb2YgaXRlcmFibGUpIHtcbiAgICAgICAgdGhpcy5hZGQoLi4uZW50cnkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImdldFNpemVcIiwgMil9XG4gIGdldCBzaXplKCkge1xuICAgIHJldHVybiB0aGlzLiNyb290LnNpemU7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJhZGRcIiwgMil9XG4gIGFkZCgke2RlZmluZXMuYXJnTGlzdH0pIHske2ludm9rZVZhbGlkYXRlfVxuICAgIGNvbnN0IF9faGFzaF9fID0gdGhpcy4jaGFzaGVyLmdldEhhc2goJHtkZWZpbmVzLmFyZ0xpc3R9KTtcbiAgICB0aGlzLiNyb290LnNldChfX2hhc2hfXywgT2JqZWN0LmZyZWV6ZShbJHtkZWZpbmVzLmFyZ0xpc3R9XSkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiY2xlYXJcIiwgMil9XG4gIGNsZWFyKCkge1xuICAgIHRoaXMuI3Jvb3QuY2xlYXIoKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImRlbGV0ZVwiLCAyKX1cbiAgZGVsZXRlKCR7ZGVmaW5lcy5hcmdMaXN0fSkge1xuICAgIGNvbnN0IF9faGFzaF9fID0gdGhpcy4jaGFzaGVyLmdldEhhc2hJZkV4aXN0cygke2RlZmluZXMuYXJnTGlzdH0pO1xuICAgIHJldHVybiBfX2hhc2hfXyA/IHRoaXMuI3Jvb3QuZGVsZXRlKF9faGFzaF9fKSA6IGZhbHNlO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZm9yRWFjaFNldFwiLCAyKX1cbiAgZm9yRWFjaChfX2NhbGxiYWNrX18sIF9fdGhpc0FyZ19fKSB7XG4gICAgdGhpcy4jcm9vdC5mb3JFYWNoKHZhbHVlU2V0ID0+IHtcbiAgICAgIF9fY2FsbGJhY2tfXy5hcHBseShfX3RoaXNBcmdfXywgdmFsdWVTZXQuY29uY2F0KHRoaXMpKTtcbiAgICB9KTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImZvckVhY2hDYWxsYmFja1NldFwiLCAyKX1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJoYXNcIiwgMil9XG4gIGhhcygke2RlZmluZXMuYXJnTGlzdH0pIHtcbiAgICBjb25zdCBfX2hhc2hfXyA9IHRoaXMuI2hhc2hlci5nZXRIYXNoSWZFeGlzdHMoJHtkZWZpbmVzLmFyZ0xpc3R9KTtcbiAgICByZXR1cm4gX19oYXNoX18gPyB0aGlzLiNyb290LmhhcyhfX2hhc2hfXykgOiBmYWxzZTtcbiAgfVxuXG4ke2RlZmluZXMudmFsaWRhdGVBcmd1bWVudHMgPyBgXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRLZXlQdWJsaWNcIiwgMil9XG4gIGlzVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KSB7XG4gICAgcmV0dXJuIHRoaXMuI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KTtcbiAgfVxuYCA6IGBgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcInZhbHVlc1wiLCAyKX1cbiAgKiB2YWx1ZXMoKSB7XG4gICAgZm9yIChsZXQgX192YWx1ZV9fIG9mIHRoaXMuI3Jvb3QudmFsdWVzKCkpXG4gICAgICB5aWVsZCBfX3ZhbHVlX187XG4gIH1cbiR7ZGVmaW5lcy5pbnZva2VWYWxpZGF0ZSA/XG4gIGBcbiAgJHtkb2NzLmJ1aWxkQmxvY2soXCJyZXF1aXJlVmFsaWRLZXlcIiwgMil9XG4gICAgI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuYXJnTGlzdH0pIHtcbiAgICAgIGlmICghdGhpcy4jaXNWYWxpZEtleSgke2RlZmluZXMuYXJnTGlzdH0pKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgb3JkZXJlZCBrZXkgc2V0IGlzIG5vdCB2YWxpZCFcIik7XG4gICAgfVxuXG4gICR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZEtleVByaXZhdGVcIiwgMil9XG4gICAgI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KSB7XG4gICR7ZGVmaW5lcy52YWxpZGF0ZUFyZ3VtZW50c31cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbmAgOiBgYH1cblxuICBbU3ltYm9sLml0ZXJhdG9yXSgpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZXMoKTtcbiAgfVxuXG4gIFtTeW1ib2wudG9TdHJpbmdUYWddID0gXCIke2RlZmluZXMuY2xhc3NOYW1lfVwiO1xufVxuXG5PYmplY3QuZnJlZXplKCR7ZGVmaW5lcy5jbGFzc05hbWV9KTtcbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmNsYXNzTmFtZX0ucHJvdG90eXBlKTtcbmA7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHByZXByb2Nlc3M7XG4iXX0=