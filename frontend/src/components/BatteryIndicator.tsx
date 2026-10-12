import BatteryAlertIcon from "@mui/icons-material/BatteryAlert";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import BatteryStdIcon from "@mui/icons-material/BatteryStd";
import {Box, Typography} from "@mui/material";
import React from "react";
import {
    RobotAttributeClass,
    useRobotAttributeQuery,
} from "../api";

const BatteryIndicator = (): React.ReactElement | null => {
    const {
        data: batteries,
        isError,
    } = useRobotAttributeQuery(RobotAttributeClass.BatteryState);

    if (isError || !batteries || batteries.length === 0) {
        return null;
    }

    const level = Math.round(batteries[0].level);

    const color =
        level > 60 ?
            "#19df8a" :
            level > 20 ?
                "#f5c542" :
                "#ff5c5c";

    const BatteryIcon =
        level <= 20 ?
            BatteryAlertIcon :
            level >= 80 ?
                BatteryFullIcon :
                BatteryStdIcon;

    return (
        <Box
            sx={{
                height: 42,
                minWidth: 72,
                px: 1.25,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.6,
                borderRadius: "14px",
                background: "rgba(20,29,43,.72)",
                border: "1px solid rgba(120,160,210,.16)",
            }}
        >
            <BatteryIcon
                sx={{
                    color: color,
                    fontSize: 21,
                }}
            />
            <Typography
                sx={{
                    color: "#dce7f5",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                }}
            >
                {level + "%"}
            </Typography>
        </Box>
    );
};

export default BatteryIndicator;
