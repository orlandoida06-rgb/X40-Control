import {
    Capability,
    RobotAttributeClass,
    useAutoEmptyDockManualTriggerMutation,
    useMopDockCleanManualTriggerMutation,
    useMopDockDryManualTriggerMutation,
    useRobotAttributeQuery,
    useRobotStatusQuery,
    useRobotInformationQuery,
    DockComponentStateAttributeType,
    DockComponentStateAttributeValue
} from "../api";
import {useCapabilitiesSupported} from "../CapabilitiesProvider";
import {
    Box,
    Button,
    Grid2,
    Icon,
    Paper,
    styled,
    Typography
} from "@mui/material";
import {
    RestoreFromTrash as EmptyIcon,
    Villa as DockIcon,
    Water as CleanMopIcon,
    WindPower as DryMopIcon,
    Help as DockComponentUnknownIcon,
    ExpandMore as OpenIcon,
    ExpandLess as CloseIcon
} from "@mui/icons-material";
import React from "react";
import {useLanguage} from "../i18n";
import ControlsCard from "./ControlsCard";
import {useFeedbackPending} from "../hooks/useFeedbackPending";
import {
    DockComponentWaterTankClean,
    DockComponentWaterTankDirty,
    DockComponentDetergent,
    DockComponentDustbag,
} from "../components/CustomIcons";
import {useValetudoColorsInverse} from "../hooks/useValetudoColors";

const DockComponentTile = ({
    label,
    icon: IconComponent,
    statusText,
    statusColor
}: {
    label: string,
    icon: React.ElementType,
    statusText: string,
    statusColor: string
}) => {
    return (
        <Grid2
            size={6}
            sx={{
                minWidth: 0,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minHeight: "52px",
                    px: 1,
                    py: 0.75,
                    borderRadius: "12px",
                    backgroundColor: "action.hover",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        opacity: 0.75,
                    }}
                >
                    <IconComponent />
                </Box>

                <Box sx={{minWidth: 0}}>
                    <Typography
                        variant="body2"
                        sx={{
                            lineHeight: 1.1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontWeight: 500,
                        }}
                    >
                        {label}
                    </Typography>

                    <Typography
                        variant="caption"
                        sx={{
                            color: statusColor,
                            fontWeight: 700,
                            lineHeight: 1.1,
                        }}
                    >
                        {statusText}
                    </Typography>
                </Box>
            </Box>
        </Grid2>
    );
};

const DOCK_COMPONENT_ORDER: DockComponentStateAttributeType[] = [
    "water_tank_clean",
    "water_tank_dirty",
    "detergent",
    "dustbag"
];

