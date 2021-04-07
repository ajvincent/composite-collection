Tests in this directory invoke the nodejs garbage collector (`gc()`), so we have to launch node with --expose-gc to test them.
