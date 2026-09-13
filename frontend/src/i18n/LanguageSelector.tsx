import React from "react";
import {
    Box,
    FormControl,
    MenuItem,
    Select,
    SelectChangeEvent,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import {Language, useLanguage} from "./index";

const LanguageSelector = (): React.ReactElement => {
    const {language, setLanguage} = useLanguage();

    const handleChange = (event: SelectChangeEvent<Language>) => {
        setLanguage(event.target.value as Language);
    };

    return (
        <FormControl size="small">
            <Select
                value={language}
                onChange={handleChange}
                variant="outlined"
                startAdornment={
                    <LanguageIcon
                        sx={{
                            color: "#9eb1ca",
                            mr: 1,
                            fontSize: 20,
                        }}
                    />
                }
                sx={{
                    minWidth: 105,
                    height: 42,
                    color: "#dce7f5",
                    borderRadius: "14px",
                    background: "rgba(20,29,43,.72)",
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(120,160,210,.16)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(50,135,255,.45)",
                    },
                    "& .MuiSvgIcon-root": {
                        color: "#9eb1ca",
                    },
                }}
            >
                <MenuItem value="es">🇪🇸 Español</MenuItem>
                <MenuItem value="en">🇬🇧 English</MenuItem>
            </Select>
        </FormControl>
    );
};

export default LanguageSelector;
