// /src/input/buttons.js
import { startGame, togglePause, resetGame } from '../game/state.js';

export function bindButtons(state, ctx, clock /*, logBindings ya no se usa aquí */){
  const startBtn = document.getElementById('start');
  const pauseBtn = document.getElementById('pause');
  const resetBtn = document.getElementById('reset');
  const openConfigBtn = document.getElementById('openConfig');
  // ⚠️ OJO: NO tomamos #toggleLog aquí (lo maneja logOverlay.js)

  startBtn?.addEventListener('click', () => {
    if (!state.started) {
      state.closeConfig?.();
      startGame(state, clock.now());
      pauseBtn && (pauseBtn.disabled = false);
    }
  });

  pauseBtn?.addEventListener('click', () => togglePause(state, clock));

  resetBtn?.addEventListener('click', () => {
    resetGame(state, ctx);
    if (pauseBtn) pauseBtn.disabled = true;
  });

  openConfigBtn?.addEventListener('click', () => state.openConfig?.());
}
