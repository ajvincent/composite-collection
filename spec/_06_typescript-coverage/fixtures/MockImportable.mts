export default class MockImportable {
  data: any;

  constructor(data: any) {
    this.data = data;
    Object.freeze(this);
  }
}
Object.freeze(MockImportable);
Object.freeze(MockImportable.prototype);
