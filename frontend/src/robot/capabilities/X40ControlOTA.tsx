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
    const [error, setError] = React.useState<string | null>(null);
    const [updateResult, setUpdateResult] = React.useState<string | null>(null);

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

        try {
            const result = await sendX40ControlOTAUpdate();

            if (!result.success) {
                throw new Error(result.error || "La actualización OTA falló");
            }

            setUpdateResult(
                "Actualización instalada correctamente. Es necesario reiniciar el robot para aplicar la nueva versión."
            );

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
    }, [checkForUpdates]);

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
        const rebootText = ota.requiresReboot ?
            " Será necesario reiniciar el robot para aplicar la nueva versión." :
            "";

        items.push(
            <ButtonListMenuItem
                key="update"
                primaryLabel="Actualizar X40Control"
                secondaryLabel={`Instalar ${ota.availableVersion}.${rebootText}`}
                buttonLabel="Actualizar"
                buttonColor="warning"
                action={updateX40Control}
                actionLoading={updating}
                confirmationDialog={{
                    title: "Actualizar X40Control",
                    body: `Se instalará la versión ${ota.availableVersion}.${rebootText} ¿Continuar?`
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
