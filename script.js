// script.js

const BREAKPOINTS = {
  md: 768,
  lg: 1024,
};

const MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";
const SCROLL_REVEAL_OFFSET = 120;
const STACK_TRANSITION_MS = 450;
const HERO_INTRO_REVEAL_MS = 1100;
const HERO_ROTATION_INTERVAL_MS = 2400;
const HERO_SCRAMBLE_DURATION_MS = 750;

const prefersReducedMotion = () => window.matchMedia(MOTION_MEDIA_QUERY).matches;

// =========================
// NAV MOBILE (index + cases)
// =========================
(() => {
  const nav = document.getElementById("siteNav");
  const toggle = nav?.querySelector(".hamburger");
  const dropdown = document.getElementById("navDropdown");
  const overlay = document.getElementById("navOverlay");

  if (!nav || !toggle || !dropdown || !overlay) return;

  let overlayHideTimer = null;
  let syncRaf = null;

  const syncNavBottomVar = () => {
    const rect = nav.getBoundingClientRect();
    const bottom = Math.max(0, rect.bottom);
    document.documentElement.style.setProperty("--site-nav-bottom", `${bottom}px`);
  };

  const scheduleSyncNavBottomVar = () => {
    if (syncRaf) return;
    syncRaf = window.requestAnimationFrame(() => {
      syncRaf = null;
      syncNavBottomVar();
    });
  };

  const openMenu = () => {
    if (overlayHideTimer) {
      window.clearTimeout(overlayHideTimer);
      overlayHideTimer = null;
    }

    nav.classList.add("is-open");

    dropdown.hidden = false;
    dropdown.setAttribute("aria-hidden", "false");

    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => overlay.classList.add("is-visible"));

    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-locked");
    syncNavBottomVar();
  };

  const closeMenu = () => {
    nav.classList.remove("is-open");

    toggle.setAttribute("aria-expanded", "false");

    dropdown.hidden = true;
    dropdown.setAttribute("aria-hidden", "true");

    overlay.classList.remove("is-visible");
    overlayHideTimer = window.setTimeout(() => {
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden", "true");
      overlayHideTimer = null;
    }, 180);

    document.body.classList.remove("nav-locked");
    syncNavBottomVar();
  };

  const isOpen = () => nav.classList.contains("is-open");

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    isOpen() ? closeMenu() : openMenu();
  });

  dropdown.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", closeMenu);
  });

  overlay.addEventListener("pointerdown", () => {
    if (isOpen()) closeMenu();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= BREAKPOINTS.md && isOpen()) closeMenu();
    scheduleSyncNavBottomVar();
  });

  window.addEventListener("scroll", scheduleSyncNavBottomVar, { passive: true });
  window.addEventListener("orientationchange", scheduleSyncNavBottomVar);
  window.addEventListener("load", scheduleSyncNavBottomVar, { once: true });

  if ("ResizeObserver" in window) {
    const navResizeObserver = new ResizeObserver(() => {
      scheduleSyncNavBottomVar();
    });
    navResizeObserver.observe(nav);
  }

  // Estado inicial consistente
  closeMenu();
  scheduleSyncNavBottomVar();
})();

// =========================
// HERO INTRO (solo home)
// =========================
(() => {
  if (!document.body.classList.contains("home")) return;

  const intro = document.getElementById("heroIntro");
  const mount = document.getElementById("heroIntroLogo");
  if (!intro) return;

  const announceIntroDone = () => {
    window.dispatchEvent(new CustomEvent("home-intro:done"));
  };

  if (!mount) {
    intro.remove();
    announceIntroDone();
    return;
  }

  document.body.classList.add("intro-gated");

  // Logo stays purely inline from index.html (no JS manipulation).

  const reduceMotion = prefersReducedMotion();
  const INTRO_OUT_AT = reduceMotion ? 700 : 1500;

  setTimeout(() => intro.classList.add("is-out"), INTRO_OUT_AT);
  setTimeout(() => {
    intro.remove();
    document.body.classList.add("intro-unveiling");
    requestAnimationFrame(() => document.body.classList.remove("intro-gated"));
    setTimeout(() => {
      document.body.classList.remove("intro-unveiling");
      announceIntroDone();
    }, HERO_INTRO_REVEAL_MS);
  }, INTRO_OUT_AT + 1000);
})();

