// ===== save.js : progresso salvo (moedas, carros, melhorias, recordes) e configurações persistentes =====
// Carregar DEPOIS de game.js/finish.js. Expõe window.SV e window.TOAST.
(function(){
'use strict';
const KEY='or_save_v1';
const D={coins:500,own:[0,2],sel:0,up:{},best:{},drift:0,races:0,wins:0,set:{},keys:null};
let S={};try{S=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){S={}}
S=Object.assign({},D,S);S.own=Array.isArray(S.own)&&S.own.length?S.own:[0,2];S.up=S.up||{};S.best=S.best||{};S.set=S.set||{};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const SV=window.SV={d:S,save,
owned:i=>S.own.indexOf(i)>=0,
lvl:(c,k)=>((S.up[c]||{})[k])|0,
add(n){S.coins=Math.max(0,S.coins+n);save();SV.upd()},
upd(){document.querySelectorAll('.mcoin').forEach(e=>e.textContent='🪙 '+S.coins)}};
// ---------- configurações persistentes ----------
const KEYS=['car','col','hc','su','hs','trk','vol','cam','auto','wx','diff','laps','q','mv','vib','tilt','aq','tinv'];
const DEFAULTS={mv:2,vib:1,tilt:0,aq:1,tinv:0};
for(const k in DEFAULTS)if(G[k]==null)G[k]=DEFAULTS[k];
// qualidade inicial conforme o aparelho (só na primeira vez)
if(S.set.q==null){const coarse=matchMedia('(pointer:coarse)').matches,mem=navigator.deviceMemory||8,cpu=navigator.hardwareConcurrency||8;
G.q=coarse?(mem<=3||cpu<=4?0:1):(cpu>=8&&mem>=8?2:1);S.set.q=G.q}
KEYS.forEach(k=>{const v=S.set[k];if(typeof v=='number'&&isFinite(v)&&v>=0)G[k]=v});
if(!(G.car>=0&&G.car<CARS.length)||!SV.owned(G.car))G.car=SV.owned(S.sel)?S.sel:0;
if(!(G.trk>=0&&G.trk<TRACKS.length))G.trk=0;if(G.laps>5||G.laps<2)G.laps=3;if(G.wx>4)G.wx=0;if(G.cam>2)G.cam=1;
const _pk=pick;pick=function(k,i){_pk(k,i);if(KEYS.indexOf(k)>=0){S.set[k]=G[k];save()}};
// ---------- avisos na tela ----------
const t=document.createElement('div');t.id='toast';
t.style.cssText='position:fixed;left:50%;top:19%;transform:translate(-50%,-14px);z-index:60;pointer-events:none;opacity:0;padding:10px 20px;border-radius:14px;font:900 clamp(16px,3.4vw,24px) system-ui;font-style:italic;letter-spacing:1px;color:#fff;background:linear-gradient(100deg,rgba(0,229,255,.85),rgba(124,77,255,.85));text-shadow:0 2px 6px rgba(0,0,0,.5);box-shadow:0 0 30px rgba(0,229,255,.45);transition:opacity .25s,transform .25s;white-space:nowrap;max-width:94vw;overflow:hidden;text-overflow:ellipsis';
document.body.appendChild(t);let tt=0;
window.TOAST=function(m,c){t.textContent=m;t.style.background=c||'';t.style.opacity=1;t.style.transform='translate(-50%,0)';clearTimeout(tt);tt=setTimeout(()=>{t.style.opacity=0;t.style.transform='translate(-50%,-14px)'},1900)};
// contador de moedas no menu
const m=document.getElementById('menu'),c=document.createElement('div');c.className='mcoin';m.appendChild(c);
const mo=new MutationObserver(()=>SV.upd());mo.observe(m,{attributes:true,attributeFilter:['class']});SV.upd();
buildMenu();rs();setWx();
})();
