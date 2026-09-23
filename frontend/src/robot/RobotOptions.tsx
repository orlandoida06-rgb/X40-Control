// noinspection HtmlUnknownAttribute

import {useCapabilitiesSupported} from "../CapabilitiesProvider";
import {
    AutoEmptyDockAutoEmptyDuration,
    AutoEmptyDockAutoEmptyInterval,
    Capability,
    CarpetSensorMode,
    CleanRoute,
    MopDockMopDryingDuration,
    MopDockMopWashTemperature,
    useAutoEmptyDockAutoEmptyDurationControlPropertiesQuery,
    useAutoEmptyDockAutoEmptyDurationMutation,
    useAutoEmptyDockAutoEmptyDurationQuery,
    useAutoEmptyDockAutoEmptyIntervalMutation,
    useAutoEmptyDockAutoEmptyIntervalPropertiesQuery,
    useAutoEmptyDockAutoEmptyIntervalQuery,
    useCameraLightControlMutation,
    useCameraLightControlQuery,
    useCarpetModeStateMutation,
    useCarpetModeStateQuery,
    useCarpetSensorModeMutation,
    useCarpetSensorModePropertiesQuery,
    useCarpetSensorModeQuery,
    useCleanRouteControlPropertiesQuery,
    useCleanRouteMutation,
    useCleanRouteQuery,
    useCollisionAvoidantNavigationControlMutation,
    useCollisionAvoidantNavigationControlQuery,
    useFloorMaterialDirectionAwareNavigationControlMutation,
    useFloorMaterialDirectionAwareNavigationControlQuery,
    useKeyLockStateMutation,
    useKeyLockStateQuery,
    useLocateMutation,
    useMopDockMopAutoDryingControlMutation,
    useMopDockMopAutoDryingControlQuery,
    useMopDockMopDryingTimeControlPropertiesQuery,
    useMopDockMopDryingTimeMutation,
    useMopDockMopDryingTimeQuery,
    useMopDockMopWashTemperatureMutation,
    useMopDockMopWashTemperaturePropertiesQuery,
    useMopDockMopWashTemperatureQuery,
    useMopExtensionControlMutation,
    useMopExtensionControlQuery,
    useMopExtensionFurnitureLegHandlingControlMutation,
    useMopExtensionFurnitureLegHandlingControlQuery,
    useMopTwistControlMutation,
    useMopTwistControlQuery,
    useObstacleAvoidanceControlMutation,
    useObstacleAvoidanceControlQuery,
    useObstacleImagesMutation,
    useObstacleImagesQuery,
    usePetObstacleAvoidanceControlMutation,
    usePetObstacleAvoidanceControlQuery,
} from "../api";
import React from "react";
import {ListMenu} from "../components/list_menu/ListMenu";
import {ToggleSwitchListMenuItem} from "../components/list_menu/ToggleSwitchListMenuItem";
import {
    Air as MopDockMopAutoDryingControlIcon,
    AvTimer as MopDockMopDryingTimeControlIcon,
    AvTimer as AutoEmptyDockAutoEmptyDurationControlIcon,
    AutoDelete as AutoEmptyIntervalControlIcon,
    Cable as ObstacleAvoidanceControlIcon,
    DeviceThermostat as MopDockMopWashTemperatureControlIcon,
    Explore as FloorMaterialDirectionAwareNavigationControlIcon,
    FlashlightOn as CameraLightControlIcon,
    KeyboardDoubleArrowUp as CarpetModeIcon,
    Lock as KeyLockIcon,
    MiscellaneousServices as SystemIcon,
    NotListedLocation as LocateIcon,
    Pets as PetObstacleAvoidanceControlIcon,
    Photo as ObstacleImagesIcon,
    RoundaboutRight as CollisionAvoidantNavigationControlIcon,
    Route as CleanRouteControlIcon,
    SatelliteAlt as PerceptionIcon,
    Schema as BehaviourIcon,
    Settings as GeneralIcon,
    Star as QuirksIcon,
    SystemUpdate as SystemUpdateIcon,
    TableBar as MopExtensionFurnitureLegHandlingControlIcon,
    Troubleshoot as CarpetSensorModeIcon,
    Tune as MiscIcon,
    Villa as DockIcon
} from "@mui/icons-material";
import {SpacerListMenuItem} from "../components/list_menu/SpacerListMenuItem";
import {LinkListMenuItem} from "../components/list_menu/LinkListMenuItem";
import PaperContainer from "../components/PaperContainer";
import {ButtonListMenuItem} from "../components/list_menu/ButtonListMenuItem";
import {SelectListMenuItem, SelectListMenuItemOption} from "../components/list_menu/SelectListMenuItem";
import {SubHeaderListMenuItem} from "../components/list_menu/SubHeaderListMenuItem";
import {
    MopExtensionControlCapability as MopExtensionControlCapabilityIcon,
    MopTwistControlCapability as MopTwistControlCapabilityIcon,
    MopTwistControlCapabilityExtended as MopTwistControlCapabilityExtendedIcon,
} from "../components/CustomIcons";

const LocateButtonListMenuItem = (): React.ReactElement => {
    const {
        mutate: locate,
        isPending: locateIsExecuting
    } = useLocateMutation();

    return (
        <ButtonListMenuItem
            primaryLabel="Localizar robot"
            secondaryLabel="El robot reproducirá un sonido para indicar su ubicación"
            icon={<LocateIcon/>}
            buttonLabel="Go"
            action={() => {
                locate();
            }}
            actionLoading={locateIsExecuting}
        />
    );
};

