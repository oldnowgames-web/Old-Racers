// ===== studio.js : garagem com estúdio (domo, piso refletivo, plataforma), arrastar para girar e zoom =====
// Carregar DEPOIS de game.js. O carro de preview sai do mundo e vai para a cena, para o cenário ser escondido na garagem.
(function(){
'use strict';
const TH=THREE,PI=Math.PI,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const S={az:.8,el:.18,zoom:1,drag:0,pts:new Map(),pd:0};
const st=new TH.Group();st.visible=false;scn.add(st);
const domeT=vCv(512,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#05070f');g.addColorStop(.55,'#141b30');g.addColorStop(.75,'#222c4a');g.addColorStop(1,'#0a0d18');x.fillStyle=g;x.fillRect(0,0,w,h);
for(let i=0;i<8;i++){const gx=x.createLinearGradient(i*64+10,0,i*64+54,0);gx.addColorStop(0,'rgba(120,170,255,0)');gx.addColorStop(.5,'rgba(150,200,255,.16)');gx.addColorStop(1,'rgba(120,170,255,0)');x.fillStyle=gx;x.fillRect(i*64+10,h*.25,44,h*.5)}});
const floorT=vCv(512,512,(x,w,h)=>{const g=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'#3a4560');g.addColorStop(.35,'#1a2032');g.addColorStop(1,'#06080e');x.fillStyle=g;x.fillRect(0,0,w,h)});
st.add(new TH.Mesh(new TH.SphereGeometry(17,32,16),new TH.MeshBasicMaterial({map:domeT,side:TH.BackSide,fog:false})));
const floor=new TH.Mesh(new TH.CircleGeometry(17,48).rotateX(-PI/2),new TH.MeshStandardMaterial({map:floorT,metalness:.7,roughness:.3,envMapIntensity:.5}));floor.position.y=.01;floor.receiveShadow=true;st.add(floor);
const plat=new TH.Mesh(new TH.CylinderGeometry(4.7,4.9,.16,64),new TH.MeshStandardMaterial({color:0x151922,metalness:.85,roughness:.2}));plat.position.y=.09;plat.receiveShadow=true;st.add(plat);
const ring=new TH.Mesh(new TH.TorusGeometry(4.7,.035,8,96).rotateX(PI/2),new TH.MeshBasicMaterial({color:0x00e5ff}));ring.position.y=.175;st.add(ring);
const ring2=new TH.Mesh(new TH.TorusGeometry(3.3,.015,8,96).rotateX(PI/2),new TH.MeshBasicMaterial({color:0xff2d75}));ring2.position.y=.172;st.add(ring2);
// luzes de estúdio (ficam na cena com intensidade 0 fora da garagem, para não recompilar shaders no meio do jogo)
const L1=new TH.PointLight(0x00e5ff,0,40),L2=new TH.PointLight(0xff2d75,0,40),L3=new TH.SpotLight(0xffffff,0,60,.55,.7,1);scn.add(L1,L2,L3,L3.target);
// carro de preview vive na cena (não no mundo)
const _mp=mkPrev;mkPrev=function(){if(prev&&prev.parent===scn)scn.remove(prev);_mp();scn.add(prev)};
const _cl=clear;clear=function(){if(prev&&prev.parent===scn)scn.remove(prev);_cl()};
// câmera da garagem: orbita sozinha, arrasto gira e inclina, roda do mouse e pinça dão zoom
const _mu=menuUpd;menuUpd=function(dt,t){if(cur!='gar'||!prev)return _mu(dt,t);
bots.forEach(b=>botMove(b,dt));if(!S.drag)S.az+=dt*.25;
const p=prev.position,r=(innerWidth<innerHeight?12:8)*S.zoom,e=S.el;cam.fov=45;cam.setViewOffset(innerWidth,innerHeight,-innerWidth*.2,0,innerWidth,innerHeight);cam.updateProjectionMatrix();
cam.position.set(p.x+Math.cos(S.az)*r*Math.cos(e),1.1+Math.sin(e)*r*.9+.6,p.z+Math.sin(S.az)*r*Math.cos(e));cam.lookAt(p.x,1,p.z)};
const _pa=parts;parts=function(dt){_pa(dt);const g=state=='menu'&&cur=='gar'&&prev;world.visible=!g;st.visible=!!g;
if(g){const p=prev.position;st.position.set(p.x,0,p.z);prev.position.y=.17;const k=G.q>0?1:0;L1.intensity=1.4*k;L2.intensity=1.2*k;L3.intensity=1.6*k;
L1.position.set(p.x+7,3.5,p.z-6);L2.position.set(p.x-7,3,p.z+6);L3.position.set(p.x+3,11,p.z+5);L3.target.position.copy(p);lf.style.opacity=0}
else{if(prev)prev.position.y=0;L1.intensity=L2.intensity=L3.intensity=0}};
const g=$('gar');g.style.touchAction='none';
g.addEventListener('pointerdown',e=>{if(e.target!==g)return;try{g.setPointerCapture(e.pointerId)}catch(_){}S.pts.set(e.pointerId,{x:e.clientX,y:e.clientY});S.drag=1;S.pd=0});
g.addEventListener('pointermove',e=>{const o=S.pts.get(e.pointerId);if(!o)return;const dx=e.clientX-o.x,dy=e.clientY-o.y;o.x=e.clientX;o.y=e.clientY;
if(S.pts.size>=2){const v=[...S.pts.values()],d=Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y);if(S.pd)S.zoom=cl(S.zoom*S.pd/d,.6,1.25);S.pd=d}
else{S.az-=dx*.008;S.el=cl(S.el+dy*.004,.02,.65)}});
const up=e=>{S.pts.delete(e.pointerId);if(!S.pts.size)S.drag=0;S.pd=0};g.addEventListener('pointerup',up);g.addEventListener('pointercancel',up);
g.addEventListener('wheel',e=>{if(e.target!==g)return;S.zoom=cl(S.zoom*(1+e.deltaY*.0012),.6,1.25);e.preventDefault()},{passive:false});
buildMenu();rs();
})();
