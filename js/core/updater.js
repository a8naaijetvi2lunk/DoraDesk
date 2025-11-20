/**
 * Système de mise à jour automatique DoraDesk
 */

import { CONFIG } from '../config.js';

export class Updater {
    static GITHUB_REPO = 'a8naaijetvi2lunk/DoraDesk';
    static GITHUB_API = `https://api.github.com/repos/${this.GITHUB_REPO}/releases/latest`;
    static GITHUB_RAW = `https://raw.githubusercontent.com/${this.GITHUB_REPO}/main/dist/index.html`;
    static UPDATE_CHECK_KEY = 'doradesk_last_update_check';
    static UPDATE_DISMISSED_KEY = 'doradesk_update_dismissed';
    static CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 heures

    /**
     * Vérifie si une mise à jour est disponible
     * @returns {Promise<Object|null>} Informations de mise à jour ou null
     */
    static async checkForUpdates() {
        try {
            const response = await fetch(this.GITHUB_API);
            if (!response.ok) {
                console.warn('Impossible de vérifier les mises à jour:', response.status);
                return null;
            }

            const release = await response.json();
            const latestVersion = release.tag_name.replace('v', '');
            const currentVersion = CONFIG.VERSION || '2.0.1';

            const updateAvailable = this.compareVersions(latestVersion, currentVersion) > 0;

            if (updateAvailable) {
                return {
                    version: latestVersion,
                    currentVersion,
                    releaseDate: new Date(release.published_at),
                    downloadUrl: release.html_url,
                    changelog: release.body || 'Aucune note de version disponible',
                    assets: release.assets
                };
            }

            return null;
        } catch (error) {
            console.error('Erreur lors de la vérification des mises à jour:', error);
            return null;
        }
    }

    /**
     * Compare deux versions (format: x.y.z)
     * @returns {number} 1 si v1 > v2, -1 si v1 < v2, 0 si égales
     */
    static compareVersions(v1, v2) {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);

