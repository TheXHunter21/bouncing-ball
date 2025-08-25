import { setupCanvas } from './render/canvas.js';
import { Engine } from './core/engine.js';
import { Clock } from './core/clock.js';
import { createInitialState, onResize, spawnBalls, updateGame } from './game/state.js';
import { drawWorld } from './render/drawWorld.js';
import { bindButtons } from './input/buttons.js';
import { bindKeys } from './input/keys.js';
import { bindUI } from './ui/configPanel.js';
import { bindLog } from './ui/logOverlay.js';
import { renderScoreboard } from './ui/scoreboard.js';
import { bindSpeedControl } from './ui/speedControl.js';  // 🔥 nuevo

const canvas = document.getElementById('game');
const ctx = setupCanvas(canvas);

const state = createInitialState(canvas);
state.renderScoreboard = ()=> renderScoreboard(state);
state.log = (m)=> console.log(`[%cBB%c] ${m}`, 'color:#7c4dff', 'color:inherit');

onResize(state, ctx);
spawnBalls(state, state.config.ballCount);
state.renderScoreboard();

// logs
const logBindings = bindLog(state);
state._toggleLogs = logBindings.toggle;

// config modal
bindUI(state, ctx);

// 🔥 velocidad global in-game (después de cargar config)
bindSpeedControl(state);

// HUD tiempo
const timeEl = document.getElementById('time');
state.setTimeText = (t)=>{ timeEl.textContent = t; };

// win
state.checkWin = ()=>{
  const alive = state.balls.filter(b=>b.alive);
  if(alive.length===0){ state.started=false; state.log('Todas murieron. Sin ganador.'); return true; }
  for(const b of alive){ if(b.r >= state.R-0.5){ state.started=false; state.log(`${b.id} alcanzó 100%. ¡Ganador!`); return true; } }
  if(alive.length===1){ state.started=false; state.log(`${alive[0].id} es el último con vida. ¡Ganador!`); return true; }
  return false;
};

const clock = new Clock();
const engine = new Engine({
  update: (dtReal) => {
    const dtScaled = dtReal * state.config.gameSpeed;
    if(state.started && !state.paused) state.gameNow += dtScaled * 1000;
    updateGame(state, dtScaled, state.gameNow);
  },
  draw: () => drawWorld(ctx, state, state.gameNow)
});
engine.start();

bindButtons(state, ctx, clock);
bindKeys(state, ctx, clock);
