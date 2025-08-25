export const LEVEL_START = 5;
export const BALL_INIT_RADIUS = 25;
export const PILL_RADIUS = 16;
export const BORDER_THICKNESS = 4;
export const INNER_PADDING = 10;

export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const randAngle = () => Math.random() * TAU;
export const randRange = (a, b) => a + Math.random() * (b - a);
