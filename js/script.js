// Hero: bij het laden opent de foto als een venster en schuiven de koppen binnen, net als de banner.
// De CSS toont alles al volledig, dus zonder GSAP of bij minder beweging blijft de hero statisch.
if (!reduceMotion && window.gsap) {
  const heroLineOffset = window.innerWidth * 0.12;

  gsap
    .timeline({ defaults: { duration: 1.3, ease: "power3.out" } })
    .fromTo(".hero-photo", { clipPath: "inset(14% 20% 14% 20%)" }, { clipPath: "inset(0% 0% 0% 0%)" }, 0)
    .fromTo(".hero-photo img", { scale: 1.2 }, { scale: 1 }, 0)
    .fromTo(".hero-line:first-child", { x: -heroLineOffset, opacity: 0 }, { x: 0, opacity: 1 }, 0.25)
    .fromTo(".hero-line-gold", { x: heroLineOffset, opacity: 0 }, { x: 0, opacity: 1 }, 0.25)
    .fromTo(".hero-foot", { opacity: 0 }, { opacity: 1, duration: 0.9 }, 0.5);
}

// Face & Beard Oil: de sectie staat vast terwijl de woorden en de fles naar binnen scrollen.
const oil = document.querySelector(".oil");
const oilStage = document.querySelector(".oil-stage");
const oilFace = document.querySelector(".oil-face");
const oilBeard = document.querySelector(".oil-beard");
const oilBottle = document.querySelector(".oil-bottle");
const oilTopText = document.querySelectorAll(".oil-side, .oil-intro, .oil-benefits");
const oilBottomText = document.querySelectorAll(".oil-text, .oil-buy");

const OIL_SMOOTHING = 7; // hoger is sneller, lager is zachter
const OIL_BOTTLE_TILT = 14; // graden die de fles aan het begin schuin staat
let oilCurrent = 0;
let oilTarget = 0;
let oilFrame = null;
let oilLastTime = 0;

// Afstand die nog over is voor een deel van de animatie: 1 aan het begin, 0 aan het eind.
const remaining = (progress, from, to) => (1 - clamp((progress - from) / (to - from))) ** 2;
const fadeIn = (progress, from, to) => clamp((progress - from) / (to - from));

// Negatief zolang de sectie nog binnenschuift, zodat de tekst dan al kan infaden.
function getOilTarget() {
  if (getComputedStyle(oilStage).position !== "sticky") return 1;
  const pinDistance = oil.offsetHeight - oilStage.offsetHeight;
  return Math.max(Math.min(-oil.getBoundingClientRect().top / pinDistance, 1), -1);
}

