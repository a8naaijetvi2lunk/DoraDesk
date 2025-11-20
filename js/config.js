/**
 * Configuration globale de DoraDesk
 */
export const CONFIG = {
    // Version
    VERSION: '0.0.1',

    // LocalStorage keys
    STORAGE_KEY: 'doradesk_data_v2',
    LAYOUT_KEY: 'doradesk_layout_v2',
    PREFS_KEY: 'doradesk_prefs_v2',

    // Apparence
    DEFAULT_ACCENT: '#6366f1',

    // GridStack options
    GRIDSTACK_OPTIONS: {
        column: 12,
        cellHeight: 80,
        minRow: 1,
        margin: 16,
        float: false,
        animate: true,
        disableOneColumnMode: true,
        resizable: { handles: 'e, se, s, sw, w' },
        draggable: { handle: '.card-header', scroll: true }
    },

    // Couleurs de priorité des tâches
    PRIORITY_COLORS: {
        urgent: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            text: 'text-red-400'
        },
        important: {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            text: 'text-amber-400'
        },
        normal: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            text: 'text-blue-400'
        }
    }
};

/**
 * Favoris par défaut
 */
export const DEFAULT_BOOKMARKS = [
    {
        category: "Développement",
        icon: "code-tags",
        apps: [
            { name: "GitHub", url: "https://github.com", icon: "github", color: "#333" },
            { name: "ChatGPT", url: "https://chat.openai.com", icon: "robot", color: "#10a37f" }
        ]
    },
    {
        category: "Design",
        icon: "palette",
        apps: [
            { name: "Figma", url: "https://figma.com", icon: "pencil-ruler", color: "#f24e1e" }
        ]
    }
];
