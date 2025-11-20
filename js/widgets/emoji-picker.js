export const emojiPickerWidget = {
    id: 'emoji-picker',
    name: 'Emoji Picker',
    icon: 'mdi-emoticon-happy-outline',
    size: { w: 4, h: 5 },
    render() {
        const emojiCategories = [
            { name: 'Smileys', icon: '😊', emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','😵','🤯','🤠','🥳','😎','🤓','🧐'] },
            { name: 'Gestes', icon: '👍', emojis: ['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🦷','🦴','👀','👁','👅','👄'] },
            { name: 'Cœurs', icon: '❤️', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟'] },
            { name: 'Animaux', icon: '🐶', emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐈','🐓','🦃','🦚','🦜','🦢','🦩','🕊','🐇','🦝','🦨','🦡','🦦','🦥','🐁','🐀','🐿','🦔'] },
            { name: 'Nature', icon: '🌸', emojis: ['💐','🌸','💮','🏵','🌹','🥀','🌺','🌻','🌼','🌷','🌱','🪴','🌲','🌳','🌴','🌵','🌾','🌿','☘️','🍀','🍁','🍂','🍃'] },
            { name: 'Nourriture', icon: '🍕', emojis: ['🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🫐','🥝','🍅','🫒','🥥','🥑','🍆','🥔','🥕','🌽','🌶','🫑','🥒','🥬','🥦','🧄','🧅','🍄','🥜','🌰','🍞','🥐','🥖','🫓','🥨','🥯','🥞','🧇','🧀','🍖','🍗','🥩','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🫔','🥙','🧆','🥚','🍳','🥘','🍲','🫕','🥣','🥗','🍿','🧈','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡','🦀','🦞','🦐','🦑','🦪','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯','🍼','🥛','☕','🫖','🍵','🍶','🍾','🍷','🍸','🍹','🍺','🍻','🥂','🥃','🥤','🧋','🧃','🧉','🧊'] },
            { name: 'Activités', icon: '⚽', emojis: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸','🥌','🎿','⛷','🏂','🪂','🏋️','🤼','🤸','🤺','⛹️','🤾','🏌️','🏇','🧘','🏊','🤽','🚣','🧗','🚴','🚵','🤹'] },
            { name: 'Voyage', icon: '✈️', emojis: ['🚗','🚕','🚙','🚌','🚎','🏎','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🦯','🦽','🦼','🛴','🚲','🛵','🏍','🛺','🚨','🚔','🚍','🚘','🚖','🚡','🚠','🚟','🚃','🚋','🚞','🚝','🚄','🚅','🚈','🚂','🚆','🚇','🚊','🚉','✈️','🛫','🛬','🛩','💺','🛰','🚀','🛸','🚁','🛶','⛵','🚤','🛥','🛳','⛴','🚢','⚓','🪝','⛽','🚧','🚦','🚥','🗺','🗿','🗽','🗼','🏰','🏯','🏟','🎡','🎢','🎠','⛲','⛱','🏖','🏝','🏜','🌋','⛰','🏔','🗻','🏕','⛺','🏠','🏡','🏘','🏚','🏗','🏭','🏢','🏬','🏣','🏤','🏥','🏦','🏨','🏪','🏫','🏩','💒','🏛','⛪','🕌','🕍','🛕','🕋','⛩','🛤','🛣'] },
            { name: 'Objets', icon: '💻', emojis: ['⌚','📱','📲','💻','⌨️','🖥','🖨','🖱','🖲','🕹','🗜','💽','💾','💿','📀','📼','📷','📸','📹','🎥','📽','🎞','📞','☎️','📟','📠','📺','📻','🎙','🎚','🎛','🧭','⏱','⏲','⏰','🕰','⌛','⏳','📡','🔋','🔌','💡','🔦','🕯','🪔','🧯','🛢','💸','💵','💴','💶','💷','🪙','💰','💳','🪪','💎','⚖️','🪜','🧰','🪛','🔧','🔨','⚒','🛠','⛏','🪚','🔩','⚙️','🪤','🧱','⛓','🧲','🔫','💣','🧨','🪓','🔪','🗡','⚔️','🛡','🚬','⚰️','🪦','⚱️','🏺','🔮','📿','🧿','💈','⚗️','🔭','🔬','🕳','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡','🧹','🪠','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪥','🪒','🧽','🪣','🧴','🛎','🔑','🗝','🚪','🪑','🛋','🛏','🛌','🧸','🖼','🪆','🪟','🪜'] },
            { name: 'Symboles', icon: '❤️', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🛗','🈳','🈂️','🛂','🛃','🛄','🛅','🚹','🚺','🚼','⚧','🚻','🚮','🎦','📶','🈁','🔣','ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔢','#️⃣','*️⃣','⏏️','▶️','⏸','⏯','⏹','⏺','⏭','⏮','⏩','⏪','⏫','⏬','◀️','🔼','🔽','➡️','⬅️','⬆️','⬇️','↗️','↘️','↙️','↖️','↕️','↔️','↪️','↩️','⤴️','⤵️','🔀','🔁','🔂','🔄','🔃','🎵','🎶','➕','➖','➗','✖️','🟰','♾️','💲','💱','™️','©️','®️','〰️','➰','➿','🔚','🔙','🔛','🔝','🔜','✔️','☑️','🔘','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔺','🔻','🔸','🔹','🔶','🔷','🔳','🔲','▪️','▫️','◾','◽','◼️','◻️','🟥','🟧','🟨','🟩','🟦','🟪','⬛','⬜','🟫','🔈','🔇','🔉','🔊','🔔','🔕','📣','📢','👁‍🗨','💬','💭','🗯','♠️','♣️','♥️','♦️','🃏','🎴','🀄','🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛','🕜','🕝','🕞','🕟','🕠','🕡','🕢','🕣','🕤','🕥','🕦','🕧'] }
        ];

        return `
            <div class="h-full flex flex-col">
                <!-- Search -->
                <div class="mb-3">
                    <input type="text" id="emojiSearch" placeholder="Rechercher un emoji..."
                        oninput="EmojiPickerActions.filter(this.value)"
                        class="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-accent">
                </div>

                <!-- Categories -->
                <div class="flex gap-1 mb-3 overflow-x-auto pb-2">
                    ${emojiCategories.map((cat, idx) => `
                        <button onclick="EmojiPickerActions.showCategory(${idx})" id="emojiCat${idx}"
                            class="emoji-cat-btn px-3 py-1.5 rounded-lg text-lg transition-all ${idx === 0 ? 'bg-accent' : 'bg-white/5 hover:bg-white/10'}">
                            ${cat.icon}
                        </button>
                    `).join('')}
                </div>

                <!-- Emoji Grid -->
                <div class="flex-1 overflow-y-auto" id="emojiGrid">
                    ${emojiCategories.map((cat, idx) => `
                        <div id="emojiCategory${idx}" class="${idx === 0 ? '' : 'hidden'}">
                            <div class="text-xs font-bold text-zinc-500 uppercase mb-2">${cat.name}</div>
                            <div class="grid grid-cols-8 gap-1">
                                ${cat.emojis.map(emoji => `
                                    <button onclick="EmojiPickerActions.copy('${emoji}')"
                                        class="w-10 h-10 flex items-center justify-center text-2xl rounded hover:bg-white/10 transition-all hover:scale-125 active:scale-95"
                                        title="${emoji}">
                                        ${emoji}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Recently Used -->
                <div class="mt-3 pt-3 border-t border-white/10">
                    <div class="text-xs text-zinc-500 mb-2">Récemment utilisés</div>
                    <div id="recentEmojis" class="flex gap-1 flex-wrap">
                        <span class="text-zinc-600 text-xs">Aucun pour le moment</span>
                    </div>
                </div>
            </div>
        `;
    },
    init() {
        setTimeout(() => {
            EmojiPickerActions.updateRecent();
        }, 500);
    }
};

// EmojiPickerActions Class
class EmojiPickerActions {
    static recentEmojis = JSON.parse(localStorage.getItem('recentEmojis') || '[]');

    static showCategory(idx) {
        // Hide all categories
        document.querySelectorAll('[id^="emojiCategory"]').forEach(cat => cat.classList.add('hidden'));
        // Show selected
        document.getElementById(`emojiCategory${idx}`)?.classList.remove('hidden');

        // Update button states
        document.querySelectorAll('.emoji-cat-btn').forEach(btn => {
            btn.className = 'emoji-cat-btn px-3 py-1.5 rounded-lg text-lg transition-all bg-white/5 hover:bg-white/10';
        });
        const selectedBtn = document.getElementById(`emojiCat${idx}`);
        if (selectedBtn) {
            selectedBtn.className = 'emoji-cat-btn px-3 py-1.5 rounded-lg text-lg transition-all bg-accent';
        }
    }

    static copy(emoji) {
        navigator.clipboard.writeText(emoji).then(() => {
            window.showToast(`${emoji} copié !`);

            // Add to recent
            EmojiPickerActions.recentEmojis = EmojiPickerActions.recentEmojis.filter(e => e !== emoji);
            EmojiPickerActions.recentEmojis.unshift(emoji);
            EmojiPickerActions.recentEmojis = EmojiPickerActions.recentEmojis.slice(0, 12);
            localStorage.setItem('recentEmojis', JSON.stringify(EmojiPickerActions.recentEmojis));

            EmojiPickerActions.updateRecent();
        });
    }

    static filter(query) {
        const searchValue = query.toLowerCase().trim();

        if (!searchValue) {
            // Show all categories
            document.querySelectorAll('[id^="emojiCategory"]').forEach((cat, idx) => {
                cat.classList.toggle('hidden', idx !== 0);
            });
            return;
        }

        // Show all categories when searching
        document.querySelectorAll('[id^="emojiCategory"]').forEach(cat => {
            cat.classList.remove('hidden');
        });

        // Filter by emoji name (simple implementation)
        window.showToast('Recherche : ' + query);
    }

    static updateRecent() {
        const container = document.getElementById('recentEmojis');
        if (container && EmojiPickerActions.recentEmojis.length > 0) {
            container.innerHTML = EmojiPickerActions.recentEmojis.map(emoji => `
                <button onclick="EmojiPickerActions.copy('${emoji}')"
                    class="w-8 h-8 flex items-center justify-center text-xl rounded hover:bg-white/10 transition-all hover:scale-125 active:scale-95">
                    ${emoji}
                </button>
            `).join('');
        }
    }
}

// Expose to window for onclick handlers
window.EmojiPickerActions = EmojiPickerActions;
