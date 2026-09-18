import {Box, emphasize, Fab, styled} from "@mui/material";

export const ActionButton = styled(Fab)(({theme}) => {
    const dark = theme.palette.mode === "dark";

    return {
        pointerEvents: "auto",
        width: 48,
        height: 48,
        minHeight: 48,
        background: dark ?
            "rgba(18, 25, 34, 0.88)" :
            "rgba(255, 255, 255, 0.92)",
        color: theme.palette.text.primary,
        border: dark ?
            "1px solid rgba(255, 255, 255, 0.12)" :
            "1px solid rgba(0, 0, 0, 0.10)",
        boxShadow: dark ?
            "0 8px 28px rgba(0, 0, 0, 0.42)" :
            "0 8px 28px rgba(0, 0, 0, 0.18)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        transition:
            "transform 160ms ease, box-shadow 160ms ease, background 160ms ease",
        fontSize: "1.25rem",
        fontWeight: 400,

        "&:hover": {
            background: dark ?
                "rgba(30, 40, 52, 0.94)" :
                emphasize(theme.palette.background.paper, 0.08),
            transform: "scale(1.06)",
            boxShadow: dark ?
                "0 10px 34px rgba(0, 0, 0, 0.52)" :
                "0 10px 34px rgba(0, 0, 0, 0.22)",
        },

        "&:active": {
            transform: "scale(0.94)",
        },
    };
});


export const ActionsContainer = styled(Box)(({theme}) => {
    return {
        position: "absolute",
        pointerEvents: "none",
        bottom: theme.spacing(3),
        left: theme.spacing(2),
        right: theme.spacing(2),
        zIndex: 20,
    };
});


/*
 * ============================================================
 * X40 CONTROL
 * Tesla-style floating map interface.
 * ============================================================
 */

export const MapGlassPanel = styled(Box)(({theme}) => {
    const dark = theme.palette.mode === "dark";

    return {
        pointerEvents: "auto",

        background: dark ?
            "linear-gradient(135deg, rgba(12, 18, 27, 0.88), rgba(17, 25, 36, 0.72))" :
            "linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(245, 247, 250, 0.82))",

        border: dark ?
            "1px solid rgba(255, 255, 255, 0.11)" :
            "1px solid rgba(0, 0, 0, 0.09)",

        borderRadius: 20,

        boxShadow: dark ?
            "0 18px 55px rgba(0, 0, 0, 0.48), inset 0 1px 0 rgba(255,255,255,0.05)" :
            "0 18px 55px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255,255,255,0.7)",

        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",

        overflow: "hidden",

        transition:
            "background 220ms ease, box-shadow 220ms ease, transform 180ms ease",
    };
});


export const MapTopPanel = styled(MapGlassPanel)(({theme}) => {
    return {
        position: "absolute",
        top: theme.spacing(2),
        left: theme.spacing(2),
        right: theme.spacing(2),

        minHeight: 58,

        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        padding: theme.spacing(1.25, 2),

        zIndex: 30,
    };
});


export const MapLayerPanel = styled(MapGlassPanel)(({theme}) => {
    return {
        position: "absolute",
        top: theme.spacing(2),
        right: theme.spacing(2),

        width: 230,

        padding: theme.spacing(1.5),

        zIndex: 25,
    };
});


export const MapControlsPanel = styled(MapGlassPanel)(({theme}) => {
    return {
        position: "absolute",

        right: theme.spacing(2),
        top: "auto",

        bottom: "82px",

        display: "flex",
        flexDirection: "column",

        gap: theme.spacing(0.8),

        padding: theme.spacing(0.8),

        zIndex: 25,

        borderRadius: 18,
    };
});


export const MapStatusPanel = styled(MapGlassPanel)(({theme}) => {
    return {
        position: "absolute",

        left: theme.spacing(2),
        right: theme.spacing(2),
        bottom: theme.spacing(2),

        minHeight: 64,

        display: "flex",
        alignItems: "center",

        gap: theme.spacing(1),

        padding: theme.spacing(0.75, 1.25),

        zIndex: 25,

        borderRadius: 20,

        "@media (max-width: 700px)": {
            gap: theme.spacing(0.5),
            padding: theme.spacing(0.5, 0.75),
        },
    };
});


