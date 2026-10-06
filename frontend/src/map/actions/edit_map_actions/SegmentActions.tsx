import {
    Capability,
    MapSegmentMaterial,
    RawMapLayerMaterial,
    StatusState,
    useJoinSegmentsMutation,
    useMapSegmentMaterialControlPropertiesQuery,
    useRenameSegmentMutation,
    useSetSegmentMaterialMutation,
    useSplitSegmentMutation,
    useX40ControlRoomVoicesQuery,
    useSetX40ControlRoomVoiceMutation
} from "../../../api";
import React from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid2,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from "@mui/material";
import {ActionButton} from "../../Styled";
import CuttingLineClientStructure from "../../structures/client_structures/CuttingLineClientStructure";
import {PointCoordinates} from "../../utils/types";
import {
    Clear as ClearIcon,
    ContentCut as SplitIcon,
    Dashboard as MaterialIcon,
    JoinFull as JoinIcon,
} from "@mui/icons-material";
import {AddCuttingLineIcon, RenameIcon} from "../../../components/CustomIcons";

const getMaterialLabel = (material: MapSegmentMaterial): string => {
    switch (material) {
        case MapSegmentMaterial.Generic:
            return "Generic";
        case MapSegmentMaterial.Tile:
            return "Tile";
        case MapSegmentMaterial.Wood:
            return "Wood";
        case MapSegmentMaterial.WoodHorizontal:
            return "Wood (Horizontal)";
        case MapSegmentMaterial.WoodVertical:
            return "Wood (Vertical)";
        default:
            return material;
    }
};

interface SegmentRenameDialogProps {
    open: boolean;
    onClose: () => void;
    currentName: string;
    onRename: (newName: string) => void;
}

