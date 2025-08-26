import { grow, pctForLevel } from './growth.js';
import { tryShrink, setSpeedEffect, setGhost, enableEdgeGrowth, giveShield, setDupNext, isGhost, setSteroids } from './systems/status.js';
import { startFrenzy } from './systems/frenzy.js';
import { spawnObstacle } from './systems/obstacle.js';
import { startTeleportOrMark } from './systems/teleport.js';
import { radiusForLevel } from './growth.js';
import { BALL_INIT_RADIUS } from '../constants.js';


const isInitialImmune = (ball, now) => now < (ball.noCollideUntil || 0);

export const PILL_TYPES = {
  blue:         { label:'Azul (+nivel)' },
  red:          { label:'Roja (−nivel)' },
  greenFast:    { label:'Verde claro (2×)' },
  greenSlow:    { label:'Verde oscuro (0.5×)' },
  cyanShield:   { label:'Celeste (escudo)' },
  whiteGhost:   { label:'Blanca (fantasma)' },
  turquoiseEdge:{ label:'Turquesa (bordes +)' },
  yellowMorph:  { label:'Amarilla (frenesí)' },
  pinkDup:      { label:'Rosa (duplicador)' },
  grayObstacle: { label:'Gris (obstáculo)' },
  fuchsiaHalf:  { label:'Fucsia (mitad global)' },
  skinTeleport: { label:'Piel (teletransporte)' },
  navySteroids: { label:'Azul oscuro (esteroides)' },

};

export function pillColor(type){
  return type==='blue'?'#1877F2' :
         type==='red'?'#E53935' :
         type==='greenFast'?'#7CFC00' :
         type==='greenSlow'?'#2E7D32' :
         type==='cyanShield'?'#33CFFF' :
         type==='yellowMorph'?'#FFD400' :
         type==='whiteGhost'?'#FFFFFF' :
         type==='turquoiseEdge'?'#00D1B2' :
         type==='pinkDup'?'#FF69B4' :
         type==='grayObstacle'?'#666' :
         type==='fuchsiaHalf'?'#a4195b' :
         type==='skinTeleport'?'#f4c2a1' :
         type==='navySteroids'?'#091f5dff' : // azul oscuro
         '#888';
         
}

// FUCSIA helper
function forceDownTo(ball, targetLevel, now, log, { breakShieldBlocks=true, ignoreGhost=true }={}){
  while(ball.alive && ball.level > targetLevel){
    if(ball.shield){ ball.shield=false; log?.(`${ball.id}: ESCUDO roto por fucsia`); if(breakShieldBlocks) return; }
    if(!ignoreGhost && isGhost(ball, now)){ log?.(`${ball.id}: fantasma ignora fucsia`); return; }
    const pct = pctForLevel(ball.level);
    ball.r = Math.max(2, ball.r/(1+pct/100)); ball.level--;
    log?.(`${ball.id} Fucsia: nivel ↓ (${pct}%) → ${ball.level}`);
    if(ball.level<=0){ ball.alive=false; log?.(`${ball.id} ha muerto (nivel 0).`); return; }
  }
}

function halveOnce(target, gs, now, log){
  if(!target.alive) return;
  const prev = target.level|0;
  const newLevel = Math.floor(prev/2);
  if(newLevel <= 0){
    target.level = 0;
    target.alive = false;
    log?.(`${target.id}: FUCSIA → nivel ${prev}→0 (muere)`);
    return;
  }
  target.level = newLevel;
  // radio canónico para ese nivel (consistente con la curva de crecimiento)
  target.r = radiusForLevel(newLevel, BALL_INIT_RADIUS, 5);
  log?.(`${target.id}: FUCSIA → nivel ${prev}→${newLevel}`);
}


