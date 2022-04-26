/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    return `
${defines.get("importLines")}
import WeakKeyComposer from "./keys/Composite.mjs";

class ${defines.get("className")} {
  // eslint-disable-next-line jsdoc/require-property
  /** @typedef {object} WeakKey */

  /** @type {WeakKeyComposer} @constant */
  #keyComposer = new WeakKeyComposer(${defines.get("weakSetArgNameList")}, ${defines.get("strongSetArgNameList")});

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
  add(${defines.get("argList")}) {
    this.#requireValidKey(${defines.get("argList")});

    const __key__ = this.#keyComposer.getKey([${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]);
    if (!__key__)
      return null;

    this.#weakKeySet.add(__key__);
    return this;
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("argList")}) {
    this.#requireValidKey(${defines.get("argList")});

    const __key__ = this.#keyComposer.getKeyIfExists([${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]);
    if (!__key__)
      return false;

    const __returnValue__ = this.#weakKeySet.delete(__key__);
    this.#keyComposer.deleteKey([${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]);
    return __returnValue__;
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("argList")}) {
    this.#requireValidKey(${defines.get("argList")});

    const __key__ = this.#keyComposer.getKeyIfExists([${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]);

    return __key__ ? this.#weakKeySet.has(__key__) : false;
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("argList")}) {
    return this.#isValidKey(${defines.get("argList")});
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.get("argList")}) {
    if (!this.#isValidKey(${defines.get("argList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.get("argList")}) {
    if (!this.#keyComposer.isValidForKey([${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]))
      return false;
${defines.get("validateArguments") || ""}
    return true;
  }

  [Symbol.toStringTag] = "${defines.get("className")}";
}

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0LmluLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlNldC5pbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxHQUFxQixTQUFTLFVBQVUsQ0FBQyxPQUE0QixFQUFFLElBQW9CO0lBQ3pHLE9BQU87RUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQzs7O1FBR3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDOzs7Ozt1Q0FNNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FDbEMsS0FDRSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUNwQzs7Ozs7Ozs7Ozs7Ozs7RUFjQSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7NEJBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7O2dEQUc1QyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUM5QixPQUNFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQ2hDOzs7Ozs7OztFQVFGLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztXQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzs0QkFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzs7d0RBRzVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQzlCLE9BQ0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FDaEM7Ozs7O21DQU1FLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQzlCLE9BQ0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FDaEM7Ozs7RUFJRixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7NEJBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7O3dEQUc1QyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUM5QixPQUNFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQ2hDOzs7OztFQUtGLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO2VBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDOzhCQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDOzs7RUFHbEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7cUJBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDOzRCQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDOzs7O0VBSWhELElBQUksQ0FBQyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO2dCQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzs0Q0FFaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FDOUIsT0FDRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUNoQzs7RUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRTs7Ozs0QkFJWixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQzs7O2dCQUdwQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztnQkFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7Q0FDdkMsQ0FBQztBQUNGLENBQUMsQ0FBQTtBQUVELGVBQWUsVUFBVSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQcmVwcm9jZXNzb3JEZWZpbmVzLCBKU0RvY0dlbmVyYXRvciwgVGVtcGxhdGVGdW5jdGlvbiB9IGZyb20gXCIuLi9zaGFyZWRUeXBlcy5tanNcIjtcblxuLyoqXG4gKiBAcGFyYW0ge01hcH0gICAgICAgICAgICBkZWZpbmVzIFRoZSBwcmVwcm9jZXNzb3IgbWFjcm9zLlxuICogQHBhcmFtIHtKU0RvY0dlbmVyYXRvcn0gZG9jcyAgICBUaGUgcHJpbWFyeSBkb2N1bWVudGF0aW9uIGdlbmVyYXRvci5cbiAqIEByZXR1cm5zIHtzdHJpbmd9ICAgICAgICAgICAgICAgVGhlIGdlbmVyYXRlZCBzb3VyY2UgY29kZS5cbiAqL1xuY29uc3QgcHJlcHJvY2VzczogVGVtcGxhdGVGdW5jdGlvbiA9IGZ1bmN0aW9uIHByZXByb2Nlc3MoZGVmaW5lczogUHJlcHJvY2Vzc29yRGVmaW5lcywgZG9jczogSlNEb2NHZW5lcmF0b3IpIHtcbiAgcmV0dXJuIGBcbiR7ZGVmaW5lcy5nZXQoXCJpbXBvcnRMaW5lc1wiKX1cbmltcG9ydCBXZWFrS2V5Q29tcG9zZXIgZnJvbSBcIi4va2V5cy9Db21wb3NpdGUubWpzXCI7XG5cbmNsYXNzICR7ZGVmaW5lcy5nZXQoXCJjbGFzc05hbWVcIil9IHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGpzZG9jL3JlcXVpcmUtcHJvcGVydHlcbiAgLyoqIEB0eXBlZGVmIHtvYmplY3R9IFdlYWtLZXkgKi9cblxuICAvKiogQHR5cGUge1dlYWtLZXlDb21wb3Nlcn0gQGNvbnN0YW50ICovXG4gICNrZXlDb21wb3NlciA9IG5ldyBXZWFrS2V5Q29tcG9zZXIoJHtcbiAgICBkZWZpbmVzLmdldChcIndlYWtTZXRBcmdOYW1lTGlzdFwiKVxuICB9LCAke1xuICAgIGRlZmluZXMuZ2V0KFwic3Ryb25nU2V0QXJnTmFtZUxpc3RcIilcbiAgfSk7XG5cbiAgLyoqIEB0eXBlIHtXZWFrU2V0PFdlYWtLZXk+fSBAY29uc3RhbnQgKi9cbiAgI3dlYWtLZXlTZXQgPSBuZXcgV2Vha1NldDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGl0ZXJhYmxlID0gYXJndW1lbnRzWzBdO1xuICAgICAgZm9yIChsZXQgZW50cnkgb2YgaXRlcmFibGUpIHtcbiAgICAgICAgdGhpcy5hZGQoLi4uZW50cnkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImFkZFwiLCAyKX1cbiAgYWRkKCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pO1xuXG4gICAgY29uc3QgX19rZXlfXyA9IHRoaXMuI2tleUNvbXBvc2VyLmdldEtleShbJHtcbiAgICAgIGRlZmluZXMuZ2V0KFwid2Vha1NldEFyZ0xpc3RcIilcbiAgICB9XSwgWyR7XG4gICAgICBkZWZpbmVzLmdldChcInN0cm9uZ1NldEFyZ0xpc3RcIilcbiAgICB9XSk7XG4gICAgaWYgKCFfX2tleV9fKVxuICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICB0aGlzLiN3ZWFrS2V5U2V0LmFkZChfX2tleV9fKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImRlbGV0ZVwiLCAyKX1cbiAgZGVsZXRlKCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pO1xuXG4gICAgY29uc3QgX19rZXlfXyA9IHRoaXMuI2tleUNvbXBvc2VyLmdldEtleUlmRXhpc3RzKFske1xuICAgICAgZGVmaW5lcy5nZXQoXCJ3ZWFrU2V0QXJnTGlzdFwiKVxuICAgIH1dLCBbJHtcbiAgICAgIGRlZmluZXMuZ2V0KFwic3Ryb25nU2V0QXJnTGlzdFwiKVxuICAgIH1dKTtcbiAgICBpZiAoIV9fa2V5X18pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBfX3JldHVyblZhbHVlX18gPSB0aGlzLiN3ZWFrS2V5U2V0LmRlbGV0ZShfX2tleV9fKTtcbiAgICB0aGlzLiNrZXlDb21wb3Nlci5kZWxldGVLZXkoWyR7XG4gICAgICBkZWZpbmVzLmdldChcIndlYWtTZXRBcmdMaXN0XCIpXG4gICAgfV0sIFske1xuICAgICAgZGVmaW5lcy5nZXQoXCJzdHJvbmdTZXRBcmdMaXN0XCIpXG4gICAgfV0pO1xuICAgIHJldHVybiBfX3JldHVyblZhbHVlX187XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJoYXNcIiwgMil9XG4gIGhhcygke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KTtcblxuICAgIGNvbnN0IF9fa2V5X18gPSB0aGlzLiNrZXlDb21wb3Nlci5nZXRLZXlJZkV4aXN0cyhbJHtcbiAgICAgIGRlZmluZXMuZ2V0KFwid2Vha1NldEFyZ0xpc3RcIilcbiAgICB9XSwgWyR7XG4gICAgICBkZWZpbmVzLmdldChcInN0cm9uZ1NldEFyZ0xpc3RcIilcbiAgICB9XSk7XG5cbiAgICByZXR1cm4gX19rZXlfXyA/IHRoaXMuI3dlYWtLZXlTZXQuaGFzKF9fa2V5X18pIDogZmFsc2U7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHVibGljXCIsIDIpfVxuICBpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSkge1xuICAgIHJldHVybiB0aGlzLiNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJyZXF1aXJlVmFsaWRLZXlcIiwgMil9XG4gICNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KSB7XG4gICAgaWYgKCF0aGlzLiNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgb3JkZXJlZCBrZXkgc2V0IGlzIG5vdCB2YWxpZCFcIik7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHJpdmF0ZVwiLCAyKX1cbiAgI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KSB7XG4gICAgaWYgKCF0aGlzLiNrZXlDb21wb3Nlci5pc1ZhbGlkRm9yS2V5KFske1xuICAgICAgZGVmaW5lcy5nZXQoXCJ3ZWFrU2V0QXJnTGlzdFwiKVxuICAgIH1dLCBbJHtcbiAgICAgIGRlZmluZXMuZ2V0KFwic3Ryb25nU2V0QXJnTGlzdFwiKVxuICAgIH1dKSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiR7ZGVmaW5lcy5nZXQoXCJ2YWxpZGF0ZUFyZ3VtZW50c1wiKSB8fCBcIlwifVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgW1N5bWJvbC50b1N0cmluZ1RhZ10gPSBcIiR7ZGVmaW5lcy5nZXQoXCJjbGFzc05hbWVcIil9XCI7XG59XG5cbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX0pO1xuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuZ2V0KFwiY2xhc3NOYW1lXCIpfS5wcm90b3R5cGUpO1xuYDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcHJlcHJvY2VzcztcbiJdfQ==