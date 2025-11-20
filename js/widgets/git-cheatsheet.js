export const gitCheatsheetWidget = {
    id: 'git-cheatsheet',
    name: 'Git Cheatsheet',
    icon: 'mdi-git',
    size: { w: 4, h: 5 },
    render() {
        const commands = [
            {
                cat: 'Configuration', cmds: [
                    { cmd: 'git config --global user.name "Name"', desc: 'Définir nom utilisateur' },
                    { cmd: 'git config --global user.email "email"', desc: 'Définir email' }
                ]
            },
            {
                cat: 'Bases', cmds: [
                    { cmd: 'git init', desc: 'Initialiser un repo' },
                    { cmd: 'git clone <url>', desc: 'Cloner un repo' },
                    { cmd: 'git status', desc: 'Voir le statut' },
                    { cmd: 'git add .', desc: 'Ajouter tous les fichiers' },
                    { cmd: 'git commit -m "message"', desc: 'Commiter les changements' },
                    { cmd: 'git push', desc: 'Pousser vers remote' },
                    { cmd: 'git pull', desc: 'Récupérer du remote' }
                ]
            },
            {
                cat: 'Branches', cmds: [
                    { cmd: 'git branch', desc: 'Lister les branches' },
                    { cmd: 'git branch <name>', desc: 'Créer une branche' },
                    { cmd: 'git checkout <branch>', desc: 'Changer de branche' },
                    { cmd: 'git merge <branch>', desc: 'Fusionner une branche' },
                    { cmd: 'git branch -d <branch>', desc: 'Supprimer une branche' }
                ]
            },
            {
                cat: 'Historique', cmds: [
                    { cmd: 'git log', desc: 'Voir l\'historique' },
                    { cmd: 'git log --oneline', desc: 'Historique condensé' },
                    { cmd: 'git diff', desc: 'Voir les modifications' }
                ]
            },
            {
                cat: 'Annulation', cmds: [
                    { cmd: 'git reset HEAD <file>', desc: 'Unstage un fichier' },
                    { cmd: 'git checkout -- <file>', desc: 'Annuler les modifications' },
                    { cmd: 'git revert <commit>', desc: 'Annuler un commit' }
                ]
            }
        ];

        return `
            <div class="h-full overflow-y-auto space-y-3">
                ${commands.map(section => `
                    <div>
                        <div class="text-xs font-bold text-accent uppercase tracking-wider mb-2 sticky top-0 bg-dark-900/95 py-1">
                            ${section.cat}
                        </div>
                        <div class="space-y-1">
                            ${section.cmds.map(c => `
                                <button onclick="GitCheatsheetActions.copy('${c.cmd.replace(/'/g, "\\'")}')"
                                    class="w-full text-left p-2 rounded-lg bg-dark-800/50 hover:bg-white/10 border border-white/5 hover:border-accent/30 transition-all group">
                                    <div class="flex items-start justify-between gap-2">
                                        <div class="flex-1 min-w-0">
                                            <code class="text-xs font-mono text-accent block truncate">${c.cmd}</code>
                                            <div class="text-xs text-zinc-500 mt-0.5">${c.desc}</div>
                                        </div>
                                        <i class="mdi mdi-content-copy text-zinc-600 group-hover:text-accent opacity-0 group-hover:opacity-100 transition-all"></i>
                                    </div>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

// GitCheatsheetActions Class
class GitCheatsheetActions {
    static copy(text) {
        navigator.clipboard.writeText(text).then(() => {
            window.showToast('Commande copiée !');
        }).catch(() => {
            window.showToast('Erreur lors de la copie');
        });
    }
}

// Expose to window for onclick handlers
window.GitCheatsheetActions = GitCheatsheetActions;
