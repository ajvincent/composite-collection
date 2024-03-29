declare type valueTuple = [string, string];
declare class ConfigurationStateMachine {
    #private;
    constructor(__iterable__: valueTuple[]);
    /** @type {string} */
    get currentState(): string;
    /**
     * Do a state transition, if we allow it.
     *
     * @param {string} nextState The next state.
     * @returns {boolean} True if the transition succeeded.
     */
    doStateTransition(nextState: string): boolean;
    /**
     * Intercept errors from a method, and mark this as errored out if we see one.
     *
     * @param {Function} callback The function
     * @returns {any} The return value from the callback.
     */
    catchErrorState<R>(callback: () => R): R;
    /**
     * Intercept errors from a method, and mark this as errored out if we see one.
     *
     * @param {Function} callback The function
     * @returns {any} The return value from the callback.
     * @async
     */
    catchErrorAsync<R>(callback: () => Promise<R>): Promise<R>;
    static Map(): ConfigurationStateMachine;
    static Set(): ConfigurationStateMachine;
    static MapOfSets(): ConfigurationStateMachine;
    static OneToOne(): ConfigurationStateMachine;
}
export default ConfigurationStateMachine;