// =========================
// PROCESS ACCORDION
// Active only on pages that render the media accordion variant.
// =========================
(() => {
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
      const isActive = m.dataset.step === String(step);
      m.classList.toggle("is-active", isActive);
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

    if (maxHeight > 0) {
      root.style.setProperty("--pa-panel-max-h", `${maxHeight}px`);
    }

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
      if (!step) return;
      setActiveStep(step);
    });
  });

  window.addEventListener("resize", equalizePanelHeights);
  window.addEventListener("load", equalizePanelHeights, { once: true });
})();

// =========================
// PROCESS PROGRESS (case-sagrada-familia, no-media variant)
// =========================
(() => {
  const root = document.querySelector(".process-accordion--no-media");
  if (!root) return;

  const stepsTrack = Array.from(root.querySelectorAll(".process-step"));
  const items = Array.from(root.querySelectorAll(".process-accordion__item"));
  const scrollContainer = root;
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
    stepsTrack.forEach((stepEl, i) => {
      stepEl.classList.toggle("is-active", i === index);
    });

    items.forEach((item, i) => {
      item.classList.toggle("is-active", i === index);
    });

    if (steps.length) {
      steps.forEach((step, i) => {
        step.classList.toggle("is-active", i === index);
        step.setAttribute("aria-current", i === index ? "true" : "false");
      });

      steps.forEach((step, i) => {
        step.classList.toggle("is-passed", i < index);
      });
    }
  };

  const updateByViewport = () => {
    const triggerLine = getTriggerLine();
    let active = 0;

    stepsTrack.forEach((stepEl, index) => {
      const rect = stepEl.getBoundingClientRect();
      if (rect.top <= triggerLine) {
        active = index;
      }
    });

    const firstRect = stepsTrack[0].getBoundingClientRect();
    const lastRect = stepsTrack[stepsTrack.length - 1].getBoundingClientRect();
    const start = triggerLine - firstRect.top;
    const total = Math.max(1, (lastRect.top - firstRect.top));
    const progressRatio = Math.min(Math.max(start / total, 0), 1);
    if (progress) {
      progress.style.setProperty("--process-progress", `${progressRatio}`);
    }

    setActive(active);
  };

  const onScrollOrResize = () => {
    if (raf) return;
    raf = window.requestAnimationFrame(() => {
      raf = null;
      updateByViewport();
    });
  };

  if (steps.length) {
    steps.forEach((step, index) => {
      step.addEventListener("click", () => {
        stepsTrack[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);
  if (scrollContainer) {
    scrollContainer.addEventListener("scroll", onScrollOrResize, { passive: true });
  }
  updateByViewport();
})();

// =========================
// RESULT STACK MEDIA CAROUSEL (iSocial)
// =========================
(() => {
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
        const items = Array.from(slide.querySelectorAll(".result-stack__media-item"));
        items.forEach((item, idx) => {
          const mobileSlide = document.createElement("div");
          mobileSlide.className = idx === 0 && mobileSlides.length === 0 ? "result-stack__slide is-active" : "result-stack__slide";

          const mediaGrid = document.createElement("div");
          mediaGrid.className = "result-stack__media-grid result-stack__media-grid--single";
          mediaGrid.appendChild(item.cloneNode(true));
          mobileSlide.appendChild(mediaGrid);
          mobileSlides.push(mobileSlide);
        });
      });

      if (mobileSlides.length) {
        track.replaceChildren(...mobileSlides);
      }
    }

    const slides = Array.from(track.querySelectorAll(".result-stack__slide"));
    const prevBtn = carousel.querySelector(".result-stack__btn--prev");
    const nextBtn = carousel.querySelector(".result-stack__btn--next");
    if (!slides.length) return;

    const total = slides.length;
    let index = 0;
    let transitioning = false;

    const setActive = (nextIndex) => {
      slides.forEach((slide, i) => {
        slide.classList.toggle("is-active", i === nextIndex);
      });
      index = nextIndex;
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

    setActive(0);
  });
})();

