// Winkelmandpagina: toont de producten uit de mand en past aantallen aan.
const cartList = document.querySelector(".cart-list");
const cartEmpty = document.querySelector(".cart-empty");
const cartFilled = document.querySelector(".cart-filled");

function renderCart() {
  const items = readCart();
  cartEmpty.hidden = items.length > 0;
  cartFilled.hidden = items.length === 0;

  cartList.innerHTML = items
    .map(({ slug, qty }) => {
      const item = findProduct(slug);
      const name = escapeHtml(item.name);
      return `<li class="cart-row">
        <a class="cart-thumb" href="product.html?p=${slug}"><img src="${escapeHtml(item.image)}" alt=""></a>
        <div class="cart-row-text">
          <h2><a href="product.html?p=${slug}">${name}</a></h2>
          <p>${item.label} — ${item.size}</p>
          <button class="cart-remove" type="button" data-remove="${slug}" aria-label="${name} verwijderen">Verwijderen</button>
        </div>
        <div class="qty" role="group" aria-label="Aantal ${name}">
          <button type="button" data-qty="${slug}" data-change="-1" aria-label="Eén minder">−</button>
          <span>${qty}</span>
          <button type="button" data-qty="${slug}" data-change="1" aria-label="Eén meer">+</button>
        </div>
        <p class="cart-row-price">${item.price === null ? formatPrice(null) : formatPrice(item.price * qty)}</p>
      </li>`;
    })
    .join("");

  const count = items.reduce((total, item) => total + item.qty, 0);
  const allPriced = items.every(({ slug }) => findProduct(slug).price !== null);
  const total = items.reduce((sum, { slug, qty }) => sum + (findProduct(slug).price || 0) * qty, 0);
  document.querySelector(".cart-summary-count").textContent = `${count} ${count === 1 ? "product" : "producten"}`;
  document.querySelector(".cart-summary-total").textContent = formatPrice(allPriced ? total : null);
}

cartList.addEventListener("click", (event) => {
  const remove = event.target.closest("[data-remove]");
  if (remove) setCartQty(remove.dataset.remove, 0);

  const step = event.target.closest("[data-qty]");
  if (step) {
    const item = readCart().find((entry) => entry.slug === step.dataset.qty);
    setCartQty(step.dataset.qty, item.qty + Number(step.dataset.change));
  }
});

cartListeners.push(renderCart);
renderCart();
