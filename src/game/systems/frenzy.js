import { pillColor, PILL_TYPES } from '../pillsRegistry.js';

export function startFrenzy(gs, sec, now, log){
  // elige un tipo al azar de las entradas configuradas (con peso>0)
  const enabled = Object.entries(gs.config.weights).filter(([k,w]) => PILL_TYPES[k] && w>0).map(([k])=>k);
  if(!enabled.length){ log?.(`Frenesí: no hay tipos habilitados`); return; }
  const pick = enabled[Math.floor(Math.random()*enabled.length)];
  gs.morphType = pick; gs.morphUntil = now + sec*1000;
  // actualiza las píldoras ya presentes
  for(const p of gs.pills){ if(p.originalType==null) p.originalType=p.type; p.type=pick; p.name=PILL_TYPES[pick].label; }
  gs.borderColor = pillColor(pick);
  log?.(`AMARILLA: todas las píldoras → ${PILL_TYPES[pick].label} (${sec}s)`);
}
export function tickFrenzy(gs, now, log){
  if(gs.morphType && now >= gs.morphUntil){
    for(const p of gs.pills){ if(p.originalType){ p.type=p.originalType; p.name=PILL_TYPES[p.originalType].label; delete p.originalType; } }
    gs.morphType=null; gs.borderColor='#222';
    log?.('Fin efecto AMARILLO');
  }
}
