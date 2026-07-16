export interface DossierSettings
{
    serverUrl: string;

    serverKey?: string;

    watchFolder: string;

    uploadLimit: number;

    cpuLimit: number;

    frameInterval: number;

    startOnBoot: boolean;

    startMinimized: boolean;

    theme: "dark" | "light";

    accent: "blue" | "green" | "red";
}