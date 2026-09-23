import {
    Help as HelpIcon
} from "@mui/icons-material";
import {
    Divider,
    Grid2,
    IconButton,
    List,
    ListItemText
} from "@mui/material";
import React from "react";
import {SpacerListMenuItem} from "./SpacerListMenuItem";
import HelpDialog from "../HelpDialog";

export const ListMenu: React.FunctionComponent<{
    primaryHeader: string,
    secondaryHeader: string,
    listItems: Array<React.ReactElement>,
    helpText?: string,
    style?: React.CSSProperties,
}> = ({
    primaryHeader,
    secondaryHeader,
    listItems,
    helpText,
    style
}): React.ReactElement => {
    const [helpDialogOpen, setHelpDialogOpen] = React.useState(false);

    return (
        <>
            <List
                style={style}
                sx={{
                    width: "100%"
                }}
                subheader={
                    <Grid2
                        container
                        alignItems="center"
                        sx={{
                            width: "100%",
                            px: {xs: 0.5, sm: 1},
                            py: 0.5
                        }}
                    >
                        <Grid2
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                maxWidth: helpText ? "84%" : undefined
                            }}
                        >
                            <ListItemText
                                sx={{
                                    px: 1,
                                    py: 1
                                }}
                                primary={
                                    <span
                                        style={{
                                            fontWeight: 700,
                                            fontSize: "1.05rem"
                                        }}
                                    >
                                        {primaryHeader}
                                    </span>
                                }
                                secondary={secondaryHeader}
                            />
                        </Grid2>

                        {helpText && (
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
                        )}
                    </Grid2>
                }
            >
                {listItems.map((item, idx) => {
                    const divider = (
                        <Divider
                            variant="middle"
                            component="li"
                            key={idx + "_divider"}
                        />
                    );

                    const elem = item;

                    if (
                        idx > 0 &&
                        item.type !== SpacerListMenuItem &&
                        listItems[idx - 1].type !== SpacerListMenuItem
                    ) {
                        return [divider, elem];
                    }

                    return elem;
                })}
            </List>

            {
                helpText &&
                <HelpDialog
                    dialogOpen={helpDialogOpen}
                    setDialogOpen={(open: boolean) => {
                        setHelpDialogOpen(open);
                    }}
                    helpText={helpText}
                />
            }
        </>
    );
};
