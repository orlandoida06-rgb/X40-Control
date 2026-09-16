import {
    Box,
    Grid2,
    Paper,
    Skeleton,
    Slider,
    sliderClasses,
    styled,
    Typography,
} from "@mui/material";
import React from "react";
import {
    Capability,
    capabilityToPresetType,
    PresetSelectionState,
    RobotAttributeClass,
    usePresetSelectionMutation,
    usePresetSelectionsQuery,
    useRobotAttributeQuery,
} from "../api";
import {
    ExpandLess as CloseIcon,
    ExpandMore as OpenIcon,
} from "@mui/icons-material";
import LoadingFade from "../components/LoadingFade";
import {useCommittingSlider} from "../hooks/useCommittingSlider";
import {
    getPresetIconOrLabel,
    presetFriendlyNames,
    sortPresets,
} from "../presetUtils";
import {Mark} from "@mui/material/Slider/useSlider.types";

const DiscreteSlider = styled(Slider)(({theme}) => ({
    paddingTop: theme.spacing(1.25),
    paddingBottom: theme.spacing(1),

    [`& .${sliderClasses.track}`]: {
        height: 5,
        borderRadius: 99,
    },

    [`& .${sliderClasses.rail}`]: {
        height: 5,
        opacity: 0.25,
        borderRadius: 99,
    },

    [`& .${sliderClasses.thumb}`]: {
        width: 18,
        height: 18,
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        transition: "transform 120ms ease",
    },

    [`& .${sliderClasses.thumb}:hover`]: {
        boxShadow: "0 3px 12px rgba(0,0,0,0.35)",
    },

    [`& .${sliderClasses.thumb}:active`]: {
        transform: "scale(1.12)",
    },

    [`& .${sliderClasses.mark}`]: {
        width: 3,
        height: 8,
        borderRadius: 99,
        marginTop: -2,
    },

    [`& .${sliderClasses.markActive}`]: {
        opacity: 1,
        backgroundColor: "currentColor",
    },

    [`& .${sliderClasses.markLabel}`]: {
        fontSize: "0.62rem",
        opacity: 0.75,
        transform: "translateX(-50%)",
        whiteSpace: "nowrap",
        lineHeight: 1.1,
    },
}));

export interface PresetSelectionProps {
    capability:
        | Capability.FanSpeedControl
        | Capability.WaterUsageControl
        | Capability.OperationModeControl;
    label: string;
    icon: React.ReactElement;
}

