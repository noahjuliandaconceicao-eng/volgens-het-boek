// Pomade-quiz: één vraag per keer, elk antwoord geeft punten aan de producten die erbij passen.
// Het product met de meeste punten is het advies. Pas hier de vragen, punten en uitleg aan.

const QUIZ_QUESTIONS = [
  {
    question: "Hoe lang is je haar?",
    hint: "Gemeten bovenop je hoofd, waar je het meeste stylet.",
    options: [
      { label: "Kort", detail: "Tot ongeveer 5 cm", points: { "heavy-duty-clay-wax": 2, "dirty-dust": 2, "hybrid-pomade": 1 } },
      { label: "Middellang", detail: "Tussen 5 en 12 cm", points: { "hybrid-pomade": 2, "slick-pomade": 2, "heavy-duty-clay-wax": 1 } },
      { label: "Lang", detail: "Langer dan 12 cm", points: { "slick-pomade": 2, "hybrid-pomade": 1, "xplosive-curls": 1 } },
      { label: "Krullen of slag", detail: "Mijn haar krult van zichzelf", points: { "xplosive-curls": 3 } },
    ],
  },
  {
    question: "Welke look wil je?",
    hint: "Kies wat het dichtst bij je ideale kapsel komt.",
    options: [
      { label: "Strak en glad", detail: "Slick back of een nette zijscheiding", points: { "slick-pomade": 3, "hybrid-pomade": 2 } },
      { label: "Getextureerd", detail: "Losjes, met beweging en een beetje messy", points: { "heavy-duty-clay-wax": 3, "dirty-dust": 2 } },
      { label: "Volume", detail: "Meer lift en een voller kapsel", points: { "dirty-dust": 3, "heavy-duty-clay-wax": 1 } },
      { label: "Gedefinieerde krullen", detail: "Krullen die mooi vallen zonder pluis", points: { "xplosive-curls": 3 } },
    ],
  },
  {
    question: "Hoe is je haar?",
    hint: "Voel een paar haren tussen je vingers.",
    options: [
      { label: "Dun en fijn", detail: "Valt snel plat", points: { "dirty-dust": 2, "slick-pomade": 1, "xplosive-curls": 1 } },
      { label: "Normaal", detail: "Niet te dun, niet te zwaar", points: { "hybrid-pomade": 1, "slick-pomade": 1, "heavy-duty-clay-wax": 1 } },
      { label: "Dik en zwaar", detail: "Veel haar dat moeilijk in model blijft", points: { "heavy-duty-clay-wax": 2, "hybrid-pomade": 2 } },
    ],
  },
  {
    question: "Hoeveel glans wil je?",
    hint: "Glans geeft een klassieke look, mat oogt natuurlijker.",
    options: [
      { label: "Hoge glans", detail: "Klassiek en opvallend", points: { "slick-pomade": 3, "hybrid-pomade": 1 } },
      { label: "Natuurlijke glans", detail: "Verzorgd, maar niet nat", points: { "hybrid-pomade": 2, "xplosive-curls": 2 } },
      { label: "Mat", detail: "Alsof er niets in zit", points: { "heavy-duty-clay-wax": 2, "dirty-dust": 2 } },
    ],
  },
  {
    question: "Hoeveel houvast heb je nodig?",
    hint: "Denk aan een gewone dag, van de ochtend tot de avond.",
    options: [
      { label: "Licht", detail: "Flexibel, je kunt het steeds opnieuw stylen", points: { "xplosive-curls": 2, "dirty-dust": 2 } },
      { label: "Medium", detail: "Blijft zitten, maar beweegt mee", points: { "slick-pomade": 2, "hybrid-pomade": 1, "dirty-dust": 1 } },
      { label: "Sterk", detail: "Zit de hele dag muurvast", points: { "heavy-duty-clay-wax": 3, "hybrid-pomade": 2 } },
    ],
  },
];

// Houvast en glans op een schaal van 1 tot 5, en waarom het product bij je past.
const QUIZ_PROFILES = {
  "hybrid-pomade": {
    hold: 4, shine: 4,
    why: "Je zoekt een strakke look die de hele dag blijft zitten, met een verzorgde glans. Hybrid Pomade combineert de stevigheid van een wax met de glans van een pomade.",
  },
  "slick-pomade": {
    hold: 3, shine: 5,
    why: "Voor een klassieke slick back of nette scheiding wil je glans en een kam die er soepel doorheen gaat. Slick Pomade geeft precies dat, en blijft de hele dag in model.",
  },
  "heavy-duty-clay-wax": {
    hold: 5, shine: 1,
    why: "Je wilt textuur en een look die niet inzakt, zonder glans. Heavy Duty Clay Wax geeft stevige grip en een matte afwerking, ook in dik of eigenwijs haar.",
  },
  "dirty-dust": {
    hold: 2, shine: 1,
    why: "Je haar heeft vooral volume en lift nodig. Dirty Dust is licht, maakt je haar voller en laat geen glans of zwaar gevoel achter.",
  },
  "xplosive-curls": {
    hold: 2, shine: 3,
    why: "Je krullen hoeven niet in model geduwd te worden, maar verdienen wel definitie. Xplosive Curls houdt ze in vorm en tegen pluis, met een natuurlijke glans.",
  },
};

const quizSection = document.querySelector(".quiz");
const quizQuestion = document.querySelector(".quiz-question");
const quizHint = document.querySelector(".quiz-hint");
const quizOptions = document.querySelector(".quiz-options");
const quizStepNow = document.querySelector(".quiz-step-now");
const quizStepTotal = document.querySelector(".quiz-step-total");
const quizProgress = document.querySelector(".quiz-progress span");
const quizBack = document.querySelector(".quiz-back");
const quizResult = document.querySelector(".quiz-result");

