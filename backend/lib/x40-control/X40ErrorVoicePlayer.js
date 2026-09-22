"use strict";

const {execFile} = require("child_process");

const VOICE_DIR = "/data/personalized_voice/X40-Control";

let currentlyPlaying = false;

function playVoice(voiceId) {
    if (voiceId === null || voiceId === undefined) {
        return;
    }

    if (currentlyPlaying) {
        return;
    }

    const file = `${VOICE_DIR}/${voiceId}.ogg`;

    currentlyPlaying = true;

    execFile(
        "/usr/bin/dmr_client",
        ["-f", file],
        {
            timeout: 10000
        },
        (error, stdout, stderr) => {
            currentlyPlaying = false;

            if (error) {
                console.warn(
                    `[X40Control] Error reproduciendo voz ${voiceId}: ${error.message}`
                );

                if (stdout || stderr) {
                    console.warn(
                        `[X40Control] voz ${voiceId} stdout: ${stdout}`
                    );
                    console.warn(
                        `[X40Control] voz ${voiceId} stderr: ${stderr}`
                    );
                }
            }
        }
    );
}

module.exports = {
    playVoice
};
