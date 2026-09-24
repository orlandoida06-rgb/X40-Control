"use strict";

const fs = require("fs");

const VOICE_BASE_PATH = "/data/personalized_voice";
const ACTIVE_VOICE_FILE = "/data/config/ava/language_in_use";

const VOICES = {
    1001: "1001.ogg",
    1002: "1002.ogg",
    1003: "1003.ogg",
    1004: "1004.ogg",
    1005: "1005.ogg",
    1101: "1101.ogg",
    1102: "1102.ogg",
    1103: "1103.ogg",
    1104: "1104.ogg",
    1105: "1105.ogg",
    1106: "1106.ogg",
    1107: "1107.ogg",
};
const WATER_VOICE_IDS = {
    1201: "1201.ogg",
    1202: "1202.ogg",
    1203: "1203.ogg",
    1204: "1204.ogg",
    1205: "1205.ogg",
    1206: "1206.ogg",
};

function getActiveVoiceLanguage() {
    try {
        const language = fs
            .readFileSync(ACTIVE_VOICE_FILE, "utf8")
            .replace(/\0/g, "")
            .trim()
            .toUpperCase();

        return language || null;
    } catch {
        return null;
    }
}

function getVoicePath(id) {
    const file = VOICES[id] || WATER_VOICE_IDS[id];

    if (!file) {
        return null;
    }

    const language = getActiveVoiceLanguage();

    if (!language) {
        return null;
    }

    return `${VOICE_BASE_PATH}/${language}/${file}`;
}

function isX40ControlVoice(id) {
    return Object.prototype.hasOwnProperty.call(VOICES, id) ||
        Object.prototype.hasOwnProperty.call(WATER_VOICE_IDS, id);
}

module.exports = {
    VOICE_BASE_PATH,
    ACTIVE_VOICE_FILE,
    VOICES,
    WATER_VOICE_IDS,
    getActiveVoiceLanguage,
    getVoicePath,
    isX40ControlVoice,
};
