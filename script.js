// -------------------- Navegación entre secciones --------------------
// -------------------- Navegación entre secciones --------------------
document.querySelectorAll('header nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = e.currentTarget.getAttribute('data-section');
    document.querySelectorAll('main section').forEach(sec => sec.classList.remove('active'));
    const targetSection = document.getElementById(target);
    if (targetSection) targetSection.classList.add('active');
    updateBackButton();
    speak(`Sección ${target} abierta`);
  });
});

// -------------------- Accesibilidad: lectura por voz --------------------
let speechEnabled = false;

function speak(text) {
  if (!speechEnabled) return;
  if ('speechSynthesis' in window && text) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'es-ES';
    speechSynthesis.speak(utter);
  }
}

const btnSpeakSection = document.getElementById('btnSpeakSection');
const btnStopSpeak = document.getElementById('btnStopSpeak');

if (btnSpeakSection) {
  btnSpeakSection.addEventListener('click', () => {
    speechEnabled = true;
    const activeSection = document.querySelector('main section.active');
    if (activeSection) {
      const textContent = Array.from(activeSection.querySelectorAll('h1,h2,h3,p,li'))
        .map(el => el.textContent.trim())
        .filter(t => t.length > 0)
        .join('. ');
      speak(textContent || "Sección abierta");
    }
  });
}

if (btnStopSpeak) {
  btnStopSpeak.addEventListener('click', () => {
    speechEnabled = false;
    window.speechSynthesis.cancel();
  });
}

