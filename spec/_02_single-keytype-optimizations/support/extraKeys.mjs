import CollectionConfiguration from "composite-collection/Configuration";

/**
 * Define an extra map key for a configuration.
 *
 * @param {CollectionConfiguration} configuration The configuration to modify.
 * @param {boolean} holdWeak True if the key should be held weakly.
 */
export function defineExtraMapKey(configuration, holdWeak) {
  void configuration;

  configuration.addMapKey("extraMapKey", "Extra map key for specifications", holdWeak);
}
