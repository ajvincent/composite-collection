/**
 * @fileoverview These are stub classes for use with jsdoc-parse-plus.
 *
 * I hope the original author adopts and/or rewrites them.
 */

export class Descriptive {
  constructor(tag, value = "", description = "") {
    this.tag = tag;
    this.value = value;
    this.description = description;
  }

  get raw() {
    let rv = this.tag + "\n" + this.description;

    if (this.value)
      rv += "\n" + this.value;

    return rv;
  }
}

export class ParamType extends Descriptive {
  constructor(tag, name, type = "", description = "", optional = false, defaultValue = "") {
    super(tag, "", description);

    this.name = name;
    this.type = type;
    this.optional = Boolean(optional);
    this.defaultValue = defaultValue.toString();
  }

  get raw() {
    let rv = this.tag;

    if (this.type) {
      rv += ` {${this.type}}`
    }

    if (this.optional) {
      rv += ` [${this.name}${this.defaultValue ? `='${this.defaultValue}` : ""}]`
    }

    if (this.description)
      rv += " " + this.description;

    return rv;
  }
}

export class InlineLink {
  constructor(tag, url, text) {
    this.tag = tag;
    this.url = url;
    this.text = text;
  }

  get raw() {
    let rv = this.tag;
    if (this.url)
      rv += ` {${this.url}}`
    else if (this.text)
      rv += " " + this.text;

    return rv;
  }
}
