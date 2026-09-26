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
    const [expanded, setExpanded] = React.useState<boolean>(!isOk);

    return (
        <Paper
            variant="outlined"
            sx={{
                mt: 1,
                mb: 1,
                p: 1,
                borderRadius: "14px",
                backgroundColor: "transparent",
                borderColor: "divider",
            }}
        >
            <Grid2
                container
                alignItems="center"
                onClick={() => setExpanded(!expanded)}
                sx={{
                    cursor: "pointer",
                    minHeight: "34px",
                }}
            >
                <Grid2 sx={{flexGrow: 1}}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 600,
                            ml: 0.5,
                        }}
                    >
                        Componentes
                    </Typography>
                </Grid2>

                <Grid2
                    sx={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: statusColor,
                            fontWeight: 700,
                            mr: 1,
                        }}
                    >
                        {isOk ? "OK" : "COMPROBAR"}
                    </Typography>

                    <Icon
                        component={
                            expanded ?
                                CloseIcon :
                                OpenIcon
                        }
                    />
                </Grid2>
            </Grid2>

            <Box
                sx={{
                    display: expanded ? "block" : "none",
                    pt: 1.5,
                }}
            >
                <Grid2 container spacing={1}>
                    {components.map(component => (
                        <DockComponentTile
                            key={component.type}
                            label={component.label}
                            icon={component.icon}
                            statusText={component.statusText}
                            statusColor={component.statusColor}
                        />
                    ))}
                </Grid2>
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
