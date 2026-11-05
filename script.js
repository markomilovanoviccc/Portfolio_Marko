/* ==================================================
   EINSTELLUNGEN
================================================== */

const TITLES = ["Marko Milovanovic", "Portfolio", "Ideas into Impact"];
const TITLE_INTERVAL = 3200;

const REVEAL_GROUPS = [
  [".card, .timeline-item, .document-preview, .teaser-visual", "up"],
  [".step", "line"],
  [".portrait, .video-frame, .award, .brochure-preview", "media"],
  [".tag", "pill"],
  [
    `main > section h2, .section-label, .section-text, .section-head p,
     .section-head .button, .prose > p, .statement, .pillars, .text-link,
     .button-row, .next-label, .next-link, .contact-socials > *, .legal-section`,
    "up"
  ]
];

const NO_REVEAL_INSIDE = ".hero, .brochure-viewer";

/* ==================================================
   HILFSFUNKTIONEN
================================================== */

const root = document.documentElement;

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const hasMouse = window.matchMedia(
  "(hover: hover) and (pointer: fine)"
).matches;

/* Führt eine Funktion höchstens einmal pro Bild aus. */
function onScrollAndResize(update) {
  let isQueued = false;

  function queueUpdate() {
    if (isQueued) {
      return;
    }

    isQueued = true;

    window.requestAnimationFrame(() => {
      update();
      isQueued = false;
    });
  }

  window.addEventListener("scroll", queueUpdate, { passive: true });
  window.addEventListener("resize", queueUpdate);

  update();
}

/* Meldet jedes Element einmal, sobald es sichtbar wird. */
function whenVisible(elements, callback, options) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .map((entry) => entry.target);

    visible.forEach((element) => observer.unobserve(element));

    if (visible.length) {
      callback(visible);
    }
  }, options);

  elements.forEach((element) => observer.observe(element));
}

/* ==================================================
   INTRO UND TITEL AUF DER STARTSEITE
================================================== */

function setupIntro() {
  const intro = document.querySelector(".intro");

  if (!intro) {
    return;
  }

  try {
    sessionStorage.setItem("intro-seen", "true");
  } catch {
    /* Ohne Speicher läuft das Intro einfach bei jedem Besuch. */
  }

  intro.addEventListener("click", () => {
    root.classList.add("no-intro");
  });
}

function setupTitle() {
  const title = document.getElementById("title");

  if (!title || reducedMotion) {
    return;
  }

  const titleText = document.createElement("span");
  let currentIndex = 0;
  let isAnimating = false;

  titleText.className = "title-pop";
  titleText.textContent = TITLES[currentIndex];
  title.replaceChildren(titleText);

  async function changeTitle() {
    if (isAnimating || document.hidden) {
      return;
    }

    isAnimating = true;

    await titleText.animate(
      [
        { opacity: 1, filter: "blur(0)", transform: "scale(1)" },
        { opacity: 0, filter: "blur(12px)", transform: "scale(0.72)" }
      ],
      {
        duration: 280,
        easing: "cubic-bezier(0.55, 0, 1, 0.45)",
        fill: "forwards"
      }
    ).finished;

    currentIndex = (currentIndex + 1) % TITLES.length;
    titleText.textContent = TITLES[currentIndex];

    await titleText.animate(
      [
        { opacity: 0, filter: "blur(15px)", transform: "scale(0.58)" },
        { opacity: 1, filter: "blur(2px)", transform: "scale(1.08)", offset: 0.7 },
        { opacity: 1, filter: "blur(0)", transform: "scale(1)" }
      ],
      {
        duration: 620,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "forwards"
      }
    ).finished;

    isAnimating = false;
  }

  window.setInterval(changeTitle, TITLE_INTERVAL);
}

/* ==================================================
   EINBLENDEN BEIM SCROLLEN
   Neue Inhalte brauchen keine zusätzlichen Klassen.
================================================== */

