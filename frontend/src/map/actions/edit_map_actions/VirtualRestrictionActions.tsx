import {
    Capability,
    StatusState,
    useCombinedVirtualRestrictionsMutation,
    useCombinedVirtualRestrictionsPropertiesQuery,
    ValetudoRestrictedZone,
    ValetudoRestrictedZoneType
} from "../../../api";
import React from "react";
import {Box, Button, CircularProgress, Container, Grid2, Typography} from "@mui/material";
import {ActionButton} from "../../Styled";
import VirtualWallClientStructure from "../../structures/client_structures/VirtualWallClientStructure";
import NoGoAreaClientStructure from "../../structures/client_structures/NoGoAreaClientStructure";
import NoMopAreaClientStructure from "../../structures/client_structures/NoMopAreaClientStructure";
import RestrictedZoneClientStructure from "../../structures/client_structures/RestrictedZoneClientStructure";
import {PointCoordinates} from "../../utils/types";
import {
    Save as GuardarIcon,
    Refresh as RefreshIcon, Clear as ClearIcon,
} from "@mui/icons-material";
import {
    AddNoGoAreaIcon,
    AddNoMopAreaIcon,
    AddVirtualWallIcon
} from "../../../components/CustomIcons";

interface VirtualRestrictionActionsProperties {
    robotStatus: StatusState,
    virtualWalls: Array<VirtualWallClientStructure>,
    noGoAreas: Array<NoGoAreaClientStructure>,
    noMopAreas: Array<NoMopAreaClientStructure>,

    convertPixelCoordinatesToCMSpace(coordinates: PointCoordinates) : PointCoordinates

    onAddVirtualWall(): void,
    onAddNoGoArea(): void,
    onAddNoMopArea(): void,

    onGuardar(): void;
    onRefresh(): void;
    onClear(): void;
}

