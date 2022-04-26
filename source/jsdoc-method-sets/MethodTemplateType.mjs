/**
 * @typedef MethodTemplate
 * @property {boolean?}    isTypeDef          True if this is a type definition (no description, no returns)
 * @property {boolean?}    isProperty         True if this is a property definition (no returns).
 * @property {boolean?}    returnVoid         True if this is a method returning nothing.
 * @property {string}      description        The descrption of the method's purpose.
 * @property {string}      includeArgs        A flag to determine how public keys (and values) should be in the API.
 * @property {string[]?}   headers            JSDoc header lines before the parameter block.
 * @property {string[][]?} paramHeaders       Parameters from the template (not the user)
 * @property {string[][]?} paramFooters       Parameters from the template (not the user)
 * @property {string[]?}   footers            JSDoc footer lines after the parameters (and the return value).
 * @property {string?}     returnType         The return type for the specified function.
 * @property {string?}     returnDescription  A description of the return value to provide.
 * @property {boolean?}    isGenerator        If true, provides a 'yield' instead of a 'return'.
 * @see jsdoc-method-sets/default.mjs for typical objects.
 */
export default class MethodTemplate {
    isTypeDef;
    isProperty;
    returnVoid;
    description = "";
    includeArgs = "";
    headers;
    paramHeaders;
    paramFooters;
    footers;
    returnType;
    returnDescription;
    isGenerator;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0aG9kVGVtcGxhdGVUeXBlLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1ldGhvZFRlbXBsYXRlVHlwZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sT0FBZ0IsY0FBYztJQUMxQyxTQUFTLENBQVc7SUFDcEIsVUFBVSxDQUFXO0lBQ3JCLFVBQVUsQ0FBVztJQUNyQixXQUFXLEdBQUcsRUFBRSxDQUFDO0lBQ2pCLFdBQVcsR0FBRyxFQUFFLENBQUM7SUFDakIsT0FBTyxDQUFZO0lBQ25CLFlBQVksQ0FBYztJQUMxQixZQUFZLENBQWM7SUFDMUIsT0FBTyxDQUFZO0lBQ25CLFVBQVUsQ0FBVTtJQUNwQixpQkFBaUIsQ0FBVTtJQUMzQixXQUFXLENBQVc7Q0FDdkIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEB0eXBlZGVmIE1ldGhvZFRlbXBsYXRlXG4gKiBAcHJvcGVydHkge2Jvb2xlYW4/fSAgICBpc1R5cGVEZWYgICAgICAgICAgVHJ1ZSBpZiB0aGlzIGlzIGEgdHlwZSBkZWZpbml0aW9uIChubyBkZXNjcmlwdGlvbiwgbm8gcmV0dXJucylcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbj99ICAgIGlzUHJvcGVydHkgICAgICAgICBUcnVlIGlmIHRoaXMgaXMgYSBwcm9wZXJ0eSBkZWZpbml0aW9uIChubyByZXR1cm5zKS5cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbj99ICAgIHJldHVyblZvaWQgICAgICAgICBUcnVlIGlmIHRoaXMgaXMgYSBtZXRob2QgcmV0dXJuaW5nIG5vdGhpbmcuXG4gKiBAcHJvcGVydHkge3N0cmluZ30gICAgICBkZXNjcmlwdGlvbiAgICAgICAgVGhlIGRlc2NycHRpb24gb2YgdGhlIG1ldGhvZCdzIHB1cnBvc2UuXG4gKiBAcHJvcGVydHkge3N0cmluZ30gICAgICBpbmNsdWRlQXJncyAgICAgICAgQSBmbGFnIHRvIGRldGVybWluZSBob3cgcHVibGljIGtleXMgKGFuZCB2YWx1ZXMpIHNob3VsZCBiZSBpbiB0aGUgQVBJLlxuICogQHByb3BlcnR5IHtzdHJpbmdbXT99ICAgaGVhZGVycyAgICAgICAgICAgIEpTRG9jIGhlYWRlciBsaW5lcyBiZWZvcmUgdGhlIHBhcmFtZXRlciBibG9jay5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nW11bXT99IHBhcmFtSGVhZGVycyAgICAgICBQYXJhbWV0ZXJzIGZyb20gdGhlIHRlbXBsYXRlIChub3QgdGhlIHVzZXIpXG4gKiBAcHJvcGVydHkge3N0cmluZ1tdW10/fSBwYXJhbUZvb3RlcnMgICAgICAgUGFyYW1ldGVycyBmcm9tIHRoZSB0ZW1wbGF0ZSAobm90IHRoZSB1c2VyKVxuICogQHByb3BlcnR5IHtzdHJpbmdbXT99ICAgZm9vdGVycyAgICAgICAgICAgIEpTRG9jIGZvb3RlciBsaW5lcyBhZnRlciB0aGUgcGFyYW1ldGVycyAoYW5kIHRoZSByZXR1cm4gdmFsdWUpLlxuICogQHByb3BlcnR5IHtzdHJpbmc/fSAgICAgcmV0dXJuVHlwZSAgICAgICAgIFRoZSByZXR1cm4gdHlwZSBmb3IgdGhlIHNwZWNpZmllZCBmdW5jdGlvbi5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nP30gICAgIHJldHVybkRlc2NyaXB0aW9uICBBIGRlc2NyaXB0aW9uIG9mIHRoZSByZXR1cm4gdmFsdWUgdG8gcHJvdmlkZS5cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbj99ICAgIGlzR2VuZXJhdG9yICAgICAgICBJZiB0cnVlLCBwcm92aWRlcyBhICd5aWVsZCcgaW5zdGVhZCBvZiBhICdyZXR1cm4nLlxuICogQHNlZSBqc2RvYy1tZXRob2Qtc2V0cy9kZWZhdWx0Lm1qcyBmb3IgdHlwaWNhbCBvYmplY3RzLlxuICovXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBNZXRob2RUZW1wbGF0ZSB7XG4gIGlzVHlwZURlZj86IGJvb2xlYW47XG4gIGlzUHJvcGVydHk/OiBib29sZWFuO1xuICByZXR1cm5Wb2lkPzogYm9vbGVhbjtcbiAgZGVzY3JpcHRpb24gPSBcIlwiO1xuICBpbmNsdWRlQXJncyA9IFwiXCI7XG4gIGhlYWRlcnM/OiBzdHJpbmdbXTtcbiAgcGFyYW1IZWFkZXJzPzogc3RyaW5nW11bXTtcbiAgcGFyYW1Gb290ZXJzPzogc3RyaW5nW11bXTtcbiAgZm9vdGVycz86IHN0cmluZ1tdO1xuICByZXR1cm5UeXBlPzogc3RyaW5nO1xuICByZXR1cm5EZXNjcmlwdGlvbj86IHN0cmluZztcbiAgaXNHZW5lcmF0b3I/OiBib29sZWFuO1xufVxuXG5leHBvcnQgdHlwZSBzdHJpbmdBbmRUZW1wbGF0ZSA9IFtzdHJpbmcsIE1ldGhvZFRlbXBsYXRlXTtcbiJdfQ==