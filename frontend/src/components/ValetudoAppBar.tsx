import {
    AppBar,
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    PaletteMode,
    Switch,
    Toolbar,
    Typography
} from "@mui/material";
import React from "react";
import {useLanguage} from "../i18n";
import {
    AccessTime as TimeIcon,
    Equalizer as StatisticsIcon,
    DarkMode as DarkModeIcon,
    Map as MapManagementIcon,
    Home as HomeIcon,
    Article as LogIcon,
    Menu as MenuIcon,
    ArrowBack as BackIcon,
    PendingActions as PendingActionsIcon,
    Hub as ConnectivityIcon,
    SystemUpdateAlt as UpdaterIcon,
    SettingsRemote as SettingsRemoteIcon,
    GitHub as GithubIcon,
    Favorite as DonateIcon,
    MenuBook as DocsIcon,
    Wysiwyg as SystemInformationIcon,
    Info as AboutIcon,
    Help as HelpIcon,
    SmartToy as AiIcon,
    SvgIconComponent
} from "@mui/icons-material";
import {Link, useLocation} from "react-router-dom";
import ValetudoEvents from "./ValetudoEvents";
import {Capability} from "../api";
import {useCapabilitiesSupported} from "../CapabilitiesProvider";
import {
    RobotMonochromeIcon,
    SwaggerUIIcon,
    ValetudoMonochromeIcon
} from "./CustomIcons";

interface MenuEntry {
    kind: "MenuEntry";
    route: string;
    title: string;
    menuIcon: SvgIconComponent;
    menuText: string;
    requiredCapabilities?: {
        capabilities: Capability[];
        type: "allof" | "anyof"
    };
}

interface MenuSubEntry {
    kind: "MenuSubEntry",
    route: string,
    title: string,
    parentRoute: string
}

interface MenuSubheader {
    kind: "Subheader";
    title: string;
    requiredCapabilities?: {
        capabilities: Capability[];
        type: "allof" | "anyof"
    };
}



//Note that order is important here
const menuTextMap: Record<string, string> = {
    "Consumibles": "Consumibles",
    "Control manual": "Control manual",
    "Estadísticas": "Estadísticas",
    "Opciones del mapa": "Opciones del mapa",
    "Gestión de habitaciones": "Gestión de habitaciones",
    "Gestión de restricciones virtuales": "Gestión de restricciones virtuales",
    "Mapa de cobertura del robot": "Mapa de cobertura del robot",
    "Opciones de conectividad": "Opciones de conectividad",
    "Ajustes de autenticación": "Ajustes de autenticación",
    "Conectividad MQTT": "Conectividad MQTT",
    "Anuncio de red": "Anuncio de red",
    "Conectividad NTP": "Conectividad NTP",
    "Conectividad Wi-Fi": "Conectividad Wi-Fi",
    "Opciones del robot": "Opciones del robot",
    "Opciones del sistema": "Opciones del sistema",
    "Información del sistema": "Información del sistema",
    "Opciones de Valetudo": "Opciones de Valetudo",
};

