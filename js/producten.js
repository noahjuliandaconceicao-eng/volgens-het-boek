// Productenpagina: filtert de kaarten, ook via de link producten.html?categorie=haar.
const shopProducts = document.querySelector(".shop-products");
const shopCards = [...document.querySelectorAll(".shop-grid .product")];
const shopTabs = [...document.querySelectorAll(".shop-filter .tabs button")];
const shopCount = document.querySelector(".shop-count");

function showCategory(activeTab) {
  const category = activeTab.dataset.filter;
  let visibleCount = 0;

  shopTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab === activeTab);
    tab.setAttribute("aria-pressed", tab === activeTab);
  });

  shopCards.forEach((card) => {
    const isVisible = category === "alle" || card.dataset.category.split(" ").includes(category);
    card.hidden = !isVisible;
    if (isVisible) {
      visibleCount += 1;
      card.querySelector(".product-number").textContent = String(visibleCount).padStart(2, "0");
    }
  });

  shopCount.textContent = `${visibleCount} ${visibleCount === 1 ? "product" : "producten"}`;
}

// De pagina is na het filteren korter of langer, dus de banner onderaan moet opnieuw gemeten worden.
function remeasurePage() {
  if (!reduceMotion && window.gsap && window.ScrollTrigger) ScrollTrigger.refresh();
}

shopTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    if (tab.classList.contains("is-active")) return;

    showCategory(tab);

    const sectionTop = shopProducts.getBoundingClientRect().top + window.scrollY;
    if (window.scrollY > sectionTop) window.scrollTo(0, sectionTop);
    remeasurePage();

    if (!reduceMotion) {
      shopCards
        .filter((card) => !card.hidden)
        .forEach((card) => card.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: "ease" }));
    }
  });
});

const startCategory = new URLSearchParams(window.location.search).get("categorie");
const startTab = shopTabs.find((tab) => tab.dataset.filter === startCategory);
if (startTab) {
  showCategory(startTab);
  remeasurePage();
}
