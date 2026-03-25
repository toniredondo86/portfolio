import { SCROLL_REVEAL_OFFSET } from "./utils.js";

export function initReveal() {
  document.documentElement.classList.add("js");

  const revealTargets = document.querySelectorAll(".reveal");
  if (!revealTargets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
  );

  revealTargets.forEach((el) => observer.observe(el));
}

export function initRevealUp() {
  const revealElements = document.querySelectorAll(".reveal-up");
  if (!revealElements.length) return;

  const shouldDelayReveal =
    document.body.classList.contains("intro-gated") ||
    document.body.classList.contains("intro-unveiling") ||
    !!document.getElementById("heroIntro");

  const startObserver = () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = el.style.getPropertyValue("--d");
          if (delay) el.style.transitionDelay = delay;
          el.classList.add("is-visible");
          observer.unobserve(el);
        });
      },
      { threshold: 0.15 }
    );
    revealElements.forEach((el) => observer.observe(el));
  };

  if (shouldDelayReveal) {
    window.addEventListener("home-intro:done", startObserver, { once: true });
  } else {
    startObserver();
  }
}

export function initRevealProcess() {
  const items = document.querySelectorAll("#problemaLab .scroll-lab__item");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          entry.target.classList.remove("is-above");
        } else {
          entry.target.classList.remove("is-visible");
          entry.target.classList.toggle("is-above", entry.boundingClientRect.top < 0);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: `0px 0px -${SCROLL_REVEAL_OFFSET}px 0px`,
    }
  );

  items.forEach((item) => observer.observe(item));
}
