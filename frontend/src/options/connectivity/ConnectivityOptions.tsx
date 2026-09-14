import {useCapabilitiesSupported} from "../../CapabilitiesProvider";
import {Capability} from "../../api";
import React from "react";
import {LinkListMenuItem} from "../../components/list_menu/LinkListMenuItem";
import {MQTTIcon} from "../../components/CustomIcons";
import {
    AccessTime as NTPIcon,
    VpnKey as AuthIcon,
    Wifi as WifiIcon,
    AutoFixHigh as NetworkAdvertisementIcon
} from "@mui/icons-material";
import {ListMenu} from "../../components/list_menu/ListMenu";
import {SpacerListMenuItem} from "../../components/list_menu/SpacerListMenuItem";
import PaperContainer from "../../components/PaperContainer";

const ConnectivityOptions = (): React.ReactElement => {
    const [
        wifiConfigurationCapabilitySupported,
    ] = useCapabilitiesSupported(
        Capability.WifiConfiguration,
    );

    const listItems = React.useMemo(() => {
        const items = [];

        if (wifiConfigurationCapabilitySupported) {
            items.push(
                <LinkListMenuItem
                    key="wifiConfiguration"
                    url="/options/connectivity/wifi"
                    primaryLabel="Conectividad Wi-Fi"
                    secondaryLabel="Consultar los detalles de conexión y modificar la configuración"
                    icon={<WifiIcon/>}
                />
            );

            items.push(<SpacerListMenuItem key={"spacer1"}/>);
        }

        items.push(
            <LinkListMenuItem
                key="mqttConnectivity"
                url="/options/connectivity/mqtt"
                primaryLabel="Conectividad MQTT"
                secondaryLabel="Conectar Valetudo a tu servidor MQTT"
                icon={<MQTTIcon/>}
            />
        );

        items.push(
            <LinkListMenuItem
                key="ntpConnectivity"
                url="/options/connectivity/ntp"
                primaryLabel="Conectividad NTP"
                secondaryLabel="Configurar el cliente integrado de Protocolo de Tiempo de Red (NTP)"
                icon={<NTPIcon/>}
            />
        );

        items.push(
            <LinkListMenuItem
                key="networkAdvertisementSettings"
                url="/options/connectivity/networkadvertisement"
                primaryLabel="Anuncio de red"
                secondaryLabel="Controlar la visibilidad mediante Bonjour/mDNS y SSDP/UPnP"
                icon={<NetworkAdvertisementIcon/>}
            />
        );

        items.push(
            <LinkListMenuItem
                key="authSettings"
                url="/options/connectivity/auth"
                primaryLabel="Ajustes de autenticación"
                secondaryLabel="Restringir el acceso a Valetudo"
                icon={<AuthIcon/>}
            />
        );

        return items;
    }, [
        wifiConfigurationCapabilitySupported
    ]);

    return (
        <PaperContainer>
            <ListMenu
                primaryHeader={"Opciones de conectividad"}
                secondaryHeader={"Configurar cómo Valetudo y tu robot se comunican con el exterior"}
                listItems={listItems}
            />
        </PaperContainer>
    );
};

export default ConnectivityOptions;
