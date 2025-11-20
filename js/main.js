/**
 * Point d'entrée principal de DoraDesk
 */

import { CONFIG } from './config.js';
import { Storage } from './core/storage.js';
import { Statistics } from './core/statistics.js';
import { Updater } from './core/updater.js';
import { GridManager } from './core/grid.js';
import { ModalManager } from './core/modal.js';
import { showToast } from './utils/toast.js';
import { WidgetRegistry } from './widgets/registry.js';

/**
 * Classe principale de DoraDesk
 */
class DoraDeskApp {
    constructor() {
        this.data = null;
        this.prefs = null;
        this.gridManager = null;
        this.modalManager = null;
        this.widgets = null;
        this.autosaveInterval = null;
        this.searchResults = [];
    }

    /**
     * Initialise l'application
     */
    async init() {
        console.log('🚀 Initialisation de DoraDesk...');

        // Charger les données
        this.data = Storage.load();
        this.prefs = Storage.loadPreferences();

        // Initialiser les statistiques
        Statistics.init();

        // Initialiser les gestionnaires
        this.registerWidgets();
        this.gridManager = new GridManager();
        this.modalManager = new ModalManager();

        // Initialiser GridStack avec callback de rendu
        this.gridManager.init((id, autoPos, node) => this.addWidget(id, autoPos, node));
        this.modalManager.init();

        // Appliquer le thème
        this.applyTheme();

        // Mettre à jour l'heure et le greeting
        this.updateTime();
        this.renderGreeting();
        setInterval(() => this.updateTime(), 1000);

        // Configuration
        this.setupKeyboardShortcuts();
        this.setupAutosave();
        this.initSearch();

        // Vérifier les mises à jour au démarrage
        setTimeout(() => Updater.autoCheckForUpdates(), 3000);

        console.log('✅ DoraDesk initialisé (v' + CONFIG.VERSION + ')');
    }

    /**
     * Enregistre tous les widgets disponibles
     */
    registerWidgets() {
        WidgetRegistry.init();
        this.widgets = WidgetRegistry.getAllAsMap();
        console.log(`📦 ${this.widgets.size} widgets enregistrés`);
    }

    /**
     * Ajoute un widget à la grille
     * @param {string} id - ID du widget
     * @param {boolean} autoPos - Positionnement automatique
     * @param {Object} node - Position spécifique du widget
     */
    addWidget(id, autoPos = true, node = null) {
        const widget = WidgetRegistry.get(id);

        if (!widget) {
            console.error(`Widget "${id}" introuvable`);
            return;
        }

        // Vérifier si le widget existe déjà
        const existing = document.querySelector(`[data-widget="${id}"]`);
        if (existing) {
            console.warn(`Widget "${id}" déjà présent`);
            return;
        }

        // Générer le HTML complet du widget
        const html = this.renderWidgetWrapper(widget);

        // Ajouter à la grille
        const element = this.gridManager.addWidget(
            id,
            html,
            widget.size,
            autoPos,
            node
        );

        // Initialiser le widget si nécessaire
        if (element && widget.init) {
            setTimeout(() => {
                widget.init(this.data, this);
            }, 100);
        }
    }

    /**
     * Génère le HTML wrapper d'un widget
     * @param {Object} widget - Définition du widget
     * @returns {string} HTML du widget
     */
    renderWidgetWrapper(widget) {
        return `
            <div class="glass-panel h-full flex flex-col rounded-2xl relative group overflow-hidden border border-white/5 transition-colors hover:border-white/10">
                <!-- Header -->
                <div class="card-header flex justify-between items-center p-4 pb-2 cursor-grab active:cursor-grabbing select-none">
                    <div class="flex items-center gap-2 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        <i class="mdi ${widget.icon} text-lg"></i>
                        <span class="font-semibold text-sm tracking-wide uppercase">${widget.name}</span>
                    </div>
                    <div class="flex gap-1">
                        <!-- Actions du widget (toujours visibles) -->
                        <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            ${widget.actions || ''}
                        </div>
                        <!-- Bouton de suppression (visible uniquement en mode édition) -->
                        <button
                            onclick="app.removeWidget('${widget.id}')"
                            class="widget-close-btn hidden p-1 hover:bg-white/10 hover:text-red-400 rounded transition-colors"
                            title="Supprimer">
                            <i class="mdi mdi-close text-sm"></i>
                        </button>
                    </div>
                </div>

                <!-- Content -->
                <div class="flex-1 overflow-auto p-4" id="widget-${widget.id}">
                    ${widget.render(this.data)}
                </div>
            </div>
        `;
    }

