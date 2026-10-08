import React from "react";
import {playX40ControlVoice} from "./voice/X40ControlVoice";
import {Link} from "react-router-dom";
import {
    Box,
    Button,
    Divider,
    Paper,
    Typography,
} from "@mui/material";
import {
    Home as HomeIcon,
    Map as MapIcon,
    GridView as RoomsIcon,
    CropFree as ZonesIcon,
    AccessTime as ScheduleIcon,
    History as HistoryIcon,
    Settings as SettingsIcon,
    Sensors as DockIcon,
    Wifi as WifiIcon,
    NotificationsNone as NotificationsIcon,
    DarkMode as DarkModeIcon,
    Layers as LayersIcon,
    CenterFocusStrong as CenterIcon,
    PlayArrow as PlayIcon,
    Pause as PauseIcon,
    Stop as StopIcon,
    CleaningServices as CleaningIcon,
} from "@mui/icons-material";

import LiveMapPage from "./map/LiveMapPage";
import BasicControls from "./controls/BasicControls";
import Dock from "./controls/Dock";
import CompactPresetControl from "./components/CompactPresetControl";
import {useIsMobileView} from "./hooks";
import {
    Capability,
    RobotAttributeClass,
    useCurrentStatisticsQuery,
    usePresetSelectionMutation,
    useRobotAttributeQuery,
    useRobotStatusQuery,
} from "./api";
import {getHumanReadableStatValue} from "./utils";
import {useCapabilitiesSupported} from "./CapabilitiesProvider";

const glass = {
    background:
        "linear-gradient(145deg, rgba(13,25,42,.96), rgba(8,17,29,.94))",
    border: "1px solid rgba(110,155,215,.18)",
    boxShadow: "0 14px 45px rgba(0,0,0,.30)",
};

const navItems = [
    {icon: <HomeIcon />, label: "Inicio", route: "/"},
    {icon: <MapIcon />, label: "Mapa", route: "/options/map_management"},
    {
        icon: <RoomsIcon />,
        label: "Habitaciones",
        route: "/options/map_management/segments",
    },
    {
        icon: <ZonesIcon />,
        label: "Zonas",
        route: "/options/map_management/virtual_restrictions",
    },
    {
        icon: <ScheduleIcon />,
        label: "Programación",
        route: "/valetudo/timers",
    },
    {
        icon: <HistoryIcon />,
        label: "Historial",
        route: "/robot/total_statistics",
    },
    {
        icon: <DockIcon />,
        label: "Estación",
        route: "/robot/consumables",
    },
    {
        icon: <SettingsIcon />,
        label: "Ajustes",
        route: "/options/robot",
    },
];

const NavItem = ({
    icon,
    label,
    route,
    active = false,
}: {
    icon: React.ReactNode;
    label: string;
    route: string;
    active?: boolean;
}): React.ReactElement => (
    <Button
        component={Link}
        to={route}
        sx={{
            width: "100%",
            minHeight: 52,
            justifyContent: "flex-start",
            gap: 1.8,
            px: 2,
            borderRadius: "14px",
            color: active ? "#fff" : "#c9d5e6",
            textTransform: "none",
            fontSize: 16,
            fontWeight: active ? 750 : 500,
            background: active ?
                "linear-gradient(90deg, #287fff, #1c5fc8)" :
                "transparent",
            boxShadow: active ?
                "0 8px 25px rgba(35,125,255,.25)" :
                "none",
            "&:hover": {
                background: active ?
                    "linear-gradient(90deg, #287fff, #1c5fc8)" :
                    "rgba(50,100,160,.14)",
            },
            "& .MuiSvgIcon-root": {
                fontSize: 27,
            },
        }}
    >
        {icon}
        <span>{label}</span>
    </Button>
);

