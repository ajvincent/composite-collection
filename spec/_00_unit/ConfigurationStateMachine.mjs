import ConfigurationStateMachine from "#source/generatorTools/ConfigurationStateMachine.mjs";
void ConfigurationStateMachine;

describe("ConfigurationStateMachine", () => {
  it("class is frozen", () => {
    expect(Object.isFrozen(ConfigurationStateMachine.prototype)).toBe(true);

    expect(Reflect.ownKeys(ConfigurationStateMachine.prototype)).toEqual([
      "constructor",
      "currentState",
      "doStateTransition",
      "catchErrorState",
      "catchErrorAsync",
    ]);

    expect(Object.isFrozen(ConfigurationStateMachine)).toBe(true);
    expect(Reflect.ownKeys(ConfigurationStateMachine)).toEqual([
      // standard ECMAScript
      "length",
      "name",
      "prototype",

      // static methods
      "Map",
      "Set",
      "MapOfSets",
      "OneToOne"
    ]);
  });

  it("instances are frozen", () => {
    const x = new ConfigurationStateMachine([
      ["start", "start"]
    ]);
    expect(Object.isFrozen(x)).toBe(true);
    expect(x.currentState).toBe("start");
  });

  describe(".doStateTransition()", () => {
    it("reports true for a successful state transition", () => {
      const x = new ConfigurationStateMachine([
        ["start", "finish"]
      ]);
      expect(x.doStateTransition("finish")).toBe(true);
      expect(x.currentState).toBe("finish");
    });
  
    it("reports false for a failed state transition", () => {
      const x = new ConfigurationStateMachine([
        ["start", "finish"]
      ]);
      expect(x.doStateTransition("detour")).toBe(false);
      expect(x.currentState).toBe("start");
    });
  
    it("can go from one state to more than one other state", () => {
      const states = ([
        ["start", "state1"],
  
        ["state1", "state2"],
        ["state1", "state3"],
      ]);
      const x = new ConfigurationStateMachine(states);
  
      expect(x.doStateTransition("state1")).toBe(true);
      expect(x.doStateTransition("unknown")).toBe(false);
      expect(x.currentState).toBe("state1");
  
      expect(x.doStateTransition("state2")).toBe(true);
      expect(x.currentState).toBe("state2");
  
      const y = new ConfigurationStateMachine(states);
      y.doStateTransition("state1");
      expect(y.doStateTransition("state3")).toBe(true);
      expect(y.currentState).toBe("state3");
    });
  });

  describe(".catchErrorState()", () => {
    it("returns what its callback returns without changing state", () => {
      const machine = new ConfigurationStateMachine([
        ["start", "finish"]
      ]);

      const returnValue = {};
      const callback = () => returnValue;
      expect(machine.catchErrorState(callback)).toBe(returnValue);
      expect(machine.currentState).toBe("start");
    });

    it("changes its state to 'errored' on an exception", () => {
      const machine = new ConfigurationStateMachine([
        ["start", "finish"]
      ]);

      const errObject = new Error("thrown exception)");
      expect(
        () => machine.catchErrorState(() => {
          throw errObject;
        })
      ).toThrow(errObject);
      expect(machine.currentState).toBe("errored");
    });

    it("throws when trying to run in an 'errored' state", () => {
      const machine = new ConfigurationStateMachine([
        ["start", "finish"]
      ]);

      const errObject = new Error("thrown exception)");

      expect(
        () => machine.catchErrorState(() => {
          throw errObject;
        })
      ).toThrow(errObject);

      const returnValue = {};
      const callback = () => returnValue;

      expect(
        () => machine.catchErrorState(callback)
      ).toThrowError("This configuration is dead due to a previous error!");
      expect(machine.currentState).toBe("errored");
    });
  });

  describe(".catchErrorAsync()", () => {
    it("resolves to what the calback resolves to", async () => {
      const machine = new ConfigurationStateMachine([
        ["start", "finish"]
      ]);

      const returnValue = {};
      const callback = () => Promise.resolve(returnValue);
      await expectAsync(machine.catchErrorAsync(callback)).toBeResolvedTo(returnValue);
      expect(machine.currentState).toBe("start");
    });

    it("changes its state to 'errored' on a rejected promise", async () => {
      const machine = new ConfigurationStateMachine([
        ["start", "finish"]
      ]);

      const errObject = new Error("thrown exception)");
      const callback = () => Promise.reject(errObject);
      await expectAsync(machine.catchErrorAsync(callback)).toBeRejectedWith(errObject);
      expect(machine.currentState).toBe("errored");
    });

    it("throws when trying to run in an 'errored' state", async () => {
      const machine = new ConfigurationStateMachine([
        ["start", "finish"]
      ]);

      const errObject = new Error("thrown exception)");

      expect(
        () => machine.catchErrorState(() => {
          throw errObject;
        })
      ).toThrow(errObject);

      const returnValue = {};
      const callback = () => Promise.resolve(returnValue);

      await expectAsync(machine.catchErrorAsync(callback)).toBeRejectedWith(
        new Error("This configuration is dead due to a previous error!")
      );
      expect(machine.currentState).toBe("errored");
    });
  });
});
