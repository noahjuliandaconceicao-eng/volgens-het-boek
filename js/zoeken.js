// Zoeken: doorzoekt de producten en de blogartikelen terwijl je typt.
const searchInput = document.querySelector("#zoekterm");
const searchStatus = document.querySelector(".search-status");
const searchProducts = document.querySelector(".search-products");
const searchPosts = document.querySelector(".search-posts");

const matches = (values, term) => values.join(" ").toLowerCase().includes(term);

function runSearch() {
  const term = searchInput.value.trim().toLowerCase();
  const products = term
    ? PRODUCTS.filter((product) => matches([product.name, product.label, ...product.categories, product.description], term))
    : [];
  const posts = term
    ? ARTICLES.filter((post) => matches([post.title, post.gold, post.category, post.intro], term))
    : [];

  searchProducts.innerHTML = products.map((product, index) => productCardHtml(product, index + 1)).join("");
  searchPosts.innerHTML = posts.map(articleCardHtml).join("");
  searchProducts.hidden = !products.length;
  searchPosts.hidden = !posts.length;

  const total = products.length + posts.length;
  if (!term) searchStatus.textContent = "Typ om te zoeken in producten en artikelen.";
  else if (!total) searchStatus.textContent = `Geen resultaten voor “${searchInput.value.trim()}”.`;
  else searchStatus.textContent = `${total} ${total === 1 ? "resultaat" : "resultaten"} voor “${searchInput.value.trim()}”.`;
}

searchInput.addEventListener("input", runSearch);
document.querySelector(".search-form").addEventListener("submit", (event) => event.preventDefault());
document.querySelectorAll("[data-term]").forEach((chip) => {
  chip.addEventListener("click", () => {
    searchInput.value = chip.dataset.term;
    runSearch();
  });
});

searchInput.value = new URLSearchParams(window.location.search).get("q") || "";
runSearch();
