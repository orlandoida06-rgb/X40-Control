import React, {FunctionComponent} from "react";
import {
    Button,
    Card,
    CardContent,
    Collapse,
    LinearProgress,
    TextField,
    Typography
} from "@mui/material";
import {
    Capability,
    useVoicePackManagementMutation,
    useVoicePackManagementStateQuery,
    VoicePackManagementCommand
} from "../../api";
import {useCapabilitiesSupported} from "../../CapabilitiesProvider";
import {CapabilityItem} from "./CapabilityLayout";
import {VoicepackHelp} from "./res/VoicepackHelp";

type VoiceCatalogEntry = {
    id: string;
    name: string;
    description: string;
    language: string;
    hash: string;
    size: number;
    installed: boolean;
    url?: string;
};

const VOICE_CATALOG: VoiceCatalogEntry[] = [
    {
        id: "xiana",
        name: "XIANA",
        description: "Voz femenina en español",
        language: "XIANA",
        hash: "27b0f9ed565ed22df9b7bfb90f64a44a",
        size: 8021849,
        installed: true
    },
    {
        id: "nico",
        name: "Nico",
        description: "Voz masculina en español",
        language: "NICO",
        hash: "b4cb7b36fb7582d15db72fe48b123902",
        size: 10293331,
        installed: true
    },
    {
        id: "italiano",
        name: "Italiano",
        description: "Próximamente",
        language: "ITALIANO",
        hash: "",
        size: 0,
        installed: false
    },
    {
        id: "francais",
        name: "Français",
        description: "Próximamente",
        language: "FRANCAIS",
        hash: "",
        size: 0,
        installed: false
    },
    {
        id: "english",
        name: "English",
        description: "Próximamente",
        language: "ENGLISH",
        hash: "",
        size: 0,
        installed: false
    },
    {
        id: "deutsch",
        name: "Deutsch",
        description: "Próximamente",
        language: "DEUTSCH",
        hash: "",
        size: 0,
        installed: false
    },
    {
        id: "portugues",
        name: "Português",
        description: "Próximamente",
        language: "PORTUGUES",
        hash: "",
        size: 0,
        installed: false
    }
];