function renderOil(progress) {
  // Op mobiel staan de woorden onder elkaar en moeten ze verder schuiven om buiten beeld te starten.
  const wordTravel = window.innerWidth <= 640 ? 105 : 65;
  const wordOffset = remaining(progress, 0, 0.65) * wordTravel;
  const bottleLeft = remaining(progress, 0.15, 0.85);
  const wordOpacity = fadeIn(progress, 0.1, 0.5);
  const topTextOpacity = fadeIn(progress, -0.3, 0);
  const bottomTextOpacity = fadeIn(progress, -0.05, 0.2);

  oilFace.style.transform = `translateX(${-wordOffset}vw)`;
  oilBeard.style.transform = `translateX(${wordOffset}vw)`;
  oilFace.style.opacity = wordOpacity;
  oilBeard.style.opacity = wordOpacity;
  oilBottle.style.translate = `0 ${bottleLeft * 105}vh`;
  oilBottle.style.setProperty("--tilt", `${bottleLeft * OIL_BOTTLE_TILT}deg`);
  oilBottle.style.opacity = fadeIn(progress, 0.2, 0.55);
  oilTopText.forEach((element) => { element.style.opacity = topTextOpacity; });
  oilBottomText.forEach((element) => { element.style.opacity = bottomTextOpacity; });
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
  const productProgress = document.querySelector(".products-progress span");
  const PRODUCT_SCROLL_PACE = 1.5; // aantal px scrollen per px dat de rij opzij beweegt

  const productTravel = () => Math.max(0, productStrip.offsetWidth - productStage.clientWidth);
  const productPinDistance = () => productTravel() * PRODUCT_SCROLL_PACE;
  const setProductsHeight = () => {
    products.style.height = `${productStage.offsetHeight + productPinDistance()}px`;
    products.classList.toggle("no-travel", !productTravel());
  };

  // Op te lage schermen, zoals een liggende telefoon, past de sectie niet en blijft het de gewone rij.
  gsap.matchMedia().add("(min-width: 1025px), (min-height: 601px)", () => {
    products.classList.add("is-pinned");
    setProductsHeight();
    ScrollTrigger.addEventListener("refreshInit", setProductsHeight);

    const productScroll = gsap
      .timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: products,
          start: "top top",
          end: () => `+=${productPinDistance()}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
      .to(productStrip, { x: () => -productTravel(), duration: 1 }, 0)
      .fromTo(productProgress, { scaleX: 0.005 }, { scaleX: 1, duration: 1 }, 0);

    // Met de Tab-toets naar een kaart die buiten beeld staat: scrol de pagina daarheen.
    const showFocusedCard = (event) => {
      const travel = productTravel();
      if (!travel || !event.target.matches(":focus-visible")) return;

      const cardLeft = event.target.closest(".product, .products-intro").getBoundingClientRect().left;
      const offset = cardLeft - productStrip.getBoundingClientRect().left;
      const startOffset = parseFloat(getComputedStyle(productStrip).paddingLeft);
      const { start, end } = productScroll.scrollTrigger;
      window.scrollTo(0, start + clamp((offset - startOffset) / travel) * (end - start));
    };
    productStrip.addEventListener("focusin", showFocusedCard);

    return () => {
      productStrip.removeEventListener("focusin", showFocusedCard);
      ScrollTrigger.removeEventListener("refreshInit", setProductsHeight);
      products.classList.remove("is-pinned", "no-travel");
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
    productCards
      .filter((card) => !card.hidden)
      .forEach((card) => card.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: "ease" }));
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!button.classList.contains("is-active")) filterProducts(button);
  });
});

const OIL_OPACITY = 0.45; // doorzichtigheid van de olie in het tuitje en de druppel (0 = onzichtbaar, 1 = dicht)

// Kleuren voor het 3D-flesje: de Blender-export bevat geen kleur voor glas, olie en druppel.
const oilModel = document.querySelector("model-viewer.oil-bottle");
if (oilModel) {
  oilModel.addEventListener("load", () => {
    const paint = (name, color, roughness, metallic = 0) => {
      const material = oilModel.model?.getMaterialByName(name);
      if (!material) return;
      material.pbrMetallicRoughness.setBaseColorFactor(color);
      material.pbrMetallicRoughness.setRoughnessFactor(roughness);
      material.pbrMetallicRoughness.setMetallicFactor(metallic);
    };
    paint("Material.001", [0.018, 0.009, 0.004, 1], 0.06);  // donker amberglas flesje
    paint("Material.002", [1.0, 0.62, 0.12, 1], 0.0);       // gouden olie
    paint("water", [0.78, 0.58, 0.3, OIL_OPACITY], 0.08);  // druppel
    oilModel.model?.getMaterialByName("water")?.setAlphaMode("BLEND");

    // Glazen tuitje van de druppelaar: echte transparantie zodat de pagina-achtergrond erdoor zichtbaar is.
    // (Transmission laat in model-viewer alleen de 3D-scène zien, niet de HTML erachter.)
    const pipette = oilModel.model?.getMaterialByName("Material.005");
    if (pipette) {
      pipette.transmission?.setTransmissionFactor(0);
      pipette.setAlphaMode("BLEND");
      pipette.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0.12]);
      pipette.pbrMetallicRoughness.setRoughnessFactor(0.02);
      pipette.pbrMetallicRoughness.setMetallicFactor(0);
    }

    setupPipetteLiquid(oilModel);
  }, { once: true });
}

// Vloeistof-effect: het oppervlak van de olie in het tuitje blijft waterpas (zwaartekracht = onderkant
// van het scherm, inclusief de scroll-tilt) en klotst even na met een veer.
function setupPipetteLiquid(viewer) {
  const sceneKey = Object.getOwnPropertySymbols(viewer).find((s) => s.description === "scene");
  const scene = sceneKey && viewer[sceneKey];
  if (!scene) return;

  let oil = null;
  scene.traverse((object) => { if (object.isMesh && object.name === "pipette_oil") oil = object; });
  if (!oil) return;

  const FILL_POINT = [-0.1643, 2.9928, 0.8314]; // midden van het olie-oppervlak in het tuitje (model-coördinaten)
  const STIFFNESS = 90; // hoger = sneller terug naar waterpas
  const DAMPING = 6;    // lager = langer naklotsen

  const uniforms = {
    uOilPlane: { value: { x: 0, y: 1, z: 0, w: 1e9 } },
    uOilNormalView: { value: { x: 0, y: 1, z: 0 } },
  };

  const material = oil.material;
  material.side = 2; // DoubleSide: de binnenkant vormt het oppervlak waar de olie is afgesneden
  material.transparent = true;
  material.opacity = OIL_OPACITY;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vOilWorld;")
      .replace("#include <project_vertex>", "#include <project_vertex>\nvOilWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vOilWorld;\nuniform vec4 uOilPlane;\nuniform vec3 uOilNormalView;")
      .replace("#include <clipping_planes_fragment>", "#include <clipping_planes_fragment>\nif (dot(uOilPlane.xyz, vOilWorld) > uOilPlane.w) discard;")
      .replace("#include <normal_fragment_maps>", "#include <normal_fragment_maps>\nif (!gl_FrontFacing) normal = normalize(uOilNormalView);");
  };
  material.customProgramCacheKey = () => "pipette-oil-liquid";
  material.needsUpdate = true;

  const normal = [0, 1, 0];
  const velocity = [0, 0, 0];
  let started = false;
  let last = performance.now();

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const camera = scene.getCamera?.() ?? scene.camera;

    if (camera && !document.hidden) {
      const cam = camera.matrixWorld.elements;
      const tilt = (parseFloat(viewer.style.getPropertyValue("--tilt")) || 0) * Math.PI / 180;
      // "Boven" op het scherm, teruggerekend naar 3D (de CSS-rotatie draait het hele beeld met de klok mee).
      const target = [0, 1, 2].map((i) => Math.cos(tilt) * cam[4 + i] - Math.sin(tilt) * cam[i]);

      if (!started) { normal.splice(0, 3, ...target); started = true; }
      for (let i = 0; i < 3; i++) {
        velocity[i] += ((target[i] - normal[i]) * STIFFNESS - velocity[i] * DAMPING) * dt;
        normal[i] += velocity[i] * dt;
      }
      const len = Math.hypot(...normal) || 1;
      const n = normal.map((v) => v / len);

      const m = oil.matrixWorld.elements;
      const [x, y, z] = FILL_POINT;
      const p = [0, 1, 2].map((i) => m[i] * x + m[4 + i] * y + m[8 + i] * z + m[12 + i]);
      Object.assign(uniforms.uOilPlane.value, { x: n[0], y: n[1], z: n[2], w: n[0] * p[0] + n[1] * p[1] + n[2] * p[2] });

      const v = camera.matrixWorldInverse.elements;
      Object.assign(uniforms.uOilNormalView.value, {
        x: v[0] * n[0] + v[4] * n[1] + v[8] * n[2],
        y: v[1] * n[0] + v[5] * n[1] + v[9] * n[2],
        z: v[2] * n[0] + v[6] * n[1] + v[10] * n[2],
      });
      scene.queueRender?.();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
