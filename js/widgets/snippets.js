import { sanitizeHTML } from '../utils/sanitize.js';

export const snippetsWidget = {
    id: 'snippets',
    name: 'Snippets',
    icon: 'mdi-code-braces',
    size: { w: 4, h: 4 },
    render(appData) {
        const snips = appData.snippets || [];

        if (!snips.length) {
            return `<div class="flex flex-col items-center justify-center h-full text-zinc-500">
                <i class="mdi mdi-code-tags text-4xl mb-2"></i>
                <p>Aucun snippet</p>
                <button onclick="SnippetsActions.openAddModal()" class="mt-2 text-accent hover:underline text-sm">Ajouter</button>
            </div>`;
        }

        return `<div class="space-y-2">${snips.map((s, i) => `
            <div class="bg-dark-800/50 border border-white/5 rounded-lg p-3 group">
                <div class="flex justify-between items-start mb-1">
                    <span class="font-bold text-sm text-zinc-300">${sanitizeHTML(s.title)}</span>
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="SnippetsActions.copy('${btoa(s.code)}')" class="text-zinc-400 hover:text-accent"><i class="mdi mdi-content-copy"></i></button>
                        <button onclick="SnippetsActions.delete(${i})" class="text-zinc-400 hover:text-red-400"><i class="mdi mdi-close"></i></button>
                    </div>
                </div>
                <pre class="text-xs text-zinc-500 font-mono truncate">${sanitizeHTML(s.code.substring(0, 40))}...</pre>
            </div>
        `).join('')}</div>`;
    },
    actions: `<button onclick="SnippetsActions.openAddModal()" class="icon-btn"><i class="mdi mdi-plus"></i></button>`
};

// SnippetsActions Class
class SnippetsActions {
    static openAddModal() {
        window.openModal(`
            <h2 class="text-lg font-bold mb-3">Nouveau Snippet</h2>
            <input id="sTitle" placeholder="Titre" class="w-full bg-dark-900 border border-white/10 rounded px-3 py-2 mb-2">
            <textarea id="sCode" placeholder="Code..." rows="5" class="w-full bg-dark-900 border border-white/10 rounded px-3 py-2 mb-3 font-mono"></textarea>
            <button onclick="SnippetsActions.submit()" class="w-full bg-accent py-2 rounded text-white">Sauvegarder</button>
        `);
    }

    static submit() {
        const title = document.getElementById('sTitle')?.value;
        const code = document.getElementById('sCode')?.value;
        if (!title || !code) return;

        if (!window.appData) return;
        if (!window.appData.snippets) window.appData.snippets = [];
        window.appData.snippets.push({ title, code });
        window.saveData();
        window.refreshCard('snippets');
        window.closeAllModals();
    }

    static delete(i) {
        if (!window.appData) return;
        window.appData.snippets.splice(i, 1);
        window.saveData();
        window.refreshCard('snippets');
    }

    static copy(b64) {
        navigator.clipboard.writeText(atob(b64));
        window.showToast('Code copié');
    }
}

// Expose to window for onclick handlers
window.SnippetsActions = SnippetsActions;
