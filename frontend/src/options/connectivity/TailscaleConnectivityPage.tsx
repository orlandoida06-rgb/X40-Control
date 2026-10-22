import React from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Grid2,
    Skeleton,
    Typography
} from "@mui/material";
import {
    CheckCircle as ConnectedIcon,
    Refresh as RefreshIcon,
    VpnLock as TailscaleIcon
} from "@mui/icons-material";
import PaperContainer from "../../components/PaperContainer";
import DetailPageHeaderRow from "../../components/DetailPageHeaderRow";
import {valetudoAPI} from "../../api/client";

interface TailscaleStatus {
    installed: boolean;
    running: boolean;
    authenticated: boolean;
    version?: string | null;
    backendState?: string | null;
    ips?: string[];
    hostname?: string | null;
    dnsName?: string | null;
    serveUrl?: string | null;
    authUrl?: string | null;
    health?: string[];
}

const TailscaleConnectivityPage = (): React.ReactElement => {
    const [status, setStatus] = React.useState<TailscaleStatus | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");

    const refreshStatus = React.useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await valetudoAPI.get<TailscaleStatus>(
                "/valetudo/x40-control/tailscale"
            );
            setStatus(response.data);
        } catch (err) {
            setError(
                "No se pudo consultar Tailscale. Comprueba que el backend de X40-Control esté actualizado."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        void refreshStatus();
    }, [refreshStatus]);

    const executeAction = async (action: "install" | "up" | "down" | "serve" | "uninstall") => {
        setBusy(true);
        setError("");
        setMessage("");

        try {
            const response = await valetudoAPI.post(
                "/valetudo/x40-control/tailscale/action",
                {action: action}
            );

            setMessage(
                typeof response.data?.message === "string" ?
                    response.data.message :
                    "Solicitud completada."
            );

            await refreshStatus();
        } catch (err: any) {
            setError(
                err?.response?.data?.error ||
                "No se pudo ejecutar la operación de Tailscale."
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <PaperContainer>
            <Grid2 container direction="row">
                <Box sx={{width: "100%"}}>
                    <DetailPageHeaderRow
                        title="Conectividad Tailscale"
                        icon={<TailscaleIcon />}
                    />

                    <Alert severity="info" sx={{mb: 2}}>
                        Gestiona la conexión privada del robot y consulta el enlace HTTPS de Valetudo. El acceso HTTPS requiere que Tailscale Serve esté configurado.
                    </Alert>

                    {loading && !status ? (
                        <Skeleton height="8rem" />
                    ) : (
                        <>
                            {error && (
                                <Alert severity="error" sx={{mb: 2}}>
                                    {error}
                                </Alert>
                            )}

                            {message && (
                                <Alert severity="success" sx={{mb: 2}}>
                                    {message}
                                </Alert>
                            )}

                            {status && (
                                <Card sx={{mb: 2}}>
                                    <CardContent>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                mb: 2
                                            }}
                                        >
                                            <ConnectedIcon
                                                color={
                                                    status.running &&
                                                    status.authenticated ?
                                                        "success" :
                                                        "disabled"
                                                }
                                            />
                                            <Typography variant="h6">
                                                {status.running &&
                                                status.authenticated ?
                                                    "Conectado" :
                                                    status.installed ?
                                                        "Binarios instalados; servicio pendiente" :
                                                        "No instalado"}
                                            </Typography>
                                        </Box>

                                        <Divider sx={{mb: 2}} />

                                        <Typography>
                                            <strong>Instalado:</strong>{" "}
                                            {status.installed ? "Sí" : "No"}
                                        </Typography>
                                        <Typography>
                                            <strong>Versión:</strong>{" "}
                                            {status.version || "—"}
                                        </Typography>
                                        <Typography>
                                            <strong>Estado:</strong>{" "}
                                            {status.backendState || "—"}
                                        </Typography>
                                        <Typography>
                                            <strong>Nombre:</strong>{" "}
                                            {status.hostname || "—"}
                                        </Typography>
                                        <Typography>
                                            <strong>IP de Tailscale:</strong>{" "}
                                            {status.ips?.join(", ") || "—"}
                                        </Typography>
                                        <Typography sx={{overflowWrap: "anywhere"}}>
                                            <strong>DNS:</strong>{" "}
                                            {status.dnsName || "—"}
                                        </Typography>

                                        {status.serveUrl && (
                                            <Typography sx={{overflowWrap: "anywhere"}}>
                                                <strong>HTTPS Serve:</strong>{" "}
                                                <a
                                                    href={status.serveUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {status.serveUrl}
                                                </a>
                                            </Typography>
                                        )}

                                        {status.authUrl && (
                                            <Alert severity="warning" sx={{mt: 2}}>
                                                Falta autorizar el dispositivo.{" "}
                                                <a
                                                    href={status.authUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Abrir enlace de autorización
                                                </a>
                                            </Alert>
                                        )}

                                    </CardContent>
                                </Card>
                            )}

                            <Grid2 container spacing={1}>
                                <Grid2>
                                    <Button
                                        variant="outlined"
                                        startIcon={<RefreshIcon />}
                                        disabled={loading || busy}
                                        onClick={() => void refreshStatus()}
                                    >
                                        Actualizar estado
                                    </Button>
                                </Grid2>

                                {status && !status.installed && (
                                    <Grid2>
                                        <Button
                                            variant="contained"
                                            disabled={busy}
                                            onClick={() => void executeAction("install")}
                                        >
                                            Instalar Tailscale
                                        </Button>
                                    </Grid2>
                                )}

                                {status?.installed && (
                                    <>
                                        <Grid2>
                                            <Button
                                                variant="contained"
                                                disabled={busy}
                                                onClick={() => void executeAction("up")}
                                            >
                                                Conectar / autorizar
                                            </Button>
                                        </Grid2>
                                        <Grid2>
                                            <Button
                                                variant="outlined"
                                                color="warning"
                                                disabled={busy || !status.running}
                                                onClick={() => void executeAction("down")}
                                            >
                                                Desconectar
                                            </Button>
                                        </Grid2>
                                        <Grid2>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                disabled={busy || !status.running || !status.authenticated}
                                                onClick={() => void executeAction("serve")}
                                            >
                                                Activar HTTPS
                                            </Button>
                                        </Grid2>
                                        <Grid2>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                disabled={busy}
                                                onClick={() => {
                                                    if (window.confirm("¿Desinstalar Tailscale? Se conservarán las claves y el estado guardado.")) {
                                                        void executeAction("uninstall");
                                                    }
                                                }}
                                            >
                                                Desinstalar Tailscale
                                            </Button>
                                        </Grid2>
                                    </>
                                )}
                            </Grid2>


                        </>
                    )}
                </Box>
            </Grid2>
        </PaperContainer>
    );
};

export default TailscaleConnectivityPage;
