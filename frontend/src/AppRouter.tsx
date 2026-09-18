import {HashRouter, Navigate, Route, Routes} from "react-router-dom";
import Div100vh from "react-div-100vh";
import HomePage from "./HomePage";
import OptionsRouter from "./options";
import {PaletteMode, styled} from "@mui/material";
import RobotRouter from "./robot";
import React from "react";
import {LanguageProvider} from "./i18n";
import ValetudoRouter from "./valetudo";

const Root = styled(Div100vh)({
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
});

const Content = styled("main")({
    flex: "1",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    overflow: "hidden",
});

const AppRouter: React.FunctionComponent<{
    paletteMode: PaletteMode,
    setPaletteMode: (newMode: PaletteMode) => void
}> = ({
    paletteMode,
    setPaletteMode
}): React.ReactElement => {
    return (
        <LanguageProvider>
            <HashRouter>
                <Root>
                    <Content>
                        <Routes>
                            <Route path="" element={<HomePage />} />
                            <Route path="robot/*" element={<RobotRouter />} />
                            <Route path="options/*" element={<OptionsRouter />} />
                            <Route path="valetudo/*" element={<ValetudoRouter />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </Content>
                </Root>
            </HashRouter>
        </LanguageProvider>
    );
};

export default AppRouter;
