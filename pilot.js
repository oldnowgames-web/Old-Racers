// ===== pilot.js : piloto articulado, 6 capacetes e animação =====
// Carregar DEPOIS de game.js e cars.js. Substitui window.mkDriver (piloto dentro do carro) e mkPilot (piloto em pé na garagem).
// Contrato: userData.dr continua sendo o grupo raiz do piloto; dr.userData.p guarda as peças articuladas.
(function(){
'use strict';
const TH=THREE,PI=Math.PI,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const MEMO={};const memo=(k,f)=>MEMO[k]||(MEMO[k]=f());
const sg=n=>G.q==0?Math.max(6,n*.5|0):G.q==1?n:n+6;          // segmentos conforme a qualidade gráfica
const STD=(c,m,r)=>memo('s'+c+'/'+m+'/'+r,()=>new TH.MeshStandardMaterial({color:c,metalness:m,roughness:r}));
const lum=c=>{const o=new TH.Color(c);return o.r*.3+o.g*.6+o.b*.1};
const contrast=c=>lum(c)>.55?0x15171c:0xf2f2f2;
const Y=new TH.Vector3(0,1,0);
// ---------- geometrias compartilhadas ----------
const limbG=(rt,rb)=>memo('l'+rt+'/'+rb+'/'+sg(10),()=>new TH.CylinderGeometry(rt,rb,1,sg(10)).translate(0,.5,0));
const ball=(r,sx,sy,sz)=>memo('b'+r+'/'+sx+'/'+sy+'/'+sz+'/'+sg(12),()=>new TH.SphereGeometry(r,sg(12),sg(9)).scale(sx||1,sy||1,sz||1));
const box=(w,h,d)=>memo('x'+w+'/'+h+'/'+d,()=>new TH.BoxGeometry(w,h,d));
function rbox(w,h,d,r){return memo('r'+w+'/'+h+'/'+d+'/'+r+'/'+sg(4),()=>{const b=r*.5,W=w-2*b,H=h-2*b,x=-W/2,y=-H/2,s=new TH.Shape(),c=Math.min(r*.5,W/2-.001,H/2-.001);
s.moveTo(x+c,y);s.lineTo(x+W-c,y);s.quadraticCurveTo(x+W,y,x+W,y+c);s.lineTo(x+W,y+H-c);s.quadraticCurveTo(x+W,y+H,x+W-c,y+H);s.lineTo(x+c,y+H);s.quadraticCurveTo(x,y+H,x,y+H-c);s.lineTo(x,y+c);s.quadraticCurveTo(x,y,x+c,y);
const dp=Math.max(.002,d-2*b),g=new TH.ExtrudeGeometry(s,{depth:dp,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:Math.max(1,sg(4)>>1),curveSegments:Math.max(2,sg(4))});g.translate(0,0,-dp/2);return g})}
const tor=(r,t,ax)=>memo('t'+r+'/'+t+'/'+ax+'/'+sg(18),()=>{const g=new TH.TorusGeometry(r,t,6,sg(24));return ax=='x'?g.rotateY(PI/2):ax=='y'?g.rotateX(PI/2):g});
const sph=(r,sx,sy,sz,ps,pl,ts,tl)=>memo('p'+[r,sx,sy,sz,ps,pl,ts,tl]+sg(18),()=>new TH.SphereGeometry(r,sg(18),sg(12),ps||0,pl||2*PI,ts||0,tl||PI).scale(sx,sy,sz));
// ---------- capacetes (origem no centro da cabeça, frente em +Z) ----------
function helmet(pil){
const g=new TH.Group(),col=pil.hc,hs=(pil.hs|0)%6,n=sg(18),
shell=memo('hm'+col,()=>new TH.MeshPhysicalMaterial({color:col,metalness:.25,roughness:.32,clearcoat:1,clearcoatRoughness:.06})),
vis=memo('vis',()=>new TH.MeshStandardMaterial({color:0x2a4468,metalness:1,roughness:.08,envMapIntensity:2.2})),
amber=memo('amb',()=>new TH.MeshStandardMaterial({color:0xd9902a,metalness:.9,roughness:.1,envMapIntensity:1.6})),
glow=memo('glw',()=>new TH.MeshBasicMaterial({color:0x4cf0ff})),
ac=STD(contrast(col),.2,.45),dk=STD(0x101114,.3,.6),skin=STD(pil.skin||0xe0ac69,0,.7);
const add=(geo,mat,x,y,z,rx,ry,rz,cast)=>{const m=new TH.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);if(rx||ry||rz)m.rotation.set(rx||0,ry||0,rz||0);if(cast)m.castShadow=true;g.add(m);return m};
switch(hs){
case 0:// redondo clássico
add(sph(.2,1,1.04,1.1),shell,0,0,0,0,0,0,true);add(sph(.207,1,1.04,1.1,PI/2-.95,1.9,.9,.65),vis);add(sph(.1,1.15,.75,1.1),shell,0,-.125,.14);
add(tor(.203,.011,'x'),ac);[1,-1].forEach(s=>add(tor(.194,.008,'x'),ac,s*.05,0,0));add(box(.05,.02,.06),dk,0,.208,.06);break;
case 1:// cubo arredondado
add(rbox(.36,.36,.4,.09),shell,0,0,0,0,0,0,true);add(box(.31,.085,.03),vis,0,.04,.205);add(rbox(.3,.1,.12,.05),shell,0,-.15,.16);
add(box(.07,.012,.41),ac,0,.181,0);[1,-1].forEach(s=>add(box(.01,.06,.12),dk,s*.181,-.02,-.05));break;
case 2:{// cilíndrico (lathe)
const lg=memo('lh'+n,()=>new TH.LatheGeometry([[0,-.2],[.15,-.19],[.19,-.12],[.19,.06],[.165,.15],[.1,.192],[0,.2]].map(p=>new TH.Vector2(p[0],p[1])),n));
add(lg,shell,0,0,0,0,0,0,true);add(memo('vc'+n,()=>new TH.CylinderGeometry(.196,.196,.09,n,1,true,-.95,1.9)),vis,0,.04,0);add(tor(.192,.012,'y'),ac,0,-.1,0);add(memo('cv'+n,()=>new TH.CylinderGeometry(.035,.035,.025,8)),dk,0,.2,0);break}
case 3:// integral (rua/pista)
add(sph(.2,.96,1.0,1.14),shell,0,0,0,0,0,0,true);add(sph(.207,.96,1.0,1.14,PI/2-1.05,2.1,.95,.6),vis);add(rbox(.26,.14,.22,.06),shell,0,-.125,.12);
add(box(.2,.03,.14),shell,0,.05,-.23,.3,0,0);add(box(.08,.03,.1),dk,0,.205,.04);[1,-1].forEach(s=>add(tor(.194,.008,'x'),ac,s*.06,0,0));break;
case 4:// retrô aberto com óculos
add(sph(.205,1,1,1.05,0,2*PI,0,PI*.58),shell,0,.02,0,0,0,0,true);add(sph(.17,.95,1.05,1),skin,0,-.03,.03);add(ball(.03,1,1,1.2),skin,0,-.04,.19);
[1,-1].forEach(s=>{add(memo('gl'+n,()=>new TH.CylinderGeometry(.062,.062,.05,n).rotateX(PI/2)),amber,s*.075,.02,.17);add(memo('gf'+n,()=>new TH.TorusGeometry(.066,.012,6,n)),dk,s*.075,.02,.2)});
add(tor(.2,.01,'y'),dk,0,.03,0);add(box(.07,.015,.02),dk,0,.02,.19);break;
case 5:// futurista com visor luminoso
add(sph(.2,.92,.98,1.2),shell,0,0,0,0,0,0,true);add(sph(.207,.92,.98,1.2,PI/2-.9,1.8,.95,.5),vis);add(sph(.209,.92,.98,1.2,PI/2-.75,1.5,1.13,.14),glow);
add(box(.025,.09,.32),ac,0,.2,-.02);[1,-1].forEach(s=>add(box(.012,.05,.1),dk,s*.186,-.02,-.05));add(rbox(.22,.1,.14,.05),shell,0,-.13,.13);break}
return g}
// ---------- logo do macacão ----------
const logoTex=su=>memo('lg'+su,()=>vCv(64,32,(x,w,h)=>{x.fillStyle='#'+new TH.Color(contrast(su)).getHexString();x.fillRect(0,0,w,h);x.fillStyle='#'+new TH.Color(su).getHexString();x.font='900 22px system-ui';x.textAlign='center';x.fillText('OR',w/2,24)}));
// ---------- peças do corpo ----------
const place=(()=>{const q=new TH.Vector3();return(m,A,B)=>{m.position.copy(A);q.subVectors(B,A);const l=q.length()||1e-4;m.scale.set(1,l,1);m.quaternion.setFromUnitVectors(Y,q.multiplyScalar(1/l))}})();
const _a=new TH.Vector3(),_b=new TH.Vector3(),_H=new TH.Vector3(),_S=new TH.Vector3(),_E=new TH.Vector3(),_P=new TH.Vector3(),_T=new TH.Vector3();
// cinemática inversa de 2 ossos: calcula o cotovelo E entre ombro S e mão H
function ik(S,H,l1,l2,pole,E){_a.subVectors(H,S);let d=_a.length();const mx=l1+l2-.003;if(d>mx){_a.multiplyScalar(mx/d);H.copy(S).add(_a);d=mx}if(d<.06)d=.06;_a.normalize();
const a=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-a*a));_b.copy(pole).addScaledVector(_a,-pole.dot(_a)).normalize();E.copy(S).addScaledVector(_a,a).addScaledVector(_b,h)}
function body(pil,standing){
const d=new TH.Group(),P={stand:!!standing},su=pil.su,suit=STD(su,.05,.8),ac=contrast(su),accM=STD(ac,.1,.55),dark=STD(0x15161b,.2,.65),glove=STD(0x202228,.1,.5),boot=STD(0x0d0e11,.1,.6),chrome=STD(0xdfe3ea,1,.15);
const M=(geo,mat,par,x,y,z,cast)=>{const m=new TH.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);if(cast)m.castShadow=true;(par||d).add(m);return m};
const sp=new TH.Group();sp.position.set(0,standing?.95:.12,0);d.add(sp);P.spine=sp;
M(ball(.5,.21,.11,.16),suit,d,0,standing?.93:.09,0,true);
M(memo('ch'+sg(18),()=>new TH.CylinderGeometry(.205,.165,.52,sg(18)).scale(1,1,.62)),suit,sp,0,.27,0,true);
M(memo('nk'+sg(10),()=>new TH.CylinderGeometry(.055,.06,.1,sg(10))),suit,sp,0,.56,0);M(tor(.07,.02,'y'),accM,sp,0,.52,0);
[1,-1].forEach(k=>{M(ball(.078),suit,sp,k*.22,.5,0,true);M(ball(.03,1,1,.6),accM,sp,k*.22,.55,.0)});
if(G.q>0){[1,-1].forEach(k=>{const s=M(box(.05,.52,.02),dark,sp,k*.1,.28,.13);s.rotation.z=-k*.1});M(box(.07,.07,.025),chrome,sp,0,.14,.14);M(box(.4,.045,.02),accM,sp,0,.4,.128);
const lg=new TH.Mesh(new TH.PlaneGeometry(.1,.05),new TH.MeshBasicMaterial({map:logoTex(su)}));lg.position.set(.1,.3,.1335);sp.add(lg)}
// cabeça
const hd=new TH.Group();hd.position.set(0,.58,0);sp.add(hd);P.head=hd;const hm=helmet(pil);hm.position.set(0,.15,.015);hd.add(hm);
// braços (articulados por IK)
[-1,1].forEach(k=>{P['u'+k]=M(limbG(.054,.046),suit,d,0,0,0,true);P['f'+k]=M(limbG(.046,.038),suit,d);P['e'+k]=M(ball(.048),suit,d);P['g'+k]=M(ball(.056,1,.9,1.1),glove,d);M(ball(.058,1,.5,1),accM,P['g'+k],0,.045,-.01)});
// pernas
const leg=(k,hip,knee,ank)=>{const t=M(limbG(.075,.058),suit,d,0,0,0,true),s=M(limbG(.058,.045),suit,d);place(t,hip,knee);place(s,knee,ank);M(ball(.06),suit,d,knee.x,knee.y,knee.z);
const b=M(rbox(.12,.1,.28,.04),boot,d,ank.x,ank.y-.035,ank.z+.06);b.rotation.x=standing?0:.25};
[-1,1].forEach(k=>{if(standing)leg(k,new TH.Vector3(k*.1,.93,0),new TH.Vector3(k*.1,.5,.03),new TH.Vector3(k*.1,.1,0));
else leg(k,new TH.Vector3(k*.1,.1,0),new TH.Vector3(k*.11,.2,.36),new TH.Vector3(k*.11,-.07,.58))});
d.userData.p=P;return d}
// ---------- animação ----------
function arms(P,H0,H1,sc){[-1,1].forEach(k=>{_S.set(k*.22,.5,0).applyEuler(P.spine.rotation).add(P.spine.position);_H.copy(k<0?H0:H1);_P.set(k*.55,-1,k>0&&P.stand?.1:-.3);
ik(_S,_H,.28,.26,_P,_E);place(P['u'+k],_S,_E);place(P['f'+k],_E,_H);P['e'+k].position.copy(_E);P['g'+k].position.copy(_H)})}
// piloto no volante: u = userData do carro; ds = estado de suavização
function drive(ds,g,dt,st,pa){const u=g.userData,d=u.dr;if(!d)return;const P=d.userData.p;if(!P||P.stand)return;const sw=u.sw;
ds.s=(ds.s||0)+(st-(ds.s||0))*Math.min(1,dt*9);const s=ds.s,sc=d.userData.sc||1;
if(sw)sw.rotation.z=s*1.7;d.rotation.set(0,0,0);
const lean=cl(-pa*.006,-.1,.16);P.spine.rotation.set(lean,0,-s*.07);P.head.rotation.set(-lean*.6,-s*.5,s*.08);
if(!sw)return;
const hands=[_T,_T];[-1,1].forEach(k=>{_a.set(k*.125,0,0).applyEuler(sw.rotation);_H.copy(sw.position).sub(d.position).add(_a).multiplyScalar(1/sc);
_S.set(k*.22,.5,0).applyEuler(P.spine.rotation).add(P.spine.position);_P.set(k*.55,-1,-.3);ik(_S,_H,.28,.26,_P,_E);
place(P['u'+k],_S,_E);place(P['f'+k],_E,_H);P['e'+k].position.copy(_E);P['g'+k].position.copy(_H)})}
const L0=new TH.Vector3(-.27,.9,.06),R0=new TH.Vector3(.17,1.0,.15),L1=new TH.Vector3(),R1=new TH.Vector3();
function idle(P,t){P.spine.scale.y=1+Math.sin(t*1.7)*.006;P.head.rotation.set(.05,Math.sin(t*.45)*.12+.5,0);
L1.copy(L0);L1.y+=Math.sin(t*1.5)*.012;R1.copy(R0);R1.y+=Math.sin(t*1.5+1)*.01;arms(P,L1,R1,1)}
// ---------- instalação ----------
const STAND=[];
window.mkDriver=function(pil){const d=body(pil,false),sc=cl((pil.room||.9)/1.0,.72,1);d.scale.setScalar(sc);d.userData.sc=sc;return d};
mkPilot=function(p){const d=body(p,true);d.rotation.y=-PI/2+.55;idle(d.userData.p,0);STAND.push(d);return d};
const _mc=mkCar;mkCar=function(S,col,pil){const g=_mc(S,col,pil),u=g.userData;if(u.dr&&u.dr.userData.p){u.ds={};drive(u.ds,g,0,0,0)}return g};
const _ph=phys;phys=function(c,dt,u){_ph(c,dt,u);const m=c.mesh.userData;if(m.dr){drive(m.ds||(m.ds={}),c.mesh,dt,u.st,c.pa||0)}};
const _bm=botMove;botMove=function(b,dt){_bm(b,dt);const u=b.mesh.userData;if(!u.dr)return;const ds=u.ds||(u.ds={});
if(ds.ph!=null&&dt>0){let dh=b.h-ds.ph;dh=Math.atan2(Math.sin(dh),Math.cos(dh));ds.rate=(ds.rate||0)+(-dh/dt*.45-(ds.rate||0))*Math.min(1,dt*6);const a=(b.v-(ds.pv||0))/dt;ds.pa=(ds.pa||0)+(a-(ds.pa||0))*Math.min(1,dt*4)}
ds.ph=b.h;ds.pv=b.v;if(Math.hypot(b.x-cam.position.x,b.z-cam.position.z)<60)drive(ds,b.mesh,dt,cl(ds.rate||0,-1,1),ds.pa||0)};
const _pa=parts;parts=function(dt){_pa(dt);if(state=='menu'&&prev&&prev.userData.dr){const u=prev.userData;drive(u.ds||(u.ds={}),prev,dt,Math.sin(vt*.9)*.3,0)}
for(let i=STAND.length-1;i>=0;i--){const d=STAND[i];if(!d.parent){STAND.splice(i,1);continue}idle(d.userData.p,vt)}};
// garagem: lista com os 6 modelos de capacete
const HN=['Redondo','Cubo','Cilíndrico','Integral','Retrô','Futurista'];
const _rg=renderGar;renderGar=function(){_rg();const el=$('garc');el.innerHTML=el.innerHTML.replace(/<div class="?row"?>\s*<b>Modelo do capacete<\/b>[\s\S]*?<\/div>/,row('Modelo do capacete','hs',HN))};
buildMenu();rs();
})();
