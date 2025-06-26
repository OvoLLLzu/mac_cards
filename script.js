// Список раскладов
const layouts = {
    actual: {
        title: "Актуальный вопрос",
        description: "Сформулируйте свой запрос, далее поочередно выберите 3 карты.",
        cardsFolder: 'assets/cards/allegorii/',
        cardCount: 3,
        totalCards: 101,
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
let usedCards = [];

// Запуск расклада
function startLayout(layoutType) {
    currentLayout = layouts[layoutType];
    document.getElementById('home').style.display = 'none';
    document.getElementById('cards-screen').style.display = 'block';
    document.getElementById('cards-container').innerHTML = '';
    usedCards = [];

    showDeck();
}

// Анимация колоды
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

// Открытие карты
function drawCard() {
    if (usedCards.length >= currentLayout.cardCount) return;

    const container = document.getElementById('cards-container');
    const deck = document.getElementById('deck');

    let cardNumber;
    do {
        cardNumber = Math.floor(Math.random() * currentLayout.totalCards) + 1;
    } while (usedCards.includes(cardNumber));

    usedCards.push(cardNumber);

    const img = document.createElement('img');
    img.src = `${currentLayout.cardsFolder}card${cardNumber}.jpg`;
    img.alt = `Карта ${usedCards.length}`;
    img.className = 'card';
    img.style.display = 'none';
    img.onerror = () => {
        img.src = 'https://via.placeholder.com/200x300?text=Карта+не+найдена';
    };

    container.appendChild(img);

    // Воспроизведение звука
    const flipSound = document.getElementById('card-flip-sound');
    flipSound.currentTime = 0;
    flipSound.play();

    setTimeout(() => {
        deck.style.opacity = '0.4';
        img.style.display = 'block';
        img.classList.add('flip');
    }, 500);

    if (usedCards.length <= currentLayout.questions.length) {
        const question = document.createElement('p');
        question.textContent = currentLayout.questions[usedCards.length - 1];
        container.appendChild(question);
    }

    if (usedCards.length >= currentLayout.cardCount) {
        const finishBtn = document.createElement('button');
        finishBtn.textContent = 'Перейти к интерпретации';
        finishBtn.onclick = finishLayout;
        container.appendChild(finishBtn);
    }
}

// Завершить расклад
function finishLayout() {
    document.getElementById('cards-screen').style.display = 'none';
    document.getElementById('interpretation-screen').style.display = 'block';
}

// Сохранить в PDF
function saveAsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Ваш расклад:", 10, 10);

    for (let i = 0; i < usedCards.length; i++) {
        doc.setFontSize(12);
        doc.text(`Карта ${i + 1}: ${currentLayout.questions[i]}`, 10, 20 + i * 10);
    }

    doc.save("расклад.pdf");
}