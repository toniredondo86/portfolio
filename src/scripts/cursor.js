export function initCursor() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

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

  const isInteractive = (target) => {
    if (!(target instanceof Element)) return false;
    const el = target.closest(interactiveSelector);
    if (!el) return false;
    return !el.matches(":disabled, [aria-disabled='true']");
  };

  const cursor = document.createElement("div");
  cursor.className = "custom-cursor";
  cursor.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursor);
  root.classList.add("has-custom-cursor");

  document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    root.style.setProperty("--cursor-x", `${e.clientX}`);
    root.style.setProperty("--cursor-y", `${e.clientY}`);
    root.classList.add("is-cursor-visible");
    root.classList.toggle("is-cursor-interactive", isInteractive(e.target));
  });

  document.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    root.classList.toggle("is-cursor-interactive", isInteractive(e.target));
  });

  window.addEventListener("mouseout", (e) => {
    if (e.relatedTarget) return;
    root.classList.remove("is-cursor-visible", "is-cursor-interactive");
  });

  window.addEventListener("blur", () => {
    root.classList.remove("is-cursor-visible", "is-cursor-interactive");
  });
}
