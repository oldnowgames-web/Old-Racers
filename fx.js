// ===== fx.js : etiquetas, faróis dos rivais, luz de preenchimento, brilho de nitro e vinheta de velocidade =====
// Carregar DEPOIS de game.js, cars.js e pilot.js.
(function(){
'use strict';
const TH=THREE,PI=Math.PI,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
// ---- etiquetas dos pilotos: tamanho constante na tela, somem de perto e de longe ----
function rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
tag=function(t){const c=document.createElement('canvas');c.width=256;c.height=56;const x=c.getContext('2d');
x.fillStyle='rgba(8,12,24,.66)';rr(x,2,2,252,52,14);x.fill();x.strokeStyle='rgba(76,201,255,.75)';x.lineWidth=2;x.stroke();
x.fillStyle='#fff';x.font='bold 26px system-ui';x.textAlign='center';x.fillText(t,128,37);
const p=new TH.Sprite(new TH.SpriteMaterial({map:new TH.CanvasTexture(c),depthWrite:false,transparent:true}));p.scale.set(3.4,.74,1);p.position.y=2.7;p.userData.tag=1;return p};
// ---- luz de preenchimento fria (levanta as sombras) ----
const fill=new TH.DirectionalLight(0x9db8ff,.26);fill.position.set(-120,80,-90);scn.add(fill);
const _sw=setWx;setWx=function(){_sw();const w=G.wx==3?W.aw:G.wx;fill.intensity=w==2?.04:w==1?.14:.26};
// ---- rivais: poça de luz dos faróis à noite; jogador: luz azul do nitro ----
const PG=new TH.PlaneGeometry(1,1).rotateX(-PI/2);
const _mc=mkCar;mkCar=function(S,col,pil){const g=_mc(S,col,pil),u=g.userData,L=S.l;
if(!pil||!pil.lamp){const m=new TH.Mesh(PG,new TH.MeshBasicMaterial({map:GT,color:0xfff1c8,blending:TH.AdditiveBlending,transparent:true,depthWrite:false,opacity:.4,polygonOffset:true,polygonOffsetFactor:-2}));
m.scale.set(S.w*3.4,1,12);m.position.set(0,.07,L/2+6.5);m.visible=false;g.add(m);u.pool=m}
else{const l=new TH.PointLight(0x4cc9ff,0,16);l.position.set(0,.6,-L/2-1.4);g.add(l);u.nl=l}
return g};
// ---- aberração cromática de borda + vinheta que crescem com a velocidade ----
const ca=document.createElement('div');ca.style.cssText='position:absolute;inset:0;pointer-events:none;opacity:0;box-shadow:inset 22px 0 46px -16px rgba(255,40,90,.4),inset -22px 0 46px -16px rgba(40,210,255,.4),inset 0 0 120px rgba(0,0,0,.35)';
$('hud').insertBefore(ca,$('hud').firstChild);
const _pa=parts;parts=function(dt){_pa(dt);
bots.forEach(b=>{const u=b.mesh.userData;if(u.pool)u.pool.visible=!!W.night;
let s=b.tgs;if(s===undefined)s=b.tgs=b.mesh.children.find(o=>o.userData.tag)||null;if(!s)return;
const d=Math.hypot(b.x-cam.position.x,b.z-cam.position.z),k=cl(d/28,.4,3);s.scale.set(3.4*k,.74*k,1);s.visible=d>9&&d<95;s.material.opacity=cl((d-9)/8,0,1)*cl((95-d)/25,0,1)});
if(pl&&pl.mesh){const l=pl.mesh.userData.nl;if(l)l.intensity=pl.nt?1.6+Math.random()*.9:0}
ca.style.opacity=G.q>0&&pl&&(state=='race'||state=='end')?cl((Math.abs(pl.vf)*3.6-110)/190,0,.75)+(pl.nt?.2:0):0};
buildMenu();rs();
})();
