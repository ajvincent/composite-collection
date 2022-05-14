export default class MockImportable {
    data;
    constructor(data) {
        this.data = data;
        Object.freeze(this);
    }
}
Object.freeze(MockImportable);
Object.freeze(MockImportable.prototype);
//# sourceMappingURL=MockImportable.mjs.map