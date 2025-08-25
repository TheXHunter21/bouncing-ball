export function bindLog(state){
  const overlay = document.getElementById('logOverlay');
  const body = document.getElementById('logBody');
  const btnToggle = document.getElementById('toggleLog');
  const btnClose = document.getElementById('closeLog');
  const btnClear = document.getElementById('clearLog');

  const logs = [];
  function fmt(sec){ return sec.toFixed(2).padStart(5,'0'); }
  function render(){
    body.innerHTML = logs.map(l=>{
      const cls = l.level==='warn'?'log-warn':l.level==='err'?'log-err':'log-info';
      return `<div><span class="log-time">[${fmt(l.t)}]</span> <span class="${cls}">${l.msg}</span></div>`;
    }).join('');
    body.scrollTop = body.scrollHeight;
  }

  state.log = (msg, level='info')=>{
    // tiempo de juego (no corre en pausa y se escala por gameSpeed)
    const t = state.gameNow/1000;
    logs.push({t, msg, level}); if(logs.length>900) logs.shift();
    if(overlay.style.display==='block') render();
  };

  function toggle(){ const show = overlay.style.display!=='block'; overlay.style.display=show?'block':'none'; overlay.setAttribute('aria-hidden', show?'false':'true'); if(show) render(); }

  btnToggle?.addEventListener('click', toggle);
  btnClose?.addEventListener('click', toggle);
  btnClear?.addEventListener('click', ()=>{ logs.length=0; render(); });

  return { toggle };
}
