const app = document.getElementById("app");
const tg = window.Telegram.WebApp;

// Инициализация Telegram WebApp
tg.expand();
tg.enableClosingConfirmation();
tg.MainButton.text = "На главную";
tg.MainButton.hide();

// Данные раскладов
const layouts = [
  {
    id: "actual",
    name: "Актуальный вопрос",
    description: "Сформулируйте свой запрос, затем поочередно выберите 3 карты.",
    folder: "allegorii",
    questions: [
      "Что нужно сделать, чтобы ситуация решилась?",
      "Что мешает?",
      "Какие ресурсы помогут справиться?"
    ],
    interpretation: "Этот расклад помогает увидеть скрытые аспекты ситуации. Первая карта показывает действие, вторая — препятствие, третья — ваш ресурс. Обратите внимание на связь между картами."
  },
  {
    id: "relations",
    name: "Отношения",
    description: "Для анализа сложных межличностных отношений — вытяните 5 карт.",
    folder: "lichnye_granicy",
    questions: [
      "Что я делаю в отношениях?",
      "Что я хочу от отношений?",
      "Что мне нужно перестать делать?",
      "Что нужно начать делать?",
      "Что сейчас самое важное?"
    ],
    interpretation: "Пять карт показывают полную картину ваших отношений. Обратите внимание на контрасты между картами 1 и 3, а также 2 и 4. Последняя карта — ключ к гармонизации."
  },
  {
    id: "money1",
    name: "Деньги — качества и способности",
    description: "Понимание своих качеств для финансового роста — 4 карты.",
    folder: "delovaya_koloda",
    questions: [
      "Что способствует доходу?",
      "Что мешает деньгам?",
      "Какие качества развивать?",
      "Как увеличить поток?"
    ],
    interpretation: "Этот расклад показывает ваши сильные и слабые стороны в денежной сфере. Особое внимание уделите третьей карте — она указывает на потенциал для развития."
  },
  {
    id: "money2",
    name: "Деньги глазами денег",
    description: "Взгляд на себя со стороны финансовой энергии — 4 карты.",
    folder: "delovaya_koloda",
    questions: [
      "Что деньги думают обо мне?",
      "Почему деньги не приходят?",
      "Что привлекает деньги?",
      "Что бы сказали деньги?"
    ],
    interpretation: "Здесь вы видите ситуацию глазами денежной энергии. Вторая и четвертая карты часто содержат ключевое послание. Обратите внимание на эмоции, которые вызывают эти образы."
  },
  {
    id: "onecard",
    name: "Простой 1-карточный расклад",
    description: "Ответ на любой вопрос — 1 карта.",
    folder: "resursy",
    questions: ["Что говорит вам эта карта?"],
    interpretation: "Одна карта — прямое послание вашей интуиции. Доверьтесь первому впечатлению от образа. Что вы чувствуете? Что цепляет взгляд? Какие ассоциации возникают?"
  }
];

// Карты для каждой колоды (пример - замените реальными именами файлов)
const decks = {
  allegorii: ["card1.jpg", "card2.jpg", "card3.jpg", "card4.jpg", "card5.jpg"],
  lichnye_granicy: ["card1.jpg", "card2.jpg", "card3.jpg", "card4.jpg", "card5.jpg"],
  delovaya_koloda: ["card1.jpg", "card2.jpg", "card3.jpg", "card4.jpg", "card5.jpg"],
  resursy: ["card1.jpg", "card2.jpg", "card3.jpg", "card4.jpg", "card5.jpg"]
};

// Глобальные переменные состояния
let currentLayout = null;
let currentStep = 0;
let selectedCards = [];

// Перемешивание массива
function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Главная страница
function renderHome() {
  app.innerHTML = 
    <h1>МАК-расклады</h1>
    <p class="tip">Выберите расклад для работы с метафорическими картами</p>
  ;
  
  layouts.forEach(layout => {
    const button = document.createElement('button');
    button.textContent = layout.name;
    button.onclick = () => showLayoutDescription(layout);
    app.appendChild(button);
  });
  
  tg.MainButton.hide();
}

