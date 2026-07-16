export interface Accent {
    name: string;
    main: string;
    glow: string;
}

export const ACCENTS: Record<string, Accent> = {
    Red: {
        name: "Red",
        main: "#EF4444",
        glow: "rgba(239, 68, 68, 0.45)",
    },

    Blue: {
        name: "Blue",
        main: "#3B82F6",
        glow: "rgba(59, 130, 246, 0.45)",
    },

    Green: {
        name: "Green",
        main: "#22C55E",
        glow: "rgba(34, 197, 94, 0.45)",
    },
};