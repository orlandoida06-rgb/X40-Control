import {
    Box,
    Grid2,
    LinearProgress,
    linearProgressClasses,
    styled,
    Typography,
} from "@mui/material";
import React from "react";
import {
    RobotAttributeClass,
    useRobotAttributeQuery,
    useRobotStatusQuery,
} from "../api";
import {RobotMonochromeIcon} from "../components/CustomIcons";
import ControlsCard from "./ControlsCard";
import {useValetudoColorsInverse} from "../hooks/useValetudoColors";

const BatteryProgress = styled(LinearProgress)(({theme}) => ({
    height: 8,
    marginTop: theme.spacing(0.5),
    borderRadius: 99,
    backgroundColor:
        theme.palette.mode === "light" ?
            theme.palette.grey[200] :
            theme.palette.grey[800],

    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 99,
        transition: "transform 500ms ease",
    },
}));

const RobotStatus = (): React.ReactElement => {
    const palette = useValetudoColorsInverse();

    const {
        data: status,
        isPending: isStatusPending,
        isError: isStatusError,
    } = useRobotStatusQuery();

    const {
        data: batteries,
        isPending: isBatteryPending,
        isError: isBatteryError,
    } = useRobotAttributeQuery(RobotAttributeClass.BatteryState);

    const isPending = isStatusPending || isBatteryPending;

    const stateDetails = React.useMemo(() => {
        if (isStatusError) {
            return (
                <Typography color="error">
                    Error al cargar el estado del robot
                </Typography>
            );
        }

        if (status === undefined) {
            return null;
        }

        const stateLabel = status.value.toUpperCase();
        const flagLabel =
            status.flag !== "none" ?
                ` · ${status.flag.toUpperCase()}` :
                "";

        return (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1.5,
                }}
            >
                <Box
                    sx={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        backgroundColor:
                            status.value === "error" ?
                                palette.red :
                                status.value === "cleaning" ?
                                    palette.green :
                                    palette.blue,
                        boxShadow:
                            status.value === "cleaning" ?
                                `0 0 12px ${palette.green}` :
                                "none",
                    }}
                />

                <Typography
                    sx={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        lineHeight: 1,
                    }}
                >
                    {stateLabel}
                </Typography>

                {flagLabel && (
                    <Typography
                        sx={{
                            fontSize: "0.7rem",
                            opacity: 0.55,
                            letterSpacing: "0.06em",
                        }}
                    >
                        {flagLabel}
                    </Typography>
                )}
            </Box>
        );
    }, [isStatusError, palette, status]);

    const batteriesDetails = React.useMemo(() => {
        const getBatteryColor = (level: number) => {
            if (level > 60) {
                return palette.green;
            }

            if (level > 20) {
                return palette.yellow;
            }

            return palette.red;
        };

        if (isBatteryError) {
            return (
                <Typography color="error">
                    Error loading battery state
                </Typography>
            );
        }

        if (batteries === undefined) {
            return null;
        }

        if (batteries.length === 0) {
            return (
                <Typography color="textSecondary">
                    No batteries found
                </Typography>
            );
        }

        return batteries.map((battery, index) => {
            const batteryColor = getBatteryColor(battery.level);

            return (
                <Grid2
                    size="grow"
                    key={index}
                    sx={{
                        minWidth: 0,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "baseline",
                            justifyContent: "space-between",
                            gap: 1,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: "0.68rem",
                                fontWeight: 600,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                opacity: 0.55,
                            }}
                        >
                            Battery
                            {batteries.length > 1 ?
                                ` ${index + 1}` :
                                ""}
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: "1.05rem",
                                fontWeight: 700,
                                color: batteryColor,
                            }}
                        >
                            {Math.round(battery.level)}%
                        </Typography>
                    </Box>

                    <BatteryProgress
                        value={battery.level}
                        variant="determinate"
                        sx={{
                            [`& .${linearProgressClasses.bar}`]: {
                                backgroundColor: batteryColor,
                            },
                        }}
                    />
                </Grid2>
            );
        });
    }, [batteries, isBatteryError, palette]);

    return (
        <ControlsCard
            icon={RobotMonochromeIcon}
            title="X40"
            isLoading={isPending}
        >
            <Box
                sx={{
                    px: 0.5,
                    pb: 0.5,
                }}
            >
                {stateDetails}

                {batteries !== undefined && batteries.length > 0 && (
                    <Grid2
                        container
                        direction="row"
                        spacing={2}
                        width="100%"
                    >
                        {batteriesDetails}
                    </Grid2>
                )}
            </Box>
        </ControlsCard>
    );
};

export default RobotStatus;
