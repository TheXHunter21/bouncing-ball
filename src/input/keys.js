import { startGame, togglePause, resetGame } from '../game/state.js';

export function bindKeys(state, ctx, clock){
  window.addEventListener('keydown', (e)=>{
    const tag=(e.target && e.target.tagName || '').toUpperCase();
    if(tag==='INPUT' || tag==='TEXTAREA') return;

    if(e.key==='Enter'){
      e.preventDefault();
      if(!state.started){ state.closeConfig?.(); startGame(state, state.gameNow); }
    }
    else if(e.code==='Space' || e.key===' '){
      e.preventDefault();
      if(!state.started){ state.closeConfig?.(); startGame(state, state.gameNow); }
      else { togglePause(state, clock); }
    }
    else if(e.key==='p' || e.key==='P'){
      e.preventDefault();
      if(state.started) togglePause(state, clock);
    }
    else if(e.key==='r' || e.key==='R'){
      e.preventDefault();
      resetGame(state, ctx);
    }
    else if(e.key==='l' || e.key==='L'){
      e.preventDefault();
      state._toggleLogs?.();
    }
    else if(e.key==='c' || e.key==='C'){
      e.preventDefault();
      const modal = document.getElementById('configModal');
      if(modal.classList.contains('show')) state.closeConfig?.(); else state.openConfig?.();
    }
    if(e.key==='Escape' && document.getElementById('configModal').classList.contains('show')){ state.closeConfig?.(); }
  });
}
