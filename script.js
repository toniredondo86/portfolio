// script.js

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
    if (window.innerWidth >= 768 && isOpen()) closeMenu();
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
  const sourceLogo = document.querySelector(".navbar-logo");
  if (!intro) return;

  const announceIntroDone = () => {
    window.dispatchEvent(new CustomEvent("home-intro:done"));
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!mount || !sourceLogo || reduceMotion) {
    intro.remove();
    announceIntroDone();
    return;
  }

  document.body.classList.add("intro-gated");

  const logo = sourceLogo.cloneNode(true);
  logo.classList.remove("navbar-logo");
  logo.classList.add("hero-intro__logo-svg");
  logo.removeAttribute("width");
  logo.removeAttribute("height");
  mount.appendChild(logo);

  const isBlackFill = (el) => {
    const fill = (el.getAttribute("fill") || "").trim().toLowerCase();
    return fill === "black" || fill === "#000" || fill === "#000000" || fill === "rgb(0,0,0)";
  };

  const wordmarkParts = [...logo.querySelectorAll("path")].filter(isBlackFill);
  const track = logo.querySelector("rect[fill='#E1443B'], rect[fill='#e1443b']");
  const dot = logo.querySelector("circle[fill='white'], circle[fill='#fff'], circle[fill='#ffffff']");
  track?.classList.add("hero-intro__toggle-track");
  dot?.classList.add("hero-intro__toggle-dot");

  if (!wordmarkParts.length) {
    intro.remove();
    document.body.classList.remove("intro-gated");
    announceIntroDone();
    return;
  }

  const svgNS = "http://www.w3.org/2000/svg";
  const uid = `intro-clip-${Date.now().toString(36)}`;
  const defs = document.createElementNS(svgNS, "defs");
  const clipPath = document.createElementNS(svgNS, "clipPath");
  clipPath.setAttribute("id", uid);
  clipPath.setAttribute("clipPathUnits", "userSpaceOnUse");
  const clipCircle = document.createElementNS(svgNS, "circle");
  clipPath.appendChild(clipCircle);
  defs.appendChild(clipPath);
  logo.prepend(defs);

  const group = document.createElementNS(svgNS, "g");
  wordmarkParts.forEach((p) => group.appendChild(p));
  group.setAttribute("clip-path", `url(#${uid})`);
  logo.appendChild(group);

  const cx = dot ? parseFloat(dot.getAttribute("cx") || "60") : 60;
  const cy = dot ? parseFloat(dot.getAttribute("cy") || "18.667") : 18.667;
  clipCircle.setAttribute("cx", `${cx}`);
  clipCircle.setAttribute("cy", `${cy}`);
  clipCircle.setAttribute("r", "0");

  const b = group.getBBox();
  const maxR = Math.max(
    Math.hypot(b.x - cx, b.y - cy),
    Math.hypot(b.x + b.width - cx, b.y - cy),
    Math.hypot(b.x - cx, b.y + b.height - cy),
    Math.hypot(b.x + b.width - cx, b.y + b.height - cy)
  ) + 2;

  const reveal = () => {
    const duration = 880;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      clipCircle.setAttribute("r", `${maxR * eased}`);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const TOGGLE_ON_AT = 800;
  const LOGO_VISIBLE_AT = 1300;
  const INTRO_OUT_AT = LOGO_VISIBLE_AT + 880 + 1000;

  setTimeout(() => intro.classList.add("is-toggle-on"), TOGGLE_ON_AT);
  setTimeout(reveal, LOGO_VISIBLE_AT);
  setTimeout(() => intro.classList.add("is-out"), INTRO_OUT_AT);
  setTimeout(() => {
    intro.remove();
    document.body.classList.add("intro-unveiling");
    requestAnimationFrame(() => document.body.classList.remove("intro-gated"));
    setTimeout(() => {
      document.body.classList.remove("intro-unveiling");
      announceIntroDone();
    }, 1100);
  }, INTRO_OUT_AT + 1000);
})();

