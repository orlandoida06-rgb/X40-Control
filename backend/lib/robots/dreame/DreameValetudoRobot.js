const fs = require("fs");
const Logger = require("../../Logger");

const LinuxWifiScanCapability = require("../common/linuxCapabilities/LinuxWifiScanCapability");
const miioCapabilities = require("../common/miioCapabilities");

const DreameMapParser = require("./DreameMapParser");
const DreameMiotHelper = require("./DreameMiotHelper");

const AttachmentStateAttribute = require("../../entities/state/attributes/AttachmentStateAttribute");
const AttributeSubscriber = require("../../entities/AttributeSubscriber");
const CallbackAttributeSubscriber = require("../../entities/CallbackAttributeSubscriber");
const entities = require("../../entities");
const MiioDummycloudNotConnectedError = require("../../miio/MiioDummycloudNotConnectedError");
const MiioErrorResponseRobotFirmwareError = require("../../miio/MiioErrorResponseRobotFirmwareError");
const MiioValetudoRobot = require("../MiioValetudoRobot");
const MopAttachmentReminderValetudoEvent = require("../../valetudo_events/events/MopAttachmentReminderValetudoEvent");
const PendingMapChangeValetudoEvent = require("../../valetudo_events/events/PendingMapChangeValetudoEvent");
const ValetudoMap = require("../../entities/map/ValetudoMap");
const ValetudoRobotError = require("../../entities/core/ValetudoRobotError");

const stateAttrs = entities.state.attributes;

class DreameValetudoRobot extends MiioValetudoRobot {
    /**
     *
     * @param {object} options
     * @param {import("../../Configuration")} options.config
     * @param {import("../../ValetudoEventStore")} options.valetudoEventStore
     * @param {object} [options.operationModes]
     * @param {number} [options.miotPostWriteDelay]
     * @param {object} options.miotServices
     * @param {object} options.miotServices.MAP
     * @param {number} options.miotServices.MAP.SIID
     * @param {object} options.miotServices.MAP.ACTIONS
     * @param {object} options.miotServices.MAP.ACTIONS.POLL
     * @param {number} options.miotServices.MAP.ACTIONS.POLL.AIID
     * @param {object} options.miotServices.MAP.PROPERTIES
     * @param {object} options.miotServices.MAP.PROPERTIES.MAP_DATA
     * @param {number} options.miotServices.MAP.PROPERTIES.MAP_DATA.PIID
     */
    constructor(options) {
        super(options);
        this.miotHelper = new DreameMiotHelper({robot: this, postWriteDelay: options.miotPostWriteDelay});

        this.operationModes = options.operationModes ?? {};
        this.miotServices = options.miotServices;

        this.registerCapability(new miioCapabilities.MiioWifiConfigurationCapability({
            robot: this,
            networkInterface: "wlan0"
        }));

        if (this.config.get("embedded") === true) {
            this.registerCapability(new LinuxWifiScanCapability({
                robot: this,
                networkInterface: "wlan0"
            }));
        }
    }

    setEmbeddedParameters() {
        this.deviceConfPath = DreameValetudoRobot.DEVICE_CONF_PATH;
        this.tokenFilePath = DreameValetudoRobot.TOKEN_FILE_PATH;
    }

    async executeMapPoll() {
        let mapPollResult;
        try {
            mapPollResult = await this.sendCommand("action",
                {
                    did: this.deviceId,
                    siid: this.miotServices.MAP.SIID,
                    aiid: this.miotServices.MAP.ACTIONS.POLL.AIID,
                    in: [{
                        piid: 2,
                        value: "{\"frame_type\":\"I\", \"force_type\": 1, \"req_type\": 1}"
                    }]
                },
                {
                    timeout: 7000, // user ack timeout seems to appear after ~6s on the p2028 1156
                    interface: "cloud"
                }
            );
        } catch (e) {
            if (e instanceof MiioErrorResponseRobotFirmwareError && e.response?.message === "user ack timeout") {
                /*
                    Since we're polling IFrames much faster than the regular dreame map, occasionally, the dreame
                    firmware isn't quick enough to respond to our requests.

                    As this is expected, we just ignore that error
                 */
            } else if (e instanceof MiioDummycloudNotConnectedError) {
                /* intentional */
            } else {
                Logger.warn("Error while polling map", e);
            }

            return;
        }

        if (mapPollResult.code === 0 && Array.isArray(mapPollResult.out)) {
            for (let prop of mapPollResult.out) {
                if (prop.piid === this.miotServices.MAP.PROPERTIES.MAP_DATA.PIID && prop.value?.length > 15) {
                    try {
                        await this.preprocessAndParseMap(prop.value);
                    } catch (e) {
                        Logger.warn("Error while trying to parse map from miio", e);
                    }
                }
            }
        }
    }

