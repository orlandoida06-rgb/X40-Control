import {useCapabilitiesSupported} from "../CapabilitiesProvider";
import {
    Capability,
    useMapResetMutation,
    usePersistentMapMutation,
    usePersistentMapQuery,
    useRobotMapQuery,
    useStartMappingPassMutation,
    useValetudoInformationQuery
} from "../api";
import {
    Save as PersistentMapControlIcon,
    Layers as MappingPassIcon,
    LayersClear as MapRestablecerIcon,
    Dashboard as SegmentEditIcon,
    Crop as CleanupCoverageIcon,
    Download as ValetudoMapDownloadIcon,
    Map as MapIcon,
    Block as RestrictionIcon
} from "@mui/icons-material";
import React from "react";
import PaperContainer from "../components/PaperContainer";
import {
    Alert,
    Box,
    Button,
    Paper,
    Stack,
    Switch,
    Typography
} from "@mui/material";
import ConfirmationDialog from "../components/ConfirmationDialog";
import {MapManagementHelp} from "./res/MapManagementHelp";
import {MapUtilitiesHelp} from "./res/MapUtilitiesHelp";
import {VirtualRestrictionsIcon} from "../components/CustomIcons";

const SectionHeader: React.FunctionComponent<{
    title: string,
    description: string
}> = ({title, description}) => (
    <Box>
        <Typography variant="h5" fontWeight={800} sx={{letterSpacing: "-0.02em"}}>
            {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{mt: .5}}>
            {description}
        </Typography>
    </Box>
);

const MapActionCard: React.FunctionComponent<{
    icon: React.ReactNode,
    title: string,
    description: string,
    actionLabel?: string,
    onAction?: () => void,
    loading?: boolean,
    disabled?: boolean,
    color?: "primary" | "warning" | "error" | "inherit"
}> = ({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    loading,
    disabled,
    color = "primary"
}) => (
    <Paper
        elevation={0}
        sx={{
            p: {xs: 2, sm: 2.5},
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            transition: "all .2s ease",
            "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 3
            }
        }}
    >
        <Stack
            direction={{xs: "column", sm: "row"}}
            spacing={2}
            alignItems={{xs: "stretch", sm: "center"}}
            justifyContent="space-between"
        >
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                    sx={{
                        width: 46,
                        height: 46,
                        flexShrink: 0,
                        borderRadius: 2.5,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "action.hover"
                    }}
                >
                    {icon}
                </Box>

                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        {title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        {description}
                    </Typography>
                </Box>
            </Stack>

            {actionLabel && onAction && (
                <Button
                    variant="contained"
                    color={color}
                    onClick={onAction}
                    disabled={disabled || loading}
                    sx={{
                        borderRadius: 2.5,
                        minHeight: 42,
                        px: 2.5,
                        flexShrink: 0
                    }}
                >
                    {loading ? "Procesando…" : actionLabel}
                </Button>
            )}
        </Stack>
    </Paper>
);

export const MappingPassButtonItem = (): React.ReactElement => {
    const {
        mutate: startMappingPass,
        isPending: mappingPassStarting
    } = useStartMappingPassMutation();

    const [dialogOpen, setDialogOpen] = React.useState(false);

    return (
        <>
            <MapActionCard
                icon={<MappingPassIcon/>}
                title="Crear un mapa"
                description="Inicia un nuevo recorrido de mapeo para generar el mapa de la vivienda."
                actionLabel="Iniciar"
                onAction={() => setDialogOpen(true)}
                loading={mappingPassStarting}
            />

            <ConfirmationDialog
                title="¿Iniciar el mapeo?"
                text="¿Realmente quieres iniciar un nuevo mapeo?"
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onAccept={() => {
                    setDialogOpen(false);
                    startMappingPass();
                }}
            />
        </>
    );
};

