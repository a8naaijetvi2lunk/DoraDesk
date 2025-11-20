/**
 * Registre centralisé des widgets
 */

// Import de tous les widgets disponibles
import { bookmarksWidget } from './bookmarks.js';
import { tasksWidget } from './tasks.js';
import { notesWidget } from './notes.js';
import { toolsPxWidget } from './tools-px.js';
import { toolsPassWidget } from './tools-pass.js';
import { snippetsWidget } from './snippets.js';
import { calculatorWidget } from './calculator.js';
import { pomodoroWidget } from './pomodoro.js';
import { gitCheatsheetWidget } from './git-cheatsheet.js';
import { emojiPickerWidget } from './emoji-picker.js';
import { rssFeedsWidget } from './rss-feeds.js';
import { statisticsWidget } from './statistics.js';

/**
 * Classe de gestion des widgets
 */
export class WidgetRegistry {
    static widgets = new Map();

    /**
     * Initialise et enregistre tous les widgets
     */
    static init() {
        this.register(bookmarksWidget);
        this.register(tasksWidget);
        this.register(notesWidget);
        this.register(toolsPxWidget);
        this.register(toolsPassWidget);
        this.register(snippetsWidget);
        this.register(calculatorWidget);
        this.register(pomodoroWidget);
        this.register(gitCheatsheetWidget);
        this.register(emojiPickerWidget);
        this.register(rssFeedsWidget);
        this.register(statisticsWidget);
    }

    /**
     * Enregistre un widget
     * @param {Object} widget - Définition du widget
     */
    static register(widget) {
        if (!widget.id) {
            console.error('Widget sans ID', widget);
            return;
        }
        this.widgets.set(widget.id, widget);
    }

    /**
     * Récupère un widget par son ID
     * @param {string} id - ID du widget
     * @returns {Object|null} Widget ou null
     */
    static get(id) {
        return this.widgets.get(id) || null;
    }

    /**
     * Récupère tous les widgets
     * @returns {Array} Liste des widgets
     */
    static getAll() {
        return Array.from(this.widgets.values());
    }

    /**
     * Récupère tous les widgets en tant que Map
     * @returns {Map} Map des widgets
     */
    static getAllAsMap() {
        return new Map(this.widgets);
    }
}
