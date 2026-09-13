import {
    Box,
    Grid2,
    Icon,
    Paper,
    styled,
} from "@mui/material";
import ControlsBody from "./ControlsBody";
import Logo from "../assets/icons/valetudo_logo_with_name.svg?react";
import {
    ExpandLess as OpenIcon,
    ExpandMore as CloseIcon,
} from "@mui/icons-material";
import React from "react";

const MobileControls: React.FunctionComponent<{
    open: boolean,
    setOpen: (newOpen: boolean) => void
}> = ({
    open,
    setOpen
}): React.ReactElement => {

    const StyledIcon = styled(Icon)(() => ({
        fontSize: "2rem",
    }));

    const ControlsSheetContainer = styled(Box)(({theme}) => {
        const color =
            theme.palette.mode === "light" ?
                "#ededed" :
                "#242424";

        return {
            backgroundColor: color,
            borderColor: "rgba(255,255,255,0.08)",
            borderTopWidth: "1px",
            borderLeftWidth: "1px",
            borderRightWidth: "1px",
            borderBottomWidth: "0",
            borderStyle: "solid",
            borderTopLeftRadius: "18px",
            borderTopRightRadius: "18px",
            paddingTop: "0.35rem",
            boxShadow:
                "0 -8px 30px rgba(0,0,0,0.22)",
        };
    });

    return (
        <Paper
            elevation={0}
            sx={{
                height: "100%",
                backgroundColor: "transparent",
                overflow: "hidden",
            }}
        >
            <ControlsSheetContainer
                sx={{
                    display: open ? "block" : "none",
                    height: "calc(95% - 68px)",
                }}
            >
                <Box
                    sx={{
                        overflowY: open ? "auto" : "hidden",
                        overflowX: "hidden",
                        height: "100%",
                        px: 1,
                        pt: 0.5,
                        pb: 2,

                        scrollbarWidth: "thin",

                        "&::-webkit-scrollbar": {
                            width: "5px",
                        },

                        "&::-webkit-scrollbar-thumb": {
                            borderRadius: "10px",
                            backgroundColor:
                                "rgba(255,255,255,0.18)",
                        },
                    }}
                >
                    <ControlsBody />
                </Box>
            </ControlsSheetContainer>

            <Grid2
                container
                direction="row"
                alignItems="center"
                sx={{
                    height: "68px",
                    px: 0.5,
                    cursor: "pointer",
                    backgroundColor: "background.paper",
                    borderTopLeftRadius: "18px",
                    borderTopRightRadius: "18px",
                    transition:
                        "background-color 150ms ease",

                    "&:hover": {
                        backgroundColor: "action.hover",
                    },

                    "&:active": {
                        transform: "scale(0.995)",
                    },
                }}
                onClick={() => {
                    setOpen(!open);
                }}
            >
                <Grid2>
                    <Box
                        px={1.5}
                        display="flex"
                        alignItems="center"
                    >
                        <Logo
                            width={190}
                            height={34}
                        />
                    </Box>
                </Grid2>

                <Grid2
                    sx={{
                        marginLeft: "auto",
                    }}
                >
                    <Box
                        px={1.5}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "14px",
                            backgroundColor: "action.hover",
                        }}
                    >
                        <StyledIcon
                            as={
                                open ?
                                    CloseIcon :
                                    OpenIcon
                            }
                        />
                    </Box>
                </Grid2>
            </Grid2>
        </Paper>
    );
};

export default MobileControls;