const KeyLockCapabilitySwitchListMenuItem = () => {
    const {
        data: data,
        isFetching: isFetching,
        isError: isError,
    } = useKeyLockStateQuery();

    const {mutate: mutate, isPending: isChanging} = useKeyLockStateMutation();
    const loading = isFetching || isChanging;
    const disabled = loading || isChanging || isError;

    return (
        <ToggleSwitchListMenuItem
            value={data?.enabled ?? false}
            setValue={(value) => {
                mutate(value);
            }}
            disabled={disabled}
            loadError={isError}
            primaryLabel={"Bloquear botones"}
            secondaryLabel={"Impide manejar el robot mediante sus botones físicos."}
            icon={<KeyLockIcon/>}
        />
    );
};

const CarpetModeControlCapabilitySwitchListMenuItem = () => {
    const {
        data: data,
        isFetching: isFetching,
        isError: isError,
    } = useCarpetModeStateQuery();

    const {mutate: mutate, isPending: isChanging} = useCarpetModeStateMutation();
    const loading = isFetching || isChanging;
    const disabled = loading || isChanging || isError;

    return (
        <ToggleSwitchListMenuItem
            value={data?.enabled ?? false}
            setValue={(value) => {
                mutate(value);
            }}
            disabled={disabled}
            loadError={isError}
            primaryLabel={"Carpet Mode"}
            secondaryLabel={"Cuando está activado, el robot reconoce automáticamente las alfombras y aumenta la potencia de aspiración."}
            icon={<CarpetModeIcon/>}
        />
    );
};

const CarpetSensorModeControlCapabilitySelectListMenuItem = () => {
    const SORT_ORDER = {
        "off": 4,
        "detach": 3,
        "avoid": 2,
        "lift": 1
    };

    const {
        data: carpetSensorModeProperties,
        isPending: carpetSensorModePropertiesPending,
        isError: carpetSensorModePropertiesError
    } = useCarpetSensorModePropertiesQuery();

    const options: Array<SelectListMenuItemOption> = (
        carpetSensorModeProperties?.supportedModes ?? []
    ).sort((a, b) => {
        const aMapped = SORT_ORDER[a] ?? 10;
        const bMapped = SORT_ORDER[b] ?? 10;

        if (aMapped < bMapped) {
            return -1;
        } else if (bMapped < aMapped) {
            return 1;
        } else {
            return 0;
        }
    }).map((val: CarpetSensorMode) => {
        let label;

        switch (val) {
            case "off":
                label = "None";
                break;
            case "avoid":
                label = "Avoid Carpet";
                break;
            case "lift":
                label = "Elevar mopas";
                break;
            case "detach":
                label = "Desacoplar mopas";
                break;
        }

        return {
            value: val,
            label: label
        };
    });


    const {
        data: data,
        isPending: isPending,
        isFetching: isFetching,
        isError: isError,
    } = useCarpetSensorModeQuery();

    const {mutate: mutate, isPending: isChanging} = useCarpetSensorModeMutation();
    const loading = isFetching || isChanging;
    const disabled = loading || isChanging || isError;

    const currentValue = options.find(mode => {
        return mode.value === data;
    }) ?? {value: "", label: ""};


    return (
        <SelectListMenuItem
            options={options}
            currentValue={currentValue}
            setValue={(e) => {
                mutate(e.value as CarpetSensorMode);
            }}
            disabled={disabled}
            loadingOptions={carpetSensorModePropertiesPending || isPending}
            loadError={carpetSensorModePropertiesError}
            primaryLabel="Sensor de alfombras"
            secondaryLabel="Selecciona qué acción debe realizar el robot si detecta una alfombra mientras friega."
            icon={<CarpetSensorModeIcon/>}
        />
    );
};

const AutoEmptyDockAutoEmptyIntervalControlCapabilitySelectListMenuItem = () => {
    const SORT_ORDER = {
        "frequent": 1,
        "normal": 2,
        "infrequent": 3,
        "off": 4
    };

    const {
        data: autoEmptyDockAutoEmptyIntervalProperties,
        isPending: autoEmptyDockAutoEmptyIntervalPropertiesPending,
        isError: autoEmptyDockAutoEmptyIntervalPropertiesError
    } = useAutoEmptyDockAutoEmptyIntervalPropertiesQuery();

    const options: Array<SelectListMenuItemOption> = (
        autoEmptyDockAutoEmptyIntervalProperties?.supportedIntervals ?? []
    ).sort((a, b) => {
        const aMapped = SORT_ORDER[a] ?? 10;
        const bMapped = SORT_ORDER[b] ?? 10;

        if (aMapped < bMapped) {
            return -1;
        } else if (bMapped < aMapped) {
            return 1;
        } else {
            return 0;
        }
    }).map((val: AutoEmptyDockAutoEmptyInterval) => {
        let label;

        switch (val) {
            case "frequent":
                label = "Frequent";
                break;
            case "normal":
                label = "Normal";
                break;
            case "infrequent":
                label = "Infrequent";
                break;
            case "off":
                label = "Off";
                break;
        }

        return {
            value: val,
            label: label
        };
    });


    const {
        data: data,
        isPending: isPending,
        isFetching: isFetching,
        isError: isError,
    } = useAutoEmptyDockAutoEmptyIntervalQuery();

    const {mutate: mutate, isPending: isChanging} = useAutoEmptyDockAutoEmptyIntervalMutation();
    const loading = isFetching || isChanging;
    const disabled = loading || isChanging || isError;

    const currentValue = options.find(mode => {
        return mode.value === data;
    }) ?? {value: "", label: ""};


    return (
        <SelectListMenuItem
            options={options}
            currentValue={currentValue}
            setValue={(e) => {
                mutate(e.value as AutoEmptyDockAutoEmptyInterval);
            }}
            disabled={disabled}
            loadingOptions={autoEmptyDockAutoEmptyIntervalPropertiesPending || isPending}
            loadError={autoEmptyDockAutoEmptyIntervalPropertiesError}
            primaryLabel="Vaciado automático de la estación"
            secondaryLabel="Selecciona si la estación debe vaciar automáticamente el robot y con qué frecuencia."
            icon={<AutoEmptyIntervalControlIcon/>}
        />
    );
};


