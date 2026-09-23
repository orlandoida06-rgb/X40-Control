import {
    Box,
    Card,
    CardContent,
    Divider,
    Grid2,
    IconButton,
    styled,
    Typography
} from "@mui/material";
import React, {FunctionComponent} from "react";
import {
    Help as HelpIcon,
    Refresh as RefreshIcon
} from "@mui/icons-material";
import HelpDialog from "./HelpDialog";

const TopRightIconButton = styled(IconButton)(({theme}) => {
    return {
        width: 38,
        height: 38,
        borderRadius: 12,
        marginTop: -theme.spacing(0.25),
        transition: "all 180ms ease",
        "&:hover": {
            backgroundColor: theme.palette.action.hover,
            transform: "rotate(25deg)"
        }
    };
});

interface ReloadableCardProps {
    title: string;
    onReload?: () => void;
    reloadButton?: React.ReactNode;
    children: React.ReactNode;
    loading?: boolean;
    divider?: boolean;
    boxShadow?: number;
    helpText?: string;
}

const ReloadableCard: FunctionComponent<ReloadableCardProps> = ({
    title,
    onReload,
    reloadButton,
    children,
    loading = false,
    divider = true,
    helpText
}): React.ReactElement => {
    const [helpDialogOpen, setHelpDialogOpen] =
        React.useState(false);

    return (
        <>
            <Card
                sx={{
                    position: "relative",
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                    boxShadow: 2,
                    overflow: "hidden",
                    transition:
                        "box-shadow 200ms ease, transform 200ms ease",
                    "&:hover": {
                        boxShadow: 5,
                        transform: "translateY(-1px)"
                    }
                }}
            >
                <Box
                    sx={{
                        height: 4,
                        background:
                            "linear-gradient(90deg, currentColor, transparent)",
                        opacity: 0.7
                    }}
                />

                <CardContent
                    sx={{
                        p: {xs: 2, sm: 2.5},
                        "&:last-child": {
                            pb: {xs: 2, sm: 2.5}
                        }
                    }}
                >
                    <Grid2
                        container
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                        sx={{mb: divider ? 1.5 : 2}}
                    >
                        <Grid2 sx={{minWidth: 0}}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    letterSpacing: "-0.01em",
                                    lineHeight: 1.2
                                }}
                            >
                                {title}
                            </Typography>
                        </Grid2>

                        <Grid2>
                            <Grid2
                                container
                                spacing={0.5}
                                alignItems="center"
                            >
                                {helpText && (
                                    <Grid2>
                                        <IconButton
                                            onClick={() => {
                                                return setHelpDialogOpen(
                                                    true
                                                );
                                            }}
                                            title="Ayuda"
                                            size="small"
                                            sx={{
                                                width: 38,
                                                height: 38,
                                                borderRadius: 12
                                            }}
                                        >
                                            <HelpIcon fontSize="small" />
                                        </IconButton>
                                    </Grid2>
                                )}

                                {reloadButton ||
                                    (onReload && (
                                        <Grid2>
                                            <TopRightIconButton
                                                disabled={loading}
                                                onClick={onReload}
                                                title="Actualizar"
                                            >
                                                <RefreshIcon />
                                            </TopRightIconButton>
                                        </Grid2>
                                    ))}
                            </Grid2>
                        </Grid2>
                    </Grid2>

                    {divider && (
                        <Divider
                            sx={{
                                mb: 2,
                                opacity: 0.6
                            }}
                        />
                    )}

                    <Box
                        sx={{
                            width: "100%",
                            "& > * + *": {
                                mt: 1.5
                            }
                        }}
                    >
                        {children}
                    </Box>
                </CardContent>
            </Card>

            {helpText && (
                <HelpDialog
                    dialogOpen={helpDialogOpen}
                    setDialogOpen={(open: boolean) => {
                        setHelpDialogOpen(open);
                    }}
                    helpText={helpText}
                />
            )}
        </>
    );
};

export default ReloadableCard;
