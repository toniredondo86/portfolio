import { prefersReducedMotion } from "./utils.js";

export function initCounters() {
  const countupElements = Array.from(document.querySelectorAll("[data-countup-number]"));
  if (!countupElements.length) return;

  const prefersReduced = prefersReducedMotion();

  const animateNumber = (el, to) => {
    const duration = prefersReduced ? 1 : 900;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(to * eased).toString();
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.dataset.counted === "true") return;
        const to = parseInt(el.getAttribute("data-countup-number"), 10);
        if (Number.isNaN(to)) return;
        el.dataset.counted = "true";
        animateNumber(el, to);
      });
    },
    { threshold: 0.35 }
  );

  countupElements.forEach((el) => {
    el.textContent = "0";
    observer.observe(el);
  });
}
