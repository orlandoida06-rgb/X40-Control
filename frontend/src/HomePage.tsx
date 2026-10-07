import React from "react";
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

const HomePage = (): React.ReactElement => {
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
                                        fontSize: 20,
                                        fontWeight: 800,
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
                            gridTemplateRows: "40px 68px 1fr",
                            gap: .7,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                gap: .4,
                                p: .4,
                                borderRadius: "13px",
                                background:
                                    "rgba(3,10,18,.48)",
                            }}
                        >
                            {[
                                "Limpieza rápida",
                                "Habitaciones",
                                "Zona",
                                "Personalizada",
                            ].map((item, index) => (
                                <Button
                                    key={item}
                                    sx={{
                                        flex: 1,
                                        minHeight: 39,
                                        borderRadius: "10px",
                                        color:
                                            index === 0 ?
                                                "#fff" :
                                                "#c5d2e2",
                                        textTransform: "none",
                                        fontWeight:
                                            index === 0 ?
                                                750 :
                                                500,
                                        background:
                                            index === 0 ?
                                                "linear-gradient(90deg,#287fff,#1964cf)" :
                                                "transparent",
                                        boxShadow:
                                            index === 0 ?
                                                "0 5px 18px rgba(35,125,255,.22)" :
                                                "none",
                                    }}
                                >
                                    {item}
                                </Button>
                            ))}
                        </Box>

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
                                    icon: <CleaningIcon />,
                                },
                                {
                                    label: "Fregar",
                                    icon: <Box
                                        component="span"
                                        sx={{fontSize: 25}}
                                    >
                                        ◇
                                    </Box>,
                                },
                                {
                                    label: "Aspirar + fregar",
                                    icon: <CleaningIcon />,
                                },
                                {
                                    label: "Solo habitaciones",
                                    icon: <RoomsIcon />,
                                },
                            ].map((item, index) => (
                                <Button
                                    key={item.label}
                                    sx={{
                                        minHeight: 72,
                                        borderRadius: "14px",
                                        flexDirection: "column",
                                        gap: .35,
                                        color:
                                            index === 2 ?
                                                "#fff" :
                                                "#d2ddec",
                                        textTransform: "none",
                                        fontSize: 12,
                                        fontWeight: 650,
                                        border:
                                            "1px solid rgba(100,145,200,.20)",
                                        background:
                                            index === 2 ?
                                                "linear-gradient(145deg,#247fff,#1557b8)" :
                                                "rgba(15,29,46,.64)",
                                        boxShadow:
                                            index === 2 ?
                                                "0 6px 24px rgba(25,120,255,.25)" :
                                                "none",
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
                                gap: .6,
                                "& > *": {
                                    flex: 1,
                                },
                                "& .MuiPaper-root": {
                                    background:
                                        "rgba(8,18,30,.35) !important",
                                    boxShadow: "none !important",
                                },
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

                            {operationModeControl && (
                                <CompactPresetControl
                                    capability={
                                        Capability.OperationModeControl
                                    }
                                    label="Modo"
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