const formatSize = (size: number): string => {
    if (!size) {
        return "";
    }

    return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

const VoicePackControl: FunctionComponent = () => {
    const {
        data: voicePack,
        isFetching: voicePackFetching,
        isError: voicePackError,
        refetch: voicePackRefetch
    } = useVoicePackManagementStateQuery();

    const [url, setUrl] = React.useState("");
    const [languageCode, setLanguageCode] = React.useState("");
    const [hash, setHash] = React.useState("");

    const {
        mutate: sendVoicePackCommand,
        isPending: voicePackMutating
    } = useVoicePackManagementMutation();

    const intervalRef = React.useRef<ReturnType<typeof setInterval> | undefined>(
        undefined
    );

    React.useEffect(() => {
        const operationType = voicePack?.operationStatus.type;

        if (operationType === "downloading" || operationType === "installing") {
            intervalRef.current = setInterval(() => {
                void voicePackRefetch();
            }, 1000);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }

        return undefined;
    }, [voicePack, voicePackRefetch]);

    const installVoice = (voice: VoiceCatalogEntry): void => {
        if (!voice.url) {
            return;
        }

        setUrl(voice.url);
        setLanguageCode(voice.language);
        setHash(voice.hash);
    };

    const activateVoice = React.useCallback(
        (voice: VoiceCatalogEntry): void => {
            if (!voice.installed) {
                return;
            }

            if (voice.id === "nico") {
                sendVoicePackCommand({
                    action: "download",
                    url: "https://raw.githubusercontent.com/orlandoida06-rgb/voces-spanish_dreame_x40-ultra/main/voice_pack_nico.tar.gz",
                    language: voice.language,
                    hash: voice.hash
                });
                return;
            }

            if (voice.id === "xiana") {
                sendVoicePackCommand({
                    action: "download",
                    url: "https://raw.githubusercontent.com/orlandoida06-rgb/voces-spanish_dreame_x40-ultra/main/voice_pack_spanish_xiana.tar.gz",
                    language: voice.language,
                    hash: voice.hash
                });
                return;
            }

            if (voice.url) {
                return;
            }

            sendVoicePackCommand({
                action: "activate",
                language: voice.language
            });
        },
        [sendVoicePackCommand]
    );

    const voicePackContent = React.useMemo(() => {
        if (voicePackError) {
            return (
                <Typography color="error">
                    Error loading voice pack management state.
                </Typography>
            );
        }

        const statusType = voicePack?.operationStatus.type;
        const isError = statusType === "error";
        const isDownloading = statusType === "downloading";
        const isInstalling = statusType === "installing";
        const isWorking = isDownloading || isInstalling;
        const commandDisabled =
            !voicePack || isDownloading || isInstalling;
        const progressValue = voicePack?.operationStatus.progress;
        const progressVariant =
            progressValue ? "determinate" : "indeterminate";

        return (
            <>
                <Typography variant="h6" sx={{mb: 1}}>
                    Voces del robot
                </Typography>

                <Typography variant="body2" sx={{mb: 2}}>
                    Voz activa: {voicePack?.currentLanguage || "desconocida"}
                </Typography>

                {VOICE_CATALOG.map((voice) => {
                    const isComingSoon = !voice.installed;
                    const isCurrent =
                        voicePack?.currentLanguage?.toLowerCase() ===
                        voice.language.toLowerCase();

                    return (
                        <Card
                            key={voice.id}
                            variant="outlined"
                            sx={{mb: 1}}
                        >
                            <CardContent>
                                <Typography variant="h6">
                                    {voice.name}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{mb: 1}}
                                >
                                    {voice.description}
                                </Typography>

                                {voice.size > 0 && (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block"
                                        sx={{mb: 1}}
                                    >
                                        {formatSize(voice.size)}
                                    </Typography>
                                )}

                                {isCurrent && (
                                    <Typography
                                        variant="body2"
                                        color="success.main"
                                        sx={{mb: 1}}
                                    >
                                        Voz activa
                                    </Typography>
                                )}

                                {isComingSoon ? (
                                    <Button
                                        variant="outlined"
                                        disabled
                                    >
                                        Próximamente
                                    </Button>
                                ) : voice.url ? (
                                    <Button
                                        variant="outlined"
                                        disabled={commandDisabled}
                                        onClick={() => installVoice(voice)}
                                    >
                                        Configurar
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outlined"
                                        disabled={commandDisabled || isCurrent}
                                        onClick={() => activateVoice(voice)}
                                    >
                                        {isCurrent ? "Voz activa" : "Activar"}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}

                {isError && (
                    <Typography color="error" sx={{mb: 1}}>
                        Error al instalar el paquete de voz. Consulta el
                        registro para obtener más detalles.
                    </Typography>
                )}

                <Collapse in={isWorking}>
                    <Typography variant="subtitle1">
                        {isDownloading ? "Downloading..." : "Installing..."}
                    </Typography>

                    <LinearProgress
                        color={isDownloading ? "success" : "secondary"}
                        variant={progressVariant}
                        value={progressValue}
                        sx={{mb: 1}}
                    />
                </Collapse>

                <Typography variant="subtitle1" sx={{mt: 2, mb: 1}}>
                    Configuración avanzada
                </Typography>

                <TextField
                    label="URL"
                    value={url}
                    onChange={(event) => {
                        setUrl(event.target.value);
                    }}
                    variant="standard"
                    placeholder="https://"
                    disabled={commandDisabled}
                    fullWidth
                    sx={{mb: 0.3}}
                />

                <TextField
                    label="Código de idioma"
                    value={languageCode}
                    onChange={(event) => {
                        setLanguageCode(event.target.value);
                    }}
                    variant="standard"
                    placeholder="VA"
                    disabled={commandDisabled}
                    fullWidth
                    sx={{mb: 0.3}}
                />

                <TextField
                    label="Hash"
                    value={hash}
                    onChange={(event) => {
                        setHash(event.target.value);
                    }}
                    variant="standard"
                    disabled={commandDisabled}
                    fullWidth
                    sx={{mb: 1}}
                />

                <Button
                    loading={voicePackMutating || commandDisabled}
                    loadingPosition="center"
                    variant="outlined"
                    onClick={() => {
                        const command: VoicePackManagementCommand = {
                            action: "download",
                            url: url,
                            hash: hash,
                            language: languageCode
                        };

                        sendVoicePackCommand(command);
                    }}
                >
                    Set voice pack
                </Button>
            </>
        );
    }, [
        sendVoicePackCommand,
        voicePack,
        voicePackError,
        voicePackMutating,
        hash,
        languageCode,
        url
    ]);

    const loading =
        voicePackFetching || voicePackMutating || !voicePack;

    return (
        <CapabilityItem
            title="Voice packs"
            loading={loading}
            helpText={VoicepackHelp}
        >
            {voicePackContent}
        </CapabilityItem>
    );
};

const VoicePackManagement: FunctionComponent = () => {
    const [voicePackManagement] = useCapabilitiesSupported(
        Capability.VoicePackManagement
    );

    if (!voicePackManagement) {
        return null;
    }

    return <VoicePackControl />;
};

export default VoicePackManagement;
