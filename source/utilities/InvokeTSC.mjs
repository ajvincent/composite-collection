import url from "url";
import path from "path";
import fs from "fs/promises";
import { openSync } from "fs";
import { fork } from "child_process";
import { Deferred } from "./PromiseTypes.mjs";
const projectRoot = url.fileURLToPath(new URL("../..", import.meta.url));
const TSC = path.resolve(projectRoot, "node_modules/typescript/bin/tsc");
export default class InvokeTSC {
    static async withConfigurationFile(pathToConfig, pathToStdOut = "") {
        pathToConfig = path.resolve(projectRoot, pathToConfig);
        let stdout = "pipe";
        if (pathToStdOut) {
            stdout = openSync(path.resolve(projectRoot, pathToStdOut), "w");
        }
        const deferred = new Deferred();
        const child = fork(TSC, [
            "--project", pathToConfig
        ], {
            stdio: ["ignore", stdout, "pipe", "ipc"]
        });
        child.on("exit", (code) => {
            if (code) {
                console.error("Failed on " + pathToConfig);
                deferred.reject(code);
            }
            else
                deferred.resolve(code);
        });
        return await deferred.promise;
    }
    static async withCustomConfiguration(configLocation, removeConfigAfter, 
    // eslint-disable-next-line
    modifier, pathToStdOut = "") {
        const config = InvokeTSC.defaultConfiguration();
        modifier(config);
        configLocation = path.resolve(projectRoot, configLocation);
        await fs.writeFile(configLocation, JSON.stringify(config, null, 2), { "encoding": "utf-8" });
        const result = await this.withConfigurationFile(configLocation, pathToStdOut);
        if (removeConfigAfter) {
            await fs.rm(configLocation);
        }
        return result;
    }
    // eslint-disable-next-line
    static defaultConfiguration() {
        return {
            "compilerOptions": {
                "lib": ["es2021"],
                "module": "es2022",
                "target": "es2022",
                "sourceMap": true,
                "declaration": true,
            },
        };
    }
}
//# sourceMappingURL=InvokeTSC.mjs.map