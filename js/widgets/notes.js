export const notesWidget = {
    id: 'notes',
    name: 'Bloc-notes',
    icon: 'mdi-pencil',
    size: { w: 4, h: 4 },
    render(appData) {
        return `<textarea id="notesEditor" class="w-full h-full bg-transparent resize-none outline-none text-sm font-mono text-zinc-300 placeholder-zinc-700 leading-relaxed" placeholder="// Tapez quelque chose ici...">${appData.notes || ''}</textarea>`;
    },
    actions: `<button onclick="NotesActions.save()" class="icon-btn"><i class="mdi mdi-content-save"></i></button>`
};

// NotesActions Class
class NotesActions {
    static save() {
        if (!window.appData) return;
        window.appData.notes = document.getElementById('notesEditor')?.value || '';
        window.saveData();
        window.showToast('Notes sauvegardées');
    }
}

// Expose to window for onclick handlers
window.NotesActions = NotesActions;
