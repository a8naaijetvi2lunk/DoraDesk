/**
 * Utilitaires de validation
 */

/**
 * Valide qu'une URL est sûre
 * @param {string} url - URL à valider
 * @returns {boolean} true si valide
 */
export function isValidURL(url) {
    if (!url || typeof url !== 'string') {
        return false;
    }

    try {
        const parsed = new URL(url);

        // Whitelist de protocoles
        const allowedProtocols = ['http:', 'https:'];

        if (!allowedProtocols.includes(parsed.protocol)) {
            console.warn(`Protocole non autorisé: ${parsed.protocol}`);
            return false;
        }

        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Valide un schéma de données
 * @param {Object} data - Données à valider
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateDataSchema(data) {
    const errors = [];

    if (!data || typeof data !== 'object') {
        errors.push('Format de données invalide');
        return { valid: false, errors };
    }

    // Valider bookmarks
    if (data.bookmarks && Array.isArray(data.bookmarks)) {
        data.bookmarks.forEach((bookmark, idx) => {
            if (!bookmark.category || typeof bookmark.category !== 'string') {
                errors.push(`Bookmark ${idx}: catégorie invalide`);
            }
            if (!Array.isArray(bookmark.apps)) {
                errors.push(`Bookmark ${idx}: apps doit être un tableau`);
            } else {
                bookmark.apps.forEach((app, appIdx) => {
                    if (!app.name || !app.url) {
                        errors.push(`Bookmark ${idx}, app ${appIdx}: nom ou URL manquant`);
                    }
                    if (app.url && !isValidURL(app.url)) {
                        errors.push(`Bookmark ${idx}, app ${appIdx}: URL invalide`);
                    }
                });
            }
        });
    }

    // Valider tasks
    if (data.tasks && Array.isArray(data.tasks)) {
        data.tasks.forEach((task, idx) => {
            if (!task.id || !task.title) {
                errors.push(`Tâche ${idx}: ID ou titre manquant`);
            }
            const validPriorities = ['normal', 'important', 'urgent'];
            if (!validPriorities.includes(task.priority)) {
                errors.push(`Tâche ${idx}: priorité invalide`);
            }
        });
    }

    // Valider notes
    if (data.notes && typeof data.notes !== 'string') {
        errors.push('Notes: doit être une chaîne');
    }

    // Limiter la taille des notes
    if (data.notes && data.notes.length > 100000) {
        errors.push('Notes: trop volumineuses (max 100000 caractères)');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
