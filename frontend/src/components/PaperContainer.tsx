import React from "react";
import {
    ArrowBack as ArrowBackIcon
} from "@mui/icons-material";
import {
    Container,
    IconButton,
    Paper,
    Stack
} from "@mui/material";
import styles from "./PaperContainer.module.css";

const PaperContainer = (props: {
    containerStyle?: React.CSSProperties,
    containerSx?: object,
    paperStyle?: React.CSSProperties,
    paperSx?: object,
    paperBoxShadow?: number,
    children?: React.ReactNode,
    showBackButton?: boolean
}): React.ReactElement => {
    const showBackButton = props.showBackButton ?? true;

    const handleBack = React.useCallback(() => {
        window.history.back();
    }, []);

    return (
        <Container
            className={styles.paperContainerContainer}
            style={props.containerStyle}
            sx={props.containerSx}
        >
            <Paper
                className={styles.paperContainerPaper}
                style={props.paperStyle}
                sx={{ boxShadow: props.paperBoxShadow, ...props.paperSx }}
            >
                {showBackButton && (
                    <Stack
                        direction="row"
                        sx={{
                            px: {xs: 1, sm: 1.5},
                            pt: {xs: 1, sm: 1.5}
                        }}
                    >
                        <IconButton
                            onClick={handleBack}
                            title="Volver"
                            aria-label="Volver"
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: "50%",
                                backgroundColor: "action.hover",
                                transition: "all .2s ease",
                                "&:hover": {
                                    backgroundColor: "action.selected",
                                    transform: "translateX(-2px)"
                                }
                            }}
                        >
                            <ArrowBackIcon/>
                        </IconButton>
                    </Stack>
                )}

                {props.children}
            </Paper>
        </Container>
    );
};

export default PaperContainer;
