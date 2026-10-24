import {Box, FormControlLabel, Paper, Stack, Switch, Typography} from "@mui/material";
import {FetchSource, Player} from "jsmpeg";
import type {JSMpegOptions} from "jsmpeg";
import React from "react";
import {
    Capability,
    useDuststreamingConfigurationMutation,
    useDuststreamingConfigurationQuery,
    useDuststreamingPropertiesQuery,
    valetudoAPIBaseURL
} from "../api";
import PaperContainer from "../components/PaperContainer";

const STREAM_URL = `${valetudoAPIBaseURL}/robot/capabilities/${Capability.Duststreaming}/stream`;

type DuststreamCanvasProps = {
    dimensions: {
        width: number,
        height: number
    };
};

const DuststreamCanvas = ({dimensions}: DuststreamCanvasProps): React.ReactElement => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        const options: JSMpegOptions = {
            source: FetchSource,
            canvas: canvasRef.current,
            autoplay: true,
            reconnectInterval: 3,
            decodeFirstFrame: false,
            videoWidth: dimensions.width,
            videoHeight: dimensions.height
        };

        const player = new Player(STREAM_URL, options);

        return () => {
            try {
                player.destroy();
            } catch (e) {
                // El reproductor puede haberse cerrado previamente.
            }
        };
    }, [dimensions.width, dimensions.height]);

    return (
        <Box sx={{position: "absolute", inset: 0, bgcolor: "#000", overflow: "hidden"}}>
            <canvas
                ref={canvasRef}
                style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "contain"
                }}
            />
        </Box>
    );
};

const Duststream = (): React.ReactElement => {
    const {data: configuration, isPending: configurationPending, isError: configurationError} =
        useDuststreamingConfigurationQuery();
    const {data: properties, isPending: propertiesPending, isError: propertiesError} =
        useDuststreamingPropertiesQuery();
    const {mutate: updateConfiguration, isPending: updatingConfiguration} =
        useDuststreamingConfigurationMutation();
    const [isFullscreen, setIsFullscreen] = React.useState(false);

    const enabled = configuration?.enabled === true;
    const showVideo = enabled && !!properties?.duststreamerInstalled;

    React.useEffect(() => {
        if (!isFullscreen) {
            return;
        }

        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsFullscreen(false);
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isFullscreen]);

    return (
        <PaperContainer
            containerStyle={{
                display: "flex",
                flexDirection: "column",
                flex: "0 1 auto",
                maxHeight: "100%",
                minHeight: 0
            }}
            paperStyle={{
                display: "flex",
                flexDirection: "column",
                flex: "0 1 auto",
                maxHeight: "100%",
                minHeight: 0,
                overflow: "hidden"
            }}
        >
            <Stack spacing={1} sx={{p: 2}}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={enabled}
                            disabled={configurationPending || updatingConfiguration || configurationError}
                            onChange={(event) => {
                                setIsFullscreen(false);
                                updateConfiguration(event.target.checked);
                            }}
                        />
                    }
                    label="Activar cámara"
                    sx={{ml: 0}}
                />

                {configurationError && (
                    <Typography color="error">
                        No se pudo cargar la configuración de la cámara.
                    </Typography>
                )}

                {propertiesError && (
                    <Typography color="error">
                        No se pudieron consultar las propiedades de la cámara.
                    </Typography>
                )}

                {configurationPending || propertiesPending ? (
                    <Typography variant="body2">Comprobando cámara…</Typography>
                ) : !properties?.duststreamerInstalled ? (
                    <Typography variant="body2">
                        El ejecutable Duststreamer no está instalado.
                    </Typography>
                ) : !enabled ? (
                    <Typography variant="body2">
                        Cámara desactivada. Actívala para iniciar la transmisión.
                    </Typography>
                ) : (
                    <Typography variant="body2">
                        Cámara activada.
                    </Typography>
                )}
            </Stack>

            {properties && showVideo && (
                <Paper
                    onClick={() => setIsFullscreen((previous) => !previous)}
                    sx={{
                        position: isFullscreen ? "fixed" : "relative",
                        inset: isFullscreen ? 0 : undefined,
                        zIndex: isFullscreen ? 1300 : undefined,
                        width: "100%",
                        aspectRatio: isFullscreen ? undefined : `${properties.width} / ${properties.height}`,
                        mx: "auto",
                        flex: "0 1 auto",
                        minHeight: 0,
                        bgcolor: "#000",
                        cursor: "pointer",
                        overflow: "hidden",
                        display: isFullscreen ? "flex" : undefined,
                        justifyContent: isFullscreen ? "center" : undefined,
                        alignItems: isFullscreen ? "center" : undefined
                    }}
                >
                    <DuststreamCanvas dimensions={properties}/>
                </Paper>
            )}
        </PaperContainer>
    );
};

export default Duststream;
