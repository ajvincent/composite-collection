import CollectionConfiguration from "composite-collection/Configuration";

const StateMachineConfig = new CollectionConfiguration("StateMachine", "Set");
StateMachineConfig.addSetKey("currentState", false);
StateMachineConfig.addSetKey("nextState", false);

export default StateMachineConfig;
