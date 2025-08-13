// Список раскладов с указанием:
// - количество карт в колоде (totalCards)
// - сколько карт нужно вытянуть (cardCount)
// - путь к картам
const layouts = {
    actual: {
        title: "Актуальный вопрос",
        description: "Сформулируйте свой запрос, далее поочередно выберите 3 карты.",
        cardsFolder: 'assets/cards/allegorii/',
        manifestFile: 'assets/cards/allegorii/manifest.json',
        cardCount: 3,
        totalCards: 101, // Всего карт в колоде (будет переопределено, если есть manifest.json)
        questions: [
            "Что нужно сделать, чтобы ситуация решилась? Какие действия предпринять?",
            "Что является основным препятствием в этой ситуации? Что мешает?",
            "Что поможет справиться, какие ресурсы и опоры?"
        ]
    },
    relations: {
        title: "Отношения",
        description: "Сформулируйте запрос, далее поочередно выберите 5 карт.",
        cardsFolder: 'assets/cards/lichnye_granicy/',
        manifestFile: 'assets/cards/lichnye_granicy/manifest.json',
        cardCount: 5,
        totalCards: 99,
        questions: [
            "Что я делаю в отношениях?",
            "Что я хочу от отношений?",
            "Что мне нужно перестать делать?",
            "Что нужно начать делать?",
            "Что сейчас самое важное?"
        ]
    },
    money1: {
        title: "Деньги: Качества",
        description: "Сформулируйте запрос, далее поочередно выберите 4 карты.",
        cardsFolder: 'assets/cards/delovaya_koloda/',
        manifestFile: 'assets/cards/delovaya_koloda/manifest.json',
        cardCount: 4,
        totalCards: 102,
        questions: [
            "Какие мои качества способствуют получению дохода?",
            "Какие мои качества останавливают поток денег в мою жизнь?",
            "Какие качества мне нужно развивать?",
            "Что я могу сделать наилучшим образом, чтобы увеличить финансовый поток в мою жизнь?"
        ]
    },
    money2: {
        title: "Деньги: Взгляд со стороны",
        description: "Сформулируйте запрос, далее поочередно выберите 4 карты.",
        cardsFolder: 'assets/cards/delovaya_koloda/',
        manifestFile: 'assets/cards/delovaya_koloda/manifest.json',
        cardCount: 4,
        totalCards: 102,
        questions: [
            "Что деньги думают обо мне (Я глазами денег)?",
            "Из-за каких моих качеств деньги не любят приходить ко мне?",
            "Что во мне привлекает деньги?",
            "Если бы деньги могли говорить, что-бы они мне сказали?"
        ]
    },
    simple: {
        title: "Простой расклад",
        description: "Простой расклад из одной карты, поможет найти ответ на любой вопрос.",
        cardsFolder: 'assets/cards/resursy/',
        manifestFile: 'assets/cards/resursy/manifest.json',
        cardCount: 1,
        totalCards: 99,
        questions: []
    }
};

let currentLayout = null;
let currentLayoutKey = null;
let usedCards = []; // Использованные карты в этом раскладе

// Telegram WebApp integration helpers
function getTg() {
    try {
        return (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
    } catch (_) {
        return null;
    }
}

function applyTelegramTheme() {
    const t = getTg();
    if (!t) return;
    const theme = t.themeParams || {};
    if (theme.bg_color) {
        document.body.style.background = theme.bg_color;
    }
    if (theme.text_color) {
        document.body.style.color = theme.text_color;
        document.documentElement.style.setProperty('--text-color', theme.text_color);
    }
    if (theme.button_color) {
        document.documentElement.style.setProperty('--btn-bg', theme.button_color);
    }
    if (theme.button_text_color) {
        document.documentElement.style.setProperty('--btn-text', theme.button_text_color);
    }
}

function initTelegram() {
    const t = getTg();
    if (!t) return;
    try {
        t.ready();
        t.expand();
        applyTelegramTheme();
        t.onEvent('themeChanged', applyTelegramTheme);
    } catch (_) {
        // ignore
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTelegram();
    const backToHomeBtn = document.getElementById('back-to-home');
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', goHome);
    }
    const copyBtn = document.getElementById('copy-link');
    if (copyBtn) copyBtn.addEventListener('click', copyShareLink);
    const sendBtn = document.getElementById('send-result');
    if (sendBtn) sendBtn.addEventListener('click', sendResult);

    // Восстановление расклада из URL, если есть параметры
    const params = new URLSearchParams(window.location.search);
    const layoutKey = params.get('l');
    const cardsParam = params.get('c');
    if (layoutKey && layouts[layoutKey] && cardsParam) {
        const parsed = cardsParam.split(',').map(n => parseInt(n, 10)).filter(n => !isNaN(n));
        if (parsed.length > 0) {
            restoreFromParams(layoutKey, parsed);
        }
    }
});