// =========================
// RESULT STACK REVEAL (iSocial)
// =========================
(() => {
  const resultSection = document.querySelector("#resultado");
  if (!resultSection) return;

  const blocks = Array.from(resultSection.querySelectorAll(".result-stack__block"));
  if (!blocks.length) return;

  const prefersReduced = prefersReducedMotion();
  if (prefersReduced) {
    blocks.forEach((block) => block.classList.add("is-visible"));
    return;
  }

  // First block visible by default
  blocks[0].classList.add("is-visible");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.2,
    rootMargin: "0px 0px -10% 0px",
  });

  blocks.slice(1).forEach((block) => observer.observe(block));
})();

// =========================
// COUNTER NUMBER MOSAIC
// =========================
(() => {
  const countupElements = Array.from(document.querySelectorAll("[data-countup-number]"));
  if (!countupElements.length) return;

  const prefersReduced = prefersReducedMotion();

  const animateNumber = (el, to) => {
    const from = 0;
    const duration = prefersReduced ? 1 : 900;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(from + (to - from) * eased);
      el.textContent = value.toString();

      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      if (el.dataset.counted === "true") return;

      const to = parseInt(el.getAttribute("data-countup-number"), 10);
      if (Number.isNaN(to)) return;

      el.dataset.counted = "true";
      animateNumber(el, to);
    });
  }, { threshold: 0.35 });

  countupElements.forEach((el) => {
    el.textContent = "0";
    observer.observe(el);
  });
})();

// REVEAL SYSTEM
(() => {
  try {
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
  } catch (e) {
    console.warn("Reveal system error:", e);
  }
})();

// CUSTOM CURSOR (desktop with fine pointer)
(() => {
  const canUseCustomCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!canUseCustomCursor) return;

  const root = document.documentElement;
  const interactiveSelector = [
    "a",
    "button",
    "[role='button']",
    "input:not([type='hidden'])",
    "select",
    "textarea",
    "label",
    "summary",
    "[tabindex]:not([tabindex='-1'])",
    "[contenteditable='true']",
  ].join(",");

  const isInteractiveTarget = (target) => {
    if (!(target instanceof Element)) return false;
    const interactiveEl = target.closest(interactiveSelector);
    if (!interactiveEl) return false;
    if (interactiveEl.matches(":disabled, [aria-disabled='true']")) return false;
    return true;
  };

  const cursor = document.createElement("div");
  cursor.className = "custom-cursor";
  cursor.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursor);
  root.classList.add("has-custom-cursor");

  const updatePosition = (x, y) => {
    root.style.setProperty("--cursor-x", `${x}`);
    root.style.setProperty("--cursor-y", `${y}`);
  };

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    updatePosition(event.clientX, event.clientY);
    root.classList.add("is-cursor-visible");
    root.classList.toggle("is-cursor-interactive", isInteractiveTarget(event.target));
  });

  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse") return;
    root.classList.toggle("is-cursor-interactive", isInteractiveTarget(event.target));
  });

  window.addEventListener("mouseout", (event) => {
    if (event.relatedTarget) return;
    root.classList.remove("is-cursor-visible");
    root.classList.remove("is-cursor-interactive");
  });

  window.addEventListener("blur", () => {
    root.classList.remove("is-cursor-visible");
    root.classList.remove("is-cursor-interactive");
  });
})();

