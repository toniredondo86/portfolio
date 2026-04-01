import { prefersReducedMotion, HERO_INTRO_REVEAL_MS } from "./utils.js";

const VISITED_KEY = "portfolio_visited";

export function initHeroIntro() {
  if (!document.body.classList.contains("home")) return;

  const intro = document.getElementById("heroIntro");
  const mount = document.getElementById("heroIntroLogo");
  if (!intro) return;

  const announceIntroDone = () => {
    window.dispatchEvent(new CustomEvent("home-intro:done"));
  };

  const hasVisited = localStorage.getItem(VISITED_KEY);

  if (!mount || hasVisited) {
    intro.remove();
    announceIntroDone();
    if (!hasVisited) localStorage.setItem(VISITED_KEY, "1");
    return;
  }

  localStorage.setItem(VISITED_KEY, "1");

  document.body.classList.add("intro-gated");

  const reduceMotion = prefersReducedMotion();
  const INTRO_OUT_AT = reduceMotion ? 700 : 1500;

  setTimeout(() => intro.classList.add("is-out"), INTRO_OUT_AT);
  // Extra 1000ms pause after fade-out before removing the intro element,
  // giving the CSS transition time to complete before unveiling page content
  setTimeout(() => {
    intro.remove();
    document.body.classList.add("intro-unveiling");
    requestAnimationFrame(() => document.body.classList.remove("intro-gated"));
    setTimeout(() => {
      document.body.classList.remove("intro-unveiling");
      announceIntroDone();
    }, HERO_INTRO_REVEAL_MS);
  }, INTRO_OUT_AT + 1000);
}
