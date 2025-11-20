import { Statistics } from '../core/statistics.js';

export const statisticsWidget = {
    id: 'statistics',
    name: 'Statistiques',
    icon: 'mdi-chart-line',
    size: { w: 4, h: 4 },
    render() {
        const todayStats = Statistics.getTodayStats();
        const weekStats = Statistics.getWeekStats();
        const topBookmarks = Statistics.getTopBookmarks(3);
        const goalsProgress = Statistics.getGoalsProgress();
        const stats = Statistics.load();

        return `
            <div class="h-full flex flex-col gap-3 overflow-auto custom-scrollbar p-2">
                <!-- Stats du jour -->
                <div class="space-y-2">
                    <h3 class="text-xs font-semibold text-zinc-400 uppercase">Aujourd'hui</h3>
                    <div class="grid grid-cols-3 gap-2">
                        <div class="bg-dark-800/50 rounded-lg p-2 text-center border border-white/5">
                            <div class="text-accent text-xl font-bold">${todayStats.tasks}</div>
                            <div class="text-[10px] text-zinc-500">Tâches</div>
                        </div>
                        <div class="bg-dark-800/50 rounded-lg p-2 text-center border border-white/5">
                            <div class="text-orange-400 text-xl font-bold">${todayStats.pomodoro}</div>
                            <div class="text-[10px] text-zinc-500">Pomodoros</div>
                        </div>
                        <div class="bg-dark-800/50 rounded-lg p-2 text-center border border-white/5">
                            <div class="text-blue-400 text-xl font-bold">${todayStats.bookmarks}</div>
                            <div class="text-[10px] text-zinc-500">Clics</div>
                        </div>
                    </div>
                </div>

                <!-- Objectifs -->
                <div class="space-y-2">
                    <h3 class="text-xs font-semibold text-zinc-400 uppercase">Objectifs du Jour</h3>

                    <div class="space-y-2">
                        <div>
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-zinc-500">🍅 Pomodoro</span>
                                <span class="text-zinc-400">${todayStats.pomodoro}/${stats.goals.pomodoro}</span>
                            </div>
                            <div class="w-full bg-dark-800 rounded-full h-2 overflow-hidden">
                                <div class="bg-orange-500 h-2 transition-all" style="width: ${goalsProgress.pomodoro.percentage}%"></div>
                            </div>
                        </div>

                        <div>
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-zinc-500">✅ Tâches</span>
                                <span class="text-zinc-400">${todayStats.tasks}/${stats.goals.tasks}</span>
                            </div>
                            <div class="w-full bg-dark-800 rounded-full h-2 overflow-hidden">
                                <div class="bg-accent h-2 transition-all" style="width: ${goalsProgress.tasks.percentage}%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Top Sites -->
                ${topBookmarks.length > 0 ? `
                    <div class="space-y-2">
                        <h3 class="text-xs font-semibold text-zinc-400 uppercase">Top Sites</h3>
                        <div class="space-y-1">
                            ${topBookmarks.slice(0, 3).map((bookmark, i) => `
                                <div class="flex items-center justify-between text-xs p-2 bg-dark-800/30 rounded">
                                    <span class="text-zinc-400">${i + 1}. ${bookmark.name.substring(0, 20)}</span>
                                    <span class="text-accent font-medium">${bookmark.clicks}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Bouton Dashboard -->
                <button
                    onclick="StatisticsActions.openDashboard()"
                    class="w-full bg-accent/20 hover:bg-accent/30 border border-accent/30 rounded-lg py-2 text-accent font-medium text-sm transition-all">
                    <i class="mdi mdi-chart-box"></i> Dashboard Complet
                </button>
            </div>
        `;
    },
    actions: `
        <button onclick="StatisticsActions.openDashboard()" class="icon-btn" title="Dashboard complet">
            <i class="mdi mdi-chart-box"></i>
        </button>
        <button onclick="StatisticsActions.exportStats()" class="icon-btn" title="Exporter les stats">
            <i class="mdi mdi-download"></i>
        </button>
    `
};

// StatisticsActions Class
class StatisticsActions {
    static openDashboard() {
        const stats = Statistics.load();
        const todayStats = Statistics.getTodayStats();
        const weekStats = Statistics.getWeekStats();
        const topBookmarks = Statistics.getTopBookmarks(10);
        const last7Days = Statistics.getLast7DaysActivity();
        const goalsProgress = Statistics.getGoalsProgress();

        // Calculer les pourcentages de changement
        const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const yesterdayActivity = stats.dailyActivity[yesterdayDate] || {};
        const pomodoroChange = this.calculateChange(yesterdayActivity.pomodoro || 0, todayStats.pomodoro);
        const tasksChange = this.calculateChange(yesterdayActivity.tasks || 0, todayStats.tasks);
        const clicksChange = this.calculateChange(yesterdayActivity.bookmarks || 0, todayStats.bookmarks);

        // Trouver le widget le plus utilisé
        const mostUsedWidget = Object.entries(stats.widgets)
            .sort((a, b) => {
                const aTotal = Object.values(a[1]).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
                const bTotal = Object.values(b[1]).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
                return bTotal - aTotal;
            })[0];

        const widgetNames = {
            bookmarks: 'Favoris',
            tasks: 'Tâches',
            pomodoro: 'Pomodoro',
            notes: 'Notes',
            rss: 'Flux RSS',
            calculator: 'Calculatrice',
            snippets: 'Snippets',
            toolsPx: 'PX↔REM',
            toolsPass: 'Générateur',
            gitCheatsheet: 'Git',
            emojiPicker: 'Emojis'
        };

        // Créer le graphique en ASCII simple pour la semaine
        const maxActivity = Math.max(...last7Days.map(d => d.total), 1);
        const barChart = last7Days.map(day => {
            const height = Math.round((day.total / maxActivity) * 8);
            const bars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
            return `<div class="flex flex-col items-center gap-1">
                <div class="text-2xl">${bars[height] || '▁'}</div>
                <div class="text-[10px] text-zinc-600">${day.day}</div>
            </div>`;
        }).join('');

        window.openModal(`
            <div class="max-w-6xl mx-auto">
                <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
                    <i class="mdi mdi-chart-box text-accent"></i>
                    Dashboard Statistiques DoraDesk
                </h2>

                <!-- Cards KPI -->
                <div class="grid grid-cols-3 gap-4 mb-6">
                    <div class="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-lg p-4">
                        <div class="flex items-start justify-between mb-2">
                            <div>
                                <div class="text-orange-400 text-3xl font-bold">${todayStats.pomodoro}</div>
                                <div class="text-sm text-zinc-400">Pomodoros</div>
                            </div>
                            <i class="mdi mdi-timer text-orange-400 text-3xl"></i>
                        </div>
                        <div class="text-xs ${pomodoroChange >= 0 ? 'text-green-400' : 'text-red-400'}">
                            ${pomodoroChange >= 0 ? '↑' : '↓'} ${Math.abs(pomodoroChange)}% vs hier
                        </div>
                    </div>

                    <div class="bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 rounded-lg p-4">
                        <div class="flex items-start justify-between mb-2">
                            <div>
                                <div class="text-accent text-3xl font-bold">${stats.widgets.tasks?.completed || 0}</div>
                                <div class="text-sm text-zinc-400">Tâches Totales</div>
                            </div>
                            <i class="mdi mdi-check-circle text-accent text-3xl"></i>
                        </div>
                        <div class="text-xs ${tasksChange >= 0 ? 'text-green-400' : 'text-red-400'}">
                            ${tasksChange >= 0 ? '↑' : '↓'} ${Math.abs(tasksChange)}% vs hier
                        </div>
                    </div>

                    <div class="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-4">
                        <div class="flex items-start justify-between mb-2">
                            <div>
                                <div class="text-blue-400 text-3xl font-bold">${stats.widgets.bookmarks?.clicks || 0}</div>
                                <div class="text-sm text-zinc-400">Clics Favoris</div>
                            </div>
                            <i class="mdi mdi-cursor-default-click text-blue-400 text-3xl"></i>
                        </div>
                        <div class="text-xs ${clicksChange >= 0 ? 'text-green-400' : 'text-red-400'}">
                            ${clicksChange >= 0 ? '↑' : '↓'} ${Math.abs(clicksChange)}% vs hier
                        </div>
                    </div>
                </div>

                <!-- Graphiques -->
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <!-- Activité Hebdomadaire -->
                    <div class="bg-dark-800/50 border border-white/10 rounded-lg p-4">
                        <h3 class="text-sm font-semibold mb-4 flex items-center gap-2">
                            <i class="mdi mdi-chart-bar text-accent"></i>
                            Activité des 7 Derniers Jours
                        </h3>
                        <div class="flex items-end justify-around gap-2 h-32">
                            ${barChart}
                        </div>
                        <div class="text-center text-xs text-zinc-500 mt-2">
                            Total: ${last7Days.reduce((sum, d) => sum + d.total, 0)} actions
                        </div>
                    </div>

                    <!-- Répartition des Widgets -->
                    <div class="bg-dark-800/50 border border-white/10 rounded-lg p-4">
                        <h3 class="text-sm font-semibold mb-4 flex items-center gap-2">
                            <i class="mdi mdi-chart-pie text-accent"></i>
                            Widgets les Plus Utilisés
                        </h3>
                        <div class="space-y-2">
                            ${Object.entries(stats.widgets)
                                .map(([widget, data]) => {
                                    const total = Object.values(data).reduce((sum, val) =>
                                        sum + (typeof val === 'number' ? val : 0), 0);
                                    return { widget, total };
                                })
                                .sort((a, b) => b.total - a.total)
                                .slice(0, 5)
                                .map(({ widget, total }) => {
                                    const maxTotal = Object.values(stats.widgets)
                                        .reduce((max, data) => {
                                            const t = Object.values(data).reduce((sum, val) =>
                                                sum + (typeof val === 'number' ? val : 0), 0);
                                            return Math.max(max, t);
                                        }, 1);
                                    const percentage = (total / maxTotal) * 100;
                                    return `
                                        <div>
                                            <div class="flex justify-between text-xs mb-1">
                                                <span class="text-zinc-400">${widgetNames[widget] || widget}</span>
                                                <span class="text-zinc-300 font-medium">${total}</span>
                                            </div>
                                            <div class="w-full bg-dark-900 rounded-full h-2">
                                                <div class="bg-accent h-2 rounded-full transition-all" style="width: ${percentage}%"></div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                        </div>
                    </div>
                </div>

                <!-- Top Sites & Objectifs -->
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <!-- Top Sites -->
                    <div class="bg-dark-800/50 border border-white/10 rounded-lg p-4">
                        <h3 class="text-sm font-semibold mb-3 flex items-center gap-2">
                            <i class="mdi mdi-star text-accent"></i>
                            Top 10 Sites Visités
                        </h3>
                        <div class="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                            ${topBookmarks.length > 0 ? topBookmarks.map((bookmark, i) => `
                                <div class="flex items-center justify-between p-2 bg-dark-900/50 rounded">
                                    <div class="flex items-center gap-2 flex-1 min-w-0">
                                        <span class="text-zinc-500 text-xs font-mono">#${i + 1}</span>
                                        <span class="text-zinc-300 text-sm truncate">${bookmark.name}</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="text-accent font-bold">${bookmark.clicks}</span>
                                        <span class="text-zinc-600 text-xs">clics</span>
                                    </div>
                                </div>
                            `).join('') : '<div class="text-center text-zinc-500 text-sm py-4">Aucun favori cliqué</div>'}
                        </div>
                    </div>

                    <!-- Productivité & Objectifs -->
                    <div class="bg-dark-800/50 border border-white/10 rounded-lg p-4">
                        <h3 class="text-sm font-semibold mb-3 flex items-center gap-2">
                            <i class="mdi mdi-target text-accent"></i>
                            Productivité & Objectifs
                        </h3>

                        <div class="space-y-4">
                            <!-- Pomodoro Goal -->
                            <div>
                                <div class="flex justify-between mb-2">
                                    <span class="text-sm text-zinc-400">🍅 Objectif Pomodoro</span>
                                    <span class="text-sm font-medium">${todayStats.pomodoro}/${stats.goals.pomodoro}</span>
                                </div>
                                <div class="w-full bg-dark-900 rounded-full h-3 overflow-hidden">
                                    <div class="bg-orange-500 h-3 transition-all rounded-full" style="width: ${goalsProgress.pomodoro.percentage}%"></div>
                                </div>
                                <div class="text-right text-xs text-zinc-500 mt-1">${Math.round(goalsProgress.pomodoro.percentage)}%</div>
                            </div>

                            <!-- Tasks Goal -->
                            <div>
                                <div class="flex justify-between mb-2">
                                    <span class="text-sm text-zinc-400">✅ Objectif Tâches</span>
                                    <span class="text-sm font-medium">${todayStats.tasks}/${stats.goals.tasks}</span>
                                </div>
                                <div class="w-full bg-dark-900 rounded-full h-3 overflow-hidden">
                                    <div class="bg-accent h-3 transition-all rounded-full" style="width: ${goalsProgress.tasks.percentage}%"></div>
                                </div>
                                <div class="text-right text-xs text-zinc-500 mt-1">${Math.round(goalsProgress.tasks.percentage)}%</div>
                            </div>

                            <!-- Stats Générales -->
                            <div class="pt-3 border-t border-white/10">
                                <div class="grid grid-cols-2 gap-3 text-xs">
                                    <div class="bg-dark-900/50 p-2 rounded">
                                        <div class="text-zinc-500">Sessions Totales</div>
                                        <div class="text-xl font-bold text-accent">${stats.sessions.total}</div>
                                    </div>
                                    <div class="bg-dark-900/50 p-2 rounded">
                                        <div class="text-zinc-500">Streak Pomodoro</div>
                                        <div class="text-xl font-bold text-orange-400">${stats.widgets.pomodoro?.streak || 0}🔥</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-3 justify-end">
                    <button
                        onclick="StatisticsActions.exportStats()"
                        class="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded text-blue-400 transition-all">
                        <i class="mdi mdi-download"></i> Exporter JSON
                    </button>
                    <button
                        onclick="StatisticsActions.openSettings()"
                        class="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-zinc-300 transition-all">
                        <i class="mdi mdi-cog"></i> Paramètres
                    </button>
                    <button
                        onclick="window.closeAllModals()"
                        class="px-4 py-2 bg-accent/20 hover:bg-accent/30 border border-accent/30 rounded text-accent transition-all">
                        Fermer
                    </button>
                </div>
            </div>
        `, 'max-w-6xl');
    }

    static calculateChange(oldValue, newValue) {
        if (oldValue === 0) return newValue > 0 ? 100 : 0;
        return Math.round(((newValue - oldValue) / oldValue) * 100);
    }

    static exportStats() {
        const stats = Statistics.export();
        const dataStr = JSON.stringify(stats, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `doradesk-stats-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        window.showToast('Statistiques exportées');
    }

    static openSettings() {
        const stats = Statistics.load();

        window.openModal(`
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                <i class="mdi mdi-cog text-accent"></i>
                Paramètres des Statistiques
            </h2>

            <div class="space-y-4">
                <div>
                    <label class="text-sm text-zinc-400 block mb-2">Objectif Pomodoro Quotidien</label>
                    <input
                        id="goalPomodoro"
                        type="number"
                        value="${stats.goals.pomodoro}"
                        min="1"
                        max="20"
                        class="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent">
                </div>

                <div>
                    <label class="text-sm text-zinc-400 block mb-2">Objectif Tâches Quotidiennes</label>
                    <input
                        id="goalTasks"
                        type="number"
                        value="${stats.goals.tasks}"
                        min="1"
                        max="50"
                        class="w-full bg-dark-800 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent">
                </div>

                <div class="pt-4 border-t border-white/10">
                    <button
                        onclick="if(confirm('Êtes-vous sûr de vouloir réinitialiser toutes les statistiques ?')) { StatisticsActions.resetStats(); }"
                        class="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-400 transition-all">
                        <i class="mdi mdi-delete"></i> Réinitialiser les Statistiques
                    </button>
                </div>

                <div class="flex gap-3">
                    <button
                        onclick="StatisticsActions.saveSettings()"
                        class="flex-1 px-4 py-2 bg-accent hover:brightness-110 rounded text-white font-medium transition-all">
                        Enregistrer
                    </button>
                    <button
                        onclick="window.closeAllModals()"
                        class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-zinc-300 transition-all">
                        Annuler
                    </button>
                </div>
            </div>
        `);
    }

    static saveSettings() {
        const stats = Statistics.load();
        const pomodoroGoal = parseInt(document.getElementById('goalPomodoro')?.value || '5');
        const tasksGoal = parseInt(document.getElementById('goalTasks')?.value || '10');

        stats.goals.pomodoro = Math.max(1, Math.min(20, pomodoroGoal));
        stats.goals.tasks = Math.max(1, Math.min(50, tasksGoal));

        Statistics.save(stats);
        window.closeAllModals();
        window.refreshCard('statistics');
        window.showToast('Objectifs mis à jour');
    }

    static resetStats() {
        Statistics.reset();
        window.closeAllModals();
        window.refreshCard('statistics');
        window.showToast('Statistiques réinitialisées');
    }
}

// Expose to window for onclick handlers
window.StatisticsActions = StatisticsActions;
