import MethodTemplate from "./MethodTemplateType.mjs";
void (MethodTemplate);
/**
 * @returns {Array<string, MethodTemplate>[]} The templates to feed into a Map.
 */
export default function defaultMethods() {
    return [
        ["rootContainerMap", {
                isProperty: true,
                description: "The root map holding keys and values.",
                includeArgs: "none",
                headers: [
                    "@type {Map<string, __className__~valueAndKeySet>}",
                ],
                footers: ["@constant"],
            }],
        ["rootContainerWeakMap", {
                isProperty: true,
                description: "The root map holding weak composite keys and values.",
                includeArgs: "none",
                headers: [
                    "@type {WeakMap<WeakKey, *>}"
                ],
                footers: ["@constant"],
            }],
        ["rootContainerSet", {
                isProperty: true,
                description: "Storage of the Set's contents for quick iteration in .values().  The values are always frozen arrays.",
                includeArgs: "none",
                headers: [
                    "@type {Map<hash, *[]>}",
                ],
                footers: ["@constant"],
            }],
        ["valueAndKeySet", {
                isTypeDef: true,
                includeArgs: "none",
                description: "",
                headers: [
                    "@typedef __className__~valueAndKeySet",
                    "@property {*}   value  The actual value we store.",
                    "@property {*[]} keySet The set of keys we hashed.",
                ],
            }],
        ["getSize", {
                isProperty: true,
                description: "The number of elements in this collection.",
                includeArgs: "none",
                returnType: "number",
                returnDescription: "The element count.",
                footers: ["@public", "@constant"],
            }],
        ["getSizeOfSet", {
                description: "Get the size of a particular set.",
                includeArgs: "mapArguments",
                footers: ["@public"],
                returnType: "number",
                returnDescription: "The set size."
            }],
        ["mapSize", {
                isProperty: true,
                description: "The number of maps in this collection.",
                includeArgs: "none",
                returnType: "number",
                returnDescription: "The map count.",
                footers: ["@public", "@constant"],
            }],
        ["clear", {
                returnVoid: true,
                description: "Clear the collection.",
                includeArgs: "none",
                footers: ["@public"],
            }],
        ["clearSets", {
                returnVoid: true,
                description: "Clear all sets from the collection for a given map keyset.",
                includeArgs: "mapArguments",
                footers: ["@public"],
            }],
        ["delete", {
                description: "Delete an element from the collection by the given key sequence.",
                includeArgs: "excludeValue",
                returnType: "boolean",
                returnDescription: "True if we found the value and deleted it.",
                footers: ["@public"],
            }],
        ["deleteSets", {
                description: "Delete all sets from the collection by the given map sequence.",
                includeArgs: "mapArguments",
                returnType: "boolean",
                returnDescription: "True if we found the value and deleted it.",
                footers: ["@public"],
            }],
        ["entries", {
                description: "Yield the key-value tuples of the collection.",
                includeArgs: "none",
                returnType: "*[]",
                returnDescription: "The keys and values.",
                isGenerator: true,
                footers: ["@public"],
            }],
        ["forEachMap", {
                returnVoid: true,
                description: "Iterate over the keys and values.",
                paramFooters: [
                    ["__className__~ForEachCallback", "callback", "A function to invoke for each iteration."],
                    ["object", "thisArg", "Value to use as this when executing callback."],
                ],
                includeArgs: "none",
                footers: ["@public"],
            }],
        ["forEachSet", {
                returnVoid: true,
                description: "Iterate over the keys.",
                paramFooters: [
                    ["__className__~ForEachCallback", "__callback__", "A function to invoke for each iteration."],
                    ["object", "__thisArg__", "Value to use as this when executing callback."],
                ],
                includeArgs: "none",
                footers: ["@public"],
            }],
        ["forEachMapSet", {
                returnVoid: true,
                description: "Iterate over the keys under a map in this collection.",
                paramFooters: [
                    ["__className__~ForEachCallback", "__callback__", "A function to invoke for each iteration."],
                    ["object", "__thisArg__", "Value to use as this when executing callback."],
                ],
                includeArgs: "mapArguments",
                footers: ["@public"],
            }],
        ["forEachCallbackMap", {
                returnVoid: true,
                description: "An user-provided callback to .forEach().",
                includeArgs: "excludeValue",
                paramHeaders: [
                    ["__valueType__", "value", "__valueDesc__"],
                ],
                paramFooters: [
                    ["__className__", "__collection__", "This collection."]
                ],
                headers: [
                    "@callback __className__~ForEachCallback"
                ]
            }],
        ["forEachCallbackSet", {
                returnVoid: true,
                description: "An user-provided callback to .forEach().",
                includeArgs: "all",
                paramFooters: [
                    ["__className__", "__collection__", "This collection."]
                ],
                headers: [
                    "@callback __className__~ForEachCallback",
                ],
            }],
        ["get", {
                description: "Get a value for a key set.",
                includeArgs: "excludeValue",
                returnType: "__valueType__?",
                returnDescription: "__valueDesc__  Undefined if it isn't in the collection.",
                footers: ["@public"],
            }],
        ["has", {
                description: "Report if the collection has a value for a key set.",
                includeArgs: "excludeValue",
                returnType: "boolean",
                returnDescription: "True if the key set refers to a value in the collection.",
                footers: ["@public"],
            }],
        ["hasSet", {
                description: "Report if the collection has any sets for a map.",
                includeArgs: "mapArguments",
                returnType: "boolean",
                returnDescription: "True if the key set refers to a value in the collection.",
                footers: ["@public"],
            }],
        ["keys", {
                description: "Yield the key sets of the collection.",
                includeArgs: "none",
                returnType: "*[]",
                returnDescription: "The key sets.",
                isGenerator: true,
                footers: ["@public"],
            }],
        ["set", {
                description: "Set a value for a key set.",
                includeArgs: "all",
                returnType: "__className__",
                returnDescription: "This collection.",
                footers: ["@public"],
            }],
        ["add", {
                description: "Add a key set to this collection.",
                includeArgs: "excludeValue",
                returnType: "__className__",
                returnDescription: "This collection.",
                footers: ["@public"],
            }],
        ["addSets", {
                description: "Add several sets to a map in this collection.",
                includeArgs: "mapArguments",
                paramFooters: [
                    ['Set[]', '__sets__', "The sets to add."],
                ],
                returnType: "__className__",
                returnDescription: "This collection.",
                footers: ["@public"],
            }],
        ["values", {
                description: "Yield the values of the collection.",
                includeArgs: "none",
                returnType: "__valueType__",
                returnDescription: "The value.",
                isGenerator: true,
                footers: ["@public"],
            }],
        ["valuesSet", {
                description: "Yield the sets of the collection in a map.",
                includeArgs: "mapArguments",
                returnType: "__valueType__",
                returnDescription: "The sets.",
                isGenerator: true,
                footers: ["@public"],
            }],
        ["isValidKeyPublic", {
                description: "Determine if a set of keys is valid.",
                includeArgs: "excludeValue",
                returnType: "boolean",
                returnDescription: "True if the validation passes, false if it doesn't.",
                footers: ["@public"],
            }],
        ["isValidKeyPrivate", {
                description: "Determine if a set of keys is valid.",
                includeArgs: "excludeValue",
                returnType: "boolean",
                returnDescription: "True if the validation passes, false if it doesn't.",
            }],
        ["requireValidKey", {
                returnVoid: true,
                description: "Throw if the key set is not valid.",
                includeArgs: "excludeValue",
                footers: ["@throws for an invalid key set."]
            }],
        ["requireInnerCollectionPrivate", {
                description: "Require an inner collection exist for the given map keys.",
                includeArgs: "mapArguments",
                returnType: "__className__~InnerMap",
                returnDescription: "The inner collection."
            }],
        ["getExistingInnerCollectionPrivate", {
                description: "Get an existing inner collection for the given map keys.",
                includeArgs: "mapArguments",
                returnType: "__className__~InnerMap?",
                returnDescription: "The inner collection."
            }],
        ["requireValidMapKey", {
                returnVoid: true,
                description: "Throw if the map key set is not valid.",
                includeArgs: "mapArguments",
                footers: ["@throws for an invalid key set."]
            }],
        ["isValidMapKeyPrivate", {
                description: "Determine if a set of map keys is valid.",
                includeArgs: "mapArguments",
                returnType: "boolean",
                returnDescription: "True if the validation passes, false if it doesn't.",
            }],
        ["isValidSetKeyPrivate", {
                description: "Determine if a set of set keys is valid.",
                includeArgs: "setArguments",
                returnType: "boolean",
                returnDescription: "True if the validation passes, false if it doesn't.",
            }],
        ["isValidValuePublic", {
                description: "Determine if a value is valid.",
                includeArgs: "value",
                returnType: "boolean",
                returnDescription: "True if the validation passes, false if it doesn't.",
                footers: ["@public"],
            }],
        ["isValidValuePrivate", {
                description: "Determine if a value is valid.",
                includeArgs: "value",
                returnType: "boolean",
                returnDescription: "True if the validation passes, false if it doesn't.",
            }],
    ];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkZWZhdWx0Lm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGNBQWMsTUFBTSwwQkFBMEIsQ0FBQztBQUd0RCxLQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7QUFFckI7O0dBRUc7QUFDSCxNQUFNLENBQUMsT0FBTyxVQUFVLGNBQWM7SUFDcEMsT0FBTztRQUNMLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ25CLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixXQUFXLEVBQUUsdUNBQXVDO2dCQUNwRCxXQUFXLEVBQUUsTUFBTTtnQkFDbkIsT0FBTyxFQUFFO29CQUNQLG1EQUFtRDtpQkFDcEQ7Z0JBQ0QsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDO2FBQ3ZCLENBQUM7UUFFRixDQUFDLHNCQUFzQixFQUFFO2dCQUN2QixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsV0FBVyxFQUFFLHNEQUFzRDtnQkFDbkUsV0FBVyxFQUFFLE1BQU07Z0JBQ25CLE9BQU8sRUFBRTtvQkFDUCw2QkFBNkI7aUJBQzlCO2dCQUNELE9BQU8sRUFBRSxDQUFDLFdBQVcsQ0FBQzthQUN2QixDQUFDO1FBRUYsQ0FBQyxrQkFBa0IsRUFBRTtnQkFDbkIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLFdBQVcsRUFBRSx1R0FBdUc7Z0JBQ3BILFdBQVcsRUFBRSxNQUFNO2dCQUNuQixPQUFPLEVBQUU7b0JBQ1Asd0JBQXdCO2lCQUN6QjtnQkFDRCxPQUFPLEVBQUUsQ0FBQyxXQUFXLENBQUM7YUFDdkIsQ0FBQztRQUVGLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ2pCLFNBQVMsRUFBRSxJQUFJO2dCQUNmLFdBQVcsRUFBRSxNQUFNO2dCQUNuQixXQUFXLEVBQUUsRUFBRTtnQkFDZixPQUFPLEVBQUU7b0JBQ1AsdUNBQXVDO29CQUN2QyxtREFBbUQ7b0JBQ25ELG1EQUFtRDtpQkFDcEQ7YUFDRixDQUFDO1FBRUYsQ0FBQyxTQUFTLEVB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aG9kVGVtcGxhdGUgZnJvbSBcIi4vTWV0aG9kVGVtcGxhdGVUeXBlLm1qc1wiO1xuaW1wb3J0IHR5cGUgeyBzdHJpbmdBbmRUZW1wbGF0ZSB9IGZyb20gXCIuL01ldGhvZFRlbXBsYXRlVHlwZS5tanNcIjtcblxudm9pZChNZXRob2RUZW1wbGF0ZSk7XG5cbi8qKlxuICogQHJldHVybnMge0FycmF5PHN0cmluZywgTWV0aG9kVGVtcGxhdGU+W119IFRoZSB0ZW1wbGF0ZXMgdG8gZmVlZCBpbnRvIGEgTWFwLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZWZhdWx0TWV0aG9kcygpOiBzdHJpbmdBbmRUZW1wbGF0ZVtdIHtcbiAgcmV0dXJuIFtcbiAgICBbXCJyb290Q29udGFpbmVyTWFwXCIsIHtcbiAgICAgIGlzUHJvcGVydHk6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogXCJUaGUgcm9vdCBtYXAgaG9sZGluZyBrZXlzIGFuZCB2YWx1ZXMuXCIsXG4gICAgICBpbmNsdWRlQXJnczogXCJub25lXCIsXG4gICAgICBoZWFkZXJzOiBbXG4gICAgICAgIFwiQHR5cGUge01hcDxzdHJpbmcsIF9fY2xhc3NOYW1lX19+dmFsdWVBbmRLZXlTZXQ+fVwiLFxuICAgICAgXSxcbiAgICAgIGZvb3RlcnM6IFtcIkBjb25zdGFudFwiXSxcbiAgICB9XSxcblxuICAgIFtcInJvb3RDb250YWluZXJXZWFrTWFwXCIsIHtcbiAgICAgIGlzUHJvcGVydHk6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogXCJUaGUgcm9vdCBtYXAgaG9sZGluZyB3ZWFrIGNvbXBvc2l0ZSBrZXlzIGFuZCB2YWx1ZXMuXCIsXG4gICAgICBpbmNsdWRlQXJnczogXCJub25lXCIsXG4gICAgICBoZWFkZXJzOiBbXG4gICAgICAgIFwiQHR5cGUge1dlYWtNYXA8V2Vha0tleSwgKj59XCJcbiAgICAgIF0sXG4gICAgICBmb290ZXJzOiBbXCJAY29uc3RhbnRcIl0sXG4gICAgfV0sXG5cbiAgICBbXCJyb290Q29udGFpbmVyU2V0XCIsIHtcbiAgICAgIGlzUHJvcGVydHk6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogXCJTdG9yYWdlIG9mIHRoZSBTZXQncyBjb250ZW50cyBmb3IgcXVpY2sgaXRlcmF0aW9uIGluIC52YWx1ZXMoKS4gIFRoZSB2YWx1ZXMgYXJlIGFsd2F5cyBmcm96ZW4gYXJyYXlzLlwiLFxuICAgICAgaW5jbHVkZUFyZ3M6IFwibm9uZVwiLFxuICAgICAgaGVhZGVyczogW1xuICAgICAgICBcIkB0eXBlIHtNYXA8aGFzaCwgKltdPn1cIixcbiAgICAgIF0sXG4gICAgICBmb290ZXJzOiBbXCJAY29uc3RhbnRcIl0sXG4gICAgfV0sXG5cbiAgICBbXCJ2YWx1ZUFuZEtleVNldFwiLCB7XG4gICAgICBpc1R5cGVEZWY6IHRydWUsXG4gICAgICBpbmNsdWRlQXJnczogXCJub25lXCIsXG4gICAgICBkZXNjcmlwdGlvbjogXCJcIixcbiAgICAgIGhlYWRlcnM6IFtcbiAgICAgICAgXCJAdHlwZWRlZiBfX2NsYXNzTmFtZV9ffnZhbHVlQW5kS2V5U2V0XCIsXG4gICAgICAgIFwiQHByb3BlcnR5IHsqfSAgIHZhbHVlICBUaGUgYWN0dWFsIHZhbHVlIHdlIHN0b3JlLlwiLFxuICAgICAgICBcIkBwcm9wZXJ0eSB7KltdfSBrZXlTZXQgVGhlIHNldCBvZiBrZXlzIHdlIGhhc2hlZC5cIixcbiAgICAgIF0sXG4gICAgfV0sXG5cbiAgICBbXCJnZXRTaXplXCIsIHtcbiAgICAgIGlzUHJvcGVydHk6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogXCJUaGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgY29sbGVjdGlvbi5cIixcbiAgICAgIGluY2x1ZGVBcmdzOiBcIm5vbmVcIixcbiAgICAgIHJldHVyblR5cGU6IFwibnVtYmVyXCIsXG4gICAgICByZXR1cm5EZXNjcmlwdGlvbjogXCJUaGUgZWxlbWVudCBjb3VudC5cIixcbiAgICAgIGZvb3RlcnM6IFtcIkBwdWJsaWNcIiwgXCJAY29uc3RhbnRcIl0sXG4gICAgfV0sXG5cbiAgICBbXCJnZXRTaXplT2ZTZXRcIiwge1xuICAgICAgZGVzY3JpcHRpb246IFwiR2V0IHRoZSBzaXplIG9mIGEgcGFydGljdWxhciBzZXQuXCIsXG4gICAgICBpbmNsdWRlQXJnczogXCJtYXBBcmd1bWVudHNcIixcbiAgICAgIGZvb3RlcnM6IFtcIkBwdWJsaWNcIl0sXG4gICAgICByZXR1cm5UeXBlOiBcIm51bWJlclwiLFxuICAgICAgcmV0dXJuRGVzY3JpcHRpb246IFwiVGhlIHNldCBzaXplLlwiXG4gICAgfV0sXG5cbiAgICBbXCJtYXBTaXplXCIsIHtcbiAgICAgIGlzUHJvcGVydHk6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogXCJUaGUgbnVtYmVyIG9mIG1hcHMgaW4gdGhpcyBjb2xsZWN0aW9uLlwiLFxuICAgICAgaW5jbHVkZUFyZ3M6IFwibm9uZVwiLFxuICAgICAgcmV0dXJuVHlwZTogXCJudW1iZXJcIixcbiAgICAgIHJldHVybkRlc2NyaXB0aW9uOiBcIlRoZSBtYXAgY291bnQuXCIsXG4gICAgICBmb290ZXJzOiBbXCJAcHVibGljXCIsIFwiQGNvbnN0YW50XCJdLFxuICAgIH1dLFxuXG4gICAgW1wiY2xlYXJcIiwge1xuICAgICAgcmV0dXJuVm9pZDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkNsZWFyIHRoZSBjb2xsZWN0aW9uLlwiLFxuICAgICAgaW5jbHVkZUFyZ3M6IFwibm9uZVwiLFxuICAgICAgZm9vdGVyczogW1wiQHB1YmxpY1wiXSxcbiAgICB9XSxcblxuICAgIFtcImNsZWFyU2V0c1wiLCB7XG4gICAgICByZXR1cm5Wb2lkOiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246IFwiQ2xlYXIgYWxsIHNldHMgZnJvbSB0aGUgY29sbGVjdGlvbiBmb3IgYSBnaXZlbiBtYXAga2V5c2V0LlwiLFxuICAgICAgaW5jbHVkZUFyZ3M6IFwibWFwQXJndW1lbnRzXCIsXG4gICAgICBmb290ZXJzOiBbXCJAcHVibGljXCJdLFxuICAgIH1dLFxuXG4gICAgW1wiZGVsZXRlXCIsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkRlbGV0ZSBhbiBlbGVtZW50IGZyb20gdGhlIGNvbGxlY3Rpb24gYnkgdGhlIGdpdmVuIGtleSBzZXF1ZW5jZS5cIixcbiAgICAgIGluY2x1ZGVBcmdzOiBcImV4Y2x1ZGVWYWx1ZVwiLFxuICAgICAgcmV0dXJuVHlwZTogXCJib29sZWFuXCIsXG4gICAgICByZXR1cm5EZXNjcmlwdGlvbjogXCJUcnVlIGlmIHdlIGZvdW5kIHRoZSB2YWx1ZSBhbmQgZGVsZXRlZCBpdC5cIixcbiAgICAgIGZvb3RlcnM6IFtcIkBwdWJsaWNcIl0sXG4gICAgfV0sXG5cbiAgICBbXCJkZWxldGVTZXRzXCIsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkRlbGV0ZSBhbGwgc2V0cyBmcm9tIHRoZSBjb2xsZWN0aW9uIGJ5IHRoZSBnaXZlbiBtYXAgc2VxdWVuY2UuXCIsXG4gICAgICBpbmNsdWRlQXJnczogXCJtYXBBcmd1bWVudHNcIixcbiAgICAgIHJldHVyblR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgcmV0dXJuRGVzY3JpcHRpb246IFwiVHJ1ZSBpZiB3ZSBmb3VuZCB0aGUgdmFsdWUgYW5kIGRlbGV0ZWQgaXQuXCIsXG4gICAgICBmb290ZXJzOiBbXCJAcHVibGljXCJdLFxuICAgIH1dLFxuXG4gICAgW1wiZW50cmllc1wiLCB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJZaWVsZCB0aGUga2V5LXZhbHVlIHR1cGxlcyBvZiB0aGUgY29sbGVjdGlvbi5cIixcbiAgICAgIGluY2x1ZGVBcmdzOiBcIm5vbmVcIixcbiAgICAgIHJldHVyblR5cGU6IFwiKltdXCIsXG4gICAgICByZXR1cm5EZXNjcmlwdGlvbjogXCJUaGUga2V5cyBhbmQgdmFsdWVzLlwiLFxuICAgICAgaXNHZW5lcmF0b3I6IHRydWUsXG4gICAgICBmb290ZXJzOiBbXCJAcHVibGljXCJdLFxuICAgIH1dLFxuXG4gICAgW1wiZm9yRWFjaE1hcFwiLCB7XG4gICAgICByZXR1cm5Wb2lkOiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246IFwiSXRlcmF0ZSBvdmVyIHRoZSBrZXlzIGFuZCB2YWx1ZXMuXCIsXG4gICAgICBwYXJhbUZvb3RlcnM6IFtcbiAgICAgICAgW1wiX19jbGFzc05hbWVfX35Gb3JFYWNoQ2FsbGJhY2tcIiwgXCJjYWxsYmFja1wiLCBcIkEgZnVuY3Rpb24gdG8gaW52b2tlIGZvciBlYWNoIGl0ZXJhdGlvbi5cIl0sXG4gICAgICAgIFtcIm9iamVjdFwiLCBcInRoaXNBcmdcIiwgXCJWYWx1ZSB0byB1c2UgYXMgdGhpcyB3aGVuIGV4ZWN1dGluZyBjYWxsYmFjay5cIl0sXG4gICAgICBdLFxuICAgICAgaW5jbHVkZUFyZ3M6IFwibm9uZVwiLFxuICAgICAgZm9vdGVyczogW1wiQHB1YmxpY1wiXSxcbiAgICB9XSxcblxuICAgIFtcImZvckVhY2hTZXRcIiwge1xuICAgICAgcmV0dXJuVm9pZDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkl0ZXJhdGUgb3ZlciB0aGUga2V5cy5cIixcbiAgICAgIHBhcmFtRm9vdGVyczogW1xuICAgICAgICBbXCJfX2NsYXNzTmFtZV9ffkZvckVhY2hDYWxsYmFja1wiLCBcIl9fY2FsbGJhY2tfX1wiLCBcIkEgZnVuY3Rpb24gdG8gaW52b2tlIGZvciBlYWNoIGl0ZXJhdGlvbi5cIl0sXG4gICAgICAgIFtcIm9iamVjdFwiLCBcIl9fdGhpc0FyZ19fXCIsIFwiVmFsdWUgdG8gdXNlIGFzIHRoaXMgd2hlbiBleGVjdXRpbmcgY2FsbGJhY2suXCJdLFxuICAgICAgXSxcbiAgICAgIGluY2x1ZGVBcmdzOiBcIm5vbmVcIixcbiAgICAgIGZvb3RlcnM6IFtcIkBwdWJsaWNcIl0sXG4gICAgfV0sXG5cbiAgICBbXCJmb3JFYWNoTWFwU2V0XCIsIHtcbiAgICAgIHJldHVyblZvaWQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogXCJJdGVyYXRlIG92ZXIgdGhlIGtleXMgdW5kZXIgYSBtYXAgaW4gdGhpcyBjb2xsZWN0aW9uLlwiLFxuICAgICAgcGFyYW1Gb290ZXJzOiBbXG4gICAgICAgIFtcIl9fY2xhc3NOYW1lX19+Rm9yRWFjaENhbGxiYWNrXCIsIFwiX19jYWxsYmFja19fXCIsIFwiQSBmdW5jdGlvbiB0byBpbnZva2UgZm9yIGVhY2ggaXRlcmF0aW9uLlwiXSxcbiAgICAgICAgW1wib2JqZWN0XCIsIFwiX190aGlzQXJnX19cIiwgXCJWYWx1ZSB0byB1c2UgYXMgdGhpcyB3aGVuIGV4ZWN1dGluZyBjYWxsYmFjay5cIl0sXG4gICAgICBdLFxuICAgICAgaW5jbHVkZUFyZ3M6IFwibWFwQXJndW1lbnRzXCIsXG4gICAgICBmb290ZXJzOiBbXCJAcHVibGljXCJdLFxuICAgIH1dLFxuXG4gICAgW1wiZm9yRWFjaENhbGxiYWNrTWFwXCIsIHtcbiAgICAgIHJldHVyblZvaWQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogXCJBbiB1c2VyLXByb3ZpZGVkIGNhbGxiYWNrIHRvIC5mb3JFYWNoKCkuXCIsXG4gICAgICBpbmNsdWRlQXJnczogXCJleGNsdWRlVmFsdWVcIixcbiAgICAgIHBhcmFtSGVhZGVyczogW1xuICAgICAgICBbXCJfX3ZhbHVlVHlwZV9fXCIsIFwidmFsdWVcIiwgXCJfX3ZhbHVlRGVzY19fXCJdLFxuICAgICAgXSxcbiAgICAgIHBhcmFtRm9vdGVyczogW1xuICAgICAgICBbXCJfX2NsYXNzTmFtZV9fXCIsIFwiX19jb2xsZWN0aW9uX19cIiwgXCJUaGlzIGNvbGxlY3Rpb24uXCJdXG4gICAgICBdLFxuICAgICAgaGVhZGVyczogW1xuICAgICAgICBcIkBjYWxsYmFjayBfX2NsYXNzTmFtZV9ffkZvckVhY2hDYWxsYmFja1wiXG4gICAgICBdXG4gICAgfV0sXG5cbiAgICBbXCJmb3JFYWNoQ2FsbGJhY2tTZXRcIiwge1xuICAgICAgcmV0dXJuVm9pZDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkFuIHVzZXItcHJvdmlkZWQgY2FsbGJhY2sgdG8gLmZvckVhY2goKS5cIixcbiAgICAgIGluY2x1ZGVBcmdzOiBcImFsbFwiLFxuICAgICAgcGFyYW1Gb290ZXJzOiBbXG4gICAgICAgIFtcIl9fY2xhc3NOYW1lX19cIiwgXCJfX2NvbGxlY3Rpb25fX1wiLCBcIlRoaXMgY29sbGVjdGlvbi5cIl1cbiAgICAgIF0sXG4gICAgICBoZWFkZXJzOiBbXG4gICAgICAgIFwiQGNhbGxiYWNrIF9fY2xhc3NOYW1lX19+Rm9yRWFjaENhbGxiYWNrXCIsXG4gICAgICBdLFxuICAgIH1dLFxuXG4gICAgW1wiZ2V0XCIsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkdldCBhIHZhbHVlIGZvciBhIGtleSBzZXQuXCIsXG4gICAgICBpbmNsdWRlQXJnczogXCJleGNsdWRlVmFsdWVcIixcbiAgICAgIHJldHVyblR5cGU6IFwiX192YWx1ZVR5cGVfXz9cIixcbiAgICAgIHJldHVybkRlc2NyaXB0aW9uOiBcIl9fdmFsdWVEZXNjX18gIFVuZGVmaW5lZCBpZiBpdCBpc24ndCBpbiB0aGUgY29sbGVjdGlvbi5cIixcbiAgICAgIGZvb3RlcnM6IFtcIkBwdWJsaWNcIl0sXG4gICAgfV0sXG5cbiAgICBbXCJoYXNcIiwge1xuICAgICAgZGVzY3JpcHRpb246IFwiUmVwb3J0IGlmIHRoZSBjb2xsZWN0aW9uIGhhcyBhIHZhbHVlIGZvciBhIGtleSBzZXQuXCIsXG4gICAgICBpbmNsdWRlQXJnczogXCJleGNsdWRlVmFsdWVcIixcbiAgICAgIHJldHVyblR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgcmV0dXJuRGVzY3JpcHRpb246IFwiVHJ1ZSBpZiB0aGUga2V5IHNldCByZWZlcnMgdG8gYSB2YWx1ZSBpbiB0aGUgY29sbGVjdGlvbi5cIixcbiAgICAgIGZvb3RlcnM6IFtcIkBwdWJsaWNcIl0sXG4gICAgfV0sXG5cbiAgICBbXCJoYXNTZXRcIiwge1xuICAgICAgZGVzY3JpcHRpb246IFwiUmVwb3J0IGlmIHRoZSBjb2xsZWN0aW9uIGhhcyBhbnkgc2V0cyBmb3IgYSBtYXAuXCIsXG4gICAgICBpbmNsdWRlQXJnczogXCJtYXBBcmd1bWVudHNcIixcbiAgICAgIHJldHVyblR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgcmV0dXJuRGVzY3JpcHRpb246IFwiVHJ1ZSBpZiB0aGUga2V5IHNldCByZWZlcnMgdG8gYSB2YWx1ZSBpbiB0aGUgY29sbGVjdGlvbi5cIixcbiAgICAgIGZvb3RlcnM6IFtcIkBwdWJsaWNcIl0sXG4gICAgfV0sXG5cbiAgICBbXCJrZXlzXCIsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIllpZWxkIHRoZSBrZXkgc2V0cyBvZiB0aGUgY29sbGVjdGlvbi5cIixcbiAgICAgIGluY2x1ZGVBcmdzOiBcIm5vbmVcIixcbiAgICAgIHJldHVyblR5cGU6IFwiKltdXCIsXG4gICAgICByZXR1cm5EZXNjcmlwdGlvbjogXCJUaGUga2V5IHNldHMuXCIsXG4gICAgICBpc0dlbmVyYXRvcjogdHJ1ZSxcbiAgICAgIGZvb3RlcnM6IFtcIkBwdWJsaWNcIl0sXG4gICAgfV0sXG5cbiAgICBbXCJzZXRcIiwge1xuICAgICAgZGVzY3JpcHRpb246IFwiU2V0IGEgdmFsdWUgZm9yIGEga2V5IHNldC5cIixcbiAgICAgIGluY2x1ZGVBcmdzOiBcImFsbFwiLFxuICAgICAgcmV0dXJuVHlwZTogXCJfX2NsYXNzTmFtZV9fXCIsXG4gICAgICByZXR1cm5EZXNjcmlwdGlvbjogXCJUaGlzIGNvbGxlY3Rpb24uXCIsXG4gICAgICBmb290ZXJzOiBbXCJAcHVibGljXCJdLFxuICAgIH1dLFxuXG4gICAgW1wiYWRkXCIsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkFkZCBhIGtleSBzZXQgdG8gdGhpcyBjb2xsZWN0aW9uLlwiLFxuICAgICAgaW5jbHVkZUFyZ3M6IFwiZXhjbHVkZVZhbHVlXCIsXG4gICAgICByZXR1cm5UeXBlOiBcIl9fY2xhc3NOYW1lX19cIixcbiAgICAgIHJldHVybkRlc2NyaXB0aW9uOiBcIlRoaXMgY29sbGVjdGlvbi5cIixcbiAgICAgIGZvb3RlcnM6IFtcIkBwdWJsaWNcIl0sXG4gICAgfV0sXG5cbiAgICBbXCJhZGRTZXRzXCIsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkFkZCBzZXZlcmFsIHNldHMgdG8gYSBtYXAgaW4gdGhpcyBjb2xsZWN0aW9uLlwiLFxuICAgICAgaW5jbHVkZUFyZ3M6IFwibWFwQXJndW1lbnRzXCIsXG4gICAgICBwYXJhbUZvb3RlcnM6IFtcbiAgICAgICAgWydTZXRbXScsICdfX3NldHNfXycsIFwiVGhlIHNldHMgdG8gYWRkLlwiXSxcbiAgICAgIF0sXG4gICAgICByZXR1cm5UeXBlOiBcIl9fY2xhc3NOYW1lX19cIixcbiAgICAgIHJldHVybkRlc2NyaXB0aW9uOiBcIlRoaXMgY29sbGVjdGlvbi5cIixcbiAgICAgIGZvb3RlcnM6IFtcIkBwdWJsaWNcIl0sXG4gICAgfV0sXG5cbiAgICBbXCJ2YWx1ZXNcIiwge1xuICAgICAgZGVzY3JpcHRpb246IFwiWWllbGQgdGhlIHZhbHVlcyBvZiB0aGUgY29sbGVjdGlvbi5cIixcbiAgICAgIGluY2x1ZGVBcmdzOiBcIm5vbmVcIixcbiAgICAgIHJldHVyblR5cGU6IFwiX192YWx1ZVR5cGVfX1wiLFxuICAgICAgcmV0dXJuRGVzY3JpcHRpb246IFwiVGhlIHZhbHVlLlwiLFxuICAgICAgaXNHZW5lcmF0b3I6IHRydWUsXG4gICAgICBmb290ZXJzOiBbXCJAcHVibGljXCJdLFxuICAgIH1dLFxuXG4gICAgW1widmFsdWVzU2V0XCIsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIllpZWxkIHRoZSBzZXRzIG9mIHRoZSBjb2xsZWN0aW9uIGluIGEgbWFwLlwiLFxuICAgICAgaW5jbHVkZUFyZ3M6IFwibWFwQXJndW1lbnRzXCIsXG4gICAgICByZXR1cm5UeXBlOiBcIl9fdmFsdWVUeXBlX19cIixcbiAgICAgIHJldHVybkRlc2NyaXB0aW9uOiBcIlRoZSBzZXRzLlwiLFxuICAgICAgaXNHZW5lcmF0b3I6IHRydWUsXG4gICAgICBmb290ZXJzOiBbXCJAcHVibGljXCJdLFxuICAgIH1dLFxuXG4gICAgW1wiaXNWYWxpZEtleVB1YmxpY1wiLCB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJEZXRlcm1pbmUgaWYgYSBzZXQgb2Yga2V5cyBpcyB2YWxpZC5cIixcbiAgICAgIGluY2x1ZGVBcmdzOiBcImV4Y2x1ZGVWYWx1ZVwiLFxuICAgICAgcmV0dXJuVHlwZTogXCJib29sZWFuXCIsXG4gICAgICByZXR1cm5EZXNjcmlwdGlvbjogXCJUcnVlIGlmIHRoZSB2YWxpZGF0aW9uIHBhc3NlcywgZmFsc2UgaWYgaXQgZG9lc24ndC5cIixcbiAgICAgIGZvb3RlcnM6IFtcIkBwdWJsaWNcIl0sXG4gICAgfV0sXG5cbiAgICBbXCJpc1ZhbGlkS2V5UHJpdmF0ZVwiLCB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJEZXRlcm1pbmUgaWYgYSBzZXQgb2Yga2V5cyBpcyB2YWxpZC5cIixcbiAgICAgIGluY2x1ZGVBcmdzOiBcImV4Y2x1ZGVWYWx1ZVwiLFxuICAgICAgcmV0dXJuVHlwZTogXCJib29sZWFuXCIsXG4gICAgICByZXR1cm5EZXNjcmlwdGlvbjogXCJUcnVlIGlmIHRoZSB2YWxpZGF0aW9uIHBhc3NlcywgZmFsc2UgaWYgaXQgZG9lc24ndC5cIixcbiAgICB9XSxcblxuICAgIFtcInJlcXVpcmVWYWxpZEtleVwiLCB7XG4gICAgICByZXR1cm5Wb2lkOiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246IFwiVGhyb3cgaWYgdGhlIGtleSBzZXQgaXMgbm90IHZhbGlkLlwiLFxuICAgICAgaW5jbHVkZUFyZ3M6IFwiZXhjbHVkZVZhbHVlXCIsXG4gICAgICBmb290ZXJzOiBbXCJAdGhyb3dzIGZvciBhbiBpbnZhbGlkIGtleSBzZXQuXCJdXG4gICAgfV0sXG5cbiAgICBbXCJyZXF1aXJlSW5uZXJDb2xsZWN0aW9uUHJpdmF0ZVwiLCB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJSZXF1aXJlIGFuIGlubmVyIGNvbGxlY3Rpb24gZXhpc3QgZm9yIHRoZSBnaXZlbiBtYXAga2V5cy5cIixcbiAgICAgIGluY2x1ZGVBcmdzOiBcIm1hcEFyZ3VtZW50c1wiLFxuICAgICAgcmV0dXJuVHlwZTogXCJfX2NsYXNzTmFtZV9ffklubmVyTWFwXCIsXG4gICAgICByZXR1cm5EZXNjcmlwdGlvbjogXCJUaGUgaW5uZXIgY29sbGVjdGlvbi5cIlxuICAgIH1dLFxuXG4gICAgW1wiZ2V0RXhpc3RpbmdJbm5lckNvbGxlY3Rpb25Qcml2YXRlXCIsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkdldCBhbiBleGlzdGluZyBpbm5lciBjb2xsZWN0aW9uIGZvciB0aGUgZ2l2ZW4gbWFwIGtleXMuXCIsXG4gICAgICBpbmNsdWRlQXJnczogXCJtYXBBcmd1bWVudHNcIixcbiAgICAgIHJldHVyblR5cGU6IFwiX19jbGFzc05hbWVfX35Jbm5lck1hcD9cIixcbiAgICAgIHJldHVybkRlc2NyaXB0aW9uOiBcIlRoZSBpbm5lciBjb2xsZWN0aW9uLlwiXG4gICAgfV0sXG5cbiAgICBbXCJyZXF1aXJlVmFsaWRNYXBLZXlcIiwge1xuICAgICAgcmV0dXJuVm9pZDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlRocm93IGlmIHRoZSBtYXAga2V5IHNldCBpcyBub3QgdmFsaWQuXCIsXG4gICAgICBpbmNsdWRlQXJnczogXCJtYXBBcmd1bWVudHNcIixcbiAgICAgIGZvb3RlcnM6IFtcIkB0aHJvd3MgZm9yIGFuIGludmFsaWQga2V5IHNldC5cIl1cbiAgICB9XSxcblxuICAgIFtcImlzVmFsaWRNYXBLZXlQcml2YXRlXCIsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkRldGVybWluZSBpZiBhIHNldCBvZiBtYXAga2V5cyBpcyB2YWxpZC5cIixcbiAgICAgIGluY2x1ZGVBcmdzOiBcIm1hcEFyZ3VtZW50c1wiLFxuICAgICAgcmV0dXJuVHlwZTogXCJib29sZWFuXCIsXG4gICAgICByZXR1cm5EZXNjcmlwdGlvbjogXCJUcnVlIGlmIHRoZSB2YWxpZGF0aW9uIHBhc3NlcywgZmFsc2UgaWYgaXQgZG9lc24ndC5cIixcbiAgICB9XSxcblxuICAgIFtcImlzVmFsaWRTZXRLZXlQcml2YXRlXCIsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkRldGVybWluZSBpZiBhIHNldCBvZiBzZXQga2V5cyBpcyB2YWxpZC5cIixcbiAgICAgIGluY2x1ZGVBcmdzOiBcInNldEFyZ3VtZW50c1wiLFxuICAgICAgcmV0dXJuVHlwZTogXCJib29sZWFuXCIsXG4gICAgICByZXR1cm5EZXNjcmlwdGlvbjogXCJUcnVlIGlmIHRoZSB2YWxpZGF0aW9uIHBhc3NlcywgZmFsc2UgaWYgaXQgZG9lc24ndC5cIixcbiAgICB9XSxcblxuICAgIFtcImlzVmFsaWRWYWx1ZVB1YmxpY1wiLCB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB2YWxpZC5cIixcbiAgICAgIGluY2x1ZGVBcmdzOiBcInZhbHVlXCIsXG4gICAgICByZXR1cm5UeXBlOiBcImJvb2xlYW5cIixcbiAgICAgIHJldHVybkRlc2NyaXB0aW9uOiBcIlRydWUgaWYgdGhlIHZhbGlkYXRpb24gcGFzc2VzLCBmYWxzZSBpZiBpdCBkb2Vzbid0LlwiLFxuICAgICAgZm9vdGVyczogW1wiQHB1YmxpY1wiXSxcbiAgICB9XSxcblxuICAgIFtcImlzVmFsaWRWYWx1ZVByaXZhdGVcIiwge1xuICAgICAgZGVzY3JpcHRpb246IFwiRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdmFsaWQuXCIsXG4gICAgICBpbmNsdWRlQXJnczogXCJ2YWx1ZVwiLFxuICAgICAgcmV0dXJuVHlwZTogXCJib29sZWFuXCIsXG4gICAgICByZXR1cm5EZXNjcmlwdGlvbjogXCJUcnVlIGlmIHRoZSB2YWxpZGF0aW9uIHBhc3NlcywgZmFsc2UgaWYgaXQgZG9lc24ndC5cIixcbiAgICB9XSxcbiAgXTtcbn1cbiJdfQ==