/**
 * Canonicalize a string to be either empty, or trimmed at both ends of whitespace.
 *
 * @param {string | undefined}   value The original input string, if we have it.
 * @returns {string} The canonical string.
 */
function validString(value) {
    return (typeof value === "string") && value.trim().length > 0 ? value : "";
}
/**
 * A catch-all for run-time options for CodeGenerator, and anyone who invokes it.
 *
 * @public
 */
export default class CompileTimeOptions {
    licenseText;
    license;
    author;
    copyright;
    disableKeyOptimization;
    generateTypeScript;
    constructor(properties = {}) {
        this.licenseText = validString(properties.licenseText);
        this.license = validString(properties.license);
        this.author = validString(properties.author);
        this.copyright = validString(properties.copyright);
        /**
         * If true, treat one map key as n map keys, one set key as n set keys.
         * This means including KeyHasher's, WeakKeyComposer's when you might not need to.
         *
         * @type {boolean}
         */
        this.disableKeyOptimization = Boolean(properties.disableKeyOptimization);
        /**
         * True if we should generate TypeScript .mts files, instead of .mjs files.
         */
        this.generateTypeScript = Boolean(properties.generateTypeScript);
    }
}
Object.freeze(CompileTimeOptions);
Object.freeze(CompileTimeOptions.prototype);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcGlsZVRpbWVPcHRpb25zLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNvbXBpbGVUaW1lT3B0aW9ucy5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0dBS0c7QUFDSCxTQUFTLFdBQVcsQ0FBQyxLQUF5QjtJQUU1QyxPQUFPLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzdFLENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sT0FBTyxrQkFBa0I7SUFDckMsV0FBVyxDQUFTO0lBQ3BCLE9BQU8sQ0FBUztJQUNoQixNQUFNLENBQVM7SUFDZixTQUFTLENBQVM7SUFDbEIsc0JBQXNCLENBQVU7SUFDaEMsa0JBQWtCLENBQVU7SUFFNUIsWUFBWSxhQUEwQyxFQUFFO1FBRXRELElBQUksQ0FBQyxXQUFXLEdBQVEsV0FBVyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsT0FBTyxHQUFZLFdBQVcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLE1BQU0sR0FBYSxXQUFXLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxTQUFTLEdBQVUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUUxRDs7Ozs7V0FLRztRQUNILElBQUksQ0FBQyxzQkFBc0IsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFFekU7O1dBRUc7UUFDSCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ25FLENBQUM7Q0FDRjtBQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUNsQyxNQUFNLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDYW5vbmljYWxpemUgYSBzdHJpbmcgdG8gYmUgZWl0aGVyIGVtcHR5LCBvciB0cmltbWVkIGF0IGJvdGggZW5kcyBvZiB3aGl0ZXNwYWNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nIHwgdW5kZWZpbmVkfSAgIHZhbHVlIFRoZSBvcmlnaW5hbCBpbnB1dCBzdHJpbmcsIGlmIHdlIGhhdmUgaXQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY2Fub25pY2FsIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gdmFsaWRTdHJpbmcodmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCkgOiBzdHJpbmdcbntcbiAgcmV0dXJuICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpICYmIHZhbHVlLnRyaW0oKS5sZW5ndGggPiAwID8gdmFsdWUgOiBcIlwiO1xufVxuXG4vKipcbiAqIEEgY2F0Y2gtYWxsIGZvciBydW4tdGltZSBvcHRpb25zIGZvciBDb2RlR2VuZXJhdG9yLCBhbmQgYW55b25lIHdobyBpbnZva2VzIGl0LlxuICpcbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tcGlsZVRpbWVPcHRpb25zIHtcbiAgbGljZW5zZVRleHQ6IHN0cmluZztcbiAgbGljZW5zZTogc3RyaW5nO1xuICBhdXRob3I6IHN0cmluZztcbiAgY29weXJpZ2h0OiBzdHJpbmc7XG4gIGRpc2FibGVLZXlPcHRpbWl6YXRpb246IGJvb2xlYW47XG4gIGdlbmVyYXRlVHlwZVNjcmlwdDogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wZXJ0aWVzOiBQYXJ0aWFsPENvbXBpbGVUaW1lT3B0aW9ucz4gPSB7fSlcbiAge1xuICAgIHRoaXMubGljZW5zZVRleHQgICAgICA9IHZhbGlkU3RyaW5nKHByb3BlcnRpZXMubGljZW5zZVRleHQpO1xuICAgIHRoaXMubGljZW5zZSAgICAgICAgICA9IHZhbGlkU3RyaW5nKHByb3BlcnRpZXMubGljZW5zZSk7XG4gICAgdGhpcy5hdXRob3IgICAgICAgICAgID0gdmFsaWRTdHJpbmcocHJvcGVydGllcy5hdXRob3IpO1xuICAgIHRoaXMuY29weXJpZ2h0ICAgICAgICA9IHZhbGlkU3RyaW5nKHByb3BlcnRpZXMuY29weXJpZ2h0KTtcblxuICAgIC8qKlxuICAgICAqIElmIHRydWUsIHRyZWF0IG9uZSBtYXAga2V5IGFzIG4gbWFwIGtleXMsIG9uZSBzZXQga2V5IGFzIG4gc2V0IGtleXMuXG4gICAgICogVGhpcyBtZWFucyBpbmNsdWRpbmcgS2V5SGFzaGVyJ3MsIFdlYWtLZXlDb21wb3NlcidzIHdoZW4geW91IG1pZ2h0IG5vdCBuZWVkIHRvLlxuICAgICAqXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5kaXNhYmxlS2V5T3B0aW1pemF0aW9uID0gQm9vbGVhbihwcm9wZXJ0aWVzLmRpc2FibGVLZXlPcHRpbWl6YXRpb24pO1xuXG4gICAgLyoqXG4gICAgICogVHJ1ZSBpZiB3ZSBzaG91bGQgZ2VuZXJhdGUgVHlwZVNjcmlwdCAubXRzIGZpbGVzLCBpbnN0ZWFkIG9mIC5tanMgZmlsZXMuXG4gICAgICovXG4gICAgdGhpcy5nZW5lcmF0ZVR5cGVTY3JpcHQgPSBCb29sZWFuKHByb3BlcnRpZXMuZ2VuZXJhdGVUeXBlU2NyaXB0KTtcbiAgfVxufVxuT2JqZWN0LmZyZWV6ZShDb21waWxlVGltZU9wdGlvbnMpO1xuT2JqZWN0LmZyZWV6ZShDb21waWxlVGltZU9wdGlvbnMucHJvdG90eXBlKTtcbiJdfQ==