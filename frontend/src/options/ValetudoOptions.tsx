import React from "react";
import {
    RestartAlt as ConfigRestoreIcon,
    SystemUpdateAlt as UpdaterIcon,
    Badge as FriendlyNameIcon,
} from "@mui/icons-material";
import {ListMenu} from "../components/list_menu/ListMenu";
import PaperContainer from "../components/PaperContainer";
import {
    UpdaterConfiguration,
    useRestoreDefaultConfigurationMutation,
    useUpdaterConfigurationMutation,
    useUpdaterConfigurationQuery,
    useValetudoCustomizationsMutation,
    useValetudoCustomizationsQuery
} from "../api";
import {ButtonListMenuItem} from "../components/list_menu/ButtonListMenuItem";
import {SelectListMenuItem, SelectListMenuItemOption} from "../components/list_menu/SelectListMenuItem";
import {SpacerListMenuItem} from "../components/list_menu/SpacerListMenuItem";
import { TextEditModalListMenuItem } from "../components/list_menu/TextEditModalListMenuItem";
import { ActivationListMenuItem } from "./ValetudoActivation";
import {isAprilFools} from "../utils";


const ConfigRestoreButtonListMenuItem = (): React.ReactElement => {
    const {
        mutate: restoreDefaultConfiguration,
        isPending: restoreDefaultConfigurationIsExecuting
    } = useRestoreDefaultConfigurationMutation();

    return (
        <ButtonListMenuItem
            primaryLabel="Restore Default Configuration"
            secondaryLabel="This will only affect Valetudo"
            icon={<ConfigRestoreIcon/>}
            buttonLabel="Go"
            buttonColor={"error"}
            confirmationDialog={{
                title: "Restore default Valetudo configuration?",
                body: "¿Seguro que quieres restaurar la configuración predeterminada? Esto no afectará a la configuración Wi-Fi, los datos del mapa, etc."
            }}
            action={() => {
                restoreDefaultConfiguration();
            }}
            actionLoading={restoreDefaultConfigurationIsExecuting}
        />
    );
};

const FriendlyNameEditModalListMenuItem = (): React.ReactElement => {
    const {
        data: valetudoCustomizations,
        isPending: valetudoCustomizationsPending,
    } = useValetudoCustomizationsQuery();
    const {
        mutate: updateValetudoCustomizations,
        isPending: valetudoCustomizationsUpdating
    } = useValetudoCustomizationsMutation();

    const description = "Establece un nombre personalizado para el anuncio de red, MQTT, etc.";
    let secondaryLabel = description;

    if (valetudoCustomizations && valetudoCustomizations.friendlyName !== "") {
        secondaryLabel = valetudoCustomizations.friendlyName;
    }

    return (
        <TextEditModalListMenuItem
            isLoading={valetudoCustomizationsPending || valetudoCustomizationsUpdating}
            value={valetudoCustomizations?.friendlyName ?? ""}

            dialog={{
                title: "Custom Friendly Name",
                description: description,

                validatingTransformer: (newValue: string) => {
                    return newValue.replace(/[^a-zA-Z0-9 -]/g, "").slice(0,24);
                },
                onGuardar: (newValue: string) => {
                    updateValetudoCustomizations({
                        friendlyName: newValue
                    });
                }
            }}

            icon={<FriendlyNameIcon/>}
            primaryLabel={"Custom Friendly Name"}
            secondaryLabel={secondaryLabel}
        />
    );
};

const updateProviders : Array<SelectListMenuItemOption> = [
    {
        value: "github",
        label: "Release"
    },
    {
        value: "github_nightly",
        label: "Nightly"
    }
];

const UpdateProviderSelectListMenuItem = (): React.ReactElement => {
    const {
        data: storedConfiguration,
        isPending: configurationPending,
        isError: configurationError,
    } = useUpdaterConfigurationQuery();

    const {mutate: updateConfiguration, isPending: configurationUpdating} = useUpdaterConfigurationMutation();

    const disabled = configurationPending || configurationUpdating || configurationError;

    const currentValue = updateProviders.find(provider => provider.value === storedConfiguration?.updateProvider) ?? {value: "", label: ""};

    return (
        <SelectListMenuItem
            options={updateProviders}
            currentValue={currentValue}
            setValue={(e) => {
                updateConfiguration({
                    updateProvider: e.value
                } as UpdaterConfiguration);
            }}
            disabled={disabled}
            loadingOptions={false}
            loadError={configurationError}
            primaryLabel="Canal de actualización"
            secondaryLabel="Selecciona el canal utilizado por el actualizador integrado"
            icon={<UpdaterIcon/>}
        />
    );
};

const ValetudoOptions = (): React.ReactElement => {
    const listItems = React.useMemo(() => {
        const items = [
            <ConfigRestoreButtonListMenuItem key={"configRestoreAction"}/>,
            <SpacerListMenuItem key={"spacer0"}/>,
            <FriendlyNameEditModalListMenuItem key={"friendlyName"}/>,
            <UpdateProviderSelectListMenuItem key={"updateProviderSelect"}/>,
        ];

        if (isAprilFools) {
            items.unshift(
                <ActivationListMenuItem key={"activation"}/>,
                <SpacerListMenuItem key={"spacer1"}/>
            );
        }

        return items;
    }, []);

    return (
        <PaperContainer>
            <ListMenu
                primaryHeader={"Opciones de Valetudo"}
                secondaryHeader={"Ajustes y acciones proporcionados por Valetudo"}
                listItems={listItems}
            />
        </PaperContainer>
    );
};

export default ValetudoOptions;
