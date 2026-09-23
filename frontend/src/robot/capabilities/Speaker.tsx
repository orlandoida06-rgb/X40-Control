import React, {FunctionComponent} from "react";
import {
    Box,
    Button,
    Paper,
    Slider,
    Stack,
    Typography
} from "@mui/material";
import {
    VolumeDown as VolumeDownIcon,
    VolumeUp as VolumeUpIcon,
    PlayArrow as PlayArrowIcon
} from "@mui/icons-material";
import {
    Capability,
    useSpeakerTestTriggerTriggerMutation,
    useSpeakerVolumeMutation,
    useSpeakerVolumeStateQuery
} from "../../api";
import {useCapabilitiesSupported} from "../../CapabilitiesProvider";
import {useCommittingSlider} from "../../hooks/useCommittingSlider";
import {CapabilityItem} from "./CapabilityLayout";

const SpeakerControl: FunctionComponent = () => {
    const {
        data: speakerVolume,
        isFetching: speakerVolumeLoading,
        isError: speakerVolumeError
    } = useSpeakerVolumeStateQuery();

    const {
        mutate: changeSpeakerVolume,
        isPending: speakerVolumeChanging
    } = useSpeakerVolumeMutation();

    const {
        mutate: testSpeaker,
        isPending: speakerTesting
    } = useSpeakerTestTriggerTriggerMutation();

    const [
        sliderValue,
        onChange,
        onCommit
    ] = useCommittingSlider(
        speakerVolume?.volume || 0,
        changeSpeakerVolume,
        5_000
    );

    const speakerVolumeContent = React.useMemo(() => {
        if (speakerVolumeError) {
            return (
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "error.main"
                    }}
                >
                    <Typography color="error">
                        Error al cargar el estado del altavoz.
                    </Typography>
                </Paper>
            );
        }

        const volume = Math.round(sliderValue);

        return (
            <Stack spacing={2}>
                <Paper
                    elevation={0}
                    sx={{
                        p: {xs: 2, sm: 2.5},
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "action.hover"
                    }}
                >
                    <Stack spacing={1.5}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                            >
                                <VolumeUpIcon color="primary" />

                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{fontWeight: 700}}
                                    >
                                        Volumen
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Ajusta el volumen del robot
                                    </Typography>
                                </Box>
                            </Stack>

                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 800,
                                    minWidth: 58,
                                    textAlign: "right"
                                }}
                            >
                                {volume}%
                            </Typography>
                        </Stack>

                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                        >
                            <VolumeDownIcon
                                fontSize="small"
                                color="action"
                            />

                            <Slider
                                min={0}
                                max={100}
                                value={sliderValue}
                                disabled={
                                    speakerVolumeLoading ||
                                    speakerVolumeChanging
                                }
                                onChange={onChange}
                                onChangeCommitted={onCommit}
                                valueLabelDisplay="auto"
                                sx={{
                                    flex: 1,
                                    "& .MuiSlider-thumb": {
                                        width: 20,
                                        height: 20
                                    },
                                    "& .MuiSlider-rail": {
                                        opacity: 0.3
                                    }
                                }}
                            />

                            <VolumeUpIcon
                                fontSize="small"
                                color="action"
                            />
                        </Stack>
                    </Stack>
                </Paper>

                <Button
                    fullWidth
                    size="large"
                    variant="outlined"
                    color="primary"
                    loading={speakerTesting}
                    loadingPosition="center"
                    startIcon={
                        !speakerTesting ? (
                            <PlayArrowIcon />
                        ) : undefined
                    }
                    onClick={() => {
                        return testSpeaker();
                    }}
                    sx={{
                        py: 1.35,
                        borderRadius: 2.5,
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "0.98rem"
                    }}
                >
                    Probar sonido
                </Button>
            </Stack>
        );
    }, [
        onChange,
        onCommit,
        sliderValue,
        speakerTesting,
        speakerVolumeChanging,
        speakerVolumeError,
        speakerVolumeLoading,
        testSpeaker
    ]);

    const loading =
        speakerVolumeChanging ||
        speakerVolumeLoading ||
        !speakerVolume;

    return (
        <CapabilityItem
            title="Altavoz"
            loading={loading}
        >
            {speakerVolumeContent}
        </CapabilityItem>
    );
};

const Speaker: FunctionComponent = () => {
    const [
        speakerVolumeControl,
        speakerTest
    ] = useCapabilitiesSupported(
        Capability.SpeakerVolumeControl,
        Capability.SpeakerTest
    );

    if (!speakerVolumeControl || !speakerTest) {
        return null;
    }

    return <SpeakerControl />;
};

export default Speaker;