const menuTree: Array<MenuEntry | MenuSubEntry | MenuSubheader> = [
    {
        kind: "MenuEntry",
        route: "/",
        title: "Inicio",
        menuIcon: HomeIcon,
        menuText: "Inicio"
    },
    {
        kind: "Subheader",
        title: "Robot",
        requiredCapabilities: {
            capabilities: [
                Capability.ConsumableMonitoring,
                Capability.ManualControl,
                Capability.HighResolutionManualControl,
                Capability.TotalStatistics
            ],
            type: "anyof"
        }
    },
    {
        kind: "MenuEntry",
        route: "/robot/consumables",
        title: "Consumibles",
        menuIcon: PendingActionsIcon,
        menuText: "Consumibles",
        requiredCapabilities: {
            capabilities: [Capability.ConsumableMonitoring],
            type: "allof"
        }
    },
    {
        kind: "MenuEntry",
        route: "/robot/manual_control",
        title: "Control manual",
        menuIcon: SettingsRemoteIcon,
        menuText: "Control manual",
        requiredCapabilities: {
            capabilities: [Capability.ManualControl, Capability.HighResolutionManualControl],
            type: "anyof"
        }
    },
    {
        kind: "MenuEntry",
        route: "/robot/total_statistics",
        title: "Estadísticas",
        menuIcon: StatisticsIcon,
        menuText: "Estadísticas",
        requiredCapabilities: {
            capabilities: [Capability.TotalStatistics],
            type: "allof"
        }
    },
    {
        kind: "Subheader",
        title: "Opciones"
    },
    {
        kind: "MenuEntry",
        route: "/options/map_management",
        title: "Opciones del mapa",
        menuIcon: MapManagementIcon,
        menuText: "Mapa",
        requiredCapabilities: {
            capabilities: [
                Capability.PersistentMapControl,
                Capability.MappingPass,
                Capability.MapReset,

                Capability.MapSegmentEdit,
                Capability.MapSegmentRename,

                Capability.CombinedVirtualRestrictions
            ],
            type: "anyof"
        }
    },
    {
        kind: "MenuSubEntry",
        route: "/options/map_management/segments",
        title: "Gestión de habitaciones",
        parentRoute: "/options/map_management"
    },
    {
        kind: "MenuSubEntry",
        route: "/options/map_management/virtual_restrictions",
        title: "Gestión de restricciones virtuales",
        parentRoute: "/options/map_management"
    },
    {
        kind: "MenuSubEntry",
        route: "/options/map_management/robot_coverage",
        title: "Mapa de cobertura del robot",
        parentRoute: "/options/map_management"
    },
    {
        kind: "MenuEntry",
        route: "/options/connectivity",
        title: "Opciones de conectividad",
        menuIcon: ConnectivityIcon,
        menuText: "Conectividad"
    },
    {
        kind: "MenuSubEntry",
        route: "/options/connectivity/auth",
        title: "Ajustes de autenticación",
        parentRoute: "/options/connectivity"
    },
    {
        kind: "MenuSubEntry",
        route: "/options/connectivity/mqtt",
        title: "Conectividad MQTT",
        parentRoute: "/options/connectivity"
    },
    {
        kind: "MenuSubEntry",
        route: "/options/connectivity/networkadvertisement",
        title: "Anuncio de red",
        parentRoute: "/options/connectivity"
    },
    {
        kind: "MenuSubEntry",
        route: "/options/connectivity/ntp",
        title: "Conectividad NTP",
        parentRoute: "/options/connectivity"
    },
    {
        kind: "MenuSubEntry",
        route: "/options/connectivity/wifi",
        title: "Conectividad Wi-Fi",
        parentRoute: "/options/connectivity"
    },
    {
        kind: "MenuEntry",
        route: "/options/robot",
        title: "Opciones del robot",
        menuIcon: RobotMonochromeIcon,
        menuText: "Robot"
    },
    {
        kind: "MenuSubEntry",
        route: "/options/robot/system",
        title: "Opciones del sistema",
        parentRoute: "/options/robot"
    },
    {
        kind: "MenuSubEntry",
        route: "/options/robot/quirks",
        title: "Particularidades",
        parentRoute: "/options/robot"
    },
    {
        kind: "MenuEntry",
        route: "/options/valetudo",
        title: "Opciones de Valetudo",
        menuIcon: ValetudoMonochromeIcon,
        menuText: "Valetudo"
    },
    {
        kind: "Subheader",
        title: "Varios"
    },
    {
        kind: "MenuEntry",
        route: "/valetudo/timers",
        title: "Programaciones",
        menuIcon: TimeIcon,
        menuText: "Programaciones"
    },
    {
        kind: "MenuEntry",
        route: "/valetudo/log",
        title: "Registro",
        menuIcon: LogIcon,
        menuText: "Registro"
    },
    {
        kind: "MenuEntry",
        route: "/valetudo/updater",
        title: "Actualizador",
        menuIcon: UpdaterIcon,
        menuText: "Actualizador"
    },
    {
        kind: "MenuEntry",
        route: "/valetudo/system_information",
        title: "Información del sistema",
        menuIcon: SystemInformationIcon,
        menuText: "Información del sistema"
    },
    {
        kind: "MenuEntry",
        route: "/valetudo/ai",
        title: "Asistente IA",
        menuIcon: AiIcon,
        menuText: "Asistente IA"
    },
    {
        kind: "MenuEntry",
        route: "/valetudo/help",
        title: "Ayuda general",
        menuIcon: HelpIcon,
        menuText: "Ayuda general"
    },
    {
        kind: "MenuEntry",
        route: "/valetudo/about",
        title: "Acerca de Valetudo",
        menuIcon: AboutIcon,
        menuText: "Acerca de Valetudo"
    },
];

