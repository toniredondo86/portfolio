import { BREAKPOINTS, STACK_TRANSITION_MS, prefersReducedMotion } from "./utils.js";

export function initResultCarousel() {
  const mediaCarousels = Array.from(document.querySelectorAll("[data-result-media-carousel]"));
  if (!mediaCarousels.length) return;

  const isMobile = window.matchMedia(`(max-width: ${BREAKPOINTS.lg - 1}px)`).matches;

  mediaCarousels.forEach((carousel) => {
    const track = carousel.querySelector(".result-stack__track");
    if (!track) return;

    if (isMobile) {
      const desktopSlides = Array.from(track.querySelectorAll(".result-stack__slide"));
      const mobileSlides = [];

      desktopSlides.forEach((slide) => {
        slide.querySelectorAll(".result-stack__media-item").forEach((item, idx) => {
          const mobileSlide = document.createElement("div");
          mobileSlide.className =
            idx === 0 && mobileSlides.length === 0
              ? "result-stack__slide is-active"
              : "result-stack__slide";

          const mediaGrid = document.createElement("div");
          mediaGrid.className = "result-stack__media-grid result-stack__media-grid--single";
          mediaGrid.appendChild(item.cloneNode(true));
          mobileSlide.appendChild(mediaGrid);
          mobileSlides.push(mobileSlide);
        });
      });

      if (mobileSlides.length) track.replaceChildren(...mobileSlides);
    }

    const slides = Array.from(track.querySelectorAll(".result-stack__slide"));
    const prevBtn = carousel.querySelector(".result-stack__btn--prev");
    const nextBtn = carousel.querySelector(".result-stack__btn--next");
    if (!slides.length) return;

    const total = slides.length;
    let index = 0;
    let transitioning = false;

    // ARIA: mark as carousel region for screen readers
    carousel.setAttribute("role", "region");
    carousel.setAttribute("aria-roledescription", "carrusel");
    if (!carousel.hasAttribute("aria-label")) {
      carousel.setAttribute("aria-label", "Galería de pantallas");
    }

    const updateAriaLabels = (activeIndex) => {
      slides.forEach((slide, i) => {
        slide.setAttribute("aria-hidden", i === activeIndex ? "false" : "true");
        slide.setAttribute("aria-label", `Diapositiva ${i + 1} de ${total}`);
      });
    };

    const setActive = (nextIndex) => {
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === nextIndex));
      index = nextIndex;
      updateAriaLabels(nextIndex);
    };

    if (total === 1) {
      carousel.classList.add("is-single");
      setActive(0);
      return;
    }

    const activate = (nextIndex) => {
      if (transitioning || nextIndex === index) return;
      transitioning = true;
      track.classList.add("is-fading");
      window.setTimeout(() => {
        setActive(nextIndex);
        track.classList.remove("is-fading");
        transitioning = false;
      }, STACK_TRANSITION_MS);
    };

    prevBtn?.addEventListener("click", () => activate((index - 1 + total) % total));
    nextBtn?.addEventListener("click", () => activate((index + 1) % total));

    // Keyboard navigation: arrow keys when focus is on the carousel or its buttons
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        activate((index - 1 + total) % total);
        prevBtn?.focus();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        activate((index + 1) % total);
        nextBtn?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        activate(0);
      } else if (e.key === "End") {
        e.preventDefault();
        activate(total - 1);
      }
    });

    setActive(0);
  });
}

export function initResultReveal() {
  const resultSection = document.querySelector("#resultado");
  if (!resultSection) return;

  const blocks = Array.from(resultSection.querySelectorAll(".result-stack__block"));
  if (!blocks.length) return;

  if (prefersReducedMotion()) {
    blocks.forEach((block) => block.classList.add("is-visible"));
    return;
  }

  blocks[0].classList.add("is-visible");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
  );

  blocks.slice(1).forEach((block) => observer.observe(block));
}
