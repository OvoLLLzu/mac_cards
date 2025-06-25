
const app = document.getElementById("app");

const layouts = [
  {
    id: "actual",
    name: "Актуальный вопрос",
    description: "Сформулируйте свой запрос, далее поочередно выберите 3 карты.",
    folder: "allegorii",
    questions: [
      "Что нужно сделать, чтобы ситуация решилась?",
      "Что мешает?",
      "Какие ресурсы помогут справиться?"
    ]
  },
  {
    id: "relations",
    name: "Отношения",
    description: "Сложные межличностные отношения — вытяните 5 карт.",
    folder: "lichnye_granicy",
    questions: [
      "Что я делаю в отношениях?",
      "Что я хочу от отношений?",
      "Что мне нужно перестать делать?",
      "Что нужно начать делать?",
      "Что сейчас самое важное?"
    ]
  },
  {
    id: "money1",
    name: "Деньги — качества и способности",
    description: "Понимание своих качеств — 4 карты.",
    folder: "delovaya_koloda",
    questions: [
      "Что способствует доходу?",
      "Что мешает деньгам?",
      "Какие качества развивать?",
      "Как увеличить поток?"
    ]
  },
  {
    id: "money2",
    name: "Деньги глазами денег",
    description: "Взгляд на себя со стороны — 4 карты.",
    folder: "delovaya_koloda",
    questions: [
      "Что деньги думают обо мне?",
      "Почему деньги не приходят?",
      "Что привлекает деньги?",
      "Что бы сказали деньги?"
    ]
  },
  {
    id: "onecard",
    name: "Простой 1-карточный расклад",
    description: "Ответ на любой вопрос — 1 карта.",
    folder: "resursy",
    questions: ["Что говорит вам эта карта?"]
  }
];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function renderHome() {
  app.innerHTML = "<h2>Выберите расклад</h2>";
  layouts.forEach(l => {
    const btn = document.createElement("button");
    btn.textContent = l.name;
    btn.onclick = () => startLayout(l);
    btn.className = "layout-button";
    app.appendChild(btn);
  });
}

async function getImages(folder) {
  try {
    const res = await fetch(`assets/cards/${folder}`);
    const text = await res.text();
    const matches = [...text.matchAll(/href="([^"]+\.(jpg|png|jpeg))"/g)];
    return matches.map(m => m[1]);
  } catch (err) {
    console.error("Не удалось загрузить изображения", err);
    return [];
  }
}

function startLayout(layout) {
  app.innerHTML = `<h3>${layout.name}</h3><p>${layout.description}</p><div id="cards"></div>`;
  fetchImages(layout);
}

async function fetchImages(layout) {
  const cardsContainer = document.getElementById("cards");
  const files = await getImages(layout.folder);
  const selected = shuffle(files).slice(0, layout.questions.length);

  selected.forEach((file, index) => {
    const div = document.createElement("div");
    div.className = "card-block";
    div.innerHTML = `
      <p><strong>Вопрос:</strong> ${layout.questions[index]}</p>
      <img src="assets/cards/${layout.folder}/${file}" alt="card" class="card-img" />
    `;
    cardsContainer.appendChild(div);
  });

  renderOutro();
}

function renderOutro() {
  const box = document.createElement("div");
  box.innerHTML = `
    <p class="tip"><strong>Важно:</strong> сделайте скриншот — расклад не сохраняется.</p>
    <p class="interpret">
      Каждая карта — это образ, который говорит с вами. Обратите внимание:
      <ul>
        <li>Что первым бросилось в глаза?</li>
        <li>Какие эмоции и ассоциации появились?</li>
        <li>Кого вы видите на изображении? Как он себя чувствует?</li>
        <li>Что вы не хотите замечать на картинке?</li>
      </ul>
    </p>
    <p>Если вы хотите глубокую интерпретацию — пишите в Telegram: <a href="https://t.me/Netele_Zu">@Netele_Zu</a></p>
    <button onclick="renderHome()">🔁 Вернуться к выбору</button>
  `;
  app.appendChild(box);
}

renderHome();
