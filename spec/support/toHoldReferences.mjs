/**
 * @typedef {object} AsyncMatcher
 * @property {AsyncMatcherCompare} compare The test method.
 */

/**
 * @typedef {Function} AsyncMatcherCompare
 * @function
 * @async
 * @param {Function} useValue The test function.
 * @returns {AsyncMatcherResult} The result
 */

/**
 * @typedef {object} AsyncMatcherResult
 * @property {Promise<boolean>} pass    True if the expectation passes.
 * @property {string}           message The error message, if the expectation fails.
 */

/**
 * Assert the expectation holds a passed-in value weakly.
 *
 * @returns {AsyncMatcher} The matcher.
 */
function toHoldReferencesWeakly() {
  return {
    async compare(useValue) {
      let finalResolve;
      const finalPromise = new Promise(resolve => finalResolve = resolve);

      const promiseArray = [];
      const finalizer = new FinalizationRegistry(resolver => resolver());
      for (let i = 0; i < 20; i++) {
        const key = {};
        useValue(key);
        promiseArray.push(new Promise(resolve => {
          finalizer.register(key, resolve);
        }));
      }

      // At this point, there should be no strong references to the keys we just created.
      await new Promise(resolve => setImmediate(resolve));
      for (let i = 0; i < 20; i++) {
        // eslint-disable-next-line no-undef
        gc();
        await new Promise(resolve => setImmediate(resolve));
      }

      let failPromise = new Promise(resolve => setTimeout(resolve, 10));
      await Promise.race([
        Promise.all(promiseArray).then(() => finalResolve(true)),
        failPromise.then(() => finalResolve(false)),
      ]);

      return {
        pass: await finalPromise,
        message: "Expected the function to hold no strong references to any keys"
      };
    }
  }
}

/**
 * Assert the expectation holds a passed-in value strongly.
 *
 * @returns {AsyncMatcher} The matcher.
 */
function toHoldReferencesStrongly() {
  return {
    async compare(useValue) {
      let finalResolve;
      const finalPromise = new Promise(resolve => finalResolve = resolve);

      const promiseArray = [];
      const finalizer = new FinalizationRegistry(resolver => resolver());

      for (let i = 0; i < 20; i++) {
        let p = new Promise(resolve => {
          const key = {};
          useValue(key);
          finalizer.register(key, () => resolve("getKey() failed at index " + i));
        });
        promiseArray.push(p.then(() => finalResolve(false)));
      }

      // At this point, calling gc() should force weak keys to be collected.  Abuse it.
      for (let i = 0; i < 20; i++) {
        await new Promise(resolve => setImmediate(resolve));
        // eslint-disable-next-line no-undef
        gc();
      }

      {
        let p = new Promise(resolve => setTimeout(resolve, 10));
        promiseArray.push(p.then(() => finalResolve(true)));
      }

      return {
        pass: await finalPromise,
        message: "Expected the function to hold strong references to all keys"
      };
    }
  };
}

/**
 * Assert the expectation holds a returned value weakly.
 *
 * @returns {AsyncMatcher} The matcher.
 */
function toHoldValuesWeakly() {
  return {
    async compare(useValue) {
      let finalResolve;
      const finalPromise = new Promise(resolve => finalResolve = resolve);

      const promiseArray = [];
      const finalizer = new FinalizationRegistry(resolver => resolver());
      for (let i = 0; i < 20; i++) {
        const key = useValue();
        promiseArray.push(new Promise(resolve => {
          finalizer.register(key, resolve);
        }));
      }

      // At this point, there should be no strong references to the keys we just created.
      await new Promise(resolve => setImmediate(resolve));
      for (let i = 0; i < 20; i++) {
        // eslint-disable-next-line no-undef
        gc();
        await new Promise(resolve => setImmediate(resolve));
      }

      let failPromise = new Promise(resolve => setTimeout(resolve, 100));
      await Promise.race([
        Promise.all(promiseArray).then(() => finalResolve(true)),
        failPromise.then(() => finalResolve(false)),
      ]);

      return {
        pass: await finalPromise,
        message: "Expected the function to hold no strong references to any return values"
      };
    }
  }
}

/**
 * Assert the expectation holds a returned value strongly.
 *
 * @returns {AsyncMatcher} The matcher.
 */
function toHoldValuesStrongly() {
  return {
    async compare(useValue) {
      let finalResolve;
      const finalPromise = new Promise(resolve => finalResolve = resolve);

      const promiseArray = [];
      const finalizer = new FinalizationRegistry(resolver => resolver());

      for (let i = 0; i < 20; i++) {
        let p = new Promise(resolve => {
          const key = useValue();
          finalizer.register(key, () => resolve("getKey() failed at index " + i));
        });
        promiseArray.push(p.then(() => finalResolve(false)));
      }

      // At this point, calling gc() should force weak keys to be collected.  Abuse it.
      for (let i = 0; i < 20; i++) {
        await new Promise(resolve => setImmediate(resolve));
        // eslint-disable-next-line no-undef
        gc();
      }

      {
        let p = new Promise(resolve => setTimeout(resolve, 10));
        promiseArray.push(p.then(() => finalResolve(true)));
      }

      return {
        pass: await finalPromise,
        message: "Expected the function to hold strong references to all return values"
      };
    }
  };
}

export default {
  toHoldReferencesWeakly,
  toHoldReferencesStrongly,
  toHoldValuesWeakly,
  toHoldValuesStrongly,
}
