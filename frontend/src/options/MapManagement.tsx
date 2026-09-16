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
} from "@mui/icons-material";
import React from "react";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { LinkListMenuItem } from "../components/list_menu/LinkListMenuItem";
import { ButtonListMenuItem } from "../components/list_menu/ButtonListMenuItem";
import {SpacerListMenuItem} from "../components/list_menu/SpacerListMenuItem";
import {ListMenu} from "../components/list_menu/ListMenu";
import {ToggleSwitchListMenuItem} from "../components/list_menu/ToggleSwitchListMenuItem";
import {MapManagementHelp} from "./res/MapManagementHelp";
import PaperContainer from "../components/PaperContainer";
import {MapUtilitiesHelp} from "./res/MapUtilitiesHelp";
import {VirtualRestrictionsIcon} from "../components/CustomIcons";


export const MappingPassButtonItem = (): React.ReactElement => {
    const {mutate: startMappingPass, isPending: mappingPassStarting} = useStartMappingPassMutation();

    return (
        <ButtonListMenuItem
            primaryLabel="Mapeo"
            secondaryLabel="Crear un mapa nuevo"
            icon={<MappingPassIcon/>}
            buttonLabel="Go"
            confirmationDialog={{
                title: "¿Iniciar el mapeo?",
                body: "¿Realmente quieres iniciar un nuevo mapeo?"
            }}
            action={startMappingPass}
            actionLoading={mappingPassStarting}
        />
    );
};

const MapRestablecerButtonItem = (): React.ReactElement => {
    const {mutate: resetMap, isPending: mapRestablecerting} = useMapResetMutation();

    return (
        <ButtonListMenuItem
            primaryLabel="Restablecer mapa"
            secondaryLabel="Eliminar el mapa actual"
            icon={<MapRestablecerIcon/>}
            buttonLabel="Go"
            buttonColor={"error"}
            confirmationDialog={{
                title: "Restablecer map?",
                body: "Do you really want to reset the map?"
            }}
            action={resetMap}
            actionLoading={mapRestablecerting}
        />
    );
};

export const PersistentMapSwitchListItem = () => {
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const {
        data: persistentData,
        isFetching: persistentDataLoading,
        isError: persistentDataError,
    } = usePersistentMapQuery();

    const {mutate: mutatePersistentData, isPending: persistentDataChanging} = usePersistentMapMutation();
    const loading = persistentDataLoading || persistentDataChanging;
    const disabled = loading || persistentDataChanging || persistentDataError;

    return (
        <>
            <ToggleSwitchListMenuItem
                value={persistentData?.enabled ?? false}
                setValue={(value) => {
                    // Disabling requires confirmation
                    if (value) {
                        mutatePersistentData(true);
                    } else {
                        setDialogOpen(true);
                    }
                }}
                disabled={disabled}
                loadError={persistentDataError}
                primaryLabel={"Persistent maps"}
                secondaryLabel={"Guardar un mapa persistente"}
                icon={<PersistentMapControlIcon/>}
            />
            <ConfirmationDialog
                title="¿Desactivar los mapas persistentes?"
                text={(
                    <>
                        ¿Realmente quieres desactivar los mapas persistentes?<br/>
                        Esto eliminará el mapa almacenado actualmente.
                    </>
                )}
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                }}
                onAccept={() => {
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
        isPending: mapPending,
    } = useRobotMapQuery();


    return (
        <ButtonListMenuItem
            primaryLabel="Exportar mapa"
            secondaryLabel="Descargar los datos del mapa para utilizarlos con otras herramientas"
            icon={<ValetudoMapDownloadIcon/>}
            buttonLabel="Go"
            action={() => {
                if (valetudoInformation && mapData) {
                    const timestamp = new Date().toISOString().replaceAll(":","-").split(".")[0];
                    const mapExportBlob = new Blob(
                        [JSON.stringify(mapData, null, 2)],
                        { type: "application/json" }
                    );

                    const linkElement = document.createElement("a");

                    linkElement.href = URL.createObjectURL(mapExportBlob);
                    linkElement.download = `ValetudoMapExport-${valetudoInformation.systemId}-${timestamp}.json`;

                    linkElement.click();
                }
            }}
            actionLoading={valetudoInformationPending || mapPending}
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

    const robotManagedListItems = React.useMemo(() => {
        const items = [];

        if (
            persistentMapControlCapabilitySupported ||
            mappingPassCapabilitySupported ||
            mapRestablecerCapabilitySupported
        ) {
            if (persistentMapControlCapabilitySupported) {
                items.push(
                    <PersistentMapSwitchListItem key="persistentMapSwitch"/>
                );
            }

            if (mappingPassCapabilitySupported) {
                items.push(
                    <MappingPassButtonItem key="mappingPass"/>
                );
            }

            if (mapRestablecerCapabilitySupported) {
                items.push(
                    <MapRestablecerButtonItem key="mapRestablecer"/>
                );
            }

            if (
                mapSegmentEditCapabilitySupported || mapSegmentRenameCapabilitySupported ||
                combinedVirtualRestrictionsCapabilitySupported
            ) {
                items.push(<SpacerListMenuItem key={"spacer1"}/>);
            }
        }


        if (mapSegmentEditCapabilitySupported || mapSegmentRenameCapabilitySupported) {
            items.push(
                <LinkListMenuItem
                    key="segmentManagement"
                    url="/options/map_management/segments"
                    primaryLabel="Segment Management"
                    secondaryLabel="Modificar las habitaciones del mapa"
                    icon={<SegmentEditIcon/>}
                />
            );
        }

        if (combinedVirtualRestrictionsCapabilitySupported) {
            items.push(
                <LinkListMenuItem
                    key="virtualRestrictionManagement"
                    url="/options/map_management/virtual_restrictions"
                    primaryLabel="Virtual Restriction Management"
                    secondaryLabel="Crear, modificar y eliminar restricciones virtuales"
                    icon={<VirtualRestrictionsIcon/>}
                />
            );
        }

        return items;
    }, [
        persistentMapControlCapabilitySupported,
        mappingPassCapabilitySupported,
        mapRestablecerCapabilitySupported,

        combinedVirtualRestrictionsCapabilitySupported,
        mapSegmentEditCapabilitySupported,
        mapSegmentRenameCapabilitySupported
    ]);

    const utilityMapItems = React.useMemo(() => {
        return [
            <LinkListMenuItem
                key="robotCoverageMap"
                url="/options/map_management/robot_coverage"
                primaryLabel="Mapa de cobertura del robot"
                secondaryLabel="Consultar la cobertura del robot"
                icon={<CleanupCoverageIcon/>}
            />,
            <ValetudoMapDataExportButtonItem key="valetudoMapDataExport" />
        ];
    }, []);

    return (
        <PaperContainer>
            <ListMenu
                primaryHeader={"Funciones del mapa gestionadas por el robot"}
                secondaryHeader={"Estas funciones son gestionadas y proporcionadas por el firmware del robot"}
                listItems={robotManagedListItems}
                helpText={MapManagementHelp}
            />
            <ListMenu
                primaryHeader={"Herramientas del mapa"}
                secondaryHeader={"Funciones adicionales para el mapa"}
                listItems={utilityMapItems}
                helpText={MapUtilitiesHelp}
                style={{marginTop: "1rem"}}
            />
        </PaperContainer>
    );
};

export default MapManagement;