const VirtualRestrictionActions = (
    props: VirtualRestrictionActionsProperties
): React.ReactElement => {
    const {
        virtualWalls,
        noGoAreas,
        noMopAreas,

        convertPixelCoordinatesToCMSpace,


        onAddVirtualWall,
        onAddNoGoArea,
        onAddNoMopArea,

        onGuardar,
        onRefresh,
        onClear
    } = props;


    const {
        data: combinedVirtualRestrictionsProperties,
        isPending: combinedVirtualRestrictionsPropertiesPending,
        isError: combinedVirtualRestrictionsPropertiesLoadError,
        refetch: refetchCombinedVirtualRestrictionsProperties,
    } = useCombinedVirtualRestrictionsPropertiesQuery();

    const {
        mutate: saveRestrictions,
        isPending: restrictionsSaving
    } = useCombinedVirtualRestrictionsMutation({
        onSuccess: onGuardar,
    });
    const canEdit = props.robotStatus.value === "docked";

    const handleGuardarClick = React.useCallback(() => {
        if (!canEdit) {
            return;
        }
        const restrictedZones : Array<ValetudoRestrictedZone> = [];

        [...noGoAreas, ...noMopAreas].forEach((rZ : RestrictedZoneClientStructure) => {
            let type : ValetudoRestrictedZoneType = ValetudoRestrictedZoneType.Regular;

            if (rZ.type === NoMopAreaClientStructure.TYPE) {
                type = ValetudoRestrictedZoneType.Mop;
            }

            restrictedZones.push({
                type: type,
                points: {
                    pA: convertPixelCoordinatesToCMSpace({
                        x: rZ.x0,
                        y: rZ.y0
                    }),
                    pB: convertPixelCoordinatesToCMSpace({
                        x: rZ.x1,
                        y: rZ.y1
                    }),
                    pC: convertPixelCoordinatesToCMSpace({
                        x: rZ.x2,
                        y: rZ.y2
                    }),
                    pD: convertPixelCoordinatesToCMSpace({
                        x: rZ.x3,
                        y: rZ.y3
                    })
                }
            });
        });

        saveRestrictions({
            virtualWalls: virtualWalls.map(vW => {
                return {
                    points: {
                        pA: convertPixelCoordinatesToCMSpace({
                            x: vW.x0,
                            y: vW.y0
                        }),
                        pB: convertPixelCoordinatesToCMSpace({
                            x: vW.x1,
                            y: vW.y1
                        })
                    }
                };
            }),
            restrictedZones: restrictedZones
        });
    }, [canEdit, saveRestrictions, virtualWalls, noGoAreas, noMopAreas, convertPixelCoordinatesToCMSpace]);

    if (combinedVirtualRestrictionsPropertiesLoadError) {
        return (
            <Container>
                <Typography color="error">
                    Error al cargar las propiedades de {Capability.CombinedVirtualRestrictions}
                </Typography>
                <Box m={1}/>
                <Button color="primary" variant="contained" onClick={() => {
                    return refetchCombinedVirtualRestrictionsProperties();
                }}>
                    <RefreshIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                    Retry
                </Button>
            </Container>
        );
    }

    if (combinedVirtualRestrictionsProperties === undefined && combinedVirtualRestrictionsPropertiesPending) {
        return (
            <Container>
                <CircularProgress/>
            </Container>
        );
    }

    if (combinedVirtualRestrictionsProperties === undefined) {
        return (
            <Container>
                <Typography align="center">
                    No hay propiedades disponibles de {Capability.CombinedVirtualRestrictions}
                </Typography>
            </Container>
        );
    }


    return (
        <Grid2 container spacing={2} justifyContent="center" alignItems="center" sx={{width: "100%", padding: "0 10px", gap: "28px", display: "flex", flexWrap: "wrap", transform: "translateY(-20px)"}} direction="row-reverse" flexWrap="wrap-reverse">
            {
                canEdit &&

                <Grid2>
                    <ActionButton
                        disabled={restrictionsSaving}
                        color="inherit"
                        size="medium"
                        variant="extended" sx={{fontSize: "0.8rem"}}
                        onClick={handleGuardarClick}
                    >
                        <GuardarIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        Guardar
                        {restrictionsSaving && (
                            <CircularProgress
                                color="inherit"
                                size={18}
                                style={{marginLeft: 10}}
                            />
                        )}
                    </ActionButton>
                </Grid2>
            }
            {
                canEdit &&

                <Grid2>
                    <ActionButton
                        color="inherit"
                        size="medium"
                        variant="extended" sx={{fontSize: "0.8rem"}}
                        onClick={onAddVirtualWall}
                    >
                        <AddVirtualWallIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        Wall ({virtualWalls.length})
                    </ActionButton>
                </Grid2>
            }
            {
                canEdit &&
                combinedVirtualRestrictionsProperties.supportedRestrictedZoneTypes.includes(ValetudoRestrictedZoneType.Regular) &&

                <Grid2>
                    <ActionButton
                        color="inherit"
                        size="medium"
                        variant="extended" sx={{fontSize: "0.8rem"}}
                        onClick={onAddNoGoArea}
                    >
                        <AddNoGoAreaIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        No-Go ({noGoAreas.length})
                    </ActionButton>
                </Grid2>
            }
            {
                canEdit &&
                combinedVirtualRestrictionsProperties.supportedRestrictedZoneTypes.includes(ValetudoRestrictedZoneType.Mop) &&

                <Grid2>
                    <ActionButton
                        color="inherit"
                        size="medium"
                        variant="extended" sx={{fontSize: "0.8rem"}}
                        onClick={onAddNoMopArea}
                    >
                        <AddNoMopAreaIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        No-Mop ({noMopAreas.length})
                    </ActionButton>
                </Grid2>
            }
            {
                canEdit &&

                <Grid2>
                    <ActionButton
                        color="inherit"
                        size="medium"
                        disabled={noGoAreas.length === 0 && noMopAreas.length === 0 && virtualWalls.length === 0}
                        variant="extended" sx={{fontSize: "0.8rem"}}
                        onClick={onClear}
                    >
                        <ClearIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        Borrar
                    </ActionButton>
                </Grid2>
            }
            {
                canEdit &&

                <Grid2>
                    <ActionButton
                        color="inherit"
                        size="medium"
                        variant="extended" sx={{fontSize: "0.8rem"}}
                        onClick={onRefresh}
                    >
                        <RefreshIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        Actualizar
                    </ActionButton>
                </Grid2>
            }
            {
                !canEdit &&
                <Grid2>
                    <Typography variant="caption" color="textSecondary">
                        Para editar las restricciones virtuales, el robot debe estar en la estación
                    </Typography>
                </Grid2>
            }
        </Grid2>
    );
};

export default VirtualRestrictionActions;