// -------------------- Acordeón en #contenido --------------------
Array.from(document.getElementsByClassName("accordion")).forEach(acc => {
  acc.addEventListener("click", function() {
    this.classList.toggle("active");
    const panel = this.nextElementSibling;
    if (!panel) return;
    panel.style.display = panel.style.display === "block" ? "none" : "block";
    if (panel.style.display === "block") {
      panel.classList.add('show');
      speak(`Sección del acordeón abierta: ${this.textContent}`);
    } else {
      panel.classList.remove('show');
      speak(`Sección del acordeón cerrada: ${this.textContent}`);
    }
  });
});
// -------------------- Portada: comenzar desafíos --------------------
const startBtn = document.getElementById('startChallenges');
if (startBtn) {
  startBtn.addEventListener('click', () => {
    const lvl1 = document.getElementById('lvl1');
    if (!lvl1) return;
    lvl1.classList.remove('hidden');
    lvl1.dataset.locked = "false";
    lvl1.classList.add('revealed');
    setTimeout(() => lvl1.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
speak("Comenzamos los desafíos. Nivel 1 desbloqueado");
  });
}


// -------------------- Skulpt: ejecución con tests --------------------
async function runCode(codeId) {
  const prog = document.getElementById("code" + codeId)?.value || "";
  const consoleEl = document.getElementById("console" + codeId);
  if (!consoleEl) return;
  consoleEl.innerHTML = "";

  const outBuf = [];
  function outf(text) {
    if (!text.startsWith("__TEST__")) consoleEl.innerHTML += text + "\n";
    outBuf.push(text);
  }

  function builtinRead(x) {
    if (!Sk.builtinFiles || !Sk.builtinFiles["files"][x]) throw "Archivo no encontrado: '" + x + "'";
    return Sk.builtinFiles["files"][x];
  }

  Sk.pre = "console";
  Sk.configure({ output: outf, read: builtinRead });

  let testScript = prog + "\n\n";

  if (codeId === "1") {
    testScript += 'try:\n'
      + '  r1 = acceso(20)\n'
      + '  r2 = acceso(15)\n'
      + '  print("__TEST__RESULT__:"+str(r1)+":"+str(r2))\n'
      + 'except Exception as e:\n'
      + '  print("__TEST__ERROR__:"+str(e))\n';
  } else if (codeId === "2") {
    testScript += 'try:\n'
      + '  r1 = clasificar(50)\n'
      + '  r2 = clasificar(75)\n'
      + '  r3 = clasificar(95)\n'
      + '  print("__TEST__RESULT__:"+str(r1)+":"+str(r2)+":"+str(r3))\n'
      + 'except Exception as e:\n'
      + '  print("__TEST__ERROR__:"+str(e))\n';
  } else if (codeId === "3") {
    testScript += 'try:\n'
      + '  r1 = categoria(10)\n'
      + '  r2 = categoria(15)\n'
      + '  r3 = categoria(30)\n'
      + '  r4 = categoria(70)\n'
      + '  print("__TEST__RESULT__:"+str(r1)+":"+str(r2)+":"+str(r3)+":"+str(r4))\n'
      + 'except Exception as e:\n'
      + '  print("__TEST__ERROR__:"+str(e))\n';
  } else if (codeId === "4") {
    testScript += 'try:\n'
      + '  r1 = riesgo(30)\n'
      + '  r2 = riesgo(65)\n'
      + '  r3 = riesgo(90)\n'
      + '  print("__TEST__RESULT__:"+str(r1)+":"+str(r2)+":"+str(r3))\n'
      + 'except Exception as e:\n'
      + '  print("__TEST__ERROR__:"+str(e))\n';
  }

  try {
    await Sk.misceval.asyncToPromise(() =>
      Sk.importMainWithBody("<stdin>", false, testScript, true)
    );

    const outStr = outBuf.join("\n");
    const resMatch = outStr.match(/__TEST__RESULT__:(.*)/);
    const errMatch = outStr.match(/__TEST__ERROR__:(.*)/);
    let passed = false;

    if (errMatch) {
      consoleEl.innerHTML += "\n❌ Error al ejecutar la función: " + errMatch[1];
    } else if (resMatch) {
      const values = resMatch[1].split(':').map(s => s.trim());
      if (codeId === "1") {
        passed = values.length >= 2 && values[0] === "PERMITIDO" && values[1] === "DENEGADO";
      } else if (codeId === "2") {
        passed = values.length >= 3 && values[0] === "Insuficiente" && values[1] === "Bueno" && values[2] === "Excelente";
      } else if (codeId === "3") {
        passed = values.length >= 4 && values[0] === "Niño" && values[1] === "Adolescente" && values[2] === "Adulto" && values[3] === "Anciano";
      } else if (codeId === "4") {
        passed = values.length >= 3 && values[0] === "Bajo" && values[1] === "Moderado" && values[2] === "Alto";
      }
    }

    if (passed) {
  let mensajes = {
    1: "¡Genial! Superaste el primer desafío: condicional simple dominado.",
    2: "¡Bien hecho! Completaste el segundo desafío: condicional compuesto.",
    3: "¡Excelente! Lograste resolver el tercer desafío: múltiples condiciones.",
    4: "¡Increíble! Has completado todos los desafíos y dominas condicionales."
  };

  consoleEl.innerHTML += `\n${mensajes[parseInt(codeId, 10)]}`;
showLevelSuccess(mensajes[parseInt(codeId, 10)]);
  updateProgress(parseInt(codeId, 10));
  if (score === 100) showFinalAchievements();
    } else if (!errMatch) {
      consoleEl.innerHTML += "\n❌ Revisa tu código, aún no es correcto.";
    }
  } catch (e) {
    consoleEl.innerHTML = e.toString();
  }
}

// -------------------- Botones ejecutar y pista --------------------
document.querySelectorAll('button.run').forEach(btn => {
  btn.addEventListener('click', () => runCode(btn.dataset.id));
});

document.querySelectorAll('button.hint').forEach(btn => {
  btn.addEventListener('click', () => {
    const hints = {
      1: 'Usa if y else según la edad.',
      2: 'Evalúa primero si nota >= 90, luego >= 60.',
      3: 'Usa if / elif / else para rangos de edad.',
      4: 'Compara porcentaje con 50 y 80.'
    };
    alert("Pista: " + hints[btn.dataset.id]);
  });
});

// -------------------- Progreso, medallas y desbloqueo progresivo --------------------
let score = 0;

function applyMedals(container) {
  if (!container) return;
  const medals = container.querySelectorAll('.medal');
  medals.forEach(m => m.classList.remove('unlocked'));

  if (score >= 25) medals[0]?.classList.add('unlocked');
  if (score >= 50) medals[1]?.classList.add('unlocked');
  if (score >= 75) medals[2]?.classList.add('unlocked');
  if (score >= 100) medals[3]?.classList.add('unlocked');
}

function updateAllMedals() {
  applyMedals(document.getElementById('medalsMain'));
  applyMedals(document.getElementById('medalsFixed'));
}

function updateProgress(id) {
  score += 25;

  // HUD principal
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  if (progressBar) progressBar.style.width = score + "%";
  if (progressText) progressText.textContent = score + "%";
  const scoreEl = document.getElementById("score");
  if (scoreEl) scoreEl.textContent = Math.min(score, 100);

  // HUD fijo (dentro del mensaje)
  const fixedBar = document.getElementById("progressBarFixed");
  const fixedText = document.getElementById("progressTextFixed");
  if (fixedBar && fixedText) {
    fixedBar.style.width = score + "%";
    fixedText.textContent = score + "%";
  }

  // Desbloquear siguiente nivel
  if (id < 4) {
    const nextLvl = document.getElementById("lvl" + (id + 1));
    if (nextLvl) {
      nextLvl.dataset.locked = "false";
      nextLvl.classList.remove('hidden');
      nextLvl.classList.add('revealed');
      setTimeout(() => nextLvl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
    }
  }

  updateAllMedals();
}

// -------------------- Mensaje de nivel completado --------------------
function showLevelSuccess(msjPersonalizado) {
  const msg = document.getElementById('levelSuccess');
  if (msg) {
    msg.innerHTML = `🎉 ${msjPersonalizado || '¡Nivel completado!'} 🎉`; 
    msg.style.display = 'block';
    updateAllMedals();
    createConfetti();
    setTimeout(() => { msg.style.display = 'none'; }, 2200);
  } else {
    createConfetti();
  }
}

// -------------------- Overlay final --------------------
function showFinalAchievements() {
  if (document.getElementById('achievementOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'achievementOverlay';
  overlay.innerHTML = `
    <div>
      <h1>🏆 ¡Misión Completada!</h1>
      <p>¡Felicitaciones! Superaste todos los desafíos y dominaste las estructuras condicionales.</p>
      <div class="medals" id="overlayMedals">
        <span class="medal" data-level="1">🟢</span>
        <span class="medal" data-level="2">🔵</span>
        <span class="medal" data-level="3">🟣</span>
        <span class="medal" data-level="4">🏆</span>
      </div>
      <div style="margin:20px 0;">
        <button id="restartOverlayBtn">Comenzar de nuevo</button>
        <button id="closeOverlayBtn">Cerrar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Marcar medallas desbloqueadas en overlay
  applyMedals(document.getElementById('overlayMedals').parentElement);

  // Confeti
  createConfetti();

  document.getElementById('restartOverlayBtn').addEventListener('click', () => location.reload());
  document.getElementById('closeOverlayBtn').addEventListener('click', () => {
    overlay.remove();
  });
}

// -------------------- Confeti --------------------
function createConfetti() {
  let confettiContainer = document.getElementById('confetti');
  let createdTemp = false;
  if (!confettiContainer) {
    confettiContainer = document.createElement('div');
    confettiContainer.id = 'confetti';
    document.body.appendChild(confettiContainer);
    createdTemp = true;
  }
  confettiContainer.style.position = 'fixed';
  confettiContainer.style.top = '0';
  confettiContainer.style.left = '0';
  confettiContainer.style.width = '100%';
  confettiContainer.style.height = '100%';
  confettiContainer.style.pointerEvents = 'none';
  confettiContainer.style.overflow = 'visible';
  confettiContainer.style.zIndex = '9999';

  for (let i = 0; i < 100; i++) {
    const piece = document.createElement('div');
    piece.classList.add('confetti-piece');
    piece.style.position = 'fixed';
    piece.style.backgroundColor = `hsl(${Math.random() * 360},100%,50%)`;
    piece.style.left = Math.random() * window.innerWidth + "px";
    piece.style.top = "-20px";
    piece.style.width = 5 + Math.random() * 10 + "px";
    piece.style.height = 5 + Math.random() * 10 + "px";
    piece.style.opacity = String(0.6 + Math.random() * 0.4);
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.borderRadius = '2px';
    piece.style.pointerEvents = 'none';
    piece.style.willChange = 'transform, top, left, opacity';
    confettiContainer.appendChild(piece);
    fall(piece);
  }

  setTimeout(() => {
    if (confettiContainer) confettiContainer.innerHTML = "";
    if (createdTemp && confettiContainer.parentNode) confettiContainer.parentNode.removeChild(confettiContainer);
  }, 7000);
}

function fall(piece) {
  let top = -20;
  const speed = 2 + Math.random() * 5;
  const amplitude = 50 + Math.random() * 50;
  const drift = (Math.random() - 0.5) * 2;
  const interval = setInterval(() => {
    top += speed;
    const currentLeft = parseFloat(piece.style.left);
    piece.style.top = top + "px";
    piece.style.left = (currentLeft + Math.sin(top / 20) * amplitude / 100 + drift) + "px";
    piece.style.transform = `rotate(${parseFloat(piece.style.transform.replace(/[^\d.-]/g, '')) + 5}deg)`;
    if (top > window.innerHeight + 50) {
      clearInterval(interval);
      if (piece.parentNode) piece.parentNode.removeChild(piece);
    }
  }, 16);
}

// -------------------- Botón volver --------------------
const btnBack = document.getElementById('btnBack');
function updateBackButton() {
  const activeSection = document.querySelector('main section.active')?.id;
  btnBack.style.display = activeSection && activeSection !== 'inicio' ? 'block' : 'none';
}
if (btnBack) {
  btnBack.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('main section').forEach(sec => sec.classList.remove('active'));
    document.getElementById('inicio').classList.add('active');
    updateBackButton();
  });
}
updateBackButton();
