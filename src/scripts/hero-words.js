import { HERO_ROTATION_INTERVAL_MS, HERO_SCRAMBLE_DURATION_MS } from "./utils.js";

export function initHeroWords() {
  const words = document.querySelectorAll(".hero-rotating__word");
  if (!words.length) return;

  const CHARS = "!@#$%&/()=?¿*+[]{}|<>";
  const SCRAMBLE_STEPS = 12;
  const stepDuration = HERO_SCRAMBLE_DURATION_MS / SCRAMBLE_STEPS;

  let current = 0;

  const scramble = (el, finalText) => {
    let step = 0;
    const tick = setInterval(() => {
      const revealed = Math.floor((step / SCRAMBLE_STEPS) * finalText.length);
      let scrambled = finalText.slice(0, revealed);
      for (let i = revealed; i < finalText.length; i++) {
        scrambled +=
          finalText[i] === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      el.textContent = scrambled;
      if (++step > SCRAMBLE_STEPS) {
        clearInterval(tick);
        el.textContent = finalText;
      }
    }, stepDuration);
  };

  const rotate = () => {
    const currentWord = words[current];
    const nextIndex = (current + 1) % words.length;
    const nextWord = words[nextIndex];

    currentWord.classList.remove("is-active");
    currentWord.classList.add("is-leaving");
    // 550ms matches the CSS transition duration for .hero-rotating__word.is-leaving
    setTimeout(() => currentWord.classList.remove("is-leaving"), 550);

    nextWord.classList.add("is-active");
    scramble(nextWord, nextWord.dataset.word);
    current = nextIndex;
  };

  words.forEach((w) => {
    w.dataset.word = w.textContent.trim();
  });

  setInterval(rotate, HERO_ROTATION_INTERVAL_MS);
}
