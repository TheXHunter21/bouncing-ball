import { startGame, togglePause, resetGame } from '../game/state.js';

export function bindButtons(state, ctx, clock){
  const startBtn = document.getElementById('start');
  const pauseBtn = document.getElementById('pause');
  const resetBtn = document.getElementById('reset');
  const openConfigBtn = document.getElementById('openConfig');

  startBtn?.addEventListener('click', ()=>{
    if(!state.started){
      state.closeConfig?.();
      // 🔧 usar tiempo DE JUEGO, no clock.now()
      startGame(state, state.gameNow);
      if(pauseBtn) pauseBtn.disabled = false;
    }
  });

  pauseBtn?.addEventListener('click', ()=> togglePause(state, clock));
  resetBtn?.addEventListener('click', ()=>{ resetGame(state, ctx); if(pauseBtn) pauseBtn.disabled = true; });
  openConfigBtn?.addEventListener('click', ()=> state.openConfig?.());
}
