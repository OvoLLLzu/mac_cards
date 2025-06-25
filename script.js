const layouts = {
    actual: {
        title: "Актуальный вопрос",
        description: "Сформулируйте свой запрос, далее поочередно выберите 3 карты.",
        cardsFolder: 'assets/cards/allegorii/',  // ✅ Правильный путь
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
        cardsFolder: 'assets/cards/lichnye_granicy/',  // ✅ Правильный путь
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
        cardsFolder: 'assets/cards/delovaya_koloda/',  // ✅ Правильный путь
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
        cardsFolder: 'assets/cards/delovaya_koloda/',  // ✅ Правильный путь
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
        cardsFolder: 'assets/cards/resursy/',  // ✅ Правильный путь
        cardCount: 1,
        questions: []
    }
};

let currentLayout = null;

function startLayout(layoutType) {
    currentLayout = layouts[layoutType];
    document.getElementById('home').style.display = 'none';
    document.getElementById('layout-screen').style.display = 'block';
    document.getElementById('layout-title').textContent = currentLayout.title;
    document.getElementById('layout-description').textContent = currentLayout.description;
}

function startDrawing() {
    document.getElementById('layout-screen').style.display = 'none';
    document.getElementById('cards-screen').style.display = 'block';
    document.getElementById('cards-container').innerHTML = '';
    
    // Генерируем имена файлов
    const cardFiles = [];
    for (let i = 0; i < currentLayout.cardCount; i++) {
        const filename = `card${i + 1}.jpg`;
        cardFiles.push(filename);
    }
    
    // Создаём карточки с картинками
    cardFiles.forEach((file, index) => {
        setTimeout(() => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.innerHTML = `
                <p>Карта ${index + 1}:</p>
                <img 
                    src="${currentLayout.cardsFolder}${file}" 
                    alt="Карта ${index + 1}" 
                    style="width: 100%; max-height: 200px;"
                    onerror="this.src='assets/images/card-placeholder.png'; this.onerror=null;"
                />
                <p>${currentLayout.questions[index]}</p>
            `;
            document.getElementById('cards-container').appendChild(cardElement);
        }, index * 1000);
    });
}

function finishLayout() {
    document.getElementById('cards-screen').style.display = 'none';
    document.getElementById('interpretation-screen').style.display = 'block';
}