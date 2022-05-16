import CollectionConfiguration from "composite-collection/Configuration";

const StateMachineConfig = new CollectionConfiguration("StringStateMachine", "Set");
StateMachineConfig.addSetKey("currentState", "The current state.", false, {
  jsDocType: "string",
  tsType: "string",
});
StateMachineConfig.addSetKey("nextState", "An allowable next state.", false, {
  jsDocType: "string",
  tsType: "string",
});
StateMachineConfig.lock();

export default StateMachineConfig;
