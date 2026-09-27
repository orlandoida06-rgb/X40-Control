import React, { FunctionComponent } from "react";
import {
  Button,
  Card,
  CardContent,
  Collapse,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";
import {
  Capability,
  useVoicePackManagementMutation,
  useVoicePackManagementStateQuery,
  VoicePackManagementCommand,
} from "../../api";
import { useCapabilitiesSupported } from "../../CapabilitiesProvider";
import { CapabilityItem } from "./CapabilityLayout";
import { VoicepackHelp } from "./res/VoicepackHelp";

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
    hash: "2da72c71c4602e1ca6729c2f05fbafcf",
    size: 8221442,
    installed: true,
  },
  {
    id: "nico",
    name: "Nico",
    description: "Voz masculina en español",
    language: "NICO",
    hash: "14cb9b7dd53ab1e08c696c307c49089d",
    size: 10464967,
    installed: true,
  },
  {
    id: "espanol",
    name: "Español",
    description: "Paquete de voz en español",
    language: "ES",
    hash: "0b68b7fbff50f49cd5a7b328d3ec73d1",
    size: 7405690,
    installed: true,
    url: "https://raw.githubusercontent.com/orlandoida06-rgb/voces-spanish_dreame_x40-ultra/main/ES.tar.gz",
  },
  {
    id: "english",
    name: "English",
    description: "Paquete de voz en inglés",
    language: "EN",
    hash: "93384e22a6e026b6f89dfff15706e6aa",
    size: 7546592,
    installed: true,
    url: "https://raw.githubusercontent.com/orlandoida06-rgb/voces-spanish_dreame_x40-ultra/main/EN.tar.gz",
  },
  {
    id: "francais",
    name: "Français",
    description: "Paquete de voz en francés",
    language: "FR",
    hash: "43f2261ba876957a29a1703d246610e9",
    size: 8612867,
    installed: true,
    url: "https://raw.githubusercontent.com/orlandoida06-rgb/voces-spanish_dreame_x40-ultra/main/FR.tar.gz",
  },
  {
    id: "deutsch",
    name: "Deutsch",
    description: "Paquete de voz en alemán",
    language: "DE",
    hash: "041c5d7a52d75bd931e662ec3f7263d1",
    size: 8581267,
    installed: true,
    url: "https://raw.githubusercontent.com/orlandoida06-rgb/voces-spanish_dreame_x40-ultra/main/DE.tar.gz",
  },
  {
    id: "italiano",
    name: "Italiano",
    description: "Paquete de voz en italiano",
    language: "IT",
    hash: "6b5a3d6ad9b427cbcb049a54587585c0",
    size: 7609881,
    installed: true,
    url: "https://raw.githubusercontent.com/orlandoida06-rgb/voces-spanish_dreame_x40-ultra/main/IT.tar.gz",
  },
  {
    id: "portugues",
    name: "Português",
    description: "Paquete de voz en portugués",
    language: "PT",
    hash: "4b949ec0a11984cc61935aeb4fda6b92",
    size: 7775038,
    installed: true,
    url: "https://raw.githubusercontent.com/orlandoida06-rgb/voces-spanish_dreame_x40-ultra/main/PT.tar.gz",
  },
];

