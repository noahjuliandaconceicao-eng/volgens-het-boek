// Alle producten op één plek. Vul hier de prijs in (bijvoorbeeld 19.95), dan klopt die overal op de site.
const PRODUCTS = [
  {
    slug: "hybrid-pomade", name: "Hybrid Pomade", categories: ["haar", "styling"], label: "Styling",
    size: "100 ml / 3.5 oz", price: null, imageClass: "img-hybrid",
    image: "foto's/hybrid_pomade1.png", hover: "foto's/hybrid_pomade3.png", scene: "foto's/hybrid_pomade4.png",
    description: "Ervaar de vaste kracht van Hybrid Pomade, die je haar tegelijk versterkt. Voor een strakke, glanzende look die de hele dag blijft zitten.",
  },
  {
    slug: "slick-pomade", name: "Slick Pomade", categories: ["haar", "styling"], label: "Styling",
    size: "100 ml / 3.5 oz", price: null, imageClass: "img-slick",
    image: "foto's/slick_pomade.png", hover: "foto's/slick_pomade1.png", scene: "foto's/slick_pomade2.png",
    description: "[Productomschrijving Slick Pomade]",
  },
  {
    slug: "xplosive-curls", name: "Xplosive Curls", categories: ["haar"], label: "Haarverzorging",
    size: "100 ml / 3.5 oz", price: null, imageClass: "img-curls", hoverClass: "hover-curls",
    image: "foto's/xplosive_curls1.png", hover: "foto's/Xplosive_curls2.png", scene: "foto's/Xplosive_curls2.png",
    description: "[Productomschrijving Xplosive Curls]",
  },
  {
    slug: "face-beard-oil", name: "Face & Beard Oil", categories: ["baard"], label: "Baardverzorging",
    size: "100 ml / 3.5 oz", price: null, imageClass: "img-oil", hoverClass: "hover-oil",
    image: "foto's/face&beard_oil1.png", hover: "foto's/face&beard_oil2.png", scene: "foto's/face&beard_oil2.png",
    description: "Ervaar de verzachtende kracht van amandelolie, die je huid en baard tegelijk verzorgt. Trekt snel in, voelt niet vet en laat een subtiele, houtige geur achter.",
  },
  {
    slug: "heavy-duty-clay-wax", name: "Heavy Duty Clay Wax", categories: ["haar", "styling"], label: "Styling",
    size: "100 ml / 3.5 oz", price: null, imageClass: "img-heavy",
    image: "foto's/heavy_duty_clay_wax1.png", hover: "foto's/heavy_duty_clay_wax2.png", scene: "foto's/heavy_duty_clay_wax2.png",
    description: "[Productomschrijving Heavy Duty Clay Wax]",
  },
  {
    slug: "dirty-dust", name: "Dirty Dust", categories: ["haar"], label: "Haarverzorging",
    size: "100 ml / 3.5 oz", price: null, imageClass: "img-dust",
    image: "foto's/dirty_dust1.png", hover: "foto's/Dirty_Dust2.png", scene: "foto's/Dirty_Dust2.png",
    description: "[Productomschrijving Dirty Dust]",
  },
];

const findProduct = (slug) => PRODUCTS.find((product) => product.slug === slug);
const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const formatPrice = (price) =>
  price === null ? "€ [prijs]" : `€ ${price.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}`;

// Maakt dezelfde productkaart als op de homepage en de productenpagina.
function productCardHtml(product, number) {
  const name = escapeHtml(product.name);
  return `<article class="product">
    <div class="product-media">
      <a class="product-link" href="product.html?p=${product.slug}">
        <img class="${product.imageClass}" src="${escapeHtml(product.image)}" alt="${name}" loading="lazy">
        <img class="product-hover ${product.hoverClass || ""}" src="${escapeHtml(product.hover)}" alt="" loading="lazy">
      </a>
      <button class="product-add" type="button" data-product="${product.slug}" aria-label="Toevoegen aan mand: ${name}">Toevoegen aan mand <span aria-hidden="true">+</span></button>
    </div>
    <div class="product-info">
      <span class="product-number">${String(number).padStart(2, "0")}</span>
      <h3 class="product-name"><a href="product.html?p=${product.slug}">${name}</a></h3>
      <p class="product-price">${formatPrice(product.price)}</p>
      <p class="product-meta">${product.label} — ${product.size}</p>
    </div>
  </article>`;
}
