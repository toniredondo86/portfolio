export function initComponentTabs() {
  const tabsRoot = document.querySelector(".component-tabs");
  if (!tabsRoot) return;

  const tabs = Array.from(tabsRoot.querySelectorAll("[data-product-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-product-panel]"));
  if (!tabs.length || !panels.length) return;

  const activateTab = (target) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.productTab === target;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.productPanel === target;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab.dataset.productTab));

    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      event.preventDefault();
      const nextIndex =
        event.key === "ArrowRight"
          ? (index + 1) % tabs.length
          : (index - 1 + tabs.length) % tabs.length;

      const nextTab = tabs[nextIndex];
      activateTab(nextTab.dataset.productTab);
      nextTab.focus();
    });
  });
}
