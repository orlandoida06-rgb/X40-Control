import React from "react";
import {
    Box,
    ListItem,
    ListItemIcon,
    ListItemText
} from "@mui/material";

interface SubHeaderListMenuItemProps {
    primaryLabel: string;
    icon?: React.ReactElement;
}

export const SubHeaderListMenuItem = ({
    primaryLabel,
    icon
}: SubHeaderListMenuItemProps): React.ReactElement => {
    return (
        <ListItem
            sx={{
                mt: 1.5,
                mb: 0.75,
                px: {xs: 1.5, sm: 2},
                py: 1,
                borderRadius: 2.5,
                backgroundColor: "action.hover",
                border: "1px solid",
                borderColor: "divider"
            }}
        >
            {icon && (
                <ListItemIcon
                    sx={{
                        minWidth: 40,
                        color: "text.secondary"
                    }}
                >
                    {icon}
                </ListItemIcon>
            )}

            <ListItemText
                primary={
                    <Box
                        component="span"
                        sx={{
                            fontSize: {xs: "0.9rem", sm: "0.95rem"},
                            fontWeight: 800,
                            letterSpacing: "0.02em",
                            textTransform: "uppercase"
                        }}
                    >
                        {primaryLabel}
                    </Box>
                }
            />
        </ListItem>
    );
};
