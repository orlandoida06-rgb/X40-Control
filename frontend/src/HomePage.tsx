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
    AccessTime as ScheduleIcon,
    History as HistoryIcon,
    Inventory2 as ConsumablesIcon,
    Settings as SettingsIcon,
    Wifi as WifiIcon,
    WaterDrop as WaterDropIcon,
    GridView as RoomsIcon,
    CropFree as ZonesIcon,
    MoreHoriz as MoreIcon,
} from "@mui/icons-material";

import LiveMapPage from "./map/LiveMapPage";
// UNUSED_REMOVED BasicControls from "./controls/BasicControls";
// UNUSED_REMOVED PresetSelectionControl from "./controls/PresetSelection";
// UNUSED_REMOVED RobotStatus from "./controls/RobotStatus";
import Dock from "./controls/Dock";
import CompactPresetControl from "./components/CompactPresetControl";
// UNUSED_REMOVED Attachments from "./controls/Attachments";
import {useIsMobileView} from "./hooks";
import {RobotAttributeClass, useCurrentStatisticsQuery, useRobotAttributeQuery, useRobotStatusQuery} from "./api";
import {getFriendlyStatName, getHumanReadableStatValue} from "./utils";
import {useCapabilitiesSupported} from "./CapabilitiesProvider";
import {Capability} from "./api";
import LanguageSelector from "./i18n/LanguageSelector";
import BatteryIndicator from "./components/BatteryIndicator";
import {useLanguage} from "./i18n";

const glass = {
    background: "linear-gradient(145deg, rgba(20,29,43,.96), rgba(10,17,27,.96))",
    border: "1px solid rgba(120,160,210,.16)",
    borderRadius: "20px",
    boxShadow: "0 12px 35px rgba(0,0,0,.28)",
};

const DashboardButton = ({
    icon,
    label,
    route,
}: {
    icon: React.ReactNode;
    label: string;
    route: string;
}) => (
    <Button
        component={Link}
        to={route}
        sx={{
            justifyContent: "flex-start",
            gap: 1.5,
            minHeight: 54,
            px: 2,
            borderRadius: "14px",
            color: "#9eb1ca",
            textTransform: "none",
            fontSize: "15px",
            "&:hover": {
                color: "#fff",
                background: "rgba(45,126,255,.16)",
            },
        }}
    >
        {icon}
        {label}
    </Button>
);