const ObstacleAvoidanceControlCapabilitySwitchListMenuItem = () => {
    const {
        data: data,
        isFetching: isFetching,
        isError: isError,
    } = useObstacleAvoidanceControlQuery();

    const {mutate: mutate, isPending: isChanging} = useObstacleAvoidanceControlMutation();
    const loading = isFetching || isChanging;
    const disabled = loading || isChanging || isError;

    return (
        <ToggleSwitchListMenuItem
            value={data?.enabled ?? false}
            setValue={(value) => {
                mutate(value);
            }}
            disabled={disabled}
            loadError={isError}
            primaryLabel={"Obstacle Avoidance"}
            secondaryLabel={"Evita obstáculos utilizando sensores como láseres o cámaras. Puede producir falsos positivos."}
            icon={<ObstacleAvoidanceControlIcon/>}
        />
    );
};

const PetObstacleAvoidanceControlCapabilitySwitchListMenuItem = () => {
    const {
        data: data,
        isFetching: isFetching,
        isError: isError,
    } = usePetObstacleAvoidanceControlQuery();

    const {mutate: mutate, isPending: isChanging} = usePetObstacleAvoidanceControlMutation();
    const loading = isFetching || isChanging;
    const disabled = loading || isChanging || isError;

    return (
        <ToggleSwitchListMenuItem
            value={data?.enabled ?? false}
            setValue={(value) => {
                mutate(value);
            }}
            disabled={disabled}
            loadError={isError}
            primaryLabel={"Pet Obstacle Avoidance"}
            secondaryLabel={"Ajusta la prevención de obstáculos para evitar objetos dejados por mascotas. Aumentará la tasa general de falsos positivos."}
            icon={<PetObstacleAvoidanceControlIcon/>}
        />
    );
};

const ObstacleImagesCapabilitySwitchListMenuItem = () => {
    const {
        data: data,
        isFetching: isFetching,
        isError: isError,
    } = useObstacleImagesQuery();

    const {mutate: mutate, isPending: isChanging} = useObstacleImagesMutation();
    const loading = isFetching || isChanging;
    const disabled = loading || isChanging || isError;

    return (
        <ToggleSwitchListMenuItem
            value={data?.enabled ?? false}
            setValue={(value) => {
                mutate(value);
            }}
            disabled={disabled}
            loadError={isError}
            primaryLabel={"Obstacle Images"}
            secondaryLabel={"Tomar imágenes de todos los obstáculos encontrados."}
            icon={<ObstacleImagesIcon/>}
        />
    );
};

const CollisionAvoidantNavigationControlCapabilitySwitchListMenuItem = () => {
    const {
        data: data,
        isFetching: isFetching,
        isError: isError,
    } = useCollisionAvoidantNavigationControlQuery();

    const {mutate: mutate, isPending: isChanging} = useCollisionAvoidantNavigationControlMutation();
    const loading = isFetching || isChanging;
    const disabled = loading || isChanging || isError;

    return (
        <ToggleSwitchListMenuItem
            value={data?.enabled ?? false}
            setValue={(value) => {
                mutate(value);
            }}
            disabled={disabled}
            loadError={isError}
            primaryLabel={"Navegación con prevención de colisiones"}
            secondaryLabel={"Utiliza una ruta más conservadora para reducir las colisiones. Puede dejar algunas zonas sin limpiar."}
            icon={<CollisionAvoidantNavigationControlIcon/>}
        />
    );
};

const MopExtensionControlCapabilitySwitchListMenuItem = () => {
    const {
        data: data,
        isFetching: isFetching,
        isError: isError,
    } = useMopExtensionControlQuery();

    const {mutate: mutate, isPending: isChanging} = useMopExtensionControlMutation();
    const loading = isFetching || isChanging;
    const disabled = loading || isChanging || isError;

    return (
        <ToggleSwitchListMenuItem
            value={data?.enabled ?? false}
            setValue={(value) => {
                mutate(value);
            }}
            disabled={disabled}
            loadError={isError}
            primaryLabel={"Extensión de las mopas"}
            secondaryLabel={"Extiende la mopa hacia fuera para acercarse más a paredes y muebles."}
            icon={<MopExtensionControlCapabilityIcon/>}
        />
    );
};

