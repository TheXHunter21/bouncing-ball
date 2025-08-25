import { loadConfig, saveConfig, resetConfig } from '../core/storage.js';

export function bindUI(state, ctx){

// 1) Añade estas refs junto a los demás querySelectors (arriba):
const spawnImmSec = document.getElementById('spawnImmSec');
const spawnImmSecVal = document.getElementById('spawnImmSecVal');


  const modal = document.getElementById('configModal');
  const btnOpen = document.getElementById('openConfig');
  const btnClose = document.getElementById('closeConfig');
  const btnReset = document.getElementById('resetConfig');

  const timeEl = document.getElementById('time');
  state.setTimeText = (t)=>{ timeEl.textContent = t; };

  const ballCount = document.getElementById('ballCount');
  const maxPills = document.getElementById('maxPills');
  const spawnRate = document.getElementById('spawnRate');
  const spawnRateVal = document.getElementById('spawnRateVal');

  // 🆕 Delay inicial píldoras
  const pillStartDelay = document.getElementById('pillStartDelay');
  const pillStartDelayVal = document.getElementById('pillStartDelayVal');

  // 🆕 Nivel inicial
  const initialLevel = document.getElementById('initialLevel');

  const ids = name => document.getElementById(name);
  const w = {
    blue: ids('wBlue'), red: ids('wRed'), greenFast: ids('wGreenFast'), greenSlow: ids('wGreenSlow'),
    cyanShield: ids('wCyan'), yellowMorph: ids('wYellow'), whiteGhost: ids('wWhite'),
    turquoiseEdge: ids('wTurq'), pinkDup: ids('wPink'), grayObstacle: ids('wGray'),
    fuchsiaHalf: ids('wFuchsia'), skinTeleport: ids('wSkin')
  };
  const dur = {
    boost: ids('durGreenFast'), slow: ids('durGreenSlow'), ghost: ids('durWhite'),
    edge: ids('durTurq'), morph: ids('durYellow'), obstacle: ids('durGray')
  };

  // Cargar config guardada
  const saved = loadConfig();
  if(saved){ Object.assign(state.config, saved); }
  // defaults si faltan
  if (typeof state.config.spawnImmunitySec !== 'number') state.config.spawnImmunitySec = 0.7;
  if (typeof state.config.initialPillDelaySec !== 'number') state.config.initialPillDelaySec = 1.0;
  if (typeof state.config.initialLevel !== 'number') state.config.initialLevel = 5;

  function syncToInputs(){
    ballCount.value = state.config.ballCount;
    maxPills.value = state.config.maxPills;
    spawnRate.value = state.config.spawnRatePct;
    spawnRateVal.textContent = `${state.config.spawnRatePct}%`;

    pillStartDelay.value = state.config.initialPillDelaySec;
    pillStartDelayVal.textContent = `${Number(state.config.initialPillDelaySec).toFixed(1)}s`;

    initialLevel.value = state.config.initialLevel;

    for(const k in state.config.weights){ if(w[k]) w[k].value = state.config.weights[k]; }
    for(const k in state.config.durations){ if(dur[k]) dur[k].value = state.config.durations[k]; }

    // 2) Dentro de syncToInputs(), añade estas líneas:
spawnImmSec.value = state.config.spawnImmunitySec;
spawnImmSecVal.textContent = `${Number(state.config.spawnImmunitySec).toFixed(1)}s`;

  }

  function clampAndPull(){
    const c = state.config;
    c.ballCount = Math.max(1, Math.min(50, Math.floor(+ballCount.value||3)));
    c.maxPills  = Math.max(0, Math.floor(+maxPills.value||20));
    c.spawnRatePct = Math.max(25, Math.min(300, Math.floor(+spawnRate.value||250)));

    c.initialPillDelaySec = Math.max(0, Math.min(20, +pillStartDelay.value || 0));
    pillStartDelayVal.textContent = `${c.initialPillDelaySec.toFixed(1)}s`;

    c.initialLevel = Math.max(1, Math.min(10, Math.floor(+initialLevel.value || 5)));

    for(const k in c.weights){ if(w[k]) c.weights[k] = Math.max(0, Math.floor(+w[k].value||0)); }
    for(const k in c.durations){ if(dur[k]) c.durations[k] = Math.max(1, Math.floor(+dur[k].value||1)); }
    // 3) Dentro de clampAndPull(), añade:
state.config.spawnImmunitySec = Math.max(0, Math.min(20, +spawnImmSec.value || 0));
spawnImmSecVal.textContent = `${state.config.spawnImmunitySec.toFixed(1)}s`;

  }

  function open(){ syncToInputs(); modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); }
  function close(){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); }

  btnOpen?.addEventListener('click', open);
  btnClose?.addEventListener('click', ()=>{
    clampAndPull();
    saveConfig(state.config);
    state.log('CONFIG aplicada');
    // Si cambiaste el nivel inicial, aplica al próximo reset/start:
    // (no respawneamos aquí para no cortar una partida en curso)
    close();
  });
  btnReset?.addEventListener('click', ()=>{ resetConfig(); state.log('Config reseteada'); location.reload(); });

  // live feedback
  spawnRate.addEventListener('input', ()=>{ clampAndPull(); });
  pillStartDelay.addEventListener('input', ()=>{ clampAndPull(); });
  initialLevel.addEventListener('change', ()=>{ clampAndPull(); });
  // 4) En los listeners (abajo), añade:
spawnImmSec.addEventListener('input', () => { clampAndPull(); });


  Object.values(w).forEach(inp=>inp?.addEventListener('change', ()=>{ clampAndPull(); }));
  Object.values(dur).forEach(inp=>inp?.addEventListener('change', ()=>{ clampAndPull(); }));

  state.openConfig = open; state.closeConfig = close;
  syncToInputs();
}


