import React from "react";
import {Box, Menu, MenuItem, Typography} from "@mui/material";
import AirIcon from "@mui/icons-material/Air";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import CheckIcon from "@mui/icons-material/Check";

import {
    Capability,
    PresetSelectionState,
    RobotAttributeClass,
    usePresetSelectionMutation,
    usePresetSelectionsQuery,
    useRobotAttributeQuery,
} from "../api";

import {capabilityToPresetType} from "../api/hooks";

import {
    presetFriendlyNames,
    sortPresets,
} from "../presetUtils";

import {playX40ControlVoice} from "../voice/X40ControlVoice";

type PresetCapability =
    | Capability.FanSpeedControl
    | Capability.WaterUsageControl
    | Capability.OperationModeControl;

interface CompactPresetControlProps {
    capability: PresetCapability;
    label: string;
}

const getPresetIcon = (
    capability: PresetCapability,
    value: PresetSelectionState["value"],
    selected = false
): React.ReactElement => {
    const isWater = capability === Capability.WaterUsageControl;

    let color = selected ? "#5bbcff" : "#8193aa";

    if (!isWater) {
        switch (value) {
            case "off":
                color = "#718096";
                break;
            case "min":
                color = "#8fa8c7";
                break;
            case "low":
                color = "#65a9df";
                break;
            case "medium":
                color = "#5bbcff";
                break;
            case "high":
                color = "#ffad42";
                break;
            case "max":
                color = "#ff5c68";
                break;
        }
    } else {
        switch (value) {
            case "off":
            case "min":
                color = "#718096";
                break;
            case "low":
                color = "#78a9cf";
                break;
            case "medium":
                color = "#4db8ff";
                break;
            case "high":
                color = "#299ff0";
                break;
            case "max":
                color = "#1684ff";
                break;
        }
    }

    const Icon = isWater ? WaterDropIcon : AirIcon;

    return (
        <Icon
            sx={{
                color: color,
                fontSize: selected ? 23 : 20,
                filter: selected ?
                    "drop-shadow(0 0 7px rgba(91,188,255,.35))" :
                    "none",
            }}
        />
    );
};

const CompactPresetControl = ({
    capability,
    label,
}: CompactPresetControlProps): React.ReactElement => {
    const {data: preset} = useRobotAttributeQuery(
        RobotAttributeClass.PresetSelectionState,
        (attributes) => {
            return attributes.filter((attribute) => {
                return attribute.type === capabilityToPresetType[capability];
            })[0];
        }
    );

    const {
        data: presets,
        isPending: presetsPending,
    } = usePresetSelectionsQuery(capability);

    const {
        mutate: selectPreset,
        isPending: selectPresetPending,
    } = usePresetSelectionMutation(capability);

    const filteredPresets = React.useMemo(() => {
        return sortPresets(
            presets?.filter(
                (x): x is Exclude<
                    PresetSelectionState["value"],
                    "custom"
                > => x !== "custom"
            ) ?? []
        );
    }, [presets]);

    const pending = presetsPending || selectPresetPending;

    const handleSelect = (
        value: Exclude<PresetSelectionState["value"], "custom">
    ) => {
        if (value !== preset?.value) {
            selectPreset(value);
            playX40ControlVoice(value, capability);
        }
    };

    return (
        <Box
            sx={{
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: 1,
                minHeight: 42,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: .55,
                    minWidth: 78,
                }}
            >
                <Box
                    sx={{
                        width: 23,
                        height: 23,
                        borderRadius: "7px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(70,130,190,.10)",
                    }}
                >
                    {getPresetIcon(
                        capability,
                        preset?.value ?? "medium",
                        true
                    )}
                </Box>

                <Typography
                    sx={{
                        color: "#8193aa",
                        fontSize: "0.64rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: ".05em",
                        whiteSpace: "nowrap",
                    }}
                >
                    {label}
                </Typography>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: .45,
                    flex: 1,
                    minWidth: 0,
                }}
            >
                {filteredPresets.map((value) => {
                    const selected = value === preset?.value;

                    return (
                        <Box
                            key={value}
                            onClick={() => {
                                if (!pending && value !== "custom") {
                                    handleSelect(value);
                                }
                            }}
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                height: 32,
                                px: .65,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: .35,
                                borderRadius: "7px",
                                border: selected ?
                                    "1px solid rgba(65,150,255,.70)" :
                                    "1px solid rgba(120,160,210,.10)",
                                background: selected ?
                                    "rgba(40,127,255,.22)" :
                                    "rgba(15,29,46,.30)",
                                color: selected ?
                                    "#fff" :
                                    "#8799ae",
                                cursor: pending ?
                                    "default" :
                                    "pointer",
                                opacity: pending ? .55 : 1,
                                transition: "all .15s ease",
                                "&:hover": {
                                    background: pending ?
                                        "rgba(15,29,46,.30)" :
                                        "rgba(40,127,255,.16)",
                                    borderColor: pending ?
                                        "rgba(120,160,210,.10)" :
                                        "rgba(65,150,255,.45)",
                                    color: pending ?
                                        "#8799ae" :
                                        "#fff",
                                },
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: "0.66rem",
                                    fontWeight: selected ? 750 : 600,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {presetFriendlyNames[value]}
                            </Typography>

                            {selected && (
                                <CheckIcon
                                    sx={{
                                        fontSize: 13,
                                        color: "#5bbcff",
                                        flexShrink: 0,
                                    }}
                                />
                            )}
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

export default CompactPresetControl;