const formatSize = (size: number): string => {
  if (!size) {
    return "";
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

const voiceBackground = (voiceId: string): string => {
  const flags: Record<string, string> = {
    xiana:
      "linear-gradient(rgba(0,0,0,.48), rgba(0,0,0,.48)), linear-gradient(to bottom, #aa151b 0 25%, #f1bf00 25% 75%, #aa151b 75% 100%)",

    nico: "linear-gradient(rgba(0,0,0,.48), rgba(0,0,0,.48)), linear-gradient(to bottom, #aa151b 0 25%, #f1bf00 25% 75%, #aa151b 75% 100%)",

    italiano:
      "linear-gradient(rgba(0,0,0,.48), rgba(0,0,0,.48)), linear-gradient(to right, #009246 0 33.33%, #ffffff 33.33% 66.66%, #ce2b37 66.66% 100%)",

    francais:
      "linear-gradient(rgba(0,0,0,.48), rgba(0,0,0,.48)), linear-gradient(to right, #0055a4 0 33.33%, #ffffff 33.33% 66.66%, #ef4135 66.66% 100%)",

    english:
      "linear-gradient(rgba(0,0,0,.48), rgba(0,0,0,.48)), linear-gradient(135deg, transparent 37%, #ffffff 37% 43%, #c8102e 43% 57%, #ffffff 57% 63%, transparent 63%), linear-gradient(45deg, transparent 37%, #ffffff 37% 43%, #c8102e 43% 57%, #ffffff 57% 63%, transparent 63%), linear-gradient(to right, transparent 0 40%, #ffffff 40% 60%, transparent 60%), linear-gradient(to bottom, transparent 0 40%, #ffffff 40% 60%, transparent 60%), #012169",

    deutsch:
      "linear-gradient(rgba(0,0,0,.48), rgba(0,0,0,.48)), linear-gradient(to bottom, #000000 0 33.33%, #dd0000 33.33% 66.66%, #ffce00 66.66% 100%)",

    portugues:
      "linear-gradient(rgba(0,0,0,.48), rgba(0,0,0,.48)), linear-gradient(to right, #046a38 0 40%, #da291c 40% 100%)",
  };

  return flags[voiceId] || "rgba(20,29,43,.95)";
};

const VoicePackControl: FunctionComponent = () => {
  const {
    data: voicePack,
    isFetching: voicePackFetching,
    isError: voicePackError,
    refetch: voicePackRefetch,
  } = useVoicePackManagementStateQuery();

  const [url, setUrl] = React.useState("");
  const [languageCode, setLanguageCode] = React.useState("");
  const [hash, setHash] = React.useState("");

  const { mutate: sendVoicePackCommand, isPending: voicePackMutating } =
    useVoicePackManagementMutation();

  const intervalRef = React.useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
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
          hash: voice.hash,
        });
        return;
      }

      if (voice.id === "xiana") {
        sendVoicePackCommand({
          action: "download",
          url: "https://raw.githubusercontent.com/orlandoida06-rgb/voces-spanish_dreame_x40-ultra/main/voice_pack_spanish_xiana.tar.gz",
          language: voice.language,
          hash: voice.hash,
        });
        return;
      }

      if (voice.url) {
        sendVoicePackCommand({
          action: "download",
          url: voice.url,
          language: voice.language,
          hash: voice.hash,
        });
        return;
      }

      sendVoicePackCommand({
        action: "activate",
        language: voice.language,
      });
    },
    [sendVoicePackCommand],
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
    const commandDisabled = !voicePack || isDownloading || isInstalling;
    const progressValue = voicePack?.operationStatus.progress;
    const progressVariant = progressValue ? "determinate" : "indeterminate";

    return (
      <>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Voces del robot
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
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
              sx={{
                mb: 0.6,
                overflow: "hidden",
                color: "#ffffff",
                background: voiceBackground(voice.id),
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderColor: "rgba(255,255,255,.14)",
                boxShadow: isCurrent ? "0 0 0 1px rgba(80,180,255,.55), 0 8px 24px rgba(0,0,0,.28)" : "0 6px 18px rgba(0,0,0,.22)",
              }}
            >
              <CardContent
                sx={{
                  p: 1.15,
                  "&:last-child": {
                    pb: 1.15,
                  },
                  background:
                    "linear-gradient(90deg, rgba(10,15,22,.58), rgba(10,15,22,.30))",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 0.3,
                    fontSize: "1.1rem",
                    lineHeight: 1.15,
                    color: "#ffffff",
                    fontWeight: 700,
                    textShadow: "0 2px 4px rgba(0,0,0,.75)",
                  }}
                >
                  {voice.name}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mb: 0.4,
                    fontSize: "0.82rem",
                    lineHeight: 1.2,
                    color: "rgba(255,255,255,.88)",
                    textShadow: "0 1px 3px rgba(0,0,0,.8)",
                  }}
                >
                  {voice.description}
                </Typography>

                {voice.size > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      mb: 0.4,
                      display: "block",
                      fontSize: "0.72rem",
                      lineHeight: 1.1,
                      color: "rgba(255,255,255,.78)",
                    }}
                  >
                    {formatSize(voice.size)}
                  </Typography>
                )}

                {isCurrent && (
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 0.4,
                      fontSize: "0.78rem",
                      color: "#76ff8a",
                      fontWeight: 700,
                      textShadow: "0 1px 3px rgba(0,0,0,.8)",
                    }}
                  >
                    Voz activa
                  </Typography>
                )}

                {isComingSoon ? (
                  <Button
                    variant="outlined"
                    size="small"
                    disabled
                    sx={{
                      color: "rgba(255,255,255,.72)",
                      borderColor: "rgba(255,255,255,.28)",
                    }}
                  >
                    Próximamente
                  </Button>
                ) : voice.url ? (
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={commandDisabled}
                    onClick={() => activateVoice(voice)}
                  >
                    Instalar
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    size="small"
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
          <Typography color="error" sx={{ mb: 1 }}>
            Error al instalar el paquete de voz. Consulta el registro para
            obtener más detalles.
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
            sx={{ mb: 1 }}
          />
        </Collapse>

        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
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
          sx={{ mb: 0.3 }}
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
          sx={{ mb: 0.3 }}
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
          sx={{ mb: 1 }}
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
              language: languageCode,
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
    url,
  ]);

  const loading = voicePackFetching || voicePackMutating || !voicePack;

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
    Capability.VoicePackManagement,
  );

  if (!voicePackManagement) {
    return null;
  }

  return <VoicePackControl />;
};

export default VoicePackManagement;
