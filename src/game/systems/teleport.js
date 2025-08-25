export function startTeleportOrMark(ball, gs, now, log){
  if(gs.teleportPair){ log?.(`${ball.id}: piel ignorada (par en curso)`); return; }
  if(!gs.teleportMarkId){
    gs.teleportMarkId = ball.id; ball.teleportMarked = true; log?.(`${ball.id}: marcado para teletransporte`); gs.renderScoreboard?.(); return;
  }
  if(gs.teleportMarkId === ball.id){ log?.(`${ball.id}: ya estaba marcado, espera otro`); return; }
  const first = gs.getBall(gs.teleportMarkId);
  if(!first?.alive){ gs.teleportMarkId = ball.id; ball.teleportMarked=true; log?.(`${ball.id}: marcado (previo inválido)`); gs.renderScoreboard?.(); return; }
  // iniciar par
  gs.teleportPair = { aId:first.id, bId:ball.id, swapAt:now+1600, nextBlinkAt:now+400, blinkOn:false };
  first.teleportMarked=true; ball.teleportMarked=true;
  gs.teleportMarkId = null;
  log?.(`${first.id} ↔ ${ball.id}: teletransporte en 1.6s (4 parpadeos)`);
}
export function tickTeleport(gs, now, log){
  const pair = gs.teleportPair; if(!pair) return;
  const A = gs.getBall(pair.aId), B = gs.getBall(pair.bId);
  if(!A?.alive || !B?.alive){ if(A) A.teleportMarked=false; if(B) B.teleportMarked=false; gs.teleportPair=null; log?.('Teletransporte cancelado'); return; }
  if(now >= pair.swapAt){
    const ax=A.pos.x, ay=A.pos.y; A.pos.x=B.pos.x; A.pos.y=B.pos.y; B.pos.x=ax; B.pos.y=ay;
    A.teleportMarked=false; B.teleportMarked=false; gs.teleportPair=null; log?.(`${A.id} ⇄ ${B.id} teletransportados`); return;
  }
  if(now >= pair.nextBlinkAt){ pair.blinkOn=!pair.blinkOn; pair.nextBlinkAt+=400; }
}