export const MapStatusCard = styled(Box)(({theme}) => {
    const dark = theme.palette.mode === "dark";

    return {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",

        minWidth: 0,

        flex: 1,

        padding: theme.spacing(0.5, 1.5),

        borderLeft: dark ?
            "1px solid rgba(255,255,255,0.08)" :
            "1px solid rgba(0,0,0,0.08)",

        "&:first-of-type": {
            borderLeft: "none",
        },

        "@media (max-width: 700px)": {
            padding: theme.spacing(0.5, 0.75),
        },
    };
});


export const MapRobotStatus = styled(Box)(({theme}) => {
    return {
        display: "flex",
        alignItems: "center",

        gap: theme.spacing(1.25),

        minWidth: 190,

        paddingRight: theme.spacing(1),

        "@media (max-width: 700px)": {
            minWidth: 135,
            gap: theme.spacing(0.8),
            paddingRight: theme.spacing(0.5),
        },
    };
});


export const MapStatusValue = styled(Box)(({theme}) => {
    return {
        fontSize: "1.02rem",
        fontWeight: 650,

        lineHeight: 1.2,

        color: theme.palette.text.primary,

        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",

        letterSpacing: "-0.015em",

        "@media (max-width: 700px)": {
            fontSize: "0.85rem",
        },
    };
});


export const MapStatusLabel = styled(Box)(({theme}) => {
    return {
        marginTop: 4,

        fontSize: "0.67rem",

        lineHeight: 1.2,

        color: theme.palette.text.secondary,

        textTransform: "uppercase",

        letterSpacing: "0.09em",

        whiteSpace: "nowrap",

        opacity: 0.82,

        "@media (max-width: 700px)": {
            fontSize: "0.58rem",
        },
    };
});


export const MapConnectionDot = styled(Box)(() => {
    return {
        width: 9,
        height: 9,

        borderRadius: "50%",

        background: "#35d36b",

        boxShadow:
            "0 0 8px rgba(53, 211, 107, 0.95), 0 0 18px rgba(53, 211, 107, 0.42)",

        flexShrink: 0,

        animation: "x40ConnectionPulse 2.2s ease-in-out infinite",

        "@keyframes x40ConnectionPulse": {
            "0%, 100%": {
                opacity: 1,
                transform: "scale(1)",
            },

            "50%": {
                opacity: 0.62,
                transform: "scale(0.82)",
            },
        },
    };
});


export const MapTitle = styled(Box)(({theme}) => {
    return {
        fontSize: "1rem",

        fontWeight: 650,

        letterSpacing: "-0.015em",

        color: theme.palette.text.primary,
    };
});


export const MapSubtitle = styled(Box)(({theme}) => {
    return {
        fontSize: "0.68rem",

        marginTop: 3,

        color: theme.palette.text.secondary,

        textTransform: "uppercase",

        letterSpacing: "0.08em",

        opacity: 0.8,
    };
});


export const MapLayerRow = styled(Box)(({theme}) => {
    return {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        gap: theme.spacing(1),

        minHeight: 40,

        borderBottom: `1px solid ${theme.palette.divider}`,

        "&:last-child": {
            borderBottom: "none",
        },
    };
});


export const MapLayerTitle = styled(Box)(({theme}) => {
    return {
        fontSize: "0.82rem",

        color: theme.palette.text.primary,

        fontWeight: 500,
    };
});


export const MapActionGroup = styled(Box)(({theme}) => {
    return {
        display: "flex",
        alignItems: "center",

        gap: theme.spacing(1),

        pointerEvents: "auto",
    };
});


export const MapContainer = styled(Box)(() => {
    return {
        position: "relative",

        height: "100%",
        width: "100%",

        overflow: "hidden",

        background: "transparent",

        touchAction: "none",

        userSelect: "none",

        WebkitUserSelect: "none",
    };
});


/*
 * Ocultar el botón de búsqueda antiguo del mapa.
 * Reservado para compatibilidad con overlays antiguos.
 */
export const HideLegacyMapSearch = styled(Box)(() => ({
    "& ~ *": {
        // reservado para compatibilidad del overlay
    },
}));
