import { startGame, togglePause, resetGame } from '../game/state.js';
import { saveConfig } from '../core/storage.js';

export function bindKeys(state, ctx, clock){
  window.addEventListener('keydown', (e)=>{
    const tag=(e.target && e.target.tagName || '').toUpperCase();
    if(tag==='INPUT' || tag==='TEXTAREA') return;

    if (e.key === "Enter") {
      e.preventDefault();
      if (!state.started) {
        state.closeConfig?.();
        startGame(state, state.gameNow);
      }
    } else if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      if (!state.started) {
        state.closeConfig?.();
        startGame(state, state.gameNow);
      } else {
        togglePause(state, clock);
      }
    } else if (e.key === "p" || e.key === "P") {
      e.preventDefault();
      if (state.started) togglePause(state, clock);
    } else if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      resetGame(state, ctx);
    } else if (e.key === "l" || e.key === "L") {
      e.preventDefault();
      state._toggleLogs?.();
    } else if (e.key === "c" || e.key === "C") {
      e.preventDefault();
      const modal = document.getElementById("configModal");
      if (modal.classList.contains("show")) state.closeConfig?.();
      else state.openConfig?.();
    } else if (
      e.code === "NumpadAdd" ||
      e.key === "+" ||
      (e.key === "=" && e.shiftKey)
    ) {
      e.preventDefault();
      adjustGameSpeed(+0.25);
    } else if (e.code === "NumpadSubtract" || e.key === "-" || e.key === "_") {
      e.preventDefault();
      adjustGameSpeed(-0.25);
    }

    if(e.key==='Escape' && document.getElementById('configModal').classList.contains('show')){ state.closeConfig?.(); }
  });
  function adjustGameSpeed(delta){
  const min=0.25, max=4, step=0.25;
  let s = (state.config.gameSpeed ?? 1) + delta;
  // redondear a step y acotar
  s = Math.round(s/step)*step;
  s = Math.max(min, Math.min(max, s));
  state.config.gameSpeed = s;
  // reflejar en UI si está el slider
  const inp = document.getElementById('gameSpeedLive');
  const lbl = document.getElementById('gameSpeedLiveVal');
  if(inp) inp.value = s;
  if(lbl) lbl.textContent = `x${s.toFixed(2)}`;
  saveConfig(state.config);
  state.log(`Velocidad del juego: x${s.toFixed(2)}`);
}

}