const SegmentRenameDialog = (props: SegmentRenameDialogProps) => {
    const {open, onClose, currentName, onRename} = props;
    const [name, setName] = React.useState(currentName);

    React.useEffect(() => {
        if (open) {
            setName(currentName);
        }
    }, [open, currentName]);

    return (
        <Dialog open={open} onClose={onClose} sx={{userSelect: "none"}}>
            <DialogTitle>Renombrar habitación</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    How should the segment &apos;{currentName}&apos; be called?
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    variant="standard"
                    label="Segment name"
                    fullWidth
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            onRename(name.trim());
                        }
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button
                    onClick={() => {
                        onRename(name.trim());
                    }}
                >
                        Renombrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

interface SegmentMaterialDialogProps {
    open: boolean;
    onClose: () => void;
    name: string;
    currentMaterial: MapSegmentMaterial;
    onSubmit: (material: MapSegmentMaterial) => void;
}

const SegmentMaterialDialog = (props: SegmentMaterialDialogProps) => {
    const {open, onClose, name, currentMaterial, onSubmit} = props;
    const [material, setMaterial] = React.useState<MapSegmentMaterial>(currentMaterial);

    const {
        data: materialProperties,
        isPending: materialPropertiesPending
    } = useMapSegmentMaterialControlPropertiesQuery();

    React.useEffect(() => {
        if (open) {
            setMaterial(currentMaterial);
        }
    }, [open, currentMaterial]);

    const supportedMaterials = materialProperties?.supportedMaterials ?? [];

    return (
        <Dialog open={open} onClose={onClose} sx={{userSelect: "none"}}>
            <DialogTitle>Material de la habitación</DialogTitle>
            <DialogContent>
                <DialogContentText style={{marginBottom: "1rem"}}>
                    What material is the floor of segment &apos;{name}&apos; made of?
                </DialogContentText>
                {materialPropertiesPending ? (
                    <CircularProgress/>
                ) : (
                    <FormControl component="fieldset">
                        <RadioGroup
                            value={material}
                            onChange={(e) => setMaterial(e.target.value as MapSegmentMaterial)}
                        >
                            {supportedMaterials.map((material) => (
                                <FormControlLabel
                                    key={material}
                                    value={material}
                                    control={<Radio/>}
                                    label={getMaterialLabel(material)}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button
                    onClick={() => {
                        onSubmit(material);
                    }}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

interface SegmentActionsProperties {
    robotStatus: StatusState,
    selectedSegmentIds: string[];
    segmentNames: Record<string, string>;
    segmentMaterials: Record<string, RawMapLayerMaterial>;
    cuttingLine: CuttingLineClientStructure | undefined,

    convertPixelCoordinatesToCMSpace(coordinates: PointCoordinates): PointCoordinates

    supportedCapabilities: {
        [Capability.MapSegmentEdit]: boolean,
        [Capability.MapSegmentRename]: boolean,
        [Capability.MapSegmentMaterialControl]: boolean,
    }

    onAddCuttingLine(): void,

    onClear(): void;
}

const SegmentActions = (
    props: SegmentActionsProperties
): React.ReactElement => {
    const {
        selectedSegmentIds,
        segmentNames,
        segmentMaterials,
        cuttingLine,
        convertPixelCoordinatesToCMSpace,
        supportedCapabilities,
        onAddCuttingLine,
        onClear
    } = props;

    const [renameDialogOpen, setRenameDialogOpen] = React.useState(false);
    const [materialDialogOpen, setMaterialDialogOpen] = React.useState(false);
    const [selectedRoomVoice, setSelectedRoomVoice] = React.useState<string>("");

    const {
        mutate: joinSegments,
        isPending: joinSegmentsExecuting
    } = useJoinSegmentsMutation({
        onSuccess: onClear,
    });
    const {
        mutate: splitSegment,
        isPending: splitSegmentExecuting
    } = useSplitSegmentMutation({
        onSuccess: onClear,
    });
    const {
        mutate: renameSegment,
        isPending: renameSegmentExecuting
    } = useRenameSegmentMutation({
        onSuccess: onClear,
    });
    const {
        mutate: setSegmentMaterial,
        isPending: setSegmentMaterialExecuting
    } = useSetSegmentMaterialMutation({
        onSuccess: onClear,
    });

    const canEdit = props.robotStatus.value === "docked";

    const {
        data: roomVoices = {}
    } = useX40ControlRoomVoicesQuery();

    const {
        mutate: setRoomVoice,
        isPending: setRoomVoiceExecuting
    } = useSetX40ControlRoomVoiceMutation();

    React.useEffect(() => {
        if (selectedSegmentIds.length !== 1) {
            setSelectedRoomVoice("");
            return;
        }

        const voiceId = roomVoices[selectedSegmentIds[0]];

        if (voiceId !== undefined) {
            setSelectedRoomVoice(voiceId);
        }
    }, [
        selectedSegmentIds.length,
        selectedSegmentIds[0],
        roomVoices,
    ]);

    const handleRoomVoiceChange = React.useCallback((
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value;
        const segmentId = selectedSegmentIds[0];

        if (!segmentId) {
            return;
        }
        const voiceId = value === "" ? null : value;

        setSelectedRoomVoice(value);

        setRoomVoice(
            {
                segmentId: segmentId,
                voiceId: voiceId
            },
            {
                onSuccess: (data) => {
                    const savedVoiceId = data[segmentId];
                    setSelectedRoomVoice(
                        savedVoiceId !== undefined ? savedVoiceId : ""
                    );
                },
                onError: (error) => {
                    window.alert(
                        "Error guardando voz: " +
                        (error instanceof Error ? error.message : String(error))
                    );
                }
            }
        );
    }, [
        canEdit,
        selectedSegmentIds,
        setRoomVoice
    ]);

    const handleSplitClick = React.useCallback(() => {
        if (!canEdit || !cuttingLine || selectedSegmentIds.length !== 1) {
            return;
        }

        splitSegment({
            segment_id: selectedSegmentIds[0],
            pA: convertPixelCoordinatesToCMSpace({
                x: cuttingLine.x0,
                y: cuttingLine.y0
            }),
            pB: convertPixelCoordinatesToCMSpace({
                x: cuttingLine.x1,
                y: cuttingLine.y1
            })
        });
    }, [canEdit, splitSegment, selectedSegmentIds, cuttingLine, convertPixelCoordinatesToCMSpace]);

    const handleJoinClick = React.useCallback(() => {
        if (!canEdit || selectedSegmentIds.length !== 2) {
            return;
        }

        joinSegments({
            segment_a_id: selectedSegmentIds[0],
            segment_b_id: selectedSegmentIds[1],
        });
    }, [canEdit, joinSegments, selectedSegmentIds]);

    const handleRename = React.useCallback((name: string) => {
        if (!canEdit || selectedSegmentIds.length !== 1) {
            return;
        }
        setRenameDialogOpen(false);
        renameSegment({
            segment_id: selectedSegmentIds[0],
            name: name
        });
    }, [canEdit, renameSegment, selectedSegmentIds]);

    const handleSetMaterial = React.useCallback((material: MapSegmentMaterial) => {
        if (!canEdit || selectedSegmentIds.length !== 1) {
            return;
        }
        setMaterialDialogOpen(false);
        setSegmentMaterial({
            segment_id: selectedSegmentIds[0],
            material: material
        });
    }, [canEdit, setSegmentMaterial, selectedSegmentIds]);


    return (
        <Grid2
            container
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{
                width: "100%",
                padding: "10px",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                rowGap: 1,
                columnGap: "45px",
                position: "relative",
            }}
            direction="row-reverse"
            flexWrap="wrap"
        >
            {
                supportedCapabilities[Capability.MapSegmentEdit] &&
                (selectedSegmentIds.length === 1 || selectedSegmentIds.length === 2) &&
                cuttingLine === undefined &&

                <Grid2>
                    <ActionButton
                        disabled={joinSegmentsExecuting || !canEdit || selectedSegmentIds.length !== 2}
                        color="inherit"
                        size="medium"
                        variant="extended" sx={{fontSize: "0.8rem"}}
                        onClick={handleJoinClick}
                    >
                        <JoinIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        Unir {segmentNames[selectedSegmentIds[0]]} y {selectedSegmentIds.length === 2 ? segmentNames[selectedSegmentIds[1]] : "?"}
                        {joinSegmentsExecuting && (
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
                supportedCapabilities[Capability.MapSegmentEdit] &&
                selectedSegmentIds.length === 1 &&
                cuttingLine !== undefined &&

                <Grid2>
                    <ActionButton
                        disabled={splitSegmentExecuting || !canEdit}
                        color="inherit"
                        size="medium"
                        variant="extended" sx={{fontSize: "0.8rem"}}
                        onClick={handleSplitClick}
                    >
                        <SplitIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        Dividir {segmentNames[selectedSegmentIds[0]]}
                        {splitSegmentExecuting && (
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
                supportedCapabilities[Capability.MapSegmentRename] &&
                selectedSegmentIds.length === 1 &&
                cuttingLine === undefined &&

                <Grid2>
                    <ActionButton
                        disabled={renameSegmentExecuting || !canEdit}
                        color="inherit"
                        size="medium"
                        variant="extended" sx={{fontSize: "0.8rem"}}
                        onClick={() => {
                            setRenameDialogOpen(true);
                        }}
                    >
                        <RenameIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        Renombrar
                        {renameSegmentExecuting && (
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
                selectedSegmentIds.length === 1 &&
                cuttingLine === undefined &&

                <Grid2
                    sx={{
                        position: "absolute",
                        left: "50%",
                        bottom: "58px",
                        transform: "translateX(-50%)",
                        width: 220,
                        zIndex: 40,
                        pointerEvents: "auto",
                    }}
                >
                    <select
                        value={selectedRoomVoice}
                        disabled={setRoomVoiceExecuting}
                        onChange={(event) => handleRoomVoiceChange(
                            event as unknown as React.ChangeEvent<HTMLInputElement>
                        )}
                        style={{
                            width: 240,
                            height: 40,
                            padding: "0 12px",
                            borderRadius: 4,
                            background: "transparent",
                            color: "inherit",
                            fontSize: 14,
                        }}
                    >
                        <option value="">Sin voz</option>
                        {[
                            ["1", "Cocina"],
                            ["2", "Salón"],
                            ["3", "Dormitorio"],
                            ["4", "Baño"],
                            ["5", "Entrada"],
                            ["6", "Pasillo"],
                            ["7", "Comedor"],
                            ["8", "Despacho"],
                            ["9", "Habitación"],
                            ["10", "Habitación infantil"],
                            ["11", "Lavadero"],
                            ["12", "Terraza"],
                            ["13", "Balcón"],
                            ["14", "Garaje"],
                            ["15", "Vestidor"],
                            ["16", "Sala de juegos"],
                            ["17", "Biblioteca"],
                            ["18", "Gimnasio"],
                            ["19", "Estudio"],
                            ["20", "Sala"],
                        ].map(([voiceId, roomName]) => (
                            <option
                                key={voiceId}
                                value={voiceId}
                                style={{
                                    color: "#000",
                                    backgroundColor: "#fff",
                                }}
                            >
                                {roomName}
                            </option>
                        ))}
                    </select>
                </Grid2>
            }
            {
                supportedCapabilities[Capability.MapSegmentMaterialControl] &&
                selectedSegmentIds.length === 1 &&
                cuttingLine === undefined &&

                <Grid2>
                    <ActionButton
                        disabled={setSegmentMaterialExecuting || !canEdit}
                        color="inherit"
                        size="medium"
                        variant="extended" sx={{fontSize: "0.8rem"}}
                        onClick={() => {
                            setMaterialDialogOpen(true);
                        }}
                    >
                        <MaterialIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        Material
                        {setSegmentMaterialExecuting && (
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
                supportedCapabilities[Capability.MapSegmentEdit] &&
                selectedSegmentIds.length === 1 &&
                cuttingLine === undefined &&

                <Grid2>
                    <ActionButton
                        disabled={joinSegmentsExecuting || !canEdit}
                        color="inherit"
                        size="medium"
                        variant="extended" sx={{fontSize: "0.8rem"}}
                        onClick={onAddCuttingLine}
                    >
                        <AddCuttingLineIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        Línea de corte
                    </ActionButton>
                </Grid2>
            }
            {
                (
                    selectedSegmentIds.length > 0 ||
                    cuttingLine !== undefined
                ) &&

                <Grid2>
                    <ActionButton
                        color="inherit"
                        size="medium"
                        variant="extended" sx={{fontSize: "0.8rem"}}
                        onClick={onClear}
                    >
                        <ClearIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        Borrar segmento
                    </ActionButton>
                </Grid2>
            }
            {
                !canEdit &&
                <Grid2>
                    <Typography variant="caption" color="textSecondary">
                        Para editar las habitaciones, el robot debe estar en la base
                    </Typography>
                </Grid2>
            }
            {
                canEdit &&
                selectedSegmentIds.length === 0 &&
                <Grid2>
                    <Typography variant="caption" color="textSecondary" style={{fontSize: "1em"}}>
                        Selecciona una habitación para comenzar a editar
                    </Typography>
                </Grid2>
            }

            {
                supportedCapabilities[Capability.MapSegmentRename] && selectedSegmentIds.length === 1 &&
                <SegmentRenameDialog
                    open={renameDialogOpen}
                    onClose={() => setRenameDialogOpen(false)}
                    currentName={segmentNames[selectedSegmentIds[0]] ?? selectedSegmentIds[0]}
                    onRename={handleRename}
                />
            }

            {
                supportedCapabilities[Capability.MapSegmentMaterialControl] && selectedSegmentIds.length === 1 &&
                <SegmentMaterialDialog
                    open={materialDialogOpen}
                    onClose={() => setMaterialDialogOpen(false)}
                    name={segmentNames[selectedSegmentIds[0]] ?? selectedSegmentIds[0]}
                    currentMaterial={segmentMaterials[selectedSegmentIds[0]] as unknown as MapSegmentMaterial ?? MapSegmentMaterial.Generic}
                    onSubmit={handleSetMaterial}
                />
            }
        </Grid2>
    );
};

export default SegmentActions;
