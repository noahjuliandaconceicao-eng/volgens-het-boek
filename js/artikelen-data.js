// Alle blogartikelen. Een nieuw artikel toevoegen is genoeg: het verschijnt vanzelf op de blog.
const ARTICLES = [
  {
    slug: "zo-breng-je-pomade-aan", category: "Styling", title: "Zo breng je pomade aan", gold: "in vier stappen",
    image: "foto's/Pomade.png", alt: "Een veeg pomade op een donkere ondergrond",
    intro: "De juiste hoeveelheid en een goede verdeling maken het verschil tussen strak en plakkerig.",
    blocks: [
      ["h2", "Begin met schoon haar"],
      ["p", "Was je haar en dep het droog met een handdoek. Licht vochtig haar laat zich makkelijker vormen, helemaal droog haar geeft juist meer grip. Probeer allebei en kijk wat bij jouw haar past."],
      ["h2", "Neem minder dan je denkt"],
      ["p", "Begin met een hoeveelheid ter grootte van een vingertop. Wrijf de pomade tussen je handen tot die warm en zacht is. Bijnemen kan altijd, weghalen niet."],
      ["h2", "Werk van achter naar voren"],
      ["p", "Verdeel het product eerst door het achterhoofd en de zijkanten en eindig bij de voorkant. Zo voorkom je dat er te veel product op de zichtbare plek terechtkomt."],
      ["h2", "Maak de vorm af met een kam"],
      ["p", "Trek met een kam de lijn die je wilt. Voor een zachtere look gebruik je alleen je vingers."],
    ],
  },
  {
    slug: "baardolie-in-drie-stappen", category: "Baardverzorging", title: "Baardolie gebruiken", gold: "in drie stappen",
    image: "foto's/oil.png", alt: "Amberkleurige olie in een glazen schaal tussen hout en bladeren",
    intro: "Baardolie werkt het best op een schone baard en met een paar druppels tegelijk.",
    blocks: [
      ["h2", "Apply with confidence"],
      ["p", "Doe een paar druppels in je handpalm en wrijf je handen tegen elkaar. Bij een korte baard is minder nodig dan bij een lange."],
      ["h2", "Absorb and protect"],
      ["p", "Masseer de olie van de wortels naar de punten en vergeet de huid onder je baard niet. Geef het even de tijd om in te trekken."],
      ["h2", "Layer with confidence"],
      ["p", "Kam of borstel je baard in model. Voelt je baard na een paar minuten nog droog, neem dan nog één druppel."],
    ],
  },
  {
    slug: "waarom-wij-nochic-begonnen", category: "Ons verhaal", title: "Waarom wij NoChic", gold: "begonnen zijn",
    image: "foto's/producten1.png", alt: "NoChic producten in het zonlicht",
    intro: "Nog een merk erbij? Nou, het was nodig.",
    blocks: [
      ["p", "De meeste waxen zijn lastig uit te wassen. Wij liepen daar zelf elke ochtend tegenaan — en hebben het dan maar zelf opgelost."],
      ["h2", "Geen compromis"],
      ["p", "Geen compromis tussen een stevige hold en een schone hoofdhuid. Dat was het uitgangspunt, en dat is het nog steeds."],
      ["h2", "Inspired by nature, made for men"],
      ["p", "Krachtige formules, geïnspireerd door de natuur en gemaakt voor mannen die weten wat ze willen."],
    ],
  },
];

const findArticle = (slug) => ARTICLES.find((article) => article.slug === slug);

function articleCardHtml(article) {
  return `<article class="post-card">
    <a class="post-card-photo" href="artikel.html?a=${article.slug}"><img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.alt)}" loading="lazy"></a>
    <p class="post-card-category">${escapeHtml(article.category)}</p>
    <h2 class="post-card-title"><a href="artikel.html?a=${article.slug}">${escapeHtml(article.title)} ${escapeHtml(article.gold)}</a></h2>
    <p class="post-card-intro">${escapeHtml(article.intro)}</p>
    <a class="text-link" href="artikel.html?a=${article.slug}">Lees meer <svg viewBox="0 0 28 14" aria-hidden="true"><path d="M1 7h25M20 1l6 6-6 6"/></svg></a>
  </article>`;
}
