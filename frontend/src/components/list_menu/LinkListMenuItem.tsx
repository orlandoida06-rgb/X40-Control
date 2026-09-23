import React from "react";
import {
    Avatar,
    ListItem,
    ListItemAvatar,
    ListItemText
} from "@mui/material";
import {ArrowForwardIos as ArrowIcon} from "@mui/icons-material";
import {Link} from "react-router-dom";

export const LinkListMenuItem: React.FunctionComponent<{
    url: string,
    primaryLabel: string,
    secondaryLabel: string,
    icon: React.ReactElement
}> = ({
    url,
    primaryLabel,
    secondaryLabel,
    icon
}): React.ReactElement => {
    return (
        <ListItem
            secondaryAction={
                <ArrowIcon
                    sx={{
                        fontSize: "1rem",
                        color: "text.secondary",
                        transition: "transform .2s ease"
                    }}
                />
            }
            sx={{
                cursor: "pointer",
                userSelect: "none",
                color: "inherit",
                my: 0.75,
                px: {xs: 1.5, sm: 2},
                py: 1.25,
                pr: {xs: 6, sm: 7},
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
                textDecoration: "none",
                transition: "all .2s ease",
                "&:hover": {
                    borderColor: "text.disabled",
                    boxShadow: 2,
                    transform: "translateY(-1px)",
                    "& .MuiSvgIcon-root": {
                        transform: "translateX(3px)"
                    }
                }
            }}
            component={Link}
            to={url}
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
                    minWidth: 0
                }}
            />
        </ListItem>
    );
};
