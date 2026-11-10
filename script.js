// Opent en sluit het menu op tablet en mobiel.
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", isOpen);
  menuToggle.setAttribute("aria-label", isOpen ? "Menu sluiten" : "Menu openen");
});

// Face & Beard Oil: de sectie staat vast terwijl de woorden en de fles naar binnen scrollen.
const oil = document.querySelector(".oil");
const oilStage = document.querySelector(".oil-stage");
const oilFace = document.querySelector(".oil-face");
const oilBeard = document.querySelector(".oil-beard");
const oilBottle = document.querySelector(".oil-bottle");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const OIL_SMOOTHING = 7; // hoger is sneller, lager is zachter
let oilCurrent = 0;
let oilTarget = 0;
let oilFrame = null;
let oilLastTime = 0;

const clamp = (value) => Math.min(Math.max(value, 0), 1);
// Afstand die nog over is voor een deel van de animatie: 1 aan het begin, 0 aan het eind.
const remaining = (progress, from, to) => (1 - clamp((progress - from) / (to - from))) ** 2;

function getOilTarget() {
  if (getComputedStyle(oilStage).position !== "sticky") return 1;
  const pinDistance = oil.offsetHeight - oilStage.offsetHeight;
  return clamp(-oil.getBoundingClientRect().top / pinDistance);
}

function renderOil(progress) {
  // Op mobiel staan de woorden onder elkaar en moeten ze verder schuiven om buiten beeld te starten.
  const wordTravel = window.innerWidth <= 640 ? 105 : 65;
  const wordOffset = remaining(progress, 0, 0.65) * wordTravel;
  const bottleOffset = remaining(progress, 0.15, 0.85) * 105;

  oilFace.style.transform = `translateX(${-wordOffset}vw)`;
  oilBeard.style.transform = `translateX(${wordOffset}vw)`;
  oilBottle.style.translate = `0 ${bottleOffset}vh`;
}

function tickOil(now) {
  const elapsed = Math.min((now - oilLastTime) / 1000, 0.05);
  oilLastTime = now;
  oilCurrent += (oilTarget - oilCurrent) * (1 - Math.exp(-elapsed * OIL_SMOOTHING));

  if (Math.abs(oilTarget - oilCurrent) < 0.0005) oilCurrent = oilTarget;
  renderOil(oilCurrent);
  oilFrame = oilCurrent === oilTarget ? null : requestAnimationFrame(tickOil);
}

function updateOil() {
  oilTarget = getOilTarget();

  // Lenis maakt het scrollen met muis en trackpad al vloeiend; twee keer naijlen voelt traag.
  if (document.documentElement.classList.contains("lenis") && hasMouse) {
    oilCurrent = oilTarget;
    renderOil(oilCurrent);
    return;
  }

  if (oilFrame === null) {
    oilLastTime = performance.now();
    oilFrame = requestAnimationFrame(tickOil);
  }
}

if (!reduceMotion) {
  oilCurrent = oilTarget = getOilTarget();
  renderOil(oilCurrent);
  window.addEventListener("scroll", updateOil, { passive: true });
  window.addEventListener("resize", updateOil);
}

// Knoppen: radial fill vanaf de muispositie en een magnetische beweging.
const MAGNET_STRENGTH = 0.3;
const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const useMagnet = hasMouse && !reduceMotion && window.gsap;

function setFillOrigin(button, event) {
  const box = button.getBoundingClientRect();
  button.style.setProperty("--x", `${event.clientX - box.left}px`);
  button.style.setProperty("--y", `${event.clientY - box.top}px`);
}

document.querySelectorAll(".btn, .oil-cta, .product-add").forEach((button) => {
  // De balk zit vast in de kaart en krijgt alleen de cirkelvulling.
  const useButtonMagnet = useMagnet && !button.matches(".product-add");

  button.addEventListener("pointerenter", (event) => setFillOrigin(button, event));

  button.addEventListener("pointerleave", (event) => {
    // Alleen een volle cirkel naar het uitgangspunt verplaatsen, anders springt hij zichtbaar.
    if (parseFloat(getComputedStyle(button).getPropertyValue("--fill")) >= 140) {
      setFillOrigin(button, event);
    }
    if (useButtonMagnet) {
      gsap.to(button, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)", overwrite: true });
    }
  });

  if (useButtonMagnet) {
    button.addEventListener("pointermove", (event) => {
      const box = button.getBoundingClientRect();
      // Reken vanaf de ruststand, anders telt de verschuiving zichzelf op.
      const restLeft = box.left - gsap.getProperty(button, "x");
      const restTop = box.top - gsap.getProperty(button, "y");

      gsap.to(button, {
        x: (event.clientX - (restLeft + box.width / 2)) * MAGNET_STRENGTH,
        y: (event.clientY - (restTop + box.height / 2)) * MAGNET_STRENGTH,
        duration: 0.4,
        ease: "power3.out",
        overwrite: true,
      });
    });
  }
});

