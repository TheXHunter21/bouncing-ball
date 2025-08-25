export const bus = (() => {
  const map = new Map();
  return {
    on(type, fn){ (map.get(type) ?? map.set(type,[]).get(type)).push(fn); },
    emit(type, payload){ (map.get(type)||[]).forEach(fn => fn(payload)); },
    off(type, fn){ const arr=map.get(type)||[]; const i=arr.indexOf(fn); if(i>=0) arr.splice(i,1); }
  };
})();
