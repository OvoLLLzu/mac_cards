const layouts = {
    actual: {
        title: "Актуальный вопрос",
        description: "Сформулируйте свой запрос, далее поочередно выберите 3 карты.",
        cardsFolder: 'assets/cards/allegorii/',
        cardCount: 3,
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
        questions: []
    }
};

let currentLayout = null;
let currentCardIndex = 0;

function startLayout(layoutType) {
    currentLayout = layouts[layoutType];
    document.getElementById('home').style.display = 'none';
    document.getElementById('cards-screen').style.display = 'block';
    document.getElementById('cards-container').innerHTML = '';
    currentCardIndex = 0;

    // Показываем колоду и запускаем анимацию
    showDeck();
}

function showDeck() {
    const container = document.getElementById('cards-container');
    container.innerHTML = `
        <div id="deck" class="deck">
            <div class="card-back"></div>
        </div>
        <p id="draw-button" class="hidden" onclick="drawCard()">Нажмите, чтобы открыть карту</p>
    `;

    const deck = document.getElementById('deck');
    deck.classList.add('shuffle');

    setTimeout(() => {
        deck.classList.remove('shuffle');
        document.getElementById('draw-button').classList.remove('hidden');
    }, 3000);
}

function drawCard() {
    if (currentCardIndex >= currentLayout.cardCount) return;

    const container = document.getElementById('cards-container');
    const deck = document.getElementById('deck');

    const img = document.createElement('img');
    img.src = `${currentLayout.cardsFolder}card${currentCardIndex + 1}.jpg`;
    img.alt = `Карта ${currentCardIndex + 1}`;
    img.className = 'card';
    img.style.display = 'none';

    container.appendChild(img);

    setTimeout(() => {
        deck.style.opacity = '0.4';
        img.style.display = 'block';
        img.classList.add('flip');
    }, 500);

    if (currentCardIndex < currentLayout.questions.length) {
        const question = document.createElement('p');
        question.textContent = currentLayout.questions[currentCardIndex];
        container.appendChild(question);
    }

    currentCardIndex++;

    if (currentCardIndex >= currentLayout.cardCount) {
        const finishBtn = document.createElement('button');
        finishBtn.textContent = 'Перейти к интерпретации';
        finishBtn.onclick = finishLayout;
        container.appendChild(finishBtn);
    }
}

function finishLayout() {
    document.getElementById('cards-screen').style.display = 'none';
    document.getElementById('interpretation-screen').style.display = 'block';
}