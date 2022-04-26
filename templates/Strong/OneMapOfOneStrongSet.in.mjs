/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    let invokeValidate = "", invokeMapValidate = "";
    if (defines.has("invokeValidate")) {
        invokeValidate = `\n    this.#requireValidKey(${defines.get("argList")});\n`;
    }
    if (defines.has("validateMapArguments")) {
        invokeMapValidate = `\n    this.#requireValidMapKey(${defines.get("mapArgList")});\n`;
    }
    return `
${defines.get("importLines")}

class ${defines.get("className")} {
  /** @type {Map<${defines.get("mapArgument0Type")}, Set<${defines.get("setArgument0Type")}>>} @constant */
  #outerMap = new Map();

  /** @type {number} */
  #sizeOfAll = 0;

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
    return this.#sizeOfAll;
  }

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${defines.get("mapArgList")}) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")})
    return __innerSet__?.size || 0;
  }

${docs.buildBlock("mapSize", 2)}
  get mapSize() {
    return this.#outerMap.size;
  }

${docs.buildBlock("add", 2)}
  add(${defines.get("mapArgList")}, ${defines.get("setArgument0")}) {${invokeValidate}
    if (!this.#outerMap.has(${defines.get("mapArgument0")}))
      this.#outerMap.set(${defines.get("mapArgument0")}, new Set);

    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")});

    if (!__innerSet__.has(${defines.get("setArgument0")})) {
      __innerSet__.add(${defines.get("setArgument0")});
      this.#sizeOfAll++;
    }

    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.get("mapArgList")}, __sets__) {${invokeMapValidate}
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.get("setCount")}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.get("setCount")} argument${defines.get("setCount") > 1 ? "s" : ""}!\`);
      }
      ${defines.has("invokeValidate") ? `this.#requireValidKey(${defines.get("mapArgList")}, ...__set__);` : ""}

      return __set__;
    });

    if (!this.#outerMap.has(${defines.get("mapArgument0")}))
      this.#outerMap.set(${defines.get("mapArgument0")}, new Set);

    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")});

    __array__.forEach(__set__ => {
      if (!__innerSet__.has(__set__[0])) {
        __innerSet__.add(__set__[0]);
        this.#sizeOfAll++;
      }
    });

    return this;
  }

${docs.buildBlock("clear", 2)}
  clear() {
    this.#outerMap.clear();
    this.#sizeOfAll = 0;
  }

${docs.buildBlock("clearSets", 2)}
  clearSets(${defines.get("mapArgList")}) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerSet__)
      return;

    this.#sizeOfAll -= __innerSet__.size;
    __innerSet__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {${invokeValidate}
    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerSet__)
      return false;

    if (!__innerSet__.has(${defines.get("setArgument0")}))
      return false;

    __innerSet__.delete(${defines.get("setArgument0")});
    this.#sizeOfAll--;

    if (__innerSet__.size === 0) {
      this.#outerMap.delete(${defines.get("mapArgument0")});
    }

    return true;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.get("mapArgList")}) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerSet__)
      return false;

    this.#outerMap.delete(${defines.get("mapArgument0")});
    this.#sizeOfAll -= __innerSet__.size;
    return true;
  }

${docs.buildBlock("forEachSet", 2)}
  forEach(__callback__, __thisArg__) {
    this.#outerMap.forEach(
      (__innerSet__, ${defines.get("mapArgument0")}) => __innerSet__.forEach(
        ${defines.get("setArgument0")} => __callback__.apply(__thisArg__, [${defines.get("mapArgument0")}, ${defines.get("setArgument0")}, this])
      )
    );
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.get("mapArgument0")}, __callback__, __thisArg__) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerSet__)
      return;

    __innerSet__.forEach(
      ${defines.get("setArgument0")} => __callback__.apply(__thisArg__, [${defines.get("mapArgument0")}, ${defines.get("setArgument0")}, this])
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("has", 2)}
  has(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {${invokeValidate}
    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerSet__)
      return false;

    return __innerSet__.has(${defines.get("setArgument0")});
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.get("mapArgList")}) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")})
    return Boolean(__innerSet__);
  }

