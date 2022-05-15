export default class MockImportable {
  data: unknown;

  constructor(data: unknown) {
    this.data = data;
    Object.freeze(this);
  }
}
Object.freeze(MockImportable);
Object.freeze(MockImportable.prototype);
