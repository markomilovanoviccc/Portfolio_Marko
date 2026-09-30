document.addEventListener("DOMContentLoaded", () => {
  setupTitleAnimation();
  setupBrochureViewer();
});

/* ==================================================
   TITELANIMATION AUF DER STARTSEITE
================================================== */

function setupTitleAnimation() {
  const title = document.getElementById("title");

  if (!title) {
    return;
  }

  const titles = [
    "Marko Milovanovic",
    "Portfolio",
    "Ideas into Impact"
  ];

  let currentIndex = 0;
  let isAnimating = false;

  const titleText = document.createElement("span");

  titleText.classList.add("title-pop");
  titleText.textContent = titles[currentIndex];

  title.textContent = "";
  title.appendChild(titleText);

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reducedMotion) {
    return;
  }

  function changeTitle() {
    if (isAnimating) {
      return;
    }

    isAnimating = true;

    const disappear = titleText.animate(
      [
        {
          opacity: 1,
          filter: "blur(0)",
          transform: "scale(1)"
        },
        {
          opacity: 0,
          filter: "blur(12px)",
          transform: "scale(0.72)"
        }
      ],
      {
        duration: 280,
        easing: "cubic-bezier(0.55, 0, 1, 0.45)",
        fill: "forwards"
      }
    );

    disappear.finished.then(() => {
      currentIndex =
        (currentIndex + 1) % titles.length;

      titleText.textContent =
        titles[currentIndex];

      const appear = titleText.animate(
        [
          {
            opacity: 0,
            filter: "blur(15px)",
            transform: "scale(0.58)"
          },
          {
            opacity: 1,
            filter: "blur(2px)",
            transform: "scale(1.08)",
            offset: 0.7
          },
          {
            opacity: 1,
            filter: "blur(0)",
            transform: "scale(1)"
          }
        ],
        {
          duration: 620,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards"
        }
      );

      appear.finished.then(() => {
        isAnimating = false;
      });
    });
  }

  window.setInterval(changeTitle, 2300);
}

/* ==================================================
   BROSCHÜREN-VIEWER MIT 3D-BLÄTTEREFFEKT
================================================== */

