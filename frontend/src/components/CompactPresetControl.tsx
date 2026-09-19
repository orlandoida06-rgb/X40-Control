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
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

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

    const currentPreset = preset?.value ?
        presetFriendlyNames[preset.value] :
        "—";

    const open = Boolean(anchorEl);
    const pending = presetsPending || selectPresetPending;

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = (
        value: Exclude<PresetSelectionState["value"], "custom">
    ) => {
        if (value !== preset?.value) {
            selectPreset(value);
        }

        handleClose();
    };

    return (
        <>
            <Box
                onClick={handleOpen}
                sx={{
                    minWidth: 0,
                    flex: 1,
                    height: 58,
                    px: 1.1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 0.7,
                    borderRadius: "14px",
                    background: "rgba(20,29,43,.62)",
                    border: "1px solid rgba(120,160,210,.14)",
                    cursor: "pointer",
                    transition: "all .18s ease",
                    "&:hover": {
                        background: "rgba(30,42,60,.82)",
                        borderColor: "rgba(120,160,210,.28)",
                    },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        minWidth: 0,
                        gap: 0.7,
                    }}
                >
                    <Box
                        sx={{
                            width: 28,
                            height: 28,
                            borderRadius: "9px",
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

                    <Box sx={{minWidth: 0}}>
                        <Typography
                            sx={{
                                color: "#8193aa",
                                fontSize: "0.63rem",
                                fontWeight: 700,
                                lineHeight: 1,
                                textTransform: "uppercase",
                                letterSpacing: ".05em",
                            }}
                        >
                            {label}
                        </Typography>

                        <Typography
                            sx={{
                                mt: .45,
                                color: pending ? "#8193aa" : "#e5edf7",
                                fontSize: "0.76rem",
                                fontWeight: 700,
                                lineHeight: 1,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 90,
                            }}
                        >
                            {pending ? "..." : currentPreset}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        mt: .7,
                        minWidth: 205,
                        borderRadius: "16px",
                        background: "rgba(18,27,40,.97)",
                        border: "1px solid rgba(120,160,210,.20)",
                        backdropFilter: "blur(18px)",
                        boxShadow: "0 18px 45px rgba(0,0,0,.42)",
                        p: .6,
                        "& .MuiMenuItem-root": {
                            minHeight: 48,
                            px: 1.2,
                            borderRadius: "11px",
                            mx: .2,
                            my: .2,
                            color: "#dce7f5",
                        },
                    },
                }}
            >
                {filteredPresets.map((value) => {
                    const presetValue =
                        value as Exclude<PresetSelectionState["value"], "custom">;

                    return (
                    <MenuItem
                        key={presetValue}
                        selected={presetValue === preset?.value}
                        onClick={() => handleSelect(presetValue)}
                    >
                        <Box
                            sx={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: 1.1,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: value === preset?.value ?
                                        "rgba(70,145,230,.16)" :
                                        "rgba(120,160,210,.06)",
                                }}
                            >
                                {getPresetIcon(
                                    capability,
                                    presetValue,
                                    presetValue === preset?.value
                                )}
                            </Box>

                            <Typography
                                sx={{
                                    flex: 1,
                                    fontSize: ".78rem",
                                    fontWeight:
                                        value === preset?.value ? 700 : 500,
                                }}
                            >
                                {presetFriendlyNames[value]}
                            </Typography>

                            {value === preset?.value && (
                                <CheckIcon
                                    sx={{
                                        fontSize: 17,
                                        color: "#19df8a",
                                    }}
                                />
                            )}
                        </Box>
                    </MenuItem>
                    );
                })}
            </Menu>
        </>
    );
};

export default CompactPresetControl;
