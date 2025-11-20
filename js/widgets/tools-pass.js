export const toolsPassWidget = {
    id: 'tools-pass',
    name: 'Générateur MDP',
    icon: 'mdi-key-variant',
    size: { w: 3, h: 4 },
    render() {
        return `
            <div class="h-full flex flex-col gap-3">
                <div class="relative">
                    <input type="text" id="passOutput" readonly class="w-full bg-dark-900 border border-white/10 rounded px-3 py-3 font-mono text-accent outline-none text-center text-sm" placeholder="...">
                    <button onclick="ToolsPassActions.copy()" class="absolute right-2 top-2 text-zinc-500 hover:text-white"><i class="mdi mdi-content-copy"></i></button>
                </div>
                <div class="flex items-center justify-between text-xs text-zinc-400">
                    <span>Longueur: <span id="passLenVal" class="text-white">16</span></span>
                    <input type="range" id="passLen" min="8" max="32" value="16" oninput="document.getElementById('passLenVal').innerText=this.value" class="w-24 accent-indigo-500">
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                    <label class="flex items-center gap-2"><input type="checkbox" id="passUpper" checked class="accent-indigo-500"> A-Z</label>
                    <label class="flex items-center gap-2"><input type="checkbox" id="passNum" checked class="accent-indigo-500"> 0-9</label>
                    <label class="flex items-center gap-2"><input type="checkbox" id="passSym" checked class="accent-indigo-500"> #@!</label>
                </div>
                <button onclick="ToolsPassActions.generate()" class="mt-auto w-full py-2 bg-white/10 hover:bg-accent rounded text-white transition-colors text-sm font-medium">Générer</button>
            </div>
        `;
    },
    init() {
        if (window.ToolsPassActions) {
            window.ToolsPassActions.generate();
        }
    }
};

// ToolsPassActions Class
class ToolsPassActions {
    static generate() {
        const len = document.getElementById('passLen')?.value || 16;
        let chars = "abcdefghijklmnopqrstuvwxyz";

        if (document.getElementById('passUpper')?.checked) {
            chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        }
        if (document.getElementById('passNum')?.checked) {
            chars += "0123456789";
        }
        if (document.getElementById('passSym')?.checked) {
            chars += "!@#$%^&*()_+";
        }

        let pass = "";
        for (let i = 0; i < len; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const output = document.getElementById('passOutput');
        if (output) output.value = pass;
    }

    static copy() {
        const el = document.getElementById('passOutput');
        if (!el) return;

        el.select();
        navigator.clipboard.writeText(el.value);
        window.showToast('Mot de passe copié');
    }
}

// Expose to window for onclick handlers
window.ToolsPassActions = ToolsPassActions;
