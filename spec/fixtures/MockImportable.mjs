export default class MockImportable {
  constructor(data) {
    this.data = data;
    Object.freeze(this);
  }
}
Object.freeze(MockImportable);
Object.freeze(MockImportable.prototype);
