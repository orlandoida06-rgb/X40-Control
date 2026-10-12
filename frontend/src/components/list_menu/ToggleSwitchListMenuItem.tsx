import React from "react";
import {
    Avatar,
    Box,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Switch,
    Typography
} from "@mui/material";

export const ToggleSwitchListMenuItem: React.FunctionComponent<{
    value: boolean,
    setValue: (newValue: boolean) => void,
    disabled: boolean,
    loadError: boolean,
    primaryLabel: string,
    secondaryLabel: string,
    icon: React.ReactElement
}> = ({
    value,
    setValue,
    disabled,
    loadError,
    primaryLabel,
    secondaryLabel,
    icon
}): React.ReactElement => {
    const toggle = loadError ? (
        <Typography variant="body2" color="error" sx={{fontWeight: 600}}>
            Error
        </Typography>
    ) : (
        <Switch
            disabled={disabled}
            checked={value ?? false}
            onChange={(e) => {
                setValue(e.target.checked);
            }}
        />
    );

    return (
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

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    ml: 1
                }}
            >
                {toggle}
            </Box>
        </ListItem>
    );
};
