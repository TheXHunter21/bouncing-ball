import { grow, pctForLevel } from './growth.js';
import { tryShrink, setSpeedEffect, setGhost, enableEdgeGrowth, giveShield, setDupNext, isGhost } from './systems/status.js';
import { startFrenzy } from './systems/frenzy.js';
import { spawnObstacle } from './systems/obstacle.js';
import { startTeleportOrMark } from './systems/teleport.js';

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

export function onConsumePill(p, ball, gs, now, log){
  const times = ball.dupNext ? 2 : 1;
  if(p.type!=='pinkDup') ball.dupNext = false;

  const getDur = (key) => gs.config.durations[key];

  if(p.type==='blue'){
    for(let i=0;i<times;i++) grow(ball, log, gs.R);
    gs.renderScoreboard?.(); return;
  }
  if(p.type==='red'){
    for(let i=0;i<times;i++) tryShrink(ball,'Píldora roja',now,gs,log);
    gs.renderScoreboard?.(); return;
  }
  if(p.type==='greenFast'){
    setSpeedEffect(ball,'boost', getDur('boost')*times, now, log); return;
  }
  if(p.type==='greenSlow'){
    setSpeedEffect(ball,'slow', getDur('slow')*times, now, log); return;
  }
  if(p.type==='cyanShield'){
    if(ball.shield){ log?.(`${ball.id}: ya tenía escudo (no acumulable).`); if(times>1) log?.(`${ball.id}: duplicador no acumula escudos.`); }
    else giveShield(ball, log);
    return;
  }
  if(p.type==='whiteGhost'){
    setGhost(ball, getDur('ghost')*times, now, log); gs.renderScoreboard?.(); return;
  }
  if(p.type==='turquoiseEdge'){
    enableEdgeGrowth(ball, getDur('edge')*times, now, log); gs.renderScoreboard?.(); return;
  }
  if(p.type==='yellowMorph'){
    startFrenzy(gs, getDur('morph')*times, now, log); return;
  }
  if(p.type==='pinkDup'){
    setDupNext(ball, log); gs.renderScoreboard?.(); return;
  }
  if(p.type==='grayObstacle'){
    spawnObstacle(gs, getDur('obstacle')*times, now, log); return;
  }
  if(p.type==='fuchsiaHalf'){
    const sizeMid = Math.floor(ball.level/2);
    let affected=0;
    for(const other of gs.balls){
      if(!other.alive || other===ball) continue;
      if(other.level > sizeMid){
        if(other.shield){ other.shield=false; log?.(`${other.id}: ESCUDO bloqueó fucsia (objetivo ${sizeMid})`); }
        else { forceDownTo(other, sizeMid, now, log, { breakShieldBlocks:true, ignoreGhost:true }); affected++; }
      }
    }
    if(times>1 && ball.level > sizeMid){
      if(ball.shield){ ball.shield=false; log?.(`${ball.id}: ESCUDO roto por fucsia (propio)`); }
      forceDownTo(ball, sizeMid, now, log, { breakShieldBlocks:false, ignoreGhost:true });
      log?.(`${ball.id} tenía duplicador: también baja a ${sizeMid}.`);
    }else if(times>1){ log?.(`${ball.id} tenía duplicador pero ya estaba ≤ ${sizeMid}.`); }
    log?.(`${ball.id} activó FUCSIA → tamañoMedio ${sizeMid}. Afectadas: ${affected}.`);
    if(gs.checkWin?.()) return;
    return;
  }
  if(p.type==='skinTeleport'){
    startTeleportOrMark(ball, gs, now, log); return;
  }
}
