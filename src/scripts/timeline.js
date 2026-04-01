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
    // Use offsetTop/offsetLeft (not getBoundingClientRect) so CSS transforms
    // from reveal-up animations don't pollute the layout measurements.
    const firstBullet = bullets[0];
    const lastBullet = bullets[bullets.length - 1];

    const firstStep = firstBullet.offsetParent; // .project-process__step
    const lastStep  = lastBullet.offsetParent;

    const top    = firstStep.offsetTop + firstBullet.offsetTop + firstBullet.offsetHeight / 2;
    const bottom = lastStep.offsetTop  + lastBullet.offsetTop  + lastBullet.offsetHeight  / 2;
    const left   = firstStep.offsetLeft + firstBullet.offsetLeft + firstBullet.offsetWidth / 2;

    const h = Math.max(0, bottom - top);
    track.style.top    = `${top}px`;
    track.style.height = `${h}px`;
    track.style.left   = `${left}px`;
    progress.style.top    = `${top}px`;
    progress.style.height = `${h}px`;
    progress.style.left   = `${left}px`;
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