export function onConsumePill(p, ball, gs, now, log){
  const times = ball.dupNext ? 2 : 1;
  if(p.type!=='pinkDup') ball.dupNext = false;

  const getDur = (key) => gs.config.durations[key];

  if(p.type==='blue'){
    for(let i=0;i<times;i++) grow(ball, log, gs.R);
    gs.renderScoreboard?.(); return;
  }
    if(p.type==='navySteroids'){
  const sec = gs.config.durations.steroids || 5;
  const dur = sec * times; // duplicador rosa duplica duración
  setSteroids(ball, dur, now, log); 
  return;
}
  if (p.type === "red") {
    if (isInitialImmune(ball, now)) {
      log?.(`${ball.id}: invulnerable → Roja sin efecto`);
      return; // se consume la píldora, pero no aplica efecto
    }
    for (let i = 0; i < times; i++)
      tryShrink(ball, "Píldora roja", now, gs, log);
    gs.renderScoreboard?.();
    return;
  }
  if (p.type === "greenFast") {
    setSpeedEffect(ball, "boost", getDur("boost") * times, now, log);
    return;
  }
  if (p.type === "greenSlow") {
    if (isInitialImmune(ball, now)) {
      log?.(`${ball.id}: invulnerable → Verde oscuro (0.5×) sin efecto`);
      return;
    }
    setSpeedEffect(ball, "slow", getDur("slow") * times, now, log);
    return;
  }
  if(p.type==='cyanShield'){
    if(ball.shield){ log?.(`${ball.id}: ya tenía escudo (no acumulable).`); if(times>1) log?.(`${ball.id}: duplicador no acumula escudos.`); }
    else giveShield(ball, log);
    return;
  }
  if (p.type === "whiteGhost") {
    setGhost(ball, getDur("ghost") * times, now, log);
    gs.renderScoreboard?.();
    return;
  }
  if (p.type === "turquoiseEdge") {
    if (isInitialImmune(ball, now)) {
      log?.(`${ball.id}: invulnerable → Turquesa (bordes +) sin efecto`);
      return;
    }
    enableEdgeGrowth(ball, getDur("edge") * times, now, log);
    gs.renderScoreboard?.();
    return;
  }
  if (p.type === "yellowMorph") {
    startFrenzy(gs, getDur("morph") * times, now, log);
    return;
  }
  if(p.type==='pinkDup'){
    setDupNext(ball, log); gs.renderScoreboard?.(); return;
  }
  if(p.type==='grayObstacle'){
    spawnObstacle(gs, getDur('obstacle')*times, now, log); return;
  }



if(p.type==='fuchsiaHalf'){
  // “Duplicador” (rosa) duplica el efecto: se aplica 2 veces seguidas.
  const times = ball.dupNext ? 2 : 1;
  ball.dupNext = false;

  const FLASH_MS = 250;
  let affected = 0, skippedImmune = 0, blockedShield = 0;

  // Parpadeo fucsia: todos “avisan” visualmente el evento (incluido el que la tomó)
  for(const b of gs.balls){
    if(!b.alive) continue;
    b._flashColor = pillColor('fuchsiaHalf');
    b._flashUntil = now + FLASH_MS;
  }

  // Aplicar efecto: cada pelota se reduce a su MITAD (nivel y tamaño)
  for(const target of gs.balls){
    if(!target.alive) continue;

    // Invulnerabilidad inicial: ignora el efecto (pero ya parpadeó)
    if(isInitialImmune(target, now)){ skippedImmune++; continue; }

    // Escudo: bloquea el efecto y se rompe
    if(target.shield){
      target.shield = false;
      blockedShield++;
      continue;
    }

    for(let i=0;i<times;i++){
      if(!target.alive) break;
      // mitad una vez (si queda en 0 → muere)
      halveOnce(target, gs, now, log);
    }
    affected++;
  }

  log?.(`${ball.id} activó FUCSIA (mitad global) — x${times}. Afectadas: ${affected}, Escudo bloqueó: ${blockedShield}, Invulnerables: ${skippedImmune}.`);
  gs.renderScoreboard?.();
  if(gs.checkWin?.()) return;
  return;
}



  if(p.type==='skinTeleport'){
    startTeleportOrMark(ball, gs, now, log); return;
  }
}
