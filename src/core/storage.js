const KEY = 'bb_config_v1';

export function loadConfig(){
  try{ const raw=localStorage.getItem(KEY); return raw? JSON.parse(raw): null; }catch{ return null; }
}
export function saveConfig(cfg){
  try{ localStorage.setItem(KEY, JSON.stringify(cfg)); }catch{}
}
export function resetConfig(){ try{ localStorage.removeItem(KEY); }catch{} }
