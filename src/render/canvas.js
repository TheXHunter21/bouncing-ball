export function setupCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  function resize(){
    const dpr=Math.max(1,window.devicePixelRatio||1);
    const css=Math.min(window.innerWidth*0.96,900);
    canvas.width=Math.floor(css*dpr); canvas.height=Math.floor(css*dpr);
    ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr,dpr); ctx.translate(css/2, css/2);
    ctx._cssSize=css;
  }
  window.addEventListener('resize', resize);
  resize(); return ctx;
}
