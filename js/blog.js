// Blog: toont alle artikelen uit artikelen-data.js.
document.querySelector(".post-grid").innerHTML = ARTICLES.map(articleCardHtml).join("");
