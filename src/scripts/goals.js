import { prefersReducedMotion } from "./utils.js";

function observeRevealItems(sectionSelector, contentSelector, itemSelector) {
  const section = document.querySelector(sectionSelector);
  const intro = section?.querySelector(contentSelector);
  const items = section ? Array.from(section.querySelectorAll(itemSelector)) : [];
  if (!section || !intro || !items.length) return;

  if (prefersReducedMotion()) {
    intro.classList.add("is-visible");
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  section.classList.add("is-observed");

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
  );

  observer.observe(intro);
  items.forEach((item) => observer.observe(item));
}

export function initGoals() {
  observeRevealItems(
    ".project-challenge",
    ".project-challenge__content",
    ".project-challenge__goal"
  );
}

export function initPrinciples() {
  observeRevealItems(
    ".project-principles",
    ".project-principles__content",
    ".project-principles__item"
  );
}
