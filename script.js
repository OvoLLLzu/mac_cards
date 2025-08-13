// Список раскладов с указанием:
// - количество карт в колоде (totalCards)
// - сколько карт нужно вытянуть (cardCount)
// - путь к картам
const layouts = {
    actual: {
        title: "Актуальный вопрос",
        description: "Сформулируйте свой запрос, далее поочередно выберите 3 карты.",
        cardsFolder: 'assets/cards/allegorii/',
        cardCount: 3,
        totalCards: 101, // Всего карт в колоде
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
        cardCount: 1,
        totalCards: 99,
        questions: []
    }
};

let currentLayout = null;
let usedCards = []; // Использованные карты в этом раскладе

// Telegram WebApp integration helpers
const tg = (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;

function applyTelegramTheme() {
    if (!tg) return;
    const theme = tg.themeParams || {};
    if (theme.bg_color) {
        document.body.style.backgroundColor = theme.bg_color;
    }
    if (theme.text_color) {
        document.body.style.color = theme.text_color;
    }
}

function initTelegram() {
    if (!tg) return;
    try {
        tg.ready();
        tg.expand();
        applyTelegramTheme();
        tg.onEvent('themeChanged', applyTelegramTheme);
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
    // Telegram UI
    if (tg) {
        try {
            tg.MainButton.hide();
            tg.BackButton.hide();
            tg.offEvent('mainButtonClicked', finishLayout);
            tg.BackButton.offClick(goHome);
        } catch (_) {}
    }
}

function startLayout(layoutType) {
    currentLayout = layouts[layoutType];
    document.getElementById('home').style.display = 'none';
    document.getElementById('cards-screen').style.display = 'block';
    document.getElementById('cards-container').innerHTML = '';
    usedCards = []; // Очищаем список использованных карт

    // Telegram UI
    if (tg) {
        try {
            tg.MainButton.hide();
            tg.MainButton.setParams({ text: 'Перейти к интерпретации' });
            tg.offEvent('mainButtonClicked', finishLayout);
            tg.onEvent('mainButtonClicked', finishLayout);
            tg.BackButton.show();
            tg.BackButton.onClick(goHome);
        } catch (_) {}
    }

    showDeck();
}

function showDeck() {
    const container = document.getElementById('cards-container');
    container.innerHTML = `
        <div class="top-bar">
            ${tg ? '' : '<button id="back-home-btn" onclick="goHome()">Назад</button>'}
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

    container.appendChild(img);

    setTimeout(() => {
        deck.style.opacity = '0.4';
        img.style.display = 'block';
        img.classList.add('flip');
    }, 400);

    if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred === 'function') {
        try { tg.HapticFeedback.impactOccurred('light'); } catch (_) {}
    }

    if (usedCards.length <= currentLayout.questions.length) {
        const question = document.createElement('p');
        question.textContent = currentLayout.questions[usedCards.length - 1];
        question.className = 'question';
        container.appendChild(question);
    }

    updateStatus();

    if (usedCards.length >= currentLayout.cardCount) {
        if (tg) {
            try {
                tg.MainButton.show();
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
    if (tg) {
        try { tg.MainButton.hide(); } catch (_) {}
    }
}