export const toolsPxWidget = {
    id: 'tools-px',
    name: 'PX ↔ REM',
    icon: 'mdi-ruler',
    size: { w: 3, h: 3 },
    render() {
        return `
            <div class="h-full flex flex-col justify-center gap-4">
                <div>
                    <label class="text-xs text-zinc-500 block mb-1">Pixels (px)</label>
                    <input type="number" id="pxInput" oninput="ToolsPxActions.convert('px')" class="w-full bg-dark-900 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent" placeholder="16">
                </div>
                <div class="flex justify-center text-zinc-500"><i class="mdi mdi-swap-vertical"></i></div>
                <div>
                    <label class="text-xs text-zinc-500 block mb-1">REM</label>
                    <input type="number" id="remInput" oninput="ToolsPxActions.convert('rem')" class="w-full bg-dark-900 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent" placeholder="1">
                </div>
                <div class="text-center text-xs text-zinc-600 mt-2">Base: 16px</div>
            </div>
        `;
    }
};

// ToolsPxActions Class
class ToolsPxActions {
    static convert(type) {
        const px = document.getElementById('pxInput');
        const rem = document.getElementById('remInput');

        if (!px || !rem) return;

        if (type === 'px') {
            const value = parseFloat(px.value);
            // Validation: check for NaN and negative values
            if (isNaN(value) || value < 0) {
                rem.value = '';
                return;
            }
            rem.value = (value / 16).toFixed(4);
        } else {
            const value = parseFloat(rem.value);
            // Validation: check for NaN and negative values
            if (isNaN(value) || value < 0) {
                px.value = '';
                return;
            }
            px.value = (value * 16).toFixed(2);
        }
    }
}

// Expose to window for onclick handlers
window.ToolsPxActions = ToolsPxActions;
