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
      // eslint-disable-next-line no-undef
      gc();

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

export default {
  toHoldReferencesWeakly,
  toHoldReferencesStrongly,
}
