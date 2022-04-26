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
  ${docs.buildBlock("valueAndKeySet", 4)}

  ${docs.buildBlock("rootContainerMap", 4)}
  #root = new Map;

  /**
   * @type {KeyHasher}
   * @constant
   */
  #hasher = new KeyHasher();

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.set(...entry);
      }
    }
  }

${docs.buildBlock("getSize", 2)}
  get size() {
    return this.#root.size;
  }

${docs.buildBlock("clear", 2)}
  clear() {
    this.#root.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("argList")}) {${invokeValidate}
    const __hash__ = this.#hasher.getHashIfExists(${defines.get("argList")});
    return __hash__ ? this.#root.delete(__hash__) : false;
  }

${docs.buildBlock("entries", 2)}
  * entries() {
    for (let valueAndKeySet of this.#root.values())
      yield valueAndKeySet.keySet.concat(valueAndKeySet.value);
  }

${docs.buildBlock("forEachMap", 2)}
  forEach(callback, thisArg) {
    this.#root.forEach((valueAndKeySet) => {
      const args = valueAndKeySet.keySet.concat(this);
      args.unshift(valueAndKeySet.value);
      callback.apply(thisArg, [...args]);
    });
  }

${docs.buildBlock("forEachCallbackMap", 2)}

${docs.buildBlock("get", 2)}
  get(${defines.get("argList")}) {${invokeValidate}
    const __hash__ = this.#hasher.getHashIfExists(${defines.get("argList")});
    if (!__hash__)
      return undefined;

    const valueAndKeySet = this.#root.get(__hash__);
    return valueAndKeySet?.value;
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("argList")}) {${invokeValidate}
    const __hash__ = this.#hasher.getHashIfExists(${defines.get("argList")});
    return __hash__ ? this.#root.has(__hash__) : false;
  }

${defines.has("validateArguments") ? `
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

` : ``}

