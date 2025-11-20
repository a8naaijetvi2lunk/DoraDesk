/**
 * Système de gestion des modales
 */

export class ModalManager {
    constructor() {
        this.overlay = null;
        this.content = null;
        this.searchModal = null;
        this.searchBox = null;
        this.previousFocus = null;
    }

    /**
     * Initialise le gestionnaire de modales
     */
    init() {
        this.overlay = document.getElementById('modalOverlay');
        this.content = document.getElementById('modalContent');
        this.searchModal = document.getElementById('searchModal');
        this.searchBox = document.getElementById('searchBox');
    }

    /**
     * Ouvre une modale avec du contenu HTML
     * @param {string} html - Contenu HTML de la modale
     */
    open(html) {
        if (!this.overlay || !this.content) return;

        // Sauvegarder le focus actuel
        this.previousFocus = document.activeElement;

        // Insérer le contenu
        this.content.innerHTML = html;

        // Afficher la modale
        this.overlay.classList.remove('hidden');

        requestAnimationFrame(() => {
            this.overlay.classList.remove('opacity-0');
            this.content.classList.remove('opacity-0', 'scale-95');
            this.content.classList.add('scale-100');
        });

        // Empêcher le scroll du body
        document.body.style.overflow = 'hidden';

        // Focus sur le premier élément interactif
        setTimeout(() => {
            const firstInput = this.content.querySelector('input, textarea, button');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    /**
     * Ferme toutes les modales
     */
    closeAll() {
        // Fermer modale principale
        if (this.overlay) {
            this.overlay.classList.add('opacity-0');
            this.content.classList.add('opacity-0', 'scale-95');
            this.content.classList.remove('scale-100');

            setTimeout(() => {
                this.overlay.classList.add('hidden');
            }, 200);
        }

        // Fermer recherche
        if (this.searchModal) {
            this.searchBox?.classList.add('opacity-0', 'scale-95');
            this.searchModal.classList.add('opacity-0');

            setTimeout(() => {
                this.searchModal.classList.add('hidden');
            }, 200);
        }

        // Restaurer le scroll et le focus
        document.body.style.overflow = '';

        if (this.previousFocus) {
            this.previousFocus.focus();
            this.previousFocus = null;
        }
    }

    /**
     * Ouvre la modale de recherche
     */
    openSearch() {
        if (!this.searchModal || !this.searchBox) return;

        const input = document.getElementById('quickSearch');

        this.searchModal.classList.remove('hidden');

        requestAnimationFrame(() => {
            this.searchModal.classList.remove('opacity-0');
            this.searchBox.classList.remove('opacity-0', 'scale-95');
            this.searchBox.classList.add('scale-100');

            if (input) {
                input.value = '';
                input.focus();
            }
        });
    }

    /**
     * Crée une modale de confirmation
     * @param {string} message - Message de confirmation
     * @param {Function} onConfirm - Callback si confirmé
     */
    confirm(message, onConfirm) {
        const html = `
            <div class="text-center">
                <i class="mdi mdi-alert-circle text-amber-400 text-5xl mb-4"></i>
                <h2 class="text-xl font-bold mb-2">Confirmation</h2>
                <p class="text-zinc-400 mb-6">${message}</p>
                <div class="flex gap-3 justify-center">
                    <button
                        onclick="window.modalManager.closeAll()"
                        class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors">
                        Annuler
                    </button>
                    <button
                        onclick="window.modalManager.closeAll(); (${onConfirm})()"
                        class="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white transition-colors">
                        Confirmer
                    </button>
                </div>
            </div>
        `;

        this.open(html);
    }
}