const HomePage = (): React.ReactElement => {
    const {t} = useLanguage();
    const mobile = useIsMobileView();
    const {data: status} = useRobotStatusQuery();
    const {data: currentStatistics} = useCurrentStatisticsQuery();
    const {data: batteries} = useRobotAttributeQuery(RobotAttributeClass.BatteryState);

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

    const statusText: Record<string, string> = {
        idle: "Listo",
        docked: "En la base",
        cleaning: "Limpiando",
        paused: "Pausado",
        returning: "Volviendo a la base",
        moving: "Moviéndose",
        error: "Error",
    };

    const currentStatus =
        status?.value ? statusText[status.value] || status.value : "Conectando...";

    const batteryLevel =
        batteries && batteries.length > 0 ?
            Math.round(batteries[0].level) :
            null;

    const timeStat =
        currentStatistics?.find(stat => stat.type === "time");

    const currentTime =
        timeStat ?
            getHumanReadableStatValue(timeStat) :
            "—";

    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100%",
                bgcolor: "#070d15",
                color: "#fff",
                overflowY: {xs: "auto", md: "visible"},
                overflowX: "hidden",
            }}
        >
            {/* HEADER */}
            <Box
                sx={{
                    height: 82,
                    px: {xs: 2, md: 3},
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    borderBottom: "1px solid rgba(130,160,200,.12)",
                    background: "linear-gradient(180deg,#0c1521,#09111b)",
                }}
            >
                <Box sx={{flex: 1}}>
                    <Typography
                        sx={{
                            fontSize: {xs: 23, md: 29},
                            fontWeight: 700,
                            letterSpacing: "-.8px",
                        }}
                    >
                        X40<span style={{color: "#3287ff"}}>-Control</span>
                    </Typography>

                    <Typography
                        sx={{
                            color: "#71849e",
                            fontSize: 13,
                        }}
                    >
                        Control total de tu Dreame
                    </Typography>
                </Box>

                {!mobile && (
                    <>
                        <Box sx={{textAlign: "center"}}>
                            <Typography sx={{fontSize: 20, fontWeight: 600}}>
                                Dreame X40 Ultra
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: .8,
                                    color: "#19df8a",
                                    fontSize: 13,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        bgcolor: "#19df8a",
                                        boxShadow: "0 0 10px #19df8a",
                                    }}
                                />
                                Conectado
                            </Box>
                        </Box>

                        <WifiIcon sx={{color: "#24d99a"}} />
                        <LanguageSelector />
                        <BatteryIndicator />

                    </>
                )}
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {xs: "1fr", md: "230px minmax(0,1fr) 390px"},
                    gap: 1.5,
                    height: {xs: "auto", md: "calc(100vh - 82px)"},
                    p: 1.5,
                }}
            >
                {/* SIDEBAR */}
                {!mobile && (
                    <Box
                        sx={{
                            ...glass,
                            p: 1.2,
                            display: "flex",
                            flexDirection: "column",
                            gap: .4,
                        }}
                    >
                        <DashboardButton icon={<HomeIcon/>} label={t("home")} route="/" />
                        <DashboardButton icon={<MapIcon/>} label={t("map")} route="/options/map_management" />
                        <DashboardButton icon={<RoomsIcon/>} label={t("rooms")} route="/options/map_management/segments" />
                        <DashboardButton icon={<ZonesIcon/>} label={t("zones")} route="/options/map_management/virtual_restrictions" />
                        <DashboardButton icon={<ScheduleIcon/>} label={t("schedules")} route="/valetudo/timers" />
                        <DashboardButton icon={<HistoryIcon/>} label={t("history")} route="/robot/total_statistics" />
                        <DashboardButton icon={<ConsumablesIcon/>} label={t("consumables")} route="/robot/consumables" />
                        <DashboardButton icon={<SettingsIcon/>} label={t("settings")} route="/options/robot" />

                        <Box sx={{flex: 1}} />

                        <Box
                            sx={{
                                p: 2,
                                textAlign: "center",
                                color: "#667a94",
                                fontSize: 12,
                            }}
                        >
                            X40 Ultra
                            <br />
                            <span style={{color: "#43546b"}}>
                                {t("poweredBy")}
                            </span>
                        </Box>
                    </Box>
                )}

                {/* MAPA */}
                <Box
                    sx={{
                        ...glass,
                        minHeight: mobile ? 520 : 0,
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            zIndex: 5,
                            top: 18,
                            left: 20,
                            pointerEvents: "none",
                        }}
                    >
                        <Typography sx={{fontSize: 22, fontWeight: 700}}>
                            Mapa de la casa
                        </Typography>

                        <Typography sx={{color: "#8093ad", fontSize: 14}}>
                            Planta principal
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            position: "absolute",
                            zIndex: 5,
                            top: 15,
                            right: 15,
                            display: "flex",
                            gap: 1,
                        }}
                    >
                        <Paper sx={{...glass, p: 1}}>
                            <Typography>⌕</Typography>
                        </Paper>
                        <Paper sx={{...glass, p: 1}}>
                            <Typography>⛶</Typography>
                        </Paper>
                    </Box>

                    <Box
                        sx={{
                            height: "100%",
                            width: "100%",
                            "& > *": {
                                height: "100% !important",
                            },
                        }}
                    >
                        <LiveMapPage />
                    </Box>
                </Box>

                {/* PANEL DERECHO */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        minWidth: 0,
                        minHeight: 0,
                        overflowY: {xs: "visible", md: "auto"},
                        overflowX: "hidden",
                        pr: 0.5,
                    }}
                >
                    {/* ESTADO */}
                    <Paper
                        sx={{
                            ...glass,
                            p: 1.5,
                            overflow: "hidden",
                            position: "relative",
                            flexShrink: 0,
                            minHeight: 0,
                            background:
                                "linear-gradient(145deg, rgba(8,18,30,.96), rgba(14,27,43,.92))",
                            border: "1px solid rgba(70,150,255,.16)",
                            boxShadow: "0 12px 40px rgba(0,0,0,.28)",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                px: 0.5,
                                mb: 1.2,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 17,
                                    fontWeight: 800,
                                    letterSpacing: ".03em",
                                }}
                            >
                                ESTADO ACTUAL
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                px: 0.5,
                                mb: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 9,
                                    height: 9,
                                    borderRadius: "50%",
                                    bgcolor:
                                        status?.value === "error" ?
                                            "#ff5c5c" :
                                            "#19df8a",
                                    boxShadow:
                                        status?.value === "error" ?
                                            "0 0 12px #ff5c5c" :
                                            "0 0 12px #19df8a",
                                }}
                            />

                            <Typography
                                sx={{
                                    color:
                                        status?.value === "error" ?
                                            "#ff6b6b" :
                                            "#19df8a",
                                    fontSize: 15,
                                    fontWeight: 700,
                                }}
                            >
                                {currentStatus}
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                height: 245,
                                borderRadius: 2.5,
                                overflow: "hidden",
                                background: "#07111d",
                                border: "1px solid rgba(120,160,210,.12)",
                            }}
                        >
                            <Box
                                component="img"
                                src="/x40-card.png"
                                alt="Dreame X40 Ultra"
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    display: "block",
                                    objectFit: "cover",
                                    objectPosition: "center",
                                }}
                            />
                        </Box>

                        <Box sx={{textAlign: "center", mt: 1}}>
                            <Typography
                                sx={{
                                    fontSize: 17,
                                    fontWeight: 800,
                                }}
                            >
                                Dreame X40 Ultra
                            </Typography>

                            <Typography
                                sx={{
                                    color: "#8196b2",
                                    fontSize: 12,
                                }}
                            >
                                {currentStatus === "Limpiando" ?
                                    "Limpiando la casa" :
                                    currentStatus}
                            </Typography>
                        </Box>

                        <Divider
                            sx={{
                                borderColor: "rgba(130,160,200,.12)",
                                my: 1.2,
                            }}
                        />

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(4, 1fr)",
                                gap: 0.5,
                            }}
                        >
                            <Box
                                sx={{
                                    minWidth: 0,
                                    display: "flex",
                                    justifyContent: "center",
                                    "& > div": {
                                        width: "100%",
                                    },
                                }}
                            >
                                {fanSpeedControl ? (
                                    <CompactPresetControl
                                        capability={Capability.FanSpeedControl}
                                        label="Succión"
                                    />
                                ) : (
                                    <Box sx={{textAlign: "center"}}>
                                        <Typography sx={{fontSize: 14, fontWeight: 800}}>
                                            —
                                        </Typography>
                                        <Typography sx={{color: "#8196b2", fontSize: 10}}>
                                            Succión
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            <Box
                                sx={{
                                    minWidth: 0,
                                    display: "flex",
                                    justifyContent: "center",
                                    "& > div": {
                                        width: "100%",
                                    },
                                }}
                            >
                                {waterUsageControl ? (
                                    <CompactPresetControl
                                        capability={Capability.WaterUsageControl}
                                        label="Agua"
                                    />
                                ) : (
                                    <Box sx={{textAlign: "center"}}>
                                        <Typography sx={{fontSize: 14, fontWeight: 800}}>
                                            —
                                        </Typography>
                                        <Typography sx={{color: "#8196b2", fontSize: 10}}>
                                            Agua
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            <Box sx={{textAlign: "center", minWidth: 0}}>
                                <Typography
                                    sx={{
                                        fontSize: 14,
                                        fontWeight: 800,
                                        color: "#19df8a",
                                    }}
                                >
                                    {batteryLevel !== null ?
                                        `${batteryLevel}%` :
                                        "—"}
                                </Typography>

                                <Typography
                                    sx={{
                                        color: "#8196b2",
                                        fontSize: 10,
                                        mt: .25,
                                    }}
                                >
                                    Batería
                                </Typography>
                            </Box>

                            <Box sx={{textAlign: "center", minWidth: 0}}>
                                <Typography
                                    sx={{
                                        fontSize: 14,
                                        fontWeight: 800,
                                        color: "#dce7f5",
                                    }}
                                >
                                    {currentTime}
                                </Typography>

                                <Typography
                                    sx={{
                                        color: "#8196b2",
                                        fontSize: 10,
                                        mt: .25,
                                    }}
                                >
                                    Tiempo
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    {/* BASE */}
                    {(dockEmpty || dockClean || dockDry) && (
                        <Paper
                            sx={{
                                ...glass,
                                p: 2,
                                overflow: "hidden",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    mb: 1,
                                }}
                            >
                                Estación de vaciado y limpieza
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 9,
                                        height: 9,
                                        borderRadius: "50%",
                                        bgcolor: "#19df8a",
                                        boxShadow: "0 0 10px #19df8a",
                                    }}
                                />

                                <Typography sx={{color: "#19df8a"}}>
                                    Lista
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    mb: 1.5,
                                    borderRadius: "18px",
                                    overflow: "hidden",
                                    background:
                                        "linear-gradient(180deg, rgba(255,255,255,.035), rgba(255,255,255,.01))",
                                    border: "1px solid rgba(120,160,210,.10)",
                                }}
                            >
                                <Box
                                    component="img"
                                    src="/estaccion.png"
                                    alt="Estación de vaciado y limpieza"
                                    sx={{
                                        display: "block",
                                        width: "100%",
                                        maxWidth: 420,
                                        height: 210,
                                        objectFit: "contain",
                                    }}
                                />
                            </Box>

                            <Dock />
                        </Paper>
                    )}


                </Box>
            </Box>
        </Box>
    );
};

export default HomePage;
