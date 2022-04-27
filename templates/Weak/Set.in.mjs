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
  #keyComposer = new WeakKeyComposer(${JSON.stringify(defines.weakSetElements)}, ${JSON.stringify(defines.strongSetElements)});

  /** @type {WeakSet<WeakKey>} @constant */
  #weakKeySet = new WeakSet;

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.add(...entry);
      }
    }
  }

${docs.buildBlock("add", 2)}
  add(${defines.argList}) {
    this.#requireValidKey(${defines.argList});

    const __key__ = this.#keyComposer.getKey([${defines.weakSetElements.join(", ")}], [${defines.strongSetElements.join(", ")}]);
    if (!__key__)
      return null;

    this.#weakKeySet.add(__key__);
    return this;
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.argList}) {
    this.#requireValidKey(${defines.argList});

    const __key__ = this.#keyComposer.getKeyIfExists([${defines.weakSetElements.join(", ")}], [${defines.strongSetElements.join(", ")}]);
    if (!__key__)
      return false;

    const __returnValue__ = this.#weakKeySet.delete(__key__);
    this.#keyComposer.deleteKey([${defines.weakSetElements.join(", ")}], [${defines.strongSetElements.join(", ")}]);
    return __returnValue__;
  }

${docs.buildBlock("has", 2)}
  has(${defines.argList}) {
    this.#requireValidKey(${defines.argList});

    const __key__ = this.#keyComposer.getKeyIfExists([${defines.weakSetElements.join(", ")}], [${defines.strongSetElements.join(", ")}]);

    return __key__ ? this.#weakKeySet.has(__key__) : false;
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.argList}) {
    return this.#isValidKey(${defines.argList});
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.argList}) {
    if (!this.#isValidKey(${defines.argList}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.argList}) {
    if (!this.#keyComposer.isValidForKey([${defines.weakSetElements.join(", ")}], [${defines.strongSetElements.join(", ")}]))
      return false;
${defines.validateArguments || ""}
    return true;
  }

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0LmluLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlNldC5pbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxHQUFxQixTQUFTLFVBQVUsQ0FBQyxPQUF3QixFQUFFLElBQW9CO0lBQ3JHLE9BQU87RUFDUCxPQUFPLENBQUMsV0FBVzs7O1FBR2IsT0FBTyxDQUFDLFNBQVM7Ozs7O3VDQU1yQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQ3hDLEtBQ0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQzFDOzs7Ozs7Ozs7Ozs7OztFQWNBLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsT0FBTzs0QkFDSyxPQUFPLENBQUMsT0FBTzs7Z0RBR3JDLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FDbkMsT0FDRSxPQUFPLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FDckM7Ozs7Ozs7O0VBUUYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1dBQ25CLE9BQU8sQ0FBQyxPQUFPOzRCQUNFLE9BQU8sQ0FBQyxPQUFPOzt3REFHckMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUNuQyxPQUNFLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUNyQzs7Ozs7bUNBTUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUNuQyxPQUNFLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUNyQzs7OztFQUlGLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsT0FBTzs0QkFDSyxPQUFPLENBQUMsT0FBTzs7d0RBR3JDLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FDbkMsT0FDRSxPQUFPLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FDckM7Ozs7O0VBS0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7ZUFDekIsT0FBTyxDQUFDLE9BQU87OEJBQ0EsT0FBTyxDQUFDLE9BQU87OztFQUczQyxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztxQkFDbEIsT0FBTyxDQUFDLE9BQU87NEJBQ1IsT0FBTyxDQUFDLE9BQU87Ozs7RUFJekMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7Z0JBQ3pCLE9BQU8sQ0FBQyxPQUFPOzRDQUV6QixPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQ25DLE9BQ0UsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQ3JDOztFQUVGLE9BQU8sQ0FBQyxpQkFBaUIsSUFBSSxFQUFFOzs7OzRCQUlMLE9BQU8sQ0FBQyxTQUFTOzs7Z0JBRzdCLE9BQU8sQ0FBQyxTQUFTO2dCQUNqQixPQUFPLENBQUMsU0FBUztDQUNoQyxDQUFDO0FBQ0YsQ0FBQyxDQUFBO0FBRUQsZUFBZSxVQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFJlYWRvbmx5RGVmaW5lcywgSlNEb2NHZW5lcmF0b3IsIFRlbXBsYXRlRnVuY3Rpb24gfSBmcm9tIFwiLi4vc2hhcmVkVHlwZXMubWpzXCI7XG5cbi8qKlxuICogQHBhcmFtIHtNYXB9ICAgICAgICAgICAgZGVmaW5lcyBUaGUgcHJlcHJvY2Vzc29yIG1hY3Jvcy5cbiAqIEBwYXJhbSB7SlNEb2NHZW5lcmF0b3J9IGRvY3MgICAgVGhlIHByaW1hcnkgZG9jdW1lbnRhdGlvbiBnZW5lcmF0b3IuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSAgICAgICAgICAgICAgIFRoZSBnZW5lcmF0ZWQgc291cmNlIGNvZGUuXG4gKi9cbmNvbnN0IHByZXByb2Nlc3M6IFRlbXBsYXRlRnVuY3Rpb24gPSBmdW5jdGlvbiBwcmVwcm9jZXNzKGRlZmluZXM6IFJlYWRvbmx5RGVmaW5lcywgZG9jczogSlNEb2NHZW5lcmF0b3IpIHtcbiAgcmV0dXJuIGBcbiR7ZGVmaW5lcy5pbXBvcnRMaW5lc31cbmltcG9ydCBXZWFrS2V5Q29tcG9zZXIgZnJvbSBcIi4va2V5cy9Db21wb3NpdGUubWpzXCI7XG5cbmNsYXNzICR7ZGVmaW5lcy5jbGFzc05hbWV9IHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGpzZG9jL3JlcXVpcmUtcHJvcGVydHlcbiAgLyoqIEB0eXBlZGVmIHtvYmplY3R9IFdlYWtLZXkgKi9cblxuICAvKiogQHR5cGUge1dlYWtLZXlDb21wb3Nlcn0gQGNvbnN0YW50ICovXG4gICNrZXlDb21wb3NlciA9IG5ldyBXZWFrS2V5Q29tcG9zZXIoJHtcbiAgICBKU09OLnN0cmluZ2lmeShkZWZpbmVzLndlYWtTZXRFbGVtZW50cylcbiAgfSwgJHtcbiAgICBKU09OLnN0cmluZ2lmeShkZWZpbmVzLnN0cm9uZ1NldEVsZW1lbnRzKVxuICB9KTtcblxuICAvKiogQHR5cGUge1dlYWtTZXQ8V2Vha0tleT59IEBjb25zdGFudCAqL1xuICAjd2Vha0tleVNldCA9IG5ldyBXZWFrU2V0O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgaXRlcmFibGUgPSBhcmd1bWVudHNbMF07XG4gICAgICBmb3IgKGxldCBlbnRyeSBvZiBpdGVyYWJsZSkge1xuICAgICAgICB0aGlzLmFkZCguLi5lbnRyeSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiYWRkXCIsIDIpfVxuICBhZGQoJHtkZWZpbmVzLmFyZ0xpc3R9KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5hcmdMaXN0fSk7XG5cbiAgICBjb25zdCBfX2tleV9fID0gdGhpcy4ja2V5Q29tcG9zZXIuZ2V0S2V5KFske1xuICAgICAgZGVmaW5lcy53ZWFrU2V0RWxlbWVudHMuam9pbihcIiwgXCIpXG4gICAgfV0sIFske1xuICAgICAgZGVmaW5lcy5zdHJvbmdTZXRFbGVtZW50cy5qb2luKFwiLCBcIilcbiAgICB9XSk7XG4gICAgaWYgKCFfX2tleV9fKVxuICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICB0aGlzLiN3ZWFrS2V5U2V0LmFkZChfX2tleV9fKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImRlbGV0ZVwiLCAyKX1cbiAgZGVsZXRlKCR7ZGVmaW5lcy5hcmdMaXN0fSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuYXJnTGlzdH0pO1xuXG4gICAgY29uc3QgX19rZXlfXyA9IHRoaXMuI2tleUNvbXBvc2VyLmdldEtleUlmRXhpc3RzKFske1xuICAgICAgZGVmaW5lcy53ZWFrU2V0RWxlbWVudHMuam9pbihcIiwgXCIpXG4gICAgfV0sIFske1xuICAgICAgZGVmaW5lcy5zdHJvbmdTZXRFbGVtZW50cy5qb2luKFwiLCBcIilcbiAgICB9XSk7XG4gICAgaWYgKCFfX2tleV9fKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgX19yZXR1cm5WYWx1ZV9fID0gdGhpcy4jd2Vha0tleVNldC5kZWxldGUoX19rZXlfXyk7XG4gICAgdGhpcy4ja2V5Q29tcG9zZXIuZGVsZXRlS2V5KFske1xuICAgICAgZGVmaW5lcy53ZWFrU2V0RWxlbWVudHMuam9pbihcIiwgXCIpXG4gICAgfV0sIFske1xuICAgICAgZGVmaW5lcy5zdHJvbmdTZXRFbGVtZW50cy5qb2luKFwiLCBcIilcbiAgICB9XSk7XG4gICAgcmV0dXJuIF9fcmV0dXJuVmFsdWVfXztcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImhhc1wiLCAyKX1cbiAgaGFzKCR7ZGVmaW5lcy5hcmdMaXN0fSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuYXJnTGlzdH0pO1xuXG4gICAgY29uc3QgX19rZXlfXyA9IHRoaXMuI2tleUNvbXBvc2VyLmdldEtleUlmRXhpc3RzKFske1xuICAgICAgZGVmaW5lcy53ZWFrU2V0RWxlbWVudHMuam9pbihcIiwgXCIpXG4gICAgfV0sIFske1xuICAgICAgZGVmaW5lcy5zdHJvbmdTZXRFbGVtZW50cy5qb2luKFwiLCBcIilcbiAgICB9XSk7XG5cbiAgICByZXR1cm4gX19rZXlfXyA/IHRoaXMuI3dlYWtLZXlTZXQuaGFzKF9fa2V5X18pIDogZmFsc2U7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHVibGljXCIsIDIpfVxuICBpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5hcmdMaXN0fSkge1xuICAgIHJldHVybiB0aGlzLiNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5hcmdMaXN0fSk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJyZXF1aXJlVmFsaWRLZXlcIiwgMil9XG4gICNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KSB7XG4gICAgaWYgKCF0aGlzLiNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5hcmdMaXN0fSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgb3JkZXJlZCBrZXkgc2V0IGlzIG5vdCB2YWxpZCFcIik7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHJpdmF0ZVwiLCAyKX1cbiAgI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KSB7XG4gICAgaWYgKCF0aGlzLiNrZXlDb21wb3Nlci5pc1ZhbGlkRm9yS2V5KFske1xuICAgICAgZGVmaW5lcy53ZWFrU2V0RWxlbWVudHMuam9pbihcIiwgXCIpXG4gICAgfV0sIFske1xuICAgICAgZGVmaW5lcy5zdHJvbmdTZXRFbGVtZW50cy5qb2luKFwiLCBcIilcbiAgICB9XSkpXG4gICAgICByZXR1cm4gZmFsc2U7XG4ke2RlZmluZXMudmFsaWRhdGVBcmd1bWVudHMgfHwgXCJcIn1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIFtTeW1ib2wudG9TdHJpbmdUYWddID0gXCIke2RlZmluZXMuY2xhc3NOYW1lfVwiO1xufVxuXG5PYmplY3QuZnJlZXplKCR7ZGVmaW5lcy5jbGFzc05hbWV9KTtcbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmNsYXNzTmFtZX0ucHJvdG90eXBlKTtcbmA7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHByZXByb2Nlc3M7XG4iXX0=