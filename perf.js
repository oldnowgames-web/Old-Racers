// ===== perf.js : desempenho (menos escrita no DOM, HUD e torcida em taxa reduzida, sombras em meia taxa, resolução dinâmica) =====
// Carregar por ÚLTIMO entre os scripts do jogo (depois de controls.js).
(function(){
'use strict';
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
// ---------- evita regravar o DOM com o mesmo conteúdo a cada frame ----------
function cache(el,prop,fx){if(!el)return;const d=Object.getOwnPropertyDescriptor(Element.prototype,prop)||Object.getOwnPropertyDescriptor(Node.prototype,prop);if(!d)return;let last=null;
Object.defineProperty(el,prop,{configurable:true,get(){return d.get.call(el)},set(v){v=String(v);if(fx)v=fx(v);if(v===last)return;last=v;d.set.call(el,v)}})}
cache($('info'),'innerHTML',h=>window.INFOFX?window.INFOFX(h):h);cache($('nc'),'textContent');cache($('gv'),'textContent');cache($('cd'),'textContent');
// ---------- velocímetro e minimapa em taxa reduzida ----------
let fg=0,fm=0;const _g=gauge,_m=mini;
gauge=function(){const n=G.q==2?1:G.q==1?2:3;if(fg++%n)return;_g()};
mini=function(){const n=G.q==2?2:G.q==1?3:4;if(fm++%n)return;_m()};
// ---------- sombras em meia taxa ----------
ren.shadowMap.autoUpdate=false;ren.shadowMap.needsUpdate=true;
// ---------- resolução dinâmica + qualidade automática ----------
let RS=1;const coarse=matchMedia('(pointer:coarse)').matches;
const PR=()=>G.q==0?1:Math.min(devicePixelRatio||1,G.q==1?(coarse?1.25:1.5):(coarse?1.5:2));
const _rs=rs;rs=function(){_rs();ren.setPixelRatio(PR()*RS);ren.setSize(innerWidth,innerHeight,false)};
addEventListener('resize',()=>rs());
rs();
let ema=60,low=0,hi=0,cool=0,lt=performance.now(),fc=0;
const _pa=parts;parts=function(dt){
const n=performance.now(),d=(n-lt)/1000;lt=n;if(d>0&&d<.5)ema+=(1/d-ema)*.05;cool-=d;fc++;
if(fc%(G.q==2?1:2)==0)ren.shadowMap.needsUpdate=true;
// torcida: anima em taxa reduzida e só quando está perto
const pe=W.pe;let skip=false;if(pe){const k=G.q==2?1:G.q==1?2:4;skip=(fc%k!=0)||cam.position.distanceTo(pe.g.position)>150}
if(skip)W.pe=null;try{_pa(dt)}finally{if(skip)W.pe=pe}
if(G.aq&&state=='race'&&cd<=0&&cool<=0){
if(ema<36){hi=0;low+=d;if(low>3){low=0;cool=8;ema=50;
if(RS>.71){RS=Math.max(.7,RS-.15);rs();TOAST('Resolução reduzida para melhorar o desempenho')}
else if(G.q>0){G.q--;SV.d.set.q=G.q;SV.save();rs();TOAST('Gráficos ajustados para '+['Baixo','Médio','Alto'][G.q])}}}
else{low=0;if(ema>57&&RS<1){hi+=d;if(hi>20){hi=0;cool=8;RS=Math.min(1,RS+.1);rs()}}else hi=0}}else low=0};
})();
