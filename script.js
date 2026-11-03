// MSS / ARCHIVO EXPERIMENTAL Ω∞
// Navegación, búsqueda, progreso de lectura, partículas y simulación E-λ reversible.
// La entropía modifica únicamente la presentación: nunca elimina ni reescribe el texto.
(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const documentContent = document.getElementById("document-content");
  const progressLabel = document.getElementById("reading-progress-label");
  const entropyState = document.getElementById("entropy-state");
  const entropyToggle = document.getElementById("entropy-toggle");
  const restoreButton = document.getElementById("restore-button");
  const searchInput = document.getElementById("chapter-search");
  const searchFeedback = document.getElementById("search-feedback");
  const canvas = document.getElementById("particle-field");
  const sections = [...document.querySelectorAll(".chapter-section")];
  const tocLinks = [...document.querySelectorAll(".toc-link")];

  if (!documentContent || !entropyToggle || !restoreButton) {
    console.error("MSS Ω∞: faltan elementos esenciales de la interfaz.");
    return;
  }

  const SETTINGS = Object.freeze({
    decayPerSecond: 0.68,
    minimumIntegrity: 22,
    intervalMs: 1000,
    particleLimit: 72
  });

  let integrity = 100;
  let entropyTimer = null;
  let particles = [];
  let pointer = { x: -1000, y: -1000 };
  let lastDraw = 0;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function updateReadingProgress() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = maxScroll > 0 ? Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100)) : 0;
    root.style.setProperty("--progress", `${percentage.toFixed(2)}%`);
    if (progressLabel) progressLabel.textContent = `${Math.round(percentage)}%`;
  }

  function markActiveSection(id) {
    tocLinks.forEach(link => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      const current = entries
        .filter(entry => entry.isIntersecting && !entry.target.hidden)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (current) markActiveSection(current.target.id);
    }, { rootMargin: "-16% 0px -68% 0px", threshold: [0, 0.08, 0.2, 0.45] });
    sections.forEach(section => sectionObserver.observe(section));
  }

  function filterDocument() {
    const query = searchInput.value.trim().toLocaleLowerCase("es");
    let visible = 0;

    sections.forEach((section, index) => {
      const text = section.textContent.toLocaleLowerCase("es");
      const match = !query || text.includes(query);
      section.hidden = !match;
      if (tocLinks[index]) tocLinks[index].hidden = !match;
      if (match) visible += 1;
    });

    searchFeedback.textContent = query
      ? `${visible} de ${sections.length} secciones coinciden`
      : `${sections.length} secciones indexadas`;

    if (query && visible === 0) {
      searchFeedback.textContent = "Sin coincidencias. Prueba otro término.";
    }
  }

  if (searchInput) searchInput.addEventListener("input", filterDocument);

  function renderIntegrity() {
    const loss = 100 - integrity;
    const opacity = 1 - (loss / 100) * 0.28;
    const blur = (loss / 100) * 1.05;
    const saturation = 1 - (loss / 100) * 0.5;
    root.style.setProperty("--decay-opacity", opacity.toFixed(3));
    root.style.setProperty("--decay-blur", `${blur.toFixed(2)}px`);
    root.style.setProperty("--decay-saturation", saturation.toFixed(3));
    root.style.setProperty("--noise-level", (0.015 + loss / 100 * 0.15).toFixed(3));
    entropyState.textContent = `${entropyTimer ? "Entropía activa" : body.classList.contains("entropy-active") ? "Entropía pausada" : "Archivo estable"} · ${Math.round(integrity)}%`;
  }

  function stopTimer() {
    if (entropyTimer !== null) {
      window.clearInterval(entropyTimer);
      entropyTimer = null;
    }
  }

  function decayStep() {
    integrity = Math.max(SETTINGS.minimumIntegrity, integrity - SETTINGS.decayPerSecond);
    renderIntegrity();
    if (integrity <= SETTINGS.minimumIntegrity) {
      stopTimer();
      entropyToggle.disabled = true;
      entropyToggle.textContent = "Límite alcanzado";
      entropyState.textContent = `Integridad mínima · ${Math.round(integrity)}%`;
    }
  }

  function startEntropy() {
    if (entropyTimer !== null || integrity <= SETTINGS.minimumIntegrity) return;
    body.classList.add("entropy-active");
    entropyToggle.textContent = "Pausar entropía";
    restoreButton.disabled = false;
    entropyTimer = window.setInterval(decayStep, SETTINGS.intervalMs);
    renderIntegrity();
  }

  function pauseEntropy() {
    stopTimer();
    entropyToggle.textContent = "Continuar entropía";
    renderIntegrity();
  }

  function restoreArchive() {
    stopTimer();
    integrity = 100;
    body.classList.remove("entropy-active");
    entropyToggle.disabled = false;
    entropyToggle.textContent = "Activar entropía";
    restoreButton.disabled = true;
    renderIntegrity();
  }

  entropyToggle.addEventListener("click", () => {
    if (entropyTimer !== null) pauseEntropy();
    else startEntropy();
  });
  restoreButton.addEventListener("click", restoreArchive);

  function initializeParticles() {
    if (!canvas || reducedMotion) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    function resizeCanvas() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(SETTINGS.particleLimit, Math.max(18, Math.floor((width * height) / 18000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.25 + 0.3,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.3 + 0.08,
        phase: Math.random() * Math.PI * 2
      }));
    }

    function draw(timestamp) {
      if (timestamp - lastDraw < 35) {
        window.requestAnimationFrame(draw);
        return;
      }
      lastDraw = timestamp;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < -4) particle.x = window.innerWidth + 4;
        if (particle.x > window.innerWidth + 4) particle.x = -4;
        if (particle.y < -4) particle.y = window.innerHeight + 4;
        if (particle.y > window.innerHeight + 4) particle.y = -4;

        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0 && distance < 105) {
          particle.x -= (dx / distance) * 0.18;
          particle.y -= (dy / distance) * 0.18;
        }

        const shimmer = 0.6 + Math.sin(timestamp * 0.00055 + particle.phase) * 0.4;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 160, 75, ${particle.alpha * shimmer})`;
        context.fill();
      }
      window.requestAnimationFrame(draw);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("pointermove", event => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }, { passive: true });
    window.requestAnimationFrame(draw);
  }

  window.addEventListener("scroll", updateReadingProgress, { passive: true });
  window.addEventListener("resize", updateReadingProgress, { passive: true });

  updateReadingProgress();
  renderIntegrity();
  initializeParticles();
  console.log(`MSS Ω∞ cargado: ${sections.length} secciones disponibles.`);
})();
