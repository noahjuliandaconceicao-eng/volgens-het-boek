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
