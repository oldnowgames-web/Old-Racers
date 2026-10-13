// ===== finish.js : acabamentos de pintura (metálico, perolado, fosco, camaleão) e adesivos, escolhidos na garagem =====
// Carregar DEPOIS de game.js e cars.js. Não altera cars.js: usa u.paint (material da pintura) e projeta os adesivos na carroceria por raycast.
(function(){
'use strict';
const TH=THREE,PI=Math.PI;
const FN=['Normal','Metálico','Perolado','Fosco','Camaleão'],DN=['Nenhum','Listras','Faixa lateral','Chamas','Relâmpago','Xadrez'];
G.fin=0;G.dec=0;try{G.fin=+localStorage.getItem('trf')||0;G.dec=+localStorage.getItem('trd')||0}catch(e){}
if(!(G.fin>=0&&G.fin<FN.length))G.fin=0;if(!(G.dec>=0&&G.dec<DN.length))G.dec=0;
// ---------- acabamentos ----------
// brilho de borda: soma um reflexo claro nas laterais da carroceria (1 pow por pixel, sem luz extra)
const RIM=f=>f.replace('#include <tonemapping_fragment>','{float rm=pow(1.0-abs(dot(normalize(vNormal),normalize(vViewPosition))),3.0);gl_FragColor.rgb+=vec3(.55,.68,.9)*rm*.22;}\n#include <tonemapping_fragment>');
function finish(m,col,fin){
switch(fin){
case 1:m.metalness=.92;m.roughness=.16;m.clearcoat=1;m.clearcoatRoughness=.03;m.envMapIntensity=1.5;break;
case 2:m.color.lerp(new TH.Color(0xffffff),.35);m.metalness=.3;m.roughness=.22;m.clearcoat=1;m.clearcoatRoughness=.02;m.sheen=new TH.Color(0xfff0ff);m.envMapIntensity=1.3;break;
case 3:m.metalness=.05;m.roughness=.8;m.clearcoat=0;m.envMapIntensity=.4;break;
case 4:{const alt=new TH.Color(col).offsetHSL(.38,.1,0);m.metalness=.85;m.roughness=.2;m.clearcoat=1;m.clearcoatRoughness=.03;
m.onBeforeCompile=sh=>{sh.uniforms.altC={value:alt};sh.fragmentShader=RIM(sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 altC;').replace('#include <color_fragment>','#include <color_fragment>\n{float fr=pow(1.0-abs(dot(normalize(vNormal),normalize(vViewPosition))),1.6);diffuseColor.rgb=mix(diffuseColor.rgb,altC,clamp(fr*1.6,0.,1.));}'))};
m.customProgramCacheKey=()=>'cham';break}}
if(fin!=4){m.onBeforeCompile=sh=>{sh.fragmentShader=RIM(sh.fragmentShader)};m.customProgramCacheKey=()=>'rim'}
m.needsUpdate=true}
// ---------- texturas dos adesivos laterais (a frente do carro fica à ESQUERDA da imagem) ----------
const TEX={};const hex=c=>'#'+new TH.Color(c).getHexString();
function tex(kind,c){const k=kind+c;return TEX[k]||(TEX[k]=vCv(256,64,(x,w,h)=>{const a=hex(c);
if(kind==3){const g=x.createLinearGradient(0,h,0,0);g.addColorStop(0,a);g.addColorStop(.6,'#ff9a1a');g.addColorStop(1,'#ffe45a');x.fillStyle=g;
for(let j=0;j<6;j++){const b=250-j*42,t=10+(j%3)*8;x.beginPath();x.moveTo(b,h);x.bezierCurveTo(b-20,h-14,b-60,h-24,b-110,t);x.bezierCurveTo(b-70,h-34,b-52,h-44,b-46,h);x.closePath();x.fill()}}
else if(kind==4){x.fillStyle=a;x.strokeStyle='#fff';x.lineWidth=5;x.beginPath();[[196,2],[110,2],[66,34],[104,34],[58,62],[160,26],[122,26]].forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.stroke();x.fill()}
else if(kind==2){const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.12,a);g.addColorStop(.88,a);g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,14,w,16);x.fillRect(0,38,w,8)}
else{for(let i=0;i<16;i++)for(let j=0;j<4;j++){x.fillStyle=(i+j)%2?a:'#f4f4f4';x.fillRect(i*16,j*16,16,16)}}}))}
// ---------- projeção na carroceria ----------
const RC=new TH.Raycaster(),V0=new TH.Vector3(),V1=new TH.Vector3();
const hit=(ms,ox,oy,oz,dx,dy,dz)=>{RC.set(V0.set(ox,oy,oz),V1.set(dx,dy,dz));const h=RC.intersectObjects(ms,false);return h.length?h[0]:null};
function ribbon(ms,x,w,z0,z1,n,mat){const pos=[],idx=[];let py=.8;
for(let i=0;i<=n;i++){const z=z0+(z1-z0)*i/n;for(const dx of[-w/2,w/2]){const h=hit(ms,x+dx,4,z,0,-1,0);let y=h&&h.face.normal.y>.15?h.point.y:py;if(Math.abs(y-py)>.25)y=py;py=y;pos.push(x+dx,y+.012,z)}}
for(let i=0;i<n;i++){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3)}
const g=new TH.BufferGeometry();g.setAttribute('position',new TH.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return new TH.Mesh(g,mat)}
function side(ms,g,kind,c,len,hg,y,zc){const m=new TH.MeshStandardMaterial({map:tex(kind,c),transparent:true,alphaTest:.05,roughness:.4,metalness:.1,side:TH.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3});
[1,-1].forEach(s=>{const h=hit(ms,s*6,y,zc,-s,0,0);if(!h)return;const p=new TH.Mesh(new TH.PlaneGeometry(len,hg),m);p.position.set(h.point.x+s*.014,y,zc);p.rotation.y=s*PI/2;if(s<0)p.scale.x=-1;g.add(p)})}
function decal(g,u,S,col,kind,c){g.updateMatrixWorld(true);const ms=[];g.traverse(o=>{if(o.isMesh&&o.material===u.paint&&o.geometry.attributes.position.count>200)ms.push(o)});if(!ms.length)return;
const cc=new TH.Color(c),bc=new TH.Color(col);if(Math.abs(cc.r-bc.r)+Math.abs(cc.g-bc.g)+Math.abs(cc.b-bc.b)<.45)c=bc.r*.3+bc.g*.6+bc.b*.1>.5?0x15171c:0xf2f2f2;
const L=S.l,hl=L/2;
if(kind==1){const mat=new TH.MeshStandardMaterial({color:c,roughness:.35,metalness:.2,side:TH.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3});[-1,1].forEach(s=>g.add(ribbon(ms,s*.14,.15,hl*.9,-hl*.86,26,mat)))}
else if(kind==2)side(ms,g,2,c,L*.62,.15,.46,0);
else if(kind==3)side(ms,g,3,c,L*.44,.34,.5,hl*.34);
else if(kind==4)side(ms,g,4,c,L*.34,.3,.56,0);
else side(ms,g,5,c,L*.58,.12,.4,-L*.02)}
// ---------- instalação ----------
const SPLANE=new TH.PlaneGeometry(1,1).rotateX(-PI/2),SMAT=new TH.MeshBasicMaterial({map:GT,color:0x000000,transparent:true,opacity:.42,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
let PREV=0;
const _mp=mkPrev;mkPrev=function(){PREV=1;try{_mp()}finally{PREV=0}};
const _mc=mkCar;mkCar=function(S,col,pil){const g=_mc(S,col,pil),u=g.userData;if(!u.paint)return g;
const mine=PREV||(pil&&pil.lamp);let fin,dec,dc;
if(mine){fin=G.fin;dec=G.dec;dc=COLS[G.hc]}else{fin=[0,0,0,1,1,2,3,4][R()*8|0];dec=R()<.35?1+(R()*5|0):0;dc=COLS[R()*COLS.length|0]}
finish(u.paint,col,fin);{const sh=new TH.Mesh(SPLANE,SMAT);sh.scale.set(S.w*1.9,1,S.l*1.3);sh.position.y=.03;g.add(sh)}if(dec)try{decal(g,u,S,col,dec,dc)}catch(e){}
return g};
// garagem: linhas novas "Acabamento" e "Adesivo"
const _rg=renderGar;renderGar=function(){_rg();const el=$('garc');el.innerHTML=el.innerHTML.replace(/<div class="?row"?>\s*<b>Capacete<\/b>/,m=>row('Acabamento','fin',FN)+row('Adesivo','dec',DN)+m)};
const _pk=pick;pick=function(k,i){_pk(k,i);if(k=='fin'||k=='dec'){try{localStorage.setItem(k=='fin'?'trf':'trd',i)}catch(e){}if(state=='menu')mkPrev()}};
buildMenu();rs();
})();
