"use strict";

const VOICE_PACK_PATH = "/data/personalized_voice/X40-Control";

const VOICES = {
    // Modos de limpieza
    1001: "1001.ogg", // Aspirar
    1002: "1002.ogg", // Fregar
    1003: "1003.ogg", // Aspirar y fregar
    1004: "1004.ogg", // Aspirar y después fregar
    1005: "1005.ogg", // Personalizado

    // Potencia de aspiración
    1101: "1101.ogg", // Apagado
    1102: "1102.ogg", // Mínimo
    1103: "1103.ogg", // Bajo
    1104: "1104.ogg", // Medio
    1105: "1105.ogg", // Alto
    1106: "1106.ogg", // Máximo
    1107: "1107.ogg", // Turbo
};

function getVoicePath(id) {
    const file = VOICES[id];

    if (!file) {
        return null;
    }

    return `${VOICE_PACK_PATH}/${file}`;
}

module.exports = {
    VOICE_PACK_PATH,
    VOICES,
    getVoicePath,
};
