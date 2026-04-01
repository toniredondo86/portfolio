import { initNav } from "./scripts/nav.js";
import { initHeroIntro } from "./scripts/hero-intro.js";
import { initHeroWords } from "./scripts/hero-words.js";
import { initHeroCompare } from "./scripts/hero-compare.js";
import { initTimeline } from "./scripts/timeline.js";
import { initCounters } from "./scripts/counters.js";
import { initReveal, initRevealUp, initRevealProcess } from "./scripts/reveal.js";
import { initCursor } from "./scripts/cursor.js";
import { initGoals, initPrinciples } from "./scripts/goals.js";
import { initComponentTabs } from "./scripts/component-tabs.js";
import { initAriaDisabled, initEmailLinks } from "./scripts/interactions.js";

document.documentElement.classList.add("js");

initNav();
initHeroIntro();
initHeroWords();
initHeroCompare();
initTimeline();
initCounters();
initReveal();
initRevealUp();
initRevealProcess();
initCursor();
initGoals();
initPrinciples();
initComponentTabs();
initAriaDisabled();
initEmailLinks();
