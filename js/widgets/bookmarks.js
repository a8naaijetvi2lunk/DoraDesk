import { sanitizeHTML, sanitizeColor } from '../utils/sanitize.js';
import { Statistics } from '../core/statistics.js';

export const bookmarksWidget = {
    id: 'bookmarks',
    name: 'Favoris',
    icon: 'mdi-bookmark-multiple',
    size: { w: 8, h: 4 },
    render(appData) {
        if (!appData.bookmarks.length) {
            return `<div class="flex flex-col items-center justify-center h-full text-zinc-500">
                <i class="mdi mdi-bookmark-off-outline text-4xl mb-2"></i>
                <p>Aucun favori</p>
                <button onclick="BookmarksActions.openAddModal()" class="mt-2 text-accent hover:underline text-sm">Ajouter</button>
            </div>`;
        }

        return `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">${appData.bookmarks.map((cat, cIdx) => `
            <div>
                <div class="flex items-center gap-2 mb-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <i class="mdi mdi-${cat.icon}"></i> ${sanitizeHTML(cat.category)}
                </div>
                <div class="grid grid-cols-1 gap-2">
                    ${cat.apps.map((app, aIdx) => {
                        const color = sanitizeColor(app.color) || '#6366f1';
                        return `<a href="${sanitizeHTML(app.url)}" target="_blank" onclick="Statistics.trackBookmarkClick('${sanitizeHTML(app.url)}', '${sanitizeHTML(app.name)}')" class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-all group border border-transparent hover:border-white/5">
                            <div class="w-8 h-8 rounded flex items-center justify-center text-white transition-all shadow-sm" style="background-color: ${color}">
                                <i class="mdi mdi-${app.icon || 'web'}"></i>
                            </div>
                            <span class="text-sm font-medium text-zinc-300 group-hover:text-white truncate flex-1">${sanitizeHTML(app.name)}</span>
                            <div class="flex gap-1 opacity-0 group-hover:opacity-100">
                                <button onclick="event.preventDefault(); BookmarksActions.openEditModal(${cIdx}, ${aIdx})" class="text-zinc-500 hover:text-accent p-1" title="Modifier"><i class="mdi mdi-pencil text-xs"></i></button>
                                <button onclick="event.preventDefault(); BookmarksActions.delete(${cIdx}, ${aIdx})" class="text-zinc-500 hover:text-red-400 p-1" title="Supprimer"><i class="mdi mdi-close text-xs"></i></button>
                            </div>
                        </a>`;
                    }).join('')}
                </div>
            </div>
        `).join('')}</div>`;
    },
    actions: `<button onclick="BookmarksActions.openAddModal()" class="icon-btn"><i class="mdi mdi-plus"></i></button>`
};

// BookmarksActions Class
class BookmarksActions {
    static delete(cIdx, aIdx) {
        if (!window.appData) return;
        window.appData.bookmarks[cIdx].apps.splice(aIdx, 1);
        if (!window.appData.bookmarks[cIdx].apps.length) {
            window.appData.bookmarks.splice(cIdx, 1);
        }
        window.saveData();
        window.refreshCard('bookmarks');
    }

    static openAddModal() {
        if (!window.appData) return;
        const cats = window.appData.bookmarks.map(b => `<option value="${sanitizeHTML(b.category)}">${sanitizeHTML(b.category)}</option>`).join('');

        window.openModal(`
            <h2 class="text-lg font-bold mb-3">Ajouter Favori</h2>
            <input id="bmName" placeholder="Nom" class="w-full bg-dark-900 border border-white/10 rounded px-3 py-2 mb-2">
            <input id="bmUrl" placeholder="URL" class="w-full bg-dark-900 border border-white/10 rounded px-3 py-2 mb-2">
            <select id="bmCatSelect" onchange="document.getElementById('bmNewCat').style.display=this.value==='new'?'block':'none'" class="w-full bg-dark-900 border border-white/10 rounded px-3 py-2 mb-2">
                ${cats}
                <option value="new">+ Nouvelle Catégorie</option>
            </select>
            <input id="bmNewCat" placeholder="Nom catégorie" style="display:none" class="w-full bg-dark-900 border border-white/10 rounded px-3 py-2 mb-3">
            <button onclick="BookmarksActions.submit()" class="w-full bg-accent py-2 rounded text-white">Ajouter</button>
        `);
    }

