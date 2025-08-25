import { loadConfig, saveConfig, resetConfig } from '../core/storage.js';

export function bindUI(state, ctx){
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

  // 🔥 NUEVO: invulnerabilidad inicial (s)
  const spawnImmSec = document.getElementById('spawnImmSec');
  const spawnImmSecVal = document.getElementById('spawnImmSecVal');

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
  // valor por defecto si no existía
  if (typeof state.config.spawnImmunitySec !== 'number') state.config.spawnImmunitySec = 0.7;

  function syncToInputs(){
    ballCount.value = state.config.ballCount;
    maxPills.value = state.config.maxPills;
    spawnRate.value = state.config.spawnRatePct;
    spawnRateVal.textContent = `${state.config.spawnRatePct}%`;

    // invulnerabilidad
    spawnImmSec.value = state.config.spawnImmunitySec;
    spawnImmSecVal.textContent = `${Number(state.config.spawnImmunitySec).toFixed(1)}s`;

    for(const k in state.config.weights){ if(w[k]) w[k].value = state.config.weights[k]; }
    for(const k in state.config.durations){ if(dur[k]) dur[k].value = state.config.durations[k]; }
  }

  function clampAndPull(){
    const c = state.config;
    c.ballCount = Math.max(1, Math.min(50, Math.floor(+ballCount.value||3)));
    c.maxPills  = Math.max(0, Math.floor(+maxPills.value||20));
    c.spawnRatePct = Math.max(25, Math.min(300, Math.floor(+spawnRate.value||250)));
    // clamp invulnerabilidad 0–20s
    c.spawnImmunitySec = Math.max(0, Math.min(20, +spawnImmSec.value || 0));
    spawnImmSecVal.textContent = `${c.spawnImmunitySec.toFixed(1)}s`;

    for(const k in c.weights){ if(w[k]) c.weights[k] = Math.max(0, Math.floor(+w[k].value||0)); }
    for(const k in c.durations){ if(dur[k]) c.durations[k] = Math.max(1, Math.floor(+dur[k].value||1)); }
  }

  function open(){ syncToInputs(); modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); }
  function close(){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); }

  btnOpen?.addEventListener('click', open);
  btnClose?.addEventListener('click', ()=>{
    clampAndPull();
    saveConfig(state.config);
    state.log('CONFIG aplicada');
    close();
  });
  btnReset?.addEventListener('click', ()=>{ resetConfig(); state.log('Config reseteada'); location.reload(); });

  // live feedback
  spawnRate.addEventListener('input', ()=>{ clampAndPull(); });
  spawnImmSec.addEventListener('input', ()=>{ clampAndPull(); }); // 🔥

  Object.values(w).forEach(inp=>inp?.addEventListener('change', ()=>{ clampAndPull(); }));
  Object.values(dur).forEach(inp=>inp?.addEventListener('change', ()=>{ clampAndPull(); }));

  state.openConfig = open; state.closeConfig = close;
  syncToInputs();
}