const CameraLightControlCapabilitySwitchListMenuItem = () => {
    const {
        data: data,
        isFetching: isFetching,
        isError: isError,
    } = useCameraLightControlQuery();

    const {mutate: mutate, isPending: isChanging} = useCameraLightControlMutation();
    const loading = isFetching || isChanging;
    const disabled = loading || isChanging || isError;

    return (
        <ToggleSwitchListMenuItem
            value={data?.enabled ?? false}
            setValue={(value) => {
                mutate(value);
            }}
            disabled={disabled}
            loadError={isError}
            primaryLabel={"Camera Light"}
            secondaryLabel={"Ilumina las zonas oscuras para mejorar el reconocimiento de obstáculos mediante IA."}
            icon={<CameraLightControlIcon/>}
        />
    );
};

const MopDockMopWashTemperatureControlCapabilitySelectListMenuItem = () => {
    const SORT_ORDER: Record<MopDockMopWashTemperature, number> = {
        "cold": 1,
        "warm": 2,
        "hot": 3,
        "scalding": 4,
        "boiling": 5,
    };

    const {
        data: mopDockMopWashTemperatureProperties,
        isPending: mopDockMopWashTemperaturePropertiesPending,
        isError: mopDockMopWashTemperaturePropertiesError
    } = useMopDockMopWashTemperaturePropertiesQuery();

    const options: Array<SelectListMenuItemOption> = (
        mopDockMopWashTemperatureProperties?.supportedTemperatures ?? []
    ).sort((a, b) => {
        const aMapped = SORT_ORDER[a] ?? 10;
        const bMapped = SORT_ORDER[b] ?? 10;

        return aMapped - bMapped;
    }).map((val: MopDockMopWashTemperature) => {
        let label;

        switch (val) {
            case "cold":
                label = "Cold";
                break;
            case "warm":
                label = "Warm";
                break;
            case "hot":
                label = "Hot";
                break;
            case "scalding":
                label = "Scalding";
                break;
            case "boiling":
                label = "Boiling";
                break;
        }

        return {
            value: val,
            label: label
        };
    });


    const {
        data: data,
        isPending: isPending,
        isFetching: isFetching,
        isError: isError,
    } = useMopDockMopWashTemperatureQuery();

    const {mutate: mutate, isPending: isChanging} = useMopDockMopWashTemperatureMutation();
    const loading = isFetching || isChanging;
    const disabled = loading || isChanging || isError;

    const currentValue = options.find(mode => {
        return mode.value === data;
    }) ?? {value: "", label: ""};


    return (
        <SelectListMenuItem
            options={options}
            currentValue={currentValue}
            setValue={(e) => {
                mutate(e.value as MopDockMopWashTemperature);
            }}
            disabled={disabled}
            loadingOptions={mopDockMopWashTemperaturePropertiesPending || isPending}
            loadError={mopDockMopWashTemperaturePropertiesError}
            primaryLabel="Temperatura de lavado de las mopas"
            secondaryLabel="Selecciona si la estación debe calentar el agua utilizada para lavar las mopas y cuánto."
            icon={<MopDockMopWashTemperatureControlIcon/>}
        />
    );
};

const MopTwistControlCapabilitySwitchListMenuItem = () => {
    const [
        mopExtensionControlCapabilitySupported,
    ] = useCapabilitiesSupported(
        Capability.MopExtensionControl
    );

    const {
        data: data,
        isFetching: isFetching,
        isError: isError,
    } = useMopTwistControlQuery();

    const {mutate: mutate, isPending: isChanging} = useMopTwistControlMutation();
    const loading = isFetching || isChanging;
    const disabled = loading || isChanging || isError;

    let label;
    let icon;
    if (mopExtensionControlCapabilitySupported) {
        label = "Con la mopa extendida, gira el robot para llegar más lejos debajo de muebles y salientes.";
        icon = <MopTwistControlCapabilityExtendedIcon/>;
    } else {
        label = "Gira el robot para fregar más cerca de paredes y muebles. Aumentará la duración de la limpieza.";
        icon = <MopTwistControlCapabilityIcon/>;
    }

    return (
        <ToggleSwitchListMenuItem
            value={data?.enabled ?? false}
            setValue={(value) => {
                mutate(value);
            }}
            disabled={disabled}
            loadError={isError}
            primaryLabel={"Giro de las mopas"}
            secondaryLabel={label}
            icon={icon}
        />
    );
};

const MopExtensionFurnitureLegHandlingControlCapabilitySwitchListMenuItem = () => {
    const {
        data: data,
        isFetching: isFetching,
        isError: isError,
    } = useMopExtensionFurnitureLegHandlingControlQuery();

    const {mutate: mutate, isPending: isChanging} = useMopExtensionFurnitureLegHandlingControlMutation();
    const loading = isFetching || isChanging;
    const disabled = loading || isChanging || isError;

    return (
        <ToggleSwitchListMenuItem
            value={data?.enabled ?? false}
            setValue={(value) => {
                mutate(value);
            }}
            disabled={disabled}
            loadError={isError}
            primaryLabel={"Extensión de las mopas para patas de muebles"}
            secondaryLabel={"Utiliza la mopa extensible para fregar cerca de las patas de sillas y mesas."}
            icon={<MopExtensionFurnitureLegHandlingControlIcon/>}
        />
    );
};

