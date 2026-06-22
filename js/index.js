/* ============================================================
   BATCOMPUTADOR — Lógica da experiência interativa
   Organizado em seções: geração de cenário, diálogos, formulário,
   validação, sequência cinematográfica e resultado final.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     0. REFERÊNCIAS DO DOM
     ---------------------------------------------------------- */
  const dialogueText   = document.getElementById('dialogueText');
  const dialogueCursor = document.getElementById('dialogueCursor');

  const nameInput   = document.getElementById('nameInput');
  const passInput   = document.getElementById('passInput');
  const togglePass  = document.getElementById('togglePass');
  const eyeIcon     = document.getElementById('eyeIcon');

  const strengthBar   = document.getElementById('strengthBar');
  const strengthLabel = document.getElementById('strengthLabel');

  const batSymbolBtn = document.getElementById('batSymbolBtn');
  const hintText     = document.getElementById('hintText');
  const batman       = document.getElementById('batman');
  const hud          = document.getElementById('hud');
  const loginForm    = document.getElementById('loginForm');

  const sequenceOverlay = document.getElementById('sequenceOverlay');
  const seqBuildings    = document.getElementById('seqBuildings');
  const seqBats         = document.getElementById('seqBats');
  const seqLightning    = document.getElementById('seqLightning');
  const seqBatman       = document.getElementById('seqBatman');
  const progressFill    = document.getElementById('progressFill');
  const progressPercent = document.getElementById('progressPercent');
  const progressLabel   = document.getElementById('progressLabel');

  const resultOverlay = document.getElementById('resultOverlay');
  const resultSignal  = document.getElementById('resultSignal');
  const resultTitle   = document.getElementById('resultTitle');
  const resultSub     = document.getElementById('resultSub');
  const retryBtn      = document.getElementById('retryBtn');

  const batSignalSky      = document.getElementById('batSignalSky');
  const batcomputerPanels = document.getElementById('batcomputerPanels');

  const cityFar  = document.getElementById('cityFar');
  const cityMid  = document.getElementById('cityMid');
  const cityNear = document.getElementById('cityNear');
  const batsLayer       = document.getElementById('batsLayer');
  const lightningFlash  = document.getElementById('lightningFlash');

  /* ----------------------------------------------------------
     1. GERAÇÃO DO CENÁRIO (skyline + morcegos)
     ---------------------------------------------------------- */

  // Cria prédios com janelas iluminadas para uma camada de parallax
  function buildSkyline(container, count, minH, maxH, minW, maxW) {
    let html = '';
    for (let i = 0; i < count; i++) {
      const h = minH + Math.random() * (maxH - minH);
      const w = minW + Math.random() * (maxW - minW);
      const delay = (Math.random() * 6).toFixed(2);
      html += `<div class="building" style="height:${h}px;width:${w}px;">
                 <div class="windows" style="animation-delay:${delay}s"></div>
               </div>`;
    }
    container.innerHTML = html + html; // duplica para o loop de scroll contínuo
  }

  buildSkyline(cityFar, 18, 60, 140, 30, 60);
  buildSkyline(cityMid, 14, 90, 220, 40, 80);
  buildSkyline(cityNear, 10, 140, 320, 60, 110);

  // Cria morcegos voando em posições e velocidades aleatórias
  function spawnBats(container, count) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const bat = document.createElement('div');
      bat.className = 'bat';
      const top = 5 + Math.random() * 60;
      const duration = 6 + Math.random() * 8;
      const delay = Math.random() * 10;
      bat.style.top = top + '%';
      bat.style.left = '-30px';
      bat.style.setProperty('--dur', duration + 's');
      bat.style.animation = `bat-fly-${i % 3} ${duration}s linear ${delay}s infinite`;
      container.appendChild(bat);
    }
  }

  // Gera dinamicamente 3 trajetórias variadas de voo para naturalidade
  const flightStyle = document.createElement('style');
  flightStyle.textContent = `
    @keyframes bat-fly-0 { 0%{transform:translate(0,0);} 25%{transform:translate(28vw,-30px);} 50%{transform:translate(55vw,20px);} 75%{transform:translate(80vw,-15px);} 100%{transform:translate(110vw,10px);} }
    @keyframes bat-fly-1 { 0%{transform:translate(0,0);} 30%{transform:translate(35vw,15px);} 60%{transform:translate(65vw,-25px);} 100%{transform:translate(112vw,5px);} }
    @keyframes bat-fly-2 { 0%{transform:translate(0,0);} 20%{transform:translate(20vw,-10px);} 50%{transform:translate(50vw,25px);} 80%{transform:translate(85vw,-20px);} 100%{transform:translate(115vw,0);} }
  `;
  document.head.appendChild(flightStyle);

  spawnBats(batsLayer, 7);
  spawnBats(seqBats, 5);

  // Relâmpagos aleatórios e ocasionais
  function scheduleLightning() {
    const delay = 4000 + Math.random() * 9000;
    setTimeout(() => {
      lightningFlash.classList.add('flash');
      setTimeout(() => lightningFlash.classList.remove('flash'), 400);
      scheduleLightning();
    }, delay);
  }
  scheduleLightning();

  /* ----------------------------------------------------------
     2. SISTEMA DE DIÁLOGO (efeito máquina de escrever)
     ---------------------------------------------------------- */
  let typeTimer = null;

  function typeWriter(text, speed = 38, onDone) {
    clearTimeout(typeTimer);
    dialogueText.textContent = '';
    let i = 0;
    function step() {
      if (i < text.length) {
        dialogueText.textContent += text.charAt(i);
        i++;
        typeTimer = setTimeout(step, speed);
      } else if (typeof onDone === 'function') {
        onDone();
      }
    }
    step();
  }

  // Mensagem inicial, ao abrir a página
  window.addEventListener('load', () => {
    setTimeout(() => {
      typeWriter('Quem deseja acessar os sistemas da Batcaverna?');
    }, 700);
  });

  /* ----------------------------------------------------------
     3. CAMPO NOME — reações do Batman
     ---------------------------------------------------------- */
  let nameDebounce = null;

  nameInput.addEventListener('focus', () => {
    batman.classList.add('looking-down');
  });

  nameInput.addEventListener('blur', () => {
    batman.classList.remove('looking-down');
  });

  nameInput.addEventListener('input', () => {
    clearTimeout(nameDebounce);
    const value = nameInput.value.trim();

    if (value.length === 0) {
      typeWriter('Identifique-se.');
    } else {
      // Espera o usuário pausar de digitar antes de confirmar o nome
      nameDebounce = setTimeout(() => {
        typeWriter(`Entendido, ${value}.`);
      }, 700);
    }
    checkFormReady();
  });

  /* ----------------------------------------------------------
     4. CAMPO SENHA — força da senha + reações do Batman
     ---------------------------------------------------------- */
  let passDebounce = null;

  passInput.addEventListener('focus', () => {
    batman.classList.add('arms-crossed');
  });

  passInput.addEventListener('blur', () => {
    batman.classList.remove('arms-crossed');
  });

  // Calcula a força da senha (0 a 4)
  function getPasswordScore(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  function updateStrengthUI(score, pw) {
    const percent = pw.length === 0 ? 0 : Math.max(18, (score / 4) * 100);
    strengthBar.style.width = percent + '%';

    if (pw.length === 0) {
      strengthBar.style.background = 'var(--red-alert)';
      strengthLabel.textContent = '\u00A0';
      return;
    }
    if (score <= 1) {
      strengthBar.style.background = 'var(--red-alert)';
      strengthLabel.textContent = 'FRACA';
      strengthLabel.style.color = 'var(--red-alert)';
    } else if (score === 2) {
      strengthBar.style.background = '#ffb238';
      strengthLabel.textContent = 'MÉDIA';
      strengthLabel.style.color = '#ffb238';
    } else {
      strengthBar.style.background = 'var(--neon-blue)';
      strengthLabel.textContent = 'FORTE';
      strengthLabel.style.color = 'var(--neon-blue)';
    }
  }

  passInput.addEventListener('input', () => {
    const pw = passInput.value;
    const score = getPasswordScore(pw);
    updateStrengthUI(score, pw);

    clearTimeout(passDebounce);
    passDebounce = setTimeout(() => {
      if (pw.length === 0) return;
      if (score <= 1) {
        typeWriter('Essa senha não protegeria nem Gotham.');
      } else if (score === 2) {
        typeWriter('Pode melhorar. Gotham espera mais de você.');
      } else {
        typeWriter('Boa escolha.');
      }
    }, 500);

    checkFormReady();
  });

  // Mostrar / ocultar senha
  togglePass.addEventListener('click', () => {
    const isPassword = passInput.type === 'password';
    passInput.type = isPassword ? 'text' : 'password';
    eyeIcon.innerHTML = isPassword
      ? '<path d="M3 3l18 18"/><path d="M10.6 10.6a3 3 0 0 0 4.2 4.2"/><path d="M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a17.6 17.6 0 0 1-3.06 4.06M6.1 6.1C3.5 7.9 2 10 2 10s4 8 11 8a10.3 10.3 0 0 0 2.4-.29"/>'
      : '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>';
  });

  /* ----------------------------------------------------------
     5. VALIDAÇÃO DO FORMULÁRIO — revela o símbolo do Batman
     ---------------------------------------------------------- */
  function checkFormReady() {
    const name = nameInput.value.trim();
    const score = getPasswordScore(passInput.value);
    const ready = name.length > 0 && score >= 2;

    batSymbolBtn.disabled = !ready;
    batSymbolBtn.classList.toggle('ready', ready);
    hintText.style.opacity = ready ? '0' : '1';
    hintText.textContent = ready
      ? ''
      : 'Preencha os campos para revelar o símbolo de acesso.';
  }

  /* ----------------------------------------------------------
     6. SEQUÊNCIA CINEMATOGRÁFICA DE SALTO ENTRE PRÉDIOS
     ---------------------------------------------------------- */
  batSymbolBtn.addEventListener('click', () => {
    if (batSymbolBtn.disabled) return;
    startAccessSequence();
  });

  function startAccessSequence() {
    const enteredName = nameInput.value.trim() || 'Agente';
    const score = getPasswordScore(passInput.value);

    // 1. Batman lança o gancho e salta
    batman.classList.remove('arms-crossed', 'looking-down');
    batman.classList.add('grapple-throw');

    setTimeout(() => {
      batman.classList.add('launching');
    }, 550);

    // 2. Esmaece o HUD do formulário
    setTimeout(() => {
      hud.classList.add('fade-out');
    }, 700);

    // 3. Revela a sequência de prédios em tela cheia
    setTimeout(() => {
      sequenceOverlay.classList.remove('hidden');
      requestAnimationFrame(() => sequenceOverlay.classList.add('visible'));
      buildSkyline(seqBuildings, 16, 120, 260, 60, 110);
      runProgressBar(() => finishSequence(enteredName, score));
      runSeqLightning();
    }, 1100);
  }

  // Relâmpagos extras durante o salto, para intensificar a cena
  let seqLightningActive = false;
  function runSeqLightning() {
    seqLightningActive = true;
    (function flashLoop() {
      if (!seqLightningActive) return;
      const delay = 600 + Math.random() * 1400;
      setTimeout(() => {
        if (!seqLightningActive) return;
        seqLightning.classList.add('flash');
        setTimeout(() => seqLightning.classList.remove('flash'), 350);
        flashLoop();
      }, delay);
    })();
  }

  // Barra de progresso "Verificando credenciais..."
  function runProgressBar(onComplete) {
    let progress = 0;
    const totalDuration = 3600; // ms
    const stepTime = 60;
    const increment = 100 / (totalDuration / stepTime);

    const interval = setInterval(() => {
      progress = Math.min(100, progress + increment);
      progressFill.style.width = progress + '%';
      progressPercent.textContent = Math.floor(progress) + '%';

      if (progress >= 100) {
        clearInterval(interval);
        progressLabel.innerHTML = 'CREDENCIAIS VERIFICADAS';
        setTimeout(onComplete, 500);
      }
    }, stepTime);
  }

  /* ----------------------------------------------------------
     7. RESULTADO FINAL — acesso autorizado ou negado
     ---------------------------------------------------------- */
  function finishSequence(name, passwordScore) {
    seqLightningActive = false;
    sequenceOverlay.classList.remove('visible');

    const accessGranted = passwordScore >= 3; // senha forte = acesso autorizado

    setTimeout(() => {
      sequenceOverlay.classList.add('hidden');
      resultOverlay.classList.remove('hidden');
      requestAnimationFrame(() => resultOverlay.classList.add('visible'));

      if (accessGranted) {
        showSuccess(name);
      } else {
        showFailure();
      }
    }, 500);
  }

  function showSuccess(name) {
    resultSignal.classList.add('show');
    batSignalSky.classList.add('show');

    resultTitle.textContent = 'ACESSO AUTORIZADO';
    resultTitle.className = 'result-title success';
    resultSub.textContent = '';

    typeFinalMessage(resultSub, `Bem-vindo à Batcaverna, ${name}.`, () => {
      batcomputerPanels.classList.add('on');
    });
  }

  function showFailure() {
    document.body.classList.add('alert-mode');
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 500);

    resultTitle.textContent = 'ACESSO NEGADO';
    resultTitle.className = 'result-title fail';
    resultSub.textContent = '';

    typeFinalMessage(resultSub, 'Você não possui autorização para acessar este sistema.', () => {
      retryBtn.classList.remove('hidden');
    });
  }

  // Pequeno efeito de máquina de escrever reutilizado na tela final
  function typeFinalMessage(el, text, onDone) {
    let i = 0;
    el.textContent = '';
    (function step() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        setTimeout(step, 30);
      } else if (onDone) {
        onDone();
      }
    })();
  }

  // Botão de tentar novamente após acesso negado
  retryBtn.addEventListener('click', () => {
    document.body.classList.remove('alert-mode');
    resultOverlay.classList.remove('visible');
    retryBtn.classList.add('hidden');

    setTimeout(() => {
      resultOverlay.classList.add('hidden');

      // Restaura o Batman para a posição inicial de observação
      batman.classList.remove('launching', 'grapple-throw');

      // Limpa os campos e o formulário
      passInput.value = '';
      updateStrengthUI(0, '');
      checkFormReady();

      hud.classList.remove('fade-out');
      typeWriter('Tente novamente. Identifique-se com credenciais válidas.');
    }, 600);
  });

  /* ----------------------------------------------------------
     8. ESTADO INICIAL
     ---------------------------------------------------------- */
  checkFormReady();
})();