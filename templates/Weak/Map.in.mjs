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
  #keyComposer = new WeakKeyComposer(${defines.get("weakMapArgNameList")}, ${defines.get("strongMapArgNameList")});

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
  delete(${defines.get("argList")}) {
    this.#requireValidKey(${defines.get("argList")});
    const __key__ = this.#keyComposer.getKeyIfExists([${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]);
    if (!__key__)
      return false;

    this.#keyComposer.deleteKey([${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]);
    return this.#root.delete(__key__);
  }

${docs.buildBlock("get", 2)}
  get(${defines.get("argList")}) {
    this.#requireValidKey(${defines.get("argList")});
    const __key__ = this.#keyComposer.getKeyIfExists([${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]);
    return __key__ ? this.#root.get(__key__) : undefined;
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("argList")}) {
    this.#requireValidKey(${defines.get("argList")});

    const __key__ = this.#keyComposer.getKeyIfExists([${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]);
    return __key__ ? this.#root.has(__key__) : false;
  }


${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("argList")}) {
    return this.#isValidKey(${defines.get("argList")});
  }

${defines.has("validateValue") ? `
${docs.buildBlock("isValidValuePublic", 2)}
  isValidValue(value) {
    return this.#isValidValue(value);
  }
  ` : ``}

${docs.buildBlock("set", 2)}
  set(${defines.get("argList")}, value) {
    this.#requireValidKey(${defines.get("argList")});
    ${defines.has("validateValue") ? `
      if (!this.#isValidValue(value))
        throw new Error("The value is not valid!");
    ` : ``}

    const __key__ = this.#keyComposer.getKey([${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]);
    this.#root.set(__key__, value);
    return this;
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.get("argList")}) {
    if (!this.#isValidKey(${defines.get("argList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.get("argList")}) {
    if (!this.#keyComposer.isValidForKey([${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]))
      return false;

${defines.get("validateArguments") || ""}
    return true;
  }

${defines.has("validateValue") ? `
${docs.buildBlock("isValidValuePrivate", 2)}
  #isValidValue(value) {
    ${defines.get("validateValue")}
    return true;
  }
  ` : ``}

  [Symbol.toStringTag] = "${defines.get("className")}";
}

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFwLmluLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1hcC5pbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxHQUFxQixTQUFTLFVBQVUsQ0FBQyxPQUE0QixFQUFFLElBQW9CO0lBQ3pHLE9BQU87RUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQzs7O1FBR3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDOzs7Ozt1Q0FNNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FDbEMsS0FDRSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUNwQzs7SUFFRSxJQUFJLENBQUMsVUFBVSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7OztFQWE1QyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7V0FDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7NEJBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7d0RBRTVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQzlCLE9BQ0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FDaEM7Ozs7bUNBS0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FDOUIsT0FDRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUNoQzs7OztFQUlGLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzs0QkFDRixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzt3REFFNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FDOUIsT0FDRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUNoQzs7OztFQUlGLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzs0QkFDRixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzs7d0RBRzVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQzlCLE9BQ0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FDaEM7Ozs7O0VBS0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7ZUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7OEJBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7OztFQUlsRCxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMvQixJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQzs7OztHQUl2QyxDQUFDLENBQUMsQ0FBQyxFQUNOOztFQUVFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzs0QkFDRixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQztNQUU1QyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O0tBR2hDLENBQUMsQ0FBQyxDQUFDLEVBQ0o7O2dEQUdFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQzlCLE9BQ0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FDaEM7Ozs7O0VBS0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7cUJBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDOzRCQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDOzs7O0VBSWhELElBQUksQ0FBQyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO2dCQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzs0Q0FFaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FDOUIsT0FDRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUNoQzs7O0VBR0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUU7Ozs7RUFJdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDL0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7O01BRXJDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDOzs7R0FHL0IsQ0FBQyxDQUFDLENBQUMsRUFBRTs7NEJBRW9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDOzs7Z0JBR3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO2dCQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztDQUN2QyxDQUFBO0FBQ0QsQ0FBQyxDQUFBO0FBRUQsZUFBZSxVQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFByZXByb2Nlc3NvckRlZmluZXMsIEpTRG9jR2VuZXJhdG9yLCBUZW1wbGF0ZUZ1bmN0aW9uIH0gZnJvbSBcIi4uL3NoYXJlZFR5cGVzLm1qc1wiO1xuXG4vKipcbiAqIEBwYXJhbSB7TWFwfSAgICAgICAgICAgIGRlZmluZXMgVGhlIHByZXByb2Nlc3NvciBtYWNyb3MuXG4gKiBAcGFyYW0ge0pTRG9jR2VuZXJhdG9yfSBkb2NzICAgIFRoZSBwcmltYXJ5IGRvY3VtZW50YXRpb24gZ2VuZXJhdG9yLlxuICogQHJldHVybnMge3N0cmluZ30gICAgICAgICAgICAgICBUaGUgZ2VuZXJhdGVkIHNvdXJjZSBjb2RlLlxuICovXG5jb25zdCBwcmVwcm9jZXNzOiBUZW1wbGF0ZUZ1bmN0aW9uID0gZnVuY3Rpb24gcHJlcHJvY2VzcyhkZWZpbmVzOiBQcmVwcm9jZXNzb3JEZWZpbmVzLCBkb2NzOiBKU0RvY0dlbmVyYXRvcikge1xuICByZXR1cm4gYFxuJHtkZWZpbmVzLmdldChcImltcG9ydExpbmVzXCIpfVxuaW1wb3J0IFdlYWtLZXlDb21wb3NlciBmcm9tIFwiLi9rZXlzL0NvbXBvc2l0ZS5tanNcIjtcblxuY2xhc3MgJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX0ge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUganNkb2MvcmVxdWlyZS1wcm9wZXJ0eVxuICAvKiogQHR5cGVkZWYge29iamVjdH0gV2Vha0tleSAqL1xuXG4gIC8qKiBAdHlwZSB7V2Vha0tleUNvbXBvc2VyfSBAY29uc3RhbnQgKi9cbiAgI2tleUNvbXBvc2VyID0gbmV3IFdlYWtLZXlDb21wb3Nlcigke1xuICAgIGRlZmluZXMuZ2V0KFwid2Vha01hcEFyZ05hbWVMaXN0XCIpXG4gIH0sICR7XG4gICAgZGVmaW5lcy5nZXQoXCJzdHJvbmdNYXBBcmdOYW1lTGlzdFwiKVxuICB9KTtcblxuICAke2RvY3MuYnVpbGRCbG9jayhcInJvb3RDb250YWluZXJXZWFrTWFwXCIsIDQpfVxuICAjcm9vdCA9IG5ldyBXZWFrTWFwO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgaXRlcmFibGUgPSBhcmd1bWVudHNbMF07XG4gICAgICBmb3IgKGxldCBlbnRyeSBvZiBpdGVyYWJsZSkge1xuICAgICAgICB0aGlzLnNldCguLi5lbnRyeSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJkZWxldGVcIiwgMil9XG4gIGRlbGV0ZSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KTtcbiAgICBjb25zdCBfX2tleV9fID0gdGhpcy4ja2V5Q29tcG9zZXIuZ2V0S2V5SWZFeGlzdHMoWyR7XG4gICAgICBkZWZpbmVzLmdldChcIndlYWtNYXBBcmdMaXN0XCIpXG4gICAgfV0sIFske1xuICAgICAgZGVmaW5lcy5nZXQoXCJzdHJvbmdNYXBBcmdMaXN0XCIpXG4gICAgfV0pO1xuICAgIGlmICghX19rZXlfXylcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIHRoaXMuI2tleUNvbXBvc2VyLmRlbGV0ZUtleShbJHtcbiAgICAgIGRlZmluZXMuZ2V0KFwid2Vha01hcEFyZ0xpc3RcIilcbiAgICB9XSwgWyR7XG4gICAgICBkZWZpbmVzLmdldChcInN0cm9uZ01hcEFyZ0xpc3RcIilcbiAgICB9XSk7XG4gICAgcmV0dXJuIHRoaXMuI3Jvb3QuZGVsZXRlKF9fa2V5X18pO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZ2V0XCIsIDIpfVxuICBnZXQoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSk7XG4gICAgY29uc3QgX19rZXlfXyA9IHRoaXMuI2tleUNvbXBvc2VyLmdldEtleUlmRXhpc3RzKFske1xuICAgICAgZGVmaW5lcy5nZXQoXCJ3ZWFrTWFwQXJnTGlzdFwiKVxuICAgIH1dLCBbJHtcbiAgICAgIGRlZmluZXMuZ2V0KFwic3Ryb25nTWFwQXJnTGlzdFwiKVxuICAgIH1dKTtcbiAgICByZXR1cm4gX19rZXlfXyA/IHRoaXMuI3Jvb3QuZ2V0KF9fa2V5X18pIDogdW5kZWZpbmVkO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaGFzXCIsIDIpfVxuICBoYXMoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSk7XG5cbiAgICBjb25zdCBfX2tleV9fID0gdGhpcy4ja2V5Q29tcG9zZXIuZ2V0S2V5SWZFeGlzdHMoWyR7XG4gICAgICBkZWZpbmVzLmdldChcIndlYWtNYXBBcmdMaXN0XCIpXG4gICAgfV0sIFske1xuICAgICAgZGVmaW5lcy5nZXQoXCJzdHJvbmdNYXBBcmdMaXN0XCIpXG4gICAgfV0pO1xuICAgIHJldHVybiBfX2tleV9fID8gdGhpcy4jcm9vdC5oYXMoX19rZXlfXykgOiBmYWxzZTtcbiAgfVxuXG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZEtleVB1YmxpY1wiLCAyKX1cbiAgaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pIHtcbiAgICByZXR1cm4gdGhpcy4jaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pO1xuICB9XG5cbiR7XG4gIGRlZmluZXMuaGFzKFwidmFsaWRhdGVWYWx1ZVwiKSA/IGBcbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZFZhbHVlUHVibGljXCIsIDIpfVxuICBpc1ZhbGlkVmFsdWUodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy4jaXNWYWxpZFZhbHVlKHZhbHVlKTtcbiAgfVxuICBgIDogYGBcbn1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJzZXRcIiwgMil9XG4gIHNldCgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0sIHZhbHVlKSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSk7XG4gICAgJHtcbiAgICAgIGRlZmluZXMuaGFzKFwidmFsaWRhdGVWYWx1ZVwiKSA/IGBcbiAgICAgIGlmICghdGhpcy4jaXNWYWxpZFZhbHVlKHZhbHVlKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHZhbHVlIGlzIG5vdCB2YWxpZCFcIik7XG4gICAgYCA6IGBgXG4gICAgfVxuXG4gICAgY29uc3QgX19rZXlfXyA9IHRoaXMuI2tleUNvbXBvc2VyLmdldEtleShbJHtcbiAgICAgIGRlZmluZXMuZ2V0KFwid2Vha01hcEFyZ0xpc3RcIilcbiAgICB9XSwgWyR7XG4gICAgICBkZWZpbmVzLmdldChcInN0cm9uZ01hcEFyZ0xpc3RcIilcbiAgICB9XSk7XG4gICAgdGhpcy4jcm9vdC5zZXQoX19rZXlfXywgdmFsdWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZVZhbGlkS2V5XCIsIDIpfVxuICAjcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSkge1xuICAgIGlmICghdGhpcy4jaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIG9yZGVyZWQga2V5IHNldCBpcyBub3QgdmFsaWQhXCIpO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZEtleVByaXZhdGVcIiwgMil9XG4gICNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSkge1xuICAgIGlmICghdGhpcy4ja2V5Q29tcG9zZXIuaXNWYWxpZEZvcktleShbJHtcbiAgICAgIGRlZmluZXMuZ2V0KFwid2Vha01hcEFyZ0xpc3RcIilcbiAgICB9XSwgWyR7XG4gICAgICBkZWZpbmVzLmdldChcInN0cm9uZ01hcEFyZ0xpc3RcIilcbiAgICB9XSkpXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiR7ZGVmaW5lcy5nZXQoXCJ2YWxpZGF0ZUFyZ3VtZW50c1wiKSB8fCBcIlwifVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiR7ZGVmaW5lcy5oYXMoXCJ2YWxpZGF0ZVZhbHVlXCIpID8gYFxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkVmFsdWVQcml2YXRlXCIsIDIpfVxuICAjaXNWYWxpZFZhbHVlKHZhbHVlKSB7XG4gICAgJHtkZWZpbmVzLmdldChcInZhbGlkYXRlVmFsdWVcIil9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgYCA6IGBgfVxuXG4gIFtTeW1ib2wudG9TdHJpbmdUYWddID0gXCIke2RlZmluZXMuZ2V0KFwiY2xhc3NOYW1lXCIpfVwiO1xufVxuXG5PYmplY3QuZnJlZXplKCR7ZGVmaW5lcy5nZXQoXCJjbGFzc05hbWVcIil9KTtcbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX0ucHJvdG90eXBlKTtcbmBcbn1cblxuZXhwb3J0IGRlZmF1bHQgcHJlcHJvY2VzcztcbiJdfQ==