const DockComponents = ({
    supportedTypes,
    dockComponents
}: {
    supportedTypes: DockComponentStateAttributeType[],
    dockComponents: any[]
}) => {
    const palette = useValetudoColorsInverse();

    const components = React.useMemo(() => {
        return supportedTypes
            .slice()
            .sort(
                (a, b) =>
                    DOCK_COMPONENT_ORDER.indexOf(a) -
                    DOCK_COMPONENT_ORDER.indexOf(b)
            )
            .map(type => {
                const attribute = dockComponents?.find(
                    a => a.type === type
                );

                const value =
                    (attribute?.value as DockComponentStateAttributeValue) ||
                    "unknown";

                let label: string;
                let IconComponent: React.ElementType;

                switch (type) {
                    case "water_tank_clean":
                        label = "Agua limpia";
                        IconComponent = DockComponentWaterTankClean;
                        break;

                    case "water_tank_dirty":
                        label = "Agua residual";
                        IconComponent = DockComponentWaterTankDirty;
                        break;

                    case "detergent":
                        label = "Detergente";
                        IconComponent = DockComponentDetergent;
                        break;

                    case "dustbag":
                        label = "Bolsa de polvo";
                        IconComponent = DockComponentDustbag;
                        break;

                    default:
                        label = "Desconocido";
                        IconComponent = DockComponentUnknownIcon;
                        break;
                }

                let statusText: string;
                let statusColor: string;

                switch (value) {
                    case "ok":
                        statusText = "OK";
                        statusColor = palette.green;
                        break;

                    case "empty":
                        statusText = "Vacío";
                        statusColor = palette.red;
                        break;

                    case "full":
                        statusText = "Lleno";
                        statusColor = palette.red;
                        break;

                    case "missing":
                        statusText = "Falta";
                        statusColor = palette.yellow;
                        break;

                    default:
                        statusText = "Desconocido";
                        statusColor = palette.purple;
                        break;
                }

                return {
                    type: type,
                    value: value,
                    label: label,
                    icon: IconComponent,
                    statusText: statusText,
                    statusColor: statusColor
                };
            });
    }, [supportedTypes, dockComponents, palette]);

    const statusColor = React.useMemo(() => {
        let color = palette.green;

        for (const component of components) {
            if (component.statusColor === palette.red) {
                return palette.red;
            }

            if (component.statusColor === palette.yellow) {
                color = palette.yellow;
            }

            if (
                component.statusColor === palette.purple &&
                color === palette.green
            ) {
                color = palette.purple;
            }
        }

        return color;
    }, [components, palette]);

    const isOk = statusColor === palette.green;

    return (
        <Paper
            variant="outlined"
            sx={{
                mt: 1,
                mb: 1,
                p: 1.25,
                borderRadius: "14px",
                backgroundColor: "rgba(255,255,255,.015)",
                borderColor: "rgba(110,155,215,.16)",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.2,
                }}
            >
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: 800,
                        ml: 0.5,
                        color: "text.primary",
                    }}
                >
                    Componentes
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.6,
                        mr: 0.5,
                    }}
                >
                    <Box
                        sx={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            backgroundColor: statusColor,
                            boxShadow: `0 0 8px ${statusColor}`,
                        }}
                    />

                    <Typography
                        variant="caption"
                        sx={{
                            color: statusColor,
                            fontWeight: 800,
                            letterSpacing: ".04em",
                        }}
                    >
                        {isOk ? "TODO OK" : "COMPROBAR"}
                    </Typography>
                </Box>
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "repeat(2, minmax(0, 1fr))",
                        sm: "repeat(4, minmax(0, 1fr))",
                    },
                    gap: 0.8,
                }}
            >
                {components.map(component => (
                    <Box
                        key={component.type}
                        sx={{
                            minWidth: 0,
                            minHeight: 78,
                            p: 1,
                            borderRadius: "11px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                                "linear-gradient(145deg, rgba(19,34,53,.72), rgba(10,21,35,.72))",
                            border:
                                "1px solid rgba(110,155,215,.13)",
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
                                mb: 0.7,
                                background:
                                    "rgba(255,255,255,.045)",
                            }}
                        >
                            <component.icon
                                sx={{
                                    fontSize: 22,
                                }}
                            />
                        </Box>

                        <Typography
                            sx={{
                                fontSize: 10.5,
                                lineHeight: 1.15,
                                fontWeight: 700,
                                textAlign: "center",
                                color: "text.primary",
                                minHeight: 24,
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            {component.label}
                        </Typography>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.45,
                                mt: 0.45,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    backgroundColor:
                                        component.statusColor,
                                }}
                            />

                            <Typography
                                sx={{
                                    fontSize: 10,
                                    fontWeight: 800,
                                    color: component.statusColor,
                                }}
                            >
                                {component.statusText}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};

const Dock = (): React.ReactElement => {
    const {t} = useLanguage();
    const {
        data: robotStatus,
        isPending: isRobotStatusPending
    } = useRobotStatusQuery();

    const {
        data: robotInfo,
        isPending: isRobotInfoPending
    } = useRobotInformationQuery();

    const {
        data: dockStatus,
        isPending: isDockStatusPending,
    } = useRobotAttributeQuery(
        RobotAttributeClass.DockStatusState
    );

    const {
        data: attachments,
        isPending: isAttachmentPending,
    } = useRobotAttributeQuery(
        RobotAttributeClass.AttachmentState
    );

    const {
        data: dockComponents,
        isPending: isDockComponentsPending
    } = useRobotAttributeQuery(
        RobotAttributeClass.DockComponentState
    );

    const isPending =
        isRobotStatusPending ||
        isDockStatusPending ||
        isAttachmentPending ||
        isRobotInfoPending ||
        isDockComponentsPending;

    const StyledIcon = styled(Icon)(({theme}) => ({
        marginRight: theme.spacing(0.75),
        marginLeft: -theme.spacing(0.5),
    }));

    const [
        triggerEmptySupported,
        mopDockCleanTriggerSupported,
        mopDockDryTriggerSupported,
    ] = useCapabilitiesSupported(
        Capability.AutoEmptyDockManualTrigger,
        Capability.MopDockCleanManualTrigger,
        Capability.MopDockDryManualTrigger,
    );

    const {
        mutate: triggerDockEmpty,
        isPending: emptyIsExecuting,
    } = useAutoEmptyDockManualTriggerMutation();

    const {
        mutate: triggerMopDockCleanCommand,
        isPending: mopDockCleanCommandExecuting
    } = useMopDockCleanManualTriggerMutation();

    const {
        mutate: triggerMopDockDryCommand,
        isPending: mopDockDryCommandExecuting
    } = useMopDockDryManualTriggerMutation();

    const {value: dockState} =
        dockStatus?.[0] ?? {value: "idle"};

    const [feedbackPending, setFeedbackPending] =
        useFeedbackPending(dockState, 25_000);

    const body = React.useMemo(() => {
        const dockStatusIsRelevant =
            mopDockCleanTriggerSupported ||
            mopDockDryTriggerSupported;

        const commandIsExecuting =
            emptyIsExecuting ||
            mopDockCleanCommandExecuting ||
            mopDockDryCommandExecuting;

        const mopAttachmentAttached =
            attachments?.find(a => a.type === "mop")?.attached === true;

        if (isPending) {
            return <></>;
        }

        if (
            robotStatus === undefined ||
            (
                dockStatusIsRelevant &&
                dockStatus?.length !== 1
            )
        ) {
            return (
                <Typography color="error">
                    Error al cargar los controles de la estación
                </Typography>
            );
        }

        const {value: robotState} = robotStatus;

        const supportedComponents =
            robotInfo?.modelDetails?.supportedDockComponents ?? [];

        let dockStateText: string = dockState;

        switch (dockState) {
            case "idle":
                dockStateText = "En espera";
                break;
            case "cleaning":
                dockStateText = "Limpiando";
                break;
            case "drying":
                dockStateText = "Secando";
                break;
            case "pause":
                dockStateText = "Pausado";
                break;
        }

        return (
            <>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                    }}
                >
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor:
                                dockState === "idle" ?
                                    "success.main" :
                                    "warning.main",
                        }}
                    />

                    <Typography
                        sx={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            opacity: 0.7,
                        }}
                    >
                        {dockStateText}
                    </Typography>
                </Box>

                {supportedComponents.length > 0 && (
                    <DockComponents
                        supportedTypes={supportedComponents}
                        dockComponents={dockComponents ?? []}
                    />
                )}

                <Grid2
                    container
                    spacing={1}
                    sx={{
                        pt: 1,
                    }}
                >
                    {mopDockCleanTriggerSupported && (
                        <Grid2 size={4}>
                            <Button
                                fullWidth
                                disabled={
                                    feedbackPending ||
                                    commandIsExecuting ||
                                    ![
                                        "idle",
                                        "cleaning",
                                        "pause"
                                    ].includes(dockState) ||
                                    robotState !== "docked" ||
                                    !mopAttachmentAttached
                                }
                                variant="outlined"
                                color="inherit"
                                onClick={() => {
                                    const command =
                                        dockState === "cleaning" ?
                                            "stop" :
                                            "start";

                                    triggerMopDockCleanCommand(command);
                                    setFeedbackPending(true);
                                }}
                                sx={{
                                    minHeight: "58px",
                                    borderRadius: "14px",
                                    flexDirection: "column",
                                    gap: 0.25,
                                    textTransform: "none",
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                    borderColor: "divider",

                                    "& .MuiSvgIcon-root": {
                                        fontSize: "1.45rem",
                                    },

                                    "&:hover": {
                                        backgroundColor: "action.hover",
                                    },

                                    "&:active": {
                                        transform: "scale(0.96)",
                                    },
                                }}
                            >
                                <StyledIcon
                                    as={CleanMopIcon}
                                />
                                {dockState === "cleaning" ?
                                    t("stop") :
                                    "Limpiar"}
                            </Button>
                        </Grid2>
                    )}

                    {mopDockDryTriggerSupported && (
                        <Grid2 size={4}>
                            <Button
                                fullWidth
                                disabled={
                                    feedbackPending ||
                                    commandIsExecuting ||
                                    ![
                                        "idle",
                                        "drying",
                                        "pause"
                                    ].includes(dockState) ||
                                    robotState !== "docked" ||
                                    !mopAttachmentAttached
                                }
                                variant="outlined"
                                color="inherit"
                                onClick={() => {
                                    const command =
                                        dockState === "drying" ?
                                            "stop" :
                                            "start";

                                    triggerMopDockDryCommand(command);
                                    setFeedbackPending(true);
                                }}
                                sx={{
                                    minHeight: "58px",
                                    borderRadius: "14px",
                                    flexDirection: "column",
                                    gap: 0.25,
                                    textTransform: "none",
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                    borderColor: "divider",

                                    "& .MuiSvgIcon-root": {
                                        fontSize: "1.45rem",
                                    },

                                    "&:hover": {
                                        backgroundColor: "action.hover",
                                    },

                                    "&:active": {
                                        transform: "scale(0.96)",
                                    },
                                }}
                            >
                                <StyledIcon
                                    as={DryMopIcon}
                                />
                                {dockState === "drying" ?
                                    t("stop") :
                                    "Secar"}
                            </Button>
                        </Grid2>
                    )}

                    {triggerEmptySupported && (
                        <Grid2 size={4}>
                            <Button
                                fullWidth
                                disabled={
                                    commandIsExecuting ||
                                    ![
                                        "idle",
                                        "pause"
                                    ].includes(dockState) ||
                                    robotState !== "docked"
                                }
                                variant="outlined"
                                color="inherit"
                                onClick={() => {
                                    triggerDockEmpty();
                                }}
                                sx={{
                                    minHeight: "58px",
                                    borderRadius: "14px",
                                    flexDirection: "column",
                                    gap: 0.25,
                                    textTransform: "none",
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                    borderColor: "divider",

                                    "& .MuiSvgIcon-root": {
                                        fontSize: "1.45rem",
                                    },

                                    "&:hover": {
                                        backgroundColor: "action.hover",
                                    },

                                    "&:active": {
                                        transform: "scale(0.96)",
                                    },
                                }}
                            >
                                <StyledIcon
                                    as={EmptyIcon}
                                />
                                Vaciar
                            </Button>
                        </Grid2>
                    )}
                </Grid2>
            </>
        );
    }, [
        StyledIcon,
        attachments,
        dockState,
        dockStatus,
        emptyIsExecuting,
        isPending,
        mopDockCleanCommandExecuting,
        mopDockCleanTriggerSupported,
        mopDockDryCommandExecuting,
        mopDockDryTriggerSupported,
        feedbackPending,
        setFeedbackPending,
        robotStatus,
        triggerDockEmpty,
        triggerEmptySupported,
        triggerMopDockCleanCommand,
        triggerMopDockDryCommand,
        robotInfo,
        dockComponents
    ]);

    return (
        <ControlsCard
            title="Estación"
            pending={feedbackPending}
            icon={DockIcon}
            isLoading={isPending}
        >
            {body}
        </ControlsCard>
    );
};

export default Dock;
