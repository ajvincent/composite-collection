# Template classes

## CStrongMap

This is for a sequence of Maps.  We get a relatively simple group of requirements for this case:

1. All the keys can hash down to a single key.
1. For the get, has, set, delete and clear methods, we can use the hash as a key on a regular Map.
1. For the entries(), forEach(), and keys() methods, we have to preserve the key sequence in another Map.
1. We can almost forward the values() method to the underlying map, substituting the CStrongMap for the actual map.
