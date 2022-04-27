/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    return `
${defines.importLines}
import WeakKeyComposer from "./keys/Composite.mjs";

class ${defines.className} {
  // eslint-disable-next-line jsdoc/require-property
  /** @typedef {object} WeakKey */

  /** @type {WeakKeyComposer} @constant */
  #keyComposer = new WeakKeyComposer(${JSON.stringify(defines.weakMapKeys)}, ${JSON.stringify(defines.strongMapKeys)});

  ${docs.buildBlock("rootContainerWeakMap", 4)}
  #root = new WeakMap;

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.set(...entry);
      }
    }
  }


${docs.buildBlock("delete", 2)}
  delete(${defines.argList}) {
    this.#requireValidKey(${defines.argList});
    const __key__ = this.#keyComposer.getKeyIfExists([${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]);
    if (!__key__)
      return false;

    this.#keyComposer.deleteKey([${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]);
    return this.#root.delete(__key__);
  }

${docs.buildBlock("get", 2)}
  get(${defines.argList}) {
    this.#requireValidKey(${defines.argList});
    const __key__ = this.#keyComposer.getKeyIfExists([${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]);
    return __key__ ? this.#root.get(__key__) : undefined;
  }

${docs.buildBlock("has", 2)}
  has(${defines.argList}) {
    this.#requireValidKey(${defines.argList});

    const __key__ = this.#keyComposer.getKeyIfExists([${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]);
    return __key__ ? this.#root.has(__key__) : false;
  }


${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.argList}) {
    return this.#isValidKey(${defines.argList});
  }

${defines.validateValue ? `
${docs.buildBlock("isValidValuePublic", 2)}
  isValidValue(value) {
    return this.#isValidValue(value);
  }
  ` : ``}

${docs.buildBlock("set", 2)}
  set(${defines.argList}, value) {
    this.#requireValidKey(${defines.argList});
    ${defines.validateValue ? `
      if (!this.#isValidValue(value))
        throw new Error("The value is not valid!");
    ` : ``}

    const __key__ = this.#keyComposer.getKey([${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]);
    this.#root.set(__key__, value);
    return this;
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.argList}) {
    if (!this.#isValidKey(${defines.argList}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.argList}) {
    if (!this.#keyComposer.isValidForKey([${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]))
      return false;

${defines.validateArguments || ""}
    return true;
  }

${defines.validateValue ? `
${docs.buildBlock("isValidValuePrivate", 2)}
  #isValidValue(value) {
    ${defines.validateValue}
    return true;
  }
  ` : ``}

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFwLmluLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1hcC5pbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxHQUFxQixTQUFTLFVBQVUsQ0FBQyxPQUF3QixFQUFFLElBQW9CO0lBQ3JHLE9BQU87RUFDUCxPQUFPLENBQUMsV0FBVzs7O1FBR2IsT0FBTyxDQUFDLFNBQVM7Ozs7O3VDQU1yQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQ3BDLEtBQ0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUN0Qzs7SUFFRSxJQUFJLENBQUMsVUFBVSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7OztFQWE1QyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7V0FDbkIsT0FBTyxDQUFDLE9BQU87NEJBQ0UsT0FBTyxDQUFDLE9BQU87d0RBRXJDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FDL0IsT0FDRSxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQ2pDOzs7O21DQUtFLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FDL0IsT0FDRSxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQ2pDOzs7O0VBSUYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ25CLE9BQU8sQ0FBQyxPQUFPOzRCQUNLLE9BQU8sQ0FBQyxPQUFPO3dEQUVyQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQy9CLE9BQ0UsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUNqQzs7OztFQUlGLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsT0FBTzs0QkFDSyxPQUFPLENBQUMsT0FBTzs7d0RBR3JDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FDL0IsT0FDRSxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQ2pDOzs7OztFQUtGLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO2VBQ3pCLE9BQU8sQ0FBQyxPQUFPOzhCQUNBLE9BQU8sQ0FBQyxPQUFPOzs7RUFJM0MsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7RUFDeEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7Ozs7R0FJdkMsQ0FBQyxDQUFDLENBQUMsRUFDTjs7RUFFRSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDbkIsT0FBTyxDQUFDLE9BQU87NEJBQ0ssT0FBTyxDQUFDLE9BQU87TUFFckMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7OztLQUd6QixDQUFDLENBQUMsQ0FBQyxFQUNKOztnREFHRSxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQy9CLE9BQ0UsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUNqQzs7Ozs7RUFLRixJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztxQkFDbEIsT0FBTyxDQUFDLE9BQU87NEJBQ1IsT0FBTyxDQUFDLE9BQU87Ozs7RUFJekMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7Z0JBQ3pCLE9BQU8sQ0FBQyxPQUFPOzRDQUV6QixPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQy9CLE9BQ0UsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUNqQzs7O0VBR0YsT0FBTyxDQUFDLGlCQUFpQixJQUFJLEVBQUU7Ozs7RUFJL0IsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7RUFDeEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7O01BRXJDLE9BQU8sQ0FBQyxhQUFhOzs7R0FHeEIsQ0FBQyxDQUFDLENBQUMsRUFBRTs7NEJBRW9CLE9BQU8sQ0FBQyxTQUFTOzs7Z0JBRzdCLE9BQU8sQ0FBQyxTQUFTO2dCQUNqQixPQUFPLENBQUMsU0FBUztDQUNoQyxDQUFBO0FBQ0QsQ0FBQyxDQUFBO0FBRUQsZUFBZSxVQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFJlYWRvbmx5RGVmaW5lcywgSlNEb2NHZW5lcmF0b3IsIFRlbXBsYXRlRnVuY3Rpb24gfSBmcm9tIFwiLi4vc2hhcmVkVHlwZXMubWpzXCI7XG5cbi8qKlxuICogQHBhcmFtIHtNYXB9ICAgICAgICAgICAgZGVmaW5lcyBUaGUgcHJlcHJvY2Vzc29yIG1hY3Jvcy5cbiAqIEBwYXJhbSB7SlNEb2NHZW5lcmF0b3J9IGRvY3MgICAgVGhlIHByaW1hcnkgZG9jdW1lbnRhdGlvbiBnZW5lcmF0b3IuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSAgICAgICAgICAgICAgIFRoZSBnZW5lcmF0ZWQgc291cmNlIGNvZGUuXG4gKi9cbmNvbnN0IHByZXByb2Nlc3M6IFRlbXBsYXRlRnVuY3Rpb24gPSBmdW5jdGlvbiBwcmVwcm9jZXNzKGRlZmluZXM6IFJlYWRvbmx5RGVmaW5lcywgZG9jczogSlNEb2NHZW5lcmF0b3IpIHtcbiAgcmV0dXJuIGBcbiR7ZGVmaW5lcy5pbXBvcnRMaW5lc31cbmltcG9ydCBXZWFrS2V5Q29tcG9zZXIgZnJvbSBcIi4va2V5cy9Db21wb3NpdGUubWpzXCI7XG5cbmNsYXNzICR7ZGVmaW5lcy5jbGFzc05hbWV9IHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGpzZG9jL3JlcXVpcmUtcHJvcGVydHlcbiAgLyoqIEB0eXBlZGVmIHtvYmplY3R9IFdlYWtLZXkgKi9cblxuICAvKiogQHR5cGUge1dlYWtLZXlDb21wb3Nlcn0gQGNvbnN0YW50ICovXG4gICNrZXlDb21wb3NlciA9IG5ldyBXZWFrS2V5Q29tcG9zZXIoJHtcbiAgICBKU09OLnN0cmluZ2lmeShkZWZpbmVzLndlYWtNYXBLZXlzKVxuICB9LCAke1xuICAgIEpTT04uc3RyaW5naWZ5KGRlZmluZXMuc3Ryb25nTWFwS2V5cylcbiAgfSk7XG5cbiAgJHtkb2NzLmJ1aWxkQmxvY2soXCJyb290Q29udGFpbmVyV2Vha01hcFwiLCA0KX1cbiAgI3Jvb3QgPSBuZXcgV2Vha01hcDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGl0ZXJhYmxlID0gYXJndW1lbnRzWzBdO1xuICAgICAgZm9yIChsZXQgZW50cnkgb2YgaXRlcmFibGUpIHtcbiAgICAgICAgdGhpcy5zZXQoLi4uZW50cnkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZGVsZXRlXCIsIDIpfVxuICBkZWxldGUoJHtkZWZpbmVzLmFyZ0xpc3R9KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5hcmdMaXN0fSk7XG4gICAgY29uc3QgX19rZXlfXyA9IHRoaXMuI2tleUNvbXBvc2VyLmdldEtleUlmRXhpc3RzKFske1xuICAgICAgZGVmaW5lcy53ZWFrTWFwS2V5cy5qb2luKFwiLCBcIilcbiAgICB9XSwgWyR7XG4gICAgICBkZWZpbmVzLnN0cm9uZ01hcEtleXMuam9pbihcIiwgXCIpXG4gICAgfV0pO1xuICAgIGlmICghX19rZXlfXylcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIHRoaXMuI2tleUNvbXBvc2VyLmRlbGV0ZUtleShbJHtcbiAgICAgIGRlZmluZXMud2Vha01hcEtleXMuam9pbihcIiwgXCIpXG4gICAgfV0sIFske1xuICAgICAgZGVmaW5lcy5zdHJvbmdNYXBLZXlzLmpvaW4oXCIsIFwiKVxuICAgIH1dKTtcbiAgICByZXR1cm4gdGhpcy4jcm9vdC5kZWxldGUoX19rZXlfXyk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJnZXRcIiwgMil9XG4gIGdldCgke2RlZmluZXMuYXJnTGlzdH0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KTtcbiAgICBjb25zdCBfX2tleV9fID0gdGhpcy4ja2V5Q29tcG9zZXIuZ2V0S2V5SWZFeGlzdHMoWyR7XG4gICAgICBkZWZpbmVzLndlYWtNYXBLZXlzLmpvaW4oXCIsIFwiKVxuICAgIH1dLCBbJHtcbiAgICAgIGRlZmluZXMuc3Ryb25nTWFwS2V5cy5qb2luKFwiLCBcIilcbiAgICB9XSk7XG4gICAgcmV0dXJuIF9fa2V5X18gPyB0aGlzLiNyb290LmdldChfX2tleV9fKSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImhhc1wiLCAyKX1cbiAgaGFzKCR7ZGVmaW5lcy5hcmdMaXN0fSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuYXJnTGlzdH0pO1xuXG4gICAgY29uc3QgX19rZXlfXyA9IHRoaXMuI2tleUNvbXBvc2VyLmdldEtleUlmRXhpc3RzKFske1xuICAgICAgZGVmaW5lcy53ZWFrTWFwS2V5cy5qb2luKFwiLCBcIilcbiAgICB9XSwgWyR7XG4gICAgICBkZWZpbmVzLnN0cm9uZ01hcEtleXMuam9pbihcIiwgXCIpXG4gICAgfV0pO1xuICAgIHJldHVybiBfX2tleV9fID8gdGhpcy4jcm9vdC5oYXMoX19rZXlfXykgOiBmYWxzZTtcbiAgfVxuXG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZEtleVB1YmxpY1wiLCAyKX1cbiAgaXNWYWxpZEtleSgke2RlZmluZXMuYXJnTGlzdH0pIHtcbiAgICByZXR1cm4gdGhpcy4jaXNWYWxpZEtleSgke2RlZmluZXMuYXJnTGlzdH0pO1xuICB9XG5cbiR7XG4gIGRlZmluZXMudmFsaWRhdGVWYWx1ZSA/IGBcbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZFZhbHVlUHVibGljXCIsIDIpfVxuICBpc1ZhbGlkVmFsdWUodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy4jaXNWYWxpZFZhbHVlKHZhbHVlKTtcbiAgfVxuICBgIDogYGBcbn1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJzZXRcIiwgMil9XG4gIHNldCgke2RlZmluZXMuYXJnTGlzdH0sIHZhbHVlKSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5hcmdMaXN0fSk7XG4gICAgJHtcbiAgICAgIGRlZmluZXMudmFsaWRhdGVWYWx1ZSA/IGBcbiAgICAgIGlmICghdGhpcy4jaXNWYWxpZFZhbHVlKHZhbHVlKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHZhbHVlIGlzIG5vdCB2YWxpZCFcIik7XG4gICAgYCA6IGBgXG4gICAgfVxuXG4gICAgY29uc3QgX19rZXlfXyA9IHRoaXMuI2tleUNvbXBvc2VyLmdldEtleShbJHtcbiAgICAgIGRlZmluZXMud2Vha01hcEtleXMuam9pbihcIiwgXCIpXG4gICAgfV0sIFske1xuICAgICAgZGVmaW5lcy5zdHJvbmdNYXBLZXlzLmpvaW4oXCIsIFwiKVxuICAgIH1dKTtcbiAgICB0aGlzLiNyb290LnNldChfX2tleV9fLCB2YWx1ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJyZXF1aXJlVmFsaWRLZXlcIiwgMil9XG4gICNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KSB7XG4gICAgaWYgKCF0aGlzLiNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5hcmdMaXN0fSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgb3JkZXJlZCBrZXkgc2V0IGlzIG5vdCB2YWxpZCFcIik7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHJpdmF0ZVwiLCAyKX1cbiAgI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KSB7XG4gICAgaWYgKCF0aGlzLiNrZXlDb21wb3Nlci5pc1ZhbGlkRm9yS2V5KFske1xuICAgICAgZGVmaW5lcy53ZWFrTWFwS2V5cy5qb2luKFwiLCBcIilcbiAgICB9XSwgWyR7XG4gICAgICBkZWZpbmVzLnN0cm9uZ01hcEtleXMuam9pbihcIiwgXCIpXG4gICAgfV0pKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4ke2RlZmluZXMudmFsaWRhdGVBcmd1bWVudHMgfHwgXCJcIn1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4ke2RlZmluZXMudmFsaWRhdGVWYWx1ZSA/IGBcbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZFZhbHVlUHJpdmF0ZVwiLCAyKX1cbiAgI2lzVmFsaWRWYWx1ZSh2YWx1ZSkge1xuICAgICR7ZGVmaW5lcy52YWxpZGF0ZVZhbHVlfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGAgOiBgYH1cblxuICBbU3ltYm9sLnRvU3RyaW5nVGFnXSA9IFwiJHtkZWZpbmVzLmNsYXNzTmFtZX1cIjtcbn1cblxuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuY2xhc3NOYW1lfSk7XG5PYmplY3QuZnJlZXplKCR7ZGVmaW5lcy5jbGFzc05hbWV9LnByb3RvdHlwZSk7XG5gXG59XG5cbmV4cG9ydCBkZWZhdWx0IHByZXByb2Nlc3M7XG4iXX0=