const MopDockMopAutoDryingControlCapabilitySwitchListMenuItem = () => {
    const {
        data: data,
        isFetching: isFetching,
        isError: isError,
    } = useMopDockMopAutoDryingControlQuery();

    const {mutate: mutate, isPending: isChanging} = useMopDockMopAutoDryingControlMutation();
    const loading = isFetching || isChanging;
    const disabled = loading || isChanging || isError;

    return (
        <ToggleSwitchListMenuItem
            value={data?.enabled ?? false}
            setValue={(value) => {
                mutate(value);
            }}
            disabled={disabled}
            loadError={isError}
            primaryLabel={"Secado automático de las mopas"}
            secondaryLabel={"Seca automáticamente las mopas después de una limpieza."}
            icon={<MopDockMopAutoDryingControlIcon/>}
        />
    );
};

const FloorMaterialDirectionAwareNavigationControlCapabilitySwitchListMenuItem = () => {
    const {
        data: data,
        isFetching: isFetching,
        isError: isError,
    } = useFloorMaterialDirectionAwareNavigationControlQuery();

    const {mutate: mutate, isPending: isChanging} = useFloorMaterialDirectionAwareNavigationControlMutation();
    const loading = isFetching || isChanging;
    const disabled = loading || isChanging || isError;

    return (
        <ToggleSwitchListMenuItem
            value={data?.enabled ?? false}
            setValue={(value) => {
                mutate(value);
            }}
            disabled={disabled}
            loadError={isError}
            primaryLabel={"Navegación alineada con el material"}
            secondaryLabel={"Limpia siguiendo la dirección del material del suelo configurado o detectado (si corresponde)."}
            icon={<FloorMaterialDirectionAwareNavigationControlIcon/>}
        />
    );
};

const CleanRouteControlCapabilitySelectListMenuItem = () => {
    const SORT_ORDER = {
        "quick": 1,
        "normal": 2,
        "intensive": 3,
        "deep": 4
    };

    const {
        data: cleanRouteControlProperties,
        isPending: cleanRouteControlPropertiesPending,
        isError: cleanRouteControlPropertiesError
    } = useCleanRouteControlPropertiesQuery();

    const options: Array<SelectListMenuItemOption> = (
        cleanRouteControlProperties?.supportedRoutes ?? []
    ).sort((a, b) => {
        const aMapped = SORT_ORDER[a] ?? 10;
        const bMapped = SORT_ORDER[b] ?? 10;

        if (aMapped < bMapped) {
            return -1;
        } else if (bMapped < aMapped) {
            return 1;
        } else {
            return 0;
        }
    }).map((val: CleanRoute) => {
        let label;

        switch (val) {
            case "quick":
                label = "Quick";
                break;
            case "normal":
                label = "Normal";
                break;
            case "intensive":
                label = "Intensiva";
                break;
            case "deep":
                label = "Profunda";
                break;
        }

        return {
            value: val,
            label: label
        };
    });

    const description = React.useMemo(() => {
        let desc = "Trade speed for thoroughness and vice-versa.";

        if (cleanRouteControlProperties) {
            if (cleanRouteControlProperties.mopOnly.length > 0) {
                const labels = cleanRouteControlProperties.mopOnly.map(route => {
                    const label = options.find(o => o.value === route)?.label ?? "unknown";

                    return `"${label}"`;
                });

                desc += ` ${labels.join(", ")} ${labels.length > 1 ? "solo se aplican" : "solo se aplica"} al fregar.`;
            }

            if (cleanRouteControlProperties.oneTime.length > 0) {
                const labels = cleanRouteControlProperties.oneTime.map(route => {
                    const label = options.find(o => o.value === route)?.label ?? "unknown";

                    return `"${label}"`;
                });

                desc += ` ${labels.join(", ")} ${labels.length > 1 ? "are" : "is"} one-time only.`;
            }
        }

        return desc;
    }, [cleanRouteControlProperties, options]);


    const {
        data: data,
        isPending: isPending,
        isFetching: isFetching,
        isError: isError,
    } = useCleanRouteQuery();

    const {mutate: mutate, isPending: isChanging} = useCleanRouteMutation();
    const loading = isFetching || isChanging;
    const disabled = loading || isChanging || isError;

    const currentValue = options.find(mode => {
        return mode.value === data;
    }) ?? {value: "", label: ""};


    return (
        <SelectListMenuItem
            options={options}
            currentValue={currentValue}
            setValue={(e) => {
                mutate(e.value as CleanRoute);
            }}
            disabled={disabled}
            loadingOptions={cleanRouteControlPropertiesPending || isPending}
            loadError={cleanRouteControlPropertiesError}
            primaryLabel="Ruta de limpieza"
            secondaryLabel={description}
            icon={<CleanRouteControlIcon/>}
        />
    );
};

