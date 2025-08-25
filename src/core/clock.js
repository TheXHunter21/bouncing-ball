// Reloj "de juego" (pausa no avanza el tiempo)
export class Clock {
  constructor() {
    this._start = performance.now();
    this._pausedAccum = 0;
    this._pauseAt = 0;
    this._isPaused = false;
  }
  pause() {
    if (this._isPaused) return;
    this._isPaused = true;
    this._pauseAt = performance.now();
  }
  resume() {
    if (!this._isPaused) return;
    this._isPaused = false;
    this._pausedAccum += performance.now() - this._pauseAt;
  }
  now() {
    return performance.now() - this._pausedAccum;
  }
  get paused() { return this._isPaused; }
}
