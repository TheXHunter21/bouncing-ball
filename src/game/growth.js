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
