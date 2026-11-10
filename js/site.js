// Gedeeld door alle pagina's: menu, knoppen, header, banner en smooth scrolling.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (value) => Math.min(Math.max(value, 0), 1);

// Opent en sluit het menu op tablet en mobiel.
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", isOpen);
  menuToggle.setAttribute("aria-label", isOpen ? "Menu sluiten" : "Menu openen");
});

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
if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

if (!reduceMotion && window.gsap && window.ScrollTrigger && document.querySelector(".banner")) {

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

// Formulieren zijn nog niet aan een systeem gekoppeld: geef dat eerlijk aan in plaats van te doen alsof.
document.querySelectorAll("[data-demo-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.querySelector(".form-note").hidden = false;
  });
});
