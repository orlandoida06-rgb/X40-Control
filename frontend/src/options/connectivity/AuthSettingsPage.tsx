import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    Grid2,
    IconButton,
    Input,
    InputAdornment,
    InputLabel,
    Skeleton,
    TextField,
    Typography
} from "@mui/material";
import React from "react";
import {useHTTPBasicAuthConfigurationMutation, useHTTPBasicAuthConfigurationQuery} from "../../api";
import InfoBox from "../../components/InfoBox";
import PaperContainer from "../../components/PaperContainer";
import {
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    VpnKey as BasicAuthIcon
} from "@mui/icons-material";
import DetailPageHeaderRow from "../../components/DetailPageHeaderRow";

const AuthSettings = (): React.ReactElement => {
    const {
        data: storedConfiguration,
        isPending: configurationPending,
        isError: configurationError,
    } = useHTTPBasicAuthConfigurationQuery();

    const {mutate: updateConfiguration, isPending: configurationUpdating} = useHTTPBasicAuthConfigurationMutation();

    const [enabled, setEnabled] = React.useState(false);
    const [username, setUsuario] = React.useState("");
    const [password, setContraseña] = React.useState("");

    const [showContraseñaAsPlain, setShowContraseñaAsPlain] = React.useState(false);
    const [configurationModified, setConfigurationModified] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (storedConfiguration) {
            setEnabled(storedConfiguration.enabled);
            setUsuario(storedConfiguration.username);
            setContraseña(storedConfiguration.password);
        }
    }, [storedConfiguration]);

    if (configurationPending) {
        return (
            <Skeleton height={"8rem"}/>
        );
    }

    if (configurationError || !storedConfiguration) {
        return <Typography color="error">Error al cargar la configuración de Autenticación HTTP básica</Typography>;
    }

    return (
        <>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={enabled}
                        onChange={e => {
                            setEnabled(e.target.checked);
                            setConfigurationModified(true);
                        }}
                    />
                }
                label="Autenticación HTTP básica activada"
                sx={{mb: 1}}
            />
            <Grid2 container spacing={1} sx={{mb: 1}} direction="row">
                <Grid2 size="grow" style={{flexGrow: 1}}>
                    <TextField
                        style={{width: "100%"}}
                        label="Usuario"
                        value={username}
                        variant="standard"
                        disabled={!enabled}
                        onChange={e => {
                            setUsuario(e.target.value);
                            setConfigurationModified(true);
                        }}
                    />
                </Grid2>
                <Grid2 size="grow" style={{flexGrow: 1}}>
                    <FormControl style={{width: "100%"}} variant="standard">
                        <InputLabel htmlFor="standard-adornment-password">Contraseña</InputLabel>
                        <Input
                            type={showContraseñaAsPlain ? "text" : "password"}
                            fullWidth
                            value={password}
                            disabled={!enabled}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => {
                                            setShowContraseñaAsPlain(!showContraseñaAsPlain);
                                        }}
                                        onMouseDown={e => {
                                            e.preventDefault();
                                        }}
                                        edge="end"
                                    >
                                        {showContraseñaAsPlain ? <VisibilityOffIcon/> : <VisibilityIcon/>}
                                    </IconButton>
                                </InputAdornment>
                            }
                            onChange={(e) => {
                                setContraseña(e.target.value);
                                setConfigurationModified(true);
                            }}/>
                    </FormControl>
                </Grid2>
            </Grid2>

            <InfoBox
                boxShadow={5}
                style={{
                    marginTop: "3rem",
                    marginBottom: "2rem"
                }}
            >
                <Typography color="info">
                    Valetudo will by default try to block access from public-routable IP añadirresses
                    for your safety and convenience.
                    <br/>
                    If you want to allow external access to your Valetudo instance, consider using a VPN such as
                    WireGuard or OpenVPN to ensure the safety of your network.
                    <br/><br/>
                    If you don&apos;t want to use a VPN, usage of a reverse proxy in front of Valetudo and all of your
                    other IoT and network services (e.g. Home Assistant, Jellyfin) is strongly recommended.
                    A proper Webserver (e.g. nginx, Apache) is engineered and hardened to be public-facing.
                    Additionally, a setup like that provides you with central access logs and the ability to implement a central auth.
                </Typography>
            </InfoBox>

            <Divider sx={{mt: 1}} style={{marginBottom: "1rem"}}/>
            <Grid2 container>
                <Grid2 style={{marginLeft: "auto"}}>
                    <Button
                        loading={configurationUpdating}
                        color="primary"
                        variant="outlined"
                        disabled={!configurationModified}
                        onClick={() => {
                            updateConfiguration({
                                enabled: enabled,
                                username: username,
                                password: password
                            });
                            setConfigurationModified(false);
                        }}
                    >
                        Guardar configuration
                    </Button>
                </Grid2>
            </Grid2>
        </>
    );
};

const AuthSettingsPage = (): React.ReactElement => {
    return (
        <PaperContainer>
            <Grid2 container direction="row">
                <Box style={{width: "100%"}}>
                    <DetailPageHeaderRow
                        title="Autenticación HTTP básica"
                        icon={<BasicAuthIcon/>}
                    />
                    <AuthSettings/>
                </Box>
            </Grid2>
        </PaperContainer>
    );
};

export default AuthSettingsPage;