const StatBox = ({
    label,
    value,
    icon,
}: {
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
}): React.ReactElement => (
    <Box
        sx={{
            minWidth: 112,
            px: 2.1,
            borderLeft: "1px solid rgba(160,190,225,.16)",
        }}
    >
        {icon}
        <Typography
            sx={{
                color: "#aab9cd",
                fontSize: 12,
                mt: .5,
            }}
        >
            {label}
        </Typography>
        <Typography
            sx={{
                color: "#f3f7fc",
                fontSize: 20,
                fontWeight: 800,
                lineHeight: 1.1,
            }}
        >
            {value}
        </Typography>
    </Box>
);

const HomePage: React.FunctionComponent<{
    paletteMode: "light" | "dark",
    setPaletteMode: (newMode: "light" | "dark") => void
}> = ({
    paletteMode,
    setPaletteMode
}): React.ReactElement => {
    const [notificationsOpen, setNotificationsOpen] = React.useState(false);

    React.useEffect(() => {
        const handler = () => setNotificationsOpen((open) => !open);

        window.addEventListener("x40control-notifications", handler);

        return () => {
            window.removeEventListener("x40control-notifications", handler);
        };
    }, []);
    const mobile = useIsMobileView();

    const {data: status} = useRobotStatusQuery();
    const {data: currentStatistics} = useCurrentStatisticsQuery();
    const {data: batteries} = useRobotAttributeQuery(
        RobotAttributeClass.BatteryState
    );

    const [
        dockEmpty,
        dockClean,
        dockDry,
        operationModeControl,
        fanSpeedControl,
        waterUsageControl,
    ] = useCapabilitiesSupported(
        Capability.AutoEmptyDockManualTrigger,
        Capability.MopDockCleanManualTrigger,
        Capability.MopDockDryManualTrigger,
        Capability.OperationModeControl,
        Capability.FanSpeedControl,
        Capability.WaterUsageControl,
    );

    const {
        mutate: selectOperationMode,
        isPending: operationModePending,
    } = usePresetSelectionMutation(
        Capability.OperationModeControl
    );

    const {
        data: robotAttributes,
    } = useRobotAttributeQuery(
        RobotAttributeClass.PresetSelectionState
    );

    const currentOperationMode =
        robotAttributes?.find(
            attribute =>
                attribute.__class === RobotAttributeClass.PresetSelectionState &&
                attribute.type === "operation_mode"
        )?.value;

    const [clock, setClock] = React.useState(new Date());


    React.useEffect(() => {
        const timer = window.setInterval(
            () => setClock(new Date()),
            1000,
        );

        return () => window.clearInterval(timer);
    }, []);

    const statusText: Record<string, string> = {
        idle: "Preparado",
        docked: "En la base",
        cleaning: "En limpieza",
        paused: "Pausado",
        returning: "Volviendo a la base",
        moving: "Moviéndose",
        error: "Error",
    };

    const statusValue = status?.value ?? "idle";
    const currentStatus =
        statusText[statusValue] || statusValue;

    const isCleaning = statusValue === "cleaning";
    const isError = statusValue === "error";

    const statusColor = isError ?
        "#ff5361" :
        isCleaning ?
            "#26e58b" :
            "#58adff";

    const batteryLevel =
        batteries && batteries.length > 0 ?
            Math.round(batteries[0].level) :
            null;

    const timeStat = currentStatistics?.find(
        stat => stat.type === "time",
    );

    const areaStat = currentStatistics?.find(
        stat => stat.type === "area",
    );

    const cleaningTime = timeStat ?
        getHumanReadableStatValue(timeStat) :
        "—";

    const cleanedArea = areaStat ?
        getHumanReadableStatValue(areaStat) :
        "—";

    const dateText = clock.toLocaleDateString(
        "es-ES",
        {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
        },
    );

    const timeText = clock.toLocaleTimeString(
        "es-ES",
        {
            hour: "2-digit",
            minute: "2-digit",
        },
    );

    const dockAvailable =
        dockEmpty || dockClean || dockDry;

    if (mobile) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    background: "#07101b",
                    color: "#fff",
                    overflow: "auto",
                    p: 1,
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        ...glass,
                        borderRadius: "18px",
                        p: 1.3,
                        mb: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Box>
                        <Typography
                            sx={{
                                fontSize: 20,
                                fontWeight: 800,
                            }}
                        >
                            X40-Control
                        </Typography>
                        <Typography
                            sx={{
                                color: "#8ea1ba",
                                fontSize: 11,
                            }}
                        >
                            Dreame X40 Ultra
                        </Typography>
                    </Box>

                    <Typography
                        sx={{
                            color: statusColor,
                            fontWeight: 800,
                        }}
                    >
                        {batteryLevel !== null ?
                            `${batteryLevel}%` :
                            "—"}
                    </Typography>
                </Paper>

                <Paper
                    elevation={0}
                    sx={{
                        ...glass,
                        height: "58vh",
                        minHeight: 390,
                        borderRadius: "18px",
                        overflow: "hidden",
                        position: "relative",
                        mb: 1,
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            "& > *": {
                                width: "100% !important",
                                height: "100% !important",
                            },
                        }}
                    >
                        <LiveMapPage />
                    </Box>

                    <Box
                        sx={{
                            position: "absolute",
                            right: 10,
                            top: 10,
                            zIndex: 5,
                            display: "flex",
                            flexDirection: "column",
                            gap: .6,
                        }}
                    >
                        <Button
                            sx={{
                                minWidth: 42,
                                width: 42,
                                height: 42,
                                color: "#fff",
                                borderRadius: "13px",
                                background: "rgba(7,15,26,.8)",
                            }}
                        >
                            <LayersIcon />
                        </Button>

                        <Button
                            sx={{
                                minWidth: 42,
                                width: 42,
                                height: 42,
                                color: "#fff",
                                borderRadius: "13px",
                                background: "rgba(7,15,26,.8)",
                            }}
                        >
                            <CenterIcon />
                        </Button>
                    </Box>
                </Paper>

                <BasicControls />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                position: "relative",
                width: "100%",
                height: "100vh",
                    maxHeight: "100vh",
                    overflow: "hidden",
                background:
                    "radial-gradient(circle at 58% 40%, #142438 0%, #09121e 48%, #050b13 100%)",
                color: "#fff",
            }}
        >
            {/* ======================================================
                SIDEBAR
            ======================================================= */}

            <Box
                sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 260,
                    zIndex: 30,
                    px: 1.7,
                    py: 2.5,
                    background:
                        "linear-gradient(180deg, rgba(9,18,30,.98), rgba(6,13,22,.98))",
                    borderRight:
                        "1px solid rgba(110,150,200,.13)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Box
                    sx={{
                        px: 2.5,
                        pb: 2.7,
                        borderBottom:
                            "1px solid rgba(130,160,200,.10)",
                        mb: 1.8,
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 31,
                            fontWeight: 850,
                            letterSpacing: "-.04em",
                        }}
                    >
                        X40-Control
                    </Typography>

                    <Typography
                        sx={{
                            mt: .4,
                            color: "#a0b1c7",
                            fontSize: 15,
                        }}
                    >
                        Dreame X40 Ultra
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: .45,
                    }}
                >
                    {navItems.map((item, index) => (
                        <NavItem
                            key={item.label}
                            {...item}
                            active={index === 0}
                        />
                    ))}
                </Box>

        </Box>

            {/* ======================================================
                CONTENIDO PRINCIPAL
            ======================================================= */}

            <Box
                sx={{
                    position: "absolute",
                    left: 276,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    p: "24px 28px 22px",
                    display: "grid",
                    gridTemplateColumns:
                        "minmax(600px, 1fr) 318px",
                    gridTemplateRows:
                        "minmax(0, 1fr) 198px",
                    gap: "16px",
                }}
            >
                {/* CABECERA DERECHA */}

                <Box
                    sx={{
                        position: "absolute",
                        top: 18,
                        right: 28,
                        zIndex: 30,
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 1.5,
                    }}
                >
                    <Button
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent("x40control-notifications"));
                        }}
                        sx={{
                            minWidth: 52,
                            width: 52,
                            height: 52,
                            borderRadius: "50%",
                            color: "#dce7f5",
                            background:
                                "rgba(18,31,47,.85)",
                        }}
                    >
                        <NotificationsIcon />
                    </Button>

                    <Button
                        onClick={() =>
                            setPaletteMode(
                                paletteMode === "dark" ? "light" : "dark"
                            )
                        }
                        sx={{
                            minWidth: 52,
                            width: 52,
                            height: 52,
                            borderRadius: "50%",
                            color: "#dce7f5",
                            background:
                                "rgba(18,31,47,.85)",
                        }}
                    >
                        <DarkModeIcon />
                    </Button>

                    <Box
                        sx={{
                            ml: 1,
                            textAlign: "right",
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 23,
                                fontWeight: 800,
                            }}
                        >
                            {timeText}
                        </Typography>

                        <Typography
                            sx={{
                                color: "#9badc3",
                                fontSize: 12,
                            }}
                        >
                            {dateText}
                        </Typography>
                    </Box>
                </Box>

                {notificationsOpen && (
                    <Paper
                        elevation={0}
                        sx={{
                            position: "absolute",
                            top: 82,
                            right: 28,
                            width: 360,
                            zIndex: 50,
                            borderRadius: 3,
                            p: 2,
                            background:
                                "linear-gradient(145deg, rgba(13,25,42,.98), rgba(8,17,29,.98))",
                            border: "1px solid rgba(110,155,215,.22)",
                            boxShadow: "0 20px 55px rgba(0,0,0,.45)",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1.5,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 17,
                                    fontWeight: 800,
                                    color: "#f4f8ff",
                                }}
                            >
                                Avisos
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 11,
                                    color: "#71839a",
                                }}
                            >
                                X40-Control
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                p: 1.5,
                                borderRadius: 2,
                                background: "rgba(255,255,255,.035)",
                                border:
                                    "1px solid rgba(110,155,215,.10)",
                            }}
                        >
                            <Box
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    background: "#35a7ff",
                                    boxShadow:
                                        "0 0 12px rgba(53,167,255,.65)",
                                    flexShrink: 0,
                                }}
                            />

                            <Box>
                                  <Typography
                                      sx={{
                                          fontSize: 13,
                                          fontWeight: 700,
                                          color: "#e7eef8",
                                      }}
                                  >
                                      Sin avisos nuevos
                                  </Typography>

                                <Typography
                                    sx={{
                                        fontSize: 11,
                                        color: "#8294aa",
                                        mt: .25,
                                    }}
                                >
                                    El X40 funciona con normalidad
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                )}

                {/* MAPA */}

                <Paper
                    elevation={0}
                    sx={{
                        ...glass,
                        gridColumn: "1 / 2",
                        gridRow: "1 / 2",
                        minHeight: 0,
                        borderRadius: "17px",
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            background:
                                "radial-gradient(circle at 50% 50%, rgba(40,100,160,.13), transparent 70%)",
                        }}
                    />

                    <Box
                        sx={{
                            position: "absolute",
                            inset: 8,
                            zIndex: 2,
                            "& > *": {
                                width: "100% !important",
                                height: "100% !important",
                            },
                        }}
                    >
                        <LiveMapPage />
                    </Box>

                    <Box
                        sx={{
                            position: "absolute",
                            zIndex: 10,
                            right: 16,
                            top: 18,
                            display: "flex",
                            flexDirection: "column",
                            gap: .7,
                        }}
                    >

                    </Box>

                    <Box
                        sx={{
                            position: "absolute",
                            zIndex: 10,
                            left: 15,
                            bottom: 14,
                            px: 1.8,
                            py: 1.2,
                            borderRadius: "14px",
                            background:
                                "rgba(10,20,33,.91)",
                            border:
                                "1px solid rgba(110,155,215,.18)",
                        }}
                    >
                        <Typography
                            sx={{
                                fontWeight: 750,
                                fontSize: 13,
                            }}
                        >
                            Mapa actual
                        </Typography>

                        <Typography
                            sx={{
                                color: "#91a5bd",
                                fontSize: 11,
                            }}
                        >
                            Principal
                        </Typography>
                    </Box>
                </Paper>

                {/* ESTACIÓN + ROBOT */}

                <Box
                    sx={{
                        gridColumn: "2 / 3",
                        gridRow: "1 / 3",
                        minHeight: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        justifyContent: "flex-end",
                        gap: 1.6,
                        overflow: "visible",
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            ...glass,
                            borderRadius: "17px",
                            p: 1.7,
                            flex: "0 0 auto",
                            minHeight: 0,
                            height: "fit-content",
                            overflow: "hidden",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "flex-start",
                            }}
                        >
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: 13,
                                        fontWeight: 700,
                                        color: "#e7eef8",
                                    }}
                                >
                                    Estación de carga
                                </Typography>

                                <Box
                                    sx={{
                                        mt: 1.5,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: .7,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 11,
                                                height: 11,
                                                borderRadius: "50%",
                                                background: "#35e291",
                                            }}
                                        />
                                        <Typography
                                            sx={{
                                                color: "#39e49a",
                                                fontSize: 13,
                                            }}
                                        >
                                            Conectada
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 11,
                                                height: 11,
                                                borderRadius: "50%",
                                                border: "1px solid #8294ab",
                                            }}
                                        />
                                        <Typography
                                            sx={{
                                                color: "#a5b4c7",
                                                fontSize: 13,
                                            }}
                                        >
                                            Lista
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {dockAvailable && (
                            <Box
                                sx={{
                                    mt: 1,
                                    "& .MuiPaper-root": {
                                        background:
                                            "transparent !important",
                                        boxShadow: "none !important",
                                        border: "0 !important",
                                    },
                                }}
                            >
                                <Dock />
                            </Box>
                        )}

                        {!dockAvailable && (
                            <Box
                                sx={{
                                    mt: 2,
                                    p: 1.5,
                                    borderRadius: "14px",
                                    background:
                                        "rgba(50,90,130,.12)",
                                    color: "#9fb1c6",
                                }}
                            >
                                Estación preparada
                            </Box>
                        )}
                    </Paper>

                    
                </Box>

                {/* CONTROLES INFERIORES */}

                <Paper
                    elevation={0}
                    sx={{
                        ...glass,
                        gridColumn: "1 / 2",
                        gridRow: "2 / 3",
                        borderRadius: "17px",
                        p: 1.4,
                        display: "grid",
                        gridTemplateColumns:
                            "minmax(420px, 1fr) 150px",
                        gap: 1.2,
                        overflow: "visible",
                    }}
                >
                    <Box
                        sx={{
                            minWidth: 0,
                            display: "grid",
                            gridTemplateRows: "82px 68px",
                            gap: .7,
                        }}
                    >
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(4, 1fr)",
                                gap: .6,
                            }}
                        >
                            {[
                                {
                                    label: "Aspirar",
                                    mode: "vacuum" as const,
                                    icon: (
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#dce8f7",
                                            }}
                                        >
                                            <svg
                                                width="30"
                                                height="30"
                                                viewBox="0 0 30 30"
                                                fill="none"
                                            >
                                                <circle
                                                    cx="15"
                                                    cy="15"
                                                    r="3"
                                                    fill="currentColor"
                                                />
                                                <path
                                                    d="M15 3C18 7 18 10 15 13C12 10 12 7 15 3Z"
                                                    fill="currentColor"
                                                />
                                                <path
                                                    d="M27 15C23 18 20 18 17 15C20 12 23 12 27 15Z"
                                                    fill="currentColor"
                                                />
                                                <path
                                                    d="M15 27C12 23 12 20 15 17C18 20 18 23 15 27Z"
                                                    fill="currentColor"
                                                />
                                                <path
                                                    d="M3 15C7 12 10 12 13 15C10 18 7 18 3 15Z"
                                                    fill="currentColor"
                                                />
                                                <circle
                                                    cx="8"
                                                    cy="8"
                                                    r="1.5"
                                                    fill="currentColor"
                                                />
                                                <circle
                                                    cx="22"
                                                    cy="8"
                                                    r="1.5"
                                                    fill="currentColor"
                                                />
                                                <circle
                                                    cx="8"
                                                    cy="22"
                                                    r="1.5"
                                                    fill="currentColor"
                                                />
                                                <circle
                                                    cx="22"
                                                    cy="22"
                                                    r="1.5"
                                                    fill="currentColor"
                                                />
                                            </svg>
                                        </Box>
                                    ),
                                },
                                {
                                    label: "Fregar",
                                    mode: "mop" as const,
                                    icon: (
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <svg
                                                width="32"
                                                height="32"
                                                viewBox="0 0 32 32"
                                                fill="none"
                                            >
                                                <path
                                                    d="M16 3C16 3 8 12 8 18C8 23 11.5 27 16 27C20.5 27 24 23 24 18C24 12 16 3 16 3Z"
                                                    fill="#38bdf8"
                                                />
                                                <path
                                                    d="M10 20H22"
                                                    stroke="#e5f4ff"
                                                    strokeWidth="2.2"
                                                    strokeLinecap="round"
                                                />
                                                <path
                                                    d="M8 23H24"
                                                    stroke="#e5f4ff"
                                                    strokeWidth="2.2"
                                                    strokeLinecap="round"
                                                />
                                                <circle
                                                    cx="12"
                                                    cy="27.5"
                                                    r="1"
                                                    fill="#38bdf8"
                                                />
                                                <circle
                                                    cx="20"
                                                    cy="27.5"
                                                    r="1"
                                                    fill="#38bdf8"
                                                />
                                            </svg>
                                        </Box>
                                    ),
                                },
                                {
                                    label: "Aspirar + fregar",
                                    mode: "vacuum_and_mop" as const,
                                    icon: (
                                        <Box
                                            sx={{
                                                width: 42,
                                                height: 32,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <svg
                                                width="42"
                                                height="32"
                                                viewBox="0 0 42 32"
                                                fill="none"
                                            >
                                                <circle
                                                    cx="10"
                                                    cy="16"
                                                    r="3"
                                                    fill="#e5edf7"
                                                />
                                                <path
                                                    d="M10 4C13 8 13 11 10 13C7 11 7 8 10 4Z"
                                                    fill="#e5edf7"
                                                />
                                                <path
                                                    d="M10 28C7 24 7 21 10 19C13 21 13 24 10 28Z"
                                                    fill="#e5edf7"
                                                />
                                                <path
                                                    d="M2 16C6 13 9 13 11 16C9 19 6 19 2 16Z"
                                                    fill="#e5edf7"
                                                />
                                                <path
                                                    d="M18 16H25"
                                                    stroke="#7dd3fc"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                                <path
                                                    d="M29 4C29 4 22 12 22 18C22 22 25 25 29 25C33 25 36 22 36 18C36 12 29 4 29 4Z"
                                                    fill="#38bdf8"
                                                />
                                                <path
                                                    d="M24 21H34"
                                                    stroke="#e5f4ff"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </Box>
                                    ),
                                },
                                {
                                    label: "Aspirar y después fregar",
                                    mode: "vacuum_then_mop" as const,
                                    icon: (
                                        <Box
                                            sx={{
                                                width: 52,
                                                height: 32,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <svg
                                                width="52"
                                                height="32"
                                                viewBox="0 0 52 32"
                                                fill="none"
                                            >
                                                <circle
                                                    cx="8"
                                                    cy="16"
                                                    r="2.7"
                                                    fill="#e5edf7"
                                                />
                                                <path
                                                    d="M8 5C11 9 11 11 8 13C5 11 5 9 8 5Z"
                                                    fill="#e5edf7"
                                                />
                                                <path
                                                    d="M8 27C5 23 5 21 8 19C11 21 11 23 8 27Z"
                                                    fill="#e5edf7"
                                                />
                                                <path
                                                    d="M1 16C4 13 6 13 10 16C6 19 4 19 1 16Z"
                                                    fill="#e5edf7"
                                                />
                                                <path
                                                    d="M16 16H27"
                                                    stroke="#7dd3fc"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                                <path
                                                    d="M24 12L28 16L24 20"
                                                    stroke="#7dd3fc"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M38 5C38 5 32 12 32 17C32 21 34.5 24 38 24C41.5 24 44 21 44 17C44 12 38 5 38 5Z"
                                                    fill="#38bdf8"
                                                />
                                                <path
                                                    d="M34 20H42"
                                                    stroke="#e5f4ff"
                                                    strokeWidth="1.7"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </Box>
                                    ),
                                },
                            ].map((item) => (
                                <Button
                                    key={item.label}
                                    disabled={
                                        !operationModeControl ||
                                        operationModePending
                                    }
                                    onClick={() => {
                                        selectOperationMode(item.mode);
                                        playX40ControlVoice(
                                            item.mode,
                                            Capability.OperationModeControl
                                        );
                                    }}
                                    sx={{
                                        minHeight: 72,
                                        borderRadius: "14px",
                                        flexDirection: "column",
                                        gap: .35,
                                        textTransform: "none",
                                        fontSize: 12,
                                        fontWeight: 650,
                                        border: currentOperationMode === item.mode ?
                                            "1px solid rgba(55,150,255,.85)" :
                                            "1px solid rgba(100,145,200,.20)",
                                        background: currentOperationMode === item.mode ?
                                            "linear-gradient(145deg, rgba(36,127,255,.42), rgba(21,87,184,.34))" :
                                            "rgba(15,29,46,.64)",
                                        color: currentOperationMode === item.mode ?
                                            "#ffffff" :
                                            "#d2ddec",
                                        boxShadow: currentOperationMode === item.mode ?
                                            "0 0 18px rgba(36,127,255,.18), inset 0 0 18px rgba(36,127,255,.08)" :
                                            "none",
                                        transition: "all .18s ease",
                                        "&:hover": {
                                            background:
                                                "linear-gradient(145deg, rgba(36,127,255,.32), rgba(21,87,184,.28))",
                                            borderColor:
                                                "rgba(80,150,255,.40)",
                                            color: "#fff",
                                        },
                                        "&:active": {
                                            transform: "scale(.97)",
                                        },
                                        "&.Mui-disabled": {
                                            opacity: operationModePending ?
                                                .55 :
                                                .35,
                                        },
                                    }}
                                >
                                    {item.icon}
                                    {item.label}
                                </Button>
                            ))}
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: .15,
                                px: .8,
                                alignItems: "stretch",
                            }}
                        >
                            {fanSpeedControl && (
                                <CompactPresetControl
                                    capability={
                                        Capability.FanSpeedControl
                                    }
                                    label="Succión"
                                />
                            )}

                            {waterUsageControl && (
                                <CompactPresetControl
                                    capability={
                                        Capability.WaterUsageControl
                                    }
                                    label="Agua"
                                />
                            )}
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderLeft:
                                "1px solid rgba(130,165,210,.12)",
                        }}
                    >
                        <BasicControls />
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default HomePage;