const ValetudoAppBar: React.FunctionComponent<{ paletteMode: PaletteMode, setPaletteMode: (newMode: PaletteMode) => void }> = ({
    paletteMode,
    setPaletteMode
}): React.ReactElement => {
    const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
    const {t} = useLanguage();
    const currentLocation = useLocation()?.pathname;
    const robotCapabilities = useCapabilitiesSupported(...Object.values(Capability));

    //@ts-ignore
    const currentMenuEntry = menuTree.find(element => element.route === currentLocation) ?? menuTree[0];

    const pageTitle = React.useMemo(() => {
        let ret = "";

        menuTree.forEach((element) => {
            //@ts-ignore
            if (currentLocation.includes(element.route) && element.route !== "/" && element.title) {
                if (ret !== "") {
                    ret += " - ";
                }

                ret += element.title;
            }
        });

        if (ret !== "") {
            document.title = `X40-Control - ${ret}`;
        } else {
            document.title = "X40-Control";
        }

        return currentMenuEntry.title;
    }, [currentLocation, currentMenuEntry]);

    const drawerContent = React.useMemo(() => {
        return (
            <Box
                sx={{width: 250}}
                role="presentation"
                onClick={() => {
                    setDrawerOpen(false);
                }}
                onKeyDown={() => {
                    setDrawerOpen(false);
                }}
                style={{
                    scrollbarWidth: "thin",
                    overflowX: "hidden"
                }}
            >
                <List>
                    {menuTree.filter(item => {
                        return item.kind !== "MenuSubEntry";
                    }).map((value, idx) => {
                        switch (value.kind) {
                            case "Subheader":
                                if (value.requiredCapabilities) {
                                    switch (value.requiredCapabilities.type) {
                                        case "allof": {
                                            if (!value.requiredCapabilities.capabilities.every(capability => {
                                                const idx = Object.values(Capability).indexOf(capability);
                                                return robotCapabilities[idx];
                                            })) {
                                                return null;
                                            }

                                            break;
                                        }
                                        case "anyof": {
                                            if (!value.requiredCapabilities.capabilities.some(capability => {
                                                const idx = Object.values(Capability).indexOf(capability);
                                                return robotCapabilities[idx];
                                            })) {
                                                return null;
                                            }

                                            break;
                                        }
                                    }
                                }

                                return (
                                    <ListSubheader
                                        key={`${idx}`}
                                        sx={{
                                            background: "transparent",
                                            userSelect: "none"
                                        }}
                                        disableSticky={true}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {value.title}
                                    </ListSubheader>
                                );

                            case "MenuEntry": {
                                if (value.requiredCapabilities) {
                                    switch (value.requiredCapabilities.type) {
                                        case "allof": {
                                            if (!value.requiredCapabilities.capabilities.every(capability => {
                                                const idx = Object.values(Capability).indexOf(capability);
                                                return robotCapabilities[idx];
                                            })) {
                                                return null;
                                            }

                                            break;
                                        }
                                        case "anyof": {
                                            if (!value.requiredCapabilities.capabilities.some(capability => {
                                                const idx = Object.values(Capability).indexOf(capability);
                                                return robotCapabilities[idx];
                                            })) {
                                                return null;
                                            }

                                            break;
                                        }
                                    }
                                }

                                const ItemIcon = value.menuIcon;

                                return (
                                    <ListItemButton
                                        key={value.route}
                                        selected={value.route === currentLocation}
                                        component={Link}
                                        to={value.route}
                                    >
                                        <ListItemIcon>
                                            <ItemIcon/>
                                        </ListItemIcon>
                                        <ListItemText primary={menuTextMap[value.menuText] ? menuTextMap[value.menuText] : value.menuText}/>
                                    </ListItemButton>
                                );
                            }
                        }
                    })}

                    <Divider/>
                    <ListItem
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                            userSelect: "none"
                        }}
                    >
                        <ListItemIcon>
                            <DarkModeIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Modo oscuro"/>
                        <Switch
                            edge="end"
                            onChange={(e) => {
                                setPaletteMode(e.target.checked ? "dark" : "light");
                            }}
                            checked={paletteMode === "dark"}
                        />
                    </ListItem>


                    <ListSubheader
                        sx={{
                            background: "transparent",
                            userSelect: "none"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        Links
                    </ListSubheader>
                    <ListItemButton
                        component="a"
                        href="./swagger/"
                        target="_blank"
                        rel="noopener"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ListItemIcon>
                            <SwaggerUIIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Swagger UI"/>
                    </ListItemButton>
                    <Divider/>
                    <ListItemButton
                        component="a"
                        href="https://valetudo.cloud"
                        target="_blank"
                        rel="noopener"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ListItemIcon>
                            <DocsIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Documentación"/>
                    </ListItemButton>
                    <ListItemButton
                        component="a"
                        href="https://github.com/Hypfer/Valetudo"
                        target="_blank"
                        rel="noopener"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ListItemIcon>
                            <GithubIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Hypfer/Valetudo"/>
                    </ListItemButton>
                    <ListItemButton
                        component="a"
                        href="https://github.com/sponsors/Hypfer"
                        target="_blank"
                        rel="noopener"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ListItemIcon>
                            <DonateIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Donar"/>
                    </ListItemButton>


                </List>
            </Box>
        );
    }, [currentLocation, paletteMode, setPaletteMode, robotCapabilities]);

    const toolbarContent = React.useMemo(() => {
        switch (currentMenuEntry.kind) {
            case "MenuEntry":
                return (
                    <>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{mr: 2}}
                            onClick={() => {
                                setDrawerOpen(true);
                            }}
                            title="Menú"
                        >
                            <MenuIcon/>
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                            {pageTitle}
                        </Typography>
                    </>
                );
            case "MenuSubEntry":
                return (
                    <>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="back"
                            sx={{mr: 2}}

                            component={Link}
                            to={currentMenuEntry.parentRoute}
                        >
                            <BackIcon/>
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                            {pageTitle}
                        </Typography>
                    </>
                );
            case "Subheader":
                //This can never happen
                return (<></>);
        }
    }, [currentMenuEntry, setDrawerOpen, pageTitle]);

    return (
        <Box
            sx={{
                userSelect: "none"
            }}
        >
            <AppBar position="fixed">
                <Toolbar>
                    {toolbarContent}
                    <div>
                        <ValetudoEvents/>
                    </div>
                </Toolbar>
            </AppBar>
            <Toolbar/>
            {
                currentMenuEntry.kind !== "MenuSubEntry" &&
                <Drawer
                    anchor={"left"}
                    open={drawerOpen}
                    onClose={() => {
                        setDrawerOpen(false);
                    }}
                >
                    {drawerContent}
                </Drawer>
            }
        </Box>
    );
};

export default ValetudoAppBar;
