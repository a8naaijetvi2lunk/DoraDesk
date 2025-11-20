/**
 * Système de statistiques pour DoraDesk
 */

export class Statistics {
    static STATS_KEY = 'doradesk_stats_v1';

    /**
     * Initialise les statistiques
     */
    static init() {
        const stats = this.load();
        if (!stats.sessions) {
            this.trackSession();
        }
    }

    /**
     * Charge les statistiques depuis localStorage
     */
    static load() {
        const data = localStorage.getItem(this.STATS_KEY);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('Erreur lors du chargement des stats', e);
                return this.getDefaults();
            }
        }
        return this.getDefaults();
    }

    /**
     * Sauvegarde les statistiques
     */
    static save(stats) {
        try {
            localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
            return true;
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des stats', e);
            return false;
        }
    }

    /**
     * Structure par défaut des statistiques
     */
    static getDefaults() {
        return {
            sessions: {
                total: 0,
                lastVisit: null,
                history: []
            },
            widgets: {
                bookmarks: { clicks: 0, lastUsed: null },
                tasks: { completed: 0, created: 0, deleted: 0 },
                notes: { edits: 0, lastEdit: null },
                pomodoro: { sessions: 0, totalTime: 0, streak: 0 },
                calculator: { calculations: 0 },
                snippets: { created: 0, copied: 0 },
                rss: { articlesRead: 0, feedsRefreshed: 0 },
                toolsPx: { conversions: 0 },
                toolsPass: { generated: 0 },
                gitCheatsheet: { copied: 0 },
                emojiPicker: { copied: 0 }
            },
            bookmarks: {},
            dailyActivity: {},
            goals: {
                pomodoro: 5,
                tasks: 10
            }
        };
    }

    /**
     * Track une nouvelle session
     */
    static trackSession() {
        const stats = this.load();
        const today = new Date().toISOString().split('T')[0];

        stats.sessions.total++;
        stats.sessions.lastVisit = new Date().toISOString();

        // Ajouter à l'historique
        const todaySession = stats.sessions.history.find(s => s.date === today);
        if (todaySession) {
            todaySession.opens++;
        } else {
            stats.sessions.history.push({
                date: today,
                opens: 1,
                duration: 0
            });
        }

        // Garder seulement 90 derniers jours
        if (stats.sessions.history.length > 90) {
            stats.sessions.history = stats.sessions.history.slice(-90);
        }

        this.save(stats);
    }

    /**
     * Track une action de widget
     */
    static trackWidget(widgetId, action, value = 1) {
        const stats = this.load();
        const today = new Date().toISOString().split('T')[0];

        if (!stats.widgets[widgetId]) {
            stats.widgets[widgetId] = {};
        }

        if (!stats.widgets[widgetId][action]) {
            stats.widgets[widgetId][action] = 0;
        }

        stats.widgets[widgetId][action] += value;
        stats.widgets[widgetId].lastUsed = new Date().toISOString();

        // Track activité quotidienne
        if (!stats.dailyActivity[today]) {
            stats.dailyActivity[today] = {};
        }
        if (!stats.dailyActivity[today][widgetId]) {
            stats.dailyActivity[today][widgetId] = 0;
        }
        stats.dailyActivity[today][widgetId] += value;

        this.save(stats);
    }

    /**
     * Track un clic sur un favori
     */
    static trackBookmarkClick(url, name) {
        const stats = this.load();

        if (!stats.bookmarks[url]) {
            stats.bookmarks[url] = {
                name,
                clicks: 0,
                lastClick: null
            };
        }

        stats.bookmarks[url].clicks++;
        stats.bookmarks[url].lastClick = new Date().toISOString();

        this.trackWidget('bookmarks', 'clicks');
        this.save(stats);
    }

    /**
     * Track une tâche complétée
     */
    static trackTaskCompleted() {
        this.trackWidget('tasks', 'completed');
    }

    /**
     * Track une tâche créée
     */
    static trackTaskCreated() {
        this.trackWidget('tasks', 'created');
    }

    /**
     * Track une session Pomodoro
     */
    static trackPomodoroSession(duration) {
        const stats = this.load();
        stats.widgets.pomodoro.sessions++;
        stats.widgets.pomodoro.totalTime += duration;

        // Calculer le streak
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (stats.dailyActivity[today]?.pomodoro || stats.dailyActivity[yesterday]?.pomodoro) {
            stats.widgets.pomodoro.streak++;
        } else {
            stats.widgets.pomodoro.streak = 1;
        }

        this.trackWidget('pomodoro', 'sessions', 0);
        this.save(stats);
    }

    /**
     * Obtenir les statistiques pour aujourd'hui
     */
    static getTodayStats() {
        const stats = this.load();
        const today = new Date().toISOString().split('T')[0];
        const todayActivity = stats.dailyActivity[today] || {};

        return {
            tasks: todayActivity.tasks || 0,
            pomodoro: todayActivity.pomodoro || 0,
            bookmarks: todayActivity.bookmarks || 0,
            total: Object.values(todayActivity).reduce((a, b) => a + b, 0)
        };
    }

    /**
     * Obtenir les statistiques pour cette semaine
     */
    static getWeekStats() {
        const stats = this.load();
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const weekActivity = Object.entries(stats.dailyActivity)
            .filter(([date]) => new Date(date) >= weekAgo)
            .reduce((acc, [, activity]) => {
                Object.entries(activity).forEach(([widget, count]) => {
                    acc[widget] = (acc[widget] || 0) + count;
                });
                return acc;
            }, {});

        return weekActivity;
    }

    /**
     * Obtenir les top favoris
     */
    static getTopBookmarks(limit = 10) {
        const stats = this.load();
        return Object.entries(stats.bookmarks)
            .map(([url, data]) => ({ url, ...data }))
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, limit);
    }

    /**
     * Obtenir l'activité des 7 derniers jours
     */
    static getLast7DaysActivity() {
        const stats = this.load();
        const activity = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const dayActivity = stats.dailyActivity[dateStr] || {};
            const total = Object.values(dayActivity).reduce((a, b) => a + b, 0);

            activity.push({
                date: dateStr,
                day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
                total
            });
        }

        return activity;
    }

    /**
     * Obtenir la progression vers les objectifs
     */
    static getGoalsProgress() {
        const stats = this.load();
        const today = this.getTodayStats();

        return {
            pomodoro: {
                current: today.pomodoro,
                goal: stats.goals.pomodoro,
                percentage: Math.min(100, (today.pomodoro / stats.goals.pomodoro) * 100)
            },
            tasks: {
                current: today.tasks,
                goal: stats.goals.tasks,
                percentage: Math.min(100, (today.tasks / stats.goals.tasks) * 100)
            }
        };
    }

    /**
     * Reset toutes les statistiques
     */
    static reset() {
        localStorage.removeItem(this.STATS_KEY);
        return true;
    }

    /**
     * Export des statistiques
     */
    static export() {
        return this.load();
    }
}
