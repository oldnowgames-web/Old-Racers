// ===== modes.js : modos especiais (contra-relógio com fantasma, eliminação, desafio de drift), tempos de volta e recordes =====
// Carregar DEPOIS de save.js e items.js.
(function(){
'use strict';
const TH=THREE,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const MN=['Corrida Livre','Carreira','Treino Livre','Contra-Relógio','Eliminação','Desafio de Drift'];
const trkIdx=()=>G.mode==1?Math.min(career,TRACKS.length-1):G.trk;
let L={max:0,t0:0,rec:[],rt:0,ti:0,laps:[],nb:0},GH=null,gm=null,E={t:25,n:0},D={time:90,score:0,chain:0,mult:1,gap:0,dt:0,over:0};
// ---------- telas ----------
function renderModes(){const B=(m,t,d)=>`<button class="big mo" onclick="go(${m})"><b style="text-align:left;display:block;font-size:16px">${t}</b><span style="display:block;font-size:12px;opacity:.75;font-weight:600;letter-spacing:.5px;text-transform:none;text-align:left">${d}</span></button>`;
$('modesc').innerHTML='<h2 style="margin:0;text-align:center">Modos Especiais</h2>'+B(3,'⏱️ Contra-Relógio','Corra sozinho contra o seu melhor tempo: um carro fantasma refaz a sua melhor volta.')+
B(4,'💀 Eliminação','A cada 22 segundos o último colocado é eliminado. Sobreviva até o fim!')+B(5,'💨 Desafio de Drift','90 segundos para somar pontos derrapando. Combos aumentam o multiplicador.')+
'<div class=row><button onclick="scr(\'menu\')">← Voltar</button><button onclick="scr(\'rec\')">📊 Recordes</button></div>'}
const fmt2=t=>t==null?'—':fmt(t);
function renderRec(){const d=SV.d;$('recc').innerHTML='<h2 style="margin:0;text-align:center">Recordes</h2><table>'+TRACKS.map((t,i)=>`<tr><td>${t.n}</td><td>${fmt2(d.best[i])}</td></tr>`).join('')+
`<tr><td>💨 Melhor drift</td><td>${d.drift|0} pts</td></tr><tr><td>🏁 Corridas / 🏆 vitórias</td><td>${d.races|0} / ${d.wins|0}</td></tr></table><div class=row><button onclick="scr('modes')">← Voltar</button></div>`}
const _scr=scr;scr=function(id){_scr(id);if(id=='modes')renderModes();else if(id=='rec')renderRec()};
// ---------- seleção ----------
const _go=go;go=function(m){if(m>=3){G.mode=m;G.bots=m==4?6:0;G.laps=m==3?(G.laps>=2&&G.laps<=5?G.laps:3):99;aud();scr('sel')}else{_go(m);if(m==0&&G.laps>5)G.laps=3}};
const _rs=renderSel;renderSel=function(){_rs();const M=G.mode,el=$('selc');if(M<3)return;let h=el.innerHTML;
h=h.replace(/<h2[^>]*>[^<]*<\/h2>/,`<h2 style="margin:0;text-align:center">${MN[M]}</h2>`);
if(M==3||M==5)h=h.replace(/<div class="?row"?>\s*<b>Dificuldade<\/b>[\s\S]*?<\/div>/,'');
if(M==3)h=h.replace(/<div class="?row"?>\s*<button[^>]*toMenu\(\)/,x=>`<div class=row><b>Voltas</b>${[2,3,5].map(n=>`<button class="${G.laps==n?'on':''}" onclick="pick('laps',${n})">${n}</button>`).join('')}</div>`+x);
el.innerHTML=h};
const _tm=toMenu;toMenu=function(){if(G.laps>5)G.laps=3;mh('');_tm()};
// ---------- HUD dos modos ----------
const mhd=document.createElement('div');mhd.style.cssText='position:absolute;left:50%;top:68px;transform:translateX(-50%);text-align:center;font:900 15px system-ui;letter-spacing:1px;text-shadow:0 2px 8px #000;white-space:nowrap;pointer-events:none';$('hud').appendChild(mhd);
let mt='';const mh=s=>{if(s!==mt){mt=s;mhd.innerHTML=s}};
// ---------- fantasma ----------
const GHM=new TH.MeshBasicMaterial({color:0x66e0ff,transparent:true,opacity:.28,depthWrite:false});
const loadG=ti=>{try{const j=JSON.parse(localStorage.getItem('or_gh_'+ti)||'null');if(j&&j.d&&j.d.length>6)return j}catch(e){}return null};
const saveG=(ti,t,d)=>{try{localStorage.setItem('or_gh_'+ti,JSON.stringify({t,car:G.car,d}))}catch(e){}};
function mkGhost(){GH=null;gm=null;if(G.mode!=3)return;GH=loadG(L.ti);if(!GH)return;
gm=mkCar(CARS[GH.car]||CARS[G.car],0x66e0ff,{hc:0x66e0ff,su:0x66e0ff,hs:0});
gm.traverse(o=>{if(o.isSprite||o.isLight)o.visible=false;else if(o.isMesh){if(o.geometry.type=='PlaneGeometry')o.visible=false;else{o.material=GHM;o.castShadow=false}}});gm.visible=false;world.add(gm)}
// ---------- voltas e recordes ----------
function lapDone(t){if(t<8||t>400)return;L.laps.push(t);const b=SV.d.best[L.ti];let nb=0;
if(b==null||t<b-.001){SV.d.best[L.ti]=t;nb=1;L.nb=1;if(L.rec.length>9)saveG(L.ti,t,L.rec.slice());SV.save()}
TOAST('Volta '+L.laps.length+' · '+fmt(t)+(nb?' 🏆 RECORDE!':''),nb?'linear-gradient(100deg,#ffb347,#ff2d75)':'');window.SFX&&SFX(nb?'win':'lap')}
function lapTick(dt){if(state!='race'||G.mode==5)return;
if(pl.lap>L.max){if(L.max>=1)lapDone(tm-L.t0);L.max=pl.lap;L.t0=tm;L.rec=[];L.rt=0}
if(L.max>=1&&cd<=0){L.rt+=dt;while(L.rt>=.1){L.rt-=.1;L.rec.push((pl.x*10)|0,(pl.z*10)|0,(pl.h*1000)|0)}}
if(gm&&GH){if(L.max>=1){const g=GH.d,i=(tm-L.t0)*10,i0=Math.floor(i),n=g.length/3;
if(i0>=0&&i0+1<n){const f=i-i0,a=i0*3,b=a+3,h0=g[a+2]/1000,h1=g[b+2]/1000;gm.visible=true;gm.position.set((g[a]+(g[b]-g[a])*f)/10,0,(g[a+1]+(g[b+1]-g[a+1])*f)/10);gm.rotation.y=h0+Math.atan2(Math.sin(h1-h0),Math.cos(h1-h0))*f}else gm.visible=false}else gm.visible=false}}
const _ph=phys;phys=function(c,dt,u){_ph(c,dt,u);if(c===pl)lapTick(dt)};
// ---------- encerramento dos modos ----------
function end(t,d,coins,win){if(state!='race')return;state='end';pl.ft=tm;if(!win)bots.forEach(b=>{b.ft=b.ft||tm+1});mh('');
$('et').textContent=t;$('ed').innerHTML=board();$('en').innerHTML=d+(coins>0?`<br><b style="color:#ffe14d">🪙 +${coins}</b>`:'');SV.add(coins);SV.d.races++;if(win)SV.d.wins++;SV.save();scr('end')}
const _board=board;board=function(){if(G.mode==5)return`<table><tr><td>💨 Pontos</td><td>${D.score|0}</td></tr><tr><td>🏆 Recorde</td><td>${Math.max(D.score,SV.d.drift)|0}</td></tr></table>`;
if(G.mode==3&&L.laps.length){const bl=Math.min(...L.laps);return'<table>'+L.laps.map((t,i)=>`<tr class="${t==bl?'me':''}"><td>Volta ${i+1}</td><td>${fmt(t)}</td></tr>`).join('')+'</table>'}return _board()};
const _fin=finish;finish=function(){_fin();if(G.mode!=3)return;const c=L.laps.length*50+(L.nb?150:0),b=SV.d.best[L.ti];
$('et').textContent='⏱️ Contra-relógio concluído';$('en').innerHTML=`Melhor volta: ${fmt2(b)}${L.nb?' 🏆 novo recorde!':''}`+`<br><b style="color:#ffe14d">🪙 +${c}</b>`;SV.add(c);SV.d.races++;SV.save()};
// ---------- eliminação ----------
function elim(dt){if(G.mode!=4||state!='race'||cd>0)return;E.t-=dt;
if(E.t<=0){E.t=22;const lo=[pl].concat(bots).sort((a,b)=>a.prog-b.prog)[0];
if(lo===pl){end('💀 Você foi eliminado!','Você era o último colocado. Eliminados rivais: '+E.n,E.n*60,0);return}
bots.splice(bots.indexOf(lo),1);cars.splice(cars.indexOf(lo),1);lo.mesh.parent&&lo.mesh.parent.remove(lo.mesh);E.n++;
TOAST('❌ '+lo.nm.split(' · ')[0]+' eliminado!','linear-gradient(100deg,#ff5a6e,#7c4dff)');window.SFX&&SFX('elim');
if(!bots.length){end('🏆 Sobrevivente!','Você eliminou todos os rivais!',E.n*60+400,1);return}}
mh(`<span style="color:#ff5a6e">💀 ELIMINAÇÃO EM ${Math.ceil(E.t)}s</span> · restam ${bots.length+1}`)}
// ---------- desafio de drift ----------
function drift(dt){if(G.mode!=5||state!='race'||cd>0)return;D.time-=dt;const c=pl,vl=-c.vx*Math.cos(c.h)+c.vz*Math.sin(c.h),sp=Math.abs(c.vf);
const on=Math.abs(vl)>3.2&&sp>9&&!c.off;
if(c.off&&D.chain>0){D.chain=0;D.mult=1;D.dt=0;TOAST('Combo perdido!','linear-gradient(100deg,#ff5a6e,#7c4dff)')}
if(on){D.gap=0;D.chain+=Math.abs(vl)*sp*dt*.9*D.mult;D.dt+=dt;D.mult=Math.min(8,1+Math.floor(D.dt/1.5))}
else{D.gap+=dt;if(D.gap>.7&&D.chain>0){D.score+=Math.round(D.chain);TOAST('💨 +'+Math.round(D.chain)+' pts  (x'+D.mult+')');D.chain=0;D.mult=1;D.dt=0}}
if(D.time<=0){D.score+=Math.round(D.chain);D.chain=0;const nb=D.score>(SV.d.drift|0);if(nb)SV.d.drift=D.score;const co=Math.min(700,Math.round(D.score/70));
end('💨 '+D.score+' pontos','Tempo esgotado!'+(nb?' 🏆 novo recorde de drift!':''),co,1);return}
mh(`⏱ ${Math.ceil(D.time)}s &nbsp; <span style="color:#ffe14d">💨 ${D.score}</span>`+(D.chain>0?` &nbsp; <span style="color:#4cf0ff">+${Math.round(D.chain)} ×${D.mult}</span>`:''))}
// ---------- integração ----------
const _st=start;start=function(){if(G.mode==4||G.mode==5)G.laps=99;if(G.mode==3&&(G.laps<2||G.laps>5))G.laps=3;
_st();L={max:0,t0:0,rec:[],rt:0,ti:trkIdx(),laps:[],nb:0};E={t:25,n:0};D={time:90,score:0,chain:0,mult:1,gap:0,dt:0};mt='';mh('');mkGhost()};
const _race=race;race=function(dt){_race(dt);elim(dt);drift(dt)};
// complementos do painel de voltas (aplicados na escrita do #info, sem regravar o DOM)
window.INFOFX=function(h){if(G.laps>=99)h=h.replace('/99','/∞');const b=SV.d.best[L.ti];if(G.mode!=5&&b!=null)h+=`<span class=chip>🏁 ${fmt(b)}</span>`;return h};
})();