    static submit() {
        const name = document.getElementById('bmName')?.value;
        const url = document.getElementById('bmUrl')?.value;
        if (!name || !url) return;

        let cat = document.getElementById('bmCatSelect')?.value;
        if (cat === 'new') cat = document.getElementById('bmNewCat')?.value;

        if (!window.appData) return;
        let cObj = window.appData.bookmarks.find(x => x.category === cat);
        if (!cObj) {
            cObj = { category: cat, icon: 'folder', apps: [] };
            window.appData.bookmarks.push(cObj);
        }
        cObj.apps.push({ name, url, icon: 'web', color: '#6366f1' });
        window.saveData();
        window.refreshCard('bookmarks');
        window.closeAllModals();
    }

    static openEditModal(cIdx, aIdx) {
        if (!window.appData) return;
        const bookmark = window.appData.bookmarks[cIdx].apps[aIdx];

        // Liste d'icônes populaires Material Design Icons
        const popularIcons = [
            'web', 'github', 'gitlab', 'git', 'code-tags', 'code-braces',
            'react', 'vuejs', 'angular', 'nodejs', 'npm', 'docker',
            'database', 'server', 'cloud', 'api', 'aws', 'google-cloud',
            'microsoft-azure', 'slack', 'discord', 'twitter', 'linkedin', 'youtube',
            'email', 'file-document', 'folder', 'chart-line', 'shopping', 'heart',
            'star', 'bookmark', 'calendar', 'clock', 'pencil', 'palette',
            'image', 'video', 'music', 'headphones', 'book', 'newspaper',
            'monitor', 'laptop', 'cellphone', 'tablet', 'keyboard', 'mouse',
            'wifi', 'lan', 'shield', 'lock', 'key', 'account',
            'robot', 'rocket', 'flash', 'fire', 'weather-sunny', 'weather-night'
        ];

        const colors = [
            '#6366f1', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6',
            '#06b6d4', '#84cc16', '#f97316', '#14b8a6', '#a855f7', '#f43f5e',
            '#3b82f6', '#22c55e', '#eab308', '#d946ef', '#0ea5e9', '#65a30d'
        ];

        window.openModal(`
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                <i class="mdi mdi-pencil text-accent"></i> Modifier le Favori
            </h2>

            <div class="space-y-4">
                <!-- Nom -->
                <div>
                    <label class="text-xs text-zinc-400 block mb-1">Nom</label>
                    <input id="editBmName" value="${sanitizeHTML(bookmark.name)}" placeholder="Nom" class="w-full bg-dark-900 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent">
                </div>

                <!-- URL -->
                <div>
                    <label class="text-xs text-zinc-400 block mb-1">URL</label>
                    <input id="editBmUrl" value="${sanitizeHTML(bookmark.url)}" placeholder="https://..." class="w-full bg-dark-900 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent">
                </div>

                <!-- Icône -->
                <div>
                    <label class="text-xs text-zinc-400 block mb-2">Icône</label>
                    <div class="grid grid-cols-8 gap-2 p-3 bg-dark-900 rounded max-h-48 overflow-y-auto border border-white/10">
                        ${popularIcons.map(icon => `
                            <button onclick="BookmarksActions.selectIcon('${icon}')" id="icon-${icon}" class="w-8 h-8 rounded flex items-center justify-center transition-all ${bookmark.icon === icon ? 'bg-accent text-white' : 'bg-dark-800 text-zinc-400 hover:bg-white/10 hover:text-white'}">
                                <i class="mdi mdi-${icon}"></i>
                            </button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="editBmIcon" value="${sanitizeHTML(bookmark.icon || 'web')}">
                </div>

                <!-- Couleur -->
                <div>
                    <label class="text-xs text-zinc-400 block mb-2">Couleur</label>
                    <div class="grid grid-cols-9 gap-2">
                        ${colors.map(color => `
                            <button onclick="BookmarksActions.selectColor('${color}')" id="color-${color.substring(1)}" class="w-8 h-8 rounded-full transition-all ring-2 ring-offset-2 ring-offset-dark-700 ${(bookmark.color || '#6366f1') === color ? 'ring-white scale-110' : 'ring-transparent hover:scale-105'}" style="background-color: ${color}"></button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="editBmColor" value="${sanitizeColor(bookmark.color) || '#6366f1'}">
                </div>

                <!-- Aperçu -->
                <div>
                    <label class="text-xs text-zinc-400 block mb-2">Aperçu</label>
                    <div id="bookmarkPreview" class="flex items-center gap-3 p-3 bg-dark-900 rounded border border-white/10">
                        <div class="w-10 h-10 rounded flex items-center justify-center text-white shadow-sm" style="background-color: ${sanitizeColor(bookmark.color) || '#6366f1'}">
                            <i class="mdi mdi-${bookmark.icon || 'web'} text-lg"></i>
                        </div>
                        <div>
                            <div class="font-medium text-white">${sanitizeHTML(bookmark.name)}</div>
                            <div class="text-xs text-zinc-500 truncate max-w-xs">${sanitizeHTML(bookmark.url)}</div>
                        </div>
                    </div>
                </div>

                <!-- Boutons -->
                <div class="flex gap-2 pt-4">
                    <button onclick="window.closeAllModals()" class="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-zinc-300 transition-colors">Annuler</button>
                    <button onclick="BookmarksActions.submitEdit(${cIdx}, ${aIdx})" class="flex-1 px-4 py-2 bg-accent hover:brightness-110 rounded text-white font-medium transition-all">Enregistrer</button>
                </div>
            </div>
        `);

        // Auto-update preview
        setTimeout(() => {
            ['editBmName', 'editBmUrl'].forEach(id => {
                document.getElementById(id)?.addEventListener('input', BookmarksActions.updatePreview);
            });
        }, 100);
    }

    static selectIcon(icon) {
        document.getElementById('editBmIcon').value = icon;

        // Update UI selection
        document.querySelectorAll('[id^="icon-"]').forEach(btn => {
            btn.className = 'w-8 h-8 rounded flex items-center justify-center transition-all bg-dark-800 text-zinc-400 hover:bg-white/10 hover:text-white';
        });
        const selectedBtn = document.getElementById(`icon-${icon}`);
        if (selectedBtn) selectedBtn.className = 'w-8 h-8 rounded flex items-center justify-center transition-all bg-accent text-white';

        BookmarksActions.updatePreview();
    }

    static selectColor(color) {
        document.getElementById('editBmColor').value = color;

        // Update UI selection
        document.querySelectorAll('[id^="color-"]').forEach(btn => {
            btn.className = btn.className.replace('ring-white scale-110', 'ring-transparent hover:scale-105');
        });
        const selectedBtn = document.getElementById(`color-${color.substring(1)}`);
        if (selectedBtn) {
            selectedBtn.className = selectedBtn.className.replace('ring-transparent hover:scale-105', 'ring-white scale-110');
        }

        BookmarksActions.updatePreview();
    }

    static updatePreview() {
        const name = document.getElementById('editBmName')?.value || 'Nom';
        const url = document.getElementById('editBmUrl')?.value || 'https://...';
        const icon = document.getElementById('editBmIcon')?.value || 'web';
        const color = document.getElementById('editBmColor')?.value || '#6366f1';

        const preview = document.getElementById('bookmarkPreview');
        if (preview) {
            preview.innerHTML = `
                <div class="w-10 h-10 rounded flex items-center justify-center text-white shadow-sm" style="background-color: ${sanitizeColor(color)}">
                    <i class="mdi mdi-${icon} text-lg"></i>
                </div>
                <div>
                    <div class="font-medium text-white">${sanitizeHTML(name)}</div>
                    <div class="text-xs text-zinc-500 truncate max-w-xs">${sanitizeHTML(url)}</div>
                </div>
            `;
        }
    }

    static submitEdit(cIdx, aIdx) {
        const name = document.getElementById('editBmName')?.value;
        const url = document.getElementById('editBmUrl')?.value;
        const icon = document.getElementById('editBmIcon')?.value;
        const color = document.getElementById('editBmColor')?.value;

        if (!name || !url) {
            window.showToast('Le nom et l\'URL sont requis');
            return;
        }

        if (!window.appData) return;
        window.appData.bookmarks[cIdx].apps[aIdx] = {
            name,
            url: url.startsWith('http') ? url : 'https://' + url,
            icon,
            color
        };

        window.saveData();
        window.refreshCard('bookmarks');
        window.closeAllModals();
        window.showToast('Favori modifié avec succès');
    }
}

// Expose to window for onclick handlers
window.BookmarksActions = BookmarksActions;
