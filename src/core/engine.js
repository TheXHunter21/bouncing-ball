// Motor de juego con requestAnimationFrame
export class Engine {
  constructor({ update, draw }) {
    this.update = update;
    this.draw = draw;
    this._running = false;
    this._prev = 0;
    this._raf = 0;
  }
  start() {
    if (this._running) return;
    this._running = true;
    this._prev = performance.now();
    const loop = (now) => {
      if (!this._running) return;
      let dt = (now - this._prev) / 1000;
      if (dt > 0.05) dt = 0.05; // cap para evitar saltos
      this._prev = now;
      try { this.update(dt); } catch (e) { console.error('[Engine.update]', e); this.stop(); return; }
      try { this.draw(); } catch (e) { console.error('[Engine.draw]', e); this.stop(); return; }
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }
  stop() {
    this._running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
  }
  get running() { return this._running; }
}
