"use strict";

const Logger = require("../Logger");
const {execFile} = require("child_process");

const VOICE_DIR = "/data/personalized_voice/X40-Control";

let currentlyPlaying = false;
const voiceQueue = [];

function getOggDurationMs(file) {
    return new Promise((resolve) => {
        execFile(
            "/usr/bin/ogginfo",
            [file],
            {timeout: 3000},
            (error, stdout) => {
                if (error || !stdout) {
                    resolve(2500);
                    return;
                }

                const match = stdout.match(
                    /Playback length:\s*(\d+)m:(\d+)\.(\d+)s/
                );

                if (!match) {
                    resolve(2500);
                    return;
                }

                const minutes = Number(match[1]);
                const seconds = Number(match[2]);
                const milliseconds = Number(`0.${match[3]}`) * 1000;

                resolve(
                    (minutes * 60 * 1000) +
                    (seconds * 1000) +
                    milliseconds +
                    250
                );
            }
        );
    });
}

async function processVoiceQueue() {
    if (currentlyPlaying || voiceQueue.length === 0) {
        return;
    }

    const item = voiceQueue.shift();

    currentlyPlaying = true;

    Logger.info(
        `[X40Control] Reproduciendo voz de habitación: ${item.file}, cola restante=${voiceQueue.length}`
    );

    execFile(
        "/usr/bin/dmr_client",
        ["-f", item.file],
        {timeout: 10000},
        async (error, stdout, stderr) => {
            if (error) {
                Logger.warn(
                    `[X40Control] Error reproduciendo archivo de voz: ${item.file}: ${error.message}`
                );

                if (stdout || stderr) {
                    Logger.warn(
                        `[X40Control] voz stdout: ${stdout || ""}`
                    );
                    Logger.warn(
                        `[X40Control] voz stderr: ${stderr || ""}`
                    );
                }

                currentlyPlaying = false;
                processVoiceQueue();
                return;
            }

            const durationMs = await getOggDurationMs(item.file);

            Logger.info(
                `[X40Control] dmr_client finalizado: ${item.file}, esperando ${durationMs}ms para liberar cola`
            );

            setTimeout(() => {
                currentlyPlaying = false;
                processVoiceQueue();
            }, durationMs);
        }
    );
}

function enqueueVoiceFile(file) {
    if (!file) {
        return;
    }

    voiceQueue.push({file});

    Logger.info(
        `[X40Control] Voz añadida a cola: ${file}, cola=${voiceQueue.length}`
    );

    processVoiceQueue();
}

function playVoice(voiceId) {
    if (voiceId === null || voiceId === undefined) {
        return;
    }

    enqueueVoiceFile(`${VOICE_DIR}/${voiceId}.ogg`);
}

function playVoiceFile(file) {
    Logger.info(
        `[X40Control] playVoiceFile solicitado: ${file}, currentlyPlaying=${currentlyPlaying}, cola=${voiceQueue.length}`
    );

    enqueueVoiceFile(file);
}

module.exports = {
    playVoice,
    playVoiceFile
};
