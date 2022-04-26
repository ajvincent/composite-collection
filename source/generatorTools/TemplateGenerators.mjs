import { PromiseAllParallel } from "../utilities/PromiseTypes.mjs";
/**
 * @type {Map<string, Function>}
 * @package
 */
const TemplateGenerators = new Map();
import readDirsDeep from "../utilities/readDirsDeep.mjs";
const templateDirURL = new URL("../../templates", import.meta.url);
const templateDir = templateDirURL.pathname;
const allFiles = (await readDirsDeep(templateDir)).files;
await PromiseAllParallel(allFiles, async (fullPath) => {
    let baseName = fullPath.substring(templateDir.length + 1);
    if (!baseName.endsWith(".in.mjs"))
        return;
    const generator = (await import(fullPath)).default;
    if (typeof generator === "function")
        TemplateGenerators.set(baseName.replace(/\.in\.mjs$/, ""), generator);
    else
        throw new Error("generator isn't a function?");
});
export default TemplateGenerators;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVtcGxhdGVHZW5lcmF0b3JzLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlRlbXBsYXRlR2VuZXJhdG9ycy5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFNbkU7OztHQUdHO0FBQ0gsTUFBTSxrQkFBa0IsR0FBa0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUVwRSxPQUFPLFlBQVksTUFBTSwrQkFBK0IsQ0FBQztBQUV6RCxNQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25FLE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUM7QUFFNUMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxNQUFNLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUV6RCxNQUFNLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBZ0IsRUFBRSxFQUFFO0lBQzVELElBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMxRCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7UUFDL0IsT0FBTztJQUVULE1BQU0sU0FBUyxHQUFHLENBQUMsTUFBTSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7SUFDbkQsSUFBSSxPQUFPLFNBQVMsS0FBSyxVQUFVO1FBQ2pDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQzs7UUFFdEUsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0FBQ25ELENBQUMsQ0FBQyxDQUFDO0FBRUgsZUFBZSxrQkFBa0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByb21pc2VBbGxQYXJhbGxlbCB9IGZyb20gXCIuLi91dGlsaXRpZXMvUHJvbWlzZVR5cGVzLm1qc1wiO1xuXG5pbXBvcnQgSlNEb2NHZW5lcmF0b3IgZnJvbSBcIi4vSlNEb2NHZW5lcmF0b3IubWpzXCI7XG5pbXBvcnQgdHlwZSB7IFByZXByb2Nlc3NvckRlZmluZXMgfSBmcm9tIFwiLi4vQ29kZUdlbmVyYXRvci5tanNcIjtcbmV4cG9ydCB0eXBlIFRlbXBsYXRlRnVuY3Rpb24gPSAoZGVmaW5lczogUHJlcHJvY2Vzc29yRGVmaW5lcywgLi4uZG9jR2VuZXJhdG9yczogSlNEb2NHZW5lcmF0b3JbXSkgPT4gc3RyaW5nO1xuXG4vKipcbiAqIEB0eXBlIHtNYXA8c3RyaW5nLCBGdW5jdGlvbj59XG4gKiBAcGFja2FnZVxuICovXG5jb25zdCBUZW1wbGF0ZUdlbmVyYXRvcnM6IE1hcDxzdHJpbmcsIFRlbXBsYXRlRnVuY3Rpb24+ID0gbmV3IE1hcCgpO1xuXG5pbXBvcnQgcmVhZERpcnNEZWVwIGZyb20gXCIuLi91dGlsaXRpZXMvcmVhZERpcnNEZWVwLm1qc1wiO1xuXG5jb25zdCB0ZW1wbGF0ZURpclVSTCA9IG5ldyBVUkwoXCIuLi8uLi90ZW1wbGF0ZXNcIiwgaW1wb3J0Lm1ldGEudXJsKTtcbmNvbnN0IHRlbXBsYXRlRGlyID0gdGVtcGxhdGVEaXJVUkwucGF0aG5hbWU7XG5cbmNvbnN0IGFsbEZpbGVzID0gKGF3YWl0IHJlYWREaXJzRGVlcCh0ZW1wbGF0ZURpcikpLmZpbGVzO1xuXG5hd2FpdCBQcm9taXNlQWxsUGFyYWxsZWwoYWxsRmlsZXMsIGFzeW5jIChmdWxsUGF0aDogc3RyaW5nKSA9PiB7XG4gIGxldCBiYXNlTmFtZSA9IGZ1bGxQYXRoLnN1YnN0cmluZyh0ZW1wbGF0ZURpci5sZW5ndGggKyAxKTtcbiAgaWYgKCFiYXNlTmFtZS5lbmRzV2l0aChcIi5pbi5tanNcIikpXG4gICAgcmV0dXJuO1xuXG4gIGNvbnN0IGdlbmVyYXRvciA9IChhd2FpdCBpbXBvcnQoZnVsbFBhdGgpKS5kZWZhdWx0O1xuICBpZiAodHlwZW9mIGdlbmVyYXRvciA9PT0gXCJmdW5jdGlvblwiKVxuICAgIFRlbXBsYXRlR2VuZXJhdG9ycy5zZXQoYmFzZU5hbWUucmVwbGFjZSgvXFwuaW5cXC5tanMkLywgXCJcIiksIGdlbmVyYXRvcik7XG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJnZW5lcmF0b3IgaXNuJ3QgYSBmdW5jdGlvbj9cIik7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgVGVtcGxhdGVHZW5lcmF0b3JzO1xuIl19