function setupBrochureViewer() {
  const brochureBook =
    document.querySelector("#brochureBook");

  const brochureLeftPage =
    document.querySelector("#brochureLeftPage");

  const brochureRightPage =
    document.querySelector("#brochureRightPage");

  const brochureLeftWrapper =
    document.querySelector("#brochureLeftWrapper");

  const brochureRightWrapper =
    document.querySelector("#brochureRightWrapper");

  const brochurePrev =
    document.querySelector("#brochurePrev");

  const brochureNext =
    document.querySelector("#brochureNext");

  const brochurePageCounter =
    document.querySelector("#brochurePageCounter");

  const brochureProgress =
    document.querySelector("#brochureProgress");

  /*
   * Beendet die Funktion auf allen Seiten,
   * auf denen keine Broschüre vorhanden ist.
   */

  if (
    !brochureBook ||
    !brochureLeftPage ||
    !brochureRightPage ||
    !brochureLeftWrapper ||
    !brochureRightWrapper ||
    !brochurePrev ||
    !brochureNext ||
    !brochurePageCounter ||
    !brochureProgress
  ) {
    return;
  }

  /*
   * Seite 1 ist die einzelne Titelseite.
   * Seiten 2–19 werden als Doppelseiten angezeigt.
   * Seite 20 ist die einzelne Rückseite.
   */

  const brochureSpreads = [
    [1],
    [2, 3],
    [4, 5],
    [6, 7],
    [8, 9],
    [10, 11],
    [12, 13],
    [14, 15],
    [16, 17],
    [18, 19],
    [20]
  ];

  let currentSpread = 0;
  let isTurning = false;

  /*
   * Erstellt den Pfad zum jeweiligen Seitenbild.
   */

  function getPageSource(pageNumber) {
    const formattedPageNumber =
      String(pageNumber).padStart(2, "0");

    return (
      `broschuere-seiten/seite-${formattedPageNumber}.webp`
    );
  }

  /*
   * Zeigt die aktuelle Einzel- oder Doppelseite.
   */

  function renderSpread(index) {
    const visiblePages =
      brochureSpreads[index];

    const leftPageNumber =
      visiblePages[0];

    const rightPageNumber =
      visiblePages[1];

    brochureLeftPage.src =
      getPageSource(leftPageNumber);

    brochureLeftPage.alt =
      `Broschüre Seite ${leftPageNumber}`;

    if (rightPageNumber) {
      brochureRightPage.src =
        getPageSource(rightPageNumber);

      brochureRightPage.alt =
        `Broschüre Seite ${rightPageNumber}`;

      brochureRightWrapper.hidden = false;
      brochureBook.classList.remove("is-single");

      brochurePageCounter.textContent =
        `Seiten ${leftPageNumber}–${rightPageNumber} von 20`;
    } else {
      brochureRightWrapper.hidden = true;
      brochureBook.classList.add("is-single");

      brochurePageCounter.textContent =
        `Seite ${leftPageNumber} von 20`;
    }

    brochurePrev.disabled =
      index === 0;

    brochureNext.disabled =
      index === brochureSpreads.length - 1;

    const progress =
      ((index + 1) / brochureSpreads.length) * 100;

    brochureProgress.style.width =
      `${progress}%`;
  }

  /*
   * Erstellt das bewegliche Blatt mit einer
   * Vorder- und Rückseite.
   */

  function createTurningLeaf(direction, nextIndex) {
    const leaf =
      document.createElement("div");

    const front =
      document.createElement("div");

    const back =
      document.createElement("div");

    const frontImage =
      document.createElement("img");

    const backImage =
      document.createElement("img");

    const currentPages =
      brochureSpreads[currentSpread];

    const nextPages =
      brochureSpreads[nextIndex];

    leaf.className =
      `brochure-turning-leaf ${
        direction > 0
          ? "turn-forward"
          : "turn-back"
      }`;

    front.className =
      "brochure-leaf-face brochure-leaf-front";

    back.className =
      "brochure-leaf-face brochure-leaf-back";

    /*
     * Beim Vorwärtsblättern wird die aktuell
     * rechte Seite umgeblättert.
     *
     * Beim Zurückblättern wird die aktuell
     * linke Seite zurückgeschlagen.
     */

    const frontPageNumber =
      direction > 0
        ? currentPages[1] || currentPages[0]
        : currentPages[0];

    const backPageNumber =
      direction > 0
        ? nextPages[0]
        : nextPages[1] || nextPages[0];

    frontImage.src =
      getPageSource(frontPageNumber);

    backImage.src =
      getPageSource(backPageNumber);

    frontImage.alt = "";
    backImage.alt = "";

    front.appendChild(frontImage);
    back.appendChild(backImage);

    leaf.appendChild(front);
    leaf.appendChild(back);

    brochureBook.appendChild(leaf);

    return leaf;
  }

  /*
   * Führt die Blätteranimation aus.
   */

  function turnPage(direction) {
    if (isTurning) {
      return;
    }

    const nextIndex =
      currentSpread + direction;

    if (
      nextIndex < 0 ||
      nextIndex >= brochureSpreads.length
    ) {
      return;
    }

    isTurning = true;

    brochurePrev.disabled = true;
    brochureNext.disabled = true;

    const turningLeaf =
      createTurningLeaf(direction, nextIndex);

    /*
     * Die Klasse wird leicht verzögert hinzugefügt,
     * damit der Browser die Ausgangsposition erkennt.
     */

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        turningLeaf.classList.add("is-turning");
      });
    });

    /*
     * In der Mitte der Animation werden die
     * darunterliegenden Seiten gewechselt.
     */

    window.setTimeout(() => {
      currentSpread = nextIndex;
      renderSpread(currentSpread);
    }, 360);

    /*
     * Nach der Animation wird das zusätzliche
     * Blatt entfernt.
     */

    window.setTimeout(() => {
      turningLeaf.remove();
      isTurning = false;

      brochurePrev.disabled =
        currentSpread === 0;

      brochureNext.disabled =
        currentSpread ===
        brochureSpreads.length - 1;
    }, 760);
  }

  /*
   * Navigation über die Pfeil-Buttons.
   */

  brochureNext.addEventListener("click", () => {
    turnPage(1);
  });

  brochurePrev.addEventListener("click", () => {
    turnPage(-1);
  });

  /*
   * Navigation über die Tastatur.
   */

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      turnPage(1);
    }

    if (event.key === "ArrowLeft") {
      turnPage(-1);
    }
  });

  /*
   * Broschüre beim Laden initialisieren.
   */

  renderSpread(currentSpread);
}