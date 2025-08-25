export function pctForLevel(level){
  if (level <= 0) return 0;
  if (level <= 10) return 25;
  if (level <= 15) return 20;
  if (level <= 20) return 15;
  if (level <= 25) return 10;
  return 5;
}

export function grow(ball, log, Rmax){
  const prev = ball.level; ball.level++;
  const pct = pctForLevel(ball.level);
  ball.r = Math.min(Rmax, ball.r * (1 + pct/100));
  log?.(`${ball.id}: nivel ${prev}→${ball.level} (+${pct}%)`);
}

export function shrink(ball, log){
  const prev = ball.level; const pct = pctForLevel(ball.level);
  ball.r = Math.max(2, ball.r / (1 + pct/100)); ball.level--;
  log?.(`${ball.id}: nivel ${prev}→${ball.level} (−${pct}%)`);
  if (ball.level <= 0) { ball.alive = false; log?.(`${ball.id} ha muerto (nivel 0).`); }
}

/**
 * Calcula el radio correspondiente a un nivel objetivo,
 * partiendo de un radio “baseline” en un nivel baseline (por defecto: r en nivel 5).
 */
export function radiusForLevel(targetLevel, baselineRadius, baselineLevel = 5){
  targetLevel = Math.max(1, Math.floor(targetLevel));
  let r = baselineRadius;
  if (targetLevel === baselineLevel) return r;

  if (targetLevel > baselineLevel){
    for(let L = baselineLevel + 1; L <= targetLevel; L++){
      const pct = pctForLevel(L);
      r = r * (1 + pct/100);
    }
  } else {
    for(let L = baselineLevel; L > targetLevel; L--){
      const pct = pctForLevel(L);
      r = Math.max(2, r / (1 + pct/100));
    }
  }
  return r;
}
