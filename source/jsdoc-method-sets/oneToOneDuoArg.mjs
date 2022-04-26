import MethodTemplate from "./MethodTemplateType.mjs";
void (MethodTemplate);
/**
 * @returns {Array<string, MethodTemplate>[]} The templates to feed into a Map.
 */
export default function OneToOneMethodParameters() {
    return [
        ["bindOneToOne", {
                returnVoid: true,
                description: "Bind two sets of keys and values together.",
                includeArgs: "excludeValue",
                footers: ["@public"],
            }],
        ["bindOneToOneSimple", {
                returnVoid: true,
                description: "Bind two values together.",
                includeArgs: "excludeValue",
                footers: ["@public"],
            }]
    ];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25lVG9PbmVEdW9BcmcubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsib25lVG9PbmVEdW9BcmcubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sY0FBYyxNQUFNLDBCQUEwQixDQUFDO0FBR3RELEtBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUVyQjs7R0FFRztBQUNILE1BQU0sQ0FBQyxPQUFPLFVBQVUsd0JBQXdCO0lBQzlDLE9BQU87UUFDTCxDQUFDLGNBQWMsRUFBRTtnQkFDZixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsV0FBVyxFQUFFLDRDQUE0QztnQkFDekQsV0FBVyxFQUFFLGNBQWM7Z0JBQzNCLE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQzthQUNyQixDQUFDO1FBRUYsQ0FBQyxvQkFBb0IsRUFBRTtnQkFDckIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLFdBQVcsRUFBRSwyQkFBMkI7Z0JBQ3hDLFdBQVcsRUFBRSxjQUFjO2dCQUMzQixPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUM7YUFDckIsQ0FBQztLQUNILENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE1ldGhvZFRlbXBsYXRlIGZyb20gXCIuL01ldGhvZFRlbXBsYXRlVHlwZS5tanNcIjtcbmltcG9ydCB0eXBlIHsgc3RyaW5nQW5kVGVtcGxhdGUgfSBmcm9tIFwiLi9NZXRob2RUZW1wbGF0ZVR5cGUubWpzXCI7XG5cbnZvaWQoTWV0aG9kVGVtcGxhdGUpO1xuXG4vKipcbiAqIEByZXR1cm5zIHtBcnJheTxzdHJpbmcsIE1ldGhvZFRlbXBsYXRlPltdfSBUaGUgdGVtcGxhdGVzIHRvIGZlZWQgaW50byBhIE1hcC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gT25lVG9PbmVNZXRob2RQYXJhbWV0ZXJzKCk6IHN0cmluZ0FuZFRlbXBsYXRlW10ge1xuICByZXR1cm4gW1xuICAgIFtcImJpbmRPbmVUb09uZVwiLCB7XG4gICAgICByZXR1cm5Wb2lkOiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246IFwiQmluZCB0d28gc2V0cyBvZiBrZXlzIGFuZCB2YWx1ZXMgdG9nZXRoZXIuXCIsXG4gICAgICBpbmNsdWRlQXJnczogXCJleGNsdWRlVmFsdWVcIixcbiAgICAgIGZvb3RlcnM6IFtcIkBwdWJsaWNcIl0sXG4gICAgfV0sXG5cbiAgICBbXCJiaW5kT25lVG9PbmVTaW1wbGVcIiwge1xuICAgICAgcmV0dXJuVm9pZDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkJpbmQgdHdvIHZhbHVlcyB0b2dldGhlci5cIixcbiAgICAgIGluY2x1ZGVBcmdzOiBcImV4Y2x1ZGVWYWx1ZVwiLFxuICAgICAgZm9vdGVyczogW1wiQHB1YmxpY1wiXSxcbiAgICB9XVxuICBdO1xufVxuIl19