import React from "react";
import {
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

    const flagBackground = (lang: Language): string => {
        if (lang === "es") {
            return "linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.25)), linear-gradient(to bottom, #aa151b 0 25%, #f1bf00 25% 75%, #aa151b 75% 100%)";
        }

        return "linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.25)), linear-gradient(135deg, transparent 38%, #ffffff 38% 42%, #c8102e 42% 58%, #ffffff 58% 62%, transparent 62%), linear-gradient(45deg, transparent 38%, #ffffff 38% 42%, #012169 42% 58%, #ffffff 58% 62%, transparent 62%), linear-gradient(to right, transparent 0 43%, #ffffff 43% 57%, transparent 57%), linear-gradient(to bottom, transparent 0 43%, #ffffff 43% 57%, transparent 57%), #012169";
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
                renderValue={(value) => (
                    <span
                        style={{
                            fontWeight: 600,
                            color: "#ffffff",
                        }}
                    >
                        {value === "es" ? "Español" : "English"}
                    </span>
                )}
                sx={{
                    minWidth: 125,
                    height: 42,
                    color: "#dce7f5",
                    borderRadius: "14px",
                    background: "rgba(20,29,43,.88)",
                    overflow: "hidden",
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
                MenuProps={{
                    PaperProps: {
                        sx: {
                            mt: 1,
                            borderRadius: "14px",
                            overflow: "hidden",
                            background: "rgba(20,29,43,.96)",
                            border: "1px solid rgba(120,160,210,.16)",
                        },
                    },
                }}
            >
                <MenuItem
                    value="es"
                    sx={{
                        minHeight: 48,
                        color: "#ffffff",
                        fontWeight: 600,
                        background: flagBackground("es"),
                        backgroundSize: "cover",
                        textShadow: "0 1px 3px rgba(0,0,0,.9)",
                        "&:hover": {
                            filter: "brightness(1.12)",
                        },
                    }}
                >
                    Español
                </MenuItem>

                <MenuItem
                    value="en"
                    sx={{
                        minHeight: 48,
                        color: "#ffffff",
                        fontWeight: 600,
                        background: flagBackground("en"),
                        backgroundSize: "cover",
                        textShadow: "0 1px 3px rgba(0,0,0,.9)",
                        "&:hover": {
                            filter: "brightness(1.12)",
                        },
                    }}
                >
                    English
                </MenuItem>
            </Select>
        </FormControl>
    );
};

export default LanguageSelector;
