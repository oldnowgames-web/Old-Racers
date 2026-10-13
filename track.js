// ===== track.js : asfalto detalhado (remendos, rachaduras, trilhas de borracha, faixas) e poças na chuva =====
// Carregar DEPOIS de game.js. Reaproveita W.road criado pelo build() existente.
(function(){
'use strict';
const TH=THREE,PI=Math.PI;
const TONE=['#3a3b42','#5b5348','#30343b','#26262e','#2e2624','#45444b'];   // um tom de asfalto por pista
const cache={};
function asphalt(ti){return cache[ti]||(cache[ti]=vCv(512,512,(x,w,h)=>{
const wrap=f=>{f(0);f(h);f(-h)};
x.fillStyle=TONE[ti]||TONE[0];x.fillRect(0,0,w,h);
// granulado
for(let i=0;i<14000;i++){const v=R()<.5?255:0;x.fillStyle=`rgba(${v},${v},${v},${.03+R()*.07})`;x.fillRect(R()*w,R()*h,1+R()*2,1+R()*2)}
// remendos de reparo
for(let i=0;i<9;i++){const px=40+R()*(w-80),py=R()*h,pw=40+R()*110,ph=30+R()*120,l=R()<.5;wrap(o=>{x.fillStyle=l?'rgba(255,255,255,.05)':'rgba(0,0,0,.14)';x.fillRect(px,py+o,pw,ph);x.strokeStyle='rgba(0,0,0,.28)';x.lineWidth=1.5;x.strokeRect(px,py+o,pw,ph)})}
// trilhas de borracha das rodas
[.34,.66].forEach(c=>{const g=x.createLinearGradient(w*c-46,0,w*c+46,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,'rgba(0,0,0,.3)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(w*c-46,0,92,h)});
// manchas de óleo
for(let i=0;i<7;i++){const ox=w*(R()<.5?.34:.66)+(R()-.5)*50,oy=R()*h,r=10+R()*26;wrap(o=>{const g=x.createRadialGradient(ox,oy+o,0,ox,oy+o,r);g.addColorStop(0,'rgba(0,0,0,.4)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.beginPath();x.ellipse(ox,oy+o,r,r*1.5,0,0,7);x.fill()})}
// marcas de frenagem diagonais
for(let i=0;i<4;i++){const sx=w*(.3+R()*.4),sy=R()*h;wrap(o=>{x.strokeStyle='rgba(0,0,0,.2)';x.lineWidth=5+R()*4;x.beginPath();x.moveTo(sx,sy+o);x.quadraticCurveTo(sx+14,sy+60+o,sx+(R()-.5)*50,sy+150+o);x.stroke()})}
// linhas de borda e tracejado central (desgastados)
x.fillStyle='rgba(240,240,240,.92)';x.fillRect(12,0,14,h);x.fillRect(w-26,0,14,h);
x.fillStyle=ti==1?'rgba(235,205,120,.9)':'rgba(240,240,240,.9)';x.fillRect(w/2-5,0,10,128);x.fillRect(w/2-5,256,10,128);
for(let i=0;i<2200;i++){x.fillStyle=`rgba(${TONE[ti]?'40,40,44':'40,40,44'},${.2+R()*.5})`;const px=R()<.4?12+R()*14:R()<.5?w-26+R()*14:w/2-5+R()*10;x.fillRect(px,R()*h,1+R()*2,1+R()*3)}
}))}
const BUMP=vCv(256,256,(x,w,h)=>{x.fillStyle='#808080';x.fillRect(0,0,w,h);for(let i=0;i<9000;i++){const v=60+R()*140|0;x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(R()*w,R()*h,1+R()*2,1+R()*2)}});
// poças para a chuva
const PG=new TH.CircleGeometry(1,24).rotateX(-PI/2),PM=new TH.MeshStandardMaterial({color:0x0d1118,metalness:.3,roughness:.04,transparent:true,opacity:.72,envMapIntensity:1.8,polygonOffset:true,polygonOffsetFactor:-4,depthWrite:false});
const _b=build;build=function(ti){_b(ti);
const m=W.road&&W.road.material;if(m){m.map=asphalt(ti);m.bumpMap=BUMP;m.bumpScale=.35;m.color.set(0xffffff);m.needsUpdate=true}
W.pud=new TH.Group();const n=G.q==0?0:G.q==1?14:24;
for(let j=0;j<n;j++){const a=trk[R()*N|0],o=(R()-.5)*13,p=new TH.Mesh(PG,PM);p.position.set(a.x+a.nx*o,.045,a.z+a.nz*o);p.rotation.y=Math.atan2(a.tx,a.tz);p.scale.set(1.2+R()*2.2,1,2.5+R()*5);W.pud.add(p)}
world.add(W.pud);W.pud.visible=!!W.rain};
const _sw=setWx;setWx=function(){_sw();if(W.pud)W.pud.visible=!!W.rain};
buildMenu();rs();
})();
