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

class ${defines.className} extends ${defines.weakMapKeys.length ? "Weak" : ""}Map {
${defines.invokeValidate ? `
  delete(${defines.argList}) {${invokeValidate}
    return super.delete(${defines.argList});
  }

  get(${defines.argList}) {${invokeValidate}
    return super.get(${defines.argList});
  }

  has(${defines.argList}) {${invokeValidate}
    return super.has(${defines.argList});
  }
` : ``}

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

${defines.invokeValidate ? `
${docs.buildBlock("set", 2)}
  set(${defines.argList}, value) {${invokeValidate}
  ${defines.validateValue ? `
    if (!this.#isValidValue(value))
      throw new Error("The value is not valid!");
  ` : ``}
    return super.set(${defines.argList}, value);
  }
` : ``}

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

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFwLmluLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1hcC5pbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxHQUFxQixTQUFTLFVBQVUsQ0FBQyxPQUF3QixFQUFFLElBQW9CO0lBQ3JHLElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQztJQUN4QixJQUFJLE9BQU8sQ0FBQyxjQUFjLEVBQUU7UUFDMUIsY0FBYyxHQUFHLCtCQUErQixPQUFPLENBQUMsT0FBTyxNQUFNLENBQUM7S0FDdkU7SUFFRCxPQUFPO0VBQ1AsT0FBTyxDQUFDLFdBQVc7O1FBRWIsT0FBTyxDQUFDLFNBQVMsWUFBWSxPQUFPLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQzNFLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1dBQ2hCLE9BQU8sQ0FBQyxPQUFPLE1BQU0sY0FBYzswQkFDcEIsT0FBTyxDQUFDLE9BQU87OztRQUdqQyxPQUFPLENBQUMsT0FBTyxNQUFNLGNBQWM7dUJBQ3BCLE9BQU8sQ0FBQyxPQUFPOzs7UUFHOUIsT0FBTyxDQUFDLE9BQU8sTUFBTSxjQUFjO3VCQUNwQixPQUFPLENBQUMsT0FBTzs7Q0FFckMsQ0FBQyxDQUFDLENBQUMsRUFBRTs7RUFFSixPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO0VBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO2VBQ3pCLE9BQU8sQ0FBQyxPQUFPOzhCQUNBLE9BQU8sQ0FBQyxPQUFPOzs7RUFJM0MsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7RUFDeEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7Ozs7R0FJdkMsQ0FBQyxDQUFDLENBQUMsRUFDSjs7Q0FFRCxDQUFDLENBQUMsQ0FBQyxFQUFFOztFQUVKLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO0VBQ3pCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsT0FBTyxhQUFhLGNBQWM7SUFFOUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7OztHQUd6QixDQUFDLENBQUMsQ0FBQyxFQUNKO3VCQUNxQixPQUFPLENBQUMsT0FBTzs7Q0FFckMsQ0FBQyxDQUFDLENBQUMsRUFBRTs7RUFFSixPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO0VBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO3FCQUNsQixPQUFPLENBQUMsT0FBTzs0QkFDUixPQUFPLENBQUMsT0FBTzs7OztFQUl6QyxJQUFJLENBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztnQkFDekIsT0FBTyxDQUFDLE9BQU87RUFDN0IsT0FBTyxDQUFDLGlCQUFpQjs7O0NBRzFCLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDSixPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztFQUN4QixJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQzs7TUFFckMsT0FBTyxDQUFDLGFBQWE7OztHQUd4QixDQUFDLENBQUMsQ0FBQyxFQUFFOzs0QkFFb0IsT0FBTyxDQUFDLFNBQVM7OztnQkFHN0IsT0FBTyxDQUFDLFNBQVM7Z0JBQ2pCLE9BQU8sQ0FBQyxTQUFTO0NBQ2hDLENBQUM7QUFDRixDQUFDLENBQUE7QUFFRCxlQUFlLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUmVhZG9ubHlEZWZpbmVzLCBKU0RvY0dlbmVyYXRvciwgVGVtcGxhdGVGdW5jdGlvbiB9IGZyb20gXCIuLi9zaGFyZWRUeXBlcy5tanNcIjtcblxuLyoqXG4gKiBAcGFyYW0ge01hcH0gICAgICAgICAgICBkZWZpbmVzIFRoZSBwcmVwcm9jZXNzb3IgbWFjcm9zLlxuICogQHBhcmFtIHtKU0RvY0dlbmVyYXRvcn0gZG9jcyAgICBUaGUgcHJpbWFyeSBkb2N1bWVudGF0aW9uIGdlbmVyYXRvci5cbiAqIEByZXR1cm5zIHtzdHJpbmd9ICAgICAgICAgICAgICAgVGhlIGdlbmVyYXRlZCBzb3VyY2UgY29kZS5cbiAqL1xuY29uc3QgcHJlcHJvY2VzczogVGVtcGxhdGVGdW5jdGlvbiA9IGZ1bmN0aW9uIHByZXByb2Nlc3MoZGVmaW5lczogUmVhZG9ubHlEZWZpbmVzLCBkb2NzOiBKU0RvY0dlbmVyYXRvcikge1xuICBsZXQgaW52b2tlVmFsaWRhdGUgPSBcIlwiO1xuICBpZiAoZGVmaW5lcy5pbnZva2VWYWxpZGF0ZSkge1xuICAgIGludm9rZVZhbGlkYXRlID0gYFxcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KTtcXG5gO1xuICB9XG5cbiAgcmV0dXJuIGBcbiR7ZGVmaW5lcy5pbXBvcnRMaW5lc31cblxuY2xhc3MgJHtkZWZpbmVzLmNsYXNzTmFtZX0gZXh0ZW5kcyAke2RlZmluZXMud2Vha01hcEtleXMubGVuZ3RoID8gXCJXZWFrXCIgOiBcIlwifU1hcCB7XG4ke2RlZmluZXMuaW52b2tlVmFsaWRhdGUgPyBgXG4gIGRlbGV0ZSgke2RlZmluZXMuYXJnTGlzdH0pIHske2ludm9rZVZhbGlkYXRlfVxuICAgIHJldHVybiBzdXBlci5kZWxldGUoJHtkZWZpbmVzLmFyZ0xpc3R9KTtcbiAgfVxuXG4gIGdldCgke2RlZmluZXMuYXJnTGlzdH0pIHske2ludm9rZVZhbGlkYXRlfVxuICAgIHJldHVybiBzdXBlci5nZXQoJHtkZWZpbmVzLmFyZ0xpc3R9KTtcbiAgfVxuXG4gIGhhcygke2RlZmluZXMuYXJnTGlzdH0pIHske2ludm9rZVZhbGlkYXRlfVxuICAgIHJldHVybiBzdXBlci5oYXMoJHtkZWZpbmVzLmFyZ0xpc3R9KTtcbiAgfVxuYCA6IGBgfVxuXG4ke2RlZmluZXMudmFsaWRhdGVBcmd1bWVudHMgPyBgXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRLZXlQdWJsaWNcIiwgMil9XG4gIGlzVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KSB7XG4gICAgcmV0dXJuIHRoaXMuI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KTtcbiAgfVxuXG4ke1xuICBkZWZpbmVzLnZhbGlkYXRlVmFsdWUgPyBgXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRWYWx1ZVB1YmxpY1wiLCAyKX1cbiAgaXNWYWxpZFZhbHVlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuI2lzVmFsaWRWYWx1ZSh2YWx1ZSk7XG4gIH1cbiAgYCA6IGBgXG4gIH1cblxuYCA6IGBgfVxuXG4ke2RlZmluZXMuaW52b2tlVmFsaWRhdGUgPyBgXG4ke2RvY3MuYnVpbGRCbG9jayhcInNldFwiLCAyKX1cbiAgc2V0KCR7ZGVmaW5lcy5hcmdMaXN0fSwgdmFsdWUpIHske2ludm9rZVZhbGlkYXRlfVxuICAke1xuICAgIGRlZmluZXMudmFsaWRhdGVWYWx1ZSA/IGBcbiAgICBpZiAoIXRoaXMuI2lzVmFsaWRWYWx1ZSh2YWx1ZSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgdmFsdWUgaXMgbm90IHZhbGlkIVwiKTtcbiAgYCA6IGBgXG4gIH1cbiAgICByZXR1cm4gc3VwZXIuc2V0KCR7ZGVmaW5lcy5hcmdMaXN0fSwgdmFsdWUpO1xuICB9XG5gIDogYGB9XG5cbiR7ZGVmaW5lcy52YWxpZGF0ZUFyZ3VtZW50cyA/IGBcbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZVZhbGlkS2V5XCIsIDIpfVxuICAjcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5hcmdMaXN0fSkge1xuICAgIGlmICghdGhpcy4jaXNWYWxpZEtleSgke2RlZmluZXMuYXJnTGlzdH0pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIG9yZGVyZWQga2V5IHNldCBpcyBub3QgdmFsaWQhXCIpO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZEtleVByaXZhdGVcIiwgMil9XG4gICNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5hcmdMaXN0fSkge1xuJHtkZWZpbmVzLnZhbGlkYXRlQXJndW1lbnRzfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5gIDogYGB9XG4ke2RlZmluZXMudmFsaWRhdGVWYWx1ZSA/IGBcbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZFZhbHVlUHJpdmF0ZVwiLCAyKX1cbiAgI2lzVmFsaWRWYWx1ZSh2YWx1ZSkge1xuICAgICR7ZGVmaW5lcy52YWxpZGF0ZVZhbHVlfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGAgOiBgYH1cblxuICBbU3ltYm9sLnRvU3RyaW5nVGFnXSA9IFwiJHtkZWZpbmVzLmNsYXNzTmFtZX1cIjtcbn1cblxuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuY2xhc3NOYW1lfSk7XG5PYmplY3QuZnJlZXplKCR7ZGVmaW5lcy5jbGFzc05hbWV9LnByb3RvdHlwZSk7XG5gO1xufVxuXG5leHBvcnQgZGVmYXVsdCBwcmVwcm9jZXNzO1xuIl19