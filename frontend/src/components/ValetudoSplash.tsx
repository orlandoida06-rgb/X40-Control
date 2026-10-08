import {Box, CircularProgress, Grid2, Typography} from "@mui/material";
import React from "react";

const ValetudoSplash = (): React.ReactElement => {
    return (
        <Grid2
            container
            sx={{
                width: "90%",
                margin: "0 auto",
                maxWidth: "600px",
                height: "100vh",
                color: "#ffffff",
            }}
            direction="column"
            alignItems="center"
            justifyContent="flex-start"
            paddingTop="20vh"
        >
            <Typography
                component="div"
                sx={{
                    fontSize: {
                        xs: 38,
                        sm: 48,
                    },
                    fontWeight: 850,
                    letterSpacing: "-.045em",
                    lineHeight: 1,
                }}
            >
                X40-
                <Box
                    component="span"
                    sx={{
                        color: "#ef4444",
                    }}
                >
                    Control
                </Box>
            </Typography>

            <Typography
                sx={{
                    mt: 1,
                    color: "#0076ff",
                    fontSize: {
                        xs: 17,
                        sm: 19,
                    },
                    fontWeight: 600,
                    letterSpacing: "-.015em",
                }}
            >
                for Valetudo
            </Typography>

            <Grid2
                sx={{
                    marginTop: "3em",
                }}
            >
                <CircularProgress />
            </Grid2>
        </Grid2>
    );
};

export default ValetudoSplash;