function goHome() {
    // Сброс экранов
    document.getElementById('cards-screen').style.display = 'none';
    document.getElementById('interpretation-screen').style.display = 'none';
    document.getElementById('home').style.display = 'block';
    // Очистить контейнер карт
    const container = document.getElementById('cards-container');
    if (container) container.innerHTML = '';
    usedCards = [];
    currentLayout = null;
    currentLayoutKey = null;
    // Telegram UI
    const t = getTg();
    if (t) {
        try {
            t.MainButton.hide();
            t.BackButton.hide();
            t.MainButton.offClick(finishLayout);
            t.MainButton.offClick(sendResult);
            t.BackButton.offClick(goHome);
        } catch (_) {}
    }
    // Очистить query
    if (window.history && window.history.replaceState) {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
    }
}

async function loadDeckMeta(layout) {
    if (!layout || !layout.manifestFile) return;
    try {
        const res = await fetch(layout.manifestFile, { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data.totalCards === 'number' && data.totalCards > 0) {
            layout.totalCards = data.totalCards;
        } else if (Array.isArray(data.files) && data.files.length > 0) {
            layout.totalCards = data.files.length;
        }
    } catch (_) {
        // silently ignore
    }
}

async function startLayout(layoutType) {
    currentLayoutKey = layoutType;
    currentLayout = layouts[layoutType];
    await loadDeckMeta(currentLayout);

    document.getElementById('home').style.display = 'none';
    document.getElementById('cards-screen').style.display = 'block';
    document.getElementById('cards-container').innerHTML = '';
    usedCards = []; // Очищаем список использованных карт

    // Telegram UI
    const t = getTg();
    if (t) {
        try {
            t.MainButton.hide();
            if (t.MainButton.setText) {
                t.MainButton.setText('Перейти к интерпретации');
            } else if (t.MainButton.setParams) {
                t.MainButton.setParams({ text: 'Перейти к интерпретации' });
            }
            t.MainButton.offClick(finishLayout);
            t.MainButton.offClick(sendResult);
            t.MainButton.onClick(finishLayout);
            t.BackButton.show();
            t.BackButton.onClick(goHome);
        } catch (_) {}
    }

    showDeck();
    showOnboardingOnce();
}

function showDeck() {
    const container = document.getElementById('cards-container');
    container.innerHTML = `
        <div class="top-bar">
            ${getTg() ? '' : '<button id="back-home-btn" onclick="goHome()">Назад</button>'}
            <div class="layout-header">
                <h2>${currentLayout.title}</h2>
                <p>${currentLayout.description}</p>
            </div>
        </div>
        <div id="deck" class="deck">
            <div class="card-back"></div>
        </div>
        <p id="draw-button" class="hidden" onclick="drawCard()">Нажмите, чтобы открыть карту</p>
        <p id="status" class="status">Выбрано 0 из ${currentLayout.cardCount}</p>
    `;

    const deck = document.getElementById('deck');
    deck.classList.add('shuffle');

    setTimeout(() => {
        deck.classList.remove('shuffle');
        document.getElementById('draw-button').classList.remove('hidden');
    }, 1500);
}

function updateStatus() {
    const status = document.getElementById('status');
    if (!status) return;
    status.textContent = `Выбрано ${usedCards.length} из ${currentLayout.cardCount}`;
}

function drawCard() {
    if (usedCards.length >= currentLayout.cardCount) return;

    const container = document.getElementById('cards-container');
    const deck = document.getElementById('deck');

    let cardNumber;
    let guard = 0;
    do {
        cardNumber = Math.floor(Math.random() * currentLayout.totalCards) + 1;
        guard += 1;
        if (guard > currentLayout.totalCards + 5) break; // защита от теоретической бесконечной петли
    } while (usedCards.includes(cardNumber));

    usedCards.push(cardNumber);

    const img = document.createElement('img');
    img.src = `${currentLayout.cardsFolder}card${cardNumber}.jpg`;
    img.alt = `Карта ${usedCards.length}`;
    img.className = 'card';
    img.style.display = 'none';
    img.loading = 'lazy';
    img.onerror = () => {
        img.src = 'https://via.placeholder.com/200x300?text=Карта+не+найдена';
        img.onerror = null;
    };
    img.addEventListener('click', () => openImageModal(img.src));

    container.appendChild(img);

    setTimeout(() => {
        deck.style.opacity = '0.4';
        img.style.display = 'block';
        img.classList.add('flip');
    }, 400);

    const t = getTg();
    if (t && t.HapticFeedback && typeof t.HapticFeedback.impactOccurred === 'function') {
        try { t.HapticFeedback.impactOccurred('light'); } catch (_) {}
    }

    if (usedCards.length <= currentLayout.questions.length) {
        const question = document.createElement('p');
        question.textContent = currentLayout.questions[usedCards.length - 1];
        question.className = 'question';
        container.appendChild(question);
    }

    updateStatus();

    if (usedCards.length >= currentLayout.cardCount) {
        const t2 = getTg();
        if (t2) {
            try {
                t2.MainButton.show();
            } catch (_) {}
        } else {
            const finishBtn = document.createElement('button');
            finishBtn.textContent = 'Перейти к интерпретации';
            finishBtn.onclick = finishLayout;
            container.appendChild(finishBtn);
        }
    }
}

function finishLayout() {
    document.getElementById('cards-screen').style.display = 'none';
    document.getElementById('interpretation-screen').style.display = 'block';
    const t = getTg();
    if (t) {
        try {
            if (t.MainButton.setText) {
                t.MainButton.setText('Отправить результат');
            } else if (t.MainButton.setParams) {
                t.MainButton.setParams({ text: 'Отправить результат' });
            }
            t.MainButton.offClick(finishLayout);
            t.MainButton.offClick(sendResult);
            t.MainButton.onClick(sendResult);
            t.MainButton.show();
        } catch (_) {}
    }
    // Обновить URL для шаринга
    if (window.history && window.history.replaceState && currentLayoutKey) {
        const url = buildShareLink();
        window.history.replaceState({}, '', url);
    }
}

function buildShareLink() {
    const base = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('l', currentLayoutKey);
    params.set('c', usedCards.join(','));
    return `${base}?${params.toString()}`;
}

function copyShareLink() {
    const link = buildShareLink();
    const t = getTg();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(() => {
            if (t && t.showPopup) {
                t.showPopup({ title: 'Готово', message: 'Ссылка скопирована' });
            } else {
                alert('Ссылка скопирована');
            }
        }).catch(() => {
            if (t && t.showPopup) {
                t.showPopup({ title: 'Ссылка', message: link });
            } else {
                prompt('Скопируйте ссылку:', link);
            }
        });
    } else {
        if (t && t.showPopup) {
            t.showPopup({ title: 'Ссылка', message: link });
        } else {
            prompt('Скопируйте ссылку:', link);
        }
    }
}

