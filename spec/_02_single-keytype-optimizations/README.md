# Single-map and single-key type collection tests

This is specifically for collections having:

- one map key, multiple set keys
- one set key, multiple map keys,
- one map key and one set key

There will be several subdirectories here:

- base-configurations (the basic configurations, wrapped in export functions to modify them)
- support             (providing build and spec support modules)
- multiple-reference  (having no case of one key, but spec files will keep the extra key constant)
- solo-fullbuild      (optimizations disabled)
- solo-optbuild       (optimizatione enabled)
- CodeGenerator       (the specifications, referencing all three directories)

The idea is that all three generated collection directories should generate code passing the same tests, adjusting for the multiple keys case in multiple-reference.
