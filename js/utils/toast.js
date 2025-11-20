/**
 * Système de notifications toast
 */

/**
 * Affiche une notification toast
 * @param {string} message - Message à afficher
 * @param {number} duration - Durée d'affichage en ms
 */
export function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-dark-800 text-white px-4 py-2 rounded-full shadow-2xl border border-white/10 flex items-center gap-2 text-sm font-medium z-50';

    // Créer l'icône
    const icon = document.createElement('i');
    icon.className = 'mdi mdi-information-outline text-accent';

    // Créer le texte (sécurisé)
    const text = document.createElement('span');
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);

    document.body.appendChild(toast);

    // Animation d'entrée
    requestAnimationFrame(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 100%)';
        requestAnimationFrame(() => {
            toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            toast.style.opacity = '1';
            toast.style.transform = 'translate(-50%, 0)';
        });
    });

    // Animation de sortie
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 100%)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}
