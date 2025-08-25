import { LEVEL_START, BALL_INIT_RADIUS, SPEED_MULT_DEFAULT, SPAWN_IMMUNITY_MS, randAngle, PILL_RADIUS } from '../constants.js';
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
    // flags
    started:false, paused:false,
    // velocidad
    baseSpeed:0, defaultSpeed:0,
    // entidades
    balls:[],
    pills:[],
    obstacle:{ active:false, until:0, r:0 },
    // morph
    morphType:null, morphUntil:0,
    // teleport
    teleportMarkId:null, teleportPair:null,
    // spawner
    nextSpawnAt:null,
    // config runtime
    config: {
      ballCount:3, maxPills:20, spawnRatePct:250,
      speedMult:SPEED_MULT_DEFAULT,
      durations:{ boost:5, slow:5, ghost:5, edge:5, morph:8, obstacle:8 },
      weights:{
        blue:150, red:20, greenFast:15, greenSlow:15, cyanShield:25,
        yellowMorph:5, whiteGhost:10, turquoiseEdge:10, pinkDup:10,
        grayObstacle:10, fuchsiaHalf:3, skinTeleport:3
      }
    },
    // helpers asignados desde main/ui
    log:(m)=>console.log('[LOG]',m),
    renderScoreboard:null,
    setTimeText:null,
    getBall(id){ return this.balls.find(b=>b.id===id); },
    checkWin:null, // set en main si quieres
  };
}

export function onResize(state, ctx) {
  const css = ctx._cssSize;
  state.R = (css/2) - 10;
  state.baseSpeed = state.R * 0.45;
  state.defaultSpeed = state.baseSpeed * state.config.speedMult;
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
      shield:false, ghostUntil:0, edgeGrowUntil:0, speedEffect:'none', speedEffectUntil:0,
      dupNext:false, teleportMarked:false, noCollideUntil:0
    });
  }
}

export function startGame(state, now){
  if(state.started) return;
  state.started=true; state.paused=false;
  for(const b of state.balls){
    const a=randAngle(); const v=state.defaultSpeed;
    b.vel.x=Math.cos(a)*v; b.vel.y=Math.sin(a)*v; b.noCollideUntil=now+SPAWN_IMMUNITY_MS;
  }
  state.log('Juego iniciado');
  scheduleNextSpawn(state, now);
}

export function togglePause(state, clock){
  if(!state.started) return;
  state.paused = !state.paused;
  if(state.paused) clock.pause(); else clock.resume();
  state.log(state.paused?'Pausa':'Reanudar');
}

export function resetGame(state, ctx){
  // 1) cortar el juego YA
  state.started = false;
  state.paused = false;

  // 2) limpiar todo lo que puede arrastrar efectos de la partida anterior
  state.pills.length = 0;
  state.nextSpawnAt = null;

  state.obstacle.active = false;
  state.obstacle.until = 0;
  state.obstacle.r = 0;

  state.morphType = null;
  state.morphUntil = 0;
  state.borderColor = '#222';

  state.teleportMarkId = null;
  state.teleportPair = null;

  // 3) recalcular velocidad base por si cambió el tamaño del canvas/config
  onResize(state, ctx);

  // 4) respawnear pelotas desde cero (nivel 5 garantizado)
  spawnBalls(state, state.config.ballCount);

  // 5) HUD inmediato (evita ver niveles viejos)
  state.setTimeText?.('0.00');
  state.renderScoreboard?.();

  state.log('Juego reiniciado');
}


export function updateGame(state, dt, now){
  if(!state.started || state.paused) return;

  // tiempo HUD
  state.setTimeText?.(((now)/1000).toFixed(2));

  // timers
  tickFrenzy(state, now, state.log);
  tickObstacle(state, now, state.log);
  tickTeleport(state, now, state.log);

  // spawner
  spawnTick(state, now, state.log);

  // física y colisiones
  moveAndBounce(state, dt, now, state.log);
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

  // gana por tamaño 100% o último vivo
  if(state.checkWin?.()) return;
}