${defines.has("validateArguments") ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("argList")}) {
    return this.#isValidKey(${defines.get("argList")});
  }

  ` : ``}
${docs.buildBlock("values", 2)}
  * values() {
    const __outerIter__ = this.#outerMap.entries();

    for (let [${defines.get("mapArgument0")}, __innerSet__] of __outerIter__) {
      for (let ${defines.get("setArgument0")} of __innerSet__.values())
        yield [${defines.get("mapArgument0")}, ${defines.get("setArgument0")}];
    }
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.get("mapArgument0")}) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerSet__)
      return;

    for (let ${defines.get("setArgument0")} of __innerSet__.values())
      yield [${defines.get("mapArgument0")}, ${defines.get("setArgument0")}];
  }

${defines.has("validateArguments") ? `
${docs.buildBlock("requireValidKey", 2)}
    #requireValidKey(${defines.get("argList")}) {
      if (!this.#isValidKey(${defines.get("argList")}))
        throw new Error("The ordered key set is not valid!");
    }

${docs.buildBlock("isValidKeyPrivate", 2)}
    #isValidKey(${defines.get("argList")}) {
      void(${defines.get("argList")});

      ${defines.get("validateArguments")}
      return true;
    }

  ` : ``}

${defines.has("validateMapArguments") ? `
${docs.buildBlock("requireValidMapKey", 2)}
  #requireValidMapKey(${defines.get("mapArgList")}) {
    if (!this.#isValidMapKey(${defines.get("mapArgList")}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${defines.get("mapArgList")}) {
    void(${defines.get("mapArgList")});

    ${defines.get("validateMapArguments") || ""}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT25lTWFwT2ZPbmVTdHJvbmdTZXQuaW4ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiT25lTWFwT2ZPbmVTdHJvbmdTZXQuaW4ubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsR0FBcUIsU0FBUyxVQUFVLENBQUMsT0FBNEIsRUFBRSxJQUFvQjtJQUN6RyxJQUFJLGNBQWMsR0FBRyxFQUFFLEVBQUUsaUJBQWlCLEdBQUcsRUFBRSxDQUFDO0lBQ2hELElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1FBQ2pDLGNBQWMsR0FBRywrQkFBK0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0tBQzlFO0lBQ0QsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLEVBQUU7UUFDdkMsaUJBQWlCLEdBQUcsa0NBQWtDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztLQUN2RjtJQUVELE9BQU87RUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQzs7UUFFcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7bUJBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUM7Ozs7Ozs7Ozs7Ozs7OztFQWV4RixJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7Ozs7O0VBSzdCLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztpQkFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxpQkFBaUI7OENBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDOzs7O0VBSXZFLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQzs7Ozs7RUFLN0IsSUFB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Qzs7TUFFOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEVBQUU7OztHQUc1QyxDQUFDLENBQUMsQ0FBQyxFQUFFOzs7Ozs7NEJBTW9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDOzs7O2dCQUlwQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztnQkFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7Q0FDdkMsQ0FBQTtBQUFBLENBQUMsQ0FBQTtBQUVGLGVBQWUsVUFBVSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQcmVwcm9jZXNzb3JEZWZpbmVzLCBKU0RvY0dlbmVyYXRvciwgVGVtcGxhdGVGdW5jdGlvbiB9IGZyb20gXCIuLi9zaGFyZWRUeXBlcy5tanNcIjtcblxuLyoqXG4gKiBAcGFyYW0ge01hcH0gICAgICAgICAgICBkZWZpbmVzIFRoZSBwcmVwcm9jZXNzb3IgbWFjcm9zLlxuICogQHBhcmFtIHtKU0RvY0dlbmVyYXRvcn0gZG9jcyAgICBUaGUgcHJpbWFyeSBkb2N1bWVudGF0aW9uIGdlbmVyYXRvci5cbiAqIEByZXR1cm5zIHtzdHJpbmd9ICAgICAgICAgICAgICAgVGhlIGdlbmVyYXRlZCBzb3VyY2UgY29kZS5cbiAqL1xuY29uc3QgcHJlcHJvY2VzczogVGVtcGxhdGVGdW5jdGlvbiA9IGZ1bmN0aW9uIHByZXByb2Nlc3MoZGVmaW5lczogUHJlcHJvY2Vzc29yRGVmaW5lcywgZG9jczogSlNEb2NHZW5lcmF0b3IpIHtcbiAgbGV0IGludm9rZVZhbGlkYXRlID0gXCJcIiwgaW52b2tlTWFwVmFsaWRhdGUgPSBcIlwiO1xuICBpZiAoZGVmaW5lcy5oYXMoXCJpbnZva2VWYWxpZGF0ZVwiKSkge1xuICAgIGludm9rZVZhbGlkYXRlID0gYFxcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KTtcXG5gO1xuICB9XG4gIGlmIChkZWZpbmVzLmhhcyhcInZhbGlkYXRlTWFwQXJndW1lbnRzXCIpKSB7XG4gICAgaW52b2tlTWFwVmFsaWRhdGUgPSBgXFxuICAgIHRoaXMuI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xcbmA7XG4gIH1cblxuICByZXR1cm4gYFxuJHtkZWZpbmVzLmdldChcImltcG9ydExpbmVzXCIpfVxuXG5jbGFzcyAke2RlZmluZXMuZ2V0KFwiY2xhc3NOYW1lXCIpfSB7XG4gIC8qKiBAdHlwZSB7TWFwPCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBUeXBlXCIpfSwgU2V0PCR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBUeXBlXCIpfT4+fSBAY29uc3RhbnQgKi9cbiAgI291dGVyTWFwID0gbmV3IE1hcCgpO1xuXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAjc2l6ZU9mQWxsID0gMDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGl0ZXJhYmxlID0gYXJndW1lbnRzWzBdO1xuICAgICAgZm9yIChsZXQgZW50cnkgb2YgaXRlcmFibGUpIHtcbiAgICAgICAgdGhpcy5hZGQoLi4uZW50cnkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImdldFNpemVcIiwgMil9XG4gIGdldCBzaXplKCkge1xuICAgIHJldHVybiB0aGlzLiNzaXplT2ZBbGw7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJnZXRTaXplT2ZTZXRcIiwgMil9XG4gIGdldFNpemVPZlNldCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI291dGVyTWFwLmdldCgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSlcbiAgICByZXR1cm4gX19pbm5lclNldF9fPy5zaXplIHx8IDA7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJtYXBTaXplXCIsIDIpfVxuICBnZXQgbWFwU2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy4jb3V0ZXJNYXAuc2l6ZTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImFkZFwiLCAyKX1cbiAgYWRkKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ3VtZW50MFwiKX0pIHske2ludm9rZVZhbGlkYXRlfVxuICAgIGlmICghdGhpcy4jb3V0ZXJNYXAuaGFzKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KSlcbiAgICAgIHRoaXMuI291dGVyTWFwLnNldCgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSwgbmV3IFNldCk7XG5cbiAgICBjb25zdCBfX2lubmVyU2V0X18gPSB0aGlzLiNvdXRlck1hcC5nZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pO1xuXG4gICAgaWYgKCFfX2lubmVyU2V0X18uaGFzKCR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBcIil9KSkge1xuICAgICAgX19pbm5lclNldF9fLmFkZCgke2RlZmluZXMuZ2V0KFwic2V0QXJndW1lbnQwXCIpfSk7XG4gICAgICB0aGlzLiNzaXplT2ZBbGwrKztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImFkZFNldHNcIiwgMil9XG4gIGFkZFNldHMoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCBfX3NldHNfXykgeyR7aW52b2tlTWFwVmFsaWRhdGV9XG4gICAgY29uc3QgX19hcnJheV9fID0gQXJyYXkuZnJvbShfX3NldHNfXykubWFwKChfX3NldF9fLCBfX2luZGV4X18pID0+IHtcbiAgICAgIF9fc2V0X18gPSBBcnJheS5mcm9tKF9fc2V0X18pO1xuICAgICAgaWYgKF9fc2V0X18ubGVuZ3RoICE9PSAke2RlZmluZXMuZ2V0KFwic2V0Q291bnRcIil9KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcXGBTZXQgYXQgaW5kZXggXFwke19faW5kZXhfX30gZG9lc24ndCBoYXZlIGV4YWN0bHkgJHtkZWZpbmVzLmdldChcInNldENvdW50XCIpfSBhcmd1bWVudCR7XG4gICAgICAgICAgZGVmaW5lcy5nZXQoXCJzZXRDb3VudFwiKSEgPiAxID8gXCJzXCIgOiBcIlwiXG4gICAgICAgIH0hXFxgKTtcbiAgICAgIH1cbiAgICAgICR7ZGVmaW5lcy5oYXMoXCJpbnZva2VWYWxpZGF0ZVwiKSA/IGB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCAuLi5fX3NldF9fKTtgIDogXCJcIn1cblxuICAgICAgcmV0dXJuIF9fc2V0X187XG4gICAgfSk7XG5cbiAgICBpZiAoIXRoaXMuI291dGVyTWFwLmhhcygke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSkpXG4gICAgICB0aGlzLiNvdXRlck1hcC5zZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0sIG5ldyBTZXQpO1xuXG4gICAgY29uc3QgX19pbm5lclNldF9fID0gdGhpcy4jb3V0ZXJNYXAuZ2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KTtcblxuICAgIF9fYXJyYXlfXy5mb3JFYWNoKF9fc2V0X18gPT4ge1xuICAgICAgaWYgKCFfX2lubmVyU2V0X18uaGFzKF9fc2V0X19bMF0pKSB7XG4gICAgICAgIF9faW5uZXJTZXRfXy5hZGQoX19zZXRfX1swXSk7XG4gICAgICAgIHRoaXMuI3NpemVPZkFsbCsrO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJjbGVhclwiLCAyKX1cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy4jb3V0ZXJNYXAuY2xlYXIoKTtcbiAgICB0aGlzLiNzaXplT2ZBbGwgPSAwO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiY2xlYXJTZXRzXCIsIDIpfVxuICBjbGVhclNldHMoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KSB7JHtpbnZva2VNYXBWYWxpZGF0ZX1cbiAgICBjb25zdCBfX2lubmVyU2V0X18gPSB0aGlzLiNvdXRlck1hcC5nZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pXG4gICAgaWYgKCFfX2lubmVyU2V0X18pXG4gICAgICByZXR1cm47XG5cbiAgICB0aGlzLiNzaXplT2ZBbGwgLT0gX19pbm5lclNldF9fLnNpemU7XG4gICAgX19pbm5lclNldF9fLmNsZWFyKCk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJkZWxldGVcIiwgMil9XG4gIGRlbGV0ZSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfSkgeyR7aW52b2tlVmFsaWRhdGV9XG4gICAgY29uc3QgX19pbm5lclNldF9fID0gdGhpcy4jb3V0ZXJNYXAuZ2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KVxuICAgIGlmICghX19pbm5lclNldF9fKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgaWYgKCFfX2lubmVyU2V0X18uaGFzKCR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBcIil9KSlcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIF9faW5uZXJTZXRfXy5kZWxldGUoJHtkZWZpbmVzLmdldChcInNldEFyZ3VtZW50MFwiKX0pO1xuICAgIHRoaXMuI3NpemVPZkFsbC0tO1xuXG4gICAgaWYgKF9faW5uZXJTZXRfXy5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLiNvdXRlck1hcC5kZWxldGUoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZGVsZXRlU2V0c1wiLCAyKX1cbiAgZGVsZXRlU2V0cygke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI291dGVyTWFwLmdldCgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSlcbiAgICBpZiAoIV9faW5uZXJTZXRfXylcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIHRoaXMuI291dGVyTWFwLmRlbGV0ZSgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSk7XG4gICAgdGhpcy4jc2l6ZU9mQWxsIC09IF9faW5uZXJTZXRfXy5zaXplO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZm9yRWFjaFNldFwiLCAyKX1cbiAgZm9yRWFjaChfX2NhbGxiYWNrX18sIF9fdGhpc0FyZ19fKSB7XG4gICAgdGhpcy4jb3V0ZXJNYXAuZm9yRWFjaChcbiAgICAgIChfX2lubmVyU2V0X18sICR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KSA9PiBfX2lubmVyU2V0X18uZm9yRWFjaChcbiAgICAgICAgJHtkZWZpbmVzLmdldChcInNldEFyZ3VtZW50MFwiKX0gPT4gX19jYWxsYmFja19fLmFwcGx5KF9fdGhpc0FyZ19fLCBbJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBcIil9LCB0aGlzXSlcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZm9yRWFjaE1hcFNldFwiLCAyKX1cbiAgZm9yRWFjaFNldCgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSwgX19jYWxsYmFja19fLCBfX3RoaXNBcmdfXykgeyR7aW52b2tlTWFwVmFsaWRhdGV9XG4gICAgY29uc3QgX19pbm5lclNldF9fID0gdGhpcy4jb3V0ZXJNYXAuZ2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KVxuICAgIGlmICghX19pbm5lclNldF9fKVxuICAgICAgcmV0dXJuO1xuXG4gICAgX19pbm5lclNldF9fLmZvckVhY2goXG4gICAgICAke2RlZmluZXMuZ2V0KFwic2V0QXJndW1lbnQwXCIpfSA9PiBfX2NhbGxiYWNrX18uYXBwbHkoX190aGlzQXJnX18sIFske2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ3VtZW50MFwiKX0sIHRoaXNdKVxuICAgICk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJmb3JFYWNoQ2FsbGJhY2tTZXRcIiwgMil9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaGFzXCIsIDIpfVxuICBoYXMoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCAke2RlZmluZXMuZ2V0KFwic2V0QXJnTGlzdFwiKX0pIHske2ludm9rZVZhbGlkYXRlfVxuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI291dGVyTWFwLmdldCgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSlcbiAgICBpZiAoIV9faW5uZXJTZXRfXylcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIHJldHVybiBfX2lubmVyU2V0X18uaGFzKCR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBcIil9KTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImhhc1NldFwiLCAyKX1cbiAgaGFzU2V0cygke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI291dGVyTWFwLmdldCgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSlcbiAgICByZXR1cm4gQm9vbGVhbihfX2lubmVyU2V0X18pO1xuICB9XG5cbiR7ZGVmaW5lcy5oYXMoXCJ2YWxpZGF0ZUFyZ3VtZW50c1wiKSA/IGBcbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZEtleVB1YmxpY1wiLCAyKX1cbiAgaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pIHtcbiAgICByZXR1cm4gdGhpcy4jaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pO1xuICB9XG5cbiAgYCA6IGBgfVxuJHtkb2NzLmJ1aWxkQmxvY2soXCJ2YWx1ZXNcIiwgMil9XG4gICogdmFsdWVzKCkge1xuICAgIGNvbnN0IF9fb3V0ZXJJdGVyX18gPSB0aGlzLiNvdXRlck1hcC5lbnRyaWVzKCk7XG5cbiAgICBmb3IgKGxldCBbJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0sIF9faW5uZXJTZXRfX10gb2YgX19vdXRlckl0ZXJfXykge1xuICAgICAgZm9yIChsZXQgJHtkZWZpbmVzLmdldChcInNldEFyZ3VtZW50MFwiKX0gb2YgX19pbm5lclNldF9fLnZhbHVlcygpKVxuICAgICAgICB5aWVsZCBbJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBcIil9XTtcbiAgICB9XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJ2YWx1ZXNTZXRcIiwgMil9XG4gICogdmFsdWVzU2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KSB7JHtpbnZva2VNYXBWYWxpZGF0ZX1cbiAgICBjb25zdCBfX2lubmVyU2V0X18gPSB0aGlzLiNvdXRlck1hcC5nZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pXG4gICAgaWYgKCFfX2lubmVyU2V0X18pXG4gICAgICByZXR1cm47XG5cbiAgICBmb3IgKGxldCAke2RlZmluZXMuZ2V0KFwic2V0QXJndW1lbnQwXCIpfSBvZiBfX2lubmVyU2V0X18udmFsdWVzKCkpXG4gICAgICB5aWVsZCBbJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBcIil9XTtcbiAgfVxuXG4ke2RlZmluZXMuaGFzKFwidmFsaWRhdGVBcmd1bWVudHNcIikgPyBgXG4ke2RvY3MuYnVpbGRCbG9jayhcInJlcXVpcmVWYWxpZEtleVwiLCAyKX1cbiAgICAjcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSkge1xuICAgICAgaWYgKCF0aGlzLiNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBvcmRlcmVkIGtleSBzZXQgaXMgbm90IHZhbGlkIVwiKTtcbiAgICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZEtleVByaXZhdGVcIiwgMil9XG4gICAgI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KSB7XG4gICAgICB2b2lkKCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSk7XG5cbiAgICAgICR7ZGVmaW5lcy5nZXQoXCJ2YWxpZGF0ZUFyZ3VtZW50c1wiKX1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICBgIDogYGB9XG5cbiR7ZGVmaW5lcy5oYXMoXCJ2YWxpZGF0ZU1hcEFyZ3VtZW50c1wiKSA/IGBcbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZVZhbGlkTWFwS2V5XCIsIDIpfVxuICAjcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSkge1xuICAgIGlmICghdGhpcy4jaXNWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIG9yZGVyZWQgbWFwIGtleSBzZXQgaXMgbm90IHZhbGlkIVwiKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRNYXBLZXlQcml2YXRlXCIsIDIpfVxuICAjaXNWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHtcbiAgICB2b2lkKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSk7XG5cbiAgICAke2RlZmluZXMuZ2V0KFwidmFsaWRhdGVNYXBBcmd1bWVudHNcIikgfHwgXCJcIn1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBgIDogYGB9XG5cbiAgW1N5bWJvbC5pdGVyYXRvcl0oKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWVzKCk7XG4gIH1cblxuICBbU3ltYm9sLnRvU3RyaW5nVGFnXSA9IFwiJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX1cIjtcbn1cblxuXG5PYmplY3QuZnJlZXplKCR7ZGVmaW5lcy5nZXQoXCJjbGFzc05hbWVcIil9KTtcbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX0ucHJvdG90eXBlKTtcbmB9XG5cbmV4cG9ydCBkZWZhdWx0IHByZXByb2Nlc3M7XG4iXX0=