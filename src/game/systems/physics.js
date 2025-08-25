import { randAngle } from '../../constants.js';
import { grow } from '../growth.js';
import { effectiveSpeed } from './status.js';

export function moveAndBounce(gs, dt, now, log){
  const R = gs.R;

  for(const b of gs.balls){
    if(!b.alive) continue;

    // aplicar velocidad efectiva al vector vel manteniendo dirección
    const target = effectiveSpeed(gs.defaultSpeed, b, now);
    const mag = Math.hypot(b.vel.x,b.vel.y);
    if(mag>0){ b.vel.x = (b.vel.x/mag)*target; b.vel.y = (b.vel.y/mag)*target; }

    // mover
    b.pos.x += b.vel.x * dt;
    b.pos.y += b.vel.y * dt;

    // obstáculo central
    if(gs.obstacle.active){
      const dist0 = Math.hypot(b.pos.x, b.pos.y);
      const nx0 = dist0===0?1:b.pos.x/dist0, ny0 = dist0===0?0:b.pos.y/dist0;
      const limit0 = gs.obstacle.r + b.r;
      const touching0 = dist0 <= limit0 + 0.001;
      const movingIn0 = (b.vel.x*nx0 + b.vel.y*ny0) < 0;
      if(touching0 && movingIn0){
        b.pos.x = nx0 * limit0; b.pos.y = ny0 * limit0;
        let vx, vy; do{ const a=randAngle(); vx=Math.cos(a)*target; vy=Math.sin(a)*target; }while((vx*nx0 + vy*ny0) <= 0);
        b.vel.x=vx; b.vel.y=vy;
        if(b.edgeGrowUntil && now < b.edgeGrowUntil){ grow(b, log, gs.R); if(gs.checkWin?.()) return; }
        const inset = Math.max(1, target*dt);
        b.pos.x = nx0 * (limit0 + inset); b.pos.y = ny0 * (limit0 + inset);
      }
    }

    // borde exterior
    const dist = Math.hypot(b.pos.x,b.pos.y);
    const nx = dist===0?1:b.pos.x/dist, ny = dist===0?0:b.pos.y/dist;
    const limit = R - b.r, touching = dist >= (limit - 0.001);
    const movingOut = (b.vel.x*nx + b.vel.y*ny) > 0;

    if(touching && movingOut){
      b.pos.x = nx*limit; b.pos.y = ny*limit;
      if(b.edgeGrowUntil && now < b.edgeGrowUntil){ grow(b, log, gs.R); if(gs.checkWin?.()) return; }
      let vx, vy; do{ const a=randAngle(); vx=Math.cos(a)*target; vy=Math.sin(a)*target; }while((vx*nx + vy*ny) >= 0);
      b.vel.x=vx; b.vel.y=vy;
      const newLimit = R - b.r, inset=Math.max(1,target*dt);
      b.pos.x = nx * Math.max(0, newLimit - inset);
      b.pos.y = ny * Math.max(0, newLimit - inset);
    }
  }
}
