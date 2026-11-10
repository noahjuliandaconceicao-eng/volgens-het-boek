// Winkelmand: bewaart de producten in de browser en werkt het aantal in de header bij.
const CART_KEY = "nochic-mand";
const cartListeners = [];

function readCart() {
  try {
    const items = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    return items.filter((item) => findProduct(item.slug) && item.qty > 0);
  } catch {
    return [];
  }
}

function writeCart(items) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // Opslag geblokkeerd: de mand werkt dan alleen niet over pagina's heen.
  }
  showCartCount(items);
  cartListeners.forEach((listener) => listener());
}

function showCartCount(items = readCart()) {
  const count = items.reduce((total, item) => total + item.qty, 0);
  document.querySelectorAll(".cart-count").forEach((element) => {
    element.textContent = count;
  });
}

function addToCart(slug, qty = 1) {
  const items = readCart();
  const existing = items.find((item) => item.slug === slug);
  if (existing) existing.qty += qty;
  else items.push({ slug, qty });
  writeCart(items);
}

function setCartQty(slug, qty) {
  const items = readCart();
  const item = items.find((entry) => entry.slug === slug);
  if (!item) return;
  item.qty = qty;
  writeCart(items.filter((entry) => entry.qty > 0));
}

// Elke knop met data-product voegt toe. Werkt ook voor kaarten die later op de pagina komen.
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product]");
  if (!button) return;

  const qtyInput = document.querySelector(button.dataset.qtyFrom || null);
  addToCart(button.dataset.product, qtyInput ? Number(qtyInput.value) || 1 : 1);

  const label = button.firstChild;
  if (!button.dataset.label) button.dataset.label = label.nodeValue;
  label.nodeValue = "Toegevoegd ";
  clearTimeout(button.labelTimer);
  button.labelTimer = setTimeout(() => {
    label.nodeValue = button.dataset.label;
  }, 1400);
});

// Prijzen op kaarten die vast in de HTML staan, komen ook uit de productlijst.
document.querySelectorAll(".product").forEach((card) => {
  const button = card.querySelector("[data-product]");
  const product = button && findProduct(button.dataset.product);
  if (product) card.querySelector(".product-price").textContent = formatPrice(product.price);
});

showCartCount();
