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
  delete(${defines.argList}) {${invokeValidate}
    const __hash__ = this.#hasher.getHashIfExists(${defines.argList});
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
  get(${defines.argList}) {${invokeValidate}
    const __hash__ = this.#hasher.getHashIfExists(${defines.argList});
    if (!__hash__)
      return undefined;

    const valueAndKeySet = this.#root.get(__hash__);
    return valueAndKeySet?.value;
  }

${docs.buildBlock("has", 2)}
  has(${defines.argList}) {${invokeValidate}
    const __hash__ = this.#hasher.getHashIfExists(${defines.argList});
    return __hash__ ? this.#root.has(__hash__) : false;
  }

${defines.validateArguments ? `
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

` : ``}

${docs.buildBlock("keys", 2)}
  * keys() {
    for (let valueAndKeySet of this.#root.values())
      yield valueAndKeySet.keySet.slice();
  }

${docs.buildBlock("set", 2)}
  set(${defines.argList}, value) {${invokeValidate}
${defines.validateValue ? `
  if (!this.#isValidValue(value))
    throw new Error("The value is not valid!");
` : ``}
    const __hash__ = this.#hasher.getHash(${defines.argList});
    const __keySet__ = [${defines.argList}];
    Object.freeze(__keySet__);
    this.#root.set(__hash__, {value, keySet: __keySet__});

    return this;
  }

${docs.buildBlock("values", 2)}
  * values() {
    for (let valueAndKeySet of this.#root.values())
      yield valueAndKeySet.value;
  }
${defines.validateArguments ? `
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
${defines.validateValue ? `
${docs.buildBlock("isValidValuePrivate", 2)}
  #isValidValue(value) {
    ${defines.validateValue}
    return true;
  }
  ` : ``}

  [Symbol.iterator]() {
    return this.entries();
  }

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFwLmluLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1hcC5pbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxHQUFxQixTQUFTLFVBQVUsQ0FBQyxPQUF3QixFQUFFLElBQW9CO0lBQ3JHLElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQztJQUN4QixJQUFJLE9BQU8sQ0FBQyxjQUFjLEVBQUU7UUFDMUIsY0FBYyxHQUFHLCtCQUErQixPQUFPLENBQUMsT0FBTyxNQUFNLENBQUM7S0FDdkU7SUFFRCxPQUFPO0VBQ1AsT0FBTyxDQUFDLFdBQVc7OztRQUdiLE9BQU8sQ0FBQyxTQUFTO0lBQ3JCLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDOztJQUVwQyxJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBa0J4QyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7Ozs7O0VBSzdCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQzs7Ozs7RUFLM0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1dBQ25CLE9BQU8sQ0FBQyxPQUFPLE1BQU0sY0FBYztvREFDTSxPQUFPLENBQUMsT0FBTzs7OztFQUlqRSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7Ozs7OztFQU03QixJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7Ozs7Ozs7OztFQVNoQyxJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQzs7RUFFeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ25CLE9BQU8sQ0FBQyxPQUFPLE1BQU0sY0FBYztvREFDUyxPQUFPLENBQUMsT0FBTzs7Ozs7Ozs7RUFRakUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ25CLE9BQU8sQ0FBQyxPQUFPLE1BQU0sY0FBYztvREFDUyxPQUFPLENBQUMsT0FBTzs7OztFQUlqRSxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO0VBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO2VBQ3pCLE9BQU8sQ0FBQyxPQUFPOzhCQUNBLE9BQU8sQ0FBQyxPQUFPOzs7RUFJM0MsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7RUFDeEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7Ozs7R0FJdkMsQ0FBQyxDQUFDLENBQUMsRUFDSjs7Q0FFRCxDQUFDLENBQUMsQ0FBQyxFQUFFOztFQUVKLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzs7Ozs7O0VBTTFCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsT0FBTyxhQUNuQixjQUNGO0VBRUEsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7OztDQUd6QixDQUFDLENBQUMsQ0FBQyxFQUNKOzRDQUM0QyxPQUFPLENBQUMsT0FBTzswQkFDakMsT0FBTyxDQUFDLE9BQU87Ozs7Ozs7RUFPdkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDOzs7OztFQUs1QixPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO0VBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO3FCQUNsQixPQUFPLENBQUMsT0FBTzs0QkFDUixPQUFPLENBQUMsT0FBTzs7OztFQUl6QyxJQUFJLENBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztnQkFDekIsT0FBTyxDQUFDLE9BQU87RUFDN0IsT0FBTyxDQUFDLGlCQUFpQjs7O0NBRzFCLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDSixPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztFQUN4QixJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQzs7TUFFckMsT0FBTyxDQUFDLGFBQWE7OztHQUd4QixDQUFDLENBQUMsQ0FBQyxFQUFFOzs7Ozs7NEJBTW9CLE9BQU8sQ0FBQyxTQUFTOzs7Z0JBRzdCLE9BQU8sQ0FBQyxTQUFTO2dCQUNqQixPQUFPLENBQUMsU0FBUztDQUNoQyxDQUFBO0FBQUEsQ0FBQyxDQUFBO0FBRUYsZUFBZSxVQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFJlYWRvbmx5RGVmaW5lcywgSlNEb2NHZW5lcmF0b3IsIFRlbXBsYXRlRnVuY3Rpb24gfSBmcm9tIFwiLi4vc2hhcmVkVHlwZXMubWpzXCI7XG5cbi8qKlxuICogQHBhcmFtIHtNYXB9ICAgICAgICAgICAgZGVmaW5lcyBUaGUgcHJlcHJvY2Vzc29yIG1hY3Jvcy5cbiAqIEBwYXJhbSB7SlNEb2NHZW5lcmF0b3J9IGRvY3MgICAgVGhlIHByaW1hcnkgZG9jdW1lbnRhdGlvbiBnZW5lcmF0b3IuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSAgICAgICAgICAgICAgIFRoZSBnZW5lcmF0ZWQgc291cmNlIGNvZGUuXG4gKi9cbmNvbnN0IHByZXByb2Nlc3M6IFRlbXBsYXRlRnVuY3Rpb24gPSBmdW5jdGlvbiBwcmVwcm9jZXNzKGRlZmluZXM6IFJlYWRvbmx5RGVmaW5lcywgZG9jczogSlNEb2NHZW5lcmF0b3IpIHtcbiAgbGV0IGludm9rZVZhbGlkYXRlID0gXCJcIjtcbiAgaWYgKGRlZmluZXMuaW52b2tlVmFsaWRhdGUpIHtcbiAgICBpbnZva2VWYWxpZGF0ZSA9IGBcXG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5hcmdMaXN0fSk7XFxuYDtcbiAgfVxuXG4gIHJldHVybiBgXG4ke2RlZmluZXMuaW1wb3J0TGluZXN9XG5pbXBvcnQgS2V5SGFzaGVyIGZyb20gXCIuL2tleXMvSGFzaGVyLm1qc1wiO1xuXG5jbGFzcyAke2RlZmluZXMuY2xhc3NOYW1lfSB7XG4gICR7ZG9jcy5idWlsZEJsb2NrKFwidmFsdWVBbmRLZXlTZXRcIiwgNCl9XG5cbiAgJHtkb2NzLmJ1aWxkQmxvY2soXCJyb290Q29udGFpbmVyTWFwXCIsIDQpfVxuICAjcm9vdCA9IG5ldyBNYXA7XG5cbiAgLyoqXG4gICAqIEB0eXBlIHtLZXlIYXNoZXJ9XG4gICAqIEBjb25zdGFudFxuICAgKi9cbiAgI2hhc2hlciA9IG5ldyBLZXlIYXNoZXIoKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGl0ZXJhYmxlID0gYXJndW1lbnRzWzBdO1xuICAgICAgZm9yIChsZXQgZW50cnkgb2YgaXRlcmFibGUpIHtcbiAgICAgICAgdGhpcy5zZXQoLi4uZW50cnkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImdldFNpemVcIiwgMil9XG4gIGdldCBzaXplKCkge1xuICAgIHJldHVybiB0aGlzLiNyb290LnNpemU7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJjbGVhclwiLCAyKX1cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy4jcm9vdC5jbGVhcigpO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZGVsZXRlXCIsIDIpfVxuICBkZWxldGUoJHtkZWZpbmVzLmFyZ0xpc3R9KSB7JHtpbnZva2VWYWxpZGF0ZX1cbiAgICBjb25zdCBfX2hhc2hfXyA9IHRoaXMuI2hhc2hlci5nZXRIYXNoSWZFeGlzdHMoJHtkZWZpbmVzLmFyZ0xpc3R9KTtcbiAgICByZXR1cm4gX19oYXNoX18gPyB0aGlzLiNyb290LmRlbGV0ZShfX2hhc2hfXykgOiBmYWxzZTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImVudHJpZXNcIiwgMil9XG4gICogZW50cmllcygpIHtcbiAgICBmb3IgKGxldCB2YWx1ZUFuZEtleVNldCBvZiB0aGlzLiNyb290LnZhbHVlcygpKVxuICAgICAgeWllbGQgdmFsdWVBbmRLZXlTZXQua2V5U2V0LmNvbmNhdCh2YWx1ZUFuZEtleVNldC52YWx1ZSk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJmb3JFYWNoTWFwXCIsIDIpfVxuICBmb3JFYWNoKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgdGhpcy4jcm9vdC5mb3JFYWNoKCh2YWx1ZUFuZEtleVNldCkgPT4ge1xuICAgICAgY29uc3QgYXJncyA9IHZhbHVlQW5kS2V5U2V0LmtleVNldC5jb25jYXQodGhpcyk7XG4gICAgICBhcmdzLnVuc2hpZnQodmFsdWVBbmRLZXlTZXQudmFsdWUpO1xuICAgICAgY2FsbGJhY2suYXBwbHkodGhpc0FyZywgWy4uLmFyZ3NdKTtcbiAgICB9KTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImZvckVhY2hDYWxsYmFja01hcFwiLCAyKX1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJnZXRcIiwgMil9XG4gIGdldCgke2RlZmluZXMuYXJnTGlzdH0pIHske2ludm9rZVZhbGlkYXRlfVxuICAgIGNvbnN0IF9faGFzaF9fID0gdGhpcy4jaGFzaGVyLmdldEhhc2hJZkV4aXN0cygke2RlZmluZXMuYXJnTGlzdH0pO1xuICAgIGlmICghX19oYXNoX18pXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuXG4gICAgY29uc3QgdmFsdWVBbmRLZXlTZXQgPSB0aGlzLiNyb290LmdldChfX2hhc2hfXyk7XG4gICAgcmV0dXJuIHZhbHVlQW5kS2V5U2V0Py52YWx1ZTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImhhc1wiLCAyKX1cbiAgaGFzKCR7ZGVmaW5lcy5hcmdMaXN0fSkgeyR7aW52b2tlVmFsaWRhdGV9XG4gICAgY29uc3QgX19oYXNoX18gPSB0aGlzLiNoYXNoZXIuZ2V0SGFzaElmRXhpc3RzKCR7ZGVmaW5lcy5hcmdMaXN0fSk7XG4gICAgcmV0dXJuIF9faGFzaF9fID8gdGhpcy4jcm9vdC5oYXMoX19oYXNoX18pIDogZmFsc2U7XG4gIH1cblxuJHtkZWZpbmVzLnZhbGlkYXRlQXJndW1lbnRzID8gYFxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHVibGljXCIsIDIpfVxuICBpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5hcmdMaXN0fSkge1xuICAgIHJldHVybiB0aGlzLiNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5hcmdMaXN0fSk7XG4gIH1cblxuJHtcbiAgZGVmaW5lcy52YWxpZGF0ZVZhbHVlID8gYFxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkVmFsdWVQdWJsaWNcIiwgMil9XG4gIGlzVmFsaWRWYWx1ZSh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLiNpc1ZhbGlkVmFsdWUodmFsdWUpO1xuICB9XG4gIGAgOiBgYFxuICB9XG5cbmAgOiBgYH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJrZXlzXCIsIDIpfVxuICAqIGtleXMoKSB7XG4gICAgZm9yIChsZXQgdmFsdWVBbmRLZXlTZXQgb2YgdGhpcy4jcm9vdC52YWx1ZXMoKSlcbiAgICAgIHlpZWxkIHZhbHVlQW5kS2V5U2V0LmtleVNldC5zbGljZSgpO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwic2V0XCIsIDIpfVxuICBzZXQoJHtkZWZpbmVzLmFyZ0xpc3R9LCB2YWx1ZSkgeyR7XG4gICAgaW52b2tlVmFsaWRhdGVcbiAgfVxuJHtcbiAgZGVmaW5lcy52YWxpZGF0ZVZhbHVlID8gYFxuICBpZiAoIXRoaXMuI2lzVmFsaWRWYWx1ZSh2YWx1ZSkpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHZhbHVlIGlzIG5vdCB2YWxpZCFcIik7XG5gIDogYGBcbn1cbiAgICBjb25zdCBfX2hhc2hfXyA9IHRoaXMuI2hhc2hlci5nZXRIYXNoKCR7ZGVmaW5lcy5hcmdMaXN0fSk7XG4gICAgY29uc3QgX19rZXlTZXRfXyA9IFske2RlZmluZXMuYXJnTGlzdH1dO1xuICAgIE9iamVjdC5mcmVlemUoX19rZXlTZXRfXyk7XG4gICAgdGhpcy4jcm9vdC5zZXQoX19oYXNoX18sIHt2YWx1ZSwga2V5U2V0OiBfX2tleVNldF9ffSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcInZhbHVlc1wiLCAyKX1cbiAgKiB2YWx1ZXMoKSB7XG4gICAgZm9yIChsZXQgdmFsdWVBbmRLZXlTZXQgb2YgdGhpcy4jcm9vdC52YWx1ZXMoKSlcbiAgICAgIHlpZWxkIHZhbHVlQW5kS2V5U2V0LnZhbHVlO1xuICB9XG4ke2RlZmluZXMudmFsaWRhdGVBcmd1bWVudHMgPyBgXG4ke2RvY3MuYnVpbGRCbG9jayhcInJlcXVpcmVWYWxpZEtleVwiLCAyKX1cbiAgI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuYXJnTGlzdH0pIHtcbiAgICBpZiAoIXRoaXMuI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBvcmRlcmVkIGtleSBzZXQgaXMgbm90IHZhbGlkIVwiKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRLZXlQcml2YXRlXCIsIDIpfVxuICAjaXNWYWxpZEtleSgke2RlZmluZXMuYXJnTGlzdH0pIHtcbiR7ZGVmaW5lcy52YWxpZGF0ZUFyZ3VtZW50c31cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuYCA6IGBgfVxuJHtkZWZpbmVzLnZhbGlkYXRlVmFsdWUgPyBgXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRWYWx1ZVByaXZhdGVcIiwgMil9XG4gICNpc1ZhbGlkVmFsdWUodmFsdWUpIHtcbiAgICAke2RlZmluZXMudmFsaWRhdGVWYWx1ZX1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBgIDogYGB9XG5cbiAgW1N5bWJvbC5pdGVyYXRvcl0oKSB7XG4gICAgcmV0dXJuIHRoaXMuZW50cmllcygpO1xuICB9XG5cbiAgW1N5bWJvbC50b1N0cmluZ1RhZ10gPSBcIiR7ZGVmaW5lcy5jbGFzc05hbWV9XCI7XG59XG5cbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmNsYXNzTmFtZX0pO1xuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuY2xhc3NOYW1lfS5wcm90b3R5cGUpO1xuYH1cblxuZXhwb3J0IGRlZmF1bHQgcHJlcHJvY2VzcztcbiJdfQ==