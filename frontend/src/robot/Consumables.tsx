import React from "react";
import PaperContainer from "../components/PaperContainer";
import {
    ConsumableMeta,
    ConsumableState,
    useConsumablePropertiesQuery,
    useConsumableResetMutation,
    useConsumableStateQuery
} from "../api";
import {
    Alert,
    Box,
    Button,
    LinearProgress,
    Paper,
    Skeleton,
    Stack,
    Typography
} from "@mui/material";
import {
    Autorenew as ResetIcon,
    CheckCircle as GoodIcon,
    WarningAmber as WarningIcon
} from "@mui/icons-material";
import {convertSecondsToHumans, getConsumableName} from "../utils";
import ConfirmationDialog from "../components/ConfirmationDialog";
import {ConsumablesHelp} from "./res/ConsumablesHelp";

const ConsumableCard: React.FunctionComponent<{
    consumable: ConsumableMeta,
    state?: ConsumableState
}> = ({
    consumable,
    state
}): React.ReactElement => {
    const {
        mutate: resetConsumable,
        isPending: resetConsumableIsExecuting
    } = useConsumableResetMutation();

    const [dialogOpen, setDialogOpen] = React.useState(false);

    let secondaryLabel = "Sin información disponible";
    let percentRemaining: number | undefined;

    if (state) {
        if (state.remaining.unit === "minutes") {
            secondaryLabel = convertSecondsToHumans(
                60 * state.remaining.value,
                false
            );
        } else {
            secondaryLabel = `${state.remaining.value} %`;
        }

        if (state.remaining.value <= 0) {
            secondaryLabel = "Agotado";
        }

        if (consumable.unit === "percent") {
            percentRemaining = state.remaining.value;
        } else if (consumable.maxValue !== undefined) {
            percentRemaining =
                (state.remaining.value / consumable.maxValue) * 100;
        }

        if (percentRemaining !== undefined) {
            percentRemaining = Math.round(percentRemaining);
            percentRemaining = Math.max(percentRemaining, 0);
            percentRemaining = Math.min(percentRemaining, 100);
        }
    }

    const isEmpty =
        state?.remaining.value !== undefined &&
        state.remaining.value <= 0;

    const isLow =
        percentRemaining !== undefined &&
        percentRemaining <= 20 &&
        !isEmpty;

    let borderColor = "divider";
    let iconBackground = "action.hover";

    if (isEmpty) {
        borderColor = "warning.main";
        iconBackground = "warning.main";
    }

    if (!isEmpty && isLow) {
        borderColor = "warning.light";
        iconBackground = "warning.light";
    }

    let icon: React.ReactNode = <GoodIcon/>;

    if (isEmpty || isLow) {
        icon = <WarningIcon/>;
    }

    let buttonVariant: "contained" | "outlined" = "outlined";
    let buttonColor: "warning" | "inherit" = "inherit";

    if (isEmpty) {
        buttonVariant = "contained";
        buttonColor = "warning";
    }

    let stateDescription = `Estado: ${secondaryLabel}`;

    if (isEmpty) {
        stateDescription = "Necesita reemplazo o mantenimiento";
    }

    let percentageColor = "text.primary";

    if (isEmpty || isLow) {
        percentageColor = "warning.main";
    }

    let progressColor: "primary" | "warning" = "primary";

    if (isEmpty || isLow) {
        progressColor = "warning";
    }

    const consumableName = getConsumableName(
        consumable.type,
        consumable.subType
    );

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    p: {xs: 2, sm: 2.5},
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: borderColor,
                    transition: "all .2s ease",
                    "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 3
                    }
                }}
            >
                <Stack spacing={1.5}>
                    <Stack
                        direction={{xs: "column", sm: "row"}}
                        spacing={2}
                        alignItems={{xs: "stretch", sm: "center"}}
                        justifyContent="space-between"
                    >
                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                        >
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    flexShrink: 0,
                                    borderRadius: 2.5,
                                    display: "grid",
                                    placeItems: "center",
                                    bgcolor: iconBackground,
                                }}
                            >
                                {icon}
                            </Box>

                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    {consumableName}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {stateDescription}
                                </Typography>
                            </Box>
                        </Stack>

                        <Button
                            variant={buttonVariant}
                            color={buttonColor}
                            startIcon={<ResetIcon/>}
                            onClick={() => setDialogOpen(true)}
                            disabled={resetConsumableIsExecuting}
                            sx={{
                                borderRadius: 2.5,
                                minHeight: 42,
                                px: 2
                            }}
                        >
                            Restablecer
                        </Button>
                    </Stack>

                    {percentRemaining !== undefined && (
                        <Box>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{mb: .75}}
                            >
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Vida útil restante
                                </Typography>

                                <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    color={percentageColor}
                                >
                                    {percentRemaining}%
                                </Typography>
                            </Stack>

                            <LinearProgress
                                variant="determinate"
                                value={percentRemaining}
                                color={progressColor}
                                sx={{
                                    height: 9,
                                    borderRadius: 99
                                }}
                            />
                        </Box>
                    )}
                </Stack>
            </Paper>

            <ConfirmationDialog
                title="¿Restablecer consumible?"
                text={(
                    <>
                        ¿Realmente quieres restablecer el consumible{" "}
                        <strong>{consumableName}</strong>?
                    </>
                )}
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onAccept={() => {
                    setDialogOpen(false);
                    resetConsumable(consumable);
                }}
            />
        </>
    );
};

