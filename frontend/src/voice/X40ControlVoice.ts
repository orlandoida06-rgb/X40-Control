import {valetudoAPI} from "../api/client";

const VOICE_IDS: Record<string, number> = {
    vacuum: 1001,
    mop: 1002,
    vacuum_and_mop: 1003,
    vacuum_then_mop: 1004,
    custom: 1005,

    off: 1101,
    min: 1102,
    low: 1103,
    medium: 1104,
    high: 1105,
    max: 1106,
    turbo: 1107,
};

export function getX40ControlVoiceId(value: string): number | null {
    return VOICE_IDS[value] ?? null;
}

export function playX40ControlVoice(value: string): void {
    const voiceId = getX40ControlVoiceId(value);

    if (voiceId === null) {
        return;
    }

    console.log(
        `[X40ControlVoice] preset=${value} voiceId=${voiceId}`
    );

    void valetudoAPI.post("/valetudo/x40-control/voice", {
        id: voiceId,
    }).catch(error => {
        console.warn("[X40ControlVoice] Error reproduciendo voz", error);
    });
}
