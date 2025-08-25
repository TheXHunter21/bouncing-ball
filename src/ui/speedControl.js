import { saveConfig, loadConfig } from '../core/storage.js';

export function bindSpeedControl(state){
  const input = document.getElementById('gameSpeedLive');
  const label = document.getElementById('gameSpeedLiveVal');
  if(!input || !label) return;

  // Asegura que haya valor en config (default x1)
  const saved = loadConfig();
  if(saved && typeof saved.gameSpeed === 'number'){
    state.config.gameSpeed = Math.max(0.25, Math.min(4, saved.gameSpeed));
  } else if (saved && typeof saved.speedMult === 'number' && saved.gameSpeed == null) {
    // migración muy vieja
    state.config.gameSpeed = Math.max(0.25, Math.min(4, +saved.speedMult || 1));
  }

  function syncUI(){
    input.value = state.config.gameSpeed;
    label.textContent = `x${(+state.config.gameSpeed).toFixed(2)}`;
  }
  syncUI();

  input.addEventListener('input', ()=>{
    state.config.gameSpeed = Math.max(0.25, Math.min(4, +input.value || 1));
    label.textContent = `x${state.config.gameSpeed.toFixed(2)}`;
    // Guardar inmediatamente
    saveConfig(state.config);
  });
}