// Header: weg bij omlaag scrollen, terug bij omhoog scrollen.
const siteHeader = document.querySelector(".site-header");
const HEADER_TOP_ZONE = 80; // binnen deze afstand van de bovenkant blijft de header altijd staan
const HEADER_MIN_SCROLL = 5; // kleine trillingen negeren
let lastScrollY = window.scrollY;

function updateHeader() {
  const scrollY = window.scrollY;
  if (Math.abs(scrollY - lastScrollY) < HEADER_MIN_SCROLL) return;

  const hide = scrollY > lastScrollY && scrollY > HEADER_TOP_ZONE && !mainNav.classList.contains("is-open");
  siteHeader.classList.toggle("is-hidden", hide);
  lastScrollY = scrollY;
}

window.addEventListener("scroll", updateHeader, { passive: true });
// Met de toetsenbordfocus in de header moet hij zichtbaar zijn.
siteHeader.addEventListener("focusin", () => siteHeader.classList.remove("is-hidden"));

// Banner: de foto opent als een venster en de koppen en tekst schuiven binnen, gekoppeld aan het scrollen.
// De CSS toont alles al volledig, dus zonder GSAP of bij minder beweging blijft de banner statisch.
if (!reduceMotion && window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  const BANNER_LINE_TRAVEL = 0.22; // deel van de schermbreedte dat de koppen afleggen
  const bannerLineOffset = () => window.innerWidth * BANNER_LINE_TRAVEL;

  gsap
    .timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".banner",
        start: "top bottom",
        end: "top top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    })
    .fromTo(
      ".banner-media",
      { clipPath: "inset(14% 20% 14% 20%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1 },
      0
    )
    .fromTo(".banner-image", { scale: 1.3 }, { scale: 1, duration: 1 }, 0)
    // De teksten schuiven pas in het tweede deel binnen, als de foto al grotendeels open is.
    .fromTo(
      ".banner-line:first-child",
      { x: () => -bannerLineOffset(), opacity: 0 },
      { x: 0, opacity: 1, duration: 0.55 },
      0.45
    )
    // De tekst legt de helft van de afstand af, zodat hij binnen het openende venster blijft.
    .fromTo(
      ".banner-copy",
      { x: () => -bannerLineOffset() / 2, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.55 },
      0.45
    )
    .fromTo(
      ".banner-line-gold",
      { x: bannerLineOffset, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.55 },
      0.45
    );

  // De fonts veranderen de hoogte van de pagina, dus daarna de scrollposities opnieuw meten.
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

// Smooth scrolling op de hele website. Touchscreens houden het natuurlijke scrollen van het apparaat.
if (!reduceMotion && window.Lenis) {
  const lenis = new Lenis({ lerp: 0.1, anchors: true });

  if (window.gsap) {
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const runLenis = (time) => {
      lenis.raf(time);
      requestAnimationFrame(runLenis);
    };
    requestAnimationFrame(runLenis);
  }
} else if (!reduceMotion) {
  // Lenis niet geladen: dan glijden in elk geval de ankerlinks.
  document.documentElement.style.scrollBehavior = "smooth";
}

// Productrij: met de muis horizontaal slepen. Touchscreens en trackpads scrollen vanzelf.
const products = document.querySelector(".products");
const productStrip = document.querySelector(".product-grid");
const DRAG_THRESHOLD = 6; // pas vanaf deze afstand telt een klik als slepen
let isStripDown = false;
let hasStripDragged = false;
let stripStartX = 0;
let stripStartScroll = 0;

productStrip.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "mouse" || event.button !== 0) return;
  if (products.classList.contains("is-pinned")) return;
  isStripDown = true;
  hasStripDragged = false;
  stripStartX = event.clientX;
  stripStartScroll = productStrip.scrollLeft;
});

