export function initAriaDisabled() {
  document.querySelectorAll("a[aria-disabled='true']").forEach((el) => {
    el.addEventListener("click", (e) => e.preventDefault());
  });
}

export function initEmailLinks() {
  // Email stored in data attributes to prevent bot scraping.
  document.querySelectorAll("[data-email-user][data-email-domain]").forEach((el) => {
    el.href = "mailto:" + el.dataset.emailUser + "@" + el.dataset.emailDomain;
  });
}
