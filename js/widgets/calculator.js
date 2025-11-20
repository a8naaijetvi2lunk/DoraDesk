export const calculatorWidget = {
    id: 'calculator',
    name: 'Calculatrice',
    icon: 'mdi-calculator',
    size: { w: 3, h: 4 },
    render() {
        return `
            <div class="h-full flex flex-col gap-2">
                <input type="text" id="calcDisplay" readonly class="w-full bg-dark-900 border border-white/10 rounded px-3 py-3 text-right text-xl font-mono text-white" value="0">
                <div class="grid grid-cols-4 gap-2 flex-1">
                    ${['C', '/', '*', '-', '7', '8', '9', '+', '4', '5', '6', '=', '1', '2', '3', '0'].map(btn => `
                        <button onclick="${btn === 'C' ? 'CalculatorActions.clear()' : `CalculatorActions.input('${btn}')`}" class="rounded font-medium transition-colors ${btn === '=' ? 'row-span-2 bg-accent hover:brightness-110' : 'bg-white/5 hover:bg-white/10'} ${btn === '0' ? 'col-span-3' : ''}">${btn}</button>
                    `).join('')}
                </div>
            </div>
        `;
    }
};

// CalculatorActions Class
class CalculatorActions {
    static expression = "";

    static input(v) {
        if (v === '=') {
            try {
                // SECURE: Whitelist-based safe evaluation
                CalculatorActions.expression = CalculatorActions.safeEval(CalculatorActions.expression);
            } catch (e) {
                CalculatorActions.expression = "Erreur";
            }
        } else {
            CalculatorActions.expression += v;
        }
        const display = document.getElementById('calcDisplay');
        if (display) display.value = CalculatorActions.expression;
    }

    static clear() {
        CalculatorActions.expression = "";
        const display = document.getElementById('calcDisplay');
        if (display) display.value = "0";
    }

    /**
     * Safe evaluation of mathematical expressions
     * Uses whitelist approach to prevent code injection
     */
    static safeEval(expr) {
        // Only allow numbers and basic math operators
        const sanitized = expr.replace(/\s+/g, '');

        // Whitelist: numbers, operators, decimal point, parentheses
        const allowedChars = /^[0-9+\-*/.()]+$/;
        if (!allowedChars.test(sanitized)) {
            throw new Error('Invalid characters');
        }

        // Check for empty expression
        if (!sanitized) {
            return "0";
        }

        // Prevent multiple consecutive operators
        if (/[+\-*\/]{2,}/.test(sanitized)) {
            throw new Error('Invalid operator sequence');
        }

        // Safe evaluation using a simple recursive parser
        return CalculatorActions.evaluateExpression(sanitized).toString();
    }

    /**
     * Recursive descent parser for safe expression evaluation
     */
    static evaluateExpression(expr) {
        // Remove outer parentheses if they exist
        expr = expr.trim();

        // Handle parentheses first
        while (expr.includes('(')) {
            expr = expr.replace(/\(([^()]+)\)/g, (match, inner) => {
                return CalculatorActions.evaluateExpression(inner);
            });
        }

        // Order of operations: * and / before + and -
        // Handle addition and subtraction
        const addSubMatch = expr.match(/^(.+)([\+\-])(.+)$/);
        if (addSubMatch) {
            const left = CalculatorActions.evaluateExpression(addSubMatch[1]);
            const operator = addSubMatch[2];
            const right = CalculatorActions.evaluateExpression(addSubMatch[3]);

            if (operator === '+') return left + right;
            if (operator === '-') return left - right;
        }

        // Handle multiplication and division
        const mulDivMatch = expr.match(/^(.+)([\*\/])(.+)$/);
        if (mulDivMatch) {
            const left = CalculatorActions.evaluateExpression(mulDivMatch[1]);
            const operator = mulDivMatch[2];
            const right = CalculatorActions.evaluateExpression(mulDivMatch[3]);

            if (operator === '*') return left * right;
            if (operator === '/') {
                if (right === 0) throw new Error('Division by zero');
                return left / right;
            }
        }

        // Base case: parse as number
        const num = parseFloat(expr);
        if (isNaN(num)) {
            throw new Error('Invalid number');
        }
        return num;
    }
}

// Expose to window for onclick handlers
window.CalculatorActions = CalculatorActions;
