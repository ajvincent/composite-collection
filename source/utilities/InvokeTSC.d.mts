export default class InvokeTSC {
    static withConfigurationFile(pathToConfig: string, pathToStdOut?: string): Promise<number>;
    static withCustomConfiguration(configLocation: string, removeConfigAfter: boolean, modifier: (config: any) => void, pathToStdOut?: string): Promise<number>;
    static defaultConfiguration(): any;
}
