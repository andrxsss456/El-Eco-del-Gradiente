// MSS-Estética v1.1 | Protocolo E-λ
// Un único ciclo controla el envejecimiento visual y la restauración.

(() => {
  "use strict";

  const container = document.getElementById("chat-container");
  const status = document.getElementById("entropy-status");
  const restoreButton = document.getElementById("restore-button");

  if (!container || !status || !restoreButton) {
    console.error("MSS-Estética: no se encontraron los elementos necesarios.");
    return;
  }

  const CONFIG = {
    decayPerSecond: 0.001,
    minimumIntegrity: 0.2,
    intervalMs: 10000
  };

  let integrity = 1;
  let lastUpdate = Date.now();

  function renderIntegrity() {
    const blur = integrity < 0.8 ? (0.8 - integrity) * 3 : 0;
    container.style.opacity = String(integrity);
    container.style.filter = `blur(${blur.toFixed(2)}px)`;
    status.textContent = `Integridad: ${Math.round(integrity * 100)}%`;
  }

  function ageSystem() {
    const now = Date.now();
    const elapsedSeconds = (now - lastUpdate) / 1000;
    lastUpdate = now;

    integrity = Math.max(
      CONFIG.minimumIntegrity,
      integrity - CONFIG.decayPerSecond * elapsedSeconds
    );

    renderIntegrity();
  }

  function restoreMemory() {
    integrity = 1;
    lastUpdate = Date.now();
    renderIntegrity();
    status.textContent = "Integridad: 100% · Memoria restaurada";
  }

  restoreButton.addEventListener("click", restoreMemory);

  // El envejecimiento se ejecuta aquí y no en index.html.
  window.setInterval(ageSystem, CONFIG.intervalMs);
  renderIntegrity();

  console.log("MSS-Estética v1.1 cargada. Protocolo E-λ activo.");
})();
