import { sanitizeHTML } from '../utils/sanitize.js';

const PRIORITY_COLORS = {
    urgent: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
    important: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
    normal: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' }
};

export const tasksWidget = {
    id: 'tasks',
    name: 'Tâches',
    icon: 'mdi-check-circle',
    size: { w: 4, h: 4 },
    render(appData) {
        const active = appData.tasks.filter(t => t.status !== 'completed').sort((a, b) => (a.priority === 'urgent' ? 0 : 1) - (b.priority === 'urgent' ? 0 : 1));

        if (!active.length) {
            return `<div class="flex flex-col items-center justify-center h-full text-zinc-500">
                <i class="mdi mdi-check-all text-4xl mb-2"></i>
                <p>Tout est fait !</p>
            </div>`;
        }

        return `<div class="flex flex-col gap-2">${active.map(t => `
            <div class="group flex items-start gap-3 p-3 rounded-xl bg-dark-800/50 border border-white/5 hover:border-zinc-600 transition-all">
                <button onclick="TasksActions.toggle('${t.id}')" class="mt-0.5 w-5 h-5 rounded-full border-2 border-zinc-600 hover:border-accent flex items-center justify-center transition-colors"></button>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-zinc-200 leading-tight">${sanitizeHTML(t.title)}</p>
                    <div class="flex items-center gap-2 mt-2">
                        <span class="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${PRIORITY_COLORS[t.priority].bg} ${PRIORITY_COLORS[t.priority].text}">${t.priority}</span>
                    </div>
                </div>
                <button onclick="TasksActions.delete('${t.id}')" class="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400">
                    <i class="mdi mdi-trash-can-outline"></i>
                </button>
            </div>
        `).join('')}</div>`;
    },
    actions: `<button onclick="TasksActions.openAddModal()" class="icon-btn"><i class="mdi mdi-plus"></i></button>`
};

// TasksActions Class
class TasksActions {
    static delete(id) {
        if (!window.appData) return;
        window.appData.tasks = window.appData.tasks.filter(x => x.id !== id);
        window.saveData();
        window.refreshCard('tasks');
    }

    static toggle(id) {
        if (!window.appData) return;
        const t = window.appData.tasks.find(x => x.id === id);
        if (t) t.status = 'completed';
        window.saveData();
        window.refreshCard('tasks');
    }

    static openAddModal() {
        window.openModal(`
            <h2 class="text-lg font-bold mb-3">Nouvelle Tâche</h2>
            <input id="tTitle" placeholder="Titre..." class="w-full bg-dark-900 border border-white/10 rounded px-3 py-2 mb-3">
            <select id="tPriority" class="w-full bg-dark-900 border border-white/10 rounded px-3 py-2 mb-3">
                <option value="normal">Normale</option>
                <option value="important">Importante</option>
                <option value="urgent">Urgente</option>
            </select>
            <button onclick="TasksActions.submit()" class="w-full bg-accent py-2 rounded text-white">Créer</button>
        `);
        setTimeout(() => document.getElementById('tTitle')?.focus(), 100);
    }

    static submit() {
        const t = document.getElementById('tTitle')?.value;
        if (!t) return;

        if (!window.appData) return;
        window.appData.tasks.push({
            id: Date.now().toString(),
            title: t,
            priority: document.getElementById('tPriority')?.value || 'normal',
            status: 'pending'
        });
        window.saveData();
        window.refreshCard('tasks');
        window.closeAllModals();
    }
}

// Expose to window for onclick handlers
window.TasksActions = TasksActions;
