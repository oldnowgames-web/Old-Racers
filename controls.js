// ===== controls.js : remapear teclas, inclinação do celular, vibração, qualidade gráfica automática e opções novas nas Configurações =====
// Carregar DEPOIS de save.js, items.js e vfx.js.
(function(){
'use strict';
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
// ---------- vibração ----------
window.VIB=ms=>{if(G.vib&&navigator.vibrate){try{navigator.vibrate(ms)}catch(e){}}};
// ---------- teclas configuráveis ----------
const ACT=[['up','Acelerar'],['down','Frear / ré'],['left','Esquerda'],['right','Direita'],['drift','Drift'],['nitro','Nitro'],['item','Usar item'],['gup','Marcha ↑'],['gdn','Marcha ↓'],['cam','Câmera'],['auto','Auto / manual'],['pause','Pausa']];
const DEF={up:['KeyW','ArrowUp'],down:['KeyS','ArrowDown'],left:['KeyA','ArrowLeft'],right:['KeyD','ArrowRight'],drift:['Space',''],nitro:['ShiftLeft','ShiftRight'],item:['KeyF','Enter'],gup:['KeyE',''],gdn:['KeyQ',''],cam:['KeyC',''],auto:['KeyT',''],pause:['KeyP','Escape']};
const CAN={up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',drift:'Space',nitro:'ShiftLeft'};
const copy=o=>JSON.parse(JSON.stringify(o));
let KB=copy(DEF);const sk=SV.d.keys;if(sk)for(const a in DEF)if(Array.isArray(sk[a])&&sk[a].length==2)KB[a]=sk[a].map(String);
const held={};Object.keys(CAN).forEach(a=>held[a]=new Set());
const actOf=c=>{if(!c)return null;for(const a in KB)if(KB[a].indexOf(c)>=0)return a;return null};
const isIn=e=>e.target&&(e.target.tagName=='INPUT'||e.target.tagName=='TEXTAREA');
let rb=null;
const NM={ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Space:'Espaço',ShiftLeft:'Shift esq.',ShiftRight:'Shift dir.',Enter:'Enter',Escape:'Esc',ControlLeft:'Ctrl esq.',ControlRight:'Ctrl dir.',Tab:'Tab',Backspace:'⌫'};
const lbl=c=>!c?'—':NM[c]||c.replace(/^Key/,'').replace(/^Digit/,'');
addEventListener('keydown',e=>{
if(rb){e.preventDefault();e.stopImmediatePropagation();if(e.code!='Escape'&&e.code){for(const a in KB)KB[a]=KB[a].map(c=>c==e.code?'':c);KB[rb.a][rb.i]=e.code;SV.d.keys=KB;SV.save()}rb=null;renderKeys();return}
if(isIn(e))return;aud();const a=actOf(e.code);
if(a||e.code=='Space'||e.code.indexOf('Arrow')==0)e.preventDefault();
e.stopImmediatePropagation();if(!a)return;
if(held[a]){held[a].add(e.code);K[CAN[a]]=1;return}
if(e.repeat)return;
if(a=='gup')gup();else if(a=='gdn')gdn();else if(a=='cam')G.cam=(G.cam+1)%3;else if(a=='auto')togAuto();else if(a=='pause')pause();else if(a=='item')window.useItem&&useItem()},true);
addEventListener('keyup',e=>{if(isIn(e))return;e.stopImmediatePropagation();for(const a in held){held[a].delete(e.code);K[CAN[a]]=held[a].size?1:0}},true);
addEventListener('blur',()=>{for(const a in held){held[a].clear();K[CAN[a]]=0}});
window.KEYS={rb(a,i){rb={a,i};renderKeys()},reset(){KB=copy(DEF);SV.d.keys=null;SV.save();renderKeys()}};
function renderKeys(){$('keysc').innerHTML='<h2 style="margin:0;text-align:center">Teclas</h2><div style="font-size:11px;opacity:.65;text-align:center">Clique numa tecla e pressione a nova. Esc cancela.</div>'+
ACT.map(([a,n])=>`<div class="row" style="justify-content:space-between"><b style="min-width:120px;text-align:left">${n}</b><span>`+[0,1].map(i=>{const on=rb&&rb.a==a&&rb.i==i;return`<button class="${on?'on':''}" style="min-width:92px" onclick="KEYS.rb('${a}',${i})">${on?'pressione…':lbl(KB[a][i])}</button>`}).join(' ')+'</span></div>').join('')+
'<div class=row><button onclick="KEYS.reset()">Restaurar padrão</button><button class="pri" onclick="scr(\'set\')">OK</button></div>'}
const _scr=scr;scr=function(id){_scr(id);if(id=='keys')renderKeys()};
// ---------- inclinação do celular (volante) ----------
const TL={on:0,v:0,th0:null,s:0};
function onMotion(e){const g=e.accelerationIncludingGravity;if(!g||g.x==null||g.y==null)return;
const ang=((screen.orientation&&screen.orientation.angle)||window.orientation||0)*Math.PI/180,ios=/iPhone|iPad|iPod/.test(navigator.userAgent)?-1:1,gx=g.x*ios,gy=g.y*ios,
sx=gx*Math.cos(ang)-gy*Math.sin(ang),sy=gx*Math.sin(ang)+gy*Math.cos(ang),th=Math.atan2(sx,sy);TL.on=1;
if(TL.th0==null||state!='race'||cd>0)TL.th0=th;
let d=th-TL.th0;d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(d)<.05)d=0;TL.s+=(cl(d/.55,-1,1)-TL.s)*.35;TL.v=TL.s*(G.tinv?-1:1)}
let lis=0;function listen(){if(lis)return;lis=1;addEventListener('devicemotion',onMotion)}
function reqTilt(){try{if(typeof DeviceMotionEvent!='undefined'&&DeviceMotionEvent.requestPermission){DeviceMotionEvent.requestPermission().then(r=>{if(r=='granted')listen();else TOAST('Permissão de movimento negada')}).catch(()=>{})}else listen()}catch(e){}}
if(G.tilt)listen();
const _pk=pick;pick=function(k,i){_pk(k,i);if(k=='tilt'&&i==1)reqTilt()};
const _inp=inp;inp=function(){const o=_inp();if(G.tilt&&TL.on)o.st=TL.v;return o};
// ---------- opções novas nas Configurações / seleção de clima ----------
const wxBtn=h=>h.replace(/(<button[^>]*onclick="pick\('wx',3\)"[^>]*>[^<]*<\/button>)/,`$1<button class="${G.wx==4?'on':''}" onclick="pick('wx',4)">🌅 Pôr do sol</button>`);
const _rset=renderSet;renderSet=function(){_rset();const el=$('setc'),coarse=matchMedia('(pointer:coarse)').matches;let h=el.innerHTML;
const ex=row('Música','mv',['Desligada','Baixa','Alta'])+row('Vibração','vib',['Não','Sim'])+row('Qualidade auto','aq',['Não','Sim'])+(coarse?row('Controle','tilt',['Joystick','Inclinação'])+row('Inclinação','tinv',['Normal','Invertida']):'');
h=h.replace(/<div class="?row"?>\s*<b>Câmera<\/b>/,m=>ex+m);h=wxBtn(h);
h=h.replace(/<div class="?row"?>\s*<button[^>]*fs\(\)/,m=>`<div class=row><button onclick="scr('keys')">⌨️ Teclas</button></div>`+m);el.innerHTML=h};
const _rsel=renderSel;renderSel=function(){_rsel();const el=$('selc');el.innerHTML=wxBtn(el.innerHTML)};
})();
