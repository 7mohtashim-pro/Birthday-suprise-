(() => {
  "use strict";

  const screens = [...document.querySelectorAll(".screen")];
  const audio = document.getElementById("music");
  const sparkLayer = document.getElementById("sparkLayer");
  const decorLayer = document.getElementById("decorLayer");
  const transition = document.getElementById("transition");
  const fx = document.getElementById("fx");
  const ctx = fx?.getContext("2d");

  const startBtn = document.getElementById("startBtn");
  const introTitle = document.getElementById("introTitle");

  const letterText = document.getElementById("letterText");
  const birthdayTitle = document.getElementById("birthdayTitle");
  const surpriseText = document.getElementById("surpriseText");
  const yesTitle = document.getElementById("yesTitle");
  const yesText = document.getElementById("yesText");
  const noMsg = document.getElementById("noMsg");

  const slideTrack = document.getElementById("slideTrack");
  const memDots = document.getElementById("memDots");
  const prevMem = document.getElementById("prevMem");
  const nextMem = document.getElementById("nextMem");

  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");

  const colors = ["#ff6fb6", "#ffd56d", "#ffffff", "#ff9bd0", "#ff7aa7", "#ffe8ae"];
  const symbols = ["♥", "✦", "❀", "✿", "✺", "✧"];
  const balloons = ["🎈", "🎈", "🎈", "💗", "🌹"];
  const roses = ["🌹", "🌹", "🌹", "🌷"];
  const rand = (a, b) => Math.random() * (b - a) + a;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  let current = "intro";
  let slideIndex = 0;
  let slideCount = 8;
  let stars = [];
  let starLoopStarted = false;
  let ambientTimer = null;
  let decorTimer = null;
  let letterStarted = false;
  let birthdayStarted = false;
  let surpriseStarted = false;
  let yesStarted = false;
  let noBusy = false;
  let isPlaying = false;

  function resizeCanvas() {
    if (!fx || !ctx) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    fx.width = Math.floor(window.innerWidth * dpr);
    fx.height = Math.floor(window.innerHeight * dpr);
    fx.style.width = "100%";
    fx.style.height = "100%";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeStars() {
    stars = [];
    for (let i = 0; i < 128; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: rand(0.5, 1.8),
        a: rand(0.1, 0.9),
        s: rand(0.12, 0.65)
      });
    }
  }

  function drawStars() {
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const p of stars) {
      p.y += p.s;
      if (p.y > window.innerHeight + 2) {
        p.y = -2;
        p.x = Math.random() * window.innerWidth;
      }
      const tw = 0.7 + 0.3 * Math.sin(Date.now() / 650 + p.x * 0.01);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * tw, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.a * tw})`;
      ctx.fill();
    }
    requestAnimationFrame(drawStars);
  }

  function startStarfield() {
    if (!ctx || starLoopStarted) return;
    starLoopStarted = true;
    makeStars();
    drawStars();
  }

  function spark(x, y, ch, size, color, dx, dy, dur) {
    if (!sparkLayer) return;
    const n = document.createElement("span");
    n.className = "spark";
    n.textContent = ch;
    n.style.setProperty("--x", `${x}px`);
    n.style.setProperty("--y", `${y}px`);
    n.style.setProperty("--size", `${size}px`);
    n.style.setProperty("--color", color);
    n.style.setProperty("--dx", `${dx}px`);
    n.style.setProperty("--dy", `${dy}px`);
    n.style.setProperty("--dur", `${dur}s`);
    n.style.setProperty("--rot", `${rand(-220, 220)}deg`);
    sparkLayer.appendChild(n);
    setTimeout(() => n.remove(), dur * 1000 + 240);
  }

  function burst(x, y, amount = 10) {
    for (let i = 0; i < amount; i++) {
      spark(
        x + rand(-18, 18),
        y + rand(-12, 12),
        pick(symbols),
        rand(12, 28),
        pick(colors),
        rand(-90, 90),
        rand(-280, -120),
        rand(3.6, 6.2)
      );
    }
  }

  function ambient() {
    spark(
      rand(12, window.innerWidth - 12),
      window.innerHeight + 12,
      pick(["♥", "✦", "❀", "✿", "✺"]),
      rand(12, 24),
      pick(colors),
      rand(-60, 60),
      -rand(window.innerHeight * 0.8, window.innerHeight * 1.25),
      rand(8, 13)
    );
  }

  function floatDecor() {
    if (!decorLayer) return;
    const isBalloon = Math.random() < 0.45;
    const isHeart = !isBalloon && Math.random() < 0.45;
    const n = document.createElement("span");
    n.className = isBalloon ? "balloon" : (isHeart ? "heart-particle" : "rose");
    n.textContent = isBalloon ? pick(balloons) : (isHeart ? "💗" : pick(roses));
    n.style.left = `${rand(0, 100)}vw`;
    n.style.top = isBalloon ? `${rand(70, 110)}vh` : `${rand(-10, 30)}vh`;
    n.style.fontSize = isBalloon ? `${rand(18, 30)}px` : `${rand(14, 30)}px`;
    n.style.setProperty("--dur", `${rand(8, 16)}s`);
    n.style.setProperty("--dx", `${rand(-40, 40)}px`);
    n.style.setProperty("--dy", isBalloon ? `${-rand(180, 380)}px` : `${rand(160, 420)}px`);
    n.style.transform = `rotate(${rand(-18,18)}deg)`;
    decorLayer.appendChild(n);
    setTimeout(() => n.remove(), 16500);
  }

  function startDecor() {
    if (decorTimer) return;
    decorTimer = setInterval(() => {
      // burst of floating balloons and falling roses
      for (let i = 0; i < 3; i++) floatDecor();
    }, 520);
    setTimeout(() => {
      for (let i = 0; i < 10; i++) floatDecor();
    }, 100);
  }

  function typewrite(text, el, speed = 30) {
    if (!el) return;
    el.textContent = "";
    let i = 0;
    const tick = () => {
      el.textContent = text.slice(0, i);
      i += 1;
      if (i <= text.length) setTimeout(tick, speed + rand(-8, 10));
    };
    tick();
  }

  function setActive(name) {
    current = name;
    screens.forEach((s) => s.classList.toggle("active", s.dataset.screen === name));
  }

  function showTransition(next, delay = 500) {
    if (transition) {
      transition.classList.add("show");
      setTimeout(() => {
        setActive(next);
        transition.classList.remove("show");
      }, delay);
    } else {
      setActive(next);
    }
  }

  function playAudio(seekToEnd = false) {
    if (!audio) return Promise.reject(new Error("No audio"));
    if (seekToEnd) {
      const setEnd = () => {
        if (Number.isFinite(audio.duration) && audio.duration > 5) {
          audio.currentTime = Math.max(0, audio.duration - 31);
        }
      };
      if (audio.readyState >= 1) setEnd();
      else audio.addEventListener("loadedmetadata", setEnd, { once: true });
    }
    audio.volume = 0.78;
    isPlaying = true;
    return audio.play();
  }

  function pauseAudio() {
    if (!audio) return;
    audio.pause();
    isPlaying = false;
  }

  function makeDots() {
    if (!memDots) return;
    memDots.innerHTML = "";
    for (let i = 0; i < slideCount; i++) {
      const d = document.createElement("span");
      d.className = "dot" + (i === slideIndex ? " active" : "");
      d.addEventListener("click", () => setSlide(i));
      memDots.appendChild(d);
    }
  }

  function renderDots() {
    if (!memDots) return;
    [...memDots.children].forEach((d, i) => d.classList.toggle("active", i === slideIndex));
  }

  function setSlide(i) {
    slideIndex = (i + slideCount) % slideCount;
    if (slideTrack) slideTrack.style.transform = `translateX(-${slideIndex * 100}%)`;
    renderDots();
  }

  function nextSlide() { setSlide(slideIndex + 1); }
  function prevSlide() { setSlide(slideIndex - 1); }

  let touchStartX = 0;
  let touchEndX = 0;
  function handleSwipe() {
    const dx = touchEndX - touchStartX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) nextSlide();
      else prevSlide();
    }
  }

  function startIntro() {
    startStarfield();
    startDecor();
    ambientTimer = setInterval(ambient, 520);
    setTimeout(ambient, 120);
    typewrite("Happy Birthday, Mam ❤️", introTitle, 44);
  }

  function startLetter() {
    if (letterStarted) return;
    letterStarted = true;
    const text = [
      "Happy Birthday, Mam ❤️",
      "Today is your special day, and I wanted this story to feel warm, bright, and full of love for you.",
      "May this year bring you beautiful surprises, peaceful days, genuine smiles, and dreams that quietly come true.",
      "Thank you for every conversation, every laugh, every memory, and every small moment that became special because of you.",
      "You deserve happiness that lasts, blessings that grow, and a life filled with light.",
      "I hope this surprise makes you smile, because that is the sweetest gift I could ever hope to give.",
      "Happy Birthday once again, Mam. You are truly special. ❤️"
    ].join("\n\n");
    typewrite(text, letterText, 10);
  }

  function startBirthday() {
    if (birthdayStarted) return;
    birthdayStarted = true;
    typewrite("Happy Birthday Mam ❤️", birthdayTitle, 42);
    burst(window.innerWidth * 0.5, window.innerHeight * 0.35, 24);
  }

  function startSurprise() {
    if (surpriseStarted) return;
    surpriseStarted = true;
    const text = "Some moments feel like magic because they are made with love. Every heartbeat, every memory, every smile — they all lead back to you. ✨";
    typewrite(text, surpriseText, 18);
  }

  function showYes() {
    if (yesStarted) return;
    yesStarted = true;
    const msg = [
      "I knew you would say yes ❤️",
      "",
      "Thank you for coming into my life and filling it with happiness, laughter, and beautiful memories.",
      "Every smile of yours is my favorite.",
      "Every moment with you is precious.",
      "",
      "May this year bring you endless happiness, success, love, and beautiful memories.",
      "No matter where life takes us, I will always be thankful that our paths crossed.",
      "",
      "Thank you for being you.",
      "Thank you for existing.",
      "",
      "Forever your favorite person ❤️"
    ].join("\n\n");
    typewrite(msg, yesText, 12);
    burst(window.innerWidth * 0.5, window.innerHeight * 0.28, 30);
  }

  function moveNo() {
    if (!noBtn) return;
    const box = noBtn.closest(".valentine-actions");
    if (!box) return;
    const r = box.getBoundingClientRect();
    const b = noBtn.getBoundingClientRect();
    const x = rand(10, Math.max(10, r.width - b.width - 10));
    const y = rand(10, Math.max(10, r.height - b.height - 10));
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
    noBtn.style.transform = "none";
  }

  function setupNavButtons() {
    document.querySelectorAll("[data-go]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = btn.dataset.go;
        if (next === "memories") makeDots();
        if (next === "letter") startLetter();
        if (next === "birthday") startBirthday();
        if (next === "surprise") startSurprise();
        showTransition(next);
        burst(btn.getBoundingClientRect().left + btn.offsetWidth / 2, btn.getBoundingClientRect().top + btn.offsetHeight / 2, 12);
      });
    });

    document.querySelectorAll("[data-next]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = btn.dataset.next;
        if (next === "letter") startLetter();
        if (next === "birthday") startBirthday();
        if (next === "surprise") startSurprise();
        if (next === "valentine") showTransition("valentine");
        else showTransition(next);
      });
    });

    document.querySelectorAll("[data-back]").forEach((btn) => {
      btn.addEventListener("click", () => {
        showTransition(btn.dataset.back);
      });
    });
  }

  function setupMemories() {
    makeDots();
    prevMem?.addEventListener("click", prevSlide);
    nextMem?.addEventListener("click", nextSlide);
    slideTrack?.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    slideTrack?.addEventListener("touchend", (e) => { touchEndX = e.changedTouches[0].screenX; handleSwipe(); }, { passive: true });
    setInterval(() => {
      if (current === "memories") nextSlide();
    }, 4200);
  }

  function setupValentine() {
    yesBtn?.addEventListener("click", async () => {
      if (noMsg) noMsg.textContent = "❤️ Yes!";
      burst(yesBtn.getBoundingClientRect().left + 60, yesBtn.getBoundingClientRect().top + 26, 28);
      try { await playAudio(true); } catch {}
      showTransition("yes");
      setTimeout(() => showYes(), 560);
    });

    noBtn?.addEventListener("pointerenter", moveNo, { passive: true });
    noBtn?.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      moveNo();
      if (noMsg) noMsg.textContent = "The no button is shy 🥺";
      burst(noBtn.getBoundingClientRect().left + 20, noBtn.getBoundingClientRect().top + 10, 5);
    }, { passive: false });

    noBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      moveNo();
      if (noMsg) noMsg.textContent = "The no button is shy 🥺";
    });

    setInterval(() => {
      if (current === "valentine") moveNo();
    }, 1100);
  }

  function setupIntro() {
    const clickStart = async () => {
      if (!isPlaying) {
        try { await playAudio(false); } catch {}
      }
      burst(window.innerWidth * 0.5, window.innerHeight * 0.38, 20);
      showTransition("menu");
    };
    startBtn?.addEventListener("click", clickStart);
    document.querySelector(".screen[data-screen='intro']")?.addEventListener("pointerdown", (e) => {
      if (e.target === document.querySelector(".screen[data-screen='intro']")) clickStart();
    }, { passive: true });
  }

  function setupPlaybackRecovery() {
    if (!audio) return;
    audio.addEventListener("ended", () => { isPlaying = false; });
    audio.addEventListener("pause", () => { isPlaying = false; });
    audio.addEventListener("play", () => { isPlaying = true; });
  }

  function init() {
    resizeCanvas();
    startIntro();
    setupNavButtons();
    setupMemories();
    setupValentine();
    setupIntro();
    setupPlaybackRecovery();

    document.addEventListener("pointerdown", (e) => {
      if (Math.random() < 0.18) burst(e.clientX, e.clientY, 4);
    }, { passive: true });

    window.addEventListener("resize", resizeCanvas);

    setInterval(() => {
      if (current === "intro" || current === "menu" || current === "memories" || current === "letter" || current === "birthday" || current === "surprise" || current === "valentine" || current === "yes") {
        const x = rand(0, window.innerWidth);
        const y = rand(0, window.innerHeight);
        spark(x, y, pick(symbols), rand(10, 18), pick(colors), rand(-40, 40), rand(-160, -60), rand(4.5, 7.5));
      }
    }, 850);

    // Extra hearts/rose bursts for polish
    setInterval(() => {
      if (current !== "intro" && current !== "menu") return;
      floatDecor();
      floatDecor();
    }, 2200);
  }

  init();
})();
