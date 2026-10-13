// ===== items.js : power-ups (escudo, ímã, óleo) e personalidade dos rivais =====
// Carregar DEPOIS de save.js. Caixas de item na pista; usar com F / Enter / botão ITEM.
(function(){
'use strict';
const TH=THREE,PI=Math.PI,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const ICON={shield:'🛡️',magnet:'🧲',oil:'🛢️'},NAME={shield:'ESCUDO',magnet:'ÍMÃ DE TANQUES',oil:'ÓLEO'};
const ON=()=>[0,1,2,4].indexOf(G.mode)>=0;
let IB=[],OIL=[],BG=null,BM=null,OG=null,OM=null,SG=null,SM=null,RG=null,RM=null;
// ---------- HUD do item ----------
const it=document.createElement('div');it.id='itm';
it.style.cssText='position:absolute;right:14px;top:calc(22px + clamp(76px,24vh,140px));width:68px;height:68px;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(10,14,30,.62);border:2px solid rgba(255,255,255,.25);font-size:28px;line-height:1;pointer-events:auto;backdrop-filter:blur(6px);opacity:0;transition:opacity .2s,border-color .2s,transform .2s;touch-action:manipulation;cursor:pointer';
it.innerHTML='<span id="itE"></span><small style="font-size:9px;letter-spacing:1px;font-weight:800;opacity:.8;margin-top:2px">ITEM</small>';
$('hud').appendChild(it);it.onpointerdown=e=>{e.stopPropagation();window.useItem()};
let hs='';
function hudUpd(){let s='',b='rgba(255,255,255,.25)',o=0,sc=1;
if(pl&&pl.item){s=ICON[pl.item];o=1;b='#ffe14d';sc=1.08}
else if(pl&&pl.sh>0){s='🛡️<small style="font-size:12px">'+Math.ceil(pl.sh)+'s</small>';o=.9;b='#4cf0ff'}
else if(pl&&pl.mg>0){s='🧲<small style="font-size:12px">'+Math.ceil(pl.mg)+'s</small>';o=.9;b='#ff6ad5'}
const k=s+o;if(k!==hs){hs=k;$('itE').innerHTML=s;it.style.opacity=ON()?o:0;it.style.borderColor=b;it.style.transform='scale('+sc+')'}}
// ---------- caixas e óleo ----------
function res(){if(!BG){BG=new TH.BoxGeometry(1.5,1.5,1.5);BM=new TH.MeshBasicMaterial({map:vCv(64,64,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#ffd24d');g.addColorStop(1,'#ff2d75');x.fillStyle=g;x.fillRect(0,0,w,h);x.strokeStyle='#fff';x.lineWidth=5;x.strokeRect(3,3,w-6,h-6);x.fillStyle='#fff';x.font='900 46px system-ui';x.textAlign='center';x.fillText('?',w/2,50)})});
OG=new TH.CircleGeometry(1,24).rotateX(-PI/2);OM=new TH.MeshStandardMaterial({color:0x050507,metalness:.85,roughness:.05,transparent:true,opacity:.88,polygonOffset:true,polygonOffsetFactor:-4,depthWrite:false});
SG=new TH.SphereGeometry(1,18,12);SM=new TH.MeshBasicMaterial({color:0x4cf0ff,transparent:true,opacity:.2,blending:TH.AdditiveBlending,depthWrite:false,side:TH.DoubleSide});
RG=new TH.TorusGeometry(2.5,.07,6,32).rotateX(PI/2);RM=new TH.MeshBasicMaterial({color:0xff6ad5,transparent:true,opacity:.75,blending:TH.AdditiveBlending,depthWrite:false})}}
function mkBoxes(){res();IB=[];OIL.forEach(o=>o.m.parent&&o.m.parent.remove(o.m));OIL=[];if(!ON())return;
const n=9,ln=[-5,0,5];
for(let i=0;i<n;i++){const A=trk[(Math.floor(i*N/n)+44)%N],o=ln[(i*5+2)%3],g=new TH.Group();g.add(new TH.Mesh(BG,BM),vGl(0xffd24d,5,0,0,0,.8));
const x=A.x+A.nx*o,z=A.z+A.nz*o;g.position.set(x,1.5,z);world.add(g);IB.push({m:g,x,z,on:1,t:0})}}
function dropOil(x,z,owner){const m=new TH.Mesh(OG,OM);m.position.set(x,.07,z);m.scale.setScalar(3.2);world.add(m);OIL.push({m,x,z,t:22,o:owner})}
function vis(){if(!pl)return;res();const u=pl.mesh.userData;
if(!u.shd){u.shd=new TH.Mesh(SG,SM);u.shd.scale.set(pl.s.w*.85+.9,.9,pl.s.l*.62+.2);u.shd.position.y=.75;u.shd.visible=false;pl.mesh.add(u.shd);
u.mgr=new TH.Mesh(RG,RM);u.mgr.position.y=.5;u.mgr.visible=false;pl.mesh.add(u.mgr)}
u.shd.visible=pl.sh>0&&(pl.sh>2||Math.sin(vt*26)>0);u.mgr.visible=pl.mg>0;u.mgr.rotation.y=vt*3;const k=1+Math.sin(vt*5)*.04;u.shd.scale.y=.9*k}
// ---------- usar item ----------
window.useItem=function(){if(!pl||state!='race'||cd>0||!pl.item||!ON())return;const t=pl.item;pl.item=null;
if(t=='shield'){pl.sh=8;TOAST('🛡️ Escudo ativo!');window.SFX&&SFX('shield')}
else if(t=='magnet'){pl.mg=9;TOAST('🧲 Ímã ativo!');window.SFX&&SFX('magnet')}
else{dropOil(pl.x-Math.sin(pl.h)*3.6,pl.z-Math.cos(pl.h)*3.6,pl);TOAST('🛢️ Óleo derramado!');window.SFX&&SFX('oil')}hudUpd()};
// ---------- atualização por frame ----------
function upd(dt){if(!pl||!ON()){hudUpd();return}
const ac=state=='race'&&cd<=0;
if(pl.sh>0)pl.sh-=dt;if(pl.mg>0)pl.mg-=dt;if(pl.oilT>0)pl.oilT-=dt;
IB.forEach((k,i)=>{if(!k.on){k.t-=dt;if(k.t<=0){k.on=1;k.m.visible=true}return}k.m.rotation.y+=dt*2;k.m.rotation.x+=dt*.7;k.m.position.y=1.5+Math.sin(vt*3+i)*.25;
if(ac&&!pl.item&&Math.hypot(pl.x-k.x,pl.z-k.z)<3.3){k.on=0;k.t=12;k.m.visible=false;const r=R();pl.item=r<.34?'shield':r<.68?'magnet':'oil';
TOAST(ICON[pl.item]+' '+NAME[pl.item]+' — aperte F');window.SFX&&SFX('item');window.VIB&&VIB(20);for(let j=0;j<8;j++)emit(k.x,1.4,k.z,0xffd24d,.3,.5,(R()-.5)*8,3,(R()-.5)*8)}});
for(let i=OIL.length-1;i>=0;i--){const o=OIL[i];o.t-=dt;if(o.t<=0){o.m.parent&&o.m.parent.remove(o.m);OIL.splice(i,1);continue}if(o.t<2)o.m.scale.setScalar(3.2*o.t/2);
if(!ac)continue;
if(o.o!==pl&&Math.hypot(pl.x-o.x,pl.z-o.z)<3.3&&Math.abs(pl.vf)>4&&!(pl.oilT>0)){pl.oilT=2;
if(pl.sh>0){for(let j=0;j<6;j++)emit(pl.x,.5,pl.z,0x4cf0ff,.25,.4,(R()-.5)*8,2,(R()-.5)*8)}
else{pl.h+=(R()<.5?-1:1)*(.8+R()*.4);pl.vx*=.72;pl.vz*=.72;TOAST('💥 Óleo na pista!','linear-gradient(100deg,#ff5a6e,#7c4dff)');window.SFX&&SFX('oil');window.VIB&&VIB(90);for(let j=0;j<8;j++)emit(pl.x,.3,pl.z,0x222222,.5,.8,(R()-.5)*6,1,(R()-.5)*6)}}
bots.forEach(b=>{if(o.o!==b&&!(b.oilT>0)&&Math.hypot(b.x-o.x,b.z-o.z)<3.3){b.oilT=3;b.slow=1.5;for(let j=0;j<5;j++)emit(b.x,.3,b.z,0x333333,.5,.7,(R()-.5)*5,1,(R()-.5)*5)}})}
if(ac)bots.forEach(b=>{if(b.oilT>0)b.oilT-=dt;if(b.shT>0)b.shT-=dt;
if(pl.sh>0&&!(b.shT>0)&&Math.hypot(pl.x-b.x,pl.z-b.z)<3.7){b.shT=1.2;b.slow=.9;b.off=cl(b.off+(b.x-pl.x>0?1:-1)*3,-7,7);for(let j=0;j<6;j++)emit(b.x,.8,b.z,0x4cf0ff,.25,.4,(R()-.5)*9,2,(R()-.5)*9);window.SFX&&SFX('shield')}
b.itT-=dt;if(b.itT<=0&&G.diff>0){const g=b.i-pl.prog;if(g>1.5&&g<16){dropOil(b.x-Math.sin(b.h)*3.6,b.z-Math.cos(b.h)*3.6,b);b.itT=20+R()*18}else b.itT=4}});
vis();hudUpd()}
// ---------- ímã: puxa os tanques ----------
const _tu=tankUpd;tankUpd=function(dt){if(pl&&pl.mg>0)TK.forEach(k=>{if(!k.on)return;if(k.ox==null){k.ox=k.x;k.oz=k.z}const dx=pl.x-k.x,dz=pl.z-k.z,d=Math.hypot(dx,dz);if(d<44&&d>1){const s=Math.min(d,(32+(44-d)*1.4)*dt)/d;k.x+=dx*s;k.z+=dz*s;k.m.position.x=k.x;k.m.position.z=k.z}});
_tu(dt);TK.forEach(k=>{if(!k.on&&k.ox!=null){k.x=k.ox;k.z=k.oz;k.m.position.x=k.ox;k.m.position.z=k.oz}})};
// ---------- personalidade dos rivais ----------
const PERS={aggr:['🔥',1.04],calm:['🧊',.97],erra:['🎲',1.03],pro:['🎯',1.0]},PK=Object.keys(PERS);
const _mb=mkBots;mkBots=function(n,d,m){_mb(n,d,m);bots.forEach((b,i)=>{const p=PK[(i+(R()*4|0))%4];b.pers=p;b.sk=Math.min(1.36,b.sk*PERS[p][1]);b.errT=8+R()*25;b.itT=14+R()*18;b.slow=0;b.nm+=' '+PERS[p][0]})};
const _bm=botMove;botMove=function(b,dt){
if(b.slow>0){b.slow-=dt;b.v*=Math.max(0,1-dt*2.5)}
if(pl&&state=='race'&&cd<=0&&b.pers){
if(b.pers=='erra'){b.errT-=dt;if(b.errT<=0){b.errT=10+R()*25;b.slow=.9+R()*.6;b.off=cl(b.off+(R()<.5?-1:1)*(4+R()*3),-7,7)}}
else if(b.pers=='aggr'&&G.diff>0){const gp=pl.prog-b.i;if(gp>-1&&gp<5){const A=trk[pl.idx],dl=(pl.x-A.x)*A.nx+(pl.z-A.z)*A.nz;b.off+=(cl(dl,-6.5,6.5)-b.off)*Math.min(1,dt*1.1)}}}
_bm(b,dt)};
// ---------- partida ----------
const _st=start;start=function(){_st();mkBoxes();if(pl){pl.item=null;pl.sh=0;pl.mg=0;pl.oilT=0}hs='';vis();hudUpd()};
const _race=race;race=function(dt){_race(dt);upd(dt)};
const _tm=toMenu;toMenu=function(){_tm();hs='';hudUpd()};
})();
