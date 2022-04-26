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
            try {
                const targetPath = path.normalize(path.join(this.#targetsPath, configToRelativePath.get(config)));
                const generator = new CodeGenerator(config, targetPath, this.#compileTimeOptions);
                generatorToPromiseSet.set(generator, this.#generatorPromiseSet);
                targetPaths.push(targetPath);
                await generator.run();
                return generator;
            }
            catch (ex) {
                // eslint-disable-next-line no-console
                console.error("Failed on " + configToRelativePath.get(config));
                throw ex;
            }
        });
        targetPaths.forEach(t => this.#generatorPromiseSet.generatorsTarget.addSubtarget(t));
        await this.#generatorPromiseSet.runMain();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJpdmVyLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkRyaXZlci5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxhQUFhLE1BQU0scUJBQXFCLENBQUM7QUFDaEQsT0FBTyxrQkFBa0IsTUFBTSwwQkFBMEIsQ0FBQztBQUUxRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUV0RyxPQUFPLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFHNUUsT0FBTyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQzdCLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQztBQUN4QixPQUFPLFlBQVksTUFBTSw4QkFBOEIsQ0FBQztBQUd4RCxNQUFNLENBQUMsT0FBTyxPQUFPLE1BQU07SUFDekIsK0JBQStCO0lBQy9CLFlBQVksQ0FBUztJQUVyQiwrQkFBK0I7SUFDL0IsWUFBWSxDQUFTO0lBRXJCLDJDQUEyQztJQUMzQyxtQkFBbUIsQ0FBcUI7SUFFeEMsNENBQTRDO0lBQzVDLG9CQUFvQixDQUFzQjtJQUUxQyxhQUFhLENBQXdCO0lBRXJDLFdBQVcsQ0FBMEI7SUFFckM7Ozs7T0FJRztJQUNILFlBQ0UsU0FBaUIsRUFDakIsU0FBaUIsRUFDakIsaUJBQXlCLEVBQUU7UUFHM0IsSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRO1lBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQzthQUM3QyxJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVE7WUFDcEMsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO2FBQzdDO1lBQ0gsSUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7WUFDOUIsSUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7WUFDOUIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLGNBQWMsWUFBWSxrQkFBa0IsQ0FBQyxDQUFDLENB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RyxFQUFFLENBQUM7Z0JBQ3RCLE9BQU8sU0FBUyxDQUFDO2FBQ2xCO1lBQ0QsT0FBTyxFQUFFLEVBQUU7Z0JBQ1Qsc0NBQXNDO2dCQUN0QyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDL0QsTUFBTSxFQUFFLENBQUM7YUFDVjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRixNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM1QyxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ29kZUdlbmVyYXRvciBmcm9tIFwiLi9Db2RlR2VuZXJhdG9yLm1qc1wiO1xuaW1wb3J0IENvbXBpbGVUaW1lT3B0aW9ucyBmcm9tIFwiLi9Db21waWxlVGltZU9wdGlvbnMubWpzXCI7XG5cbmltcG9ydCB7IEdlbmVyYXRvclByb21pc2VTZXQsIGdlbmVyYXRvclRvUHJvbWlzZVNldCB9IGZyb20gXCIuL2dlbmVyYXRvclRvb2xzL0dlbmVyYXRvclByb21pc2VTZXQubWpzXCI7XG5cbmltcG9ydCB7IERlZmVycmVkLCBQcm9taXNlQWxsUGFyYWxsZWwgfSBmcm9tIFwiLi91dGlsaXRpZXMvUHJvbWlzZVR5cGVzLm1qc1wiO1xuaW1wb3J0IHR5cGUgeyBQcm9taXNlUmVzb2x2ZXIgfSBmcm9tIFwiLi91dGlsaXRpZXMvUHJvbWlzZVR5cGVzLm1qc1wiO1xuXG5pbXBvcnQgZnMgZnJvbSBcImZzL3Byb21pc2VzXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHJlYWREaXJzRGVlcCBmcm9tIFwiLi91dGlsaXRpZXMvcmVhZERpcnNEZWVwLm1qc1wiO1xuaW1wb3J0IENvbGxlY3Rpb25Db25maWd1cmF0aW9uIGZyb20gXCIuL0NvbGxlY3Rpb25Db25maWd1cmF0aW9uLm1qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEcml2ZXIge1xuICAvKiogQHR5cGUge3N0cmluZ30gQGNvbnN0YW50ICovXG4gICNzb3VyY2VzUGF0aDogc3RyaW5nO1xuXG4gIC8qKiBAdHlwZSB7c3RyaW5nfSBAY29uc3RhbnQgKi9cbiAgI3RhcmdldHNQYXRoOiBzdHJpbmc7XG5cbiAgLyoqIEB0eXBlIHtDb21waWxlVGltZU9wdGlvbnN9IEBjb25zdGFudCAqL1xuICAjY29tcGlsZVRpbWVPcHRpb25zOiBDb21waWxlVGltZU9wdGlvbnM7XG5cbiAgLyoqIEB0eXBlIHtHZW5lcmF0b3JQcm9taXNlU2V0fSBAY29uc3RhbnQgKi9cbiAgI2dlbmVyYXRvclByb21pc2VTZXQ6IEdlbmVyYXRvclByb21pc2VTZXQ7XG5cbiAgI3BlbmRpbmdTdGFydDogUHJvbWlzZVJlc29sdmVyPG51bGw+O1xuXG4gICNydW5Qcm9taXNlOiBSZWFkb25seTxQcm9taXNlPHZvaWQ+PjtcblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGNvbmZpZ0RpciBUaGUgY29uZmlndXJhdGlvbnMgZGlyZWN0b3J5LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0RGlyIFRoZSBkZXN0aW5hdGlvbiBkaXJlY3RvcnkuXG4gICAqIEBwYXJhbSB7Q29tcGlsZVRpbWVPcHRpb25zfSAgICAgIGNvbXBpbGVPcHRpb25zIEZsYWdzIGZyb20gYW4gb3duZXIgd2hpY2ggbWF5IG92ZXJyaWRlIGNvbmZpZ3VyYXRpb25zLlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgY29uZmlnRGlyOiBzdHJpbmcsXG4gICAgdGFyZ2V0RGlyOiBzdHJpbmcsXG4gICAgY29tcGlsZU9wdGlvbnM6IG9iamVjdCA9IHt9XG4gIClcbiAge1xuICAgIGlmICh0eXBlb2YgY29uZmlnRGlyICE9PSBcInN0cmluZ1wiKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwic291cmNlc1BhdGggaXMgbm90IGEgc3RyaW5nIVwiKTtcbiAgICBlbHNlIGlmICh0eXBlb2YgdGFyZ2V0RGlyICE9PSBcInN0cmluZ1wiKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwidGFyZ2V0c1BhdGggaXMgbm90IGEgc3RyaW5nIVwiKTtcbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuI3NvdXJjZXNQYXRoID0gY29uZmlnRGlyO1xuICAgICAgdGhpcy4jdGFyZ2V0c1BhdGggPSB0YXJnZXREaXI7XG4gICAgICB0aGlzLiNjb21waWxlVGltZU9wdGlvbnMgPSBjb21waWxlT3B0aW9ucyBpbnN0YW5jZW9mIENvbXBpbGVUaW1lT3B0aW9ucyA/IGNvbXBpbGVPcHRpb25zIDogbmV3IENvbXBpbGVUaW1lT3B0aW9ucyhjb21waWxlT3B0aW9ucyk7XG4gICAgfVxuXG4gICAgbGV0IGRlZmVycmVkID0gbmV3IERlZmVycmVkO1xuICAgIHRoaXMuI3BlbmRpbmdTdGFydCA9IGRlZmVycmVkLnJlc29sdmU7XG4gICAgdGhpcy4jcnVuUHJvbWlzZSA9IGRlZmVycmVkLnByb21pc2UudGhlbigoKSA9PiB0aGlzLiNidWlsZEFsbCgpKTtcblxuICAgIHRoaXMuI2dlbmVyYXRvclByb21pc2VTZXQgPSBuZXcgR2VuZXJhdG9yUHJvbWlzZVNldCh0aGlzLCB0YXJnZXREaXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxuICAgKi9cbiAgYXN5bmMgcnVuKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLiNwZW5kaW5nU3RhcnQobnVsbCk7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuI3J1blByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgYW5kIHdyaXRlIHRoZSBjb2xsZWN0aW9ucyBmb3IgdGhlIHRhcmdldCBkaXJlY3RvcnksIGJhc2VkIG9uIGEgc291cmNlIGRpcmVjdG9yeSBvZiBjb25maWd1cmF0aW9ucy5cbiAgICovXG4gIGFzeW5jICNidWlsZEFsbCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBmdWxsUGF0aHM6IHN0cmluZ1tdID0gKGF3YWl0IHJlYWREaXJzRGVlcCh0aGlzLiNzb3VyY2VzUGF0aCkpLmZpbGVzLmZpbHRlcihcbiAgICAgIGZpbGVQYXRoID0+IHBhdGguZXh0bmFtZShmaWxlUGF0aCkgPT09IFwiLm1qc1wiXG4gICAgKTtcbiAgICBsZXQgZmlsZUxpc3QgPSBmdWxsUGF0aHMubWFwKHBhdGggPT4gcGF0aC5yZXBsYWNlKHRoaXMuI3NvdXJjZXNQYXRoICsgXCIvXCIsIFwiXCIpKTtcbiAgICBjb25zdCBjb25maWdUb1JlbGF0aXZlUGF0aDogV2Vha01hcDxDb2xsZWN0aW9uQ29uZmlndXJhdGlvbiwgc3RyaW5nPiA9IG5ldyBXZWFrTWFwKCk7XG5cbiAgICBjb25zdCBjb25maWdzOiBDb2xsZWN0aW9uQ29uZmlndXJhdGlvbltdID0gYXdhaXQgUHJvbWlzZUFsbFBhcmFsbGVsKGZpbGVMaXN0LCBhc3luYyByZWxhdGl2ZVBhdGggPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZnVsbFBhdGg6IHN0cmluZyA9IHBhdGguam9pbih0aGlzLiNzb3VyY2VzUGF0aCwgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgY29uc3QgbTogQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24gPSAoYXdhaXQgaW1wb3J0KGZ1bGxQYXRoKSkuZGVmYXVsdDtcbiAgICAgICAgY29uZmlnVG9SZWxhdGl2ZVBhdGguc2V0KG0sIHJlbGF0aXZlUGF0aCk7XG4gICAgICAgIHJldHVybiBtO1xuICAgICAgfVxuICAgICAgY2F0Y2ggKGV4KSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJcXG5cXG5FeGNlcHRpb24gaGFwcGVuZWQgZm9yIFwiICsgcmVsYXRpdmVQYXRoICsgXCJcXG5cXG5cIik7XG4gICAgICAgIHRocm93IGV4O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgYXdhaXQgZnMubWtkaXIodGhpcy4jdGFyZ2V0c1BhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgIGNvbnN0IHRhcmdldFBhdGhzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgYXdhaXQgUHJvbWlzZUFsbFBhcmFsbGVsKGNvbmZpZ3MsIGFzeW5jIGNvbmZpZyA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB0YXJnZXRQYXRoID0gcGF0aC5ub3JtYWxpemUocGF0aC5qb2luKFxuICAgICAgICAgIHRoaXMuI3RhcmdldHNQYXRoLCBjb25maWdUb1JlbGF0aXZlUGF0aC5nZXQoY29uZmlnKSFcbiAgICAgICAgKSk7XG4gICAgICAgIGNvbnN0IGdlbmVyYXRvciA9IG5ldyBDb2RlR2VuZXJhdG9yKFxuICAgICAgICAgIGNvbmZpZywgdGFyZ2V0UGF0aCwgdGhpcy4jY29tcGlsZVRpbWVPcHRpb25zXG4gICAgICAgICk7XG5cbiAgICAgICAgZ2VuZXJhdG9yVG9Qcm9taXNlU2V0LnNldChnZW5lcmF0b3IsIHRoaXMuI2dlbmVyYXRvclByb21pc2VTZXQpO1xuICAgICAgICB0YXJnZXRQYXRocy5wdXNoKHRhcmdldFBhdGgpO1xuXG4gICAgICAgIGF3YWl0IGdlbmVyYXRvci5ydW4oKTtcbiAgICAgICAgcmV0dXJuIGdlbmVyYXRvcjtcbiAgICAgIH1cbiAgICAgIGNhdGNoIChleCkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIG9uIFwiICsgY29uZmlnVG9SZWxhdGl2ZVBhdGguZ2V0KGNvbmZpZykpO1xuICAgICAgICB0aHJvdyBleDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRhcmdldFBhdGhzLmZvckVhY2godCA9PiB0aGlzLiNnZW5lcmF0b3JQcm9taXNlU2V0LmdlbmVyYXRvcnNUYXJnZXQuYWRkU3VidGFyZ2V0KHQpKTtcbiAgICBhd2FpdCB0aGlzLiNnZW5lcmF0b3JQcm9taXNlU2V0LnJ1bk1haW4oKTtcbiAgfVxufVxuIl19