import React from "react";
import {
    Box,
    Grid2,
    useMediaQuery,
    useTheme
} from "@mui/material";
import ReloadableCard from "../../components/ReloadableCard";

const useWideLayout = (): boolean => {
    const theme = useTheme();
    return useMediaQuery(theme.breakpoints.up("md"));
};

export const CapabilityContainer: React.FunctionComponent<{
    children: React.ReactNode
}> = ({children}): React.ReactElement => {
    const wideLayout = useWideLayout();

    if (wideLayout && children) {
        return (
            <Box
                sx={{
                    columnCount: {
                        md: 2,
                        lg: 3
                    },
                    columnGap: 2,
                    "& > *": {
                        breakInside: "avoid",
                        marginBottom: 2,
                        display: "block"
                    }
                }}
            >
                {children}
            </Box>
        );
    }

    return (
        <Grid2 container spacing={2}>
            {children}
        </Grid2>
    );
};

export const CapabilityItem: React.FunctionComponent<{
    children: React.ReactNode,
    title: string,
    loading?: boolean,
    onReload?: () => void,
    helpText?: string
}> = ({
    children,
    title,
    onReload,
    loading = false,
    helpText
}): React.ReactElement => {
    const wideLayout = useWideLayout();

    const content = (
        <Box
            sx={{
                width: "100%",
                "& .MuiPaper-root": {
                    borderRadius: 3,
                    overflow: "hidden",
                    transition: "box-shadow 180ms ease, transform 180ms ease",
                    "&:hover": {
                        boxShadow: 5
                    }
                }
            }}
        >
            <ReloadableCard
                title={title}
                onReload={onReload}
                loading={loading}
                boxShadow={3}
                helpText={helpText}
            >
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
            </ReloadableCard>
        </Box>
    );

    if (wideLayout) {
        return content;
    }

    return (
        <Grid2 size={{xs: 12, sm: 6, md: 4}}>
            {content}
        </Grid2>
    );
};
