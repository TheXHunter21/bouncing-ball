import { LEVEL_START, BALL_INIT_RADIUS, randAngle, PILL_RADIUS } from '../constants.js';
import { moveAndBounce } from './systems/physics.js';
import { collideBalls } from './systems/collisions.js';
import { tickObstacle } from './systems/obstacle.js';
import { spawnTick, scheduleNextSpawn } from './systems/spawn.js';
import { onConsumePill } from './pillsRegistry.js';
import { tickFrenzy } from './systems/frenzy.js';
import { tickTeleport } from './systems/teleport.js';

export function createInitialState(canvas) {
  return {
    canvas,
    R: 0,
    PILL_RADIUS,

    borderColor: '#222',
    started:false, paused:false,

    baseSpeed:0,
    defaultSpeed:0,

    gameNow: 0,

    balls:[],
    pills:[],
    obstacle:{ active:false, until:0, r:0 },

    morphType:null, morphUntil:0,
    teleportMarkId:null, teleportPair:null,

    nextSpawnAt:null,

    // 🔥 NUEVO: spawnImmunitySec configurable (default 0.7s)
    config: {
      ballCount:3, maxPills:20, spawnRatePct:250,
      gameSpeed: 1.0,
      spawnImmunitySec: 0.7,
      durations:{ boost:5, slow:5, ghost:5, edge:5, morph:8, obstacle:8 },
      weights:{
        blue:150, red:20, greenFast:15, greenSlow:15, cyanShield:25,
        yellowMorph:5, whiteGhost:10, turquoiseEdge:10, pinkDup:10,
        grayObstacle:10, fuchsiaHalf:3, skinTeleport:3
      }
    },

    log:(m)=>console.log('[LOG]',m),
    renderScoreboard:null,
    setTimeText:null,
    getBall(id){ return this.balls.find(b=>b.id===id); },
    checkWin:null,
  };
}

export function onResize(state, ctx) {
  const css = ctx._cssSize;
  state.R = (css/2) - 10;
  state.baseSpeed = state.R * 0.45;
  state.defaultSpeed = state.baseSpeed;
}

function randomNonBlueRed(){
  while(true){
    const h=Math.floor(Math.random()*360), red=(h<=15||h>=345), blue=(h>=200&&h<=260);
    if(!red && !blue) return `hsl(${h} 80% 55%)`;
  }
}

export function spawnBalls(state, count) {
  state.balls.length=0;
  const r0 = BALL_INIT_RADIUS;
  for(let i=0;i<count;i++){
    let pos, tries=0;
    do{
      const a=randAngle(), rr=30+Math.random()*60;
      pos={x:Math.cos(a)*rr, y:Math.sin(a)*rr}; tries++;
    }while(tries<100 && state.balls.some(b=>Math.hypot(b.pos.x-pos.x,b.pos.y-pos.y)<(b.r+r0+8)));
    state.balls.push({
      id:`P${i+1}`, color:randomNonBlueRed(),
      pos, vel:{x:0,y:0}, r:r0, level:LEVEL_START, alive:true,

      shield:false, ghostUntil:0, edgeGrowUntil:0,
      speedEffect:'none', speedEffectUntil:0,
      dupNext:false, teleportMarked:false, noCollideUntil:0
    });
  }
}

export function startGame(state, now){
  if(state.started) return;
  state.started=true; state.paused=false;

  const immMs = Math.max(0, Math.min(20000, (state.config.spawnImmunitySec ?? 0.7) * 1000));

  for(const b of state.balls){
    const a=randAngle(); const v=state.defaultSpeed;
    b.vel.x=Math.cos(a)*v; b.vel.y=Math.sin(a)*v;
    b.noCollideUntil = now + immMs;   // 🔥 usa config
  }
  state.log(`Juego iniciado (invulnerabilidad: ${(immMs/1000).toFixed(1)}s)`);
  scheduleNextSpawn(state, now);
}

export function togglePause(state, clock){
  if(!state.started) return;
  state.paused = !state.paused;
  if(state.paused) clock.pause(); else clock.resume();
  state.renderScoreboard?.();
  state.log(state.paused?'Pausa':'Reanudar');
}

export function resetGame(state, ctx){
  state.started=false;
  state.paused=false;
  state.gameNow = 0;

  state.pills.length=0;
  state.nextSpawnAt=null;

  state.obstacle.active=false;
  state.obstacle.until=0;
  state.obstacle.r=0;

  state.morphType=null;
  state.morphUntil=0;
  state.borderColor='#222';

  state.teleportMarkId=null;
  state.teleportPair=null;

  onResize(state, ctx);
  spawnBalls(state, state.config.ballCount);

  state.setTimeText?.('0.00');
  state.renderScoreboard?.();

  state.log('Juego reiniciado');
}

export function updateGame(state, dtScaled, now){
  if(!state.started || state.paused) return;

  state.setTimeText?.((now/1000).toFixed(2));

  // timers
  tickFrenzy(state, now, state.log);
  tickObstacle(state, now, state.log);
  tickTeleport(state, now, state.log);

  // spawner
  spawnTick(state, now, state.log);

  // física y colisiones
  moveAndBounce(state, dtScaled, now, state.log);
  collideBalls(state, now, state.log);

  // pills pickup
  for(let i=state.pills.length-1;i>=0;i--){
    const p = state.pills[i]; let consumed=false;
    for(const b of state.balls){
      if(!b.alive) continue;
      const d=Math.hypot(b.pos.x-p.x, b.pos.y-p.y);
      if(d <= b.r + state.PILL_RADIUS){
        onConsumePill(p, b, state, now, state.log);
        state.log(`${b.id} consumió píldora ${p.name}.`);
        consumed=true; break;
      }
    }
    if(consumed) state.pills.splice(i,1);
  }

  if(state.checkWin?.()) return;
}
