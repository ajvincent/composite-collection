//import StringStateMachine from "../collections/StringStateMachine.mjs";
import LocalStringStateMachine from "./LocalStringStateMachine.mjs";
class ConfigurationStateMachine {
    /** @type {LocalStringStateMachine} @constant @readonly */
    #stringStates;
    /** @type {string} */
    #currentState = "start";
    constructor(__iterable__) {
        this.#stringStates = new LocalStringStateMachine(__iterable__);
        Object.freeze(this);
    }
    /** @type {string} */
    get currentState() {
        return this.#currentState;
    }
    /**
     * Do a state transition, if we allow it.
     *
     * @param {string} nextState The next state.
     * @returns {boolean} True if the transition succeeded.
     */
    doStateTransition(nextState) {
        const mayTransition = this.#stringStates.has(this.#currentState, nextState);
        if (mayTransition)
            this.#currentState = nextState;
        return mayTransition;
    }
    /**
     * Intercept errors from a method, and mark this as errored out if we see one.
     *
     * @param {Function} callback The function
     * @returns {any} The return value from the callback.
     */
    catchErrorState(callback) {
        if (this.#currentState === "errored")
            throw new Error("This configuration is dead due to a previous error!");
        try {
            return callback();
        }
        catch (ex) {
            this.#currentState = "errored";
            throw ex;
        }
    }
    /**
     * Intercept errors from a method, and mark this as errored out if we see one.
     *
     * @param {Function} callback The function
     * @returns {any} The return value from the callback.
     * @async
     */
    async catchErrorAsync(callback) {
        if (this.#currentState === "errored")
            throw new Error("This configuration is dead due to a previous error!");
        try {
            return await callback();
        }
        catch (ex) {
            this.#currentState = "errored";
            throw ex;
        }
    }
    static Map() {
        return new ConfigurationStateMachine([
            ["start", "startMap"],
            ["startMap", "fileOverview"],
            ["startMap", "importLines"],
            ["startMap", "mapKeys"],
            ["fileOverview", "importLines"],
            ["fileOverview", "mapKeys"],
            ["importLines", "mapKeys"],
            ["importLines", "hasValueFilter"],
            ["mapKeys", "mapKeys"],
            ["mapKeys", "keyLink"],
            ["mapKeys", "hasValueFilter"],
            ["mapKeys", "locked"],
            ["keyLink", "keyLink"],
            ["keyLink", "hasValueFilter"],
            ["keyLink", "locked"],
            ["hasValueFilter", "locked"],
            ["locked", "locked"],
        ]);
    }
    static Set() {
        return new ConfigurationStateMachine([
            ["start", "startSet"],
            ["startSet", "fileOverview"],
            ["startSet", "importLines"],
            ["startSet", "setElements"],
            ["fileOverview", "importLines"],
            ["fileOverview", "setElements"],
            ["importLines", "setElements"],
            ["setElements", "setElements"],
            ["setElements", "keyLink"],
            ["setElements", "locked"],
            ["keyLink", "keyLink"],
            ["keyLink", "locked"],
            ["locked", "locked"],
        ]);
    }
    static MapOfSets() {
        return new ConfigurationStateMachine([
            ["start", "startMapOfSets"],
            ["startMapOfSets", "fileOverview"],
            ["startMapOfSets", "importLines"],
            ["startMapOfSets", "mapKeys"],
            ["fileOverview", "importLines"],
            ["fileOverview", "mapKeys"],
            ["importLines", "mapKeys"],
            ["mapKeys", "mapKeys"],
            ["mapKeys", "setElements"],
            ["setElements", "setElements"],
            ["setElements", "keyLink"],
            ["setElements", "locked"],
            ["keyLink", "keyLink"],
            ["keyLink", "locked"],
            ["locked", "locked"],
        ]);
    }
    static OneToOne() {
        return new ConfigurationStateMachine([
            ["start", "startOneToOne"],
            ["startOneToOne", "fileOverview"],
            ["startOneToOne", "configureOneToOne"],
            ["fileOverview", "configureOneToOne"],
            ["configureOneToOne", "locked"],
            ["locked", "locked"],
        ]);
    }
}
Object.freeze(ConfigurationStateMachine.prototype);
Object.freeze(ConfigurationStateMachine);
export default ConfigurationStateMachine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uZmlndXJhdGlvblN0YXRlTWFjaGluZS5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJDb25maWd1cmF0aW9uU3RhdGVNYWNoaW5lLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx5RUFBeUU7QUFDekUsT0FBTyx1QkFBdUIsTUFBTSwrQkFBK0IsQ0FBQztBQUdwRSxNQUFNLHlCQUF5QjtJQUM3QiwwREFBMEQ7SUFDMUQsYUFBYSxDQUEwQjtJQUV2QyxxQkFBcUI7SUFDckIsYUFBYSxHQUFHLE9BQU8sQ0FBQztJQUV4QixZQUFZLFlBQTBCO1FBQ3BDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSx1QkFBdUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMvRCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFFRCxxQkFBcUI7SUFDckIsSUFBSSxZQUFZO1FBQ2QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzVCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGlCQUFpQixDQUFDLFNBQWlCO1FBQ2pDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDNUUsSUFBSSxhQUFhO1lBQ2YsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7UUFDakMsT0FBTyxhQUFhLENBQUM7SUFDdkIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsZUFBZSxDQUFDLFFBQW1CO1FBQ2pDLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxTQUFTO1lBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMscURBQXFELENBQUMsQ0FBQztRQUV6RSxJQUFJO1lBQ0YsT0FBTyxRQUFRLEVBQUUsQ0FBQztTQUNuQjtRQUNELE9BQU8sRUFBRSxFQUFFO1lBQ1QsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7WUFDL0IsTUFBTSxFQUFFLENB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QUMsU0FBUyxFQUFFLFNBQVMsQ0FBQztZQUN0QixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUM7WUFFckIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDO1NBQ3JCLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFRCxNQUFNLENBQUMsUUFBUTtRQUNiLE9BQU8sSUFBSSx5QkFBeUIsQ0FBQztZQUNuQyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUM7WUFFMUIsQ0FBQyxlQUFlLEVBQUUsY0FBYyxDQUFDO1lBQ2pDLENBQUMsZUFBZSxFQUFFLG1CQUFtQixDQUFDO1lBRXRDLENBQUMsY0FBYyxFQUFFLG1CQUFtQixDQUFDO1lBRXJDLENBQUMsbUJBQW1CLEVBQUUsUUFBUSxDQUFDO1lBRS9CLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQztTQUNyQixDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0Y7QUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ25ELE1BQU0sQ0FBQyxNQUFNLENBQUMseUJBQXlCLENBQUMsQ0FBQTtBQUV4QyxlQUFlLHlCQUF5QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy9pbXBvcnQgU3RyaW5nU3RhdGVNYWNoaW5lIGZyb20gXCIuLi9jb2xsZWN0aW9ucy9TdHJpbmdTdGF0ZU1hY2hpbmUubWpzXCI7XG5pbXBvcnQgTG9jYWxTdHJpbmdTdGF0ZU1hY2hpbmUgZnJvbSBcIi4vTG9jYWxTdHJpbmdTdGF0ZU1hY2hpbmUubWpzXCI7XG5pbXBvcnQgdHlwZSB7IHZhbHVlVHVwbGUgfSBmcm9tIFwiLi9Mb2NhbFN0cmluZ1N0YXRlTWFjaGluZS5tanNcIjtcblxuY2xhc3MgQ29uZmlndXJhdGlvblN0YXRlTWFjaGluZSB7XG4gIC8qKiBAdHlwZSB7TG9jYWxTdHJpbmdTdGF0ZU1hY2hpbmV9IEBjb25zdGFudCBAcmVhZG9ubHkgKi9cbiAgI3N0cmluZ1N0YXRlczogTG9jYWxTdHJpbmdTdGF0ZU1hY2hpbmU7XG5cbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICNjdXJyZW50U3RhdGUgPSBcInN0YXJ0XCI7XG5cbiAgY29uc3RydWN0b3IoX19pdGVyYWJsZV9fOiB2YWx1ZVR1cGxlW10pIHtcbiAgICB0aGlzLiNzdHJpbmdTdGF0ZXMgPSBuZXcgTG9jYWxTdHJpbmdTdGF0ZU1hY2hpbmUoX19pdGVyYWJsZV9fKTtcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICB9XG5cbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gIGdldCBjdXJyZW50U3RhdGUoKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuI2N1cnJlbnRTdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEbyBhIHN0YXRlIHRyYW5zaXRpb24sIGlmIHdlIGFsbG93IGl0LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmV4dFN0YXRlIFRoZSBuZXh0IHN0YXRlLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdHJhbnNpdGlvbiBzdWNjZWVkZWQuXG4gICAqL1xuICBkb1N0YXRlVHJhbnNpdGlvbihuZXh0U3RhdGU6IHN0cmluZykgOiBib29sZWFuIHtcbiAgICBjb25zdCBtYXlUcmFuc2l0aW9uID0gdGhpcy4jc3RyaW5nU3RhdGVzLmhhcyh0aGlzLiNjdXJyZW50U3RhdGUsIG5leHRTdGF0ZSk7XG4gICAgaWYgKG1heVRyYW5zaXRpb24pXG4gICAgICB0aGlzLiNjdXJyZW50U3RhdGUgPSBuZXh0U3RhdGU7XG4gICAgcmV0dXJuIG1heVRyYW5zaXRpb247XG4gIH1cblxuICAvKipcbiAgICogSW50ZXJjZXB0IGVycm9ycyBmcm9tIGEgbWV0aG9kLCBhbmQgbWFyayB0aGlzIGFzIGVycm9yZWQgb3V0IGlmIHdlIHNlZSBvbmUuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvblxuICAgKiBAcmV0dXJucyB7YW55fSBUaGUgcmV0dXJuIHZhbHVlIGZyb20gdGhlIGNhbGxiYWNrLlxuICAgKi9cbiAgY2F0Y2hFcnJvclN0YXRlKGNhbGxiYWNrOiAoKSA9PiBhbnkpIDogYW55IHtcbiAgICBpZiAodGhpcy4jY3VycmVudFN0YXRlID09PSBcImVycm9yZWRcIilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoaXMgY29uZmlndXJhdGlvbiBpcyBkZWFkIGR1ZSB0byBhIHByZXZpb3VzIGVycm9yIVwiKTtcblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICB9XG4gICAgY2F0Y2ggKGV4KSB7XG4gICAgICB0aGlzLiNjdXJyZW50U3RhdGUgPSBcImVycm9yZWRcIjtcbiAgICAgIHRocm93IGV4O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJbnRlcmNlcHQgZXJyb3JzIGZyb20gYSBtZXRob2QsIGFuZCBtYXJrIHRoaXMgYXMgZXJyb3JlZCBvdXQgaWYgd2Ugc2VlIG9uZS5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uXG4gICAqIEByZXR1cm5zIHthbnl9IFRoZSByZXR1cm4gdmFsdWUgZnJvbSB0aGUgY2FsbGJhY2suXG4gICAqIEBhc3luY1xuICAgKi9cbiAgYXN5bmMgY2F0Y2hFcnJvckFzeW5jKGNhbGxiYWNrOiAoKSA9PiBQcm9taXNlPGFueT4pIDogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAodGhpcy4jY3VycmVudFN0YXRlID09PSBcImVycm9yZWRcIilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoaXMgY29uZmlndXJhdGlvbiBpcyBkZWFkIGR1ZSB0byBhIHByZXZpb3VzIGVycm9yIVwiKTtcblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgY2FsbGJhY2soKTtcbiAgICB9XG4gICAgY2F0Y2ggKGV4KSB7XG4gICAgICB0aGlzLiNjdXJyZW50U3RhdGUgPSBcImVycm9yZWRcIjtcbiAgICAgIHRocm93IGV4O1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBNYXAoKSA6IENvbmZpZ3VyYXRpb25TdGF0ZU1hY2hpbmUge1xuICAgIHJldHVybiBuZXcgQ29uZmlndXJhdGlvblN0YXRlTWFjaGluZShbXG4gICAgICBbXCJzdGFydFwiLCBcInN0YXJ0TWFwXCJdLFxuXG4gICAgICBbXCJzdGFydE1hcFwiLCBcImZpbGVPdmVydmlld1wiXSxcbiAgICAgIFtcInN0YXJ0TWFwXCIsIFwiaW1wb3J0TGluZXNcIl0sXG4gICAgICBbXCJzdGFydE1hcFwiLCBcIm1hcEtleXNcIl0sXG5cbiAgICAgIFtcImZpbGVPdmVydmlld1wiLCBcImltcG9ydExpbmVzXCJdLFxuICAgICAgW1wiZmlsZU92ZXJ2aWV3XCIsIFwibWFwS2V5c1wiXSxcblxuICAgICAgW1wiaW1wb3J0TGluZXNcIiwgXCJtYXBLZXlzXCJdLFxuICAgICAgW1wiaW1wb3J0TGluZXNcIiwgXCJoYXNWYWx1ZUZpbHRlclwiXSxcblxuICAgICAgW1wibWFwS2V5c1wiLCBcIm1hcEtleXNcIl0sXG4gICAgICBbXCJtYXBLZXlzXCIsIFwia2V5TGlua1wiXSxcbiAgICAgIFtcIm1hcEtleXNcIiwgXCJoYXNWYWx1ZUZpbHRlclwiXSxcbiAgICAgIFtcIm1hcEtleXNcIiwgXCJsb2NrZWRcIl0sXG5cbiAgICAgIFtcImtleUxpbmtcIiwgXCJrZXlMaW5rXCJdLFxuICAgICAgW1wia2V5TGlua1wiLCBcImhhc1ZhbHVlRmlsdGVyXCJdLFxuICAgICAgW1wia2V5TGlua1wiLCBcImxvY2tlZFwiXSxcblxuICAgICAgW1wiaGFzVmFsdWVGaWx0ZXJcIiwgXCJsb2NrZWRcIl0sXG5cbiAgICAgIFtcImxvY2tlZFwiLCBcImxvY2tlZFwiXSxcbiAgICBdKVxuICB9XG5cbiAgc3RhdGljIFNldCgpIDogQ29uZmlndXJhdGlvblN0YXRlTWFjaGluZSB7XG4gICAgcmV0dXJuIG5ldyBDb25maWd1cmF0aW9uU3RhdGVNYWNoaW5lKFtcbiAgICAgIFtcInN0YXJ0XCIsIFwic3RhcnRTZXRcIl0sXG5cbiAgICAgIFtcInN0YXJ0U2V0XCIsIFwiZmlsZU92ZXJ2aWV3XCJdLFxuICAgICAgW1wic3RhcnRTZXRcIiwgXCJpbXBvcnRMaW5lc1wiXSxcbiAgICAgIFtcInN0YXJ0U2V0XCIsIFwic2V0RWxlbWVudHNcIl0sXG5cbiAgICAgIFtcImZpbGVPdmVydmlld1wiLCBcImltcG9ydExpbmVzXCJdLFxuICAgICAgW1wiZmlsZU92ZXJ2aWV3XCIsIFwic2V0RWxlbWVudHNcIl0sXG5cbiAgICAgIFtcImltcG9ydExpbmVzXCIsIFwic2V0RWxlbWVudHNcIl0sXG5cbiAgICAgIFtcInNldEVsZW1lbnRzXCIsIFwic2V0RWxlbWVudHNcIl0sXG4gICAgICBbXCJzZXRFbGVtZW50c1wiLCBcImtleUxpbmtcIl0sXG4gICAgICBbXCJzZXRFbGVtZW50c1wiLCBcImxvY2tlZFwiXSxcblxuICAgICAgW1wia2V5TGlua1wiLCBcImtleUxpbmtcIl0sXG4gICAgICBbXCJrZXlMaW5rXCIsIFwibG9ja2VkXCJdLFxuXG4gICAgICBbXCJsb2NrZWRcIiwgXCJsb2NrZWRcIl0sXG4gICAgXSlcbiAgfVxuXG4gIHN0YXRpYyBNYXBPZlNldHMoKSA6IENvbmZpZ3VyYXRpb25TdGF0ZU1hY2hpbmUge1xuICAgIHJldHVybiBuZXcgQ29uZmlndXJhdGlvblN0YXRlTWFjaGluZShbXG4gICAgICBbXCJzdGFydFwiLCBcInN0YXJ0TWFwT2ZTZXRzXCJdLFxuXG4gICAgICBbXCJzdGFydE1hcE9mU2V0c1wiLCBcImZpbGVPdmVydmlld1wiXSxcbiAgICAgIFtcInN0YXJ0TWFwT2ZTZXRzXCIsIFwiaW1wb3J0TGluZXNcIl0sXG4gICAgICBbXCJzdGFydE1hcE9mU2V0c1wiLCBcIm1hcEtleXNcIl0sXG5cbiAgICAgIFtcImZpbGVPdmVydmlld1wiLCBcImltcG9ydExpbmVzXCJdLFxuICAgICAgW1wiZmlsZU92ZXJ2aWV3XCIsIFwibWFwS2V5c1wiXSxcblxuICAgICAgW1wiaW1wb3J0TGluZXNcIiwgXCJtYXBLZXlzXCJdLFxuXG4gICAgICBbXCJtYXBLZXlzXCIsIFwibWFwS2V5c1wiXSxcbiAgICAgIFtcIm1hcEtleXNcIiwgXCJzZXRFbGVtZW50c1wiXSxcblxuICAgICAgW1wic2V0RWxlbWVudHNcIiwgXCJzZXRFbGVtZW50c1wiXSxcbiAgICAgIFtcInNldEVsZW1lbnRzXCIsIFwia2V5TGlua1wiXSxcbiAgICAgIFtcInNldEVsZW1lbnRzXCIsIFwibG9ja2VkXCJdLFxuXG4gICAgICBbXCJrZXlMaW5rXCIsIFwia2V5TGlua1wiXSxcbiAgICAgIFtcImtleUxpbmtcIiwgXCJsb2NrZWRcIl0sXG5cbiAgICAgIFtcImxvY2tlZFwiLCBcImxvY2tlZFwiXSxcbiAgICBdKVxuICB9XG5cbiAgc3RhdGljIE9uZVRvT25lKCkgOiBDb25maWd1cmF0aW9uU3RhdGVNYWNoaW5lIHtcbiAgICByZXR1cm4gbmV3IENvbmZpZ3VyYXRpb25TdGF0ZU1hY2hpbmUoW1xuICAgICAgW1wic3RhcnRcIiwgXCJzdGFydE9uZVRvT25lXCJdLFxuXG4gICAgICBbXCJzdGFydE9uZVRvT25lXCIsIFwiZmlsZU92ZXJ2aWV3XCJdLFxuICAgICAgW1wic3RhcnRPbmVUb09uZVwiLCBcImNvbmZpZ3VyZU9uZVRvT25lXCJdLFxuXG4gICAgICBbXCJmaWxlT3ZlcnZpZXdcIiwgXCJjb25maWd1cmVPbmVUb09uZVwiXSxcblxuICAgICAgW1wiY29uZmlndXJlT25lVG9PbmVcIiwgXCJsb2NrZWRcIl0sXG5cbiAgICAgIFtcImxvY2tlZFwiLCBcImxvY2tlZFwiXSxcbiAgICBdKVxuICB9XG59XG5cbk9iamVjdC5mcmVlemUoQ29uZmlndXJhdGlvblN0YXRlTWFjaGluZS5wcm90b3R5cGUpO1xuT2JqZWN0LmZyZWV6ZShDb25maWd1cmF0aW9uU3RhdGVNYWNoaW5lKVxuXG5leHBvcnQgZGVmYXVsdCBDb25maWd1cmF0aW9uU3RhdGVNYWNoaW5lO1xuIl19