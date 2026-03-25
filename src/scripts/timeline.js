import { prefersReducedMotion, clamp } from "./utils.js";

export function initTimeline() {
  const container = document.getElementById("processTimeline");
  const track = document.getElementById("timelineTrack");
  const progress = document.getElementById("timelineProgress");
  if (!container || !track || !progress) return;

  const steps = Array.from(container.querySelectorAll(".project-process__step"));
  const bullets = Array.from(container.querySelectorAll(".project-process__bullet"));
  if (steps.length === 0 || bullets.length < 2) return;

  const shouldReduce = prefersReducedMotion();

  const measure = () => {
    const containerRect = container.getBoundingClientRect();
    const firstRect = bullets[0].getBoundingClientRect();
    const lastRect = bullets[bullets.length - 1].getBoundingClientRect();

    const top = firstRect.top + firstRect.height / 2 - containerRect.top;
    const bottom = lastRect.top + lastRect.height / 2 - containerRect.top;

    track.style.top = `${top}px`;
    track.style.height = `${Math.max(0, bottom - top)}px`;
    progress.style.top = `${top}px`;
    progress.style.height = `${Math.max(0, bottom - top)}px`;
  };

  const updateProgress = () => {
    if (shouldReduce) {
      progress.style.transform = "scaleY(0)";
      return;
    }

    const rect = container.getBoundingClientRect();
    const vh = window.innerHeight;
    const startOffset = vh * 0.8; // animation starts when container enters 80% of the viewport
    const endOffset = vh * 0.3;   // animation ends when container reaches 30% of the viewport
    const distance = rect.height + (startOffset - endOffset);
    const ratio = clamp((startOffset - rect.top) / Math.max(1, distance), 0, 1);

    progress.style.transform = `scaleY(${ratio})`;
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-active", entry.isIntersecting);
      });
    },
    { rootMargin: "-35% 0px -35% 0px", threshold: 0 }
  );

  steps.forEach((step) => observer.observe(step));

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      updateProgress();
    });
  };

  const onResize = () => {
    measure();
    updateProgress();
  };

  measure();
  updateProgress();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("load", onResize, { once: true });
}
