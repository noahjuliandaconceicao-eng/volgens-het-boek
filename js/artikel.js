// Artikelpagina: toont het artikel uit de link, bijvoorbeeld artikel.html?a=zo-breng-je-pomade-aan.
const article = findArticle(new URLSearchParams(window.location.search).get("a"));
const articleRoot = document.querySelector(".article");

if (article) {
  document.title = `${article.title} ${article.gold} | NoChic`;
  document.querySelector(".article-kicker").textContent = article.category;
  document.querySelector(".page-title").innerHTML = `${escapeHtml(article.title)} <span>${escapeHtml(article.gold)}</span>`;
  document.querySelector(".page-lead").textContent = article.intro;
  const photo = document.querySelector(".article-photo img");
  photo.src = article.image;
  photo.alt = article.alt;
  document.querySelector(".article-body").innerHTML = article.blocks
    .map(([tag, text]) => `<${tag}>${escapeHtml(text)}</${tag}>`)
    .join("");
  document.querySelector(".post-grid").innerHTML = ARTICLES.filter((other) => other !== article)
    .map(articleCardHtml)
    .join("");
} else {
  document.querySelector(".page-title").innerHTML = "Artikel <span>niet gevonden.</span>";
  document.querySelector(".page-lead").textContent = "Dit artikel bestaat niet (meer).";
  articleRoot.hidden = true;
  document.querySelector(".article-more").hidden = true;
}
