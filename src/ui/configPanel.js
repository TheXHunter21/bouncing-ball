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
  const speedMult = document.getElementById('speedMult');
  const speedMultVal = document.getElementById('speedMultVal');

  const ids = name => document.getElementById(name);
  const w = {
    blue: ids('wBlue'), red: ids('wRed'), greenFast: ids('wGreenFast'), greenSlow: ids('wGreenSlow'),
    cyanShield: ids('wCyan'), yellowMorph: ids('wYellow'), whiteGhost: ids('wWhite'),
    turquoiseEdge: ids('wTurq'), pinkDup: ids('wPink'), grayObstacle: ids('wGray'),
    fuchsiaHalf: ids('wFuchsia'), skinTeleport: ids('wSkin')
  };
  const d = {
    boost: ids('durGreenFast'), slow: ids('durGreenSlow'), ghost: ids('durWhite'),
    edge: ids('durTurq'), morph: ids('durYellow'), obstacle: ids('durGray')
  };

  // Cargar config guardada
  const saved = loadConfig();
  if(saved){
    Object.assign(state.config, saved);
  }
  // sincronizar a inputs
  function syncToInputs(){
    ballCount.value = state.config.ballCount;
    maxPills.value = state.config.maxPills;
    spawnRate.value = state.config.spawnRatePct; spawnRateVal.textContent = `${state.config.spawnRatePct}%`;
    speedMult.value = state.config.speedMult; speedMultVal.textContent = `x${state.config.speedMult.toFixed(2)}`;
    for(const k in state.config.weights){ if(w[k]) w[k].value = state.config.weights[k]; }
    for(const k in state.config.durations){ if(d[k]) d[k].value = state.config.durations[k]; }
  }
  function clampAndPull(){
    const c = state.config;
    c.ballCount = Math.max(1, Math.min(50, Math.floor(+ballCount.value||3)));
    c.maxPills  = Math.max(0, Math.floor(+maxPills.value||20));
    c.spawnRatePct = Math.max(25, Math.min(300, Math.floor(+spawnRate.value||250)));
    c.speedMult = Math.max(0.5, Math.min(4, +speedMult.value||2.25));
    spawnRateVal.textContent=`${c.spawnRatePct}%`; speedMultVal.textContent=`x${c.speedMult.toFixed(2)}`;
    for(const k in c.weights){ if(w[k]) c.weights[k] = Math.max(0, Math.floor(+w[k].value||0)); }
    for(const k in c.durations){ if(d[k]) c.durations[k] = Math.max(1, Math.floor(+d[k].value||1)); }
  }
  function open(){ syncToInputs(); modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); }
  function close(){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); }

  btnOpen?.addEventListener('click', open);
  btnClose?.addEventListener('click', ()=>{ clampAndPull(); saveConfig(state.config); state.log('CONFIG aplicada'); close(); state.defaultSpeed = state.baseSpeed * state.config.speedMult; });
  btnReset?.addEventListener('click', ()=>{ resetConfig(); state.log('Config reseteada'); location.reload(); });

  // inputs live
  spawnRate.addEventListener('input', ()=>{ clampAndPull(); });
  speedMult.addEventListener('input', ()=>{ if(!state.started){ clampAndPull(); } else { speedMult.value = state.config.speedMult; } });
  Object.values(w).forEach(inp=>inp?.addEventListener('change', ()=>{ clampAndPull(); }));
  Object.values(d).forEach(inp=>inp?.addEventListener('change', ()=>{ clampAndPull(); }));

  // expone helpers a otros módulos
  state.openConfig = open; state.closeConfig = close;

  // inicial
  syncToInputs();
}