    /**
     * Uploaded dreame Maps are actually base64 strings of zlib compressed data with two characters replaced
     *
     * @param {any} data
     * @returns {Promise<Buffer>}
     */
    async preprocessMap(data) {
        const preprocessedData = await DreameMapParser.PREPROCESS(data);

        if (preprocessedData) {
            return preprocessedData;
        } else {
            throw new Error("Invalid map data");
        }
    }

    async parseMap(data) {
        const parsedMap = await DreameMapParser.PARSE(data);

        if (parsedMap instanceof ValetudoMap) {
            if (
                parsedMap.metaData?.dreamePendingMapChange === true &&
                this.state.map?.metaData?.dreamePendingMapChange !== true
            ) {
                this.valetudoEventStore.raise(new PendingMapChangeValetudoEvent({}));
            }

            this.state.map = parsedMap;

            this.emitMapUpdated();
        }

        return this.state.map;
    }

    /**
     * @public
     * @param {Buffer} data
     * @param {object} query implementation specific query parameters
     * @param {object} params implementation specific url parameters
     * @returns {Promise<void>}
     */
    async handleUploadedFDSData(data, query, params) {
        if (
            Buffer.isBuffer(data) &&
            (
                data[0] === 0x7b || data[0] === 0x5b // 0x7b = "{" 0x5b = "["
            )
        ) {
            Logger.trace("Received unhandled multi-map json", {
                query: query,
                params: params,
                data: data.toString()
            });
        } else if (
            Buffer.isBuffer(data) &&
            (
                data[0] === 0x42 && data[1] === 0x5a && data[2] === 0x68 // bzip2 magic bytes
            )
        ) {
            Logger.trace("Received unhandled map backup", {
                query: query,
                params: params
            });
        } else {
            await this.preprocessAndParseMap(data);
        }
    }

    /**
     * @protected
     * @param {Buffer| string} data
     * @returns {Promise<void>}
     */
    async preprocessAndParseMap(data) {
        const preprocessedMap = await this.preprocessMap(data);
        const parsedMap = await this.parseMap(preprocessedMap);

        if (!parsedMap) {
            Logger.warn("Failed to parse uploaded map");
        }
    }

    getManufacturer() {
        return "Dreame";
    }

    startup() {
        super.startup();

        if (this.config.get("embedded") === true) {
            const firmwareVersion = this.getFirmwareVersion();

            if (firmwareVersion.valid) {
                Logger.info("Firmware Version: " + firmwareVersion.arm);
            }
        }
    }

    initInternalSubscriptions() {
        super.initInternalSubscriptions();

        this.state.subscribe(
            new CallbackAttributeSubscriber((eventType,attachment, prevStatus) => {
                if (
                    eventType === AttributeSubscriber.EVENT_TYPE.CHANGE &&
                    attachment.type === AttachmentStateAttribute.TYPE.MOP &&
                    //@ts-ignore
                    attachment.attached === false
                ) {
                    try {
                        this.valetudoEventStore.setProcessed(MopAttachmentReminderValetudoEvent.ID);
                    } catch (e) {
                        //intentional
                    }
                }
            }),
            {attributeClass: AttachmentStateAttribute.name}
        );
    }

