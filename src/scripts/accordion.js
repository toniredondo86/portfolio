export function initAccordion() {
  const root = document.querySelector(".process-accordion");
  if (!root) return;
  if (root.classList.contains("process-accordion--no-media")) return;

  const items = Array.from(root.querySelectorAll(".process-accordion__item"));
  const mediaItems = Array.from(root.querySelectorAll(".process-accordion__media-item"));
  if (items.length === 0) return;

  const setActiveStep = (step) => {
    items.forEach((item) => {
      const isActive = item.dataset.step === String(step);
      item.classList.toggle("is-active", isActive);

      const btn = item.querySelector(".process-accordion__trigger");
      const panel = item.querySelector(".process-accordion__panel");

      if (btn) btn.setAttribute("aria-expanded", isActive ? "true" : "false");
      if (panel) panel.hidden = !isActive;
    });

    mediaItems.forEach((m) => {
      m.classList.toggle("is-active", m.dataset.step === String(step));
    });
  };

  const equalizePanelHeights = () => {
    const activeStep =
      items.find((item) => item.classList.contains("is-active"))?.dataset.step ||
      items[0].dataset.step;

    const panels = items
      .map((item) => item.querySelector(".process-accordion__panel"))
      .filter(Boolean);

    panels.forEach((panel) => {
      panel.style.visibility = "hidden";
      panel.hidden = false;
    });

    const maxHeight = items.reduce((max, item) => {
      const panelInner = item.querySelector(".process-accordion__panel-inner");
      if (!panelInner) return max;
      return Math.max(max, panelInner.offsetHeight);
    }, 0);

    panels.forEach((panel) => {
      panel.hidden = true;
      panel.style.removeProperty("visibility");
    });

    if (maxHeight > 0) root.style.setProperty("--pa-panel-max-h", `${maxHeight}px`);

    setActiveStep(activeStep);
  };

  const initial =
    items.find((i) => i.classList.contains("is-active"))?.dataset.step ||
    items[0].dataset.step;

  setActiveStep(initial);
  equalizePanelHeights();

  items.forEach((item) => {
    const btn = item.querySelector(".process-accordion__trigger");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const step = item.dataset.step;
      if (step) setActiveStep(step);
    });
  });

  window.addEventListener("resize", equalizePanelHeights);
  window.addEventListener("load", equalizePanelHeights, { once: true });
}

export function initProcessProgress() {
  const root = document.querySelector(".process-accordion--no-media");
  if (!root) return;

  const stepsTrack = Array.from(root.querySelectorAll(".process-step"));
  const items = Array.from(root.querySelectorAll(".process-accordion__item"));
  const progress = root.querySelector(".process-progress");
  const steps = Array.from(root.querySelectorAll(".process-progress__step"));
  if (!stepsTrack.length || !items.length) return;

  let raf = null;
  const STICKY_TOP_FALLBACK = 120;

  const getTriggerLine = () => {
    const stickySource = items[0] || progress;
    const topValue = window.getComputedStyle(stickySource).top;
    const stickyTop = Number.parseFloat(topValue);
    return Number.isFinite(stickyTop) ? stickyTop : STICKY_TOP_FALLBACK;
  };

  const setActive = (index) => {
    stepsTrack.forEach((stepEl, i) => stepEl.classList.toggle("is-active", i === index));
    items.forEach((item, i) => item.classList.toggle("is-active", i === index));

    if (steps.length) {
      steps.forEach((step, i) => {
        step.classList.toggle("is-active", i === index);
        step.setAttribute("aria-current", i === index ? "true" : "false");
        step.classList.toggle("is-passed", i < index);
      });
    }
  };

  const updateByViewport = () => {
    const triggerLine = getTriggerLine();
    let active = 0;

    stepsTrack.forEach((stepEl, index) => {
      if (stepEl.getBoundingClientRect().top <= triggerLine) active = index;
    });

    const firstRect = stepsTrack[0].getBoundingClientRect();
    const lastRect = stepsTrack[stepsTrack.length - 1].getBoundingClientRect();
    const start = triggerLine - firstRect.top;
    const total = Math.max(1, lastRect.top - firstRect.top);
    const progressRatio = Math.min(Math.max(start / total, 0), 1);

    if (progress) progress.style.setProperty("--process-progress", `${progressRatio}`);

    setActive(active);
  };

  const onScrollOrResize = () => {
    if (raf) return;
    raf = window.requestAnimationFrame(() => {
      raf = null;
      updateByViewport();
    });
  };

  steps.forEach((step, index) => {
    step.addEventListener("click", () => {
      stepsTrack[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);
  root.addEventListener("scroll", onScrollOrResize, { passive: true });
  updateByViewport();
}
