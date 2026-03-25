import { BREAKPOINTS, clamp } from "./utils.js";

export function initHeroCompare() {
  const compare = document.getElementById("heroCompare");
  const range = document.getElementById("heroCompareRange");
  const phones = document.querySelector(".phones");
  if (!compare || !range || !phones) return;

  // Aspect ratio of the phone mockup asset (width / height in px)
  const RATIO = 878 / 1794;

  const update = (value) => {
    compare.style.setProperty("--compare", clamp(Number(value) || 50, 0, 100) + "%");
  };

  const syncSize = () => {
    const availableWidth = phones.clientWidth;
    if (!availableWidth) return;

    if (window.innerWidth < BREAKPOINTS.lg) {
      // Mobile: CSS handles sizing via width:100%, max-width and aspect-ratio
      compare.style.removeProperty("width");
      compare.style.removeProperty("height");
      return;
    }

    // Desktop: fit within the phones container preserving the aspect ratio
    const availableHeight = phones.clientHeight;
    if (!availableHeight) return;

    let h = availableHeight;
    let w = h * RATIO;

    if (w > availableWidth) {
      w = availableWidth;
      h = w / RATIO;
    }

    compare.style.width = `${Math.round(w)}px`;
    compare.style.height = `${Math.round(h)}px`;
  };

  update(range.value);
  range.addEventListener("input", (e) => update(e.target.value));
  syncSize();
  window.addEventListener("resize", syncSize, { passive: true });
  window.addEventListener("load", syncSize);
}
