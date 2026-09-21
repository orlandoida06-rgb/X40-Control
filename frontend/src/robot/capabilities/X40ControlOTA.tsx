import React from "react";
import SystemUpdateIcon from "@mui/icons-material/SystemUpdate";
import PaperContainer from "../../components/PaperContainer";
import {ListMenu} from "../../components/list_menu/ListMenu";
import {SubHeaderListMenuItem} from "../../components/list_menu/SubHeaderListMenuItem";
import {ButtonListMenuItem} from "../../components/list_menu/ButtonListMenuItem";
import {fetchX40ControlOTAInformation, sendX40ControlOTAUpdate} from "../../api/client";

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

    let secondaryLabel = "Consultando el estado OTA...";

    if (error) {
        secondaryLabel = `Error: ${error}`;
    } else if (updateResult) {
        secondaryLabel = updateResult;
    } else if (ota) {
        if (!ota.installed) {
            secondaryLabel = "El binario instalado no coincide con la versión OTA";
        } else if (compareVersions(ota.availableVersion, ota.installedVersion || "0") > 0) {
            secondaryLabel = `Nueva versión disponible: ${ota.availableVersion}`;
        } else {
            secondaryLabel = `X40Control está actualizado: ${ota.installedVersion}`;
        }
    }

    let buttonLabel = "Buscar";

    if (loading) {
        buttonLabel = "Comprobando...";
    }

    const installedLabel = ota?.installedVersion ?
        `Versión instalada: ${ota.installedVersion}` :
        "Versión instalada: —";

    const availableLabel = ota ?
        `Última versión disponible: ${ota.availableVersion}` :
        "Última versión disponible: —";

    const updateAvailable =
        ota !== null &&
        compareVersions(
            ota.availableVersion,
            ota.installedVersion || "0"
        ) > 0;

    const items = [
        <SubHeaderListMenuItem
            key="ota-status"
            primaryLabel="Actualización X40Control"
            icon={<SystemUpdateIcon/>}
        />,

        <ButtonListMenuItem
            key="check"
            primaryLabel="Estado OTA"
            secondaryLabel={secondaryLabel}
            buttonLabel={buttonLabel}
            action={() => void checkForUpdates()}
            actionLoading={loading}
        />,

        <SubHeaderListMenuItem
            key="installed"
            primaryLabel={installedLabel}
        />,

        <SubHeaderListMenuItem
            key="available"
            primaryLabel={availableLabel}
        />,
    ];

    if (updateAvailable && ota) {
        const changes = ota.changelog.length > 0 ?
            `\n\nCambios incluidos:\n${ota.changelog.map(change => `• ${change}`).join("\n")}` :
            "";

        items.push(
            <ButtonListMenuItem
                key="update"
                primaryLabel="Actualizar X40Control"
                secondaryLabel={`Instalar ${ota.availableVersion}`}
                buttonLabel="Actualizar"
                buttonColor="warning"
                action={updateX40Control}
                actionLoading={updating}
                confirmationDialog={{
                    title: `Nueva versión ${ota.availableVersion}`,
                    body:
                        `Hay una nueva versión de X40Control disponible.` +
                        changes +
                        `\n\n¿Quieres instalarla?`
                }}
            />
        );
    }

    if (showRestart && ota?.requiresReboot) {
        items.push(
            <ButtonListMenuItem
                key="restart"
                primaryLabel="Reiniciar robot"
                secondaryLabel="La actualización está instalada y necesita un reinicio."
                buttonLabel="Reiniciar"
                buttonColor="warning"
                action={restartRobot}
                actionLoading={restarting}
                confirmationDialog={{
                    title: "Reiniciar robot",
                    body:
                        "La actualización se ha instalado correctamente." +
                        "\n\n¿Quieres reiniciar el robot ahora?"
                }}
            />
        );
    }

    return (
        <PaperContainer>
            <ListMenu
                primaryHeader="Actualización X40Control"
                secondaryHeader="Actualización del firmware personalizado mediante OTA"
                listItems={items}
            />
        </PaperContainer>
    );
};

export default X40ControlOTA;