// HERO ROTATING WORDS - SCRAMBLE EFFECT
(() => {
  const words = document.querySelectorAll(".hero-rotating__word");
  if (!words.length) return;

  const CHARS = "!@#$%&/()=?¿*+[]{}|<>";
  const INTERVAL = HERO_ROTATION_INTERVAL_MS;
  const SCRAMBLE_DURATION = HERO_SCRAMBLE_DURATION_MS;
  const SCRAMBLE_STEPS = 12;

  let current = 0;

  const scramble = (el, finalText, onDone) => {
    let step = 0;
    const stepDuration = SCRAMBLE_DURATION / SCRAMBLE_STEPS;

    const tick = setInterval(() => {
      const progress = step / SCRAMBLE_STEPS;
      const revealed = Math.floor(progress * finalText.length);

      let scrambled = finalText.slice(0, revealed);
      for (let i = revealed; i < finalText.length; i++) {
        scrambled += finalText[i] === " "
          ? " "
          : CHARS[Math.floor(Math.random() * CHARS.length)];
      }

      el.textContent = scrambled;
      step++;

      if (step > SCRAMBLE_STEPS) {
        clearInterval(tick);
        el.textContent = finalText;
        if (onDone) onDone();
      }
    }, stepDuration);
  };

  const rotate = () => {
    const currentWord = words[current];
    const nextIndex = (current + 1) % words.length;
    const nextWord = words[nextIndex];
    const finalText = nextWord.dataset.word;

    currentWord.classList.remove("is-active");
    currentWord.classList.add("is-leaving");
    setTimeout(() => currentWord.classList.remove("is-leaving"), 550);

    nextWord.classList.add("is-active");
    scramble(nextWord, finalText);
    current = nextIndex;
  };

  words.forEach((w) => {
    w.dataset.word = w.textContent.trim();
  });

  setInterval(rotate, INTERVAL);
})();

/* =========================
   REVEAL ON SCROLL (PROJECTS)
========================= */
(() => {
  const revealElements = document.querySelectorAll(".reveal-up");
  if (!revealElements.length) return;
  const shouldDelayReveal =
    document.body.classList.contains("intro-gated") ||
    document.body.classList.contains("intro-unveiling") ||
    !!document.getElementById("heroIntro");

  const startRevealUpObserver = () => {
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
    window.addEventListener("home-intro:done", startRevealUpObserver, { once: true });
  } else {
    startRevealUpObserver();
  }
})();


/* =========================
   REVEAL ON SCROLL (PROCESS)
========================= */
(() => {
  const items = document.querySelectorAll("#problemaLab .scroll-lab__item");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          entry.target.classList.remove("is-above");
        } else {
          const rect = entry.boundingClientRect;
          entry.target.classList.remove("is-visible");
          if (rect.top < 0) {
            // Sale por arriba
            entry.target.classList.add("is-above");
          } else {
            // Sale por abajo
            entry.target.classList.remove("is-above");
          }
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: `0px 0px -${SCROLL_REVEAL_OFFSET}px 0px`
    }
  );

  items.forEach((item) => observer.observe(item));
})();

// =========================
// PROCESS TIMELINE (SAGRADA)
// =========================
(() => {
  const container = document.getElementById("processTimeline");
  const track = document.getElementById("timelineTrack");
  const progress = document.getElementById("timelineProgress");
  if (!container || !track || !progress) return;

  const steps = Array.from(container.querySelectorAll(".project-process__step"));
  const bullets = Array.from(container.querySelectorAll(".project-process__bullet"));
  if (steps.length === 0 || bullets.length < 2) return;

  const shouldReduce = prefersReducedMotion();
  const clamp = (n, min, max) => Math.max(min, Math.min(n, max));

  const measure = () => {
    const containerRect = container.getBoundingClientRect();
    const firstRect = bullets[0].getBoundingClientRect();
    const lastRect = bullets[bullets.length - 1].getBoundingClientRect();

    const top = firstRect.top + firstRect.height / 2 - containerRect.top;
    const bottom = lastRect.top + lastRect.height / 2 - containerRect.top;
    const height = Math.max(0, bottom - top);

    track.style.top = `${top}px`;
    track.style.height = `${height}px`;
    progress.style.top = `${top}px`;
    progress.style.height = `${height}px`;
  };

  const updateProgress = () => {
    if (shouldReduce) {
      progress.style.transform = "scaleY(0)";
      return;
    }

    const rect = container.getBoundingClientRect();
    const vh = window.innerHeight;
    const startOffset = vh * 0.8;
    const endOffset = vh * 0.3;
    const distance = rect.height + (startOffset - endOffset);
    const raw = (startOffset - rect.top) / Math.max(1, distance);
    const ratio = clamp(raw, 0, 1);

    progress.style.transform = `scaleY(${ratio})`;
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-active", entry.isIntersecting);
    });
  }, {
    root: null,
    rootMargin: "-35% 0px -35% 0px",
    threshold: 0
  });

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
})();

