import {Capability, useCleanSegmentsMutation, useMapSegmentationPropertiesQuery, useRobotStatusQuery} from "../../../api";
import React from "react";
import {Box, Button, CircularProgress, Container, Grid2, Typography} from "@mui/material";
import {ActionButton} from "../../Styled";
import IntegrationHelpDialog from "../../../components/IntegrationHelpDialog";
import {useLongPress} from "use-long-press";
import {IterationsIcon} from "../../../assets/icon_components/IterationsIcon";
import {
    Clear as ClearIcon,
    PlayArrow as GoIcon
} from "@mui/icons-material";

interface SegmentActionsProperties {
    segments: string[];

    onClear(): void;
}

const SegmentActions = (
    props: SegmentActionsProperties
): React.ReactElement => {
    const {segments, onClear} = props;
    const [iterationCount, setIterationCount] = React.useState(1);
    const [integrationHelpDialogOpen, setIntegrationHelpDialogOpen] = React.useState(false);
    const [integrationHelpDialogPayload, setIntegrationHelpDialogPayload] = React.useState("");


    const {
        data: mapSegmentationProperties,
        isPending: mapSegmentationPropertiesPending,
        isError: mapSegmentationPropertiesLoadError,
        refetch: refetchMapSegmentationProperties,
    } = useMapSegmentationPropertiesQuery();
    const {data: status} = useRobotStatusQuery((state) => {
        return state.value;
    });
    const {
        mutate: executeSegmentAction,
        isPending: segmentActionExecuting
    } = useCleanSegmentsMutation({
        onSuccess: onClear,
    });

    const canClean = status === "idle" || status === "docked" || status === "paused" || status === "returning" || status === "error";
    const didSelectSegments = segments.length > 0;

    const handleClick = React.useCallback(() => {
        if (!didSelectSegments || !canClean) {
            return;
        }

        executeSegmentAction({
            segment_ids: segments,
            iterations: iterationCount,
            customOrder: mapSegmentationProperties?.customOrderSupport
        });
    }, [canClean, didSelectSegments, executeSegmentAction, segments, iterationCount, mapSegmentationProperties]);

    const handleLongClick = React.useCallback(() => {
        setIntegrationHelpDialogPayload(JSON.stringify({
            action: "start_segment_action",
            segment_ids: segments,
            iterations: iterationCount ?? 1,
            customOrder: mapSegmentationProperties?.customOrderSupport ?? false
        }, null, 2));

        setIntegrationHelpDialogOpen(true);
    }, [segments, iterationCount, mapSegmentationProperties]);

    const setupClickHandlers = useLongPress(
        handleLongClick,
        {
            onCancel: (event) => {
                handleClick();
            },
            threshold: 500,
            captureEvent: true,
            cancelOnMovement: true,
        }
    );

    const handleIterationToggle = React.useCallback(() => {
        if (mapSegmentationProperties) {
            setIterationCount(iterationCount % mapSegmentationProperties.iterationCount.max + 1);
        }
    }, [iterationCount, setIterationCount, mapSegmentationProperties]);

    if (mapSegmentationPropertiesLoadError) {
        return (
            <Container>
                <Typography color="error">
                    Error al cargar las propiedades de {Capability.MapSegmentation}
                </Typography>
                <Box m={1}/>
                <Button color="primary" variant="contained" onClick={() => {
                    return refetchMapSegmentationProperties();
                }}>
                    Retry
                </Button>
            </Container>
        );
    }

    if (mapSegmentationProperties === undefined && mapSegmentationPropertiesPending) {
        return (
            <Container>
                <CircularProgress/>
            </Container>
        );
    }

    if (mapSegmentationProperties === undefined) {
        return (
            <Container>
                <Typography align="center">
                    No hay propiedades de {Capability.MapSegmentation}
                </Typography>
                ;
            </Container>
        );
    }



    return (
        <>
            <Grid2 container justifyContent="space-around" alignItems="center" flexWrap="nowrap" sx={{width: "100%"}}>
                <Grid2>
                    <ActionButton
                        disabled={!didSelectSegments || segmentActionExecuting || !canClean}
                        color="inherit"
                        size="medium"
                        variant="extended"
                        {...setupClickHandlers()}
                    >
                        <GoIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        Limpiar {segments.length} segmentos
                        {segmentActionExecuting && (
                            <CircularProgress
                                color="inherit"
                                size={18}
                                style={{marginLeft: 10}}
                            />
                        )}
                    </ActionButton>
                </Grid2>
                {
                    mapSegmentationProperties.iterationCount.max > 1 &&
                    <Grid2>
                        <ActionButton
                            color="inherit"
                            size="medium"
                            variant="extended"
                            style={{
                                textTransform: "initial"
                            }}
                            onClick={handleIterationToggle}
                        >
                            <IterationsIcon iterationCount={iterationCount}/>
                        </ActionButton>
                    </Grid2>
                }
                {
                    didSelectSegments &&
                    <Grid2>
                        <ActionButton
                            color="inherit"
                            size="medium"
                            variant="extended"
                            onClick={onClear}
                        >
                            <ClearIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                            Limpiar
                        </ActionButton>
                    </Grid2>
                }
                {
                    (didSelectSegments && !canClean) &&
                    <Grid2>
                        <Typography variant="caption" color="textSecondary">
                            No se puede iniciar la limpieza de habitaciones mientras el robot está ocupado
                        </Typography>
                    </Grid2>
                }
            </Grid2>
            <IntegrationHelpDialog
                dialogOpen={integrationHelpDialogOpen}
                setDialogOpen={(open: boolean) => {
                    setIntegrationHelpDialogOpen(open);
                }}
                coordinatesWarning={false}
                helperText={"Para iniciar la limpieza de las habitaciones seleccionadas con los parámetros configurados mediante MQTT o REST, utiliza este contenido."}
                payload={integrationHelpDialogPayload}
            />
        </>
    );
};

export default SegmentActions;
