import { prefersReducedMotion } from "./utils.js";

const OBJECTIVES_SAFA = [
  {
    number: "01",
    title: "Ordenar la experiencia según el momento de uso",
    description:
      "Separar planificación y visita para que cada bloque de la app respondiera a una necesidad concreta en el momento adecuado.",
  },
  {
    number: "02",
    title: "Integrar la compra dentro del flujo principal",
    description:
      "Eliminar la salida a web en un punto clave y convertir la compra en una acción continua dentro de la propia experiencia.",
  },
  {
    number: "03",
    title: "Dar más peso a la utilidad dentro del recinto",
    description:
      "Priorizar accesos, orientación e información práctica para que la app respondiera mejor a lo que el visitante necesita una vez ha llegado.",
  },
  {
    number: "04",
    title: "Conectar contenido y navegación en una misma lógica",
    description:
      "Hacer que mapa, audioguía y recorrido dejaran de funcionar por separado y pasaran a formar parte de una experiencia más clara y conectada.",
  },
];

const OBJECTIVES_ISOCIAL = [
  {
    number: "01",
    title: "Definir los tokens de diseño",
    description:
      "Traducir el branding del cliente en variables de color, tipografía y espaciado aplicables de forma sistemática en todo el producto.",
  },
  {
    number: "02",
    title: "Construir una librería de componentes",
    description:
      "Crear componentes reutilizables en Figma que cubrieran los patrones de interfaz de Nidus, desde botones y formularios hasta estructuras de navegación.",
  },
  {
    number: "03",
    title: "Garantizar la consistencia visual",
    description:
      "Establecer criterios claros para que cada decisión de diseño siguiera el mismo sistema, independientemente de la pantalla o el flujo.",
  },
  {
    number: "04",
    title: "Documentar para desarrollo",
    description:
      "Crear una documentación clara y accesible para el equipo de desarrollo, facilitando el handoff y la implementación del sistema.",
  },
];

const OBJECTIVES = document.body.classList.contains("case-isocial")
  ? OBJECTIVES_ISOCIAL
  : OBJECTIVES_SAFA;

function createGoalItem(objective, index) {
  const li = document.createElement("li");
  li.className = "project-challenge__goal";
  li.dataset.number = objective.number;
  // Stagger delay: 0ms, 100ms, 200ms, capped at 300ms for cards beyond index 3
  li.style.setProperty("--d", `${Math.min(index * 100, 300)}ms`);

  const topRow = document.createElement("div");

  const numSpan = document.createElement("span");
  numSpan.className = "project-challenge__goal-num";
  numSpan.textContent = objective.number;

  const title = document.createElement("h4");
  title.className = "project-challenge__goal-title";
  title.textContent = objective.title;

  topRow.appendChild(numSpan);
  topRow.appendChild(title);

  const desc = document.createElement("p");
  desc.className = "project-challenge__goal-desc";
  desc.textContent = objective.description;

  li.appendChild(topRow);
  li.appendChild(desc);

  return li;
}

export function initGoals() {
  const section = document.querySelector(".project-challenge");
  const intro = section?.querySelector(".project-challenge__content");
  const goalsRoot = document.getElementById("challengeGoals");
  if (!section || !intro || !goalsRoot) return;

  const fragment = document.createDocumentFragment();
  OBJECTIVES.forEach((obj, i) => fragment.appendChild(createGoalItem(obj, i)));
  goalsRoot.appendChild(fragment);

  const cards = Array.from(goalsRoot.querySelectorAll(".project-challenge__goal"));
  const shouldReduce = prefersReducedMotion();

  if (shouldReduce) {
    intro.classList.add("is-visible");
    cards.forEach((card) => card.classList.add("is-visible"));
    return;
  }

  section.classList.add("is-observed");

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
  );

  observer.observe(intro);
  cards.forEach((card) => observer.observe(card));
}