window.addEventListener("pointermove", (event) => {
  if (!isStripDown) return;
  const distance = event.clientX - stripStartX;
  if (!hasStripDragged && Math.abs(distance) < DRAG_THRESHOLD) return;

  hasStripDragged = true;
  productStrip.classList.add("is-dragging");
  productStrip.scrollLeft = stripStartScroll - distance;
});

window.addEventListener("pointerup", () => {
  isStripDown = false;
  productStrip.classList.remove("is-dragging");
});

// Na het slepen mag de losgelaten kaart niet als klik tellen.
productStrip.addEventListener(
  "click",
  (event) => {
    if (!hasStripDragged) return;
    event.preventDefault();
    event.stopPropagation();
    hasStripDragged = false;
  },
  true
);

productStrip.addEventListener("dragstart", (event) => event.preventDefault());

// Producten: de sectie staat vast terwijl verticaal scrollen de rij van links naar rechts doorloopt.
if (!reduceMotion && window.gsap && window.ScrollTrigger) {
  const productStage = document.querySelector(".products-stage");
  const PRODUCT_SCROLL_PACE = 1.5; // aantal px scrollen per px dat de rij opzij beweegt

  const productTravel = () => Math.max(0, productStrip.offsetWidth - productStage.clientWidth);
  const productPinDistance = () => productTravel() * PRODUCT_SCROLL_PACE;
  const setProductsHeight = () => {
    products.style.height = `${productStage.offsetHeight + productPinDistance()}px`;
  };

  // Op te lage schermen, zoals een liggende telefoon, past de sectie niet en blijft het de gewone rij.
  gsap.matchMedia().add("(min-width: 1025px), (min-height: 601px)", () => {
    products.classList.add("is-pinned");
    setProductsHeight();
    ScrollTrigger.addEventListener("refreshInit", setProductsHeight);

    const productScroll = gsap.to(productStrip, {
      x: () => -productTravel(),
      ease: "none",
      scrollTrigger: {
        trigger: products,
        start: "top top",
        end: () => `+=${productPinDistance()}`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    // Met de Tab-toets naar een kaart die buiten beeld staat: scrol de pagina daarheen.
    const showFocusedCard = (event) => {
      const travel = productTravel();
      if (!travel || !event.target.matches(":focus-visible")) return;

      const cardLeft = event.target.closest(".product").getBoundingClientRect().left;
      const offset = cardLeft - productStrip.getBoundingClientRect().left;
      const startOffset = parseFloat(getComputedStyle(productStrip).paddingLeft);
      const { start, end } = productScroll.scrollTrigger;
      window.scrollTo(0, start + clamp((offset - startOffset) / travel) * (end - start));
    };
    productStrip.addEventListener("focusin", showFocusedCard);

    return () => {
      productStrip.removeEventListener("focusin", showFocusedCard);
      ScrollTrigger.removeEventListener("refreshInit", setProductsHeight);
      products.classList.remove("is-pinned");
      products.style.height = "";
    };
  });

  ScrollTrigger.refresh();
}

// Productfilter: toont per tab de juiste producten en nummert de zichtbare producten opnieuw.
const productCards = [...document.querySelectorAll(".product")];
const filterButtons = document.querySelectorAll(".tabs button");

function filterProducts(activeButton) {
  const filter = activeButton.dataset.filter;
  let visibleCount = 0;

  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button === activeButton);
    button.setAttribute("aria-pressed", button === activeButton);
  });

  productCards.forEach((card) => {
    const isVisible = filter === "alle" || card.dataset.category.split(" ").includes(filter);
    card.hidden = !isVisible;
    if (isVisible) {
      visibleCount += 1;
      card.querySelector(".product-number").textContent = String(visibleCount).padStart(2, "0");
    }
  });

  productStrip.scrollLeft = 0;

  // De rij is nu korter of langer: terug naar het eerste product en de scrollafstand opnieuw meten.
  if (products.classList.contains("is-pinned")) {
    const sectionTop = products.getBoundingClientRect().top + window.scrollY;
    if (window.scrollY > sectionTop) window.scrollTo(0, sectionTop);
    ScrollTrigger.refresh();
  }

  if (!reduceMotion) {
    productStrip.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: "ease" });
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!button.classList.contains("is-active")) filterProducts(button);
  });
});
