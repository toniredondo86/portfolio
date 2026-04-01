import { BREAKPOINTS } from "./utils.js";

export function initNav() {
  const nav = document.getElementById("siteNav");
  const toggle = nav?.querySelector(".hamburger");
  const dropdown = document.getElementById("navDropdown");
  const overlay = document.getElementById("navOverlay");

  if (!nav || !toggle || !dropdown || !overlay) return;

  let overlayHideTimer = null;
  let syncRaf = null;

  const getFocusableElements = () =>
    Array.from(
      dropdown.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute("hidden") && !el.getAttribute("aria-hidden"));

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
    requestAnimationFrame(() => dropdown.querySelector("a")?.focus());
  };

  const closeMenu = ({ restoreFocus = false } = {}) => {
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
    if (restoreFocus) {
      requestAnimationFrame(() => toggle.focus());
    }
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
    if (!isOpen()) return;

    if (e.key === "Escape") {
      closeMenu({ restoreFocus: true });
      return;
    }

    if (e.key !== "Tab") return;

    const focusable = getFocusableElements();
    if (!focusable.length) {
      e.preventDefault();
      toggle.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
      if (active === first || active === toggle) {
        e.preventDefault();
        last.focus();
      }
      return;
    }

    if (active === last) {
      e.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= BREAKPOINTS.md && isOpen()) closeMenu();
    scheduleSyncNavBottomVar();
  });

  window.addEventListener("scroll", scheduleSyncNavBottomVar, { passive: true });
  window.addEventListener("orientationchange", scheduleSyncNavBottomVar);
  window.addEventListener("load", scheduleSyncNavBottomVar, { once: true });

  if ("ResizeObserver" in window) {
    const navResizeObserver = new ResizeObserver(() => scheduleSyncNavBottomVar());
    navResizeObserver.observe(nav);
  }

  closeMenu();
  scheduleSyncNavBottomVar();
}
