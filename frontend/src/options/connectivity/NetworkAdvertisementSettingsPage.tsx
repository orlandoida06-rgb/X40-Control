import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
    Grid2,
    Skeleton,
    TextField,
    Typography
} from "@mui/material";
import React from "react";
import {
    useNetworkAdvertisementConfigurationMutation,
    useNetworkAdvertisementConfigurationQuery,
    useNetworkAdvertisementPropertiesQuery
} from "../../api";
import InfoBox from "../../components/InfoBox";
import PaperContainer from "../../components/PaperContainer";
import {
    AutoFixHigh as NetworkAdvertisementIcon
} from "@mui/icons-material";
import DetailPageHeaderRow from "../../components/DetailPageHeaderRow";

const NetworkAdvertisementSettings = (): React.ReactElement => {
    const {
        data: storedConfiguration,
        isPending: configurationPending,
        isError: configurationError,
    } = useNetworkAdvertisementConfigurationQuery();

    const {
        data: properties,
        isPending: propertiesPending,
        isError: propertiesLoadError
    } = useNetworkAdvertisementPropertiesQuery();

    const {
        mutate: updateConfiguration,
        isPending: configurationUpdating
    } = useNetworkAdvertisementConfigurationMutation();

    const [enabled, setEnabled] = React.useState(false);

    const [configurationModified, setConfigurationModified] = React.useState<boolean>(false);


    React.useEffect(() => {
        if (storedConfiguration) {
            setEnabled(storedConfiguration.enabled);
        }
    }, [storedConfiguration]);

    if (configurationPending || propertiesPending) {
        return (
            <Skeleton height={"8rem"}/>
        );
    }

    if (configurationError || propertiesLoadError || !storedConfiguration) {
        return <Typography color="error">Error al cargar la configuración del anuncio de red</Typography>;
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
                label="Anuncio de red activado"
                sx={{mb: 1, marginTop: "1rem", userSelect: "none"}}
            />
            <Grid2 container spacing={1} sx={{mb: 1, mt: "1rem"}} direction="row">
                <Grid2 style={{flexGrow: 1}}>
                    <TextField
                        style={{width: "100%"}}
                        label="Nombre de host Zeroconf"
                        value={properties?.zeroconfHostname ?? ""}
                        variant="standard"
                        disabled={true}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
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
                    Para que las aplicaciones complementarias puedan encontrar el robot rápidamente, Valetudo anuncia su presencia en la
                    red local mediante mDNS/Bonjour y SSDP/UPnP.
                    No se recomienda desactivar esta función, ya que las aplicaciones complementarias dejarán de funcionar correctamente.
                    <br/><br/>
                    Un inconveniente habitual de estas tecnologías, que normalmente funcionan sin configuración, es que resulta muy difícil diagnosticar sus fallos cuando dejan de funcionar. Utilizan mensajes de difusión multidifusión (multicast) que, por defecto, no atraviesan los límites entre subredes. Además, pueden verse afectadas por controladores Wi-Fi defectuosos, actualizaciones del sistema operativo, configuraciones incorrectas o problemas de hardware.<br/>
                    No obstante, son funciones opcionales: basta con conocer la dirección IP del robot para acceder a Valetudo.
                    Puedes consultarla en la interfaz web del router y, por ejemplo, guardar esa dirección como favorito en el navegador.
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
                                enabled: enabled
                            });
                            setConfigurationModified(false);
                        }}
                    >
                        Guardar configuración
                    </Button>
                </Grid2>
            </Grid2>
        </>
    );
};

const NetworkAdvertisementSettingsPage = (): React.ReactElement => {
    return (
        <PaperContainer>
            <Grid2 container direction="row">
                <Box style={{width: "100%"}}>
                    <DetailPageHeaderRow
                        title="Anuncio de red"
                        icon={<NetworkAdvertisementIcon/>}
                    />

                    <NetworkAdvertisementSettings/>
                </Box>
            </Grid2>
        </PaperContainer>
    );
};

export default NetworkAdvertisementSettingsPage;