${docs.buildBlock("keys", 2)}
  * keys() {
    for (let valueAndKeySet of this.#root.values())
      yield valueAndKeySet.keySet.slice();
  }

${docs.buildBlock("set", 2)}
  set(${defines.get("argList")}, value) {${invokeValidate}
${defines.has("validateValue") ? `
  if (!this.#isValidValue(value))
    throw new Error("The value is not valid!");
` : ``}
    const __hash__ = this.#hasher.getHash(${defines.get("argList")});
    const __keySet__ = [${defines.get("argList")}];
    Object.freeze(__keySet__);
    this.#root.set(__hash__, {value, keySet: __keySet__});

    return this;
  }

${docs.buildBlock("values", 2)}
  * values() {
    for (let valueAndKeySet of this.#root.values())
      yield valueAndKeySet.value;
  }
${defines.has("validateArguments") ? `
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
${defines.has("validateValue") ? `
${docs.buildBlock("isValidValuePrivate", 2)}
  #isValidValue(value) {
    ${defines.get("validateValue")}
    return true;
  }
  ` : ``}

  [Symbol.iterator]() {
    return this.entries();
  }

  [Symbol.toStringTag] = "${defines.get("className")}";
}

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFwLmluLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1hcC5pbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxHQUFxQixTQUFTLFVBQVUsQ0FBQyxPQUE0QixFQUFFLElBQW9CO0lBQ3pHLElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQztJQUN4QixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtRQUNqQyxjQUFjLEdBQUcsK0JBQStCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztLQUM5RTtJQUVELE9BQU87RUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQzs7O1FBR3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO0lBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDOztJQUVwQyxJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBa0J4QyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7Ozs7O0VBSzdCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQzs7Ozs7RUFLM0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1dBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sY0FBYztvREFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzs7OztFQUl4RSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7Ozs7OztFQU03QixJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7Ozs7Ozs7OztFQVNoQyxJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQzs7RUFFeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sY0FBYztvREFDRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzs7Ozs7Ozs7RUFReEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sY0FBYztvREFDRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzs7OztFQUl4RSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ25DLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO2VBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDOzhCQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDOzs7RUFJbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDL0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7Ozs7R0FJdkMsQ0FBQyxDQUFDLENBQUMsRUFDSjs7Q0FFRCxDQUFDLENBQUMsQ0FBQyxFQUFFOztFQUVKLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzs7Ozs7O0VBTTFCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxhQUMxQixjQUNGO0VBRUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7OztDQUdoQyxDQUFDLENBQUMsQ0FBQyxFQUNKOzRDQUM0QyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzswQkFDeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7Ozs7Ozs7RUFPOUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDOzs7OztFQUs1QixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ25DLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO3FCQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzs0QkFDZixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzs7OztFQUloRCxJQUFJLENBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztnQkFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7RUFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQzs7O0NBR2pDLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDSixPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMvQixJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQzs7TUFFckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUM7OztHQUcvQixDQUFDLENBQUMsQ0FBQyxFQUFFOzs7Ozs7NEJBTW9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDOzs7Z0JBR3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO2dCQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztDQUN2QyxDQUFBO0FBQUEsQ0FBQyxDQUFBO0FBRUYsZUFBZSxVQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFByZXByb2Nlc3NvckRlZmluZXMsIEpTRG9jR2VuZXJhdG9yLCBUZW1wbGF0ZUZ1bmN0aW9uIH0gZnJvbSBcIi4uL3NoYXJlZFR5cGVzLm1qc1wiO1xuXG4vKipcbiAqIEBwYXJhbSB7TWFwfSAgICAgICAgICAgIGRlZmluZXMgVGhlIHByZXByb2Nlc3NvciBtYWNyb3MuXG4gKiBAcGFyYW0ge0pTRG9jR2VuZXJhdG9yfSBkb2NzICAgIFRoZSBwcmltYXJ5IGRvY3VtZW50YXRpb24gZ2VuZXJhdG9yLlxuICogQHJldHVybnMge3N0cmluZ30gICAgICAgICAgICAgICBUaGUgZ2VuZXJhdGVkIHNvdXJjZSBjb2RlLlxuICovXG5jb25zdCBwcmVwcm9jZXNzOiBUZW1wbGF0ZUZ1bmN0aW9uID0gZnVuY3Rpb24gcHJlcHJvY2VzcyhkZWZpbmVzOiBQcmVwcm9jZXNzb3JEZWZpbmVzLCBkb2NzOiBKU0RvY0dlbmVyYXRvcikge1xuICBsZXQgaW52b2tlVmFsaWRhdGUgPSBcIlwiO1xuICBpZiAoZGVmaW5lcy5oYXMoXCJpbnZva2VWYWxpZGF0ZVwiKSkge1xuICAgIGludm9rZVZhbGlkYXRlID0gYFxcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KTtcXG5gO1xuICB9XG5cbiAgcmV0dXJuIGBcbiR7ZGVmaW5lcy5nZXQoXCJpbXBvcnRMaW5lc1wiKX1cbmltcG9ydCBLZXlIYXNoZXIgZnJvbSBcIi4va2V5cy9IYXNoZXIubWpzXCI7XG5cbmNsYXNzICR7ZGVmaW5lcy5nZXQoXCJjbGFzc05hbWVcIil9IHtcbiAgJHtkb2NzLmJ1aWxkQmxvY2soXCJ2YWx1ZUFuZEtleVNldFwiLCA0KX1cblxuICAke2RvY3MuYnVpbGRCbG9jayhcInJvb3RDb250YWluZXJNYXBcIiwgNCl9XG4gICNyb290ID0gbmV3IE1hcDtcblxuICAvKipcbiAgICogQHR5cGUge0tleUhhc2hlcn1cbiAgICogQGNvbnN0YW50XG4gICAqL1xuICAjaGFzaGVyID0gbmV3IEtleUhhc2hlcigpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgaXRlcmFibGUgPSBhcmd1bWVudHNbMF07XG4gICAgICBmb3IgKGxldCBlbnRyeSBvZiBpdGVyYWJsZSkge1xuICAgICAgICB0aGlzLnNldCguLi5lbnRyeSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZ2V0U2l6ZVwiLCAyKX1cbiAgZ2V0IHNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuI3Jvb3Quc2l6ZTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImNsZWFyXCIsIDIpfVxuICBjbGVhcigpIHtcbiAgICB0aGlzLiNyb290LmNsZWFyKCk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJkZWxldGVcIiwgMil9XG4gIGRlbGV0ZSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pIHske2ludm9rZVZhbGlkYXRlfVxuICAgIGNvbnN0IF9faGFzaF9fID0gdGhpcy4jaGFzaGVyLmdldEhhc2hJZkV4aXN0cygke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pO1xuICAgIHJldHVybiBfX2hhc2hfXyA/IHRoaXMuI3Jvb3QuZGVsZXRlKF9faGFzaF9fKSA6IGZhbHNlO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZW50cmllc1wiLCAyKX1cbiAgKiBlbnRyaWVzKCkge1xuICAgIGZvciAobGV0IHZhbHVlQW5kS2V5U2V0IG9mIHRoaXMuI3Jvb3QudmFsdWVzKCkpXG4gICAgICB5aWVsZCB2YWx1ZUFuZEtleVNldC5rZXlTZXQuY29uY2F0KHZhbHVlQW5kS2V5U2V0LnZhbHVlKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImZvckVhY2hNYXBcIiwgMil9XG4gIGZvckVhY2goY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICB0aGlzLiNyb290LmZvckVhY2goKHZhbHVlQW5kS2V5U2V0KSA9PiB7XG4gICAgICBjb25zdCBhcmdzID0gdmFsdWVBbmRLZXlTZXQua2V5U2V0LmNvbmNhdCh0aGlzKTtcbiAgICAgIGFyZ3MudW5zaGlmdCh2YWx1ZUFuZEtleVNldC52YWx1ZSk7XG4gICAgICBjYWxsYmFjay5hcHBseSh0aGlzQXJnLCBbLi4uYXJnc10pO1xuICAgIH0pO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZm9yRWFjaENhbGxiYWNrTWFwXCIsIDIpfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImdldFwiLCAyKX1cbiAgZ2V0KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSkgeyR7aW52b2tlVmFsaWRhdGV9XG4gICAgY29uc3QgX19oYXNoX18gPSB0aGlzLiNoYXNoZXIuZ2V0SGFzaElmRXhpc3RzKCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSk7XG4gICAgaWYgKCFfX2hhc2hfXylcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgICBjb25zdCB2YWx1ZUFuZEtleVNldCA9IHRoaXMuI3Jvb3QuZ2V0KF9faGFzaF9fKTtcbiAgICByZXR1cm4gdmFsdWVBbmRLZXlTZXQ/LnZhbHVlO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaGFzXCIsIDIpfVxuICBoYXMoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KSB7JHtpbnZva2VWYWxpZGF0ZX1cbiAgICBjb25zdCBfX2hhc2hfXyA9IHRoaXMuI2hhc2hlci5nZXRIYXNoSWZFeGlzdHMoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KTtcbiAgICByZXR1cm4gX19oYXNoX18gPyB0aGlzLiNyb290LmhhcyhfX2hhc2hfXykgOiBmYWxzZTtcbiAgfVxuXG4ke2RlZmluZXMuaGFzKFwidmFsaWRhdGVBcmd1bWVudHNcIikgPyBgXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRLZXlQdWJsaWNcIiwgMil9XG4gIGlzVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KSB7XG4gICAgcmV0dXJuIHRoaXMuI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KTtcbiAgfVxuXG4ke1xuICBkZWZpbmVzLmhhcyhcInZhbGlkYXRlVmFsdWVcIikgPyBgXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRWYWx1ZVB1YmxpY1wiLCAyKX1cbiAgaXNWYWxpZFZhbHVlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuI2lzVmFsaWRWYWx1ZSh2YWx1ZSk7XG4gIH1cbiAgYCA6IGBgXG4gIH1cblxuYCA6IGBgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImtleXNcIiwgMil9XG4gICoga2V5cygpIHtcbiAgICBmb3IgKGxldCB2YWx1ZUFuZEtleVNldCBvZiB0aGlzLiNyb290LnZhbHVlcygpKVxuICAgICAgeWllbGQgdmFsdWVBbmRLZXlTZXQua2V5U2V0LnNsaWNlKCk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJzZXRcIiwgMil9XG4gIHNldCgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0sIHZhbHVlKSB7JHtcbiAgICBpbnZva2VWYWxpZGF0ZVxuICB9XG4ke1xuICBkZWZpbmVzLmhhcyhcInZhbGlkYXRlVmFsdWVcIikgPyBgXG4gIGlmICghdGhpcy4jaXNWYWxpZFZhbHVlKHZhbHVlKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgdmFsdWUgaXMgbm90IHZhbGlkIVwiKTtcbmAgOiBgYFxufVxuICAgIGNvbnN0IF9faGFzaF9fID0gdGhpcy4jaGFzaGVyLmdldEhhc2goJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KTtcbiAgICBjb25zdCBfX2tleVNldF9fID0gWyR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfV07XG4gICAgT2JqZWN0LmZyZWV6ZShfX2tleVNldF9fKTtcbiAgICB0aGlzLiNyb290LnNldChfX2hhc2hfXywge3ZhbHVlLCBrZXlTZXQ6IF9fa2V5U2V0X199KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwidmFsdWVzXCIsIDIpfVxuICAqIHZhbHVlcygpIHtcbiAgICBmb3IgKGxldCB2YWx1ZUFuZEtleVNldCBvZiB0aGlzLiNyb290LnZhbHVlcygpKVxuICAgICAgeWllbGQgdmFsdWVBbmRLZXlTZXQudmFsdWU7XG4gIH1cbiR7ZGVmaW5lcy5oYXMoXCJ2YWxpZGF0ZUFyZ3VtZW50c1wiKSA/IGBcbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZVZhbGlkS2V5XCIsIDIpfVxuICAjcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSkge1xuICAgIGlmICghdGhpcy4jaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIG9yZGVyZWQga2V5IHNldCBpcyBub3QgdmFsaWQhXCIpO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZEtleVByaXZhdGVcIiwgMil9XG4gICNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSkge1xuJHtkZWZpbmVzLmdldChcInZhbGlkYXRlQXJndW1lbnRzXCIpfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5gIDogYGB9XG4ke2RlZmluZXMuaGFzKFwidmFsaWRhdGVWYWx1ZVwiKSA/IGBcbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZFZhbHVlUHJpdmF0ZVwiLCAyKX1cbiAgI2lzVmFsaWRWYWx1ZSh2YWx1ZSkge1xuICAgICR7ZGVmaW5lcy5nZXQoXCJ2YWxpZGF0ZVZhbHVlXCIpfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGAgOiBgYH1cblxuICBbU3ltYm9sLml0ZXJhdG9yXSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzKCk7XG4gIH1cblxuICBbU3ltYm9sLnRvU3RyaW5nVGFnXSA9IFwiJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX1cIjtcbn1cblxuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuZ2V0KFwiY2xhc3NOYW1lXCIpfSk7XG5PYmplY3QuZnJlZXplKCR7ZGVmaW5lcy5nZXQoXCJjbGFzc05hbWVcIil9LnByb3RvdHlwZSk7XG5gfVxuXG5leHBvcnQgZGVmYXVsdCBwcmVwcm9jZXNzO1xuIl19