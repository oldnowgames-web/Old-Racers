// ===== touch.js : controles de toque: esquerda/direita à esquerda da tela, acelerador e freio à direita (no lugar do joystick) =====
// Carregar DEPOIS de controls.js.
(function(){
'use strict';
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const tc=$('tc'),T={l:0,r:0,g:0,k:0};
const css=document.createElement('style');css.textContent=`
#joy{display:none!important}
#tc .tb{display:flex;align-items:center;justify-content:center;border-radius:20px;font-weight:900;letter-spacing:1px;background:rgba(10,14,30,.55);border:2px solid rgba(255,255,255,.28);color:#fff;backdrop-filter:blur(4px);user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;transition:transform .06s,background .06s}
#tc .tb.on{transform:scale(.93);background:linear-gradient(135deg,rgba(0,229,255,.75),rgba(61,123,255,.75));color:#001018;border-color:#fff}
#bl,#br{bottom:16px;width:90px;height:100px;font-size:40px}
#bl{left:14px}#br{left:114px}
#bg{right:14px;bottom:16px;width:96px;height:118px;font-size:15px;flex-direction:column;gap:4px;background:linear-gradient(160deg,rgba(46,204,113,.55),rgba(20,120,70,.55));border-color:rgba(120,255,170,.7)!important}
#bk{right:120px;bottom:16px;width:80px;height:96px;font-size:13px;flex-direction:column;gap:4px;background:linear-gradient(160deg,rgba(230,57,70,.55),rgba(130,20,40,.55));border-color:rgba(255,130,140,.7)!important}
#bg.on{background:linear-gradient(160deg,#7dffb0,#2ecc71);color:#032}#bk.on{background:linear-gradient(160deg,#ff8f99,#e63946);color:#300}
#bn{right:14px;bottom:144px;width:60px;height:60px;border-radius:50%!important;font-size:11px}
#bd{right:84px;bottom:144px;width:60px;height:60px;border-radius:50%!important;font-size:11px}
#bu,#bw,#bc{bottom:124px;width:46px;height:46px;border-radius:14px!important;font-size:11px}
#bu{left:14px}#bw{left:68px}#bc{left:122px}
#gv{left:176px!important;right:auto!important;bottom:122px!important;font-size:24px!important}
@media(max-height:420px){#bl,#br{height:84px;width:80px}#br{left:102px}#bg{height:100px;width:88px}#bk{height:84px;width:74px;right:112px}#bn,#bd{bottom:124px;width:54px;height:54px}#bd{right:76px}#bu,#bw,#bc{bottom:108px;width:42px;height:42px}#bw{left:62px}#bc{left:110px}#gv{bottom:106px!important;left:158px!important}}`;
document.head.appendChild(css);
const mk=(id,html)=>{const b=document.createElement('button');b.id=id;b.className='tb';b.innerHTML=html;tc.appendChild(b);return b};
function bind(b,key){
b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();aud();try{b.setPointerCapture(e.pointerId)}catch(_){}T[key]=1;b.classList.add('on');if(navigator.vibrate&&G.vib&&(key=='g'||key=='k'))try{navigator.vibrate(8)}catch(_){}});
const up=()=>{T[key]=0;b.classList.remove('on')};['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,up));
b.addEventListener('contextmenu',e=>e.preventDefault())}
bind(mk('bl','◀'),'l');bind(mk('br','▶'),'r');bind(mk('bg','<span style="font-size:30px">⛽</span>ACELERAR'),'g');bind(mk('bk','<span style="font-size:26px">🛑</span>FREIO / RÉ'),'k');
// direção com rampa (mais suave que 0 → ±1 de uma vez); aceleração e freio independentes
let ts=0;const _inp=inp;inp=function(){const o=_inp();ts+=((T.r-T.l)-ts)*.28;if(Math.abs(ts)<.02)ts=0;if(ts)o.st=cl(o.st+ts,-1,1);if(T.g)o.th=1;if(T.k)o.br=1;return o};
const _st=start;start=function(){T.l=T.r=T.g=T.k=0;ts=0;['bl','br','bg','bk'].forEach(i=>$(i).classList.remove('on'));_st()};
})();
