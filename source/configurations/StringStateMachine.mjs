import CollectionConfiguration from "composite-collection/Configuration";

const StateMachineConfig = new CollectionConfiguration("StringStateMachine", "Set");
StateMachineConfig.addSetKey("currentState", "The current state.", false, {
  argumentType: "string",
  argumentValidator: function(currentState) {
    if (typeof currentState !== "string")
      return false;
  }
});
StateMachineConfig.addSetKey("nextState", "An allowable next state.", false, {
  argumentType: "string",
  argumentValidator: function(nextState) {
    if (typeof nextState !== "string")
      return false;
  }
});
StateMachineConfig.lock();

export default StateMachineConfig;