// =========================
// PROCESS ACCORDION (solo si existe en la página)
// ✅ Para case-sagrada-familia.html
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
// SCROLL LAB (CENTER STACK)
// =========================
(() => {
  // Normal scroll behavior: no snap/swipe logic on the right column.
  // Intentionally left as a no-op for this section.
})();

// =========================
// RESULT CAROUSEL (configurable: fade | slide)
// =========================
(() => {
  const initResultCarousel = ({
    rootSelector,
    trackSelector,
    mode,
    slideSelector,
    prevBtnSelector,
    nextBtnSelector,
    viewportSelector,
    fadeMs = 450,
  }) => {
    const root = document.querySelector(rootSelector);
    if (!root) return;

    const track = root.querySelector(trackSelector);
    if (!track) return;

    const prevBtns = Array.from(root.querySelectorAll(prevBtnSelector));
    const nextBtns = Array.from(root.querySelectorAll(nextBtnSelector));
    if (prevBtns.length === 0 || nextBtns.length === 0) return;

    if (mode === "fade") {
      const viewport = viewportSelector ? root.querySelector(viewportSelector) : null;
      const slides = Array.from(track.querySelectorAll(slideSelector));
      const total = slides.length;
      if (!viewport || total === 0) return;

      let index = 0;
      let transitioning = false;

      const updateMobileNavPosition = () => {
        if (window.innerWidth > 900) {
          viewport.style.removeProperty("--result-content-h");
          return;
        }

        const active = slides[index];
        const content = active?.querySelector(".result-compare__content");
        const h = content ? content.offsetHeight : 0;
        viewport.style.setProperty("--result-content-h", `${h}px`);
      };

      const activate = (nextIndex) => {
        if (transitioning || nextIndex === index) return;
        transitioning = true;

        const current = slides[index];
        const next = slides[nextIndex];
        if (!current || !next) {
          transitioning = false;
          return;
        }

        track.classList.add("is-fading");

        window.setTimeout(() => {
          current.classList.remove("is-active");
          next.classList.add("is-active");
          track.classList.remove("is-fading");
          index = nextIndex;
          updateMobileNavPosition();
          transitioning = false;
        }, fadeMs);
      };

      prevBtns.forEach((btn) => btn.addEventListener("click", () => activate((index - 1 + total) % total)));
      nextBtns.forEach((btn) => btn.addEventListener("click", () => activate((index + 1) % total)));

      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === 0));
      updateMobileNavPosition();
      window.addEventListener("resize", updateMobileNavPosition);
      return;
    }

    if (mode === "slide") {
      const slides = Array.from(track.querySelectorAll(slideSelector));
      const total = slides.length;
      if (total < 3) return;

      let current = 1; // 1..total
      let locked = false;
      const mod = (n) => ((n - 1 + total) % total) + 1;

      const clearStates = () => {
        slides.forEach((slide) => {
          slide.hidden = true;
          slide.classList.remove("is-center");
        });
      };

      const getStepPx = () => {
        const anyVisible = track.querySelector(`${slideSelector}:not([hidden])`);
        const ref = anyVisible || track.querySelector(slideSelector);
        if (!ref) return 0;

        const slideW = ref.getBoundingClientRect().width;
        const styles = getComputedStyle(track);
        const gap = parseFloat(styles.gap || styles.columnGap || "0") || 0;
        return slideW + gap;
      };

      const setTransition = (enabled) => {
        track.style.transition = enabled ? "transform .35s ease" : "none";
      };

      const setTransform = (px) => {
        track.style.transform = `translate3d(${px}px,0,0)`;
      };

      const waitForTrackTransition = (onEnd) => {
        const handleTransitionEnd = (e) => {
          if (e.target !== track) return;
          track.removeEventListener("transitionend", handleTransitionEnd);
          onEnd();
        };

        track.addEventListener("transitionend", handleTransitionEnd);
      };

      const renderIdle = () => {
        const prev = mod(current - 1);
        const next = mod(current + 1);

        clearStates();

        const prevEl = slides[prev - 1];
        const curEl = slides[current - 1];
        const nextEl = slides[next - 1];

        prevEl.hidden = false;
        curEl.hidden = false;
        nextEl.hidden = false;

        curEl.classList.add("is-center");

        track.appendChild(prevEl);
        track.appendChild(curEl);
        track.appendChild(nextEl);

        setTransition(false);
        setTransform(0);
        void track.offsetWidth;
        setTransition(true);
      };

      const animateNext = () => {
        if (locked) return;
        locked = true;

        const prev = mod(current - 1);
        const next = mod(current + 1);
        const next2 = mod(current + 2);

        clearStates();

        const prevEl = slides[prev - 1];
        const curEl = slides[current - 1];
        const nextEl = slides[next - 1];
        const next2El = slides[next2 - 1];

        prevEl.hidden = false;
        curEl.hidden = false;
        nextEl.hidden = false;
        next2El.hidden = false;

        nextEl.classList.add("is-center");

        track.appendChild(prevEl);
        track.appendChild(curEl);
        track.appendChild(nextEl);
        track.appendChild(next2El);

        const step = getStepPx();

        setTransition(false);
        setTransform(0);
        void track.offsetWidth;

        setTransition(true);
        requestAnimationFrame(() => setTransform(-step));

        waitForTrackTransition(() => {
          current = next;
          renderIdle();
          locked = false;
        });
      };

      const animatePrev = () => {
        if (locked) return;
        locked = true;

        const prev2 = mod(current - 2);
        const prev = mod(current - 1);
        const next = mod(current + 1);

        clearStates();

        const prev2El = slides[prev2 - 1];
        const prevEl = slides[prev - 1];
        const curEl = slides[current - 1];
        const nextEl = slides[next - 1];

        prev2El.hidden = false;
        prevEl.hidden = false;
        curEl.hidden = false;
        nextEl.hidden = false;

        track.appendChild(prev2El);
        track.appendChild(prevEl);
        track.appendChild(curEl);
        track.appendChild(nextEl);

        const step = getStepPx();

        prevEl.classList.add("is-center");

        setTransition(false);
        setTransform(-step);
        void track.offsetWidth;

        setTransition(true);
        requestAnimationFrame(() => setTransform(0));

        waitForTrackTransition(() => {
          current = prev;
          renderIdle();
          locked = false;
        });
      };

      nextBtns.forEach((btn) => {
        btn.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          animateNext();
        }, { passive: false });
      });

      prevBtns.forEach((btn) => {
        btn.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          animatePrev();
        }, { passive: false });
      });

      renderIdle();
    }
  };

  initResultCarousel({
    rootSelector: "#resultado",
    trackSelector: "#resultCompareTrack",
    mode: "fade",
    slideSelector: ".result-compare__slide",
    prevBtnSelector: ".result-compare__btn--prev",
    nextBtnSelector: ".result-compare__btn--next",
    viewportSelector: ".result-compare__viewport",
  });

  initResultCarousel({
    rootSelector: "#resultado",
    trackSelector: "#resultLoop",
    mode: "slide",
    slideSelector: ".swiper-slide",
    prevBtnSelector: ".result-swiper__btn--prev",
    nextBtnSelector: ".result-swiper__btn--next",
  });
})();

// =========================
// RESULT STACK MEDIA CAROUSEL (iSocial)
// =========================
(() => {
  const mediaCarousels = Array.from(document.querySelectorAll("[data-result-media-carousel]"));
  if (!mediaCarousels.length) return;

  const isMobile = window.matchMedia("(max-width: 900px)").matches;

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
      }, 450);
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

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  const INTERVAL = 2400;
  const SCRAMBLE_DURATION = 750;
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
  const items = document.querySelectorAll(".scroll-lab__item");
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
      rootMargin: "0px 0px -120px 0px"
    }
  );

  items.forEach((item) => observer.observe(item));
})();
