import MethodTemplate from "./MethodTemplateType.mjs";
void (MethodTemplate);
/**
 * @returns {Array<string, MethodTemplate>[]} The templates to feed into a Map.
 */
export default function OneToOneMethodParameters() {
    return [
        ["delete", {
                description: "Delete a target value.",
                includeArgs: "all",
                returnType: "boolean",
                returnDescription: "True if the target value was deleted.",
                footers: ["@public"],
            }],
        ["get", {
                description: "Get a target value.",
                includeArgs: "all",
                returnType: "*",
                returnDescription: "The target value.",
                footers: ["@public"],
            }],
        ["has", {
                description: "Determine if a target value exists.",
                includeArgs: "all",
                returnType: "boolean",
                returnDescription: "True if the target value exists.",
                footers: ["@public"],
            }],
        ["isValidKey", {
                description: "Determine if a key is valid.",
                includeArgs: "excludeValue",
                returnType: "boolean",
                returnDescription: "True if the key is valid.",
                footers: [
                    "@see the base map class for further constraints.",
                    "@public",
                ],
            }],
        ["isValidValue", {
                description: "Determine if a value is valid.",
                includeArgs: "value",
                returnType: "boolean",
                returnDescription: "True if the value is valid.",
                footers: [
                    "@see the base map class for further constraints.",
                    "@public",
                ],
            }],
    ];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25lVG9PbmVTb2xvQXJnLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm9uZVRvT25lU29sb0FyZy5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxjQUFjLE1BQU0sMEJBQTBCLENBQUM7QUFHdEQsS0FBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBRXJCOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sVUFBVSx3QkFBd0I7SUFDOUMsT0FBTztRQUNMLENBQUMsUUFBUSxFQUFFO2dCQUNULFdBQVcsRUFBRSx3QkFBd0I7Z0JBQ3JDLFdBQVcsRUFBRSxLQUFLO2dCQUNsQixVQUFVLEVBQUUsU0FBUztnQkFDckIsaUJBQWlCLEVBQUUsdUNBQXVDO2dCQUMxRCxPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUM7YUFDckIsQ0FBQztRQUVGLENBQUMsS0FBSyxFQUFFO2dCQUNOLFdBQVcsRUFBRSxxQkFBcUI7Z0JBQ2xDLFdBQVcsRUFBRSxLQUFLO2dCQUNsQixVQUFVLEVBQUUsR0FBRztnQkFDZixpQkFBaUIsRUFBRSxtQkFBbUI7Z0JBQ3RDLE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQzthQUNyQixDQUFDO1FBRUYsQ0FBQyxLQUFLLEVBQUU7Z0JBQ04sV0FBVyxFQUFFLHFDQUFxQztnQkFDbEQsV0FBVyxFQUFFLEtBQUs7Z0JBQ2xCLFVBQVUsRUFBRSxTQUFTO2dCQUNyQixpQkFBaUIsRUFBRSxrQ0FBa0M7Z0JBQ3JELE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQzthQUNyQixDQUFDO1FBRUYsQ0FBQyxZQUFZLEVBQUU7Z0JBQ2IsV0FBVyxFQUFFLDhCQUE4QjtnQkFDM0MsV0FBVyxFQUFFLGNBQWM7Z0JBQzNCLFVBQVUsRUFBRSxTQUFTO2dCQUNyQixpQkFBaUIsRUFBRSwyQkFBMkI7Z0JBQzlDLE9BQU8sRUFBRTtvQkFDUCxrREFBa0Q7b0JBQ2xELFNBQVM7aUJBQ1Y7YUFDRixDQUFDO1FBRUYsQ0FBQyxjQUFjLEVBQUU7Z0JBQ2YsV0FBVyxFQUFFLGdDQUFnQztnQkFDN0MsV0FBVyxFQUFFLE9BQU87Z0JBQ3BCLFVBQVUsRUFBRSxTQUFTO2dCQUNyQixpQkFBaUIsRUFBRSw2QkFBNkI7Z0JBQ2hELE9BQU8sRUFBRTtvQkFDUCxrREFBa0Q7b0JBQ2xELFNBQVM7aUJBQ1Y7YUFDRixDQUFDO0tBQ0gsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTWV0aG9kVGVtcGxhdGUgZnJvbSBcIi4vTWV0aG9kVGVtcGxhdGVUeXBlLm1qc1wiO1xuaW1wb3J0IHR5cGUgeyBzdHJpbmdBbmRUZW1wbGF0ZSB9IGZyb20gXCIuL01ldGhvZFRlbXBsYXRlVHlwZS5tanNcIjtcblxudm9pZChNZXRob2RUZW1wbGF0ZSk7XG5cbi8qKlxuICogQHJldHVybnMge0FycmF5PHN0cmluZywgTWV0aG9kVGVtcGxhdGU+W119IFRoZSB0ZW1wbGF0ZXMgdG8gZmVlZCBpbnRvIGEgTWFwLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBPbmVUb09uZU1ldGhvZFBhcmFtZXRlcnMoKTogc3RyaW5nQW5kVGVtcGxhdGVbXSB7XG4gIHJldHVybiBbXG4gICAgW1wiZGVsZXRlXCIsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkRlbGV0ZSBhIHRhcmdldCB2YWx1ZS5cIixcbiAgICAgIGluY2x1ZGVBcmdzOiBcImFsbFwiLFxuICAgICAgcmV0dXJuVHlwZTogXCJib29sZWFuXCIsXG4gICAgICByZXR1cm5EZXNjcmlwdGlvbjogXCJUcnVlIGlmIHRoZSB0YXJnZXQgdmFsdWUgd2FzIGRlbGV0ZWQuXCIsXG4gICAgICBmb290ZXJzOiBbXCJAcHVibGljXCJdLFxuICAgIH1dLFxuXG4gICAgW1wiZ2V0XCIsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkdldCBhIHRhcmdldCB2YWx1ZS5cIixcbiAgICAgIGluY2x1ZGVBcmdzOiBcImFsbFwiLFxuICAgICAgcmV0dXJuVHlwZTogXCIqXCIsXG4gICAgICByZXR1cm5EZXNjcmlwdGlvbjogXCJUaGUgdGFyZ2V0IHZhbHVlLlwiLFxuICAgICAgZm9vdGVyczogW1wiQHB1YmxpY1wiXSxcbiAgICB9XSxcblxuICAgIFtcImhhc1wiLCB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJEZXRlcm1pbmUgaWYgYSB0YXJnZXQgdmFsdWUgZXhpc3RzLlwiLFxuICAgICAgaW5jbHVkZUFyZ3M6IFwiYWxsXCIsXG4gICAgICByZXR1cm5UeXBlOiBcImJvb2xlYW5cIixcbiAgICAgIHJldHVybkRlc2NyaXB0aW9uOiBcIlRydWUgaWYgdGhlIHRhcmdldCB2YWx1ZSBleGlzdHMuXCIsXG4gICAgICBmb290ZXJzOiBbXCJAcHVibGljXCJdLFxuICAgIH1dLFxuXG4gICAgW1wiaXNWYWxpZEtleVwiLCB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJEZXRlcm1pbmUgaWYgYSBrZXkgaXMgdmFsaWQuXCIsXG4gICAgICBpbmNsdWRlQXJnczogXCJleGNsdWRlVmFsdWVcIixcbiAgICAgIHJldHVyblR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgcmV0dXJuRGVzY3JpcHRpb246IFwiVHJ1ZSBpZiB0aGUga2V5IGlzIHZhbGlkLlwiLFxuICAgICAgZm9vdGVyczogW1xuICAgICAgICBcIkBzZWUgdGhlIGJhc2UgbWFwIGNsYXNzIGZvciBmdXJ0aGVyIGNvbnN0cmFpbnRzLlwiLFxuICAgICAgICBcIkBwdWJsaWNcIixcbiAgICAgIF0sXG4gICAgfV0sXG5cbiAgICBbXCJpc1ZhbGlkVmFsdWVcIiwge1xuICAgICAgZGVzY3JpcHRpb246IFwiRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdmFsaWQuXCIsXG4gICAgICBpbmNsdWRlQXJnczogXCJ2YWx1ZVwiLFxuICAgICAgcmV0dXJuVHlwZTogXCJib29sZWFuXCIsXG4gICAgICByZXR1cm5EZXNjcmlwdGlvbjogXCJUcnVlIGlmIHRoZSB2YWx1ZSBpcyB2YWxpZC5cIixcbiAgICAgIGZvb3RlcnM6IFtcbiAgICAgICAgXCJAc2VlIHRoZSBiYXNlIG1hcCBjbGFzcyBmb3IgZnVydGhlciBjb25zdHJhaW50cy5cIixcbiAgICAgICAgXCJAcHVibGljXCIsXG4gICAgICBdLFxuICAgIH1dLFxuICBdO1xufVxuIl19