/**
 * Utilitaires de sanitization pour prévenir les XSS
 */

/**
 * Sanitize HTML en convertissant en texte
 * @param {string} str - Chaîne à sanitizer
 * @returns {string} HTML sécurisé
 */
export function sanitizeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Sanitize et valide une couleur hexadécimale
 * @param {string} color - Couleur à valider
 * @param {string} fallback - Couleur par défaut
 * @returns {string} Couleur valide
 */
export function sanitizeColor(color, fallback = '#6366f1') {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    return hexPattern.test(color) ? color : fallback;
}

/**
 * Sanitize une icône MDI
 * @param {string} icon - Nom de l'icône
 * @param {string[]} whitelist - Liste des icônes autorisées
 * @param {string} fallback - Icône par défaut
 * @returns {string} Icône valide
 */
export function sanitizeIcon(icon, whitelist, fallback = 'web') {
    if (!icon || typeof icon !== 'string') return fallback;

    // Retirer tout caractère non-alphanumérique sauf tirets
    const cleaned = icon.replace(/[^a-z0-9-]/gi, '');

    // Vérifier contre whitelist si fournie
    if (whitelist && !whitelist.includes(cleaned)) {
        return fallback;
    }

    return cleaned;
}
