import React from "react";
import {
    Avatar,
    Button,
    ListItem,
    ListItemAvatar,
    ListItemText
} from "@mui/material";
import ConfirmationDialog from "../ConfirmationDialog";

export const ButtonListMenuItem: React.FunctionComponent<{
    primaryLabel: string,
    secondaryLabel: string | React.ReactElement,
    icon?: React.ReactElement,
    buttonLabel: string,
    buttonColor?: "success" | "info" | "warning" | "error",
    confirmationDialog?: {
        title: string,
        body: string,
    }
    action: () => void,
    actionLoading: boolean,
}> = ({
    primaryLabel,
    secondaryLabel,
    icon,
    buttonLabel,
    buttonColor,
    confirmationDialog,
    action,
    actionLoading,
}): React.ReactElement => {
    const [dialogOpen, setDialogOpen] = React.useState(false);

    return (
        <>
            <ListItem
                sx={{
                    userSelect: "none",
                    my: 0.75,
                    px: {xs: 1.5, sm: 2},
                    py: 1.25,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                    transition: "all .2s ease",
                    "&:hover": {
                        borderColor: "text.disabled",
                        boxShadow: 2,
                        transform: "translateY(-1px)"
                    }
                }}
            >
                {
                    icon &&
                    <ListItemAvatar sx={{minWidth: 52}}>
                        <Avatar
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 2.5,
                                backgroundColor: "action.hover",
                                color: "text.primary"
                            }}
                        >
                            {icon}
                        </Avatar>
                    </ListItemAvatar>
                }

                <ListItemText
                    primary={primaryLabel}
                    secondary={secondaryLabel}
                    primaryTypographyProps={{
                        fontWeight: 700,
                        fontSize: {xs: "0.95rem", sm: "1rem"}
                    }}
                    secondaryTypographyProps={{
                        sx: {
                            mt: 0.35,
                            lineHeight: 1.4
                        }
                    }}
                    sx={{
                        mr: {xs: 1, sm: 2},
                        minWidth: 0
                    }}
                />

                <Button
                    loading={actionLoading}
                    color={buttonColor}
                    variant="contained"
                    onClick={() => {
                        if (confirmationDialog) {
                            setDialogOpen(true);
                        } else {
                            action();
                        }
                    }}
                    sx={{
                        borderRadius: 2.5,
                        minWidth: {xs: 92, sm: 110},
                        px: 2,
                        py: 1,
                        fontWeight: 700,
                        textTransform: "none",
                        boxShadow: 0,
                        flexShrink: 0,
                        "&:hover": {
                            boxShadow: 2,
                            transform: "translateY(-1px)"
                        }
                    }}
                >
                    {buttonLabel}
                </Button>
            </ListItem>

            {
                confirmationDialog !== undefined &&
                <ConfirmationDialog
                    title={confirmationDialog.title}
                    text={confirmationDialog.body}
                    open={dialogOpen}
                    onClose={() => {
                        setDialogOpen(false);
                    }}
                    onAccept={action}
                />
            }
        </>
    );
};
