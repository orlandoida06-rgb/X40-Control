import React from "react";
import {Box} from "@mui/material";
import {Route} from "react-router";
import {Navigate, Routes} from "react-router-dom";
import Duststream from "./Duststream";
import Consumables from "./Consumables";
import ManualControl from "./ManualControl";
import TotalStatistics from "./TotalStatistics";

const CameraPage = (): React.ReactElement => (
    <Box
        sx={{
            display: "grid",
            gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                md: "minmax(0, 1.6fr) minmax(320px, 1fr)",
            },
            alignItems: "start",
            gap: {xs: 1.5, md: 2},
            width: "100%",
            minWidth: 0,
            pb: 2,
            "& > *": {
                minWidth: 0,
                width: "100%",
            },
        }}
    >
        <Duststream />
        <ManualControl showCameraPreview={false} />
    </Box>
);

const RobotRouter = (): React.ReactElement => (
    <Routes>
        <Route path="camera" element={<CameraPage />} />
        <Route path="consumables" element={<Consumables />} />
        <Route path="manual_control" element={<ManualControl />} />
        <Route path="total_statistics" element={<TotalStatistics />} />
        <Route path="*" element={<Navigate to="/" />} />
    </Routes>
);

export default RobotRouter;
