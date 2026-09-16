import {Box, Grid2} from "@mui/material";
import {
    AppRegistration as OperationModeIcon,
} from "@mui/icons-material";
import {Capability, useRobotInformationQuery} from "../api";
import {useCapabilitiesSupported} from "../CapabilitiesProvider";
import BasicControls from "./BasicControls";
import PresetSelectionControl from "./PresetSelection";
import RobotStatus from "./RobotStatus";
import Dock from "./Dock";
import CurrentStatistics from "./CurrentStatistics";
import Attachments from "./Attachments";
import {FanSpeedMediumIcon, WaterGradeLowIcon} from "../components/CustomIcons";
import React from "react";
import {useLanguage} from "../i18n";

const ControlsBody = (): React.ReactElement => {
    const {t} = useLanguage();
    const [
        basicControls,
        fanSpeed,
        waterControl,
        operationMode,
        triggerEmptySupported,
        mopDockCleanTriggerSupported,
        mopDockDryTriggerSupported,
        currentStatistics,
    ] = useCapabilitiesSupported(
        Capability.BasicControl,
        Capability.FanSpeedControl,
        Capability.WaterUsageControl,
        Capability.OperationModeControl,
        Capability.AutoEmptyDockManualTrigger,
        Capability.MopDockCleanManualTrigger,
        Capability.MopDockDryManualTrigger,
        Capability.CurrentStatistics
    );

    const {
        data: robotInformation,
    } = useRobotInformationQuery();

    const dockSupported =
        triggerEmptySupported ||
        mopDockCleanTriggerSupported ||
        mopDockDryTriggerSupported;

    const attachmentsSupported =
        robotInformation &&
        robotInformation.modelDetails.supportedAttachments.length > 0;

    return (
        <Box
            sx={{
                width: "100%",
                userSelect: "none",
                pb: 1,
            }}
        >
            <Grid2
                container
                spacing={1.5}
                direction="column"
            >
                {basicControls && (
                    <Grid2>
                        <BasicControls />
                    </Grid2>
                )}

                <Grid2>
                    <RobotStatus />
                </Grid2>

                {(operationMode || fanSpeed || waterControl) && (
                    <Grid2>
                        <Grid2
                            container
                            spacing={1}
                        >
                            {operationMode && (
                                <Grid2
                                    size={{
                                        xs: 12,
                                        sm: 8,
                                    }}
                                >
                                    <PresetSelectionControl
                                        capability={
                                            Capability.OperationModeControl
                                        }
                                        label={t("mode")}
                                        icon={
                                            <OperationModeIcon
                                                fontSize="small"
                                            />
                                        }
                                    />
                                </Grid2>
                            )}

                            {fanSpeed && (
                                <Grid2
                                    size={{
                                        xs: 12,
                                        sm: 4,
                                    }}
                                >
                                    <PresetSelectionControl
                                        capability={
                                            Capability.FanSpeedControl
                                        }
                                        label="Fan"
                                        icon={
                                            <FanSpeedMediumIcon
                                                fontSize="small"
                                            />
                                        }
                                    />
                                </Grid2>
                            )}

                            {waterControl && (
                                <Grid2
                                    size={{
                                        xs: 12,
                                        sm: 4,
                                    }}
                                >
                                    <PresetSelectionControl
                                        capability={
                                            Capability.WaterUsageControl
                                        }
                                        label={t("water")}
                                        icon={
                                            <WaterGradeLowIcon
                                                fontSize="small"
                                            />
                                        }
                                    />
                                </Grid2>
                            )}
                        </Grid2>
                    </Grid2>
                )}

                {dockSupported && (
                    <Grid2>
                        <Dock />
                    </Grid2>
                )}

                {attachmentsSupported && (
                    <Grid2>
                        <Attachments />
                    </Grid2>
                )}

                {currentStatistics && (
                    <Grid2>
                        <CurrentStatistics />
                    </Grid2>
                )}
            </Grid2>
        </Box>
    );
};

export default ControlsBody;
