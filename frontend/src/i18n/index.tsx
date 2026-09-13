import React from "react";

export type Language = "es" | "en";

const translations = {
    es: {
        appName: "X40-Control",
        subtitle: "Control total de tu Dreame",
        connected: "Conectado",
        connecting: "Conectando...",
        model: "Dreame X40 Ultra",

        home: "Inicio",
        map: "Mapa",
        rooms: "Habitaciones",
        zones: "Zonas",
        schedules: "Programaciones",
        history: "Historial",
        statistics: "Estadísticas",
        consumables: "Consumibles",
        settings: "Ajustes",

        currentStatus: "Estado actual",
        dock: "Estación",
        station: "Estación de vaciado y limpieza",
        ready: "Lista",
        additionalFunctions: "Funciones adicionales",

        start: "Iniciar",
        resume: "Reanudar",
        pause: "Pausar",
        stop: "Detener",
        homeRobot: "Volver a la base",

        mode: "Modo",
        water: "Agua",

        mapOfHouse: "Mapa de la casa",
        mainFloor: "Planta principal",

        language: "Idioma",
        spanish: "Español",
        english: "English",

        online: "Online",
        poweredBy: "Powered by Valetudo",

        alerts: "Avisos",
        notifications: "Avisos y notificaciones",
        noAlerts: "No hay avisos",
        close: "Cerrar",
    },

    en: {
        appName: "X40-Control",
        subtitle: "Full control of your Dreame",
        connected: "Connected",
        connecting: "Connecting...",
        model: "Dreame X40 Ultra",

        home: "Home",
        map: "Map",
        rooms: "Rooms",
        zones: "Zones",
        schedules: "Schedules",
        history: "History",
        statistics: "Statistics",
        consumables: "Consumables",
        settings: "Settings",

        currentStatus: "Current status",
        dock: "Dock",
        station: "Emptying and cleaning station",
        ready: "Ready",
        additionalFunctions: "Additional functions",

        start: "Start",
        resume: "Resume",
        pause: "Pause",
        stop: "Stop",
        homeRobot: "Return to dock",

        mode: "Mode",
        water: "Water",

        mapOfHouse: "Home map",
        mainFloor: "Main floor",

        language: "Language",
        spanish: "Español",
        english: "English",

        online: "Online",
        poweredBy: "Powered by Valetudo",

        alerts: "Alerts",
        notifications: "Alerts and notifications",
        noAlerts: "No alerts",
        close: "Close",
    },
} as const;

export type TranslationKey = keyof typeof translations.es;

interface LanguageContextValue {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = React.createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = "x40-control-language";

const getInitialLanguage = (): Language => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === "es" || saved === "en") {
        return saved;
    }

    const browserLanguage = navigator.language.toLowerCase();

    return browserLanguage.startsWith("es") ? "es" : "en";
};

export const LanguageProvider = ({
    children,
}: {
    children: React.ReactNode;
}): React.ReactElement => {
    const [language, setLanguageState] = React.useState<Language>(getInitialLanguage);

    const setLanguage = React.useCallback((newLanguage: Language) => {
        setLanguageState(newLanguage);
        localStorage.setItem(STORAGE_KEY, newLanguage);
    }, []);

    const t = React.useCallback(
        (key: TranslationKey): string => {
            return translations[language][key];
        },
        [language],
    );

    return (
        <LanguageContext.Provider value={{language: language, setLanguage: setLanguage, t: t}}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextValue => {
    const context = React.useContext(LanguageContext);

    if (!context) {
        throw new Error("useLanguage must be used inside LanguageProvider");
    }

    return context;
};
