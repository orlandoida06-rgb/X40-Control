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
    VOICE_BASE_PATH: VOICE_BASE_PATH,
    ACTIVE_VOICE_FILE: ACTIVE_VOICE_FILE,
    VOICES: VOICES,
    WATER_VOICE_IDS: WATER_VOICE_IDS,
    getActiveVoiceLanguage: getActiveVoiceLanguage,
    getVoicePath: getVoicePath,
    isX40ControlVoice: isX40ControlVoice,
};

const ROOM_VOICE_FILES = {
    cocina: "1301-Cocina.ogg",
    salon: "1302-Salon.ogg",
    dormitorio: "1303-Dormitorio.ogg",
    bano: "1304-Bano.ogg",
    entrada: "1305-Entrada.ogg",
    pasillo: "1306-Pasillo.ogg",
    comedor: "1307-Comedor.ogg",
    despacho: "1308-Despacho.ogg",
    habitacion: "1309-Habitacion.ogg",
    "habitacion-infantil": "1310-Habitacion-infantil.ogg",
    lavadero: "1311-Lavadero.ogg",
    terraza: "1312-Terraza.ogg",
    balcon: "1313-Balcon.ogg",
    garaje: "1314-Garaje.ogg",
    vestidor: "1315-Vestidor.ogg",
    "sala-de-juegos": "1316-Sala-de-juegos.ogg",
    biblioteca: "1317-Biblioteca.ogg",
    gimnasio: "1318-Gimnasio.ogg",
    estudio: "1319-Estudio.ogg",
    sala: "1320-Sala.ogg"
};

function getRoomVoicePath(roomName) {
    if (typeof roomName !== "string") {
        return null;
    }

    const normalizedName = roomName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ñ/g, "n")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");

    const file = ROOM_VOICE_FILES[normalizedName];

    if (!file) {
        return null;
    }

    const language = getActiveVoiceLanguage();

    if (!language) {
        return null;
    }

    return `${VOICE_BASE_PATH}/${language}/${file}`;
}
function getRoomVoicePathById(voiceId) {
    const numericVoiceId = Number(voiceId);

    if (
        !Number.isInteger(numericVoiceId) ||
        numericVoiceId < 1 ||
        numericVoiceId > 20
    ) {
        return null;
    }

    const file = ROOM_VOICE_FILES_BY_ID[numericVoiceId];

    if (!file) {
        return null;
    }

    const language = getActiveVoiceLanguage();

    if (!language) {
        return null;
    }

    return `${VOICE_BASE_PATH}/${language}/${file}`;
}

const ROOM_VOICE_FILES_BY_ID = {
    1: "1301-Cocina.ogg",
    2: "1302-Salon.ogg",
    3: "1303-Dormitorio.ogg",
    4: "1304-Bano.ogg",
    5: "1305-Entrada.ogg",
    6: "1306-Pasillo.ogg",
    7: "1307-Comedor.ogg",
    8: "1308-Despacho.ogg",
    9: "1309-Habitacion.ogg",
    10: "1310-Habitacion-infantil.ogg",
    11: "1311-Lavadero.ogg",
    12: "1312-Terraza.ogg",
    13: "1313-Balcon.ogg",
    14: "1314-Garaje.ogg",
    15: "1315-Vestidor.ogg",
    16: "1316-Sala-de-juegos.ogg",
    17: "1317-Biblioteca.ogg",
    18: "1318-Gimnasio.ogg",
    19: "1319-Estudio.ogg",
    20: "1320-Sala.ogg"
};

module.exports.getRoomVoicePathById = getRoomVoicePathById;
module.exports.getRoomVoicePath = getRoomVoicePath;
