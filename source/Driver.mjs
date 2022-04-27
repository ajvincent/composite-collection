import CodeGenerator from "./CodeGenerator.mjs";
import CompileTimeOptions from "./CompileTimeOptions.mjs";
import { GeneratorPromiseSet, generatorToPromiseSet } from "./generatorTools/GeneratorPromiseSet.mjs";
import { Deferred, PromiseAllParallel } from "./utilities/PromiseTypes.mjs";
import fs from "fs/promises";
import path from "path";
import readDirsDeep from "./utilities/readDirsDeep.mjs";
export default class Driver {
    /** @type {string} @constant */
    #sourcesPath;
    /** @type {string} @constant */
    #targetsPath;
    /** @type {CompileTimeOptions} @constant */
    #compileTimeOptions;
    /** @type {GeneratorPromiseSet} @constant */
    #generatorPromiseSet;
    #pendingStart;
    #runPromise;
    /**
     * @param {string} configDir The configurations directory.
     * @param {string} targetDir The destination directory.
     * @param {CompileTimeOptions}      compileOptions Flags from an owner which may override configurations.
     */
    constructor(configDir, targetDir, compileOptions = {}) {
        if (typeof configDir !== "string")
            throw new Error("sourcesPath is not a string!");
        else if (typeof targetDir !== "string")
            throw new Error("targetsPath is not a string!");
        else {
            this.#sourcesPath = configDir;
            this.#targetsPath = targetDir;
            this.#compileTimeOptions = compileOptions instanceof CompileTimeOptions ? compileOptions : new CompileTimeOptions(compileOptions);
        }
        let deferred = new Deferred;
        this.#pendingStart = deferred.resolve;
        this.#runPromise = deferred.promise.then(() => this.#buildAll());
        this.#generatorPromiseSet = new GeneratorPromiseSet(this, targetDir);
    }
    /**
     * @returns {Promise<void>}
     */
    async run() {
        this.#pendingStart(null);
        return await this.#runPromise;
    }
    /**
     * Build and write the collections for the target directory, based on a source directory of configurations.
     */
    async #buildAll() {
        const fullPaths = (await readDirsDeep(this.#sourcesPath)).files.filter(filePath => path.extname(filePath) === ".mjs");
        let fileList = fullPaths.map(path => path.replace(this.#sourcesPath + "/", ""));
        const configToRelativePath = new WeakMap();
        const configs = await PromiseAllParallel(fileList, async (relativePath) => {
            try {
                const fullPath = path.join(this.#sourcesPath, relativePath);
                const m = (await import(fullPath)).default;
                configToRelativePath.set(m, relativePath);
                return m;
            }
            catch (ex) {
                // eslint-disable-next-line no-console
                console.error("\n\nException happened for " + relativePath + "\n\n");
                throw ex;
            }
        });
        await fs.mkdir(this.#targetsPath, { recursive: true });
        const targetPaths = [];
        await PromiseAllParallel(configs, async (config) => {
            const relativePath = configToRelativePath.get(config);
            try {
                const targetPath = path.normalize(path.join(this.#targetsPath, relativePath));
                const generator = new CodeGenerator(config, targetPath, this.#compileTimeOptions);
                generatorToPromiseSet.set(generator, this.#generatorPromiseSet);
                targetPaths.push(targetPath);
                await generator.run();
                return generator;
            }
            catch (ex) {
                // eslint-disable-next-line no-console
                console.error("Failed on " + relativePath);
                throw ex;
            }
        });
        targetPaths.forEach(t => this.#generatorPromiseSet.generatorsTarget.addSubtarget(t));
        await this.#generatorPromiseSet.runMain();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJpdmVyLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkRyaXZlci5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxhQUFhLE1BQU0scUJBQXFCLENBQUM7QUFDaEQsT0FBTyxrQkFBa0IsTUFBTSwwQkFBMEIsQ0FBQztBQUUxRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUV0RyxPQUFPLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFHNUUsT0FBTyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQzdCLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQztBQUN4QixPQUFPLFlBQVksTUFBTSw4QkFBOEIsQ0FBQztBQUd4RCxNQUFNLENBQUMsT0FBTyxPQUFPLE1BQU07SUFDekIsK0JBQStCO0lBQy9CLFlBQVksQ0FBUztJQUVyQiwrQkFBK0I7SUFDL0IsWUFBWSxDQUFTO0lBRXJCLDJDQUEyQztJQUMzQyxtQkFBbUIsQ0FBcUI7SUFFeEMsNENBQTRDO0lBQzVDLG9CQUFvQixDQUFzQjtJQUUxQyxhQUFhLENBQXdCO0lBRXJDLFdBQVcsQ0FBMEI7SUFFckM7Ozs7T0FJRztJQUNILFlBQ0UsU0FBaUIsRUFDakIsU0FBaUIsRUFDakIsaUJBQXlCLEVBQUU7UUFHM0IsSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRO1lBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQzthQUM3QyxJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVE7WUFDcEMsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO2FBQzdDO1lBQ0gsSUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7WUFDOUIsSUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7WUFDOUIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLGNBQWMsWUFBWSxrQkFBa0IsQ0FBQyxDQUFDLENB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LENBQUM7Z0JBRTdCLE1BQU0sU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUN0QixPQUFPLFNBQVMsQ0FBQzthQUNsQjtZQUNELE9BQU8sRUFBRSxFQUFFO2dCQUNULHNDQUFzQztnQkFDdEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDLENBQUM7Z0JBQzNDLE1BQU0sRUFBRSxDQUFDO2FBQ1Y7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckYsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDNUMsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENvZGVHZW5lcmF0b3IgZnJvbSBcIi4vQ29kZUdlbmVyYXRvci5tanNcIjtcbmltcG9ydCBDb21waWxlVGltZU9wdGlvbnMgZnJvbSBcIi4vQ29tcGlsZVRpbWVPcHRpb25zLm1qc1wiO1xuXG5pbXBvcnQgeyBHZW5lcmF0b3JQcm9taXNlU2V0LCBnZW5lcmF0b3JUb1Byb21pc2VTZXQgfSBmcm9tIFwiLi9nZW5lcmF0b3JUb29scy9HZW5lcmF0b3JQcm9taXNlU2V0Lm1qc1wiO1xuXG5pbXBvcnQgeyBEZWZlcnJlZCwgUHJvbWlzZUFsbFBhcmFsbGVsIH0gZnJvbSBcIi4vdXRpbGl0aWVzL1Byb21pc2VUeXBlcy5tanNcIjtcbmltcG9ydCB0eXBlIHsgUHJvbWlzZVJlc29sdmVyIH0gZnJvbSBcIi4vdXRpbGl0aWVzL1Byb21pc2VUeXBlcy5tanNcIjtcblxuaW1wb3J0IGZzIGZyb20gXCJmcy9wcm9taXNlc1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCByZWFkRGlyc0RlZXAgZnJvbSBcIi4vdXRpbGl0aWVzL3JlYWREaXJzRGVlcC5tanNcIjtcbmltcG9ydCBDb2xsZWN0aW9uQ29uZmlndXJhdGlvbiBmcm9tIFwiLi9Db2xsZWN0aW9uQ29uZmlndXJhdGlvbi5tanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRHJpdmVyIHtcbiAgLyoqIEB0eXBlIHtzdHJpbmd9IEBjb25zdGFudCAqL1xuICAjc291cmNlc1BhdGg6IHN0cmluZztcblxuICAvKiogQHR5cGUge3N0cmluZ30gQGNvbnN0YW50ICovXG4gICN0YXJnZXRzUGF0aDogc3RyaW5nO1xuXG4gIC8qKiBAdHlwZSB7Q29tcGlsZVRpbWVPcHRpb25zfSBAY29uc3RhbnQgKi9cbiAgI2NvbXBpbGVUaW1lT3B0aW9uczogQ29tcGlsZVRpbWVPcHRpb25zO1xuXG4gIC8qKiBAdHlwZSB7R2VuZXJhdG9yUHJvbWlzZVNldH0gQGNvbnN0YW50ICovXG4gICNnZW5lcmF0b3JQcm9taXNlU2V0OiBHZW5lcmF0b3JQcm9taXNlU2V0O1xuXG4gICNwZW5kaW5nU3RhcnQ6IFByb21pc2VSZXNvbHZlcjxudWxsPjtcblxuICAjcnVuUHJvbWlzZTogUmVhZG9ubHk8UHJvbWlzZTx2b2lkPj47XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjb25maWdEaXIgVGhlIGNvbmZpZ3VyYXRpb25zIGRpcmVjdG9yeS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldERpciBUaGUgZGVzdGluYXRpb24gZGlyZWN0b3J5LlxuICAgKiBAcGFyYW0ge0NvbXBpbGVUaW1lT3B0aW9uc30gICAgICBjb21waWxlT3B0aW9ucyBGbGFncyBmcm9tIGFuIG93bmVyIHdoaWNoIG1heSBvdmVycmlkZSBjb25maWd1cmF0aW9ucy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIGNvbmZpZ0Rpcjogc3RyaW5nLFxuICAgIHRhcmdldERpcjogc3RyaW5nLFxuICAgIGNvbXBpbGVPcHRpb25zOiBvYmplY3QgPSB7fVxuICApXG4gIHtcbiAgICBpZiAodHlwZW9mIGNvbmZpZ0RpciAhPT0gXCJzdHJpbmdcIilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInNvdXJjZXNQYXRoIGlzIG5vdCBhIHN0cmluZyFcIik7XG4gICAgZWxzZSBpZiAodHlwZW9mIHRhcmdldERpciAhPT0gXCJzdHJpbmdcIilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInRhcmdldHNQYXRoIGlzIG5vdCBhIHN0cmluZyFcIik7XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLiNzb3VyY2VzUGF0aCA9IGNvbmZpZ0RpcjtcbiAgICAgIHRoaXMuI3RhcmdldHNQYXRoID0gdGFyZ2V0RGlyO1xuICAgICAgdGhpcy4jY29tcGlsZVRpbWVPcHRpb25zID0gY29tcGlsZU9wdGlvbnMgaW5zdGFuY2VvZiBDb21waWxlVGltZU9wdGlvbnMgPyBjb21waWxlT3B0aW9ucyA6IG5ldyBDb21waWxlVGltZU9wdGlvbnMoY29tcGlsZU9wdGlvbnMpO1xuICAgIH1cblxuICAgIGxldCBkZWZlcnJlZCA9IG5ldyBEZWZlcnJlZDtcbiAgICB0aGlzLiNwZW5kaW5nU3RhcnQgPSBkZWZlcnJlZC5yZXNvbHZlO1xuICAgIHRoaXMuI3J1blByb21pc2UgPSBkZWZlcnJlZC5wcm9taXNlLnRoZW4oKCkgPT4gdGhpcy4jYnVpbGRBbGwoKSk7XG5cbiAgICB0aGlzLiNnZW5lcmF0b3JQcm9taXNlU2V0ID0gbmV3IEdlbmVyYXRvclByb21pc2VTZXQodGhpcywgdGFyZ2V0RGlyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cbiAgICovXG4gIGFzeW5jIHJ1bigpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy4jcGVuZGluZ1N0YXJ0KG51bGwpO1xuICAgIHJldHVybiBhd2FpdCB0aGlzLiNydW5Qcm9taXNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkIGFuZCB3cml0ZSB0aGUgY29sbGVjdGlvbnMgZm9yIHRoZSB0YXJnZXQgZGlyZWN0b3J5LCBiYXNlZCBvbiBhIHNvdXJjZSBkaXJlY3Rvcnkgb2YgY29uZmlndXJhdGlvbnMuXG4gICAqL1xuICBhc3luYyAjYnVpbGRBbGwoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZnVsbFBhdGhzOiBzdHJpbmdbXSA9IChhd2FpdCByZWFkRGlyc0RlZXAodGhpcy4jc291cmNlc1BhdGgpKS5maWxlcy5maWx0ZXIoXG4gICAgICBmaWxlUGF0aCA9PiBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpID09PSBcIi5tanNcIlxuICAgICk7XG4gICAgbGV0IGZpbGVMaXN0ID0gZnVsbFBhdGhzLm1hcChwYXRoID0+IHBhdGgucmVwbGFjZSh0aGlzLiNzb3VyY2VzUGF0aCArIFwiL1wiLCBcIlwiKSk7XG4gICAgY29uc3QgY29uZmlnVG9SZWxhdGl2ZVBhdGg6IFdlYWtNYXA8Q29sbGVjdGlvbkNvbmZpZ3VyYXRpb24sIHN0cmluZz4gPSBuZXcgV2Vha01hcCgpO1xuXG4gICAgY29uc3QgY29uZmlnczogQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb25bXSA9IGF3YWl0IFByb21pc2VBbGxQYXJhbGxlbChmaWxlTGlzdCwgYXN5bmMgcmVsYXRpdmVQYXRoID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoOiBzdHJpbmcgPSBwYXRoLmpvaW4odGhpcy4jc291cmNlc1BhdGgsIHJlbGF0aXZlUGF0aCk7XG4gICAgICAgIGNvbnN0IG06IENvbGxlY3Rpb25Db25maWd1cmF0aW9uID0gKGF3YWl0IGltcG9ydChmdWxsUGF0aCkpLmRlZmF1bHQ7XG4gICAgICAgIGNvbmZpZ1RvUmVsYXRpdmVQYXRoLnNldChtLCByZWxhdGl2ZVBhdGgpO1xuICAgICAgICByZXR1cm4gbTtcbiAgICAgIH1cbiAgICAgIGNhdGNoIChleCkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBjb25zb2xlLmVycm9yKFwiXFxuXFxuRXhjZXB0aW9uIGhhcHBlbmVkIGZvciBcIiArIHJlbGF0aXZlUGF0aCArIFwiXFxuXFxuXCIpO1xuICAgICAgICB0aHJvdyBleDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGF3YWl0IGZzLm1rZGlyKHRoaXMuI3RhcmdldHNQYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICBjb25zdCB0YXJnZXRQYXRoczogc3RyaW5nW10gPSBbXTtcblxuICAgIGF3YWl0IFByb21pc2VBbGxQYXJhbGxlbChjb25maWdzLCBhc3luYyBjb25maWcgPT4ge1xuICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gY29uZmlnVG9SZWxhdGl2ZVBhdGguZ2V0KGNvbmZpZykgYXMgc3RyaW5nO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0UGF0aCA9IHBhdGgubm9ybWFsaXplKHBhdGguam9pbihcbiAgICAgICAgICB0aGlzLiN0YXJnZXRzUGF0aCwgcmVsYXRpdmVQYXRoXG4gICAgICAgICkpO1xuICAgICAgICBjb25zdCBnZW5lcmF0b3IgPSBuZXcgQ29kZUdlbmVyYXRvcihcbiAgICAgICAgICBjb25maWcsIHRhcmdldFBhdGgsIHRoaXMuI2NvbXBpbGVUaW1lT3B0aW9uc1xuICAgICAgICApO1xuXG4gICAgICAgIGdlbmVyYXRvclRvUHJvbWlzZVNldC5zZXQoZ2VuZXJhdG9yLCB0aGlzLiNnZW5lcmF0b3JQcm9taXNlU2V0KTtcbiAgICAgICAgdGFyZ2V0UGF0aHMucHVzaCh0YXJnZXRQYXRoKTtcblxuICAgICAgICBhd2FpdCBnZW5lcmF0b3IucnVuKCk7XG4gICAgICAgIHJldHVybiBnZW5lcmF0b3I7XG4gICAgICB9XG4gICAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCBvbiBcIiArIHJlbGF0aXZlUGF0aCk7XG4gICAgICAgIHRocm93IGV4O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGFyZ2V0UGF0aHMuZm9yRWFjaCh0ID0+IHRoaXMuI2dlbmVyYXRvclByb21pc2VTZXQuZ2VuZXJhdG9yc1RhcmdldC5hZGRTdWJ0YXJnZXQodCkpO1xuICAgIGF3YWl0IHRoaXMuI2dlbmVyYXRvclByb21pc2VTZXQucnVuTWFpbigpO1xuICB9XG59XG4iXX0=