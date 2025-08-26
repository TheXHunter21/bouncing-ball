export function renderScoreboard(state){
  const el = document.getElementById('scoreboard'); if(!el) return;
  const now = state.started ? state.gameNow : 0; // << tiempo de juego
  el.innerHTML = state.balls.filter(b=>b.alive).map(b=>{
    const shield = b.shield ? ` <span style="color:#33cfff">🛡</span>` : '';
    const ghost  = (b.ghostUntil && now < b.ghostUntil) ? ` <span style="color:#fff">👻</span>` : '';
    const edge   = (b.edgeGrowUntil && now < b.edgeGrowUntil) ? ` <span style="color:#00D1B2">✨</span>` : '';
    const dup    = b.dupNext ? ` <span style="color:#FF69B4">×2</span>` : '';
    const tp     = b.teleportMarked ? ` <span style="color:#f4c2a1">⇄</span>` : '';
    const roids = (b.steroidsUntil && now < b.steroidsUntil) ? ` <span style="color:#1e40af">💪</span>` : '';
return `<span class="badge" style="border:1px solid ${b.color}; color:${b.color}">${b.id}: Nivel ${b.level}${shield}${ghost}${edge}${dup}${tp}${roids}</span>`;
  }).join('');
}