    /**
     * @private
     * @returns {{arm: string, valid: boolean}}
     */
    getFirmwareVersion() {
        const firmwareVersion = {
            arm: "???",
            valid: false
        };

        try {
            const os_release = fs.readFileSync("/etc/os-release").toString();
            const parsedFile = JSON.parse(os_release);

            if (parsedFile && parsedFile.fw_arm_ver) {
                firmwareVersion.valid = true;

                firmwareVersion.arm = parsedFile.fw_arm_ver.split("_")?.[1];
            }
        } catch (e) {
            Logger.warn("Unable to determine the Firmware Version", e);
        }

        return firmwareVersion;
    }

    getModelDetails() {
        return Object.assign(
            {},
            super.getModelDetails(),
            {
                supportedAttachments: [
                    stateAttrs.AttachmentStateAttribute.TYPE.WATERTANK,
                    stateAttrs.AttachmentStateAttribute.TYPE.MOP,
                ]
            }
        );
    }

    /**
     * @return {object}
     */
    getProperties() {
        const superProps = super.getProperties();
        const ourProps = {};

        if (this.config.get("embedded") === true) {
            const firmwareVersion = this.getFirmwareVersion();

            if (firmwareVersion.valid) {
                ourProps[DreameValetudoRobot.WELL_KNOWN_PROPERTIES.FIRMWARE_VERSION] = firmwareVersion.arm;
            }
        }

        return Object.assign(
            {},
            superProps,
            ourProps
        );
    }


    static IMPLEMENTATION_AUTO_DETECTION_HANDLER() {
        const deviceConf = MiioValetudoRobot.READ_DEVICE_CONF(DreameValetudoRobot.DEVICE_CONF_PATH);

        return !!(deviceConf && deviceConf.model === "dreame.vacuum.p2009");
    }
}

DreameValetudoRobot.DEVICE_CONF_PATH = "/data/config/miio/device.conf";
DreameValetudoRobot.TOKEN_FILE_PATH = "/data/config/miio/device.token";

