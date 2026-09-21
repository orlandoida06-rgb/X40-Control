import React from "react";
import {Badge, Button, Divider, IconButton, Popover, Stack, Typography} from "@mui/material";
import {Notifications as NotificationsIcon} from "@mui/icons-material";
import {useValetudoEventsInteraction, useValetudoEventsQuery} from "../api";
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

            if (unprocessedEventCount > 0) {
                return (
                    <Badge
                        badgeContent={unprocessedEventCount}
                        color="error"
                        max={99}
                    >
                        {notificationIcon}
                    </Badge>
                );
            }
        }

        return notificationIcon;
    }, [eventDataError, eventDataPending, unprocessedEventCount]);

    const popoverContent = React.useMemo(() => {
        const events = eventData?.length ? eventData.map((event, i) => {
            const EventControl = eventControls[event.__class] || eventControls.Default;

            return (
                <React.Fragment key={event.id}>
                    {i > 0 && <Divider/>}

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
        }) : (
            <Typography
                color="textSecondary"
                variant="subtitle1"
                sx={{py: 2, textAlign: "center"}}
            >
                No hay avisos
            </Typography>
        );

        return (
            <ReloadableCard
                divider={false}
                title="Avisos"
                loading={eventDataFetching}
                onReload={() => {
                    return eventDataRefetch();
                }}
            >
                <Divider sx={{mb: 2}}/>

                <div className={styles.eventContainer}>
                    <Stack>
                        {events}
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
    }, [eventData, eventDataFetching, eventDataRefetch, interactWithEvent]);

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
