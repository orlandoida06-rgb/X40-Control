import {valetudoAPI} from "../api/client";
import {Capability} from "../api";

const VOICE_IDS: Record<string, number> = {
    vacuum: 1001,
    mop: 1002,
    vacuum_and_mop: 1003,
    vacuum_then_mop: 1004,
    custom: 1005,
};

const SUCTION_VOICE_IDS: Record<string, number> = {
    off: 1101,
    min: 1102,
    low: 1103,
    medium: 1104,
    high: 1105,
    max: 1106,
    turbo: 1107,
};

const WATER_VOICE_IDS: Record<string, number> = {
    off: 1201,
    min: 1202,
    low: 1203,
    medium: 1204,
    high: 1205,
    max: 1206,
};

export function getX40ControlVoiceId(
    value: string,
    capability?: Capability
): number | null {
    if (capability === Capability.WaterUsageControl) {
        return WATER_VOICE_IDS[value] ?? null;
    }

    if (capability === Capability.FanSpeedControl) {
        return SUCTION_VOICE_IDS[value] ?? null;
    }

    return VOICE_IDS[value] ?? null;
}

export function playX40ControlVoice(
    value: string,
    capability?: Capability
): void {
    const voiceId = getX40ControlVoiceId(value, capability);

    if (voiceId === null) {
        return;
    }

    void valetudoAPI.post("/valetudo/x40-control/voice", {
        id: voiceId,
    }).catch(() => {
        // La selección del preset no debe fallar aunque la voz no pueda reproducirse.
    });
}
