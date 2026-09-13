import {useCurrentStatisticsQuery} from "../api";
import {Box, CircularProgress, Grid2, Paper, Typography} from "@mui/material";
import {Equalizer as StatisticsIcon} from "@mui/icons-material";
import React from "react";
import {useLanguage} from "../i18n";
import {getFriendlyStatName, getHumanReadableStatValue} from "../utils";
import ControlsCard from "./ControlsCard";

const CurrentStatistics = (): React.ReactElement => {
    const {t} = useLanguage();
    const {
        data: currentStatistics,
        isPending: statisticsPending,
        isError: statisticsLoadError,
    } = useCurrentStatisticsQuery();

    const body = React.useMemo(() => {
        if (statisticsPending) {
            return (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        py: 2,
                    }}
                >
                    <CircularProgress size={22}/>
                </Box>
            );
        }

        if (
            statisticsLoadError ||
            !Array.isArray(currentStatistics)
        ) {
            return (
                <Paper
                    variant="outlined"
                    sx={{
                        borderRadius: "14px",
                        backgroundColor: "transparent",
                        borderColor: "divider",
                    }}
                >
                    <Box p={1.5}>
                        <Typography color="error">
                            Error loading current statistics
                        </Typography>
                    </Box>
                </Paper>
            );
        }

        return currentStatistics.map((stat, i) => {
            return (
                <Grid2
                    key={i}
                    size={{
                        xs: 6,
                        sm: "grow",
                    }}
                >
                    <Paper
                        variant="outlined"
                        sx={{
                            height: "100%",
                            minHeight: "72px",
                            p: 1.25,
                            borderRadius: "14px",
                            backgroundColor: "action.hover",
                            borderColor: "divider",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            overflow: "hidden",
                            transition:
                                "transform 150ms ease, background-color 150ms ease",

                            "&:hover": {
                                backgroundColor: "action.selected",
                                transform: "translateY(-1px)",
                            },
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: "0.65rem",
                                lineHeight: 1.2,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                opacity: 0.6,
                                fontWeight: 600,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {getFriendlyStatName(stat)}
                        </Typography>

                        <Typography
                            sx={{
                                mt: 0.5,
                                fontSize: "1.15rem",
                                lineHeight: 1.2,
                                fontWeight: 700,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {getHumanReadableStatValue(stat)}
                        </Typography>
                    </Paper>
                </Grid2>
            );
        });
    }, [
        statisticsPending,
        statisticsLoadError,
        currentStatistics
    ]);

    return (
        <ControlsCard
            icon={StatisticsIcon}
            title={t("statistics")}
            isLoading={statisticsPending}
        >
            <Grid2
                container
                spacing={1}
                sx={{
                    width: "100%",
                }}
            >
                {body}
            </Grid2>
        </ControlsCard>
    );
};

export default CurrentStatistics;
