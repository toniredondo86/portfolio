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
  });

  // Estado inicial consistente
  closeMenu();
})();


// =========================
// PROCESS ACCORDION (solo si existe en la página)
// ✅ Para case-sagrada-familia.html
// =========================
(() => {
  const root = document.querySelector(".process-accordion");
  if (!root) return;

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

  const initial =
    items.find((i) => i.classList.contains("is-active"))?.dataset.step ||
    items[0].dataset.step;

  setActiveStep(initial);

  items.forEach((item) => {
    const btn = item.querySelector(".process-accordion__trigger");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const step = item.dataset.step;
      if (!step) return;
      setActiveStep(step);
    });
  });
})();


// =========================
// LOOP SWIPE
// =========================
(() => {
  const root = document.querySelector("#resultado");
  if (!root) return;

  const wrapper = root.querySelector("#resultLoop");
  if (!wrapper) return;

  const slides = Array.from(wrapper.querySelectorAll(".swiper-slide"));
  const total = slides.length;
  if (total < 3) return;

  const btnPrev = root.querySelector(".result-swiper__btn--prev");
  const btnNext = root.querySelector(".result-swiper__btn--next");

  let current = 1; // 1..total
  const mod = (n) => ((n - 1 + total) % total) + 1;

  const clearStates = () => {
    slides.forEach((s) => {
      s.hidden = true;
      s.classList.remove("is-center");
    });
  };

  const getStepPx = () => {
    const anyVisible = wrapper.querySelector(".swiper-slide:not([hidden])");
    const ref = anyVisible || wrapper.querySelector(".swiper-slide");
    if (!ref) return 0;

    const slideW = ref.getBoundingClientRect().width;
    const styles = getComputedStyle(wrapper);
    const gap = parseFloat(styles.gap || styles.columnGap || "0") || 0;

    return slideW + gap;
  };

  const setTransition = (on) => {
    wrapper.style.transition = on ? "transform .35s ease" : "none";
  };

  const setTransform = (px) => {
    wrapper.style.transform = `translate3d(${px}px,0,0)`;
  };

  const renderIdle = () => {
    const prev = mod(current - 1);
    const next = mod(current + 1);

    clearStates();

    const prevEl = slides[prev - 1];
    const curEl  = slides[current - 1];
    const nextEl = slides[next - 1];

    prevEl.hidden = false;
    curEl.hidden  = false;
    nextEl.hidden = false;

    curEl.classList.add("is-center");

    wrapper.appendChild(prevEl);
    wrapper.appendChild(curEl);
    wrapper.appendChild(nextEl);

    setTransition(false);
    setTransform(0);
    void wrapper.offsetWidth;
    setTransition(true);
  };

  let locked = false;

  const animateNext = () => {
    if (locked) return;
    locked = true;

    const prev  = mod(current - 1);
    const next  = mod(current + 1);
    const next2 = mod(current + 2);

    clearStates();

    const prevEl  = slides[prev - 1];
    const curEl   = slides[current - 1];
    const nextEl  = slides[next - 1];
    const next2El = slides[next2 - 1];

    prevEl.hidden  = false;
    curEl.hidden   = false;
    nextEl.hidden  = false;
    next2El.hidden = false;

    nextEl.classList.add("is-center");

    wrapper.appendChild(prevEl);
    wrapper.appendChild(curEl);
    wrapper.appendChild(nextEl);
    wrapper.appendChild(next2El);

    const step = getStepPx();

    setTransition(false);
    setTransform(0);
    void wrapper.offsetWidth;

    setTransition(true);
    requestAnimationFrame(() => setTransform(-step));

    const onEnd = (e) => {
      if (e.target !== wrapper) return;
      wrapper.removeEventListener("transitionend", onEnd);

      current = next;
      renderIdle();
      locked = false;
    };

    wrapper.addEventListener("transitionend", onEnd);
  };

  const animatePrev = () => {
    if (locked) return;
    locked = true;

    const prev2 = mod(current - 2);
    const prev  = mod(current - 1);
    const next  = mod(current + 1);

    clearStates();

    const prev2El = slides[prev2 - 1];
    const prevEl  = slides[prev - 1];
    const curEl   = slides[current - 1];
    const nextEl  = slides[next - 1];

    prev2El.hidden = false;
    prevEl.hidden  = false;
    curEl.hidden   = false;
    nextEl.hidden  = false;

    wrapper.appendChild(prev2El);
    wrapper.appendChild(prevEl);
    wrapper.appendChild(curEl);
    wrapper.appendChild(nextEl);

    const step = getStepPx();

    prevEl.classList.add("is-center");

    setTransition(false);
    setTransform(-step);
    void wrapper.offsetWidth;

    setTransition(true);
    requestAnimationFrame(() => setTransform(0));

    const onEnd = (e) => {
      if (e.target !== wrapper) return;
      wrapper.removeEventListener("transitionend", onEnd);

      current = prev;
      renderIdle();
      locked = false;
    };

    wrapper.addEventListener("transitionend", onEnd);
  };

  btnNext?.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    animateNext();
  }, { passive: false });

  btnPrev?.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    animatePrev();
  }, { passive: false });

  renderIdle();
})();

// =========================
// COUNTER NUMBER MOSAIC
// =========================
(() => {
  const els = Array.from(document.querySelectorAll("[data-countup-number]"));
  if (!els.length) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animateNumber(el, to) {
    const from = 0;
    const duration = prefersReduced ? 1 : 900;
    const start = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(from + (to - from) * eased);
      el.textContent = value.toString();

      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries) => {
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

  els.forEach((el) => {
    el.textContent = "0";
    io.observe(el);
  });
})();

// =========================
// REVEAL SYSTEM (SAFE)
// =========================
(function () {
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
      {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    revealTargets.forEach((el) => observer.observe(el));
  } catch (e) {
    console.warn("Reveal system error:", e);
  }
})();

/* =========================
   REVEAL ON SCROLL (PROJECTS)
========================= */
(function () {
  const revealEls = document.querySelectorAll('.reveal-up');
  if (!revealEls.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const delay = el.style.getPropertyValue('--d');
        if (delay) el.style.transitionDelay = delay;

        el.classList.add('is-visible');
        io.unobserve(el);
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => io.observe(el));
})();
