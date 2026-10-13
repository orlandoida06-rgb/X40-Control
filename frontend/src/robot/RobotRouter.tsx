import React from "react";
import {Route} from "react-router";
import {Navigate, Routes} from "react-router-dom";
import Consumables from "./Consumables";
import Duststream from "./Duststream";
import ManualControl from "./ManualControl";
import TotalStatistics from "./TotalStatistics";

const RobotRouter = (): React.ReactElement => (
    <Routes>
        <Route path="camera" element={<Duststream />} />
        <Route path="consumables" element={<Consumables />} />
        <Route path="manual_control" element={<ManualControl />} />
        <Route path="total_statistics" element={<TotalStatistics />} />
        <Route path="*" element={<Navigate to="/" />} />
    </Routes>
);

export default RobotRouter;
