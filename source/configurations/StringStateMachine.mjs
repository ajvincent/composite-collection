import CollectionConfiguration from "composite-collection/Configuration";

const StateMachineConfig = new CollectionConfiguration("StringStateMachine", "Set");
StateMachineConfig.addSetKey("currentState", false, {
  argumentType: "Function",
  argumentValidator: function(currentState) {
    if (typeof currentState !== "string")
      return false;
  }
});
StateMachineConfig.addSetKey("nextState", false, {
  argumentType: "Function",
  argumentValidator: function(nextState) {
    if (typeof nextState !== "string")
      return false;
  }
});
StateMachineConfig.lock();

export default StateMachineConfig;
