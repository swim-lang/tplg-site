/* ============ TPLG — interactions ============ */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Loader ---------------- */
  var loader = document.getElementById("loader");
  var loaderMark = document.getElementById("loaderMark");
  var loaderTagline = document.getElementById("loaderTagline");
  var loaderProgress = document.getElementById("loaderProgress");
  var headerMark = document.getElementById("headerMark");
  var body = document.body;

  var WORDMARK_RATIO = 241.06 / 1313.3; // height / width

  function centerRect(width) {
    var h = width * WORDMARK_RATIO;
    return {
      left: (window.innerWidth - width) / 2,
      top: (window.innerHeight - h) / 2,
      width: width
    };
  }

  function applyRect(el, rect) {
    el.style.left = rect.left + "px";
    el.style.top = rect.top + "px";
    el.style.width = rect.width + "px";
  }

  function finishReveal() {
    body.classList.remove("is-loading");
    body.classList.add("is-revealed");
  }

  function endLoader() {
    loader.classList.add("is-done");
    loaderMark.style.display = "none";
    headerMark.style.visibility = "visible";
  }

  function runLoader() {
    // Frame 0 — small wordmark, kept centered via transform; only width animates
    loaderMark.style.width = "300px";

    // 1. Painting fades in
    requestAnimationFrame(function () {
      loader.classList.add("is-visible");
    });

    // 2. Wordmark rises in small + progress fills
    setTimeout(function () {
      loaderMark.classList.add("is-entering");
      loaderProgress.style.width = "100%";
    }, 400);

    // 3. Scale up dramatically — transform centering keeps it perfectly centered
    setTimeout(function () {
      var big = Math.min(1240, window.innerWidth * 0.86);
      var bigRect = centerRect(big);
      loaderMark.style.width = big + "px";
      loaderTagline.style.top = bigRect.top - 56 + "px";
      loaderTagline.classList.add("is-shown");
    }, 2100);

    // 4. Reveal — freeze current rect in px, then fly straight to the header slot
    setTimeout(function () {
      var from = loaderMark.getBoundingClientRect();
      loaderMark.style.transition = "none";
      loaderMark.style.transform = "none";
      loaderMark.style.left = from.left + "px";
      loaderMark.style.top = from.top + "px";
      loaderMark.style.width = from.width + "px";
      void loaderMark.offsetWidth; // reflow so the frozen state commits
      loaderMark.style.transition = "";
      loaderMark.classList.add("is-flying");

      var target = headerMark.getBoundingClientRect();
      loader.classList.add("is-revealing");
      loaderTagline.classList.remove("is-shown");
      applyRect(loaderMark, { left: target.left, top: target.top, width: target.width });
      loaderMark.classList.add("is-landing");
      finishReveal();
    }, 3600);

    // 5. Cleanup — swap in the real header wordmark
    setTimeout(endLoader, 4500);
  }

  if (prefersReducedMotion) {
    loader.classList.add("is-done");
    loaderMark.style.display = "none";
    headerMark.style.visibility = "visible";
    finishReveal();
  } else if (document.readyState === "complete") {
    runLoader();
  } else {
    window.addEventListener("load", runLoader);
  }

  /* ---------------- Menu overlay ---------------- */
  var menu = document.getElementById("menuOverlay");
  var menuBtn = document.getElementById("menuBtn");
  var menuClose = document.getElementById("menuClose");

  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    menuBtn.setAttribute("aria-expanded", String(open));
    body.style.overflow = open ? "hidden" : "";
  }

  menuBtn.addEventListener("click", function () { setMenu(true); });
  menuClose.addEventListener("click", function () { setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); });
  });

  /* ---------------- Situations carousel ---------------- */
  var SITUATIONS = [
    {
      kicker: "Where It Begins",
      word: "Launch",
      caseLine: "New committee, campaign, or program.",
      body: "You're starting something new and need the legal foundation built correctly from the beginning. We help with formation, registration, reporting structure, contribution rules, and the early decisions that keep the work clean as it grows."
    },
    {
      kicker: "Pressure-Test the Move",
      word: "Question",
      caseLine: "Is this allowed?",
      body: "You have an idea, tactic, expenditure, message, or structure, and need a clear read before moving forward. We help you understand what's possible, where the risk sits, and how to get as close to yes as the law allows."
    },
    {
      kicker: "Beat the Clock",
      word: "Deadline",
      caseLine: "Compliance date approaching.",
      body: "A report, filing, registration, or disclosure deadline is coming up, and the details need to be right. We help teams stay ahead of the clock, avoid preventable mistakes, and understand what has to happen next."
    },
    {
      kicker: "When a Regulator Calls",
      word: "Inquiry",
      caseLine: "Agency notice or investigation.",
      body: "A regulator has reached out, and the response needs to be careful, complete, and timely. We help assess the issue, organize the facts, and respond with the right level of precision."
    },
    {
      kicker: "Reading the Rules",
      word: "Conflict",
      caseLine: "Rules pointing in different directions.",
      body: "Federal, state, local, or internal requirements do not always line up neatly. We help clients make sense of competing rules, unclear guidance, and practical constraints so they can choose a defensible path."
    },
    {
      kicker: "When Something Went Sideways",
      word: "Cleanup",
      caseLine: "Something went sideways.",
      body: "A deadline was missed, a filing was wrong, or a process broke down. We help you understand where you stand, what needs to be corrected, and how to reduce the damage before it becomes a bigger problem."
    }
  ];

  var indexRail = document.getElementById("situationsIndex");
  var cardContent = document.getElementById("cardContent");
  var cardGhost = document.getElementById("cardGhost");
  var cardKicker = document.getElementById("cardKicker");
  var cardWord = document.getElementById("cardWord");
  var cardCase = document.getElementById("cardCase");
  var cardBody = document.getElementById("cardBody");
  var cardCounter = document.getElementById("cardCounter");
  var current = 0;
  var switching = false;

  function pad(n) { return String(n + 1).padStart(2, "0"); }

  SITUATIONS.forEach(function (s, i) {
    var btn = document.createElement("button");
    btn.className = "index-item" + (i === 0 ? " is-active" : "");
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
    btn.innerHTML =
      '<span class="index-item__num">' + pad(i) + "</span>" +
      '<span class="index-item__word">' + s.word + "</span>" +
      '<span class="index-item__line"></span>';
    btn.addEventListener("click", function () { goTo(i); });
    indexRail.appendChild(btn);
  });

  var railItems = indexRail.querySelectorAll(".index-item");

  function render(i) {
    var s = SITUATIONS[i];
    cardGhost.textContent = pad(i);
    cardKicker.textContent = s.kicker;
    cardWord.textContent = s.word;
    cardCase.textContent = s.caseLine;
    cardBody.textContent = s.body;
    cardCounter.textContent = pad(i) + " / " + pad(SITUATIONS.length - 1);
    railItems.forEach(function (item, j) {
      item.classList.toggle("is-active", j === i);
      item.setAttribute("aria-selected", j === i ? "true" : "false");
    });
  }

  function goTo(i) {
    if (switching || i === current) return;
    switching = true;
    current = (i + SITUATIONS.length) % SITUATIONS.length;
    cardContent.classList.add("is-switching");
    setTimeout(function () {
      render(current);
      cardContent.classList.remove("is-switching");
      switching = false;
    }, 280);
  }

  document.getElementById("prevBtn").addEventListener("click", function () { goTo(current - 1); });
  document.getElementById("nextBtn").addEventListener("click", function () { goTo(current + 1); });

  /* ---------------- Ticker (duplicate for seamless loop) ---------------- */
  var track = document.getElementById("tickerTrack");
  track.innerHTML += track.innerHTML;

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }
})();