// =========================
// HERO COMPARE (SAGRADA)
// =========================
(() => {
  const compare = document.getElementById("heroCompare");
  const range = document.getElementById("heroCompareRange");
  const phones = document.querySelector(".phones");
  if (!compare || !range || !phones) return;

  const RATIO = 878 / 1794;

  const clamp = (n, min, max) => Math.max(min, Math.min(n, max));
  const update = (value) => {
    const next = clamp(Number(value) || 50, 0, 100);
    compare.style.setProperty("--compare", next + "%");
  };

  const syncCompareSize = () => {
    if (window.innerWidth < BREAKPOINTS.lg) {
      compare.style.removeProperty("width");
      compare.style.removeProperty("height");
      return;
    }

    const availableHeight = phones.clientHeight;
    const availableWidth = phones.clientWidth;
    if (!availableHeight || !availableWidth) return;

    let nextHeight = availableHeight;
    let nextWidth = nextHeight * RATIO;

    if (nextWidth > availableWidth) {
      nextWidth = availableWidth;
      nextHeight = nextWidth / RATIO;
    }

    compare.style.width = `${Math.round(nextWidth)}px`;
    compare.style.height = `${Math.round(nextHeight)}px`;
  };

  update(range.value);
  range.addEventListener("input", (event) => update(event.target.value));
  syncCompareSize();
  window.addEventListener("resize", syncCompareSize, { passive: true });
  window.addEventListener("load", syncCompareSize);
})();

// =========================
// CHALLENGE GOALS (SAGRADA)
// =========================
(() => {
  const section = document.querySelector(".project-challenge");
  const intro = section?.querySelector(".project-challenge__content");
  const goalsRoot = document.getElementById("challengeGoals");
  if (!section || !intro || !goalsRoot) return;

  const OBJECTIVES = [
    {
      id: "context",
      number: "01",
      title: "Ordenar la experiencia según el momento de uso",
      description: "Separar planificación y visita para que cada bloque de la app respondiera a una necesidad concreta en el momento adecuado."
    },
    {
      id: "purchase",
      number: "02",
      title: "Integrar la compra dentro del flujo principal",
      description: "Eliminar la salida a web en un punto clave y convertir la compra en una acción continua dentro de la propia experiencia."
    },
    {
      id: "orientation",
      number: "03",
      title: "Dar más peso a la utilidad dentro del recinto",
      description: "Priorizar accesos, orientación e información práctica para que la app respondiera mejor a lo que el visitante necesita una vez ha llegado."
    },
    {
      id: "activation",
      number: "04",
      title: "Conectar contenido y navegación en una misma lógica",
      description: "Hacer que mapa, audioguía y recorrido dejaran de funcionar por separado y pasaran a formar parte de una experiencia más clara y conectada."
    }
  ];

  goalsRoot.innerHTML = OBJECTIVES.map((objective, index) => `
    <li class="project-challenge__goal" data-number="${objective.number}" style="--d:${Math.min(index * 100, 300)}ms;">
      <div>
        <span class="project-challenge__goal-num">${objective.number}</span>
        <h4 class="project-challenge__goal-title">${objective.title}</h4>
      </div>
      <p class="project-challenge__goal-desc">${objective.description}</p>
    </li>
  `).join("");

  const cards = Array.from(goalsRoot.querySelectorAll(".project-challenge__goal"));
  const shouldReduce = prefersReducedMotion();

  if (shouldReduce) {
    intro.classList.add("is-visible");
    cards.forEach((card) => card.classList.add("is-visible"));
    return;
  }

  section.classList.add("is-observed");

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      obs.unobserve(entry.target);
    });
  }, {
    root: null,
    threshold: 0.2,
    rootMargin: "0px 0px -8% 0px"
  });

  observer.observe(intro);
  cards.forEach((card) => observer.observe(card));
})();
