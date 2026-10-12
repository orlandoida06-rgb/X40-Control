import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Link,
    Paper,
    Typography
} from "@mui/material";
import React, {FunctionComponent} from "react";
import {useCapabilitiesSupported} from "../CapabilitiesProvider";
import {Capability, useBasicControlMutation, useDismissWelcomeDialogMutation} from "../api";
import {MappingPassButtonItem, PersistentMapSwitchListItem} from "../options/MapManagement";
import {ButtonListMenuItem} from "./list_menu/ButtonListMenuItem";
import {
    Layers as MappingPassIcon
} from "@mui/icons-material";

const FullCleanupButtonItem = (): React.ReactElement => {
    const {
        mutate: executeBasicControlCommand,
        isPending: basicControlIsExecuting
    } = useBasicControlMutation();

    return (
        <ButtonListMenuItem
            primaryLabel="Limpieza completa"
            secondaryLabel="Crear un mapa nuevo"
            icon={<MappingPassIcon/>}
            buttonLabel="Go"
            confirmationDialog={{
                title: "¿Iniciar una limpieza completa?",
                body: "The robot needs to return to the dock on its own to save the newly created map. Do not interfere with the cleanup or else it won't be saved."
            }}
            action={() => {
                executeBasicControlCommand("start");
            }}
            actionLoading={basicControlIsExecuting}
        />
    );
};

const WelcomeDialog: FunctionComponent<{open: boolean, hide: () => void}> = ({
    open,
    hide
}): React.ReactElement => {
    const [
        basicControlSupported,
        persistentMapControlSupported,
        mappingPassSupported
    ] = useCapabilitiesSupported(
        Capability.BasicControl,
        Capability.PersistentMapControl,
        Capability.MappingPass
    );
    const {
        mutate: dismissWelcomeDialog,
    } = useDismissWelcomeDialogMutation();

    return (
        <Dialog
            open={open}
        >
            <DialogTitle>
                Bienvenido a Valetudo
            </DialogTitle>
            <DialogContent>
                <DialogContentText
                    style={{
                        whiteSpace: "pre-wrap"
                    }}
                    component="span"
                >
                    <Typography>
                        Parece que es la primera vez que utilizas Valetudo en este robot.
                    </Typography>
                    <br/>
                    <Typography>
                        The first step is usually to let the robot create a new map of your home.
                        Depending on your firmware, the map will allow you to clean specific rooms, añadir virtual walls and more.
                        <br/><br/>
                        There are some variations in the map creation process based on the model of robot.
                        For example, some robots might require you to enable map persistence first, whereas others might offer a dedicated Mapping Pass.
                    </Typography>
                    <br/>
                    <Typography component="span">
                        Para el mapeo inicial, asegúrate de que:
                        <ul>
                            <li>el robot está en la estación</li>
                            <li>todas las puertas necesarias están abiertas</li>
                            <li>no haya cables sueltos por el suelo</li>
                            <li>todas las zonas a las que no quieras que vaya estén bloqueadas</li>
                        </ul>
                        Una vez hecho esto, esto es lo que necesitas para que el robot cree un mapa nuevo:
                    </Typography>
                    {
                        persistentMapControlSupported &&
                        (
                            <Paper
                                elevation={2}
                                sx={{marginTop: "1rem"}}
                            >
                                <PersistentMapSwitchListItem/>
                            </Paper>
                        )
                    }
                    {
                        mappingPassSupported &&
                        (
                            <Paper
                                elevation={2}
                                sx={{marginTop: "1rem"}}
                            >
                                <MappingPassButtonItem/>
                            </Paper>
                        )
                    }
                    {
                        basicControlSupported &&
                        !mappingPassSupported &&
                        (
                            <Paper
                                elevation={2}
                                sx={{marginTop: "1rem"}}
                            >
                                <FullCleanupButtonItem/>
                            </Paper>
                        )
                    }
                    <br/>
                    <Typography>
                        Mientras ves al robot recorrer la casa, es posible que quieras <Link href="https://github.com/sponsors/Hypfer" target="_blank" rel="noopener">consider donating</Link>.
                        If you&apos;d rather decide later, the donation link can also be found hiding unobtrusively at the bottom of the sidebar menu.
                        <br/><br/>
                        Ahora disfruta de tu robot sin nube :)
                    </Typography>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    hide();
                }}>
                    Hide
                </Button>
                <Button onClick={() => {
                    dismissWelcomeDialog();
                }}>
                    Do not show again
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WelcomeDialog;
