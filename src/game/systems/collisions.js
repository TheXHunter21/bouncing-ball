import { isGhost, tryShrink } from './status.js';

export function collideBalls(gs, now, log){
  const arr = gs.balls;
  for(let i=0;i<arr.length;i++){
    const A = arr[i]; if(!A.alive) continue;
    for(let j=i+1;j<arr.length;j++){
      const B = arr[j]; if(!B.alive) continue;
      if(now<A.noCollideUntil || now<B.noCollideUntil) continue;
      if(isGhost(A,now) || isGhost(B,now)) continue;

      const dx=B.pos.x-A.pos.x, dy=B.pos.y-A.pos.y; const d=Math.hypot(dx,dy), minD=A.r+B.r;
      if(d>0 && d<=minD){
        const nx=dx/d, ny=dy/d, overlap=(minD-d)+0.5;
        A.pos.x-=nx*overlap/2; A.pos.y-=ny*overlap/2;
        B.pos.x+=nx*overlap/2; B.pos.y+=ny*overlap/2;
        const va=A.vel.x*nx + A.vel.y*ny, vb=B.vel.x*nx + B.vel.y*ny;
        A.vel.x-=2*va*nx; A.vel.y-=2*va*ny; B.vel.x-=2*vb*nx; B.vel.y-=2*vb*ny;

        tryShrink(A, `colisión con ${B.id}`, now, gs, log);
        tryShrink(B, `colisión con ${A.id}`, now, gs, log);
        if(gs.checkWin?.()) return;
      }
    }
  }
}
