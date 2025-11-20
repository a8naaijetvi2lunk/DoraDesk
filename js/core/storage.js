/**
 * Gestion du stockage local
 */

import { CONFIG, DEFAULT_BOOKMARKS } from '../config.js';
import { validateDataSchema } from '../utils/validators.js';

export class Storage {
    /**
     * Migre les données de DevSpace vers DoraDesk
     * À appeler une seule fois au démarrage
     */
    static migrateFromDevSpace() {
        const oldKeys = {
            data: 'devspace_data_v2',
            layout: 'devspace_layout_v2',
            prefs: 'devspace_prefs_v2'
        };

        const newKeys = {
            data: CONFIG.STORAGE_KEY,
            layout: CONFIG.LAYOUT_KEY,
            prefs: CONFIG.PREFS_KEY
        };

        let migrated = false;

        // Migrer les données principales
        if (!localStorage.getItem(newKeys.data) && localStorage.getItem(oldKeys.data)) {
            console.log('🔄 Migration DevSpace → DoraDesk: données');
            localStorage.setItem(newKeys.data, localStorage.getItem(oldKeys.data));
            migrated = true;
        }

        // Migrer le layout
        if (!localStorage.getItem(newKeys.layout) && localStorage.getItem(oldKeys.layout)) {
            console.log('🔄 Migration DevSpace → DoraDesk: layout');
            localStorage.setItem(newKeys.layout, localStorage.getItem(oldKeys.layout));
            migrated = true;
        }

        // Migrer les préférences
        if (!localStorage.getItem(newKeys.prefs) && localStorage.getItem(oldKeys.prefs)) {
            console.log('🔄 Migration DevSpace → DoraDesk: préférences');
            localStorage.setItem(newKeys.prefs, localStorage.getItem(oldKeys.prefs));
            migrated = true;
        }

        if (migrated) {
            console.log('✅ Migration DevSpace → DoraDesk terminée avec succès');
        }

        return migrated;
    }

    /**
     * Charge les données depuis localStorage
     * @returns {Object} Données de l'application
     */
    static load() {
        // Tenter la migration au premier chargement
        this.migrateFromDevSpace();

        const data = localStorage.getItem(CONFIG.STORAGE_KEY);

        if (data) {
            try {
                const parsed = JSON.parse(data);

                // Valider le schéma
                const validation = validateDataSchema(parsed);
                if (!validation.valid) {
                    console.warn('Données invalides, utilisation des valeurs par défaut', validation.errors);
                    return this.getDefaults();
                }

                return parsed;
            } catch (e) {
                console.error('Erreur lors du parsing des données', e);
                return this.getDefaults();
            }
        }

        return this.getDefaults();
    }

    /**
     * Sauvegarde les données dans localStorage
     * @param {Object} data - Données à sauvegarder
     */
    static save(data) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Erreur lors de la sauvegarde', e);
            return false;
        }
    }

    /**
     * Charge les préférences utilisateur
     * @returns {Object} Préférences
     */
    static loadPreferences() {
        const prefs = localStorage.getItem(CONFIG.PREFS_KEY);

        if (prefs) {
            try {
                return JSON.parse(prefs);
            } catch (e) {
                console.error('Erreur lors du parsing des préférences', e);
            }
        }

        return {
            accent: CONFIG.DEFAULT_ACCENT,
            bgUrl: ''
        };
    }

    /**
     * Sauvegarde les préférences
     * @param {Object} prefs - Préférences
     */
    static savePreferences(prefs) {
        try {
            localStorage.setItem(CONFIG.PREFS_KEY, JSON.stringify(prefs));
            return true;
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des préférences', e);
            return false;
        }
    }

    /**
     * Charge le layout de la grille
     * @returns {Array} Layout GridStack
     */
    static loadLayout() {
        const layout = localStorage.getItem(CONFIG.LAYOUT_KEY);

        if (layout) {
            try {
                return JSON.parse(layout);
            } catch (e) {
                console.error('Erreur lors du parsing du layout', e);
                return [];
            }
        }

        return [];
    }

    /**
     * Sauvegarde le layout
     * @param {Array} layout - Layout GridStack
     */
    static saveLayout(layout) {
        try {
            localStorage.setItem(CONFIG.LAYOUT_KEY, JSON.stringify(layout));

            // Aussi sauvegarder la liste des IDs actifs
            const activeIds = layout.map(node => node.id).filter(Boolean);
            localStorage.setItem('activeCards', JSON.stringify(activeIds));

            return true;
        } catch (e) {
            console.error('Erreur lors de la sauvegarde du layout', e);
            return false;
        }
    }

    /**
     * Données par défaut
     * @returns {Object} Structure de données par défaut
     */
    static getDefaults() {
        return {
            bookmarks: DEFAULT_BOOKMARKS,
            tasks: [],
            notes: '',
            snippets: [],
            counters: [],
            quickLinks: [],
            rssFeeds: []
        };
    }

    /**
     * Exporte toutes les données
     * @returns {Object} Toutes les données
     */
    static exportAll() {
        return {
            data: this.load(),
            layout: JSON.stringify(this.loadLayout()),
            prefs: this.loadPreferences()
        };
    }

    /**
     * Importe des données
     * @param {Object} importedData - Données à importer
     * @returns {boolean} Succès
     */
    static importAll(importedData) {
        try {
            // Backup actuel
            const backup = this.exportAll();
            localStorage.setItem('backup_before_import', JSON.stringify(backup));

            // Importer
            if (importedData.data) {
                const validation = validateDataSchema(importedData.data);
                if (!validation.valid) {
                    throw new Error('Données invalides: ' + validation.errors.join(', '));
                }
                this.save(importedData.data);
            }

            if (importedData.layout) {
                const layoutData = typeof importedData.layout === 'string'
                    ? JSON.parse(importedData.layout)
                    : importedData.layout;
                this.saveLayout(layoutData);
            }

            if (importedData.prefs) {
                this.savePreferences(importedData.prefs);
            }

            return true;
        } catch (e) {
            console.error('Erreur lors de l\'import', e);
            return false;
        }
    }
}