const Consumables = (): React.ReactElement => {
    const {
        data: consumableProperties,
        isPending: consumablePropertiesPending,
    } = useConsumablePropertiesQuery();

    const {
        data: consumablesData,
        isPending: consumablesDataPending
    } = useConsumableStateQuery();

    const loading =
        consumablePropertiesPending ||
        consumablesDataPending;

    return (
        <PaperContainer>
            <Paper
                elevation={0}
                sx={{
                    p: {xs: 2, sm: 3},
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider"
                }}
            >
                <Stack spacing={3}>
                    <Box>
                        <Typography
                            variant="h5"
                            fontWeight={800}
                            sx={{letterSpacing: "-0.02em"}}
                        >
                            Consumibles
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{mt: .5}}
                        >
                            Consulta la vida útil de los consumibles y
                            restablece su contador cuando los sustituyas.
                        </Typography>
                    </Box>

                    {loading && (
                        <Stack spacing={1.5}>
                            <Skeleton variant="rounded" height={110}/>
                            <Skeleton variant="rounded" height={110}/>
                            <Skeleton variant="rounded" height={110}/>
                        </Stack>
                    )}

                    {!loading && consumableProperties && consumablesData && (
                        <Stack spacing={1.5}>
                            {consumableProperties.availableConsumables.map(
                                (consumable) => (
                                    <ConsumableCard
                                        key={`${consumable.type}_${consumable.subType}`}
                                        consumable={consumable}
                                        state={consumablesData.find(
                                            (entry) => (
                                                entry.type === consumable.type &&
                                                entry.subType === consumable.subType
                                            )
                                        )}
                                    />
                                )
                            )}

                            {consumableProperties.availableConsumables.length === 0 && (
                                <Alert
                                    severity="info"
                                    sx={{borderRadius: 3}}
                                >
                                    No hay consumibles disponibles.
                                </Alert>
                            )}
                        </Stack>
                    )}
                </Stack>
            </Paper>

            <Paper
                elevation={0}
                sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider"
                }}
            >
                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Restablece un contador después de sustituir o realizar
                    el mantenimiento del consumible correspondiente.
                </Typography>
            </Paper>

            <Box sx={{display: "none"}}>
                {ConsumablesHelp}
            </Box>
        </PaperContainer>
    );
};

export default Consumables;
