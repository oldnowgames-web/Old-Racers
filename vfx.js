// ===== vfx.js : câmera lenta e órbita na chegada, tremor/flash nas batidas, relâmpagos na chuva e ciclo de pôr do sol (Clima 🌅) =====
// Carregar DEPOIS de game.js, items.js e modes.js.
(function(){
'use strict';
const TH=THREE,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
// ---------- sobreposições ----------
const mkO=(css)=>{const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;pointer-events:none;opacity:0;'+css;return d};
const hit=mkO('z-index:5;background:radial-gradient(ellipse at center,transparent 45%,rgba(255,30,50,.65))'),fl=mkO('z-index:5;background:#fff');
document.body.appendChild(hit);document.body.appendChild(fl);
// ---------- chegada em câmera lenta ----------
let fin=0;
const _race=race;race=function(dt){if(state=='end'&&pl){fin+=dt;if(fin<3.2)dt*=.3}else if(state=='race')fin=0;_race(dt)};
// ---------- tremor nas batidas ----------
let sh=0;
const _sf=sf;sf=function(k){_sf(k);if(k=='col'){sh=.6;hit.style.opacity=.85;window.VIB&&VIB(60)}else if(k=='nt'){sh=Math.max(sh,.25);window.VIB&&VIB(35)}else if(k=='tk')window.VIB&&VIB(15)};
const _cu=camUpd;camUpd=function(dt){_cu(dt);
if(state=='end'&&pl&&fin<4.6){const a=1.2+fin*.55,d=7.5+fin*.4;cam.position.set(pl.x+Math.cos(a)*d,1.6+fin*.25,pl.z+Math.sin(a)*d);cam.lookAt(pl.x,.9,pl.z)}
if(sh>0){cam.position.x+=(R()-.5)*sh*.5;cam.position.y+=(R()-.5)*sh*.35;cam.rotateZ((R()-.5)*sh*.04);sh=Math.max(0,sh-dt*1.6)}};
// ---------- relâmpagos ----------
let lt=6+R()*8,ff=0;
function lightning(dt){if(!W.rain||(state!='race'&&state!='menu')){return}lt-=dt;
if(lt<=0){lt=8+R()*14;ff=1;setTimeout(()=>{ff=.8},170);setTimeout(()=>{window.SFX&&SFX('thunder')},350+R()*1100)}}
// ---------- ciclo de pôr do sol ----------
const DC={t:0},C=new TH.Color(),C2=new TH.Color(),CT=new TH.Color(),CS=new TH.Color();
function ramp(st,t,out){for(let i=1;i<st.length;i++){if(t<=st[i][0]){const a=st[i-1],b=st[i],f=(t-a[0])/(b[0]-a[0]);return out.set(a[1]).lerp(C2.set(b[1]),f)}}return out.set(st[st.length-1][1])}
function apply(t){const T=W.T||TRACKS[0],td=new TH.Color(T.sky).lerp(new TH.Color(0x2a62c8),.55).getHex();
ramp([[0,T.sky],[.35,0xf0a060],[.62,0x5a3b6b],[.85,0x0a0f26],[1,0x070b1c]],t,C);
ramp([[0,td],[.35,0x6d5aa8],[.62,0x20204f],[.85,0x04061a],[1,0x01030c]],t,CT);
ramp([[0,0xffffff],[.35,0xff9a5a],[.62,0x6a6aa0],[1,0x202040]],t,CS);
if(scn.background&&scn.background.copy)scn.background.copy(C);if(scn.fog)scn.fog.color.copy(C);SU.bot.value.copy(C);SU.top.value.copy(CT);
const k=cl(t/.9,0,1);hemi.intensity=lerp(.9,.28,k);sun.intensity=lerp(.95,.06,Math.pow(k,1.2));sun.color.copy(CS);
const ky=cl(t/.7,0,1);SU.sd.value.set(110,lerp(110,5,ky),50).normalize();SU.sc.value.set(lerp(1,1,ky),lerp(.88,.55,ky),lerp(.65,.35,ky));
vN=cl((t-.5)/.3,0,1);const nt=t>.62;
if(W.night!==nt){W.night=nt;if(W.gl)W.gl.visible=nt;scn.environment=EV[nt?2:0];if(pl&&pl.mesh.userData.lamp)pl.mesh.userData.lamp.intensity=nt?1.3:0}
ren.toneMappingExposure=lerp(1.1,1.3,cl((t-.6)/.4,0,1));
sun.position.y=sun.target.position.y+lerp(110,16,ky)}
const _st=start;start=function(){DC.t=0;_st()};
// ---------- por frame ----------
const _pa=parts;parts=function(dt){_pa(dt);
if(G.wx==4){if(state=='race'&&cd<=0)DC.t=Math.min(1,DC.t+dt/170);else if(state=='menu')DC.t=.1;apply(DC.t)}
lightning(dt);
if(ff>0){fl.style.opacity=ff*.85;ff=Math.max(0,ff-dt*5)}else if(fl.style.opacity!='0')fl.style.opacity=0;
if(+hit.style.opacity>0)hit.style.opacity=Math.max(0,hit.style.opacity-dt*1.8)};
})();
