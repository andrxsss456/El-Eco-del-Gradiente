// MSS / Archivo Experimental 001-A
// Interacción D: navegación consciente, partículas ambientales y simulación reversible E-λ.

(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const progress = document.getElementById("reading-progress");
  const canvas = document.getElementById("particle-field");
  const entropyState = document.getElementById("entropy-state");
  const entropyToggle = document.getElementById("entropy-toggle");
  const restoreButton = document.getElementById("restore-button");
  const links = [...document.querySelectorAll(".contents-link")];
  const chapters = [...document.querySelectorAll(".chapter")];

  const config = {
    decayPerSecond: 0.72, // La simulación tarda aproximadamente 1 min 45 s en llegar al mínimo.
    minimumIntegrity: 24,
    intervalMs: 1000
  };

  let integrity = 100;
  let entropyTimer = null;
  let lastFrame = 0;
  let particles = [];
  let pointer = { x: -1000, y: -1000 };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    root.style.setProperty("--reading-progress", `${Math.min(100, Math.max(0, percent))}%`);
  }

  function setActiveLink(id) {
    links.forEach(link => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveLink(visible.target.id);
    }, { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.1, 0.3, 0.6] });
    chapters.forEach(chapter => observer.observe(chapter));
  }

  function renderIntegrity() {
    const loss = 100 - integrity;
    const opacity = 1 - (loss / 100) * 0.27;
    const blur = (loss / 100) * 0.75;
    const saturation = 1 - (loss / 100) * 0.45;
    root.style.setProperty("--decay-opacity", opacity.toFixed(3));
    root.style.setProperty("--decay-blur", `${blur.toFixed(2)}px`);
    root.style.setProperty("--decay-saturation", saturation.toFixed(3));
    root.style.setProperty("--noise-opacity", (0.025 + loss / 100 * 0.16).toFixed(3));
    entropyState.textContent = body.classList.contains("entropy-active")
      ? `Entropía activa · ${Math.round(integrity)}%`
      : `Archivo estable · ${Math.round(integrity)}%`;
  }

  function decayStep() {
    integrity = Math.max(config.minimumIntegrity, integrity - config.decayPerSecond);
    renderIntegrity();
    if (integrity <= config.minimumIntegrity) {
      window.clearInterval(entropyTimer);
      entropyTimer = null;
      entropyToggle.disabled = true;
      entropyToggle.textContent = "Entropía alcanzada";
      entropyState.textContent = `Integridad mínima · ${Math.round(integrity)}%`;
    }
  }

  function startEntropy() {
    if (entropyTimer || integrity <= config.minimumIntegrity) return;
    body.classList.add("entropy-active");
    entropyToggle.textContent = "Pausar entropía";
    restoreButton.disabled = false;
    entropyTimer = window.setInterval(decayStep, config.intervalMs);
    renderIntegrity();
  }

  function pauseEntropy() {
    if (entropyTimer) {
      window.clearInterval(entropyTimer);
      entropyTimer = null;
      entropyToggle.textContent = "Continuar entropía";
      entropyState.textContent = `Entropía pausada · ${Math.round(integrity)}%`;
    }
  }

  function restoreArchive() {
    if (entropyTimer) window.clearInterval(entropyTimer);
    entropyTimer = null;
    integrity = 100;
    body.classList.remove("entropy-active");
    entropyToggle.disabled = false;
    entropyToggle.textContent = "Activar entropía";
    restoreButton.disabled = true;
    renderIntegrity();
  }

  entropyToggle.addEventListener("click", () => {
    if (entropyTimer) pauseEntropy();
    else startEntropy();
  });
  restoreButton.addEventListener("click", restoreArchive);

  // Campo de partículas discreto; se desactiva cuando el usuario solicita movimiento reducido.
  function initParticles() {
    if (!canvas || reducedMotion) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(65, Math.floor((window.innerWidth * window.innerHeight) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.4 + 0.35,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        alpha: Math.random() * 0.42 + 0.12,
        phase: Math.random() * Math.PI * 2
      }));
    };

    function draw(time) {
      if (time - lastFrame < 40) {
        window.requestAnimationFrame(draw);
        return;
      }
      lastFrame = time;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -5) p.x = window.innerWidth + 5;
        if (p.x > window.innerWidth + 5) p.x = -5;
        if (p.y < -5) p.y = window.innerHeight + 5;
        if (p.y > window.innerHeight + 5) p.y = -5;

        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 110 && distance > 0) {
          p.x -= (dx / distance) * 0.14;
          p.y -= (dy / distance) * 0.14;
        }

        const shimmer = 0.65 + Math.sin(time * 0.0005 + p.phase) * 0.35;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 157, 65, ${p.alpha * shimmer})`;
        ctx.fill();
      }
      window.requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", event => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }, { passive: true });
    window.requestAnimationFrame(draw);
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });

  updateProgress();
  renderIntegrity();
  initParticles();
  console.log("MSS / Archivo Experimental 001-A cargado.");
})();
