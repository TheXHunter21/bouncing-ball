import { shrink } from '../growth.js';

export function giveShield(ball, log){ if(ball.shield){ log?.(`${ball.id}: ya tenía escudo`); return; } ball.shield=true; log?.(`${ball.id}: ESCUDO`); }
export function isGhost(ball, now){ return !!(ball.ghostUntil && now < ball.ghostUntil); }
export function setGhost(ball, sec, now, log){ ball.ghostUntil = now + sec*1000; log?.(`${ball.id}: FANTASMA (${sec}s)`); }
export function enableEdgeGrowth(ball, sec, now, log){ ball.edgeGrowUntil = now + sec*1000; log?.(`${ball.id}: Bordes ⇒ CRECEN (${sec}s)`); }

export function setDupNext(ball, log){ if(ball.dupNext){ log?.(`${ball.id}: duplicador ya activo`); return; } ball.dupNext=true; log?.(`${ball.id}: DUPLICADOR listo`); }

export function setSpeedEffect(ball, type, sec, now, log){
  ball.speedEffect = type; ball.speedEffectUntil = now + sec*1000;
  log?.(`${ball.id}: Velocidad → ${type==='boost'?'2×':'0.5×'} (${sec}s)`);
}

export function effectiveSpeed(base, ball, now){
  if(ball.speedEffect!=='none' && now >= ball.speedEffectUntil){ const prev=ball.speedEffect; ball.speedEffect='none'; }
  if(ball.speedEffect==='boost') return base*2;
  if(ball.speedEffect==='slow')  return base*0.5;
  return base;
}

export function tryShrink(ball, source, now, gs, log){
  if (ball.shield){ ball.shield=false; log?.(`${ball.id}: ESCUDO bloqueó ${source}`); gs.renderScoreboard?.(); return; }
  if (isGhost(ball, now)){ log?.(`${ball.id}: fantasma ignora ${source}`); return; }
  shrink(ball, log);
  gs.renderScoreboard?.();
}
