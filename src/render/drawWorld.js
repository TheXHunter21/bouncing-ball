import { TAU } from '../constants.js';
import { pillColor } from '../game/pillsRegistry.js';

export function drawWorld(ctx, state, now){
  const css = ctx._cssSize;
  ctx.clearRect(-css/2, -css/2, css, css);

  // obstáculo
  if(state.obstacle.active){
    ctx.fillStyle='#444'; ctx.beginPath(); ctx.arc(0,0,state.obstacle.r,0,TAU); ctx.fill();
  }

  // borde grande
  ctx.lineWidth=4; ctx.strokeStyle=state.borderColor||'#222';
  ctx.beginPath(); ctx.arc(0,0,state.R,0,TAU); ctx.stroke();

  // píldoras (rombos)
  const PR = state.PILL_RADIUS;
  for(const p of state.pills){
    ctx.fillStyle = pillColor(p.type);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y-PR);
    ctx.lineTo(p.x+PR, p.y);
    ctx.lineTo(p.x, p.y+PR);
    ctx.lineTo(p.x-PR, p.y);
    ctx.closePath(); ctx.fill();
    if(p.type==='whiteGhost'){ ctx.strokeStyle='#bbb'; ctx.lineWidth=2; ctx.stroke(); }
    // brillo
    ctx.fillStyle='#fff8'; ctx.beginPath();
    ctx.moveTo(p.x, p.y-PR/1.6);
    ctx.lineTo(p.x+PR/1.6, p.y);
    ctx.lineTo(p.x, p.y-PR/2.2);
    ctx.closePath(); ctx.fill();
  }

  // pelotas
  for(const b of state.balls){
    if(!b.alive) continue;

    // parpadeo teleport
    let fading=false;
    if(state.teleportPair && (b.id===state.teleportPair.aId || b.id===state.teleportPair.bId) && !state.teleportPair.blinkOn){
      fading=true; ctx.save(); ctx.globalAlpha=0.25;
    }

    ctx.fillStyle=b.color; ctx.beginPath(); ctx.arc(b.pos.x,b.pos.y,b.r,0,TAU); ctx.fill();

    // aros estados
    if(b.shield){ ctx.lineWidth=3; ctx.strokeStyle='#33CFFF'; ctx.beginPath(); ctx.arc(b.pos.x,b.pos.y,b.r+2,0,TAU); ctx.stroke(); }
    if(b.ghostUntil && now < b.ghostUntil){ ctx.lineWidth=2; ctx.setLineDash([6,4]); ctx.strokeStyle='#ffffffcc'; ctx.beginPath(); ctx.arc(b.pos.x,b.pos.y,b.r+5,0,TAU); ctx.stroke(); ctx.setLineDash([]); }
    if(b.edgeGrowUntil && now < b.edgeGrowUntil){ ctx.lineWidth=2; ctx.strokeStyle='#00D1B2'; ctx.beginPath(); ctx.arc(b.pos.x,b.pos.y,b.r+8,0,TAU); ctx.stroke(); }
    if(b.teleportMarked && !(state.teleportPair && (b.id===state.teleportPair.aId || b.id===state.teleportPair.bId))){
      ctx.lineWidth=3; ctx.strokeStyle='#f4c2a1'; ctx.beginPath(); ctx.arc(b.pos.x,b.pos.y,b.r+6,0,TAU); ctx.stroke();
    }

    if(fading) ctx.restore();
  }

  if(!state.started){
    ctx.fillStyle='#9aa4b2'; ctx.font='14px system-ui,Segoe UI,Roboto,sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('Abre CONFIG (C) y pulsa INICIAR (Enter)', 0, 0);
  }
  if(state.paused && state.started){ ctx.fillStyle='#adb5bd'; ctx.font='14px system-ui'; ctx.fillText('PAUSADO (P o Espacio)',0,0); }
}
