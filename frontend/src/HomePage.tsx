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
    Bed as BedIcon,
    Kitchen as KitchenIcon,
    AccessTime as ScheduleIcon,
    History as HistoryIcon,
    Inventory2 as ConsumablesIcon,
    Settings as SettingsIcon,
    PlayArrow as PlayIcon,
    Pause as PauseIcon,
    PowerSettingsNew as PowerIcon,
    Wifi as WifiIcon,
    CleaningServices as CleaningIcon,
    GridView as RoomsIcon,
    CropFree as ZonesIcon,
    MoreHoriz as MoreIcon,
} from "@mui/icons-material";

import LiveMapPage from "./map/LiveMapPage";
import BasicControls from "./controls/BasicControls";
import RobotStatus from "./controls/RobotStatus";
import Dock from "./controls/Dock";
import CurrentStatistics from "./controls/CurrentStatistics";
import Attachments from "./controls/Attachments";
import {useIsMobileView} from "./hooks";
import {useRobotStatusQuery} from "./api";
import {useCapabilitiesSupported} from "./CapabilitiesProvider";
import {Capability} from "./api";
import LanguageSelector from "./i18n/LanguageSelector";
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

    const [
        dockEmpty,
        dockClean,
        dockDry,
        statistics,
    ] = useCapabilitiesSupported(
        Capability.AutoEmptyDockManualTrigger,
        Capability.MopDockCleanManualTrigger,
        Capability.MopDockDryManualTrigger,
        Capability.CurrentStatistics,
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

    return (
        <Box
            sx={{
                minHeight: "100%",
                width: "100%",
                bgcolor: "#070d15",
                color: "#fff",
                overflow: "hidden",
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
                        overflowY: "auto",
                    }}
                >
                    {/* ESTADO */}
                    <Paper sx={{...glass, p: 2.2}}>
                        <Typography sx={{fontSize: 19, fontWeight: 700, mb: 1.5}}>
                            Estado actual
                        </Typography>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                mb: 2,
                            }}
                        >
                            <CleaningIcon
                                sx={{
                                    fontSize: 35,
                                    color: "#3287ff",
                                }}
                            />

                            <Box>
                                <Typography sx={{fontSize: 22, fontWeight: 600}}>
                                    {currentStatus}
                                </Typography>
                                <Typography sx={{color: "#7589a3", fontSize: 13}}>
                                    Dreame X40 Ultra
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{borderColor: "rgba(130,160,200,.12)", mb: 2}} />

                        <Box sx={{display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1}}>
                            <Box sx={{...glass, p: 1.5, textAlign: "center"}}>
                                <Typography sx={{fontSize: 22, fontWeight: 700}}>
                                    X40
                                </Typography>
                                <Typography sx={{fontSize: 11, color: "#7589a3"}}>
                                    Modelo
                                </Typography>
                            </Box>

                            <Box sx={{...glass, p: 1.5, textAlign: "center"}}>
                                <Typography sx={{fontSize: 22, fontWeight: 700}}>
                                    ✓
                                </Typography>
                                <Typography sx={{fontSize: 11, color: "#7589a3"}}>
                                    {t("online")}
                                </Typography>
                            </Box>

                            <Box sx={{...glass, p: 1.5, textAlign: "center"}}>
                                <Typography sx={{fontSize: 22, fontWeight: 700}}>
                                    4
                                </Typography>
                                <Typography sx={{fontSize: 11, color: "#7589a3"}}>
                                    Modos
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{mt: 1.5}}>
                            <BasicControls />
                        </Box>
                    </Paper>

                    {/* BASE */}
                    {(dockEmpty || dockClean || dockDry) && (
                        <Paper sx={{...glass, p: 2}}>
                            <Typography sx={{fontSize: 18, fontWeight: 700, mb: 1}}>
                                Estación de vaciado y limpieza
                            </Typography>

                            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
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

                            <Box sx={{mt: 1.5}}>
                                <Dock />
                            </Box>
                        </Paper>
                    )}

                    {/* ESTADÍSTICAS */}
                    {statistics && (
                        <Paper sx={{...glass, p: 2}}>
                            <Typography sx={{fontSize: 18, fontWeight: 700, mb: 1}}>
                                Estadísticas
                            </Typography>
                            <CurrentStatistics />
                        </Paper>
                    )}

                    {/* ACCIONES */}
                    <Paper sx={{...glass, p: 2}}>
                        <Typography sx={{fontSize: 18, fontWeight: 700, mb: 1.2}}>
                            Funciones adicionales
                        </Typography>

                        <Box sx={{display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: .8}}>
                            <Button
                                component={Link}
                                to="/options/map_management/virtual_restrictions"
                                sx={{minWidth: 0, minHeight: 70, flexDirection: "column", color: "#a9bad0", textTransform: "none"}}
                            >
                                <ZonesIcon />
                                <Typography sx={{fontSize: 11}}>Zonas</Typography>
                            </Button>

                            <Button
                                component={Link}
                                to="/options/map_management/segments"
                                sx={{minWidth: 0, minHeight: 70, flexDirection: "column", color: "#a9bad0", textTransform: "none"}}
                            >
                                <RoomsIcon />
                                <Typography sx={{fontSize: 11}}>Habitaciones</Typography>
                            </Button>

                            <Button
                                component={Link}
                                to="/valetudo/timers"
                                sx={{minWidth: 0, minHeight: 70, flexDirection: "column", color: "#a9bad0", textTransform: "none"}}
                            >
                                <ScheduleIcon />
                                <Typography sx={{fontSize: 11}}>Programar</Typography>
                            </Button>

                            <Button
                                component={Link}
                                to="/options/robot"
                                sx={{minWidth: 0, minHeight: 70, flexDirection: "column", color: "#a9bad0", textTransform: "none"}}
                            >
                                <MoreIcon />
                                <Typography sx={{fontSize: 11}}>Más</Typography>
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default HomePage;
