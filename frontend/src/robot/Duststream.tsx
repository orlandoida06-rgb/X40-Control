import {Box, Typography} from "@mui/material";
import {FetchSource, Player} from "jsmpeg";
import type {JSMpegOptions} from "jsmpeg";
import React from "react";
import {valetudoAPIBaseURL, Capability} from "../api";
import {useDuststreamingPropertiesQuery, useDuststreamingConfigurationQuery, useDuststreamingConfigurationMutation} from "../api";
import PaperContainer from "../components/PaperContainer";
import ManualControl from "./ManualControl";

const STREAM_URL = `${valetudoAPIBaseURL}/robot/capabilities/${Capability.Duststreaming}/stream`;

type DuststreamCanvasProps = {
    dimensions: {
        width: number,
        height: number
    };
};

export const DuststreamCanvas = ({
    dimensions
}: DuststreamCanvasProps): React.ReactElement => {
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
            videoHeight: dimensions.height,
        };

        const player = new Player(STREAM_URL, options);

        return () => {
            try {
                player.destroy();
            } catch (e) {
                // intentional
            }
        };
    }, [dimensions.width, dimensions.height]);

    return (
        <Box sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "#000",
            overflow: "hidden"
        }}>
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

export const DuststreamPlaceholder = ({
    dimensions,
    caption,
}: {
    dimensions: {width: number, height: number},
    caption?: string,
}): React.ReactElement => {
    return (
        <Box sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "#000",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
        }}>
            <Box sx={{
                flex: 1,
                minHeight: 0,
                display: "flex"
            }}>
                <img
                    alt="Esperando vídeo de la cámara"
                    style={{
                        margin: "auto",
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain"
                    }}
                />
            </Box>
            {caption && (
                <Typography
                    variant="body2"
                    flexShrink={0}
                    sx={{
                        position: "absolute",
                        bottom: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "100%",
                        maxWidth: 600,
                        textAlign: "center",
                        bgcolor: "rgba(0,0,0,0.7)",
                        color: "white",
                        py: 1,
                        px: 2,
                        boxSizing: "border-box",
                        wordBreak: "break-word"
                    }}
                >
                    {caption}
                </Typography>
            )}
        </Box>
    );
};

const Duststream = (): React.ReactElement => {
    const {data: properties} = useDuststreamingPropertiesQuery();
    const {data: configuration} = useDuststreamingConfigurationQuery();
    const configurationMutation = useDuststreamingConfigurationMutation();




    const [isFullscreen, setIsFullscreen] = React.useState(false);

    const showVideo = !!(properties && properties.duststreamerInstalled);

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
        return () => {
            window.removeEventListener("keydown", handler);
        };
    }, [isFullscreen]);

    return (
        <PaperContainer
            containerStyle={{
                display: "flex",
                flexDirection: "column",
                flex: "1 1 auto",
                height: "calc(100dvh - 110px)",
                minHeight: 0,
                overflowY: "auto",
            }}
            paperStyle={{
                display: "flex",
                flexDirection: "column",
                flex: "1 1 auto",
                minHeight: 0,
                overflow: "visible",
            }}
        >
            {properties && (
                <Box
                    onClick={() => {
                        setIsFullscreen((prev) => !prev);
                    }}
                    sx={{
                        position: isFullscreen ? "fixed" : "relative",
                        inset: isFullscreen ? 0 : undefined,
                        zIndex: isFullscreen ? 1300 : undefined,
                        height: isFullscreen ? "100%" : undefined,
                        width: isFullscreen ? "100%" : { xs: "100%", md: "60%" },
                        maxWidth: isFullscreen ? "100%" : 760,
                        aspectRatio: isFullscreen ? undefined : `${properties.width} / ${properties.height}`,
                        mx: "auto",
                        flex: "0 0 auto",
                        minHeight: 0,
                        bgcolor: "#000",
                        cursor: "pointer",
                        userSelect: "none",
                        display: isFullscreen ? "flex" : undefined,
                        justifyContent: isFullscreen ? "center" : undefined,
                        alignItems: isFullscreen ? "center" : undefined,
                    }}
                >
                    {showVideo ? (
                        <DuststreamCanvas dimensions={properties}/>
                    ) : (
                        <DuststreamPlaceholder dimensions={properties}/>
                    )}
                </Box>
            )}
            <Box sx={{ width: "100%", mt: 2, flex: "0 0 auto" }}>
                <ManualControl />
            </Box>
        </PaperContainer>
    );
};

export default Duststream;
