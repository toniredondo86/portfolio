export const BREAKPOINTS = { md: 768, lg: 1024 };
export const MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";
export const SCROLL_REVEAL_OFFSET = 120;
export const STACK_TRANSITION_MS = 450;
export const HERO_INTRO_REVEAL_MS = 1100;
export const HERO_ROTATION_INTERVAL_MS = 2400;
export const HERO_SCRAMBLE_DURATION_MS = 750;

export const prefersReducedMotion = () => window.matchMedia(MOTION_MEDIA_QUERY).matches;
export const clamp = (n, min, max) => Math.max(min, Math.min(n, max));
