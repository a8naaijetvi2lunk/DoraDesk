/**
 * Gestion de GridStack
 */

import { CONFIG } from '../config.js';
import { Storage } from './storage.js';
import { showToast } from '../utils/toast.js';

export class GridManager {
    constructor() {
        this.grid = null;
        this.isEditMode = false;
    }

    /**
     * Initialise GridStack
     * @param {Function} onCardRender - Callback pour le rendu des widgets
     */
    init(onCardRender) {
        this.grid = GridStack.init(CONFIG.GRIDSTACK_OPTIONS);
        this.onCardRender = onCardRender;

        // Charger le layout sauvegardé
        this.loadLayout();

        // Écouter les changements
        this.grid.on('change', () => {
            if (this.isEditMode) {
                this.saveLayout(true);
            }
        });

        // Désactiver par défaut
        this.setEditMode(false);
    }

    /**
     * Charge le layout depuis le localStorage
     */
    loadLayout() {
        const savedLayout = Storage.loadLayout();
        const savedActive = JSON.parse(localStorage.getItem('activeCards') || '[]');

        this.grid.batchUpdate();
        this.grid.removeAll();

        if (savedLayout.length > 0) {
            // Charger avec positions spécifiques
            savedLayout.forEach(node => {
                if (this.onCardRender) {
                    this.onCardRender(node.id, false, node);
                }
            });
        } else if (savedActive.length > 0) {
            // Fallback sur liste d'IDs
            savedActive.forEach(id => {
                if (this.onCardRender) {
                    this.onCardRender(id, true);
                }
            });
        } else {
            // Widgets par défaut
            ['bookmarks', 'tasks', 'notes', 'tools-px'].forEach(id => {
                if (this.onCardRender) {
                    this.onCardRender(id, true);
                }
            });
        }

        this.grid.commit();
    }

    /**
     * Ajoute un widget à la grille
     * @param {string} id - ID du widget
     * @param {string} content - HTML du widget
     * @param {Object} size - Taille {w, h}
     * @param {boolean} autoPos - Positionnement automatique
     * @param {Object} node - Position spécifique
     * @returns {HTMLElement} Élément du widget
     */
    addWidget(id, content, size, autoPos = true, node = null) {
        const widgetOpts = {
            w: node ? node.w : size.w,
            h: node ? node.h : size.h,
            x: node ? node.x : undefined,
            y: node ? node.y : undefined,
            content: content,
            id: id,
            autoPosition: autoPos
        };

        const el = this.grid.addWidget(widgetOpts);

        if (el) {
            el.setAttribute('gs-id', id);
            el.setAttribute('data-widget', id);
        }

        return el;
    }

    /**
     * Supprime un widget
     * @param {HTMLElement} element - Élément à supprimer
     */
    removeWidget(element) {
        if (element) {
            this.grid.removeWidget(element);
        }
    }

    /**
     * Sauvegarde le layout
     * @param {boolean} silent - Ne pas afficher de toast
     */
    saveLayout(silent = false) {
        const layout = this.grid.save(false);
        Storage.saveLayout(layout);

        if (!silent) {
            showToast('💾 Disposition enregistrée');
        }
    }

    /**
     * Active/désactive le mode édition
     * @param {boolean} enabled - État du mode édition
     */
    setEditMode(enabled) {
        this.isEditMode = enabled;
        const btn = document.getElementById('editModeBtn');

        if (enabled) {
            this.grid.enable();
            if (btn) {
                btn.innerHTML = '<i class="mdi mdi-lock-open-variant text-accent text-xl"></i>';
                btn.classList.add('bg-white/10', 'text-white');
            }
            showToast('🔓 Mode édition activé');
        } else {
            this.grid.disable();
            if (btn) {
                btn.innerHTML = '<i class="mdi mdi-lock text-xl"></i>';
                btn.classList.remove('bg-white/10', 'text-white');
            }
        }
    }

    /**
     * Bascule le mode édition
     */
    toggleEditMode() {
        this.setEditMode(!this.isEditMode);
    }

    /**
     * Récupère tous les widgets actifs
     * @returns {Array} IDs des widgets actifs
     */
    getActiveWidgets() {
        return this.grid.engine.nodes.map(n => n.el.getAttribute('gs-id')).filter(Boolean);
    }
}
