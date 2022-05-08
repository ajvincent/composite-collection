import url from "url";
import path from "path";
import fs from "fs/promises";
import { openSync } from "fs";
import { fork } from "child_process";

import { Deferred } from "./PromiseTypes.mjs";

const projectRoot = url.fileURLToPath(new URL("../..", import.meta.url));
const TSC = path.resolve(projectRoot, "node_modules/typescript/bin/tsc");

export default class InvokeTSC {
  static async withConfigurationFile(
    pathToConfig: string,
    pathToStdOut = ""
  ) : Promise<number>
  {
    pathToConfig = path.resolve(projectRoot, pathToConfig);

    let stdout: "inherit" | number = "inherit";
    if (pathToStdOut) {
      stdout = openSync(path.resolve(projectRoot, pathToStdOut), "w");
    }

    const deferred = new Deferred<number>();

    const args = [
      "--project", pathToConfig
    ]

    const child = fork(
      TSC,
      args,
      {
        stdio: ["ignore", stdout, "inherit", "ipc"]
      }
    );

    const err = new Error(`Failed on "${TSC} ${args.join(" ")}"`);
    child.on("exit", (code: number) => {
      if (code) {
        err.message += " with code " + code;
        deferred.reject(err);
      }
      else
        deferred.resolve(code);
    });
    return await deferred.promise;
  }

  static async withCustomConfiguration(
    configLocation: string,
    removeConfigAfter: boolean,
    // eslint-disable-next-line
    modifier: (config: any) => void,
    pathToStdOut = ""
  ): Promise<number> {
    const config = InvokeTSC.defaultConfiguration();
    modifier(config);

    configLocation = path.resolve(projectRoot, configLocation);
    await fs.writeFile(
      configLocation,
      JSON.stringify(config, null, 2),
      { "encoding": "utf-8" }
    );

    const result = await this.withConfigurationFile(
      configLocation, pathToStdOut
    );

    if (removeConfigAfter) {
      await fs.rm(configLocation);
    }

    return result;
  }

  // eslint-disable-next-line
  static defaultConfiguration() : any {
    return {
      "compilerOptions": {
        "lib": ["es2021"],
        "module": "es2022",
        "target": "es2022",
        "sourceMap": true,
        "declaration": true,
      },
    }
  }
}