const MopDockMopDryingTimeControlCapabilitySelectListMenuItem = () => {
    const SORT_ORDER = {
        "2h": 1,
        "3h": 2,
        "4h": 3,
        "cold": 4
    };

    const {
        data: mopDryingTimeProperties,
        isPending: mopDryingTimePropertiesPending,
        isError: mopDryingTimePropertiesError
    } = useMopDockMopDryingTimeControlPropertiesQuery();

    const options: Array<SelectListMenuItemOption> = (
        mopDryingTimeProperties?.supportedDurations ?? []
    ).sort((a, b) => {
        const aMapped = SORT_ORDER[a] ?? 10;
        const bMapped = SORT_ORDER[b] ?? 10;

        if (aMapped < bMapped) {
            return -1;
        } else if (bMapped < aMapped) {
            return 1;
        } else {
            return 0;
        }
    }).map((val: MopDockMopDryingDuration) => {
        let label;

        switch (val) {
            case "2h":
                label = "2 horas";
                break;
            case "3h":
                label = "3 horas";
                break;
            case "4h":
                label = "4 horas";
                break;
            case "cold":
                label = "Cold";
                break;
        }

        return {
            value: val,
            label: label
        };
    });

    const description = React.useMemo(() => {
        let desc = "Selecciona durante cuánto tiempo debe secarse la mopa con aire caliente después de una limpieza.";

        if (mopDryingTimeProperties?.supportedDurations?.includes("cold")) {
            desc += " \"Cold\" disables the heater and compensates with far longer runtimes.";
        }

        return desc;
    }, [mopDryingTimeProperties]);


    const {
        data: data,
        isPending: isPending,
        isFetching: isFetching,
        isError: isError,
    } = useMopDockMopDryingTimeQuery();

    const {mutate: mutate, isPending: isChanging} = useMopDockMopDryingTimeMutation();
    const loading = isFetching || isChanging;
    const disabled = loading || isChanging || isError;

    const currentValue = options.find(mode => {
        return mode.value === data;
    }) ?? {value: "", label: ""};


    return (
        <SelectListMenuItem
            options={options}
            currentValue={currentValue}
            setValue={(e) => {
                mutate(e.value as MopDockMopDryingDuration);
            }}
            disabled={disabled}
            loadingOptions={mopDryingTimePropertiesPending || isPending}
            loadError={mopDryingTimePropertiesError}
            primaryLabel="Tiempo de secado de las mopas"
            secondaryLabel={description}
            icon={<MopDockMopDryingTimeControlIcon/>}
        />
    );
};

const AutoEmptyDockAutoEmptyDurationControlCapabilitySelectListMenuItem = () => {
    const SORT_ORDER = {
        "auto": 1,
        "short": 2,
        "medium": 3,
        "long": 4
    };

    const {
        data: autoEmptyDurationProperties,
        isPending: autoEmptyDurationPropertiesPending,
        isError: autoEmptyDurationPropertiesError
    } = useAutoEmptyDockAutoEmptyDurationControlPropertiesQuery();

    const options: Array<SelectListMenuItemOption> = (
        autoEmptyDurationProperties?.supportedDurations ?? []
    ).sort((a, b) => {
        const aMapped = SORT_ORDER[a] ?? 10;
        const bMapped = SORT_ORDER[b] ?? 10;

        if (aMapped < bMapped) {
            return -1;
        } else if (bMapped < aMapped) {
            return 1;
        } else {
            return 0;
        }
    }).map((val: AutoEmptyDockAutoEmptyDuration) => {
        let label;

        switch (val) {
            case "auto":
                label = "Automático";
                break;
            case "short":
                label = "Short";
                break;
            case "medium":
                label = "Medium";
                break;
            case "long":
                label = "Long";
                break;
        }

        return {
            value: val,
            label: label
        };
    });

    const {
        data: data,
        isPending: isPending,
        isFetching: isFetching,
        isError: isError,
    } = useAutoEmptyDockAutoEmptyDurationQuery();

    const {mutate: mutate, isPending: isChanging} = useAutoEmptyDockAutoEmptyDurationMutation();
    const loading = isFetching || isChanging;
    const disabled = loading || isChanging || isError;

    const currentValue = options.find(mode => {
        return mode.value === data;
    }) ?? {value: "", label: ""};


    return (
        <SelectListMenuItem
            options={options}
            currentValue={currentValue}
            setValue={(e) => {
                mutate(e.value as AutoEmptyDockAutoEmptyDuration);
            }}
            disabled={disabled}
            loadingOptions={autoEmptyDurationPropertiesPending || isPending}
            loadError={autoEmptyDurationPropertiesError}
            primaryLabel="Duración del vaciado automático"
            secondaryLabel={"Configura la duración del ciclo de vaciado automático."}
            icon={<AutoEmptyDockAutoEmptyDurationControlIcon/>}
        />
    );
};

