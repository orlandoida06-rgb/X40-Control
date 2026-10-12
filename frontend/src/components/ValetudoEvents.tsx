import React from "react";
import {
    Alert,
    Badge,
    Button,
    Divider,
    IconButton,
    Popover,
    Stack,
    Typography
} from "@mui/material";
import {
    Notifications as NotificationsIcon,
    SystemUpdateAlt as OTAIcon
} from "@mui/icons-material";
import {useQuery} from "@tanstack/react-query";
import {
    fetchX40ControlOTAInformation,
    useValetudoEventsInteraction,
    useValetudoEventsQuery
} from "../api";
import {eventControls} from "./ValetudoEventControls";
import ReloadableCard from "./ReloadableCard";
import styles from "./ValetudoEvents.module.css";

const ValetudoEvents = (): React.ReactElement => {
    const {
        data: eventData,
        isFetching: eventDataFetching,
        isPending: eventDataPending,
        error: eventDataError,
        refetch: eventDataRefetch,
    } = useValetudoEventsQuery();

    const {
        data: otaData,
        isFetching: otaDataFetching,
        error: otaDataError,
        refetch: otaDataRefetch,
    } = useQuery({
        queryKey: ["x40_control_ota"],
        queryFn: fetchX40ControlOTAInformation,
        staleTime: 60_000,
        refetchInterval: 60_000,
        retry: false,
    });

    const {mutate: interactWithEvent} = useValetudoEventsInteraction();

    const [anchorElement, setAnchorElement] = React.useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElement(event.currentTarget);
    };

    const handleCerrar = () => {
        setAnchorElement(null);
    };

    const unprocessedEventCount = React.useMemo(() => {
        if (!eventData?.length) {
            return 0;
        }

        return eventData.reduce((count, event) => {
            return count + Number(!event.processed);
        }, 0);
    }, [eventData]);

    const otaUpdateAvailable = React.useMemo(() => {
        if (!otaData?.availableVersion) {
            return false;
        }

        return otaData.availableVersion !== otaData.installedVersion;
    }, [otaData]);

    const notificationCount = unprocessedEventCount + Number(otaUpdateAvailable);

    const icon = React.useMemo(() => {
        const notificationIcon = <NotificationsIcon/>;

        if (!eventDataPending) {
            if (eventDataError) {
                return (
                    <Badge badgeContent="!" color="error">
                        {notificationIcon}
                    </Badge>
                );
            }

            if (notificationCount > 0) {
                return (
                    <Badge
                        badgeContent={notificationCount}
                        color="error"
                        max={99}
                    >
                        {notificationIcon}
                    </Badge>
                );
            }
        }

        return notificationIcon;
    }, [eventDataError, eventDataPending, notificationCount]);

    const popoverContent = React.useMemo(() => {
        const events = (eventData ?? []).map((event, i) => {
            const EventControl = eventControls[event.__class] || eventControls.Default;

            return (
                <React.Fragment key={event.id}>
                    {(i > 0 || otaUpdateAvailable) && <Divider/>}

                    <EventControl
                        event={event}
                        interact={(interaction) => {
                            interactWithEvent({
                                id: event.id,
                                interaction: interaction,
                            });
                        }}
                    />
                </React.Fragment>
            );
        });

        const hasEvents = events.length > 0;
        const hasNotifications = hasEvents || otaUpdateAvailable;

        return (
            <ReloadableCard
                divider={false}
                title="Avisos"
                loading={eventDataFetching || otaDataFetching}
                onReload={() => {
                    return Promise.all([
                        eventDataRefetch(),
                        otaDataRefetch(),
                    ]);
                }}
            >
                <Divider sx={{mb: 2}}/>

                <div className={styles.eventContainer}>
                    <Stack spacing={1}>
                        {otaUpdateAvailable && (
                            <Alert
                                severity="info"
                                icon={<OTAIcon/>}
                                sx={{
                                    alignItems: "flex-start",
                                    "& .MuiAlert-message": {
                                        width: "100%",
                                    },
                                }}
                            >
                                <Typography
                                    variant="subtitle1"
                                    sx={{fontWeight: 700}}
                                >
                                    Nueva actualización OTA
                                </Typography>

                                <Typography variant="body2" sx={{mt: 0.5}}>
                                    Hay una nueva versión de X40-Control disponible:
                                    {" "}
                                    <strong>{otaData?.availableVersion}</strong>
                                </Typography>

                                <Button
                                    size="small"
                                    variant="contained"
                                    sx={{mt: 1}}
                                    onClick={() => {
                                        handleCerrar();
                                        window.location.href = "/options/robot/ota";
                                    }}
                                >
                                    Actualizar
                                </Button>
                            </Alert>
                        )}

                        {events}

                        {!hasNotifications && (
                            <Typography
                                color="textSecondary"
                                variant="subtitle1"
                                sx={{py: 2, textAlign: "center"}}
                            >
                                No hay avisos
                            </Typography>
                        )}

                        {otaDataError && !hasEvents && (
                            <Typography
                                color="textSecondary"
                                variant="body2"
                                sx={{pt: 1, textAlign: "center"}}
                            >
                                No se pudo comprobar el estado de OTA
                            </Typography>
                        )}
                    </Stack>
                </div>

                <Divider sx={{mt: 2}}/>

                <Button
                    sx={{
                        ml: "auto",
                        display: "flex",
                        mt: 1,
                        mb: -1,
                    }}
                    onClick={handleCerrar}
                >
                    Cerrar
                </Button>
            </ReloadableCard>
        );
    }, [
        eventData,
        eventDataFetching,
        eventDataRefetch,
        interactWithEvent,
        otaData,
        otaDataError,
        otaDataFetching,
        otaDataRefetch,
        otaUpdateAvailable,
    ]);

    return (
        <>
            <IconButton
                size="large"
                aria-label="Avisos y notificaciones"
                onClick={handleMenu}
                color="inherit"
                title="Avisos y notificaciones"
            >
                {icon}
            </IconButton>

            <Popover
                open={Boolean(anchorElement)}
                anchorEl={anchorElement}
                onClose={handleCerrar}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                {popoverContent}
            </Popover>
        </>
    );
};

export default ValetudoEvents;
