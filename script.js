console.log("Sitio cargado correctamente");
// script.js - Implementación del Protocolo E-λ (Inge-Niería de la Finitud)

// script.js - Entropía Sutil
const container = document.getElementById('chat-container');
let integridad = 1.0;
const lambda = 0.001; // Súper sutil: tarda mucho más en desvanecerse

function envejecerSitiio() {
    integridad -= lambda;
    if (integridad < 0.2) integridad = 0.2; // Nunca desaparece del todo

    // Efectos sutiles
    container.style.opacity = integridad;
    // Solo aplica desenfoque en niveles bajos de integridad
    const blurAmount = integridad < 0.8 ? (0.8 - integridad) * 3 : 0;
    container.style.filter = `blur(${blurAmount}px)`;
}

// Envejece cada 10 segundos
setInterval(envejecerSitiio, 10000);

// Restaurar con un clic en cualquier parte del chat
document.addEventListener('click', () => {
    integridad = 1.0;
    container.style.opacity = 1;
    container.style.filter = 'blur(0px)';
    console.log("Memoria refrescada.");
});
