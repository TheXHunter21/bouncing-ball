// /src/game/systems/spawn.js
import { randAngle } from '../../constants.js';
import { PILL_TYPES, pillColor } from '../pillsRegistry.js';

// Programa el próximo spawn
export function scheduleNextSpawn(gs, now, delayMs){
  if(typeof delayMs==='number'){ gs.nextSpawnAt = now + delayMs; return; }

  // 0% ⇒ spawns deshabilitados hasta que subas el slider
  if ((gs.config.spawnRatePct|0) <= 0) {
    gs.nextSpawnAt = Number.POSITIVE_INFINITY;
    return;
  }

  // 100% = base; 200% = la mitad del tiempo; 525% = ~1/5.25 del tiempo
  const factor = 100 / gs.config.spawnRatePct;
  const base = 1500 + Math.random()*2500;
  gs.nextSpawnAt = now + base*factor;
}

// Elige tipo por pesos dinámicos (usa PILL_TYPES + config.weights)
function pickWeightedType(gs){
  const entries = Object.keys(gs.config.weights || {})
    .filter(k => (gs.config.weights[k]|0) > 0 && PILL_TYPES[k]); // solo tipos válidos y con peso>0
  if(entries.length === 0) return null;

  let total = 0;
  for(const k of entries) total += (gs.config.weights[k]|0);
  let r = Math.random() * total;
  for(const k of entries){
    r -= (gs.config.weights[k]|0);
    if(r <= 0) return k;
  }
  return entries[entries.length-1];
}

function randomPosInside(gs, triesMax=60){
  const R = gs.R - 20;
  for(let i=0; i<triesMax; i++){
    const a = randAngle();
    const rr = Math.random()*R;
    const x = Math.cos(a)*rr;
    const y = Math.sin(a)*rr;
    // Evitar spawnear dentro del obstáculo central (si está activo)
    if(gs.obstacle?.active){
      const d0 = Math.hypot(x-0, y-0);
      if(d0 < gs.obstacle.r + 18) continue;
    }
    // Evitar solaparse demasiado con pelotas
    let ok = true;
    for(const b of gs.balls){
      if(!b.alive) continue;
      const d = Math.hypot(b.pos.x-x, b.pos.y-y);
      if(d < b.r + gs.PILL_RADIUS + 10){ ok = false; break; }
    }
    if(ok) return {x,y};
  }
  // fallback al centro si no encuentra (el render lo hará obvio)
  return {x:0,y:0};
}

export function spawnTick(gs, now, log){
  // 0% ⇒ no spawnear nada
  if ((gs.config.spawnRatePct|0) <= 0) return;

  if(gs.nextSpawnAt==null) gs.nextSpawnAt = now + 700;
  if(now < gs.nextSpawnAt) return;

  if(gs.pills.length >= gs.config.maxPills){
    scheduleNextSpawn(gs, now, 800);
    return;
  }

  const type = pickWeightedType(gs);
  if(!type){
    // no hay tipos con peso>0 o no están en el registro
    scheduleNextSpawn(gs, now, 1200);
    log?.('Spawn: sin tipos válidos (revisa pesos en CONFIG)');
    return;
  }

  const pos = randomPosInside(gs);
  const pill = {
    type,
    name: PILL_TYPES[type]?.label || type,
    x: pos.x, y: pos.y,
    color: pillColor(type)
  };
  gs.pills.push(pill);

  log?.(`Spawn píldora: ${pill.name} @ (${pill.x.toFixed(0)}, ${pill.y.toFixed(0)})`);
  scheduleNextSpawn(gs, now);
}