const RobotOptions = (): React.ReactElement => {
    const [
        locateCapabilitySupported,

        obstacleAvoidanceControlCapabilitySupported,
        petObstacleAvoidanceControlCapabilitySupported,
        cameraLightControlSupported,
        obstacleImagesSupported,
        collisionAvoidantNavigationControlCapabilitySupported,
        floorMaterialDirectionAwareNavigationControlSupported,
        cleanRouteControlSupported,
        carpetModeControlCapabilitySupported,
        carpetSensorModeControlCapabilitySupported,

        mopExtensionControlCapabilitySupported,
        mopTwistControlSupported,
        mopExtensionFurnitureLegHandlingControlSupported,

        autoEmptyDockAutoEmptyIntervalControlCapabilitySupported,
        autoEmptyDockAutoEmptyDurationControlCapabilitySupported,
        mopDockMopAutoDryingControlSupported,
        mopDockMopDryingTimeControlSupported,
        mopDockMopWashTemperatureControlSupported,

        keyLockControlCapabilitySupported,

        speakerVolumeControlCapabilitySupported,
        speakerTestCapabilitySupported,
        voicePackManagementCapabilitySupported,
        doNotDisturbCapabilitySupported,

        quirksCapabilitySupported,
    ] = useCapabilitiesSupported(
        Capability.Locate,

        Capability.ObstacleAvoidanceControl,
        Capability.PetObstacleAvoidanceControl,
        Capability.CameraLightControl,
        Capability.ObstacleImages,
        Capability.CollisionAvoidantNavigation,
        Capability.FloorMaterialDirectionAwareNavigationControl,
        Capability.CleanRouteControl,
        Capability.CarpetModeControl,
        Capability.CarpetSensorModeControl,

        Capability.MopExtensionControl,
        Capability.MopTwistControl,
        Capability.MopExtensionFurnitureLegHandlingControl,

        Capability.AutoEmptyDockAutoEmptyIntervalControl,
        Capability.AutoEmptyDockAutoEmptyDurationControl,
        Capability.MopDockMopAutoDryingControl,
        Capability.MopDockMopDryingTimeControl,
        Capability.MopDockMopWashTemperatureControl,

        Capability.KeyLock,

        Capability.SpeakerVolumeControl,
        Capability.SpeakerTest,
        Capability.VoicePackManagement,
        Capability.DoNotDisturb,

        Capability.Quirks
    );


    const generalListItems = React.useMemo(() => {
        const items = [];

        if (locateCapabilitySupported) {
            items.push(<LocateButtonListMenuItem key={"locateAction"}/>);
        }
        if (keyLockControlCapabilitySupported) {
            items.push(
                <KeyLockCapabilitySwitchListMenuItem key={"keyLockControl"}/>
            );
        }

        return items;
    }, [
        locateCapabilitySupported,
        keyLockControlCapabilitySupported
    ]);


    const behaviorListItems = React.useMemo(() => {
        const items = [];

        if (collisionAvoidantNavigationControlCapabilitySupported) {
            items.push(
                <CollisionAvoidantNavigationControlCapabilitySwitchListMenuItem key={"collisionAvoidantNavigationControl"}/>
            );
        }

        if (floorMaterialDirectionAwareNavigationControlSupported) {
            items.push(<FloorMaterialDirectionAwareNavigationControlCapabilitySwitchListMenuItem
                key="floorMaterialDirectionAwareNavigationControl"
            />);
        }

        if (cleanRouteControlSupported) {
            items.push(<CleanRouteControlCapabilitySelectListMenuItem key="cleanRouteControl"/>);
        }

        if (
            collisionAvoidantNavigationControlCapabilitySupported ||
            floorMaterialDirectionAwareNavigationControlSupported ||
            cleanRouteControlSupported
        ) {
            items.push(<SpacerListMenuItem key={"spacer-navigation"} halfHeight={true}/>);
        }

        if (carpetModeControlCapabilitySupported) {
            items.push(
                <CarpetModeControlCapabilitySwitchListMenuItem key={"carpetModeControl"}/>
            );
        }
        if (carpetSensorModeControlCapabilitySupported) {
            items.push(
                <CarpetSensorModeControlCapabilitySelectListMenuItem key={"carpetSensorModeControl"}/>
            );
        }

        if (carpetModeControlCapabilitySupported || carpetSensorModeControlCapabilitySupported) {
            items.push(<SpacerListMenuItem key={"spacer-carpet"} halfHeight={true}/>);
        }

        if (mopExtensionControlCapabilitySupported) {
            items.push(
                <MopExtensionControlCapabilitySwitchListMenuItem key={"mopExtensionControl"}/>
            );
        }

        if (mopTwistControlSupported) {
            items.push(
                <MopTwistControlCapabilitySwitchListMenuItem key={"mopTwistControl"}/>
            );
        }

        if (mopExtensionFurnitureLegHandlingControlSupported) {
            items.push(
                <MopExtensionFurnitureLegHandlingControlCapabilitySwitchListMenuItem
                    key={"mopExtensionFurnitureLegHandlingControl"}
                />
            );
        }

        if (items.at(-1)?.type === SpacerListMenuItem) {
            items.pop();
        }

        return items;
    }, [
        collisionAvoidantNavigationControlCapabilitySupported,
        floorMaterialDirectionAwareNavigationControlSupported,
        cleanRouteControlSupported,
        carpetModeControlCapabilitySupported,
        carpetSensorModeControlCapabilitySupported,
        mopExtensionControlCapabilitySupported,
        mopTwistControlSupported,
        mopExtensionFurnitureLegHandlingControlSupported,
    ]);

    const navigationListItems = React.useMemo(() => {
        const items = [];

        if (obstacleAvoidanceControlCapabilitySupported) {
            items.push(
                <ObstacleAvoidanceControlCapabilitySwitchListMenuItem key={"obstacleAvoidanceControl"}/>
            );
        }

        if (petObstacleAvoidanceControlCapabilitySupported) {
            items.push(
                <PetObstacleAvoidanceControlCapabilitySwitchListMenuItem key={"petObstacleAvoidanceControl"}/>
            );
        }

        if (obstacleImagesSupported) {
            items.push(
                <ObstacleImagesCapabilitySwitchListMenuItem key={"obstacleImages"}/>
            );
        }

        if (cameraLightControlSupported) {
            items.push(
                <CameraLightControlCapabilitySwitchListMenuItem key={"cameraLightControl"}/>
            );
        }

        return items;
    }, [
        obstacleAvoidanceControlCapabilitySupported,
        petObstacleAvoidanceControlCapabilitySupported,
        obstacleImagesSupported,
        cameraLightControlSupported,
    ]);

    const dockListItems = React.useMemo(() => {
        const items = [];

        if (autoEmptyDockAutoEmptyIntervalControlCapabilitySupported) {
            items.push(
                <AutoEmptyDockAutoEmptyIntervalControlCapabilitySelectListMenuItem
                    key={"autoEmptyDockAutoEmptyIntervalControl"}
                />
            );
        }

        if (autoEmptyDockAutoEmptyDurationControlCapabilitySupported) {
            items.push(
                <AutoEmptyDockAutoEmptyDurationControlCapabilitySelectListMenuItem
                    key={"autoEmptyDockAutoEmptyDurationControl"}
                />
            );
        }

        if (
            autoEmptyDockAutoEmptyIntervalControlCapabilitySupported ||
            autoEmptyDockAutoEmptyDurationControlCapabilitySupported
        ) {
            items.push(<SpacerListMenuItem key={"spacer-auto-empty"} halfHeight={true}/>);
        }

        if (mopDockMopWashTemperatureControlSupported) {
            items.push(
                <MopDockMopWashTemperatureControlCapabilitySelectListMenuItem key={"mopDockMopWashTemperatureControl"}/>
            );
        }

        if (mopDockMopAutoDryingControlSupported) {
            items.push(<MopDockMopAutoDryingControlCapabilitySwitchListMenuItem key="mopDockAutoDryingControl"/>);
        }

        if (mopDockMopDryingTimeControlSupported) {
            items.push(<MopDockMopDryingTimeControlCapabilitySelectListMenuItem key="mopDockMopDryingTimeControl"/>);
        }

        return items;
    }, [
        autoEmptyDockAutoEmptyIntervalControlCapabilitySupported,
        autoEmptyDockAutoEmptyDurationControlCapabilitySupported,
        mopDockMopWashTemperatureControlSupported,
        mopDockMopAutoDryingControlSupported,
        mopDockMopDryingTimeControlSupported,
    ]);

    const miscListItems = React.useMemo(() => {
        const items = [];

        if (
            speakerVolumeControlCapabilitySupported || speakerTestCapabilitySupported ||
            voicePackManagementCapabilitySupported ||
            doNotDisturbCapabilitySupported
        ) {
            const label = [];

            if (voicePackManagementCapabilitySupported) {
                label.push("Voice packs");
            }

            if (doNotDisturbCapabilitySupported) {
                label.push("Do not disturb");
            }

            if (speakerVolumeControlCapabilitySupported && speakerTestCapabilitySupported) {
                label.push("Speaker settings");
            }

            items.push(
                <LinkListMenuItem
                    key="systemRobotSettings"
                    url="/options/robot/system"
                    primaryLabel="Opciones del sistema"
                    secondaryLabel={label.join(", ")}
                    icon={<SystemIcon/>}
                />
            );
        }

        items.push(
            <LinkListMenuItem
                key="x40controlOTA"
                url="/options/robot/ota"
                primaryLabel="X40Control OTA"
                secondaryLabel="Buscar e instalar actualizaciones de X40Control"
                icon={<SystemUpdateIcon/>}
            />
        );

        if (quirksCapabilitySupported) {
            items.push(
                <LinkListMenuItem
                    key="quirks"
                    url="/options/robot/quirks"
                    primaryLabel="Particularidades"
                    secondaryLabel="Configura los ajustes específicos del firmware"
                    icon={<QuirksIcon/>}
                />
            );
        }

        return items;
    }, [
        speakerVolumeControlCapabilitySupported,
        speakerTestCapabilitySupported,
        voicePackManagementCapabilitySupported,
        doNotDisturbCapabilitySupported,

        quirksCapabilitySupported,
    ]);

    const listItems = React.useMemo(() => {
        const items: Array<React.ReactElement> = [];

        const añadirGroup = (groupItems: React.ReactElement[], title: string, icon: React.ReactElement) => {
            if (groupItems.length > 0) {
                items.push(
                    <SubHeaderListMenuItem
                        key={`header-${title}`}
                        primaryLabel={title}
                        icon={icon}
                    />
                );
                items.push(...groupItems);
                items.push(<SpacerListMenuItem key={`spacer-${title}`}/>);
            }
        };

        añadirGroup(generalListItems, "General", <GeneralIcon/>);
        añadirGroup(behaviorListItems, "Comportamiento", <BehaviourIcon/>);
        añadirGroup(navigationListItems, "Perception", <PerceptionIcon/>);
        añadirGroup(dockListItems, "Estación de vaciado y limpieza", <DockIcon/>);
        añadirGroup(miscListItems, "Misc", <MiscIcon/>);

        if (items.at(-1)?.type === SpacerListMenuItem) {
            items.pop();
        }

        return items;
    }, [
        generalListItems,
        navigationListItems,
        behaviorListItems,
        dockListItems,
        miscListItems
    ]);

    return (
        <PaperContainer>
            <ListMenu
                primaryHeader={"Opciones del robot"}
                secondaryHeader={"Ajustes y acciones proporcionados por el firmware del robot"}
                listItems={listItems}
            />
        </PaperContainer>
    );
};

export default RobotOptions;