const pad = (number) => String(number).padStart(2, "0");
const quizAnswers = [];
let quizBusy = false; // voorkomt dat een dubbele klik een vraag overslaat

function scrollToQuiz(section) {
  const top = section.getBoundingClientRect().top + window.scrollY - 40;
  window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
}

function fadeInQuiz(element) {
  if (!reduceMotion) {
    element.animate(
      [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }],
      { duration: 450, easing: "cubic-bezier(.33, 1, .68, 1)" }
    );
  }
}

function showQuestion(index, moveFocus) {
  const step = QUIZ_QUESTIONS[index];

  quizStepNow.textContent = pad(index + 1);
  quizStepTotal.textContent = `/ ${pad(QUIZ_QUESTIONS.length)}`;
  quizProgress.style.transform = `scaleX(${(index + 1) / QUIZ_QUESTIONS.length})`;
  quizQuestion.textContent = step.question;
  quizHint.textContent = step.hint;
  quizBack.hidden = index === 0;

  quizOptions.innerHTML = step.options
    .map(
      (option, optionIndex) => `<li>
        <button class="quiz-option${quizAnswers[index] === optionIndex ? " is-chosen" : ""}" type="button" data-option="${optionIndex}">
          <span class="quiz-option-number">${pad(optionIndex + 1)}</span>
          <span class="quiz-option-label">${escapeHtml(option.label)}<small>${escapeHtml(option.detail)}</small></span>
          <svg viewBox="0 0 28 14" aria-hidden="true"><path d="M1 7h25M20 1l6 6-6 6"/></svg>
        </button>
      </li>`
    )
    .join("");

  fadeInQuiz(quizSection.querySelector(".quiz-panel"));
  if (moveFocus) quizQuestion.focus({ preventScroll: true });
}

function getScores() {
  const scores = Object.fromEntries(Object.keys(QUIZ_PROFILES).map((slug) => [slug, 0]));
  quizAnswers.forEach((optionIndex, questionIndex) => {
    const { points } = QUIZ_QUESTIONS[questionIndex].options[optionIndex];
    Object.entries(points).forEach(([slug, value]) => { scores[slug] += value; });
  });
  // Bij gelijke stand wint de volgorde in QUIZ_PROFILES.
  return Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([slug]) => slug);
}

function meterHtml(label, value, low, high) {
  const dots = Array.from({ length: 5 }, (_, i) => `<i${i < value ? ' class="is-on"' : ""}></i>`).join("");
  return `<div class="quiz-meter">
    <dt>${label}</dt>
    <dd><span class="quiz-dots" role="img" aria-label="${value} van 5">${dots}</span><span class="quiz-meter-scale">${low} — ${high}</span></dd>
  </div>`;
}

function showResult() {
  const [bestSlug, runnerUpSlug] = getScores();
  const product = findProduct(bestSlug);
  const runnerUp = findProduct(runnerUpSlug);
  const profile = QUIZ_PROFILES[bestSlug];
  const photo = quizResult.querySelector(".quiz-result-photo img");

  photo.src = product.scene;
  photo.alt = product.name;
  quizResult.querySelector(".quiz-result-name").textContent = product.name;
  quizResult.querySelector(".quiz-result-why").textContent = profile.why;
  quizResult.querySelector(".quiz-meters").innerHTML =
    meterHtml("Houvast", profile.hold, "licht", "sterk") + meterHtml("Glans", profile.shine, "mat", "hoog");
  quizResult.querySelector(".quiz-result-price").textContent = formatPrice(product.price);
  quizResult.querySelector(".quiz-result-meta").textContent = `${product.label} — ${product.size}`;
  quizResult.querySelector(".quiz-result-add").dataset.product = product.slug;
  quizResult.querySelector(".quiz-result-link").href = `product.html?p=${product.slug}`;
  quizResult.querySelector(".quiz-runner-up").innerHTML =
    `Twijfel je nog? Ook <a href="product.html?p=${runnerUp.slug}">${escapeHtml(runnerUp.name)}</a> past goed bij jouw antwoorden.`;

  quizSection.hidden = true;
  quizResult.hidden = false;
  scrollToQuiz(quizResult);
  fadeInQuiz(quizResult.querySelector(".quiz-result-grid"));
  quizResult.querySelector(".quiz-result-name").focus({ preventScroll: true });
  if (window.ScrollTrigger) ScrollTrigger.refresh();
}

quizOptions.addEventListener("click", (event) => {
  const button = event.target.closest(".quiz-option");
  if (!button || quizBusy) return;
  quizBusy = true;

  const index = Number(quizStepNow.textContent) - 1;
  quizAnswers[index] = Number(button.dataset.option);
  quizAnswers.length = index + 1; // een eerder antwoord aanpassen wist de antwoorden daarna

  quizOptions.querySelectorAll(".quiz-option").forEach((option) => option.classList.toggle("is-chosen", option === button));
  // Even laten zien welk antwoord gekozen is voordat de volgende vraag komt.
  setTimeout(() => {
    if (index + 1 < QUIZ_QUESTIONS.length) showQuestion(index + 1, true);
    else showResult();
    quizBusy = false;
  }, reduceMotion ? 0 : 260);
});

quizBack.addEventListener("click", () => {
  showQuestion(Number(quizStepNow.textContent) - 2, true);
});

quizResult.querySelector(".quiz-restart").addEventListener("click", () => {
  quizAnswers.length = 0;
  quizResult.hidden = true;
  quizSection.hidden = false;
  showQuestion(0, true);
  scrollToQuiz(quizSection);
  if (window.ScrollTrigger) ScrollTrigger.refresh();
});

showQuestion(0, false);
