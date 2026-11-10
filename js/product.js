// Productpagina: toont het product uit de link, bijvoorbeeld product.html?p=hybrid-pomade.
const product = findProduct(new URLSearchParams(window.location.search).get("p"));
const productRoot = document.querySelector(".pdp");

if (product) {
  document.title = `${product.name} | NoChic`;
  document.querySelector(".pdp-crumb-name").textContent = product.name;
  document.querySelector(".pdp-tile img").src = product.image;
  document.querySelector(".pdp-tile img").alt = product.name;
  document.querySelector(".pdp-tile img").className = product.imageClass;
  document.querySelector(".pdp-scene img").src = product.scene;
  document.querySelector(".pdp-kicker").textContent = product.label;
  document.querySelector(".pdp-name").textContent = product.name;
  document.querySelector(".pdp-price").textContent = formatPrice(product.price);
  document.querySelector(".pdp-meta").textContent = product.size;
  document.querySelector(".pdp-description").textContent = product.description;
  document.querySelector(".pdp-add").dataset.product = product.slug;

  const related = PRODUCTS.filter(
    (other) => other !== product && other.categories.some((category) => product.categories.includes(category))
  ).slice(0, 3);
  const fallback = PRODUCTS.filter((other) => other !== product).slice(0, 3);
  document.querySelector(".pdp-related").innerHTML = (related.length ? related : fallback)
    .map((other, index) => productCardHtml(other, index + 1))
    .join("");

  const qty = document.querySelector("#pdp-qty");
  document.querySelectorAll(".qty-step").forEach((button) => {
    button.addEventListener("click", () => {
      qty.value = Math.max(1, Number(qty.value) + Number(button.dataset.step));
    });
  });
} else {
  document.title = "Product niet gevonden | NoChic";
  productRoot.hidden = true;
  document.querySelector(".pdp-more").hidden = true;
  document.querySelector(".pdp-missing").hidden = false;
}