DreameValetudoRobot.STATUS_MAP = Object.freeze({
    0: {
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    1: {
        value: stateAttrs.StatusStateAttribute.VALUE.PAUSED
    },
    2: {
        value: stateAttrs.StatusStateAttribute.VALUE.CLEANING
    },
    3: {
        value: stateAttrs.StatusStateAttribute.VALUE.RETURNING
    },
    4: {
        value: stateAttrs.StatusStateAttribute.VALUE.CLEANING,
        flag: stateAttrs.StatusStateAttribute.FLAG.SEGMENT
    },
    5: {
        value: stateAttrs.StatusStateAttribute.VALUE.CLEANING
    },
    6: {
        value: stateAttrs.StatusStateAttribute.VALUE.DOCKED
    },
    7: {
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    8: {
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    9: {
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    10: {
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    11: {
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    12: {
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    13: {
        value: stateAttrs.StatusStateAttribute.VALUE.MANUAL_CONTROL
    },
    14: { //Powersave
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    15: { //SelfTest/AutoRepair of the W10 dock?
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    16: {
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    17: {
        value: stateAttrs.StatusStateAttribute.VALUE.IDLE
    },
    18: {
        value: stateAttrs.StatusStateAttribute.VALUE.CLEANING,
        flag: stateAttrs.StatusStateAttribute.FLAG.SEGMENT
    },
    19: {
        value: stateAttrs.StatusStateAttribute.VALUE.CLEANING,
        flag: stateAttrs.StatusStateAttribute.FLAG.ZONE
    },
    20: {
        value: stateAttrs.StatusStateAttribute.VALUE.CLEANING,
        flag: stateAttrs.StatusStateAttribute.FLAG.SPOT
    },
    21: {
        value: stateAttrs.StatusStateAttribute.VALUE.MOVING,
        flag: stateAttrs.StatusStateAttribute.FLAG.MAPPING
    },
    // 22?
    23: {
        value: stateAttrs.StatusStateAttribute.VALUE.MOVING,
        flag: stateAttrs.StatusStateAttribute.FLAG.TARGET
    }
});

DreameValetudoRobot.FAN_SPEEDS = {
    [stateAttrs.PresetSelectionStateAttribute.INTENSITY.LOW]: 0,
    [stateAttrs.PresetSelectionStateAttribute.INTENSITY.MEDIUM]: 1,
    [stateAttrs.PresetSelectionStateAttribute.INTENSITY.HIGH]: 2,
    [stateAttrs.PresetSelectionStateAttribute.INTENSITY.MAX]: 3
};

DreameValetudoRobot.WATER_GRADES = Object.freeze({
    [stateAttrs.PresetSelectionStateAttribute.INTENSITY.LOW]: 1,
    [stateAttrs.PresetSelectionStateAttribute.INTENSITY.MEDIUM]: 2,
    [stateAttrs.PresetSelectionStateAttribute.INTENSITY.HIGH]: 3,
});

DreameValetudoRobot.AUTO_EMPTY_DOCK_STATUS_MAP = Object.freeze({
    0: stateAttrs.DockStatusStateAttribute.VALUE.IDLE,
    1: stateAttrs.DockStatusStateAttribute.VALUE.EMPTYING,
    2: stateAttrs.DockStatusStateAttribute.VALUE.IDLE, // DND
});

DreameValetudoRobot.MOP_DOCK_STATUS_MAP = Object.freeze({
    0: stateAttrs.DockStatusStateAttribute.VALUE.IDLE,
    1: stateAttrs.DockStatusStateAttribute.VALUE.CLEANING,
    2: stateAttrs.DockStatusStateAttribute.VALUE.DRYING,
    3: stateAttrs.DockStatusStateAttribute.VALUE.CLEANING, //TODO: idle instead?
    4: stateAttrs.DockStatusStateAttribute.VALUE.PAUSE,
    5: stateAttrs.DockStatusStateAttribute.VALUE.CLEANING,
    6: stateAttrs.DockStatusStateAttribute.VALUE.CLEANING,
});


/**
 *
 * @param {string} vendorErrorCode
 *
 * @returns {ValetudoRobotError}
 */
DreameValetudoRobot.MAP_ERROR_CODE = (vendorErrorCode) => {
    const parameters = {
        severity: {
            kind: ValetudoRobotError.SEVERITY_KIND.UNKNOWN,
            level: ValetudoRobotError.SEVERITY_LEVEL.UNKNOWN,
        },
        subsystem: ValetudoRobotError.SUBSYSTEM.UNKNOWN,
        message: `Unknown error ${vendorErrorCode}`,
        vendorErrorCode: vendorErrorCode
    };

    switch (vendorErrorCode) {
        case "0":
            parameters.message = "Sin error";
            break;
        case "1":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.CORE;
            parameters.message = "La rueda ha perdido el contacto con el suelo";
            break;
        case "2":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "El sensor de desnivel está sucio o el robot está al borde de una caída";
            break;
        case "3":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "El parachoques delantero está atascado";
            break;
        case "4":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "El robot está inclinado";
            break;
        case "5":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "El parachoques delantero está atascado";
            break;
        case "6":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.CORE;
            parameters.message = "La rueda ha perdido el contacto con el suelo";
            break;
        case "7":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.CORE;
            parameters.message = `Error interno ${vendorErrorCode}`;
            break;
        case "8":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.ATTACHMENTS;
            parameters.message = "El depósito de polvo no está instalado";
            break;
        case "9":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.ATTACHMENTS;
            parameters.message = "El depósito de agua no está instalado";
            break;
        case "10":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.ATTACHMENTS;
            parameters.message = "El depósito de agua está vacío";
            break;
        case "11":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.ATTACHMENTS;
            parameters.message = "El depósito de polvo está lleno";
            break;
        case "12":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.MOTORS;
            parameters.message = "El cepillo principal está atascado";
            break;
        case "13":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.MOTORS;
            parameters.message = "El cepillo lateral está atascado";
            break;
        case "14":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.ATTACHMENTS;
            parameters.message = "El filtro está obstruido";
            break;
        case "15":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "El robot está atascado";
            break;
        case "16":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "El robot está atascado";
            break;
        case "17":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "El robot está atascado";
            break;
        case "18":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "El robot está atascado";
            break;
        case "19":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.POWER;
            parameters.message = "La estación base no tiene alimentación";
            break;
        case "20":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.INFO;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.POWER;
            parameters.message = "Batería baja";
            break;
        case "21":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.POWER;
            parameters.message = "Error de carga";
            break;
        //22
        case "23":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.CORE;
            parameters.message = `Error interno ${vendorErrorCode}`; //"AVA_HEALTH_STATUS_TYPE_HEART" //TODO What does the dreame error string mean?
            break;
        case "24":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "La cámara está sucia";
            break;
        case "25":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.CORE;
            parameters.message = `Error interno ${vendorErrorCode}`; //"AVA_HEALTH_STATUS_TYPE_MOVE" //TODO What does the dreame error string mean?
            break;
        case "26":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "La cámara está sucia";
            break;
        case "27":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "El sensor está sucio";
            break;
        case "28":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.POWER;
            parameters.message = "La estación base no tiene alimentación";
            break;
        case "29":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.POWER;
            parameters.message = "La temperatura de la batería está fuera del rango de funcionamiento";
            break;
        case "30":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.MOTORS;
            parameters.message = "Velocidad del ventilador anormal";
            break;
        case "31":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "El robot está atascado";
            break;
        case "32":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "El robot está atascado";
            break;
        case "33":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Error del sensor del acelerómetro";
            break;
        case "34":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Error del sensor giroscópico";
            break;
        case "35":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Error del sensor giroscópico";
            break;
        case "36":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Error del sensor magnético izquierdo";
            break;
        case "37":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Error del sensor magnético derecho";
            break;
        case "38":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.CORE;
            parameters.message = `Error interno ${vendorErrorCode}`; //"AVA_HEALTH_STATUS_TYPE_I_FLOW_ERROR" //TODO What does the dreame error string mean?
            break;
        case "39":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.CORE;
            parameters.message = `Error interno ${vendorErrorCode}`; //"AVA_HEALTH_STATUS_TYPE_INFRARED_FAULT" //TODO What does the dreame error string mean?
            break;
        case "40":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Fallo de la cámara";
            break;
        case "41":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.INFO;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "Interferencia magnética";
            break;
        case "42":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.ATTACHMENTS;
            parameters.message = "Fallo de la bomba de agua";
            break;
        case "43":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.CORE;
            parameters.message = "Fallo del reloj interno";
            break;
        case "44":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.CORE;
            parameters.message = `Error interno ${vendorErrorCode}`; //"AVA_HEALTH_STATUS_TYPE_I_AUTO_KEY_TRIG" //TODO What does the dreame error string mean?
            break;
        case "45":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.CORE;
            parameters.message = "Tensión de 3,3 V anormal";
            break;
        case "46":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.CORE;
            parameters.message = `Error interno ${vendorErrorCode}`;
            break;
        case "47":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "No se puede llegar al destino";
            break;
        case "48":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "El LDS está atascado";
            break;
        case "49":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "El parachoques del LDS está atascado";
            break;
        case "50":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.CORE;
            parameters.message = `Error interno ${vendorErrorCode}`;
            break;
        case "51":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.ATTACHMENTS;
            parameters.message = "El filtro está obstruido";
            break;
        case "52":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.CORE;
            parameters.message = `Error interno ${vendorErrorCode}`;
            break;
        case "53":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "El sensor ToF no está disponible";
            break;
        case "54":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.SENSORS;
            parameters.message = "El sensor de pared está sucio";
            break;
        case "55":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.CORE;
            parameters.message = `Error interno ${vendorErrorCode}`; //"AVA_HEALTH_STATUS_TYPE_CARPET_WATEBOX_START" //TODO What does the dreame error string mean?
            break;
        case "56":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.CORE;
            parameters.message = `Error interno ${vendorErrorCode}`;
            break;
        case "57":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.CORE;
            parameters.message = `Error interno ${vendorErrorCode}`;
            break;
        case "58":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.CORE;
            parameters.message = `Error interno ${vendorErrorCode}`;
            break;
        case "59":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "El robot está atrapado por restricciones virtuales";
            break;
        case "60":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.UNKNOWN;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.UNKNOWN;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.CORE;
            parameters.message = `Error interno ${vendorErrorCode}`;
            break;
        case "61":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "No se puede llegar al destino";
            break;
        case "62":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "No se puede llegar al destino";
            break;
        case "63":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "No se puede llegar al destino";
            break;
        case "64":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "No se puede llegar al destino";
            break;
        case "65":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "No se puede llegar al destino";
            break;
        case "66":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "No se puede llegar al destino";
            break;
        case "67":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "No se puede llegar al destino";
            break;
        // 68: Not an Error. "Docked but mop is still attached. Please remove the mop"
        case "69":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.ATTACHMENTS;
            parameters.message = "La mopa se ha desprendido";
            break;
        case "70":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.ATTACHMENTS;
            parameters.message = "La mopa se ha desprendido";
            break;

        case "71":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.MOTORS;
            parameters.message = "Fallo del motor de la mopa";
            break;
        case "72":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.MOTORS;
            parameters.message = "Corriente anormal del motor de la mopa";
            break;

        case "74":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.ATTACHMENTS;
            parameters.message = "No se han podido colocar las mopas";
            break;

        case "82":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "El robot está atascado";
            break;

        case "91":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "No se puede llegar al destino";
            break;
        case "96":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "No se puede llegar al destino";
            break;

        case "98":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "El robot está atascado";
            break;


        case "-2":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "El robot está atrapado dentro de una zona restringida";
            break;


        case "101":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.DOCK;
            parameters.message = "La bolsa de polvo de la base está llena o el conducto de polvo está obstruido";
            break;
        case "102":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.DOCK;
            parameters.message = "La tapa de la base está abierta o falta la bolsa de polvo";
            break;
        case "103":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.DOCK;
            parameters.message = "La tapa de la base está abierta o falta la bolsa de polvo";
            break;
        case "104":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.DOCK;
            parameters.message = "La bolsa de polvo de la base está llena o el conducto de polvo está obstruido";
            break;



        case "105":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.DOCK;
            parameters.message = "El depósito de agua limpia no está instalado";
            break;
        case "106":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.DOCK;
            parameters.message = "El depósito de agua sucia no está instalado o está lleno";
            break;
        case "107":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.DOCK;
            parameters.message = "El depósito de agua limpia está vacío";
            break;
        case "108":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.DOCK;
            parameters.message = "El depósito de agua sucia no está instalado o está lleno";
            break;
        case "109":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.DOCK;
            parameters.message = "El conducto de agua sucia de la base está obstruido";
            break;
        case "110":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.CATASTROPHIC;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.DOCK;
            parameters.message = "La bomba de agua sucia de la base está dañada";
            break;
        case "111":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.DOCK;
            parameters.message = "La bandeja de lavado de la base no está instalada";
            break;
        case "112":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.DOCK;
            parameters.message = "La bandeja de lavado de la base está llena de agua";
            break;
        // 114: Not an Error. "Please remember to clean the mop tray"
        case "116":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.DOCK;
            parameters.message = "El depósito de agua limpia está vacío";
            break;
        case "117":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.TRANSIENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.NAVIGATION;
            parameters.message = "No se puede llegar a la estación base";
            break;
        case "118":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.DOCK;
            parameters.message = "El depósito de agua sucia no está instalado o está lleno";
            break;
        case "119":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.ERROR;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.DOCK;
            parameters.message = "La bandeja de lavado de la base está llena de agua";
            break;
        case "121":
            parameters.severity.kind = ValetudoRobotError.SEVERITY_KIND.PERMANENT;
            parameters.severity.level = ValetudoRobotError.SEVERITY_LEVEL.WARNING;
            parameters.subsystem = ValetudoRobotError.SUBSYSTEM.DOCK;
            parameters.message = "La bolsa de polvo de la base está llena o el conducto de polvo está obstruido";
            break;
    }

    return new ValetudoRobotError(parameters);
};

module.exports = DreameValetudoRobot;
