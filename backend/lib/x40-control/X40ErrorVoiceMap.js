"use strict";

/**
 * Dreame X40 error -> GLADOS voice mapping.
 *
 * The OGG number is NOT the Dreame error code.
 * Mappings are based on the semantic content of the original
 * GLADOS voice prompts.
 *
 * null = known error, but no confirmed matching voice yet.
 */

const X40ErrorVoiceMap = {
    // Robot / attachments
    "8": 34,       // Dustbin missing
    "12": 35,      // Main brush jammed
    "13": 36,      // Side brush jammed
    "14": 42,      // Filter jammed
    "51": 42,      // Filter jammed

    // Power
    "21": 50,      // Charging error
    "29": 51,      // Battery temperature out of range

    // Sensors / navigation
    "41": 49,      // Magnetic interference
    "59": 53,      // Robot trapped by virtual restrictions

    // Mop
    "69": 70,      // Lost mop pad
    "70": 70,      // Lost mop pad
    "74": null,    // Failed to attach mop pads - not confirmed

    // Mop dock
    "105": 91,     // Clean water tank not installed
    "106": 92,     // Wastewater tank not installed or full
    "108": 92,     // Wastewater tank not installed or full
    "118": 92,     // Wastewater tank not installed or full

    "107": 93,     // Clean water tank empty
    "116": 93,     // Clean water tank empty

    "112": 96,     // Mop dock tray full of water
    "119": 96,     // Mop dock tray full of water

    // Auto-empty dock
    "101": 98,     // Dust bag full
    "104": 98,     // Dust bag full / duct clogged
    "121": 98,     // Dust bag full / duct clogged

    "102": 99,     // Dock cover open / dust bag missing
    "103": 99      // Dock cover open / dust bag missing
};

function getVoiceIdForError(errorCode) {
    const key = String(errorCode);

    if (!Object.prototype.hasOwnProperty.call(X40ErrorVoiceMap, key)) {
        return null;
    }

    return X40ErrorVoiceMap[key];
}

module.exports = {
    X40ErrorVoiceMap,
    getVoiceIdForError
};