const MapRestablecerButtonItem = (): React.ReactElement => {
    const {
        mutate: resetMap,
        isPending: mapRestablecerting
    } = useMapResetMutation();

    const [dialogOpen, setDialogOpen] = React.useState(false);

    return (
        <>
            <MapActionCard
                icon={<MapRestablecerIcon/>}
                title="Restablecer mapa"
                description="Elimina el mapa actual para empezar de nuevo."
                actionLabel="Restablecer"
                onAction={() => setDialogOpen(true)}
                loading={mapRestablecerting}
                color="error"
            />

            <ConfirmationDialog
                title="¿Restablecer el mapa?"
                text="¿Realmente quieres eliminar el mapa actual?"
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onAccept={() => {
                    setDialogOpen(false);
                    resetMap();
                }}
            />
        </>
    );
};

export const PersistentMapSwitchListItem = (): React.ReactElement => {
    const [dialogOpen, setDialogOpen] = React.useState(false);

    const {
        data: persistentData,
        isFetching: persistentDataLoading,
        isError: persistentDataError,
    } = usePersistentMapQuery();

    const {
        mutate: mutatePersistentData,
        isPending: persistentDataChanging
    } = usePersistentMapMutation();

    const loading = persistentDataLoading || persistentDataChanging;
    const disabled = loading || persistentDataError;

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    p: {xs: 2, sm: 2.5},
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider"
                }}
            >
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                            sx={{
                                width: 46,
                                height: 46,
                                borderRadius: 2.5,
                                display: "grid",
                                placeItems: "center",
                                bgcolor: "action.hover"
                            }}
                        >
                            <PersistentMapControlIcon/>
                        </Box>

                        <Box>
                            <Typography variant="h6" fontWeight={700}>
                                Mapas persistentes
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                Conserva el mapa almacenado aunque se reinicie el robot.
                            </Typography>
                        </Box>
                    </Stack>

                    <Switch
                        checked={persistentData?.enabled ?? false}
                        disabled={disabled}
                        onChange={(event) => {
                            if (event.target.checked) {
                                mutatePersistentData(true);
                            } else {
                                setDialogOpen(true);
                            }
                        }}
                    />
                </Stack>

                {persistentDataError && (
                    <Alert severity="error" sx={{mt: 2, borderRadius: 2}}>
                        No se ha podido consultar el estado de los mapas persistentes.
                    </Alert>
                )}
            </Paper>

            <ConfirmationDialog
                title="¿Desactivar los mapas persistentes?"
                text={
                    <>
                        ¿Realmente quieres desactivar los mapas persistentes?
                        <br/>
                        Esto eliminará el mapa almacenado actualmente.
                    </>
                }
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onAccept={() => {
                    setDialogOpen(false);
                    mutatePersistentData(false);
                }}
            />
        </>
    );
};

const ValetudoMapDataExportButtonItem = (): React.ReactElement => {
    const {
        data: valetudoInformation,
        isPending: valetudoInformationPending
    } = useValetudoInformationQuery();

    const {
        data: mapData,
        isPending: mapPending
    } = useRobotMapQuery();

    const loading = valetudoInformationPending || mapPending;

    const exportMap = () => {
        if (!valetudoInformation || !mapData) {
            return;
        }

        const timestamp = new Date()
            .toISOString()
            .replaceAll(":", "-")
            .split(".")[0];

        const mapExportBlob = new Blob(
            [JSON.stringify(mapData, null, 2)],
            {type: "application/json"}
        );

        const linkElement = document.createElement("a");

        linkElement.href = URL.createObjectURL(mapExportBlob);
        linkElement.download =
            `ValetudoMapExport-${valetudoInformation.systemId}-${timestamp}.json`;

        linkElement.click();

        URL.revokeObjectURL(linkElement.href);
    };

    return (
        <MapActionCard
            icon={<ValetudoMapDownloadIcon/>}
            title="Exportar mapa"
            description="Descarga los datos del mapa para utilizarlos con otras herramientas."
            actionLabel="Exportar"
            onAction={exportMap}
            loading={loading}
        />
    );
};

