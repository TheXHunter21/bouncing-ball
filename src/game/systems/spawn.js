import { PILL_TYPES } from '../pillsRegistry.js';
import { randAngle } from '../../constants.js';

export function scheduleNextSpawn(gs, now, delayMs){
  // si se pasa un delay específico, úsalo
  if(typeof delayMs==='number'){ gs.nextSpawnAt = now + delayMs; return; }

  // 0% ⇒ spawns deshabilitados
  if ((gs.config.spawnRatePct|0) <= 0) {
    gs.nextSpawnAt = Number.POSITIVE_INFINITY; // nunca llega
    return;
  }

  // factor normal (100% = base, 200% = la mitad, etc.)
  const factor = 100 / gs.config.spawnRatePct;
  const base = 1500 + Math.random()*2500;
  gs.nextSpawnAt = now + base*factor;
}

export function spawnTick(gs, now, log){
  // 0% ⇒ no spawnear nada
  if ((gs.config.spawnRatePct|0) <= 0) return;

  if(gs.nextSpawnAt==null) gs.nextSpawnAt = now + 700;
  if(now < gs.nextSpawnAt) return;

  if(gs.pills.length >= gs.config.maxPills){ scheduleNextSpawn(gs, now, 800); return; }

  const entries = Object.entries(gs.config.weights).filter(([k,w])=>PILL_TYPES[k] && w>0);
  if(!entries.length){ scheduleNextSpawn(gs, now, 1200); return; }

  const total = entries.reduce((s,[,w])=>s+w,0);
  let r = Math.random()*total; let pick = entries[0][0];
  for(const [k,w] of entries){ r -= w; if(r<=0){ pick = k; break; } }

  let finalType = pick, storeOriginal=null;
  if(gs.morphType){ storeOriginal = pick; finalType = gs.morphType; }

  const R = gs.R, PR=gs.PILL_RADIUS;
  const maxR = R - PR - 4; let x=0, y=0;
  for(let tries=0; tries<30; tries++){
    const a = randAngle(), rr = Math.sqrt(Math.random())*maxR;
    x = Math.cos(a)*rr; y = Math.sin(a)*rr;
    if(gs.obstacle.active && Math.hypot(x,y) < gs.obstacle.r + PR + 8) continue;
    let ok=true; for(const b of gs.balls){ if(!b.alive) continue; if(Math.hypot(x-b.pos.x,y-b.pos.y) <= b.r+PR+12){ ok=false;break; } }
    if(ok) break;
  }

  const pill = { x, y, type: finalType, name: PILL_TYPES[finalType].label };
  if(storeOriginal) pill.originalType = storeOriginal;
  gs.pills.push(pill);
  log?.(`Spawn píldora ${pill.name} en (${x|0},${y|0})`);

  scheduleNextSpawn(gs, now);
}