function setupScrollReveal() {
  if (reducedMotion) {
    return;
  }

  const targets = [];

  REVEAL_GROUPS.forEach(([selector, type]) => {
    document.querySelectorAll(selector).forEach((element) => {
      const isTaken =
        element.closest(NO_REVEAL_INSIDE) ||
        element.closest("[data-reveal]");

      if (!isTaken) {
        element.dataset.reveal = type;
        targets.push(element);
      }
    });
  });

  function reveal(elements) {
    const inPageOrder = [...elements].sort((first, second) =>
      first.compareDocumentPosition(second) &
      Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1
    );

    inPageOrder.forEach((element, index) => {
      const step = element.dataset.reveal === "pill" ? 35 : 75;
      const delay = Math.min(index * step, 420);

      element.style.setProperty("--delay", `${delay}ms`);
      element.classList.add("is-visible");

      /* Danach gelten wieder die normalen Hover-Effekte. */
      window.setTimeout(() => {
        element.removeAttribute("data-reveal");
        element.classList.remove("is-visible");
        element.style.removeProperty("--delay");
      }, delay + 1500);
    });
  }

  whenVisible(targets, reveal, {
    threshold: 0.08,
    rootMargin: "0px 0px -6% 0px"
  });
}

/* ==================================================
   HEADER UND ZEITLEISTE
================================================== */

function setupHeader() {
  const header = document.querySelector(".site-header");

  onScrollAndResize(() => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  });
}

function setupTimeline() {
  const timeline = document.querySelector(".timeline");

  if (!timeline) {
    return;
  }

  const items = timeline.querySelectorAll(".timeline-item");

  onScrollAndResize(() => {
    const focusLine = window.innerHeight * 0.65;
    const box = timeline.getBoundingClientRect();
    const progress = (focusLine - box.top) / box.height;

    timeline.style.setProperty(
      "--progress",
      Math.min(1, Math.max(0, progress)).toFixed(4)
    );

    items.forEach((item) => {
      const isPassed = item.getBoundingClientRect().top < focusLine;

      item.classList.toggle("is-passed", isPassed);
    });
  });
}

/* ==================================================
   ZAHLEN ZÄHLEN HOCH
================================================== */

function countUp(element) {
  const original = element.textContent.trim();
  const match = original.match(/^(\D*)(\d[\d’]*)(\D*)$/);

  if (!match) {
    return;
  }

  const [, prefix, digits, suffix] = match;
  const target = Number(digits.replace(/’/g, ""));
  const hasSeparator = digits.includes("’");
  const duration = 1400;
  const start = performance.now();

  function format(value) {
    const text = String(value);

    return hasSeparator
      ? text.replace(/\B(?=(\d{3})+$)/g, "’")
      : text;
  }

  function step(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 4);

    element.textContent =
      prefix + format(Math.round(target * eased)) + suffix;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }

  window.requestAnimationFrame(step);
}

function setupCountUp() {
  if (!reducedMotion) {
    whenVisible(
      document.querySelectorAll(".card--stat strong, .card--glass strong"),
      (numbers) => numbers.forEach(countUp),
      { threshold: 0.6 }
    );
  }
}

/* ==================================================
   EFFEKTE MIT DER MAUS
================================================== */

function setupCardGlow() {
  document.addEventListener("pointermove", (event) => {
    const card = event.target.closest(".card");

    if (!card) {
      return;
    }

    const box = card.getBoundingClientRect();

    card.style.setProperty("--mouse-x", `${event.clientX - box.left}px`);
    card.style.setProperty("--mouse-y", `${event.clientY - box.top}px`);
  });
}

function setupHeroDepth() {
  const hero = document.querySelector(".hero");
  const title = hero?.querySelector("h1");

  if (!title) {
    return;
  }

  hero.addEventListener("pointermove", (event) => {
    const box = hero.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;

    title.style.translate = `${x * 14}px ${y * 10}px`;
  });

  hero.addEventListener("pointerleave", () => {
    title.style.removeProperty("translate");
  });
}

/* ==================================================
   BROSCHÜRE MIT 3D-BLÄTTEREFFEKT
================================================== */

