import {Button, Divider, Grid2, IconButton, styled, Typography} from "@mui/material";
import React, {FunctionComponent} from "react";
import {
    Help as HelpIcon,
    Refresh as RefreshIcon
} from "@mui/icons-material";
import HelpDialog from "./HelpDialog";

const TopRightRefreshButton = styled(Button)(({theme}) => {
    return {
        minWidth: 0,
        borderRadius: "50%",
        width: "42px",
        height: "42px",
        padding: 0,
        color: theme.palette.text.secondary,
        transition: "all .2s ease",
        "&:hover": {
            backgroundColor: theme.palette.action.hover,
            transform: "rotate(25deg)"
        }
    };
});

interface DetailPageHeaderRowProps {
    title: string;
    icon: React.ReactElement;
    helpText?: string;
    onRefreshClick?: () => void;
    isRefreshing?: boolean;
}

const DetailPageHeaderRow: FunctionComponent<DetailPageHeaderRowProps> = ({
    title,
    icon,
    helpText,
    onRefreshClick,
    isRefreshing
}): React.ReactElement => {
    const [helpDialogOpen, setHelpDialogOpen] = React.useState(false);

    return (
        <>
            <Grid2
                container
                alignItems="center"
                spacing={1}
                justifyContent="space-between"
            >
                <Grid2
                    container
                    alignItems="center"
                    spacing={1}
                    sx={{
                        minWidth: 0
                    }}
                >
                    <Grid2
                        container
                        alignItems="center"
                        sx={{
                            minWidth: 0
                        }}
                    >
                        <Grid2
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                pr: 1
                            }}
                        >
                            {icon}
                        </Grid2>

                        <Grid2
                            sx={{
                                minWidth: 0
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize: {
                                        xs: "1rem",
                                        sm: "1.1rem"
                                    },
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                }}
                            >
                                {title}
                            </Typography>
                        </Grid2>
                    </Grid2>
                </Grid2>

                <Grid2>
                    <Grid2
                        container
                        alignItems="center"
                        spacing={0.5}
                    >
                        {
                            helpText !== undefined &&
                            <>
                                <Grid2>
                                    <IconButton
                                        onClick={() => {
                                            setHelpDialogOpen(true);
                                        }}
                                        title="Ayuda"
                                        aria-label="Ayuda"
                                    >
                                        <HelpIcon/>
                                    </IconButton>
                                </Grid2>

                                <HelpDialog
                                    dialogOpen={helpDialogOpen}
                                    setDialogOpen={(open: boolean) => {
                                        setHelpDialogOpen(open);
                                    }}
                                    helpText={helpText}
                                />
                            </>
                        }

                        {
                            onRefreshClick !== undefined &&
                            <Grid2>
                                <TopRightRefreshButton
                                    loading={isRefreshing ?? false}
                                    onClick={onRefreshClick}
                                    title="Actualizar"
                                    aria-label="Actualizar"
                                >
                                    <RefreshIcon/>
                                </TopRightRefreshButton>
                            </Grid2>
                        }
                    </Grid2>
                </Grid2>
            </Grid2>

            <Divider sx={{mt: 1}}/>
        </>
    );
};

export default DetailPageHeaderRow;
