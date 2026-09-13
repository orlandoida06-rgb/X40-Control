import {
    Box,
    Button,
    ButtonGroup,
    DialogContentText,
    Grid2,
    Paper,
    Skeleton,
    Typography,
} from "@mui/material";
import {
    BasicControlCommand,
    StatusState,
    useBasicControlMutation,
    useRobotStatusQuery,
} from "../api";
import {
    Home as HomeIcon,
    Pause as PauseIcon,
    PlayArrow as StartIcon,
    Stop as StopIcon,
    SvgIconComponent,
} from "@mui/icons-material";
import React from "react";
import ConfirmationDialog from "../components/ConfirmationDialog";
import {usePendingMapAction} from "../map/BaseMap";
import {useValetudoColorsInverse} from "../hooks/useValetudoColors";

const StartStates: StatusState["value"][] = [
    "idle",
    "docked",
    "paused",
    "error"
];

const PauseStates: StatusState["value"][] = [
    "cleaning",
    "returning",
    "moving"
];

interface CommandButton {
    command: BasicControlCommand;
    enabled: boolean;
    label: string;
    Icon: SvgIconComponent;
}

const BasicControls = (): React.ReactElement => {
    const [startConfirmationDialogOpen, setStartConfirmationDialogOpen] =
        React.useState(false);

    const {data: status, isPending: statusPending} =
        useRobotStatusQuery();

    const {
        mutate: executeBasicControlCommand,
        isPending: basicControlIsExecuting
    } = useBasicControlMutation();

    const {
        hasPendingMapAction
    } = usePendingMapAction();

    const palette = useValetudoColorsInverse();

    const isPending = basicControlIsExecuting;

    const sendCommand = (command: BasicControlCommand) => {
        if (command === "start" && hasPendingMapAction) {
            setStartConfirmationDialogOpen(true);
        } else {
            executeBasicControlCommand(command);
        }
    };

    if (statusPending) {
        return (
            <Grid2>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: "18px",
                        border: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Box p={1.5}>
                        <Skeleton height="5rem" />
                    </Box>
                </Paper>
            </Grid2>
        );
    }

    if (status === undefined) {
        return (
            <Grid2>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: "18px",
                        border: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Box p={1.5}>
                        <Typography color="error">
                            Error loading basic controls
                        </Typography>
                    </Box>
                </Paper>
            </Grid2>
        );
    }

    const {flag, value: state} = status;

    const buttons: CommandButton[] = [
        {
            command: "start",
            enabled: StartStates.includes(state),
            label: flag === "resumable" ? "Resume" : "Start",
            Icon: StartIcon,
        },
        {
            command: "pause",
            enabled: PauseStates.includes(state),
            label: "Pause",
            Icon: PauseIcon,
        },
        {
            command: "stop",
            enabled:
                flag === "resumable" ||
                (state !== "idle" && state !== "docked"),
            label: "Stop",
            Icon: StopIcon,
        },
        {
            command: "home",
            enabled:
                state === "idle" ||
                state === "error" ||
                state === "paused",
            label: "Dock",
            Icon: HomeIcon,
        },
    ];

    const startButton = buttons[0];
    const secondaryButtons = buttons.slice(1);

    return (
        <>
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
                                "linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))" :
                                theme.palette.background.paper,
                        boxShadow: (theme) =>
                            theme.palette.mode === "dark" ?
                                "0 10px 35px rgba(0,0,0,0.25)" :
                                "0 5px 20px rgba(0,0,0,0.07)",
                    }}
                >
                    <Box p={1.5}>
                        <Grid2 container direction="column" spacing={1}>
                            <Grid2>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    disabled={!startButton.enabled || isPending}
                                    onClick={() => sendCommand(startButton.command)}
                                    startIcon={<startButton.Icon />}
                                    sx={{
                                        minHeight: "68px",
                                        borderRadius: "16px",
                                        textTransform: "none",
                                        fontSize: "1rem",
                                        fontWeight: 700,
                                        letterSpacing: "0.03em",
                                        boxShadow: "none",
                                        backgroundColor: startButton.enabled ?
                                            palette.green :
                                            undefined,
                                        color: "#fff",

                                        "&:hover": {
                                            backgroundColor: startButton.enabled ?
                                                palette.green :
                                                undefined,
                                            filter: "brightness(1.08)",
                                            boxShadow: `0 8px 24px ${palette.green}33`,
                                        },

                                        "&:active": {
                                            transform: "scale(0.98)",
                                        },

                                        "& .MuiSvgIcon-root": {
                                            fontSize: "1.8rem",
                                        },

                                        "&.Mui-disabled": {
                                            opacity: 0.35,
                                        },
                                    }}
                                >
                                    {startButton.label}
                                </Button>
                            </Grid2>

                            <Grid2>
                                <ButtonGroup
                                    fullWidth
                                    variant="outlined"
                                    sx={{
                                        gap: 1,

                                        "& .MuiButtonGroup-grouped": {
                                            borderRadius: "14px !important",
                                            border: "1px solid !important",
                                            borderColor: "divider !important",
                                            minHeight: "58px",
                                            marginLeft: "0 !important",
                                            transition:
                                                "transform 120ms ease, background 180ms ease",
                                        },
                                    }}
                                >
                                    {secondaryButtons.map(
                                        ({label, command, enabled, Icon}) => (
                                            <Button
                                                key={command}
                                                disabled={!enabled || isPending}
                                                onClick={() => sendCommand(command)}
                                                color="inherit"
                                                aria-label={label}
                                                sx={{
                                                    flex: 1,
                                                    minWidth: 0,
                                                    color: enabled ?
                                                        "text.primary" :
                                                        "text.disabled",

                                                    "&:hover": {
                                                        backgroundColor:
                                                            "action.hover",
                                                    },

                                                    "&:active": {
                                                        transform: "scale(0.95)",
                                                    },

                                                    "& .MuiSvgIcon-root": {
                                                        fontSize: "1.55rem",
                                                    },

                                                    "&.Mui-disabled": {
                                                        opacity: 0.3,
                                                    },
                                                }}
                                            >
                                                <Icon />
                                            </Button>
                                        )
                                    )}
                                </ButtonGroup>
                            </Grid2>
                        </Grid2>
                    </Box>
                </Paper>
            </Grid2>

            <ConfirmationDialog
                title="Are you sure you want to start a full cleanup?"
                open={startConfirmationDialogOpen}
                onClose={() => {
                    setStartConfirmationDialogOpen(false);
                }}
                onAccept={() => {
                    executeBasicControlCommand("start");
                }}
            >
                <DialogContentText>
                    You currently have a pending MapAction.
                    <br/>
                    <br/>
                    <strong>Hint:</strong>
                    <br/>
                    You might instead be looking for the button on the
                    bottom right of the map.
                </DialogContentText>
            </ConfirmationDialog>
        </>
    );
};

export default BasicControls;
