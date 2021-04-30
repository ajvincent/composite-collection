export default class MockImportable {
  constructor(isValid) {
    this.isValid = isValid;
    Object.freeze(this);
  }
}
Object.freeze(MockImportable);
Object.freeze(MockImportable.prototype);
