import {
    Box,
    Grid2,
    Paper,
    Skeleton,
    SvgIconProps,
    Typography,
} from "@mui/material";
import React, {ReactNode} from "react";
import LoadingFade from "../components/LoadingFade";

interface ControlsCardProps {
    icon: React.ComponentType<SvgIconProps>;
    title: string;
    pending?: boolean;
    children: ReactNode;
    isLoading?: boolean
}

const ControlsCard: React.FC<ControlsCardProps> = ({
    icon: Icon,
    title,
    pending = false,
    children,
    isLoading
}) => (
    <Grid2>
        <Paper
            elevation={0}
            sx={{
                borderRadius: "18px",
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                background: (theme) =>
                    theme.palette.mode === "dark" ?
                        "rgba(255,255,255,0.035)" :
                        theme.palette.background.paper,
                boxShadow: (theme) =>
                    theme.palette.mode === "dark" ?
                        "0 8px 30px rgba(0,0,0,0.22)" :
                        "0 4px 18px rgba(0,0,0,0.06)",
            }}
        >
            <Grid2 container direction="column">
                <Box
                    sx={{
                        px: 2,
                        pt: 1.75,
                        pb: 1,
                    }}
                >
                    <Grid2
                        container
                        alignItems="center"
                        spacing={1}
                    >
                        <Grid2
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                opacity: 0.8,
                            }}
                        >
                            <Icon fontSize="small" />
                        </Grid2>

                        <Grid2>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 600,
                                    letterSpacing: "0.02em",
                                    lineHeight: 1.2,
                                }}
                            >
                                {title}
                            </Typography>
                        </Grid2>

                        <Grid2>
                            <LoadingFade
                                in={pending}
                                transitionDelay={pending ? "500ms" : "0ms"}
                                size={20}
                            />
                        </Grid2>
                    </Grid2>
                </Box>

                <Box
                    sx={{
                        px: 1.5,
                        pb: 1.5,
                    }}
                >
                    {isLoading ? (
                        <Skeleton height="4rem" />
                    ) : (
                        children
                    )}
                </Box>
            </Grid2>
        </Paper>
    </Grid2>
);

export default ControlsCard;
