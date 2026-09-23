import React, {FunctionComponent} from "react";
import {
    Box,
    CircularProgress,
    Divider,
    FormControl,
    Grid2,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Stack,
    Typography
} from "@mui/material";
import {
    Quirk,
    useQuirksQuery,
    useSetQuirkValueMutation
} from "../../api";

import {QuirksHelp} from "./res/QuirksHelp";
import {Star as QuirksIcon} from "@mui/icons-material";
import PaperContainer from "../../components/PaperContainer";
import DetailPageHeaderRow from "../../components/DetailPageHeaderRow";

const QUIRK_TRANSLATIONS: Record<string, string> = {
    "select_to_trigger": "Seleccionar para ejecutar",
    "trigger": "Ejecutar",
    "low": "Bajo",
    "medium": "Medio",
    "high": "Alto",
    "on": "Activado",
    "off": "Desactivado",
    "automatic": "Automático",
    "each_cleanup": "Cada limpieza",
    "every_7_days": "Cada 7 días",
    "every_segment": "Cada segmento",
    "every_5_m2": "Cada 5 m²",
    "every_10_m2": "Cada 10 m²",
    "every_15_m2": "Cada 15 m²",
    "every_20_m2": "Cada 20 m²",
    "every_25_m2": "Cada 25 m²",
    "Wet": "Húmedas",
    "Dry": "Secas",
    "Missing detergent cartridge": "Cartucho de detergente ausente",

    "Mop Dock Auto Repair": "Reparación automática de las mopas",
    "Drain internal water tank": "Vaciar el depósito de agua interno",
    "Mop Dock Cleaning Process": "Limpieza de la base de mopas",
    "Water Hookup Test": "Prueba de conexión de agua",
    "Carpet Mode Sensitivity": "Sensibilidad del modo alfombra",
    "Mop Cleaning Frequency": "Frecuencia de limpieza de las mopas",
    "Detergent": "Detergente",
    "Pre-Wet Mops": "Humedecer las mopas antes de limpiar",
    "Deep carpet cleaning": "Limpieza profunda de alfombras",
    "Mop Dock Mop Wash Intensity": "Intensidad del lavado de las mopas",
    "Edge Extension: Side Brush": "Extensión de bordes: cepillo lateral",
    "Edge Extension: Frequency": "Extensión de bordes: frecuencia",
    "Detach Mops": "Retirar las mopas",
    "Side Brush on Carpet": "Cepillo lateral en alfombras",
    "Carpet First": "Alfombras primero"
};

const QUIRK_DESCRIPTIONS: Record<string, string> = {
    "Mop Dock Auto Repair":
        "Si las mopas no permanecen húmedas durante la limpieza, puede haber aire en el sistema que impida llenar el depósito de agua del robot. En ese caso, intenta ejecutar esta función varias veces.",

    "Drain internal water tank":
        "Vacía el depósito de agua interno del robot en la base. Puede ser útil si vas a transportar el robot o almacenarlo durante un tiempo. Puede tardar hasta 3 minutos.",

    "Mop Dock Cleaning Process":
        "Ejecuta una limpieza manual de la base. El robot debe estar colocado en la base. Ten preparado un cepillo y sigue las instrucciones que dará el robot.",

    "Water Hookup Test":
        "Comprueba si la conexión permanente de agua se ha instalado correctamente. Escucha las indicaciones de voz del robot para conocer el estado. Si se producen errores, se mostrarán como eventos de Valetudo.",

    "Carpet Mode Sensitivity":
        "Dependiendo del tipo de alfombra de tu hogar, el modo alfombra puede no activarse como esperas. Este ajuste permite adaptar su sensibilidad.",

    "Mop Cleaning Frequency":
        "Determina con qué frecuencia el robot debe limpiar y volver a humedecer las mopas durante una limpieza.",

    "Detergent":
        "Selecciona si la base debe añadir detergente automáticamente al agua.",

    "Pre-Wet Mops":
        "Selecciona \"secas\" si no quieres que la base humedezca las mopas antes de limpiar. Puede ser útil si quieres recoger un derrame.",

    "Deep carpet cleaning":
        "Cuando está activado, el robot limpia automáticamente y lentamente las alfombras detectadas, realizando el doble de pasadas en direcciones alternas.",

    "Mop Dock Mop Wash Intensity":
        "Los ajustes más altos utilizan más agua y realizan ciclos de lavado más largos.",

    "Edge Extension: Side Brush":
        "Extiende automáticamente el cepillo lateral para llegar mejor a las esquinas o debajo de los muebles.",

    "Edge Extension: Frequency":
        "Selecciona cuándo y con qué frecuencia deben extenderse la mopa y el cepillo lateral, cuando estén habilitados, para aumentar la cobertura en esquinas y cerca de las paredes.",

    "Detach Mops":
        "Cuando está activado, el robot dejará las mopas en la base al realizar una limpieza únicamente con aspiración.",

    "Side Brush on Carpet":
        "Selecciona si el cepillo lateral debe girar al limpiar alfombras.",

    "Carpet First":
        "Cuando está activado, el robot limpiará primero todas las zonas de alfombra y después continuará con el resto de la limpieza."
};

const translateQuirkText = (text: string): string => {
    return QUIRK_TRANSLATIONS[text] ?? text;
};

