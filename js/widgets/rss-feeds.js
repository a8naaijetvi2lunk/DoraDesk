import { sanitizeHTML } from '../utils/sanitize.js';

export const rssFeedsWidget = {
    id: 'rss-feeds',
    name: 'Flux RSS',
    icon: 'mdi-rss',
    size: { w: 6, h: 5 },
    render(appData) {
        const feeds = appData.rssFeeds || [];

        if (!feeds.length) {
            return `
                <div class="flex flex-col items-center justify-center h-full text-zinc-500">
                    <i class="mdi mdi-rss-off text-4xl mb-2"></i>
                    <p class="mb-2">Aucun flux RSS</p>
                    <button onclick="RssFeedsActions.openAddModal()" class="text-accent hover:underline text-sm">
                        Ajouter un flux
                    </button>
                </div>
            `;
        }

        return `
            <div class="h-full flex flex-col gap-2 overflow-auto custom-scrollbar">
                ${feeds.map((feed, index) => `
                    <div class="group p-3 rounded-lg bg-dark-800/50 border border-white/5 hover:border-accent/30 transition-all">
                        <div class="flex items-start justify-between gap-2 mb-2">
                            <div class="flex items-center gap-2 flex-1 min-w-0">
                                <i class="mdi mdi-rss text-accent"></i>
                                <div class="flex-1 min-w-0">
                                    <h3 class="font-medium text-sm truncate">
                                        ${sanitizeHTML(feed.name)}
                                    </h3>
                                    <p class="text-xs text-zinc-500 truncate">
                                        ${feed.category || 'Général'}
                                    </p>
                                </div>
                            </div>
                            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onclick="RssFeedsActions.refreshFeed(${index})"
                                    class="p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-accent"
                                    title="Actualiser">
                                    <i class="mdi mdi-refresh text-sm"></i>
                                </button>
                                <button
                                    onclick="RssFeedsActions.openEditModal(${index})"
                                    class="p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-yellow-400"
                                    title="Modifier">
                                    <i class="mdi mdi-pencil text-sm"></i>
                                </button>
                                <a
                                    href="${sanitizeHTML(feed.url)}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-blue-400"
                                    title="Ouvrir le flux">
                                    <i class="mdi mdi-open-in-new text-sm"></i>
                                </a>
                                <button
                                    onclick="RssFeedsActions.deleteFeed(${index})"
                                    class="p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-red-400"
                                    title="Supprimer">
                                    <i class="mdi mdi-close text-sm"></i>
                                </button>
                            </div>
                        </div>
                        ${feed.lastUpdate ? `
                            <div class="text-xs text-zinc-600 flex items-center gap-1">
                                <i class="mdi mdi-clock-outline"></i>
                                Mis à jour: ${new Date(feed.lastUpdate).toLocaleString('fr-FR')}
                            </div>
                        ` : ''}
                        ${feed.items && feed.items.length > 0 ? `
                            <div class="mt-2 space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                                ${feed.items.slice(0, feed.maxItems || 10).map(item => `
                                    <a
                                        href="${sanitizeHTML(item.link)}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="block px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors">
                                        <div class="text-xs text-zinc-300 hover:text-white truncate">
                                            ${sanitizeHTML(item.title)}
                                        </div>
                                        ${item.pubDate ? `
                                            <div class="text-[10px] text-zinc-600">
                                                ${new Date(item.pubDate).toLocaleDateString('fr-FR')}
                                            </div>
                                        ` : ''}
                                    </a>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },
    actions: `
        <button onclick="RssFeedsActions.openAddModal()" class="icon-btn" title="Ajouter un flux RSS">
            <i class="mdi mdi-plus"></i>
        </button>
        <button onclick="RssFeedsActions.refreshAllFeeds()" class="icon-btn" title="Actualiser tous les flux">
            <i class="mdi mdi-refresh"></i>
        </button>
    `,
    init() {
        // Auto-refresh feeds every 30 minutes
        setInterval(() => {
            if (window.appData && window.appData.rssFeeds) {
                RssFeedsActions.refreshAllFeeds(true);
            }
        }, 30 * 60 * 1000);
    }
};

// RssFeedsActions Class
class RssFeedsActions {
    /**
     * Flux RSS prédéfinis depuis Atlas Flux
     */
    static SUGGESTED_FEEDS = [
        { name: 'Journal du Hacker', url: 'https://www.journalduhacker.net/rss', category: 'Actualités Tech' },
        { name: 'LinuxFr', url: 'https://linuxfr.org/news.atom', category: 'Open Source' },
        { name: 'Atlas: Cybersécurité', url: 'https://flux.saynete.com/encart_rss_informatique_cybersecurite_fr.xml', category: 'Sécurité' },
        { name: 'Atlas: Data', url: 'https://flux.saynete.com/encart_rss_informatique_data_fr.xml', category: 'Data Science' },
        { name: 'Atlas: Logiciel Libre', url: 'https://flux.saynete.com/encart_rss_informatique_logiciel_libre_fr.xml', category: 'Open Source' },
        { name: 'Le Monde: IA', url: 'https://www.lemonde.fr/intelligence-artificielle/rss_full.xml', category: 'Intelligence Artificielle' },
        { name: 'Le Figaro: High-Tech', url: 'https://www.lefigaro.fr/rss/figaro_secteur_high-tech.xml', category: 'Actualités Tech' },
        { name: 'Human Coders: Python', url: 'https://news.humancoders.com/t/python/items/feed', category: 'Programmation' },
        { name: 'Human Coders: JavaScript', url: 'https://news.humancoders.com/t/javascript/items/feed', category: 'Programmation' },
        { name: 'France Info: IA', url: 'https://www.franceinfo.fr/internet/intelligence-artificielle.rss', category: 'Intelligence Artificielle' }
    ];

    static openAddModal() {
        const suggestedHTML = this.SUGGESTED_FEEDS.map(feed => `
            <button
                onclick="RssFeedsActions.addSuggestedFeed('${encodeURIComponent(JSON.stringify(feed))}')"
                class="w-full text-left px-3 py-2 rounded bg-white/5 hover:bg-white/10 transition-colors group">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="text-sm font-medium">${sanitizeHTML(feed.name)}</div>
                        <div class="text-xs text-zinc-500">${sanitizeHTML(feed.category)}</div>
                    </div>
                    <i class="mdi mdi-plus text-accent opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </div>
            </button>
        `).join('');

        window.openModal(`
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                <i class="mdi mdi-rss text-accent"></i>
                Ajouter un Flux RSS
            </h2>

            <div class="space-y-4">
                <!-- Formulaire personnalisé -->
                <div class="space-y-3 p-3 bg-dark-900 rounded border border-white/10">
                    <h3 class="text-sm font-semibold flex items-center gap-2">
                        <i class="mdi mdi-pencil text-xs"></i>
                        Flux personnalisé
                    </h3>
                    <div>
                        <label class="text-xs text-zinc-400 block mb-1">Nom du flux</label>
                        <input
                            id="rssName"
                            type="text"
                            placeholder="Ex: Mon Blog Tech"
                            class="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent">
                    </div>
                    <div>
                        <label class="text-xs text-zinc-400 block mb-1">URL du flux RSS</label>
                        <input
                            id="rssUrl"
                            type="url"
                            placeholder="https://example.com/feed.xml"
                            class="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent">
                    </div>
                    <div>
                        <label class="text-xs text-zinc-400 block mb-1">Catégorie</label>
                        <input
                            id="rssCategory"
                            type="text"
                            placeholder="Ex: Technologie"
                            class="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent">
                    </div>
                    <div>
                        <label class="text-xs text-zinc-400 block mb-1">Nombre d'articles à afficher</label>
                        <select
                            id="rssMaxItems"
                            class="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent">
                            <option value="3">3 articles</option>
                            <option value="5">5 articles</option>
                            <option value="10" selected>10 articles</option>
                            <option value="15">15 articles</option>
                            <option value="20">20 articles</option>
                        </select>
                    </div>
                    <button
                        onclick="RssFeedsActions.submitCustomFeed()"
                        class="w-full bg-accent hover:brightness-110 py-2 rounded text-white font-medium transition-all">
                        <i class="mdi mdi-check"></i> Ajouter
                    </button>
                </div>

                <!-- Flux suggérés -->
                <div>
                    <h3 class="text-sm font-semibold mb-2 flex items-center gap-2">
                        <i class="mdi mdi-star text-xs"></i>
                        Flux suggérés (Atlas Flux)
                    </h3>
                    <div class="max-h-64 overflow-y-auto custom-scrollbar space-y-1">
                        ${suggestedHTML}
                    </div>
                </div>

                <!-- Bouton fermer -->
                <button
                    onclick="window.closeAllModals()"
                    class="w-full px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-zinc-300 transition-colors">
                    Fermer
                </button>
            </div>
        `);

        // Auto-focus sur le champ nom
        setTimeout(() => {
            document.getElementById('rssName')?.focus();
        }, 100);
    }

    static submitCustomFeed() {
        const name = document.getElementById('rssName')?.value.trim();
        const url = document.getElementById('rssUrl')?.value.trim();
        const category = document.getElementById('rssCategory')?.value.trim() || 'Général';
        const maxItems = parseInt(document.getElementById('rssMaxItems')?.value || '10');

        if (!name || !url) {
            window.showToast('Le nom et l\'URL sont requis');
            return;
        }

        // Validate URL
        try {
            new URL(url);
        } catch (e) {
            window.showToast('URL invalide');
            return;
        }

        if (!window.appData) return;

        if (!window.appData.rssFeeds) {
            window.appData.rssFeeds = [];
        }

        window.appData.rssFeeds.push({
            name,
            url,
            category,
            maxItems,
            items: [],
            lastUpdate: null
        });

        window.saveData();
        window.refreshCard('rss-feeds');
        window.closeAllModals();
        window.showToast(`Flux "${name}" ajouté`);

        // Auto-fetch on add
        const index = window.appData.rssFeeds.length - 1;
        setTimeout(() => this.refreshFeed(index), 500);
    }

    static addSuggestedFeed(encodedFeed) {
        const feed = JSON.parse(decodeURIComponent(encodedFeed));

        if (!window.appData) return;

        if (!window.appData.rssFeeds) {
            window.appData.rssFeeds = [];
        }

        // Check if already added
        const exists = window.appData.rssFeeds.some(f => f.url === feed.url);
        if (exists) {
            window.showToast('Ce flux est déjà ajouté');
            return;
        }

        window.appData.rssFeeds.push({
            name: feed.name,
            url: feed.url,
            category: feed.category,
            maxItems: 10,
            items: [],
            lastUpdate: null
        });

        window.saveData();
        window.refreshCard('rss-feeds');
        window.showToast(`Flux "${feed.name}" ajouté`);

        // Auto-fetch on add
        const index = window.appData.rssFeeds.length - 1;
        setTimeout(() => this.refreshFeed(index), 500);
    }

    static openEditModal(index) {
        if (!window.appData || !window.appData.rssFeeds) return;

        const feed = window.appData.rssFeeds[index];

        window.openModal(`
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                <i class="mdi mdi-pencil text-accent"></i>
                Modifier le Flux RSS
            </h2>

            <div class="space-y-4">
                <div class="space-y-3 p-3 bg-dark-900 rounded border border-white/10">
                    <div>
                        <label class="text-xs text-zinc-400 block mb-1">Nom du flux</label>
                        <input
                            id="editRssName"
                            type="text"
                            value="${sanitizeHTML(feed.name)}"
                            class="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent">
                    </div>
                    <div>
                        <label class="text-xs text-zinc-400 block mb-1">URL du flux RSS</label>
                        <input
                            id="editRssUrl"
                            type="url"
                            value="${sanitizeHTML(feed.url)}"
                            class="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent">
                    </div>
                    <div>
                        <label class="text-xs text-zinc-400 block mb-1">Catégorie</label>
                        <input
                            id="editRssCategory"
                            type="text"
                            value="${sanitizeHTML(feed.category || 'Général')}"
                            class="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent">
                    </div>
                    <div>
                        <label class="text-xs text-zinc-400 block mb-1">Nombre d'articles à afficher</label>
                        <select
                            id="editRssMaxItems"
                            class="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent">
                            <option value="3" ${(feed.maxItems || 10) === 3 ? 'selected' : ''}>3 articles</option>
                            <option value="5" ${(feed.maxItems || 10) === 5 ? 'selected' : ''}>5 articles</option>
                            <option value="10" ${(feed.maxItems || 10) === 10 ? 'selected' : ''}>10 articles</option>
                            <option value="15" ${(feed.maxItems || 10) === 15 ? 'selected' : ''}>15 articles</option>
                            <option value="20" ${(feed.maxItems || 10) === 20 ? 'selected' : ''}>20 articles</option>
                        </select>
                    </div>
                    <button
                        onclick="RssFeedsActions.submitEditFeed(${index})"
                        class="w-full bg-accent hover:brightness-110 py-2 rounded text-white font-medium transition-all">
                        <i class="mdi mdi-check"></i> Enregistrer
                    </button>
                </div>

                <button
                    onclick="window.closeAllModals()"
                    class="w-full px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-zinc-300 transition-colors">
                    Annuler
                </button>
            </div>
        `);

        // Auto-focus sur le champ nom
        setTimeout(() => {
            document.getElementById('editRssName')?.focus();
        }, 100);
    }

    static submitEditFeed(index) {
        if (!window.appData || !window.appData.rssFeeds) return;

        const name = document.getElementById('editRssName')?.value.trim();
        const url = document.getElementById('editRssUrl')?.value.trim();
        const category = document.getElementById('editRssCategory')?.value.trim() || 'Général';
        const maxItems = parseInt(document.getElementById('editRssMaxItems')?.value || '10');

        if (!name || !url) {
            window.showToast('Le nom et l\'URL sont requis');
            return;
        }

        // Validate URL
        try {
            new URL(url);
        } catch (e) {
            window.showToast('URL invalide');
            return;
        }

        const feed = window.appData.rssFeeds[index];
        const urlChanged = feed.url !== url;
        const maxItemsChanged = feed.maxItems !== maxItems;

        feed.name = name;
        feed.url = url;
        feed.category = category;
        feed.maxItems = maxItems;

        window.saveData();
        window.refreshCard('rss-feeds');
        window.closeAllModals();
        window.showToast(`Flux "${name}" modifié`);

        // Re-fetch if URL or maxItems changed
        if (urlChanged || maxItemsChanged) {
            setTimeout(() => this.refreshFeed(index), 500);
        }
    }

    static deleteFeed(index) {
        if (!window.appData || !window.appData.rssFeeds) return;

        const feed = window.appData.rssFeeds[index];
        const confirm = window.confirm(`Supprimer le flux "${feed.name}" ?`);

        if (confirm) {
            window.appData.rssFeeds.splice(index, 1);
            window.saveData();
            window.refreshCard('rss-feeds');
            window.showToast('Flux supprimé');
        }
    }

    static async refreshFeed(index, silent = false) {
        if (!window.appData || !window.appData.rssFeeds) return;

        const feed = window.appData.rssFeeds[index];
        if (!feed) return;

        try {
            // Use rss2json API (free, with CORS support)
            const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;

            if (!silent) {
                window.showToast(`Actualisation de "${feed.name}"...`);
            }

            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status === 'ok') {
                const maxItems = feed.maxItems || 10;
                feed.items = data.items.slice(0, maxItems).map(item => ({
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    description: item.description
                }));
                feed.lastUpdate = new Date().toISOString();

                window.saveData();
                window.refreshCard('rss-feeds');

                if (!silent) {
                    window.showToast(`"${feed.name}" actualisé`);
                }
            } else {
                throw new Error(data.message || 'Erreur de récupération');
            }
        } catch (error) {
            console.error('RSS fetch error:', error);
            if (!silent) {
                window.showToast(`Erreur: ${error.message}`);
            }
        }
    }

    static async refreshAllFeeds(silent = false) {
        if (!window.appData || !window.appData.rssFeeds) return;

        if (!silent) {
            window.showToast('Actualisation de tous les flux...');
        }

        for (let i = 0; i < window.appData.rssFeeds.length; i++) {
            await this.refreshFeed(i, true);
            // Delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (!silent) {
            window.showToast('Tous les flux actualisés');
        }
    }
}

// Expose to window for onclick handlers
window.RssFeedsActions = RssFeedsActions;