        for (let i = 0; i < 3; i++) {
            if (parts1[i] > parts2[i]) return 1;
            if (parts1[i] < parts2[i]) return -1;
        }
        return 0;
    }

    /**
     * Vérifie si on doit checker les mises à jour
     * @returns {boolean}
     */
    static shouldCheckForUpdates() {
        const lastCheck = localStorage.getItem(this.UPDATE_CHECK_KEY);
        if (!lastCheck) return true;

        const timeSinceLastCheck = Date.now() - parseInt(lastCheck);
        return timeSinceLastCheck > this.CHECK_INTERVAL;
    }

    /**
     * Marque la vérification comme effectuée
     */
    static markUpdateChecked() {
        localStorage.setItem(this.UPDATE_CHECK_KEY, Date.now().toString());
    }

    /**
     * Vérifie si une version a été ignorée
     * @param {string} version
     * @returns {boolean}
     */
    static isUpdateDismissed(version) {
        const dismissed = localStorage.getItem(this.UPDATE_DISMISSED_KEY);
        return dismissed === version;
    }

    /**
     * Marque une version comme ignorée
     * @param {string} version
     */
    static dismissUpdate(version) {
        localStorage.setItem(this.UPDATE_DISMISSED_KEY, version);
    }

    /**
     * Télécharge et applique la mise à jour
     * @param {string} version
     * @returns {Promise<boolean>}
     */
    static async downloadAndApplyUpdate(version) {
        try {
            window.showToast('⏳ Téléchargement de la mise à jour...');

            // Télécharger le nouveau index.html depuis dist/
            const response = await fetch(this.GITHUB_RAW);
            if (!response.ok) {
                throw new Error('Échec du téléchargement');
            }

            const newHtml = await response.text();

            // Créer un backup de la version actuelle
            const backup = {
                version: CONFIG.VERSION,
                timestamp: Date.now(),
                data: window.appData,
                layout: localStorage.getItem(CONFIG.LAYOUT_KEY),
                prefs: localStorage.getItem(CONFIG.PREFS_KEY)
            };
            localStorage.setItem('doradesk_backup_before_update', JSON.stringify(backup));

            // Créer un blob et télécharger le nouveau fichier
            const blob = new Blob([newHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'doradesk-v' + version + '.html';
            a.click();
            URL.revokeObjectURL(url);

            window.showToast(`✅ Mise à jour v${version} téléchargée !`);

            // Afficher les instructions
            this.showUpdateInstructions(version);

            return true;
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            window.showToast('❌ Échec de la mise à jour');
            return false;
        }
    }

    /**
     * Affiche les instructions de mise à jour manuelle
     * @param {string} version
     */
    static showUpdateInstructions(version) {
        window.openModal(`
            <div class="max-w-2xl">
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <i class="mdi mdi-download text-accent"></i>
                    Mise à Jour Téléchargée
                </h2>

                <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                    <div class="flex items-start gap-3">
                        <i class="mdi mdi-information text-blue-400 text-2xl"></i>
                        <div>
                            <h3 class="font-semibold text-blue-400 mb-1">Version ${version} prête</h3>
                            <p class="text-sm text-zinc-300">
                                Le fichier <code class="bg-dark-800 px-2 py-1 rounded">doradesk-v${version}.html</code>
                                a été téléchargé dans votre dossier Téléchargements.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    <h3 class="font-semibold flex items-center gap-2">
                        <i class="mdi mdi-clipboard-list text-accent"></i>
                        Instructions d'Installation
                    </h3>

                    <ol class="space-y-3 text-sm">
                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center text-xs font-bold">1</span>
                            <div>
                                <div class="font-medium mb-1">Fermez DoraDesk</div>
                                <div class="text-zinc-400">Fermez cet onglet et tous les onglets DoraDesk ouverts</div>
                            </div>
                        </li>

                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center text-xs font-bold">2</span>
                            <div>
                                <div class="font-medium mb-1">Remplacez le fichier</div>
                                <div class="text-zinc-400">
                                    Remplacez l'ancien fichier DoraDesk par le nouveau
                                    <code class="bg-dark-800 px-1 rounded">doradesk-v${version}.html</code>
                                </div>
                            </div>
                        </li>

                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center text-xs font-bold">3</span>
                            <div>
                                <div class="font-medium mb-1">Ouvrez la nouvelle version</div>
                                <div class="text-zinc-400">Double-cliquez sur le nouveau fichier pour l'ouvrir</div>
                            </div>
                        </li>

                        <li class="flex gap-3">
                            <span class="flex-shrink-0 w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center text-xs font-bold">4</span>
                            <div>
                                <div class="font-medium mb-1">Vérifiez vos données</div>
                                <div class="text-zinc-400">
                                    Vos données sont automatiquement migrées.
                                    Un backup a été créé au cas où.
                                </div>
                            </div>
                        </li>
                    </ol>

                    <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mt-4">
                        <div class="flex items-center gap-2 text-green-400 text-sm">
                            <i class="mdi mdi-shield-check"></i>
                            <span class="font-medium">Backup automatique créé</span>
                        </div>
                        <p class="text-xs text-zinc-400 mt-1">
                            En cas de problème, vos données sont sauvegardées dans localStorage
                        </p>
                    </div>
                </div>

                <div class="flex gap-3 mt-6">
                    <button
                        onclick="window.closeAllModals()"
                        class="flex-1 px-4 py-2 bg-accent hover:brightness-110 rounded text-white font-medium transition-all">
                        <i class="mdi mdi-check"></i> Compris
                    </button>
                    <button
                        onclick="window.open('https://github.com/${this.GITHUB_REPO}/releases', '_blank')"
                        class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-zinc-300 transition-all">
                        <i class="mdi mdi-github"></i> Voir sur GitHub
                    </button>
                </div>
            </div>
        `, 'max-w-2xl');
    }

    /**
     * Affiche une notification de mise à jour disponible
     * @param {Object} updateInfo
     */
    static showUpdateNotification(updateInfo) {
        // Vérifier si déjà ignorée
        if (this.isUpdateDismissed(updateInfo.version)) {
            return;
        }

        // Créer la notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 max-w-md bg-dark-800 border border-accent/30 rounded-lg shadow-2xl p-4 z-[9999] animate-slide-in-right';
        notification.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                    <i class="mdi mdi-update text-accent text-xl"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-white mb-1">
                        Mise à jour disponible
                    </h3>
                    <p class="text-sm text-zinc-400 mb-2">
                        Version ${updateInfo.version} disponible
                        <span class="text-zinc-600">(actuelle: ${updateInfo.currentVersion})</span>
                    </p>
                    <div class="flex gap-2">
                        <button
                            onclick="UpdaterActions.showUpdateDetails(${JSON.stringify(updateInfo).replace(/"/g, '&quot;')})"
                            class="px-3 py-1 bg-accent hover:brightness-110 rounded text-white text-sm font-medium transition-all">
                            <i class="mdi mdi-download"></i> Mettre à jour
                        </button>
                        <button
                            onclick="UpdaterActions.dismissUpdate('${updateInfo.version}')"
                            class="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-zinc-300 text-sm transition-all">
                            Ignorer
                        </button>
                    </div>
                </div>
                <button
                    onclick="this.parentElement.parentElement.remove()"
                    class="flex-shrink-0 text-zinc-500 hover:text-white transition-colors">
                    <i class="mdi mdi-close"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-fermeture après 30 secondes
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slide-out-right 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 30000);
    }

    /**
     * Vérifie automatiquement les mises à jour au démarrage
     */
    static async autoCheckForUpdates() {
        // Mettre à jour l'affichage de la version
        this.updateVersionDisplay();

        // Vérifier s'il y a une mise à jour en attente (pas encore installée)
        const updateInfo = await this.checkForUpdates();

        if (updateInfo && !this.isUpdateDismissed(updateInfo.version)) {
            // Afficher le badge immédiatement si une mise à jour est disponible
            this.showUpdateBadge(updateInfo);
        }

        if (!this.shouldCheckForUpdates()) {
            return;
        }

        this.markUpdateChecked();

        if (updateInfo) {
            console.log('📦 Mise à jour disponible:', updateInfo.version);
            this.showUpdateNotification(updateInfo);
        } else {
            console.log('✅ DoraDesk est à jour');
            this.hideUpdateBadge();
        }
    }

    /**
     * Met à jour l'affichage de la version dans le header
     */
    static updateVersionDisplay() {
        const versionText = document.getElementById('versionText');
        if (versionText) {
            versionText.textContent = `v${CONFIG.VERSION}`;
        }
    }

    /**
     * Affiche le badge de mise à jour disponible
     * @param {Object} updateInfo
     */
    static showUpdateBadge(updateInfo) {
        const badge = document.getElementById('updateBadge');
        const versionIndicator = document.getElementById('versionIndicator');

        if (badge) {
            badge.classList.remove('hidden');
        }

        if (versionIndicator) {
            versionIndicator.title = `Mise à jour disponible : v${updateInfo.version}\nCliquer pour plus d'infos`;
            versionIndicator.classList.add('ring-2', 'ring-accent/30');
        }
    }

    /**
     * Masque le badge de mise à jour
     */
    static hideUpdateBadge() {
        const badge = document.getElementById('updateBadge');
        const versionIndicator = document.getElementById('versionIndicator');

        if (badge) {
            badge.classList.add('hidden');
        }

        if (versionIndicator) {
            versionIndicator.title = 'Cliquer pour vérifier les mises à jour';
            versionIndicator.classList.remove('ring-2', 'ring-accent/30');
        }
    }
}

