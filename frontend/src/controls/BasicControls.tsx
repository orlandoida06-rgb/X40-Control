import React from "react";
import {
    Box,
    Button,
    DialogContentText,
    Grid2,
    Paper,
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
    LocationOn as LocationIcon,
    SvgIconComponent,
} from "@mui/icons-material";
import ConfirmationDialog from "../components/ConfirmationDialog";
import {usePendingMapAction} from "../map/BaseMap";

const StartStates: StatusState["value"][] = [
    "idle",
    "docked",
    "paused",
    "error",
];

const PauseStates: StatusState["value"][] = [
    "cleaning",
    "returning",
    "moving",
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
        isPending: basicControlIsExecuting,
    } = useBasicControlMutation();

    const {hasPendingMapAction} = usePendingMapAction();

    const sendCommand = (command: BasicControlCommand) => {
        if (command === "start" && hasPendingMapAction) {
            setStartConfirmationDialogOpen(true);
            return;
        }

        executeBasicControlCommand(command);
    };

    if (statusPending || status === undefined) {
        return <></>;
    }

    const {flag, value: state} = status;

    const startEnabled = StartStates.includes(state);
    const pauseEnabled = PauseStates.includes(state);

    const homeEnabled =
        state === "idle" ||
        state === "error" ||
        state === "paused";

    const stopEnabled =
        flag === "resumable" ||
        (state !== "idle" && state !== "docked");

    const buttons: CommandButton[] = [
        {
            command: "start",
            enabled: startEnabled,
            label: "Iniciar",
            Icon: StartIcon,
        },
        {
            command: "pause",
            enabled: pauseEnabled,
            label: "Pausa",
            Icon: PauseIcon,
        },
        {
            command: "home",
            enabled: homeEnabled,
            label: "Volver a casa",
            Icon: HomeIcon,
        },
        {
            command: "stop",
            enabled: stopEnabled,
            label: "Estoy aquí",
            Icon: LocationIcon,
        },
    ];

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: "1px solid rgba(70,150,255,.16)",
                    background:
                        "linear-gradient(145deg, rgba(8,18,30,.96), rgba(14,27,43,.92))",
                    boxShadow: "0 12px 40px rgba(0,0,0,.28)",
                }}
            >
                <Box p={1.25}>
                    <Typography
                        sx={{
                            fontSize: 15,
                            fontWeight: 800,
                            letterSpacing: ".03em",
                            mb: 0.8,
                        }}
                    >
                        CONTROLES
                    </Typography>

                    <Grid2 container spacing={0.6}>
                        <Grid2 size={{xs: 6}}>
                            <Button
                                fullWidth
                                disabled={
                                    !startEnabled ||
                                    basicControlIsExecuting
                                }
                                onClick={() => sendCommand("start")}
                                startIcon={<StartIcon />}
                                sx={{
                                    minHeight: 48,
                                    borderRadius: "15px",
                                    textTransform: "none",
                                    fontSize: 0,
                                    fontWeight: 700,
                                    color: "#fff",
                                    border:
                                        "1px solid rgba(80,150,230,.20)",
                                    background:
                                        "linear-gradient(145deg, rgba(35,105,180,.30), rgba(20,60,105,.28))",
                                    boxShadow:
                                        "0 6px 20px rgba(0,80,160,.18)",
                                    "&:hover": {
                                        background:
                                            "linear-gradient(145deg, rgba(45,130,220,.42), rgba(25,75,125,.38))",
                                    },
                                    "&:active": {
                                        transform: "scale(.97)",
                                    },
                                    "& .MuiSvgIcon-root": {
                                        fontSize: "1.3rem",
                                    },
                                    "& .MuiButton-startIcon + *": {
                                        display: "none",
                                    },
                                    "&.Mui-disabled": {
                                        opacity: 0.42,
                                    },
                                }}
                            >
                                </Button>
                        </Grid2>

                        <Grid2 size={{xs: 6}}>
                            <Button
                                fullWidth
                                disabled={
                                    !pauseEnabled ||
                                    basicControlIsExecuting
                                }
                                onClick={() => sendCommand("pause")}
                                startIcon={<PauseIcon />}
                                sx={{
                                    minHeight: 48,
                                    borderRadius: "15px",
                                    textTransform: "none",
                                    fontSize: 0,
                                    fontWeight: 700,
                                    color: "#fff",
                                    border:
                                        "1px solid rgba(80,150,230,.20)",
                                    background:
                                        "linear-gradient(145deg, rgba(35,105,180,.30), rgba(20,60,105,.28))",
                                    "&:active": {
                                        transform: "scale(.97)",
                                    },
                                    "& .MuiSvgIcon-root": {
                                        fontSize: "1.3rem",
                                    },
                                    "& .MuiButton-startIcon + *": {
                                        display: "none",
                                    },
                                    "&.Mui-disabled": {
                                        opacity: 0.42,
                                    },
                                }}
                            >
                                </Button>
                        </Grid2>

                        <Grid2 size={{xs: 6}}>
                            <Button
                                fullWidth
                                disabled={
                                    !homeEnabled ||
                                    basicControlIsExecuting
                                }
                                onClick={() => sendCommand("home")}
                                startIcon={<HomeIcon />}
                                sx={{
                                    minHeight: 48,
                                    borderRadius: "15px",
                                    textTransform: "none",
                                    fontSize: 0,
                                    fontWeight: 700,
                                    color: "#fff",
                                    border:
                                        "1px solid rgba(80,150,230,.20)",
                                    background:
                                        "linear-gradient(145deg, rgba(35,105,180,.30), rgba(20,60,105,.28))",
                                    "&:active": {
                                        transform: "scale(.97)",
                                    },
                                    "& .MuiSvgIcon-root": {
                                        fontSize: "1.3rem",
                                    },
                                    "& .MuiButton-startIcon + *": {
                                        display: "none",
                                    },
                                    "&.Mui-disabled": {
                                        opacity: 0.42,
                                    },
                                }}
                            >
                                </Button>
                        </Grid2>

                        <Grid2 size={{xs: 6}}>
                            <Button
                                fullWidth
                                disabled={
                                    !stopEnabled ||
                                    basicControlIsExecuting
                                }
                                onClick={() => sendCommand("stop")}
                                startIcon={<LocationIcon />}
                                sx={{
                                    minHeight: 48,
                                    borderRadius: "15px",
                                    textTransform: "none",
                                    fontSize: 0,
                                    fontWeight: 700,
                                    color: "#fff",
                                    border:
                                        "1px solid rgba(80,150,230,.20)",
                                    background:
                                        "linear-gradient(145deg, rgba(35,105,180,.30), rgba(20,60,105,.28))",
                                    "&:active": {
                                        transform: "scale(.97)",
                                    },
                                    "& .MuiSvgIcon-root": {
                                        fontSize: "1.3rem",
                                    },
                                    "& .MuiButton-startIcon + *": {
                                        display: "none",
                                    },
                                    "&.Mui-disabled": {
                                        opacity: 0.42,
                                    },
                                }}
                            >
                                </Button>
                        </Grid2>
                    </Grid2>
                </Box>
            </Paper>

            <ConfirmationDialog
                title="¿Seguro que quieres iniciar una limpieza completa?"
                open={startConfirmationDialogOpen}
                onClose={() => {
                    setStartConfirmationDialogOpen(false);
                }}
                onAccept={() => {
                    setStartConfirmationDialogOpen(false);
                    executeBasicControlCommand("start");
                }}
            >
                <DialogContentText>
                    Actualmente tienes una acción de mapa pendiente.
                </DialogContentText>
            </ConfirmationDialog>
        </>
    );
};

export default BasicControls;