    /**
     * Rafraîchit le contenu d'un widget
     * @param {string} id - ID du widget
     */
    refreshWidget(id) {
        const widget = WidgetRegistry.get(id);
        if (!widget) return;

        const container = document.getElementById(`widget-${id}`);
        if (!container) return;

        // Re-render le contenu
        container.innerHTML = widget.render(this.data);

        // Ré-initialiser si nécessaire
        if (widget.init) {
            widget.init(this.data, this);
        }

        showToast(`Widget "${widget.name}" rafraîchi`);
    }

    /**
     * Supprime un widget de la grille
     * @param {string} id - ID du widget
     */
    removeWidget(id) {
        const element = document.querySelector(`[data-widget="${id}"]`);
        if (element) {
            this.gridManager.removeWidget(element);
            this.saveLayout(true);
        }
    }

    /**
     * Applique le thème (couleur d'accent et fond)
     */
    applyTheme() {
        // Couleur d'accent
        const accent = this.prefs.accent || CONFIG.DEFAULT_ACCENT;
        document.documentElement.style.setProperty('--accent-color', accent);

        // Image de fond
        const bgOverlay = document.getElementById('bgOverlay');
        const bgDimmer = document.getElementById('bgDimmer');

        if (this.prefs.bgUrl && bgOverlay && bgDimmer) {
            bgOverlay.style.backgroundImage = `url(${this.prefs.bgUrl})`;
            setTimeout(() => {
                bgOverlay.style.opacity = '1';
                bgDimmer.style.opacity = '1';
            }, 100);
        } else if (bgOverlay && bgDimmer) {
            bgOverlay.style.opacity = '0';
            bgDimmer.style.opacity = '0';
        }
    }