function setupBrochure() {
  const book = document.querySelector("#brochureBook");

  if (!book) {
    return;
  }

  const leftPage = document.querySelector("#brochureLeftPage");
  const rightPage = document.querySelector("#brochureRightPage");
  const rightWrapper = document.querySelector("#brochureRightWrapper");
  const previousButton = document.querySelector("#brochurePrev");
  const nextButton = document.querySelector("#brochureNext");
  const counter = document.querySelector("#brochurePageCounter");
  const progressBar = document.querySelector("#brochureProgress");

  const PAGE_COUNT = 20;
  const TURN_MIDDLE = 360;
  const TURN_END = 760;
  const SWIPE_DISTANCE = 45;

  /* Titel- und Rückseite einzeln, dazwischen Doppelseiten */
  const spreads = [[1]];

  for (let page = 2; page < PAGE_COUNT; page += 2) {
    spreads.push([page, page + 1]);
  }

  spreads.push([PAGE_COUNT]);

  let currentSpread = 0;
  let isTurning = false;
  let touchStartX = null;

  function pageSource(page) {
    const number = String(page).padStart(2, "0");

    return `broschuere-seiten/seite-${number}.webp`;
  }

  function preloadNeighbours() {
    [currentSpread - 1, currentSpread + 1].forEach((index) => {
      (spreads[index] || []).forEach((page) => {
        new Image().src = pageSource(page);
      });
    });
  }

  function updateButtons() {
    previousButton.disabled = currentSpread === 0;
    nextButton.disabled = currentSpread === spreads.length - 1;
  }

  function render() {
    const [left, right] = spreads[currentSpread];

    leftPage.src = pageSource(left);
    leftPage.alt = `Broschüre Seite ${left}`;

    if (right) {
      rightPage.src = pageSource(right);
      rightPage.alt = `Broschüre Seite ${right}`;
      counter.textContent = `Seiten ${left}–${right} von ${PAGE_COUNT}`;
    } else {
      counter.textContent = `Seite ${left} von ${PAGE_COUNT}`;
    }

    rightWrapper.hidden = !right;
    book.classList.toggle("is-single", !right);

    progressBar.style.width =
      `${((currentSpread + 1) / spreads.length) * 100}%`;

    updateButtons();
    preloadNeighbours();
  }

  function createFace(side, page) {
    const face = document.createElement("div");
    const image = document.createElement("img");

    face.className = `brochure-leaf-face brochure-leaf-${side}`;
    image.src = pageSource(page);
    image.alt = "";
    face.appendChild(image);

    return face;
  }

  function createLeaf(direction, nextPages) {
    const currentPages = spreads[currentSpread];
    const isForward = direction > 0;
    const leaf = document.createElement("div");

    const frontPage = isForward
      ? currentPages[1] || currentPages[0]
      : currentPages[0];

    const backPage = isForward
      ? nextPages[0]
      : nextPages[1] || nextPages[0];

    leaf.className =
      `brochure-turning-leaf ${isForward ? "turn-forward" : "turn-back"}`;

    leaf.append(createFace("front", frontPage), createFace("back", backPage));
    book.appendChild(leaf);

    return leaf;
  }

  function turnPage(direction) {
    const nextSpread = currentSpread + direction;

    if (isTurning || !spreads[nextSpread]) {
      return;
    }

    isTurning = true;
    previousButton.disabled = true;
    nextButton.disabled = true;

    const leaf = createLeaf(direction, spreads[nextSpread]);

    /* Zwei Bilder warten, damit der Browser den Start kennt. */
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        leaf.classList.add("is-turning");
      });
    });

    window.setTimeout(() => {
      currentSpread = nextSpread;
      render();
      previousButton.disabled = true;
      nextButton.disabled = true;
    }, TURN_MIDDLE);

    window.setTimeout(() => {
      leaf.remove();
      isTurning = false;
      updateButtons();
    }, TURN_END);
  }

  nextButton.addEventListener("click", () => turnPage(1));
  previousButton.addEventListener("click", () => turnPage(-1));

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      turnPage(1);
    }

    if (event.key === "ArrowLeft") {
      turnPage(-1);
    }
  });

  book.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
    },
    { passive: true }
  );

  book.addEventListener(
    "touchend",
    (event) => {
      const distance = event.changedTouches[0].clientX - touchStartX;

      if (Math.abs(distance) > SWIPE_DISTANCE) {
        turnPage(distance < 0 ? 1 : -1);
      }
    },
    { passive: true }
  );

  render();
}

/* ==================================================
   START
================================================== */

document.addEventListener("DOMContentLoaded", () => {
  setupIntro();
  setupTitle();
  setupScrollReveal();
  setupHeader();
  setupTimeline();
  setupCountUp();
  setupBrochure();

  if (hasMouse && !reducedMotion) {
    setupCardGlow();
    setupHeroDepth();
  }
});
