import {
    RobotAttributeClass,
    useRobotAttributeQuery,
} from "../api";
import {
    Box,
    Grid2,
    Paper,
    Typography,
} from "@mui/material";
import React from "react";
import ControlsCard from "./ControlsCard";
import {Extension} from "@mui/icons-material";

const Attachments = (): React.ReactElement | null => {
    const {
        data: attachments,
        isPending: isAttachmentPending,
        isError: isAttachmentError,
    } = useRobotAttributeQuery(
        RobotAttributeClass.AttachmentState
    );

    const attachmentDetails = React.useMemo(() => {
        if (isAttachmentError) {
            return (
                <Typography color="error">
                    Error loading attachment state
                </Typography>
            );
        }

        if (attachments === undefined) {
            return null;
        }

        if (attachments.length === 0) {
            return (
                <Typography
                    variant="body2"
                    sx={{
                        opacity: 0.6,
                        py: 1,
                    }}
                >
                    No attachments found
                </Typography>
            );
        }

        return (
            <Grid2
                container
                spacing={1}
                sx={{
                    width: "100%",
                    pt: 0.5,
                }}
            >
                {attachments.map(({type, attached}) => {
                    return (
                        <Grid2
                            key={type}
                            size={{
                                xs: 6,
                                sm: "grow",
                            }}
                        >
                            <Paper
                                variant="outlined"
                                sx={{
                                    minHeight: "62px",
                                    borderRadius: "14px",
                                    p: 1.25,
                                    backgroundColor: attached ?
                                        "action.selected" :
                                        "action.hover",
                                    borderColor: attached ?
                                        "success.main" :
                                        "divider",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    transition:
                                        "transform 150ms ease, background-color 150ms ease",

                                    "&:hover": {
                                        transform: "translateY(-1px)",
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 1,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 600,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {type}
                                    </Typography>

                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            flexShrink: 0,
                                            borderRadius: "50%",
                                            backgroundColor: attached ?
                                                "success.main" :
                                                "text.disabled",
                                        }}
                                    />
                                </Box>

                                <Typography
                                    variant="caption"
                                    sx={{
                                        mt: 0.4,
                                        fontSize: "0.65rem",
                                        fontWeight: 700,
                                        letterSpacing: "0.06em",
                                        textTransform: "uppercase",
                                        color: attached ?
                                            "success.main" :
                                            "text.disabled",
                                    }}
                                >
                                    {attached ?
                                        "Conectado" :
                                        "Not connected"}
                                </Typography>
                            </Paper>
                        </Grid2>
                    );
                })}
            </Grid2>
        );
    }, [attachments, isAttachmentError]);

    return (
        <ControlsCard
            icon={Extension}
            title="Attachments"
            isLoading={isAttachmentPending}
        >
            {attachmentDetails}
        </ControlsCard>
    );
};

export default Attachments;