// Экран описания расклада
function showLayoutDescription(layout) {
  app.innerHTML = 
    <div class="description-block">
      <h2>${layout.name}</h2>
      <p>${layout.description}</p>
      <p>Количество карт: <strong>${layout.questions.length}</strong></p>
      <button id="start-layout">Начать расклад</button>
      <button onclick="renderHome()">← Назад</button>
    </div>
  ;
  
  document.getElementById('start-layout').addEventListener('click', () => startDrawing(layout));
  tg.MainButton.hide();
}

// Начало расклада
function startDrawing(layout) {
  currentLayout = layout;
  currentStep = 0;
  
  // Создаем перемешанную колоду без повторов
  selectedCards = shuffle([...decks[layout.folder]]).slice(0, layout.questions.length);
  renderStep();
}

// Отрисовка текущего шага
function renderStep() {
  app.innerHTML = 
    <div class="description-block">
      <h2>${currentLayout.name}</h2>
      <div class="step-indicator">Карта ${currentStep + 1} из ${currentLayout.questions.length}</div>
      <p><strong>${currentLayout.questions[currentStep]}</strong></p>
      <div class="card-block">
        <img src="assets/cards/${currentLayout.folder}/${selectedCards[currentStep]}" 
             alt="Карта ${currentStep + 1}" class="card-img">
      </div>
      <button id="next-card">${currentStep + 1 === currentLayout.questions.length ? 'Завершить' : 'Следующая карта →'}</button>
    </div>
  ;
  
  document.getElementById('next-card').addEventListener('click', nextStep);
  tg.MainButton.hide();
}

// Переход к следующему шагу
function nextStep() {
  currentStep++;
  
  if (currentStep < currentLayout.questions.length) {
    renderStep();
  } else {
    renderInterpretation();
  }
}

// Экран интерпретации
function renderInterpretation() {
  app.innerHTML = 
    <div class="description-block">
      <h2>${currentLayout.name}</h2>
      
      <div class="cards-summary">
        ${selectedCards.map((card, index) => 
          <div class="card-block">
            <p><strong>${currentLayout.questions[index]}</strong></p>
            <img src="assets/cards/${currentLayout.folder}/${card}" 
                 alt="Карта ${index + 1}" class="card-img">
          </div>
        ).join('')}
      </div>
      
      <p class="tip">⚠️ Сделайте скриншот — расклад не сохраняется автоматически</p>
      
      <div class="interpretation-section" style="animation-delay: 0.1s">
        <h3>Как интерпретировать:</h3>
        <p>${currentLayout.interpretation}</p>
      </div>
      
      <div class="interpretation-section" style="animation-delay: 0.3s">
        <h3>Вопросы для самоанализа:</h3>
        <ul>
          <li>Какие эмоции вызывают карты?</li>
          <li>Что объединяет все образы?</li>
          <li>Какое послание здесь для вас?</li>
          <li>Что вы не хотите замечать в этих картах?</li>
          <li>Какой первый шаг подсказывают карты?</li>
        </ul>
      </div>
      
      <button class="cta-button" onclick="tg.openTelegramLink('https://t.me/Netele_Zu')">
        ✨ Записаться на консультацию
      </button>
      
      <button onclick="renderHome()">← Вернуться на главную</button>
    </div>
  ;
  
  tg.MainButton.setText("На главную");
  tg.MainButton.onClick(renderHome);
  tg.MainButton.show();
}

// Обработка кнопки "Назад" в Telegram
tg.BackButton.onClick(() => {
  if (currentLayout) {
    if (currentStep > 0) {
      currentStep--;
      renderStep();
    } else {
      renderHome();
    }
  } else {
    renderHome();
  }
});

// Инициализация приложения
tg.ready();
renderHome();