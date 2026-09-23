import React from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    Paper,
    Stack,
    Typography
} from "@mui/material";
import {
    CheckCircle as CheckCircleIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    RestartAlt as RestartAltIcon,
    SystemUpdate as SystemUpdateIcon
} from "@mui/icons-material";
import PaperContainer from "../../components/PaperContainer";
import {
    fetchX40ControlOTAInformation,
    sendX40ControlOTAUpdate
} from "../../api/client";

interface X40ControlOTAInformation {
    product: string;
    installed: boolean;
    installedVersion: string | null;
    availableVersion: string;
    installedSha256: string;
    expectedSha256: string;
    requiresReboot: boolean;
    changelog: string[];
}

const compareVersions = (a: string, b: string): number => {
    const aParts = a.split(".").map(Number);
    const bParts = b.split(".").map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = aParts[i] ?? 0;
        const bPart = bParts[i] ?? 0;

        if (aPart > bPart) {
            return 1;
        }

        if (aPart < bPart) {
            return -1;
        }
    }

    return 0;
};

const X40ControlOTA = (): React.ReactElement => {
    const [ota, setOTA] = React.useState<X40ControlOTAInformation | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [updating, setUpdating] = React.useState(false);
    const [restarting, setRestarting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [updateResult, setUpdateResult] = React.useState<string | null>(null);
    const [showRestart, setShowRestart] = React.useState(false);

    const checkForUpdates = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        setUpdateResult(null);

        try {
            const data = await fetchX40ControlOTAInformation();
            setOTA(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("No se pudo consultar el estado OTA");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const updateX40Control = React.useCallback(async () => {
        setUpdating(true);
        setError(null);
        setUpdateResult(null);
        setShowRestart(false);

        try {
            const result = await sendX40ControlOTAUpdate();

            if (!result.success) {
                throw new Error(result.error || "La actualización OTA falló");
            }

            setUpdateResult(
                `X40Control ${ota?.availableVersion || ""} se ha instalado correctamente.`
            );

            if (ota?.requiresReboot) {
                setShowRestart(true);
            }

            await checkForUpdates();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("No se pudo ejecutar la actualización OTA");
            }
        } finally {
            setUpdating(false);
        }
    }, [checkForUpdates, ota]);

    const restartRobot = React.useCallback(async () => {
        setRestarting(true);
        setError(null);

        try {
            const response = await fetch("/api/v2/valetudo/x40-control/reboot", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("No se pudo solicitar el reinicio del robot");
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("No se pudo reiniciar el robot");
            }

            setRestarting(false);
        }
    }, []);

    React.useEffect(() => {
        void checkForUpdates();
    }, [checkForUpdates]);

    const updateAvailable =
        ota !== null &&
        compareVersions(
            ota.availableVersion,
            ota.installedVersion || "0"
        ) > 0;

    const statusLabel = (() => {
        if (loading) {
            return "Comprobando...";
        }

        if (error) {
            return "Error";
        }

        if (updateResult) {
            return "Actualizado";
        }

        if (!ota) {
            return "Sin información";
        }

        if (!ota.installed) {
            return "Instalación no reconocida";
        }

        if (updateAvailable) {
            return "Nueva versión";
        }

        return "Al día";
    })();

    const statusColor =
        error ?
            "error" :
            updateAvailable ?
                "warning" :
                updateResult || ota ?
                    "success" :
                    "default";

    return (
        <PaperContainer>
            <Box sx={{width: "100%"}}>
                <Paper
                    elevation={0}
                    sx={{
                        p: {xs: 2, sm: 2.5},
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "divider",
                        position: "relative",
                        overflow: "hidden",
                        background: "background.paper",
                        transition: "all .2s ease",
                        "&:hover": {
                            boxShadow: 3
                        },
                        "&::before": {
                            content: "\"\"",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background: "linear-gradient(90deg, #1976d2, #42a5f5)"
                        }
                    }}
                >
                    <Stack spacing={2.5}>
                        <Stack
                            direction={{xs: "column", sm: "row"}}
                            spacing={2}
                            alignItems={{xs: "flex-start", sm: "center"}}
                            justifyContent="space-between"
                        >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Paper
                                    elevation={0}
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 3,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "action.hover"
                                    }}
                                >
                                    <SystemUpdateIcon/>
                                </Paper>

                                <Box>
                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                    >
                                        Actualización X40Control
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Gestiona las actualizaciones de la capa personalizada
                                    </Typography>
                                </Box>
                            </Stack>

                            <Chip
                                label={statusLabel}
                                color={statusColor}
                                size="small"
                                icon={
                                    statusLabel === "Al día" ||
                                    statusLabel === "Actualizado" ?
                                        <CheckCircleIcon/> :
                                        undefined
                                }
                                sx={{
                                    fontWeight: 700,
                                    borderRadius: 2
                                }}
                            />
                        </Stack>

                        <Divider/>

                        <Stack
                            direction={{xs: "column", sm: "row"}}
                            spacing={1.5}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    flex: 1,
                                    p: 2,
                                    borderRadius: 3,
                                    backgroundColor: "action.hover"
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Versión instalada
                                </Typography>

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    sx={{mt: .5}}
                                >
                                    {ota?.installedVersion || "—"}
                                </Typography>
                            </Paper>

                            <Paper
                                elevation={0}
                                sx={{
                                    flex: 1,
                                    p: 2,
                                    borderRadius: 3,
                                    backgroundColor: "action.hover"
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Última versión disponible
                                </Typography>

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    sx={{mt: .5}}
                                >
                                    {ota?.availableVersion || "—"}
                                </Typography>
                            </Paper>
                        </Stack>

                        {error && (
                            <Alert
                                severity="error"
                                sx={{borderRadius: 3}}
                            >
                                {error}
                            </Alert>
                        )}

                        {updateResult && (
                            <Alert
                                severity="success"
                                sx={{borderRadius: 3}}
                            >
                                {updateResult}
                            </Alert>
                        )}

                        {ota && updateAvailable && (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    border: "1px solid",
                                    borderColor: "warning.main",
                                    backgroundColor: "warning.50"
                                }}
                            >
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={700}
                                >
                                    Nueva versión disponible
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{mt: .5}}
                                >
                                    Hay una versión más reciente de X40Control lista
                                    para instalar.
                                </Typography>

                                {ota.changelog.length > 0 && (
                                    <Stack spacing={.5} sx={{mt: 1.5}}>
                                        {ota.changelog.map((change, index) => (
                                            <Typography
                                                key={`${change}-${index}`}
                                                variant="body2"
                                            >
                                                • {change}
                                            </Typography>
                                        ))}
                                    </Stack>
                                )}
                            </Paper>
                        )}

                        <Stack
                            direction={{xs: "column", sm: "row"}}
                            spacing={1}
                        >
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon/>}
                                onClick={() => void checkForUpdates()}
                                disabled={loading || updating}
                                sx={{
                                    borderRadius: 2.5,
                                    minHeight: 44,
                                    fontWeight: 700
                                }}
                            >
                                {loading ? "Comprobando..." : "Comprobar actualizaciones"}
                            </Button>

                            {updateAvailable && (
                                <Button
                                    variant="contained"
                                    color="warning"
                                    startIcon={<DownloadIcon/>}
                                    onClick={() => void updateX40Control()}
                                    disabled={updating || loading}
                                    sx={{
                                        borderRadius: 2.5,
                                        minHeight: 44,
                                        fontWeight: 700
                                    }}
                                >
                                    {updating ?
                                        "Actualizando..." :
                                        `Actualizar a ${ota?.availableVersion}`}
                                </Button>
                            )}

                            {showRestart && ota?.requiresReboot && (
                                <Button
                                    variant="contained"
                                    color="warning"
                                    startIcon={<RestartAltIcon/>}
                                    onClick={() => void restartRobot()}
                                    disabled={restarting}
                                    sx={{
                                        borderRadius: 2.5,
                                        minHeight: 44,
                                        fontWeight: 700
                                    }}
                                >
                                    {restarting ? "Reiniciando..." : "Reiniciar robot"}
                                </Button>
                            )}
                        </Stack>

                        {ota && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{textAlign: "center"}}
                            >
                                {ota.requiresReboot ?
                                    "Esta versión puede requerir reiniciar el robot después de actualizar." :
                                    "No se requiere reinicio para esta actualización."}
                            </Typography>
                        )}
                    </Stack>
                </Paper>
            </Box>
        </PaperContainer>
    );
};

export default X40ControlOTA;
