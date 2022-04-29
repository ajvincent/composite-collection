export type MapOrSetType = "Map" | "Set"| "WeakMap" | "WeakSet";

/** @public */
export default class CollectionType {
  argumentName: string;
  mapOrSetType: MapOrSetType;
  jsDocType: string;
  description: string;
  argumentValidator: string | null;

  /**
   * A simple data structure.
   *
   * @param {string}        argumentName   The name of the argument.
   * @param {string}        mapOrSetType   "Map", "Set", "WeakMap", "WeakSet".
   * @param {string}        jsDocType   A JSDoc-printable type for the argument.
   * @param {string}        description    A JSDoc-printable description.
   * @param {string | null} argumentValidator A method to use for testing the argument.
   */
  constructor(
    argumentName: string,
    mapOrSetType: MapOrSetType,
    jsDocType: string,
    description: string,
    argumentValidator: string | null
  )
  {
    this.argumentName = argumentName.trim();
    this.mapOrSetType = mapOrSetType;
    this.jsDocType = jsDocType.trim();
    this.description = description.trim();
    this.argumentValidator = argumentValidator ? argumentValidator.trim() : null;

    Object.freeze(this);
  }

  get isMapArgument() : boolean {
    return this.mapOrSetType.endsWith("Map");
  }
}
Object.freeze(CollectionType);
Object.freeze(CollectionType.prototype);
