import React from "react";
import {
    Avatar,
    Box,
    CircularProgress,
    ListItem,
    ListItemAvatar,
    ListItemText,
    MenuItem,
    Select,
    Typography
} from "@mui/material";

export type SelectListMenuItemOption = {
    value: string,
    label: string
}

export const SelectListMenuItem: React.FunctionComponent<{
    options: Array<SelectListMenuItemOption>
    currentValue: SelectListMenuItemOption,
    setValue: (newValue: SelectListMenuItemOption) => void,
    disabled: boolean,
    loadingOptions: boolean,
    loadError: boolean,
    primaryLabel: string,
    secondaryLabel: string,
    icon: React.ReactElement
}> = ({
    options,
    currentValue,
    setValue,
    disabled,
    loadingOptions,
    loadError,
    primaryLabel,
    secondaryLabel,
    icon
}): React.ReactElement => {
    let select;

    if (loadingOptions) {
        select = <CircularProgress size={28}/>;
    } else if (loadError) {
        select = (
            <Typography variant="body2" color="error" sx={{fontWeight: 600}}>
                Error
            </Typography>
        );
    } else {
        select = (
            <Select
                disabled={disabled}
                value={currentValue.value}
                onChange={(e) => {
                    const selectedOption = options.find(option => option.value === e.target.value);

                    if (selectedOption) {
                        setValue(selectedOption);
                    }
                }}
                size="small"
                sx={{
                    minWidth: {xs: 125, sm: 150},
                    borderRadius: 2.5,
                    fontWeight: 600,
                    backgroundColor: "background.default",
                    "& .MuiSelect-select": {
                        py: 1
                    }
                }}
            >
                {
                    options.map((o, i) => {
                        return (
                            <MenuItem
                                value={o.value}
                                key={`${o}_${i}`}
                            >
                                {o.label}
                            </MenuItem>
                        );
                    })
                }
            </Select>
        );
    }

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
                {select}
            </Box>
        </ListItem>
    );
};