const translateQuirkDescription = (quirk: Quirk): string => {
    return QUIRK_DESCRIPTIONS[quirk.title] ?? quirk.description;
};

const QuirkControl: FunctionComponent<{ quirk: Quirk }> = ({quirk}) => {
    const {
        mutate: setQuirkValue,
        isPending: quirkValueSetting
    } = useSetQuirkValueMutation();

    const handleChange = React.useCallback(
        (event: SelectChangeEvent<string>) => {
            setQuirkValue({
                id: quirk.id,
                value: event.target.value
            });
        },
        [quirk.id, setQuirkValue]
    );

    const translatedTitle = QUIRK_TRANSLATIONS[quirk.title] ?? quirk.title;
    const translatedValue = translateQuirkText(quirk.value);
    const description = translateQuirkDescription(quirk);

    return (
        <Grid2 size={{xs: 12, md: 6}}>
            <Paper
                elevation={0}
                sx={{
                    height: "100%",
                    p: {xs: 2, sm: 2.5},
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                    transition: "all .2s ease",
                    "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 3
                    }
                }}
            >
                <Stack spacing={2}>
                    <Box>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 700,
                                lineHeight: 1.3
                            }}
                        >
                            {translatedTitle}
                        </Typography>

                        {translatedValue && (
                            <Typography
                                variant="body2"
                                color="primary.main"
                                sx={{
                                    mt: 0.5,
                                    fontWeight: 600
                                }}
                            >
                                Actual: {translatedValue}
                            </Typography>
                        )}
                    </Box>

                    <Divider />

                    <FormControl fullWidth>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                mb: 0.75,
                                fontWeight: 600
                            }}
                        >
                            Valor
                        </Typography>

                        <Select
                            id={`${quirk.id}-select`}
                            value={quirk.value}
                            onChange={handleChange}
                            disabled={quirkValueSetting}
                            size="small"
                            sx={{
                                borderRadius: 2,
                                "& .MuiSelect-select": {
                                    py: 1.2
                                }
                            }}
                            endAdornment={
                                quirkValueSetting ? (
                                    <CircularProgress
                                        size={18}
                                        sx={{mr: 2}}
                                    />
                                ) : undefined
                            }
                        >
                            {quirk.options.map((option, index) => (
                                <MenuItem
                                    value={option}
                                    key={`${option}_${index}`}
                                >
                                    {translateQuirkText(option)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {description && (
                        <Box
                            sx={{
                                px: 1.5,
                                py: 1.25,
                                borderRadius: 2,
                                backgroundColor: "action.hover"
                            }}
                        >
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    lineHeight: 1.55
                                }}
                            >
                                {description}
                            </Typography>
                        </Box>
                    )}
                </Stack>
            </Paper>
        </Grid2>
    );
};

const Quirks: FunctionComponent = () => {
    const {
        data: quirks,
        isError: quirksLoadingError,
        isPending: quirksPending,
        isFetching: quirksFetching,
        refetch: refetchQuirks
    } = useQuirksQuery();

    const sortedQuirks = React.useMemo(() => {
        if (!quirks) {
            return [];
        }

        return [...quirks].sort((a, b) => {
            const titleA = QUIRK_TRANSLATIONS[a.title] ?? a.title;
            const titleB = QUIRK_TRANSLATIONS[b.title] ?? b.title;

            return titleA.localeCompare(titleB, "es");
        });
    }, [quirks]);

    return (
        <PaperContainer>
            <Box sx={{width: "100%"}}>
                <DetailPageHeaderRow
                    title="Particularidades"
                    icon={<QuirksIcon/>}
                    helpText={QuirksHelp}
                    onRefreshClick={() => {
                        refetchQuirks().catch(() => {
                            /* intentional */
                        });
                    }}
                    isRefreshing={quirksFetching}
                />

                {quirksLoadingError ? (
                    <Paper
                        elevation={0}
                        sx={{
                            mt: 2,
                            p: 3,
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "error.main",
                            backgroundColor: "error.main",
                            color: "error.contrastText"
                        }}
                    >
                        <Typography
                            variant="body1"
                            sx={{fontWeight: 600}}
                        >
                            No se han podido cargar las particularidades.
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{mt: 0.5}}
                        >
                            Comprueba la conexión con el robot e inténtalo
                            de nuevo.
                        </Typography>
                    </Paper>
                ) : quirksPending ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 6
                        }}
                    >
                        <CircularProgress/>
                    </Box>
                ) : sortedQuirks.length === 0 ? (
                    <Paper
                        elevation={0}
                        sx={{
                            mt: 2,
                            p: 3,
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "divider",
                            textAlign: "center"
                        }}
                    >
                        <Typography
                            variant="body1"
                            sx={{fontWeight: 600}}
                        >
                            No hay particularidades disponibles.
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{mt: 0.5}}
                        >
                            El robot no ha proporcionado opciones adicionales.
                        </Typography>
                    </Paper>
                ) : (
                    <Grid2
                        container
                        spacing={{xs: 1.5, sm: 2}}
                        sx={{mt: 1}}
                    >
                        {sortedQuirks.map((quirk) => (
                            <QuirkControl
                                quirk={quirk}
                                key={quirk.id}
                            />
                        ))}
                    </Grid2>
                )}
            </Box>
        </PaperContainer>
    );
};

export default Quirks;
