export function spawnObstacle(gs, sec, now, log){
  const r = gs.R * 0.15;
  const ob = gs.obstacle;
  ob.active = true; ob.r = r; ob.until = now + sec*1000;
  log?.(`Obstáculo GRIS activado (${sec}s), r=${r.toFixed(1)}`);
}
export function tickObstacle(gs, now, log){
  const ob = gs.obstacle; if(!ob.active) return;
  if(now >= ob.until){ ob.active=false; log?.('Obstáculo GRIS desapareció'); return; }
  // destruir si no queda espacio
  const thick = gs.R - ob.r;
  for(const b of gs.balls){ if(!b.alive) continue; if(2*b.r >= thick - 1){ ob.active=false; log?.('Obstáculo GRIS destruido por falta de espacio'); break; } }
}
