/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    let invokeValidate = "";
    if (defines.has("invokeValidate")) {
        invokeValidate = `\n    this.#requireValidKey(${defines.get("argList")});\n`;
    }
    return `
${defines.get("importLines")}
import KeyHasher from "./keys/Hasher.mjs";

class ${defines.get("className")} {
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
  add(${defines.get("argList")}) {${invokeValidate}
    const __hash__ = this.#hasher.getHash(${defines.get("argList")});
    this.#root.set(__hash__, Object.freeze([${defines.get("argList")}]));
    return this;
  }

${docs.buildBlock("clear", 2)}
  clear() {
    this.#root.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("argList")}) {
    const __hash__ = this.#hasher.getHashIfExists(${defines.get("argList")});
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
  has(${defines.get("argList")}) {
    const __hash__ = this.#hasher.getHashIfExists(${defines.get("argList")});
    return __hash__ ? this.#root.has(__hash__) : false;
  }

${defines.has("validateArguments") ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("argList")}) {
    return this.#isValidKey(${defines.get("argList")});
  }
` : ``}

${docs.buildBlock("values", 2)}
  * values() {
    for (let __value__ of this.#root.values())
      yield __value__;
  }
${defines.has("invokeValidate") ?
        `
  ${docs.buildBlock("requireValidKey", 2)}
    #requireValidKey(${defines.get("argList")}) {
      if (!this.#isValidKey(${defines.get("argList")}))
        throw new Error("The ordered key set is not valid!");
    }

  ${docs.buildBlock("isValidKeyPrivate", 2)}
    #isValidKey(${defines.get("argList")}) {
  ${defines.get("validateArguments")}
      return true;
    }
` : ``}

  [Symbol.iterator]() {
    return this.values();
  }

  [Symbol.toStringTag] = "${defines.get("className")}";
}

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0LmluLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlNldC5pbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxHQUFxQixTQUFTLFVBQVUsQ0FBQyxPQUE0QixFQUFFLElBQW9CO0lBQ3pHLElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQztJQUN4QixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtRQUNqQyxjQUFjLEdBQUcsK0JBQStCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztLQUM5RTtJQUVELE9BQU87RUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQzs7O1FBR3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDOzs7SUFHNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7OztFQWV4QyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7Ozs7O0VBSzdCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLGNBQWM7NENBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7OENBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDOzs7O0VBSWxFLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQzs7Ozs7RUFLM0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1dBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO29EQUNtQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzs7OztFQUl4RSxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7Ozs7Ozs7RUFPaEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7O0VBRXhDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQztvREFDc0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7Ozs7RUFJeEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNuQyxJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQztlQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzs4QkFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzs7Q0FFbkQsQ0FBQyxDQUFDLENBQUMsRUFBRTs7RUFFSixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7Ozs7O0VBSzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBQy9CO0lBQ0UsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7dUJBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDOzhCQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDOzs7O0lBSWhELElBQUksQ0FBQyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO2tCQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQztJQUNwQyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDOzs7Q0FHbkMsQ0FBQyxDQUFDLENBQUMsRUFBRTs7Ozs7OzRCQU1zQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQzs7O2dCQUdwQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztnQkFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7Q0FDdkMsQ0FBQztBQUNGLENBQUMsQ0FBQTtBQUVELGVBQWUsVUFBVSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQcmVwcm9jZXNzb3JEZWZpbmVzLCBKU0RvY0dlbmVyYXRvciwgVGVtcGxhdGVGdW5jdGlvbiB9IGZyb20gXCIuLi9zaGFyZWRUeXBlcy5tanNcIjtcblxuLyoqXG4gKiBAcGFyYW0ge01hcH0gICAgICAgICAgICBkZWZpbmVzIFRoZSBwcmVwcm9jZXNzb3IgbWFjcm9zLlxuICogQHBhcmFtIHtKU0RvY0dlbmVyYXRvcn0gZG9jcyAgICBUaGUgcHJpbWFyeSBkb2N1bWVudGF0aW9uIGdlbmVyYXRvci5cbiAqIEByZXR1cm5zIHtzdHJpbmd9ICAgICAgICAgICAgICAgVGhlIGdlbmVyYXRlZCBzb3VyY2UgY29kZS5cbiAqL1xuY29uc3QgcHJlcHJvY2VzczogVGVtcGxhdGVGdW5jdGlvbiA9IGZ1bmN0aW9uIHByZXByb2Nlc3MoZGVmaW5lczogUHJlcHJvY2Vzc29yRGVmaW5lcywgZG9jczogSlNEb2NHZW5lcmF0b3IpIHtcbiAgbGV0IGludm9rZVZhbGlkYXRlID0gXCJcIjtcbiAgaWYgKGRlZmluZXMuaGFzKFwiaW52b2tlVmFsaWRhdGVcIikpIHtcbiAgICBpbnZva2VWYWxpZGF0ZSA9IGBcXG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSk7XFxuYDtcbiAgfVxuXG4gIHJldHVybiBgXG4ke2RlZmluZXMuZ2V0KFwiaW1wb3J0TGluZXNcIil9XG5pbXBvcnQgS2V5SGFzaGVyIGZyb20gXCIuL2tleXMvSGFzaGVyLm1qc1wiO1xuXG5jbGFzcyAke2RlZmluZXMuZ2V0KFwiY2xhc3NOYW1lXCIpfSB7XG4gIC8qKiBAdHlwZWRlZiB7c3RyaW5nfSBoYXNoICovXG5cbiAgJHtkb2NzLmJ1aWxkQmxvY2soXCJyb290Q29udGFpbmVyU2V0XCIsIDQpfVxuICAjcm9vdCA9IG5ldyBNYXA7XG5cbiAgLyoqIEB0eXBlIHtLZXlIYXNoZXJ9IEBjb25zdGFudCAqL1xuICAjaGFzaGVyID0gbmV3IEtleUhhc2hlcigpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgaXRlcmFibGUgPSBhcmd1bWVudHNbMF07XG4gICAgICBmb3IgKGxldCBlbnRyeSBvZiBpdGVyYWJsZSkge1xuICAgICAgICB0aGlzLmFkZCguLi5lbnRyeSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZ2V0U2l6ZVwiLCAyKX1cbiAgZ2V0IHNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuI3Jvb3Quc2l6ZTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImFkZFwiLCAyKX1cbiAgYWRkKCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSkgeyR7aW52b2tlVmFsaWRhdGV9XG4gICAgY29uc3QgX19oYXNoX18gPSB0aGlzLiNoYXNoZXIuZ2V0SGFzaCgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pO1xuICAgIHRoaXMuI3Jvb3Quc2V0KF9faGFzaF9fLCBPYmplY3QuZnJlZXplKFske2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX1dKSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJjbGVhclwiLCAyKX1cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy4jcm9vdC5jbGVhcigpO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZGVsZXRlXCIsIDIpfVxuICBkZWxldGUoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KSB7XG4gICAgY29uc3QgX19oYXNoX18gPSB0aGlzLiNoYXNoZXIuZ2V0SGFzaElmRXhpc3RzKCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSk7XG4gICAgcmV0dXJuIF9faGFzaF9fID8gdGhpcy4jcm9vdC5kZWxldGUoX19oYXNoX18pIDogZmFsc2U7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJmb3JFYWNoU2V0XCIsIDIpfVxuICBmb3JFYWNoKF9fY2FsbGJhY2tfXywgX190aGlzQXJnX18pIHtcbiAgICB0aGlzLiNyb290LmZvckVhY2godmFsdWVTZXQgPT4ge1xuICAgICAgX19jYWxsYmFja19fLmFwcGx5KF9fdGhpc0FyZ19fLCB2YWx1ZVNldC5jb25jYXQodGhpcykpO1xuICAgIH0pO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZm9yRWFjaENhbGxiYWNrU2V0XCIsIDIpfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImhhc1wiLCAyKX1cbiAgaGFzKCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSkge1xuICAgIGNvbnN0IF9faGFzaF9fID0gdGhpcy4jaGFzaGVyLmdldEhhc2hJZkV4aXN0cygke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pO1xuICAgIHJldHVybiBfX2hhc2hfXyA/IHRoaXMuI3Jvb3QuaGFzKF9faGFzaF9fKSA6IGZhbHNlO1xuICB9XG5cbiR7ZGVmaW5lcy5oYXMoXCJ2YWxpZGF0ZUFyZ3VtZW50c1wiKSA/IGBcbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZEtleVB1YmxpY1wiLCAyKX1cbiAgaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pIHtcbiAgICByZXR1cm4gdGhpcy4jaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pO1xuICB9XG5gIDogYGB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwidmFsdWVzXCIsIDIpfVxuICAqIHZhbHVlcygpIHtcbiAgICBmb3IgKGxldCBfX3ZhbHVlX18gb2YgdGhpcy4jcm9vdC52YWx1ZXMoKSlcbiAgICAgIHlpZWxkIF9fdmFsdWVfXztcbiAgfVxuJHtkZWZpbmVzLmhhcyhcImludm9rZVZhbGlkYXRlXCIpID9cbiAgYFxuICAke2RvY3MuYnVpbGRCbG9jayhcInJlcXVpcmVWYWxpZEtleVwiLCAyKX1cbiAgICAjcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSkge1xuICAgICAgaWYgKCF0aGlzLiNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBvcmRlcmVkIGtleSBzZXQgaXMgbm90IHZhbGlkIVwiKTtcbiAgICB9XG5cbiAgJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHJpdmF0ZVwiLCAyKX1cbiAgICAjaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pIHtcbiAgJHtkZWZpbmVzLmdldChcInZhbGlkYXRlQXJndW1lbnRzXCIpfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuYCA6IGBgfVxuXG4gIFtTeW1ib2wuaXRlcmF0b3JdKCkge1xuICAgIHJldHVybiB0aGlzLnZhbHVlcygpO1xuICB9XG5cbiAgW1N5bWJvbC50b1N0cmluZ1RhZ10gPSBcIiR7ZGVmaW5lcy5nZXQoXCJjbGFzc05hbWVcIil9XCI7XG59XG5cbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX0pO1xuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuZ2V0KFwiY2xhc3NOYW1lXCIpfS5wcm90b3R5cGUpO1xuYDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcHJlcHJvY2VzcztcbiJdfQ==