// Actions exposées globalement
class UpdaterActions {
    static showUpdateDetails(updateInfo) {
        // Fermer la notification
        document.querySelectorAll('.animate-slide-in-right').forEach(el => el.remove());

        window.openModal(`
            <div class="max-w-2xl">
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <i class="mdi mdi-update text-accent"></i>
                    Nouvelle Version Disponible
                </h2>

                <div class="bg-gradient-to-r from-accent/20 to-purple-500/20 border border-accent/30 rounded-lg p-4 mb-6">
                    <div class="flex items-center justify-between mb-2">
                        <div>
                            <div class="text-2xl font-bold text-white">v${updateInfo.version}</div>
                            <div class="text-sm text-zinc-400">Version actuelle: v${updateInfo.currentVersion}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-xs text-zinc-500">Publiée le</div>
                            <div class="text-sm text-zinc-300">${new Date(updateInfo.releaseDate).toLocaleDateString('fr-FR')}</div>
                        </div>
                    </div>
                </div>

                <div class="mb-6">
                    <h3 class="font-semibold mb-2 flex items-center gap-2">
                        <i class="mdi mdi-note-text text-accent"></i>
                        Notes de Version
                    </h3>
                    <div class="bg-dark-900 border border-white/10 rounded-lg p-4 max-h-64 overflow-y-auto custom-scrollbar">
                        <div class="prose prose-invert prose-sm max-w-none">
                            ${updateInfo.changelog.split('\n').map(line =>
                                line.startsWith('##') ? `<h3 class="text-accent font-bold mt-3 mb-2">${line.replace('##', '').trim()}</h3>` :
                                line.startsWith('-') ? `<li class="text-zinc-300">${line.replace('-', '').trim()}</li>` :
                                line.trim() ? `<p class="text-zinc-400">${line}</p>` : ''
                            ).join('')}
                        </div>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button
                        onclick="UpdaterActions.downloadUpdate('${updateInfo.version}')"
                        class="flex-1 px-4 py-2 bg-accent hover:brightness-110 rounded text-white font-medium transition-all">
                        <i class="mdi mdi-download"></i> Télécharger la mise à jour
                    </button>
                    <button
                        onclick="window.open('${updateInfo.downloadUrl}', '_blank')"
                        class="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded text-blue-400 transition-all">
                        <i class="mdi mdi-github"></i> Voir sur GitHub
                    </button>
                    <button
                        onclick="window.closeAllModals()"
                        class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-zinc-300 transition-all">
                        Plus tard
                    </button>
                </div>
            </div>
        `, 'max-w-2xl');
    }

    static async downloadUpdate(version) {
        window.closeAllModals();
        await Updater.downloadAndApplyUpdate(version);
    }

    static dismissUpdate(version) {
        Updater.dismissUpdate(version);
        document.querySelectorAll('.animate-slide-in-right').forEach(el => el.remove());
        window.showToast('Mise à jour ignorée');
    }

    static async checkManually() {
        window.showToast('🔍 Vérification des mises à jour...');

        const updateInfo = await Updater.checkForUpdates();
        Updater.markUpdateChecked();

        if (updateInfo) {
            Updater.showUpdateBadge(updateInfo);
            this.showUpdateDetails(updateInfo);
        } else {
            Updater.hideUpdateBadge();
            window.showToast('✅ Vous utilisez la dernière version');
        }
    }
}

// Exposer globalement
window.UpdaterActions = UpdaterActions;