const PresetSelectionControl = (
    props: PresetSelectionProps
): React.ReactElement => {
    const [
        presetSelectionSliderOpen,
        setPresetSelectionSliderOpen
    ] = React.useState(false);

    const {capability, label, icon} = props;

    const {data: preset} = useRobotAttributeQuery(
        RobotAttributeClass.PresetSelectionState,
        (attributes) => {
            return attributes.filter((attribute) => {
                return attribute.type === capabilityToPresetType[capability];
            })[0];
        }
    );

    const {
        isPending: presetsPending,
        isError: presetLoadError,
        data: presets,
    } = usePresetSelectionsQuery(capability);

    const {
        mutate: selectPreset,
        isPending: selectPresetIsPending
    } = usePresetSelectionMutation(capability);

    const filteredPresets = React.useMemo(() => {
        return sortPresets(
            presets?.filter(
                (x): x is Exclude<
                    PresetSelectionState["value"],
                    "custom"
                > => {
                    return x !== "custom";
                }
            ) ?? []
        );
    }, [presets]);

    const presetSliderValue = filteredPresets.indexOf(
        preset?.value || filteredPresets[0]
    );

    const [
        sliderValue,
        onChange,
        onCommit,
        sliderPending
    ] = useCommittingSlider(
        presetSliderValue !== -1 ? presetSliderValue : 0,
        (value) => {
            const level = filteredPresets[value];

            if (level !== preset?.value) {
                selectPreset(level);
            }
        },
        5_000
    );

    const marks = React.useMemo<Mark[]>(() => {
        return filteredPresets.map((preset, index) => {
            return {
                value: index,
                label: getPresetIconOrLabel(
                    props.capability,
                    preset,
                    {
                        height: "20px",
                        width: "auto"
                    }
                )
            };
        });
    }, [filteredPresets, props.capability]);

    const pending = selectPresetIsPending || sliderPending;

    const body = React.useMemo(() => {
        if (presetsPending) {
            return (
                <Grid2>
                    <Skeleton height="3rem"/>
                </Grid2>
            );
        }

        if (presetLoadError || preset === undefined) {
            return (
                <Grid2>
                    <Typography color="error">
                        Error loading {capability}
                    </Typography>
                </Grid2>
            );
        }

        return (
            <Box px={1}>
                <DiscreteSlider
                    aria-labelledby={`${capability}-slider-label`}
                    step={null}
                    value={sliderValue}
                    valueLabelDisplay="off"
                    onChange={onChange}
                    onChangeCommitted={onCommit}
                    min={0}
                    max={marks.length - 1}
                    marks={marks}
                    track={
                        capability !== Capability.OperationModeControl ?
                            "normal" :
                            false
                    }
                />
            </Box>
        );
    }, [
        capability,
        onChange,
        onCommit,
        preset,
        presetLoadError,
        presetsPending,
        marks,
        sliderValue,
    ]);

    const currentPreset = preset?.value ?
        presetFriendlyNames[preset.value] :
        "";

    return (
        <Grid2>
            <Paper
                elevation={0}
                sx={{
                    borderRadius: "18px",
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    background: (theme) =>
                        theme.palette.mode === "dark" ?
                            "rgba(255,255,255,0.035)" :
                            theme.palette.background.paper,
                    boxShadow: (theme) =>
                        theme.palette.mode === "dark" ?
                            "0 8px 30px rgba(0,0,0,0.20)" :
                            "0 4px 18px rgba(0,0,0,0.05)",
                }}
            >
                <Box
                    sx={{
                        px: 1.5,
                        py: 1,
                    }}
                >
                    <Grid2
                        container
                        alignItems="center"
                        spacing={1.25}
                        onClick={() => {
                            setPresetSelectionSliderOpen(
                                !presetSelectionSliderOpen
                            );
                        }}
                        sx={{
                            cursor: "pointer",
                            minHeight: "30px",
                            width: "100%",
                        }}
                    >
                        <Grid2
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                opacity: 0.8,
                            }}
                        >
                            {icon}
                        </Grid2>

                        <Grid2>
                            <Typography
                                variant="subtitle1"
                                id={`${capability}-slider-label`}
                                sx={{
                                    fontWeight: 600,
                                    lineHeight: 1.2,
                                }}
                            >
                                {label}
                            </Typography>
                        </Grid2>

                        <Grid2>
                            <LoadingFade
                                in={pending}
                                transitionDelay={
                                    pending ? "500ms" : "0ms"
                                }
                                size={18}
                            />
                        </Grid2>

                        <Grid2 sx={{marginLeft: "auto"}}>
                            <Grid2
                                container
                                alignItems="center"
                                spacing={0.75}
                            >
                                {!pending && currentPreset && (
                                    <Grid2>
                                        <Typography
                                            sx={{
                                                fontSize: "0.68rem",
                                                fontWeight: 700,
                                                letterSpacing: "0.025em",
                                                opacity: 0.8,
                                                textTransform: "uppercase",
                                                lineHeight: 1.15,
                                                maxWidth: "150px",
                                                textAlign: "right",
                                            }}
                                        >
                                            {currentPreset}
                                        </Typography>
                                    </Grid2>
                                )}

                                <Grid2
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        opacity: 0.65,
                                    }}
                                >
                                    {presetSelectionSliderOpen ?
                                        <CloseIcon fontSize="small"/> :
                                        <OpenIcon fontSize="small"/>
                                    }
                                </Grid2>
                            </Grid2>
                        </Grid2>
                    </Grid2>

                    <Box
                        sx={{
                            display: presetSelectionSliderOpen ?
                                "block" :
                                "none",
                            pt: 0.5,
                            px: 0.5,
                        }}
                    >
                        {body}
                    </Box>
                </Box>
            </Paper>
        </Grid2>
    );
};

export default PresetSelectionControl;
