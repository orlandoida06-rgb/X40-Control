const NotImplementedError = require("../NotImplementedError");
const Capability = require("./Capability");

/**
 * @template {import("../ValetudoRobot")} T
 * @extends Capability<T>
 */
class DuststreamingCapability extends Capability {
    /**
     * @param {object} options
     * @param {T} options.robot
     * @param {{width: number, height: number}} options.dimensions
     */
    constructor(options) {
        super(options);
        this.dimensions = options.dimensions;
    }

    isDuststreamerInstalled() {
        throw new NotImplementedError();
    }

    register(subscriber) {
        throw new NotImplementedError();
    }

    async selfDestruct() {
        throw new NotImplementedError();
    }

    getProperties() {
        return {
            width: this.dimensions.width,
            height: this.dimensions.height,
            duststreamerInstalled: this.isDuststreamerInstalled()
        };
    }

    getType() {
        return DuststreamingCapability.TYPE;
    }
}

DuststreamingCapability.TYPE = "DuststreamingCapability";

module.exports = DuststreamingCapability;