function sendResult() {
    const payload = {
        type: 'spread',
        layoutKey: currentLayoutKey,
        layoutTitle: currentLayout ? currentLayout.title : '',
        cards: usedCards
    };
    const t = getTg();
    if (t && typeof t.sendData === 'function') {
        try {
            t.sendData(JSON.stringify(payload));
            if (t.showPopup) {
                t.showPopup({ title: 'Отправлено', message: 'Результат отправлен боту' });
            }
        } catch (_) {
            if (t && t.showPopup) {
                t.showPopup({ title: 'Ошибка', message: 'Не удалось отправить результат' });
            } else {
                alert('Не удалось отправить результат');
            }
        }
    } else {
        alert('В Telegram можно отправить результат кнопкой внизу');
    }
}

function restoreFromParams(layoutKey, cards) {
    currentLayoutKey = layoutKey;
    currentLayout = layouts[layoutKey];
    document.getElementById('home').style.display = 'none';
    document.getElementById('cards-screen').style.display = 'block';
    const container = document.getElementById('cards-container');
    container.innerHTML = `
        <div class=\"top-bar\">${getTg() ? '' : '<button id=\"back-home-btn\" onclick=\"goHome()\">Назад</button>'}
            <div class=\"layout-header\">
                <h2>${currentLayout.title}</h2>
                <p>${currentLayout.description}</p>
            </div>
        </div>
        <p id=\"status\" class=\"status\">Выбрано ${cards.length} из ${currentLayout.cardCount}</p>
    `;

    usedCards = [];
    cards.forEach((num, idx) => {
        const img = document.createElement('img');
        img.src = `${currentLayout.cardsFolder}card${num}.jpg`;
        img.alt = `Карта ${idx + 1}`;
        img.className = 'card';
        img.style.display = 'block';
        img.loading = 'lazy';
        img.addEventListener('click', () => openImageModal(img.src));
        img.onerror = () => {
            img.src = 'https://via.placeholder.com/200x300?text=Карта+не+найдена';
            img.onerror = null;
        };
        container.appendChild(img);
        if (idx < currentLayout.questions.length) {
            const q = document.createElement('p');
            q.textContent = currentLayout.questions[idx];
            q.className = 'question';
            container.appendChild(q);
        }
        usedCards.push(num);
    });

    const t = getTg();
    if (t) {
        try {
            if (t.MainButton.setText) {
                t.MainButton.setText('Перейти к интерпретации');
            } else if (t.MainButton.setParams) {
                t.MainButton.setParams({ text: 'Перейти к интерпретации' });
            }
            t.MainButton.offClick(finishLayout);
            t.MainButton.offClick(sendResult);
            t.MainButton.onClick(finishLayout);
            t.BackButton.show();
            t.BackButton.onClick(goHome);
            t.MainButton.show();
        } catch (_) {}
    } else {
        const finishBtn = document.createElement('button');
        finishBtn.textContent = 'Перейти к интерпретации';
        finishBtn.onclick = finishLayout;
        container.appendChild(finishBtn);
    }
}

function openImageModal(src) {
    const modal = document.getElementById('image-modal');
    const img = document.getElementById('modal-image');
    if (!modal || !img) return;
    img.src = src;
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
}

function showOnboardingOnce() {
    try {
        const key = 'onboarding_v1';
        const wasShown = localStorage.getItem(key) === '1';
        if (wasShown) return;
        const overlay = document.getElementById('onboarding-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.setAttribute('aria-hidden', 'false');
        }
    } catch (_) {}
}

function dismissOnboarding() {
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
    }
    try { localStorage.setItem('onboarding_v1', '1'); } catch (_) {}
}