    /**
     * Met à jour l'heure et la date
     */
    updateTime() {
        const now = new Date();
        const timeEl = document.getElementById('currentTime');
        const dateEl = document.getElementById('currentDate');

        if (timeEl) {
            timeEl.textContent = now.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        if (dateEl) {
            dateEl.textContent = now.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
    }

    /**
     * Affiche un message de salutation selon l'heure
     */
    renderGreeting() {
        const greetingEl = document.getElementById('greeting');
        if (!greetingEl) return;

        const hour = new Date().getHours();
        let greeting = 'Bonsoir';

        if (hour >= 5 && hour < 12) {
            greeting = 'Bonjour';
        } else if (hour >= 12 && hour < 18) {
            greeting = 'Bon après-midi';
        }

        greetingEl.textContent = greeting;
    }

    /**
     * Configure la sauvegarde automatique
     */
    setupAutosave() {
        // Sauvegarder toutes les 30 secondes
        this.autosaveInterval = setInterval(() => {
            Storage.save(this.data);
        }, 30000);
    }

    /**
     * Configure les raccourcis clavier
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K : Recherche rapide
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openQuickLaunch();
            }

            // Ctrl/Cmd + S : Sauvegarder
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveLayout(false);
            }

            // Escape : Fermer les modales
            if (e.key === 'Escape') {
                this.modalManager.closeAll();
            }
        });
    }

    /**
     * Bascule le mode édition
     */
    toggleEditMode() {
        this.gridManager.toggleEditMode();

        // Afficher/masquer les boutons de fermeture
        const isEditMode = this.gridManager.isEditMode;
        const closeButtons = document.querySelectorAll('.widget-close-btn');

        closeButtons.forEach(btn => {
            if (isEditMode) {
                btn.classList.remove('hidden');
            } else {
                btn.classList.add('hidden');
            }
        });
    }

    /**
     * Sauvegarde la disposition de la grille
     * @param {boolean} silent - Ne pas afficher de notification
     */
    saveLayout(silent = false) {
        // Sauvegarder le layout de la grille
        this.gridManager.saveLayout(silent);

        // Sauvegarder les données
        Storage.save(this.data);

        if (!silent) {
            showToast('Sauvegarde effectuée');
        }
    }

    /**
     * Retourne la description d'un widget
     * @param {string} widgetId - ID du widget
     * @returns {string} Description du widget
     */
    getWidgetDescription(widgetId) {
        const descriptions = {
            'bookmarks': 'Gérez vos sites favoris organisés par catégories',
            'tasks': 'Liste de tâches avec priorités et suivi',
            'notes': 'Bloc-notes avec sauvegarde automatique',
            'tools-px': 'Convertisseur PX ↔ REM pour le développement',
            'tools-pass': 'Générateur de mots de passe sécurisés',
            'snippets': 'Bibliothèque de snippets de code réutilisables',
            'calculator': 'Calculatrice avec opérations basiques',
            'pomodoro': 'Timer Pomodoro pour gérer votre temps',
            'git-cheatsheet': 'Commandes Git essentielles à portée de main',
            'emoji-picker': 'Sélecteur d\'emojis avec historique',
            'rss-feeds': 'Flux RSS personnalisés et actualisés',
            'statistics': 'Dashboard de statistiques et tracking'
        };
        return descriptions[widgetId] || 'Widget pour votre dashboard';
    }

    /**
     * Ouvre le gestionnaire de cartes/widgets
     */
    openCardManager() {
        const activeWidgets = this.gridManager.getActiveWidgets();
        const allWidgets = WidgetRegistry.getAll();
        const activeCount = activeWidgets.length;
        const totalCount = allWidgets.length;

        let html = `
            <div class="w-full max-w-4xl">
                <!-- Header avec stats -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                    <div class="flex-1">
                        <h2 class="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
                            <i class="mdi mdi-view-grid-plus text-accent text-xl sm:text-2xl"></i>
                            <span>Gérer les Widgets</span>
                        </h2>
                        <p class="text-xs sm:text-sm text-zinc-500 mt-1">
                            ${activeCount} widget${activeCount > 1 ? 's' : ''} actif${activeCount > 1 ? 's' : ''} sur ${totalCount}
                        </p>
                    </div>
                    <button
                        onclick="window.modalManager.closeAll()"
                        class="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white self-start sm:self-auto">
                        <i class="mdi mdi-close text-xl"></i>
                    </button>
                </div>

                <!-- Grid de widgets avec catégories -->
                <div class="space-y-3 sm:space-y-4 max-h-[50vh] sm:max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
                    <!-- Widgets Actifs -->
                    ${activeCount > 0 ? `
                        <div>
                            <h3 class="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2 sticky top-0 bg-dark-800/90 backdrop-blur-sm py-2 z-10">
                                <i class="mdi mdi-check-circle text-accent"></i>
                                <span>Actifs</span>
                            </h3>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                ${allWidgets.filter(w => activeWidgets.includes(w.id)).map(widget => `
                                    <button
                                        onclick="app.removeWidget('${widget.id}'); window.modalManager.closeAll();"
                                        class="group relative bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 p-3 sm:p-4 rounded-xl transition-all hover:border-accent hover:shadow-lg hover:shadow-accent/20 active:scale-95 text-left flex items-start gap-2 sm:gap-3">
                                        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <i class="mdi mdi-${widget.icon} text-xl sm:text-2xl text-accent"></i>
                                        </div>
                                        <div class="flex-1 min-w-0 pr-6 sm:pr-0">
                                            <div class="font-semibold text-sm sm:text-base text-white mb-0.5 sm:mb-1">${widget.name}</div>
                                            <div class="text-xs text-zinc-400 line-clamp-2">${this.getWidgetDescription(widget.id)}</div>
                                        </div>
                                        <div class="absolute top-2 right-2 sm:top-3 sm:right-3 w-6 h-6 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <i class="mdi mdi-close text-sm"></i>
                                        </div>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Widgets Disponibles -->
                    ${allWidgets.filter(w => !activeWidgets.includes(w.id)).length > 0 ? `
                        <div>
                            <h3 class="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2 sticky top-0 bg-dark-800/90 backdrop-blur-sm py-2 z-10">
                                <i class="mdi mdi-plus-circle"></i>
                                <span>Disponibles</span>
                            </h3>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                ${allWidgets.filter(w => !activeWidgets.includes(w.id)).map(widget => `
                                    <button
                                        onclick="app.addWidget('${widget.id}'); window.modalManager.closeAll();"
                                        class="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 p-3 sm:p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 text-left flex items-start gap-2 sm:gap-3">
                                        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                                            <i class="mdi mdi-${widget.icon} text-xl sm:text-2xl text-zinc-400 group-hover:text-accent transition-colors"></i>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <div class="font-semibold text-sm sm:text-base text-white mb-0.5 sm:mb-1 group-hover:text-accent transition-colors">${widget.name}</div>
                                            <div class="text-xs text-zinc-500 line-clamp-2">${this.getWidgetDescription(widget.id)}</div>
                                        </div>
                                        <div class="w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            <i class="mdi mdi-plus text-sm"></i>
                                        </div>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Footer -->
                <div class="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10 flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
                    <div class="text-xs text-zinc-500 hidden sm:block">
                        <i class="mdi mdi-gesture-tap"></i> Cliquez pour ajouter/retirer
                    </div>
                    <button
                        onclick="window.modalManager.closeAll()"
                        class="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-accent hover:brightness-110 rounded-lg text-white font-medium transition-all">
                        <i class="mdi mdi-check"></i> Terminé
                    </button>
                </div>
            </div>
        `;

        this.modalManager.open(html);
    }

    /**
     * Ouvre les paramètres de l'application
     */
    openSettings() {
        const html = `
            <div class="space-y-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold">Paramètres</h2>
                    <button
                        onclick="window.modalManager.closeAll()"
                        class="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <i class="mdi mdi-close text-xl"></i>
                    </button>
                </div>

                <!-- Couleur d'accent -->
                <div class="space-y-2">
                    <label class="block text-sm font-medium">Couleur d'accent</label>
                    <div class="flex gap-2 items-center">
                        <input
                            type="color"
                            id="accentPicker"
                            value="${this.prefs.accent || CONFIG.DEFAULT_ACCENT}"
                            class="w-12 h-12 rounded cursor-pointer">
                        <input
                            type="text"
                            id="accentInput"
                            value="${this.prefs.accent || CONFIG.DEFAULT_ACCENT}"
                            class="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
                            placeholder="#6366f1">
                        <button
                            onclick="app.updateAccent()"
                            class="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-opacity">
                            Appliquer
                        </button>
                    </div>
                </div>

                <!-- Image de fond -->
                <div class="space-y-2">
                    <label class="block text-sm font-medium">Image de fond (URL)</label>
                    <div class="flex gap-2">
                        <input
                            type="text"
                            id="bgUrlInput"
                            value="${this.prefs.bgUrl || ''}"
                            class="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
                            placeholder="https://...">
                        <button
                            onclick="app.updateBackground()"
                            class="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-opacity">
                            Appliquer
                        </button>
                    </div>
                    ${this.prefs.bgUrl ? `
                        <button
                            onclick="app.removeBackground()"
                            class="text-sm text-red-400 hover:text-red-300">
                            Supprimer l'image de fond
                        </button>
                    ` : ''}
                </div>

                <!-- Export/Import -->
                <div class="pt-4 border-t border-white/10 space-y-3">
                    <h3 class="font-semibold">Données</h3>
                    <div class="flex gap-3">
                        <button
                            onclick="app.exportData()"
                            class="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-2">
                            <i class="mdi mdi-download"></i>
                            Exporter
                        </button>
                        <button
                            onclick="app.importData()"
                            class="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-2">
                            <i class="mdi mdi-upload"></i>
                            Importer
                        </button>
                    </div>
                </div>

                <!-- Réinitialiser -->
                <div class="pt-4 border-t border-white/10">
                    <button
                        onclick="app.resetApp()"
                        class="w-full px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                        Réinitialiser l'application
                    </button>
                </div>
            </div>
        `;

        this.modalManager.open(html);

        // Synchroniser les champs de couleur
        const picker = document.getElementById('accentPicker');
        const input = document.getElementById('accentInput');

        if (picker && input) {
            picker.addEventListener('input', () => {
                input.value = picker.value;
            });
            input.addEventListener('input', () => {
                if (/^#[0-9A-F]{6}$/i.test(input.value)) {
                    picker.value = input.value;
                }
            });
        }
    }

    /**
     * Met à jour la couleur d'accent
     */
    updateAccent() {
        const input = document.getElementById('accentInput');
        if (!input) return;

        const color = input.value;
        if (!/^#[0-9A-F]{6}$/i.test(color)) {
            showToast('Couleur invalide (format: #RRGGBB)');
            return;
        }

        this.prefs.accent = color;
        Storage.savePreferences(this.prefs);
        this.applyTheme();
        showToast('Couleur d\'accent mise à jour');
    }

    /**
     * Met à jour l'image de fond
     */
    updateBackground() {
        const input = document.getElementById('bgUrlInput');
        if (!input) return;

        this.prefs.bgUrl = input.value.trim();
        Storage.savePreferences(this.prefs);
        this.applyTheme();
        showToast('Image de fond mise à jour');
    }

    /**
     * Supprime l'image de fond
     */
    removeBackground() {
        this.prefs.bgUrl = '';
        Storage.savePreferences(this.prefs);
        this.applyTheme();
        this.modalManager.closeAll();
        showToast('Image de fond supprimée');
    }

    /**
     * Ouvre la recherche rapide (Quick Launch)
     */
    openQuickLaunch() {
        this.modalManager.openSearch();
        this.performSearch('');
    }

    /**
     * Initialise la recherche
     */
    initSearch() {
        const searchInput = document.getElementById('quickSearch');
        const resultsContainer = document.getElementById('searchResults');

        if (!searchInput || !resultsContainer) return;

        // Recherche en temps réel
        searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });

        // Navigation au clavier
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateResults(e.key === 'ArrowDown' ? 1 : -1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.selectResult();
            }
        });
    }

    /**
     * Effectue une recherche dans les favoris et widgets
     * @param {string} query - Terme de recherche
     */
    performSearch(query) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;

        this.searchResults = [];

        // Recherche dans les favoris
        if (this.data.bookmarks) {
            this.data.bookmarks.forEach(category => {
                if (category.apps) {
                    category.apps.forEach(app => {
                        if (
                            app.name.toLowerCase().includes(query.toLowerCase()) ||
                            app.url.toLowerCase().includes(query.toLowerCase())
                        ) {
                            this.searchResults.push({
                                type: 'bookmark',
                                name: app.name,
                                url: app.url,
                                icon: app.icon || 'link',
                                category: category.category
                            });
                        }
                    });
                }
            });
        }

        // Recherche dans les widgets
        if (query.trim()) {
            WidgetRegistry.getAll().forEach(widget => {
                if (
                    widget.name.toLowerCase().includes(query.toLowerCase()) ||
                    (widget.description && widget.description.toLowerCase().includes(query.toLowerCase()))
                ) {
                    this.searchResults.push({
                        type: 'widget',
                        name: widget.name,
                        id: widget.id,
                        icon: widget.icon || 'apps',
                        description: widget.description
                    });
                }
            });
        }

        // Afficher les résultats
        this.renderSearchResults();
    }

    /**
     * Affiche les résultats de recherche
     */
    renderSearchResults() {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;

        if (this.searchResults.length === 0) {
            resultsContainer.innerHTML = `
                <div class="text-center py-8 text-zinc-500">
                    <i class="mdi mdi-magnify text-4xl mb-2"></i>
                    <p>Aucun résultat</p>
                </div>
            `;
            return;
        }

        let html = '<div class="space-y-1">';

        this.searchResults.forEach((result, index) => {
            if (result.type === 'bookmark') {
                html += `
                    <a
                        href="${result.url}"
                        target="_blank"
                        data-index="${index}"
                        class="search-result block px-4 py-3 hover:bg-white/10 rounded-lg transition-colors group">
                        <div class="flex items-center gap-3">
                            <i class="mdi mdi-${result.icon} text-accent text-xl"></i>
                            <div class="flex-1 min-w-0">
                                <div class="font-medium">${result.name}</div>
                                <div class="text-xs text-zinc-500">${result.category}</div>
                            </div>
                            <i class="mdi mdi-open-in-new text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                    </a>
                `;
            } else if (result.type === 'widget') {
                html += `
                    <button
                        onclick="app.addWidget('${result.id}'); window.modalManager.closeAll();"
                        data-index="${index}"
                        class="search-result w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
                        <div class="flex items-center gap-3">
                            <i class="mdi mdi-${result.icon} text-accent text-xl"></i>
                            <div class="flex-1 min-w-0">
                                <div class="font-medium">${result.name}</div>
                                ${result.description ? `<div class="text-xs text-zinc-500">${result.description}</div>` : ''}
                            </div>
                            <i class="mdi mdi-plus text-zinc-500"></i>
                        </div>
                    </button>
                `;
            }
        });

        html += '</div>';
        resultsContainer.innerHTML = html;
    }

    /**
     * Navigation clavier dans les résultats
     * @param {number} direction - Direction (1 = bas, -1 = haut)
     */
    navigateResults(direction) {
        const results = document.querySelectorAll('.search-result');
        if (results.length === 0) return;

        const currentIndex = Array.from(results).findIndex(el =>
            el.classList.contains('bg-white/10')
        );

        // Retirer la sélection actuelle
        results.forEach(el => el.classList.remove('bg-white/10'));

        // Calculer le nouvel index
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = results.length - 1;
        if (newIndex >= results.length) newIndex = 0;

        // Sélectionner le nouvel élément
        results[newIndex].classList.add('bg-white/10');
        results[newIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    /**
     * Sélectionne le résultat actuel
     */
    selectResult() {
        const selected = document.querySelector('.search-result.bg-white\\/10');
        if (selected) {
            selected.click();
        } else {
            // Si aucun sélectionné, prendre le premier
            const first = document.querySelector('.search-result');
            if (first) first.click();
        }
    }

    /**
     * Exporte toutes les données en JSON
     */
    exportData() {
        const exportData = Storage.exportAll();
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `doradesk-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        showToast('Données exportées');
    }

    /**
     * Importe des données depuis un fichier JSON
     */
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const importedData = JSON.parse(text);

                const success = Storage.importAll(importedData);

                if (success) {
                    showToast('Import réussi - Rechargement...');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showToast('Erreur lors de l\'import');
                }
            } catch (e) {
                console.error('Erreur import:', e);
                showToast('Fichier invalide');
            }
        };

        input.click();
    }

    /**
     * Réinitialise l'application
     */
    resetApp() {
        const message = 'Êtes-vous sûr de vouloir réinitialiser toutes les données ?';

        const html = `
            <div class="text-center">
                <i class="mdi mdi-alert-circle text-red-400 text-5xl mb-4"></i>
                <h2 class="text-xl font-bold mb-2">Confirmation</h2>
                <p class="text-zinc-400 mb-6">${message}</p>
                <div class="flex gap-3 justify-center">
                    <button
                        onclick="window.modalManager.closeAll()"
                        class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors">
                        Annuler
                    </button>
                    <button
                        onclick="localStorage.clear(); location.reload();"
                        class="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white transition-colors">
                        Réinitialiser
                    </button>
                </div>
            </div>
        `;

        this.modalManager.open(html);
    }
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    const app = new DoraDeskApp();
    app.init();

    // Exposer globalement pour les widgets et l'HTML
    window.app = app;

    // Exposer les fonctions nécessaires aux widgets
    window.appData = app.data;
    window.saveData = () => {
        Storage.save(app.data);
        showToast('Sauvegardé');
    };
    window.refreshCard = (widgetId) => {
        app.refreshWidget(widgetId);
    };
    window.openModal = (html) => {
        app.modalManager.open(html);
    };
    window.closeAllModals = () => {
        app.modalManager.closeAll();
    };
    window.showToast = showToast;
    window.modalManager = app.modalManager;
    window.Statistics = Statistics;
});