const MapManagement = (): React.ReactElement => {
    const [
        persistentMapControlCapabilitySupported,
        mappingPassCapabilitySupported,
        mapRestablecerCapabilitySupported,
        mapSegmentEditCapabilitySupported,
        mapSegmentRenameCapabilitySupported,
        combinedVirtualRestrictionsCapabilitySupported
    ] = useCapabilitiesSupported(
        Capability.PersistentMapControl,
        Capability.MappingPass,
        Capability.MapReset,
        Capability.MapSegmentEdit,
        Capability.MapSegmentRename,
        Capability.CombinedVirtualRestrictions
    );

    const openPage = (path: string) => {
        window.location.href = path;
    };

    const robotManagedItems: React.ReactNode[] = [];

    if (persistentMapControlCapabilitySupported) {
        robotManagedItems.push(
            <PersistentMapSwitchListItem key="persistentMap"/>
        );
    }

    if (mappingPassCapabilitySupported) {
        robotManagedItems.push(
            <MappingPassButtonItem key="mappingPass"/>
        );
    }

    if (mapRestablecerCapabilitySupported) {
        robotManagedItems.push(
            <MapRestablecerButtonItem key="mapReset"/>
        );
    }

    if (mapSegmentEditCapabilitySupported || mapSegmentRenameCapabilitySupported) {
        robotManagedItems.push(
            <MapActionCard
                key="segments"
                icon={<SegmentEditIcon/>}
                title="Gestión de habitaciones"
                description="Modificar, renombrar y organizar las habitaciones del mapa."
                actionLabel="Abrir"
                onAction={() => openPage("/options/map_management/segments")}
            />
        );
    }

    if (combinedVirtualRestrictionsCapabilitySupported) {
        robotManagedItems.push(
            <MapActionCard
                key="restrictions"
                icon={<VirtualRestrictionsIcon/>}
                title="Restricciones del mapa"
                description="Crear, modificar y eliminar zonas restringidas, paredes virtuales y zonas sin fregado."
                actionLabel="Abrir"
                onAction={() => openPage("/options/map_management/virtual_restrictions")}
            />
        );
    }

    return (
        <PaperContainer>
            <Stack spacing={2.5}>
                <Paper
                    elevation={0}
                    sx={{
                        p: {xs: 2, sm: 3},
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "divider"
                    }}
                >
                    <Stack spacing={2.5}>
                        <SectionHeader
                            title="Gestión del mapa"
                            description="Controla el mapa, las habitaciones y las funciones de navegación del X40."
                        />

                        {robotManagedItems.length > 0 ? (
                            <Stack spacing={1.5}>
                                {robotManagedItems}
                            </Stack>
                        ) : (
                            <Alert severity="info" sx={{borderRadius: 3}}>
                                El robot no proporciona funciones adicionales de gestión del mapa.
                            </Alert>
                        )}
                    </Stack>
                </Paper>

                <Paper
                    elevation={0}
                    sx={{
                        p: {xs: 2, sm: 3},
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "divider"
                    }}
                >
                    <Stack spacing={2.5}>
                        <SectionHeader
                            title="Herramientas del mapa"
                            description="Funciones adicionales para consultar y exportar el mapa."
                        />

                        <Stack spacing={1.5}>
                            <MapActionCard
                                icon={<CleanupCoverageIcon/>}
                                title="Mapa de cobertura"
                                description="Consulta la cobertura registrada por el robot."
                                actionLabel="Abrir"
                                onAction={() => openPage("/options/map_management/robot_coverage")}
                            />

                            <ValetudoMapDataExportButtonItem/>
                        </Stack>
                    </Stack>
                </Paper>

                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider"
                    }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <MapIcon fontSize="small"/>

                        <Typography variant="body2" color="text.secondary">
                            Las funciones disponibles dependen de las capacidades expuestas por el firmware del robot.
                        </Typography>
                    </Stack>
                </Paper>
            </Stack>

            {/*
             * Se mantienen los textos de ayuda existentes de Valetudo.
             * Las capacidades y APIs originales no se modifican.
             */}
            <Box sx={{display: "none"}}>
                {MapManagementHelp}
                {MapUtilitiesHelp}
                <RestrictionIcon/>
            </Box>
        </PaperContainer>
    );
};

export default MapManagement;
