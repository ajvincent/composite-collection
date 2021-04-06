import CollectionConfiguration from "composite-collection/Configuration";

const StateMachineMapSpec = new CollectionConfiguration("StateMachineMap");

StateMachineMapSpec.addMapKey("currentState", false, {
  argumentFilter: currentState => {
    if (typeof currentState !== "string") {
      throw new Error("currentState must be a string!");
    }
  }
});

/* Your requirements may be different.  You may want your value to be a
function to validate an argument, or a value which holds resolve and reject paths,
or maybe you want to add a set argument with a validation function for your
state machine to process.  It's really up to your needs.
*/
StateMachineMapSpec.setValueFilter(
  value => {
    if (typeof value !== "object")
      throw new Error("value must be an object with a nextStates string set and a failMessageSet string set!");

    {
      const nextStates = value.nextStates;
      if (!(nextStates instanceof Set)) {
        throw new Error("value.nextStates must be a set of strings!");
      }
      Array.from(value.nextStates).forEach(message => {
        if (typeof message !== "string")
          throw new Error("value.nextStates must be a set of strings!");
      });
    }

    {
      const failMessageSet = value.failMessageSet;
      if (!value.failMessageSet instanceof Set) {
        if (typeof message !== "string")
        throw new Error("value.nextStates must be a set of strings!");
      }

      Array.from(value.failMessageSet).forEach(message => {
        if (typeof message !== "string")
          throw new Error("value.nextStates must be a set of strings!");
      });
    }
  },

  "An object containing a nextStates string set, an optional acceptTransition method, and a failMessageSet string set."
);

export default StateMachineMapSpec;
