export const pomodoroWidget = {
    id: 'pomodoro',
    name: 'Pomodoro',
    icon: 'mdi-timer-outline',
    size: { w: 3, h: 4 },
    render() {
        return `
            <div class="h-full flex flex-col items-center justify-center gap-4">
                <!-- Timer Display -->
                <div class="relative w-40 h-40">
                    <svg class="transform -rotate-90 w-40 h-40">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" stroke-width="6" fill="none" class="text-zinc-700/30" />
                        <circle id="pomodoroProgress" cx="80" cy="80" r="70" stroke="currentColor" stroke-width="6" fill="none"
                            class="text-accent transition-all duration-1000"
                            style="stroke-dasharray: 440; stroke-dashoffset: 440; stroke-linecap: round;" />
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span id="pomodoroTime" class="text-4xl font-bold font-mono text-white">25:00</span>
                        <span id="pomodoroLabel" class="text-xs text-zinc-500 mt-1">Travail</span>
                    </div>
                </div>

                <!-- Controls -->
                <div class="flex gap-2">
                    <button onclick="PomodoroActions.start()" id="pomodoroStartBtn" class="px-4 py-2 bg-accent hover:brightness-110 rounded-lg text-white font-medium transition-all flex items-center gap-2">
                        <i class="mdi mdi-play"></i> Démarrer
                    </button>
                    <button onclick="PomodoroActions.pause()" id="pomodoroPauseBtn" class="hidden px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all">
                        <i class="mdi mdi-pause"></i>
                    </button>
                    <button onclick="PomodoroActions.reset()" class="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all">
                        <i class="mdi mdi-refresh"></i>
                    </button>
                </div>

                <!-- Stats -->
                <div class="text-center">
                    <div class="text-sm text-zinc-500">Sessions aujourd'hui</div>
                    <div class="text-2xl font-bold text-accent" id="pomodoroSessions">0</div>
                </div>

                <!-- Settings -->
                <div class="flex gap-2 text-xs">
                    <button onclick="PomodoroActions.setMode('work')" class="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
                        25 min
                    </button>
                    <button onclick="PomodoroActions.setMode('shortBreak')" class="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
                        5 min
                    </button>
                    <button onclick="PomodoroActions.setMode('longBreak')" class="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
                        15 min
                    </button>
                </div>
            </div>
        `;
    },
    init() {
        // Initialize daily sessions
        const today = new Date().toDateString();
        if (localStorage.getItem('pomodoroDate') !== today) {
            localStorage.setItem('pomodoroDate', today);
            localStorage.setItem('pomodoroSessions', '0');
            PomodoroActions.sessions = 0;
        } else {
            PomodoroActions.sessions = parseInt(localStorage.getItem('pomodoroSessions') || '0');
        }
        PomodoroActions.updateDisplay();
    }
};

// PomodoroActions Class
class PomodoroActions {
    static interval = null;
    static seconds = 25 * 60;
    static totalSeconds = 25 * 60;
    static mode = 'work'; // 'work', 'shortBreak', 'longBreak'
    static running = false;
    static sessions = parseInt(localStorage.getItem('pomodoroSessions') || '0');

    static start() {
        if (PomodoroActions.running) return;
        PomodoroActions.running = true;

        document.getElementById('pomodoroStartBtn')?.classList.add('hidden');
        document.getElementById('pomodoroPauseBtn')?.classList.remove('hidden');

        PomodoroActions.interval = setInterval(() => {
            PomodoroActions.seconds--;
            PomodoroActions.updateDisplay();

            if (PomodoroActions.seconds <= 0) {
                PomodoroActions.pause();
                PomodoroActions.complete();
            }
        }, 1000);
    }

    static pause() {
        PomodoroActions.running = false;
        if (PomodoroActions.interval) clearInterval(PomodoroActions.interval);

        document.getElementById('pomodoroStartBtn')?.classList.remove('hidden');
        document.getElementById('pomodoroPauseBtn')?.classList.add('hidden');
    }

    static reset() {
        PomodoroActions.pause();
        PomodoroActions.seconds = PomodoroActions.totalSeconds;
        PomodoroActions.updateDisplay();
    }

    static setMode(mode) {
        PomodoroActions.pause();
        PomodoroActions.mode = mode;

        const durations = {
            work: 25 * 60,
            shortBreak: 5 * 60,
            longBreak: 15 * 60
        };

        const labels = {
            work: 'Travail',
            shortBreak: 'Pause courte',
            longBreak: 'Pause longue'
        };

        PomodoroActions.totalSeconds = durations[mode];
        PomodoroActions.seconds = PomodoroActions.totalSeconds;

        const labelEl = document.getElementById('pomodoroLabel');
        if (labelEl) labelEl.textContent = labels[mode];

        PomodoroActions.updateDisplay();
    }

    static updateDisplay() {
        const mins = Math.floor(PomodoroActions.seconds / 60);
        const secs = PomodoroActions.seconds % 60;
        const timeEl = document.getElementById('pomodoroTime');
        if (timeEl) {
            timeEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        // Update progress circle
        const progress = ((PomodoroActions.totalSeconds - PomodoroActions.seconds) / PomodoroActions.totalSeconds) * 440;
        const progressEl = document.getElementById('pomodoroProgress');
        if (progressEl) {
            progressEl.style.strokeDashoffset = 440 - progress;
        }

        // Update sessions
        const sessionsEl = document.getElementById('pomodoroSessions');
        if (sessionsEl) sessionsEl.textContent = PomodoroActions.sessions;
    }

    static complete() {
        if (PomodoroActions.mode === 'work') {
            PomodoroActions.sessions++;
            localStorage.setItem('pomodoroSessions', PomodoroActions.sessions.toString());
        }

        // Play notification sound
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2S57OmmVRILTKXh8bllHAY2jdXwzXksBS1+y/DajkAJFGCy6OynWBUIQ5zd8sFuJAUuhM/y2Ik3CBtlvOzpplUSC0yl4fG5ZRwGN47W8c18LAUuf8vw2o5ACRRhsujsp1gVCEOc3fLBbiQFL4XQ8tmJNggcZrzs6aZVEgtMpeHxuWUcBjiP1/HNfCwFL4DM8NqOQAkUYrPo7KdYFQhDnN3ywW4kBS+F0PLZiTYIHGa87OmmVRILTKXh8bllHAY4j9fxzXwsBTCAzPDajkAJFGKz6OynWBUIQ5zd8sFuJAUvhdDy2Yk2CBxmvOzpplUSC0yl4fG5ZRwGOI/X8c18LAUwgMzw2o5ACRRis+jsp1gVCEOc3fLBbiQFL4XQ8tmJNggcZrzs6aZVEgtMpeHxuWUcBjiP1/HNfCwFMIDM8NqOQAkUYrPo7KdYFQhDnN3ywW4kBS+F0PLZiTYIHGa87OmmVRILTKXh8bllHAY4j9fxzXwsBTCAzPDajkAJFGKz6OynWBUIQ5zd8sFuJAU=');
        audio.play().catch(() => {});

        window.showToast(`${PomodoroActions.mode === 'work' ? 'Session terminée !' : 'Pause terminée !'}`, 5000);

        // Auto-switch to break or work
        if (PomodoroActions.mode === 'work') {
            PomodoroActions.setMode(PomodoroActions.sessions % 4 === 0 ? 'longBreak' : 'shortBreak');
        } else {
            PomodoroActions.setMode('work');
        }
    }
}

// Expose to window for onclick handlers
window.PomodoroActions = PomodoroActions;
