export interface DossierSettings
{
    serverUrl: string;

    serverKey: string;

    watchFolder: string;

    cpuLimitPercent: number;

    startOnBoot: boolean;

    startMinimized: boolean;

    theme: "dark" | "light";

    accent: "blue" | "green" | "red" | "pink" | "oxy";
}