// ===== cars.js : carros modelados (carroceria por seções, rodas detalhadas, 10 estilos) =====
// Carregar DEPOIS do game.js. Substitui mkCar por uma versão única e preserva o contrato de userData:
// wh[{p,s,f,bl}], fl, dr, lamp, hb, tl, tg, bd, sw (volante)
(function(){
'use strict';
const TH=THREE,PI=Math.PI,rnd=Math.random;
const lerp=(a,b,t)=>a+(b-a)*t;
// interpolação cúbica (Hermite) por pontos-chave [[z,v],...]
function interp(kp,z){const n=kp.length;if(z<=kp[0][0])return kp[0][1];if(z>=kp[n-1][0])return kp[n-1][1];let i=1;while(z>kp[i][0])i++;
const a=kp[i-1],b=kp[i],h=b[0]-a[0],t=(z-a[0])/h,m0=i>1?(b[1]-kp[i-2][1])/(b[0]-kp[i-2][0]):(b[1]-a[1])/h,m1=i<n-1?(kp[i+1][1]-a[1])/(kp[i+1][0]-a[0]):(b[1]-a[1])/h,t2=t*t,t3=t2*t;
return(2*t3-3*t2+1)*a[1]+(t3-2*t2+t)*h*m0+(-2*t3+3*t2)*b[1]+(t3-t2)*h*m1}
// cache de geometrias
const GC={};const gc=(k,f)=>GC[k]||(GC[k]=f());
const Bx=(w,h,d)=>gc('b'+w+'/'+h+'/'+d,()=>new TH.BoxGeometry(w,h,d));
const CZ=(r,h,s)=>gc('cz'+r+'/'+h+'/'+s,()=>new TH.CylinderGeometry(r,r,h,s).rotateX(PI/2));   // eixo Z
const CX=(r,h,s)=>gc('cx'+r+'/'+h+'/'+s,()=>new TH.CylinderGeometry(r,r,h,s).rotateZ(PI/2));   // eixo X
const SP=(r,sx,sy,sz)=>gc('sp'+r+'/'+sx+'/'+sy+'/'+sz,()=>new TH.SphereGeometry(r,14,10).scale(sx,sy,sz));
// carroceria: seções [z,hw,yb,yt,n] (superelipse) ligadas em malha suave
function loft(secs,seg){const R=secs.length,P=new Float32Array(R*seg*3),I=[];
secs.forEach((s,i)=>{const z=s[0],hw=s[1],yb=s[2],yt=s[3],e=2/s[4],cy=(yb+yt)/2,hh=Math.max(.001,(yt-yb)/2);
for(let j=0;j<seg;j++){const a=j/seg*2*PI,c=Math.cos(a),sn=Math.sin(a),k=(i*seg+j)*3;P[k]=Math.sign(c)*Math.pow(Math.abs(c),e)*hw;P[k+1]=cy+Math.sign(sn)*Math.pow(Math.abs(sn),e)*hh;P[k+2]=z}});
for(let i=0;i<R-1;i++)for(let j=0;j<seg;j++){const a=i*seg+j,b=i*seg+(j+1)%seg,c=(i+1)*seg+(j+1)%seg,d=(i+1)*seg+j;I.push(a,b,c,a,c,d)}
const g=new TH.BufferGeometry();g.setAttribute('position',new TH.BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();return g}
// junta várias geometrias (cada uma com sua matriz) em uma só
function mergeG(list){const gs=list.map(([g,m])=>{const t=g.index?g.toNonIndexed():g.clone();t.applyMatrix4(m);return t});let n=0;gs.forEach(g=>n+=g.attributes.position.count);
const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2);let o=0;
gs.forEach(g=>{P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);if(g.attributes.uv)U.set(g.attributes.uv.array,o*2);o+=g.attributes.position.count});
const r=new TH.BufferGeometry();r.setAttribute('position',new TH.BufferAttribute(P,3));r.setAttribute('normal',new TH.BufferAttribute(N,3));r.setAttribute('uv',new TH.BufferAttribute(U,2));return r}
const MX=new TH.Matrix4(),MY=new TH.Matrix4();
const mat4=(tx,ty,tz,rx)=>{MX.makeTranslation(tx,ty,tz);if(rx){MY.makeRotationX(rx);MY.multiply(MX);return MY.clone()}return MX.clone()};
// materiais e texturas
const SM=(c,m,r,o)=>new TH.MeshStandardMaterial(Object.assign({color:c,metalness:m,roughness:r},o||{}));
const TREAD=vCv(64,64,x=>{x.fillStyle='#17181b';x.fillRect(0,0,64,64);x.fillStyle='#0b0b0d';for(let i=0;i<8;i++){x.fillRect(i*8+1,14,4,36)}x.fillStyle='#222428';x.fillRect(0,28,64,3);x.fillRect(0,34,64,3)});
TREAD.repeat.set(3,1);
const CFT=vCv(16,16,x=>{x.fillStyle='#131418';x.fillRect(0,0,16,16);x.fillStyle='#2b2e36';for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i+j)%2)x.fillRect(i*4,j*4,4,4)});CFT.repeat.set(4,4);
const SHT=vCv(64,64,x=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(0,0,0,.85)');g.addColorStop(.6,'rgba(0,0,0,.35)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64)});
const MAT={dark:SM(0x101114,.35,.55),black:SM(0x060708,.1,.85),chrome:SM(0xdfe3ea,1,.12),gun:SM(0x3a3d45,.9,.3),rubber:SM(0x0c0c0e,0,.9,{map:TREAD}),carbon:SM(0xffffff,.5,.35,{map:CFT}),
glass:new TH.MeshStandardMaterial({color:0x0a1422,metalness:.85,roughness:.06,transparent:true,opacity:.62}),seat:SM(0x1b1c21,.1,.8),red:SM(0xd01020,.3,.4),
lens:new TH.MeshStandardMaterial({color:0xffffff,emissive:0xfff2c0,emissiveIntensity:1.4}),led:new TH.MeshBasicMaterial({color:0xcfefff}),cyan:new TH.MeshBasicMaterial({color:0x4cf0ff}),white:SM(0xf2f2f2,.1,.5)};
// ===== rodas =====
function wheelParts(spk,wr,seg,fat){const k='w'+spk+'/'+wr+'/'+seg+'/'+fat;return gc(k,()=>{const s=wr/.34;
// perfil do pneu (raio, posição axial)
const prof=[[.215,-.5],[.27,-.52],[.32,-.46],[.345,-.3],[.35,0],[.345,.3],[.32,.46],[.27,.52],[.215,.5]].map(p=>new TH.Vector2(p[0]*s,p[1]*fat*.62));
const tire=new TH.LatheGeometry(prof,seg).rotateZ(PI/2);
const L=[];const rr=.225*s;
L.push([new TH.TorusGeometry(rr,.022,8,seg).rotateY(PI/2),mat4(.12*fat*2,0,0)]);
if(spk>0){const sw=spk>=10?.035:spk>=8?.05:.075,dp=.03;for(let i=0;i<spk;i++){const g=new TH.BoxGeometry(dp,rr*.86,sw);g.translate(0,rr*.5,0);g.rotateX(i/spk*2*PI);L.push([g,mat4(.115*fat*2,0,0)])}
L.push([new TH.CylinderGeometry(.07*s,.07*s,.05,14).rotateZ(PI/2),mat4(.125*fat*2,0,0)])}
else L.push([new TH.CylinderGeometry(rr,rr,.03,seg).rotateZ(PI/2),mat4(.125*fat*2,0,0)]);
const rim=mergeG(L);
const barrel=new TH.CylinderGeometry(rr*.98,rr*.98,.2*fat*2,seg).rotateZ(PI/2);
const disc=new TH.CylinderGeometry(.17*s,.17*s,.03,seg).rotateZ(PI/2);
return{tire,rim,barrel,disc}})}
// ===== estilos (perfil de altura / largura / cabine por carro) =====
const DEF={top:[[-1,-.22],[-.9,-.12],[-.66,-.02],[-.2,0],[.2,0],[.5,-.03],[.66,-.01],[.84,-.12],[1,-.26]],
wid:[[-1,.16],[-.97,.6],[-.9,.86],[-.72,.99],[-.5,.95],[0,.93],[.5,.95],[.72,.99],[.9,.88],[.97,.64],[1,.18]],
low:[[-1,.42],[-.92,.31],[-.6,.27],[.6,.27],[.92,.31],[1,.44]],nprof:[[-1,2.6],[-.9,3.4],[-.76,5.5],[-.66,7],[-.54,5.5],[-.35,4],[0,3.6],[.35,4],[.54,5.5],[.66,7],[.76,5.5],[.9,3.4],[1,2.6]],
cab:{c0:-.5,c1:.15,pk:0.45,w:.78,k:[[0,0],[.1,.55],[.28,.92],[.45,1],[.7,1],[.86,.62],[1,0]]},
rim:5,wr:.34,fat:1,hl:'round',tl:'twin',ex:2,roof:1,lift:0,stripes:0,gl:.0};
const STY={
gt:{top:[[-1,-.26],[-.88,-.14],[-.6,-.06],[-.25,0],[.2,0],[.5,-.06],[.66,-.04],[.8,-.16],[1,-.3]],cab:{c0:-.6,c1:.08,pk:0.43,w:.8,k:[[0,0],[.15,.5],[.3,.85],[.5,1],[.72,1],[.88,.6],[1,0]]},rim:5,hl:'round',tl:'twin',ex:2},
muscle:{top:[[-1,-.16],[-.9,-.06],[-.5,0],[.5,0],[.66,.02],[.82,-.06],[1,-.16]],wid:[[-1,.2],[-.97,.66],[-.9,.9],[-.72,1],[-.5,.97],[0,.95],[.5,.97],[.72,1],[.9,.92],[.97,.7],[1,.22]],cab:{c0:-.5,c1:.1,pk:0.41,w:.82,k:[[0,0],[.08,.7],[.2,1],[.7,1],[.85,.7],[1,0]]},rim:5,hl:'quad',tl:'twin',ex:2,stripes:1},
hatch:{top:[[-1,-.28],[-.9,-.08],[-.6,0],[.3,0],[.55,-.02],[.78,-.12],[1,-.32]],cab:{c0:-.72,c1:.28,pk:0.41,w:.86,k:[[0,0],[.05,.85],[.12,1],[.75,1],[.9,.6],[1,0]]},rim:6,wr:.32,hl:'round',tl:'twin',ex:1},
sedan:{top:[[-1,-.1],[-.85,0],[-.5,0],[.1,0],[.5,-.04],[.66,-.02],[.85,-.14],[1,-.26]],cab:{c0:-.42,c1:.2,pk:0.45,w:.8,k:[[0,0],[.08,.7],[.25,1],[.7,1],[.9,.55],[1,0]]},rim:10,hl:'slit',tl:'bar',ex:4},
super:{top:[[-1,-.28],[-.8,-.1],[-.4,0],[.2,-.02],[.55,-.1],[.66,-.08],[.85,-.2],[1,-.32]],wid:[[-1,.2],[-.97,.64],[-.9,.9],[-.72,1.04],[-.5,.98],[0,.9],[.5,.96],[.72,1.04],[.9,.9],[.97,.62],[1,.18]],cab:{c0:-.35,c1:.4,pk:0.37,w:.7,k:[[0,0],[.15,.7],[.35,1],[.55,1],[.8,.5],[1,0]]},rim:10,wr:.34,fat:1.15,hl:'slit',tl:'slits',ex:2,stripes:1},
rally:{top:[[-1,-.26],[-.9,-.1],[-.6,0],[.3,0],[.55,-.02],[.78,-.1],[1,-.26]],cab:{c0:-.62,c1:.26,pk:0.41,w:.84,k:[[0,0],[.06,.8],[.15,1],[.7,1],[.88,.6],[1,0]]},rim:8,wr:.36,lift:.05,hl:'round',tl:'quad',ex:1,stripes:1},
ev:{top:[[-1,-.2],[-.7,-.04],[0,0],[.45,-.04],[.66,-.04],[1,-.24]],cab:{c0:-.6,c1:.42,pk:0.43,w:.84,k:[[0,0],[.2,.8],[.4,1],[.6,1],[.85,.6],[1,0]]},rim:0,hl:'strip',tl:'bar',ex:0,roof:0,stripes:1},
truck:{top:[[-1,-.24],[-.93,-.22],[-.16,-.22],[-.04,0],[.5,0],[.66,.02],[.85,-.08],[1,-.22]],cab:{c0:-.1,c1:.5,pk:0.53,w:.86,k:[[0,0],[.04,.9],[.12,1],[.8,1],[.93,.7],[1,0]]},rim:6,wr:.42,lift:.1,fat:1.2,hl:'round',tl:'twin',ex:2},
drift:{top:[[-1,-.24],[-.88,-.12],[-.6,-.04],[-.25,0],[.2,0],[.5,-.06],[.66,-.04],[.82,-.15],[1,-.28]],wid:[[-1,.2],[-.97,.66],[-.9,.92],[-.72,1.07],[-.5,.96],[0,.92],[.5,.96],[.72,1.07],[.9,.94],[.97,.66],[1,.2]],cab:{c0:-.5,c1:.12,pk:0.41,w:.76,k:[[0,0],[.12,.55],[.3,.9],[.5,1],[.72,1],[.88,.6],[1,0]]},rim:6,fat:1.25,hl:'slit',tl:'bar',ex:2,stripes:1},
hyper:{top:[[-1,-.26],[-.7,-.08],[-.2,0],[.3,-.04],[.66,-.06],[.85,-.18],[1,-.3]],wid:[[-1,.18],[-.97,.62],[-.9,.88],[-.72,1.02],[-.5,.94],[0,.88],[.5,.94],[.72,1.02],[.9,.86],[.97,.58],[1,.16]],cab:{c0:-.4,c1:.38,pk:0.37,w:.68,k:[[0,0],[.12,.6],[.32,1],[.6,1],[.85,.55],[1,0]]},rim:5,wr:.34,fat:1.1,hl:'slit',tl:'slits',ex:4,stripes:1}};
Object.keys(STY).forEach(k=>{const s=STY[k];STY[k]=Object.assign({},DEF,s);if(s.cab)STY[k].cab=Object.assign({},DEF.cab,s.cab)});
['gt','muscle','hatch','sedan','super','rally','ev','truck','drift','hyper'].forEach((k,i)=>{if(CARS[i])CARS[i].body=k});
// ===== piloto básico (a etapa 2 substitui window.mkDriver) =====
window.mkDriver=function(pil){const d=new TH.Group(),M=c=>new TH.MeshLambertMaterial({color:c}),hg=pil.hs==0?new TH.SphereGeometry(.2,12,10):pil.hs==1?new TH.BoxGeometry(.34,.34,.38):new TH.CylinderGeometry(.17,.21,.4,12);
const h=new TH.Mesh(hg,M(pil.hc)),t=new TH.Mesh(Bx(.5,.4,.3),M(pil.su));h.position.y=.55;t.position.y=.2;d.add(h,t);return d};
// ===== o carro =====
const NUM={};const numTex=n=>NUM[n]||(NUM[n]=vCv(64,64,x=>{x.fillStyle='#fff';x.beginPath();x.arc(32,32,30,0,7);x.fill();x.fillStyle='#111';x.font='900 34px system-ui';x.textAlign='center';x.fillText(n,32,44)}));
const LOFTC={};
function mk(S,col,pil){
const key=S.body||'gt',P=STY[key]||STY.gt,L=S.l,W=S.w,H=S.h,hl=L/2,hwh=W/2,bt0=.34+H*.8+P.lift,seg=G.q==0?14:G.q==1?20:28,tseg=G.q==0?16:G.q==1?24:32;
const g=new TH.Group();g.rotation.order='YXZ';const u=g.userData;
const A=(geo,mat,x,y,z,rx,ry,rz,cast)=>{const m=new TH.Mesh(geo,mat);m.position.set(x,y,z);if(rx||ry||rz)m.rotation.set(rx||0,ry||0,rz||0);if(cast)m.castShadow=true;g.add(m);return m};
const hwAt=z=>hwh*interp(P.wid,z/hl),lowAt=z=>interp(P.low,z/hl),topAt=z=>bt0+interp(P.top,z/hl),nAt=z=>interp(P.nprof,z/hl);
const cb=P.cab,c0=cb.c0*hl,c1=cb.c1*hl,cwAt=(z)=>{const uu=(z-c0)/(c1-c0);return hwh*cb.w*interp([[0,.74],[.5,1],[1,.84]],uu)};
const sxAt=(z,y)=>{const hw=hwAt(z),yb=lowAt(z),yt=topAt(z),cy=(yb+yt)/2,hh=(yt-yb)/2,s=Math.min(.995,Math.abs((y-cy)/hh)),nn=nAt(z);return hw*Math.pow(1-Math.pow(s,nn),1/nn)};
const roofY=bt0+cb.pk,zc=uu=>lerp(c0,c1,uu);
// pintura e carroceria
const paint=new TH.MeshPhysicalMaterial({color:col,metalness:.5,roughness:.3,clearcoat:1,clearcoatRoughness:.05});u.paint=paint;
const ZS=[-1,-.99,-.96,-.91,-.84,-.74,-.62,-.5,-.36,-.2,-.05,.1,.25,.4,.54,.66,.76,.84,.91,.96,.99,1];
const bg=gc('B'+key+W+L+H+seg,()=>loft(ZS.map(f=>{const z=f*hl;return[z,hwAt(z),lowAt(z),topAt(z),nAt(z)]}),seg));
A(bg,paint,0,0,0,0,0,0,true);
const NC=18,cs=[];for(let i=0;i<=NC;i++){const uu=i/NC,z=lerp(c0,c1,uu),ch=Math.max(.012,cb.pk*interp(cb.k,uu));cs.push([z,cwAt(z),topAt(z)-.07,topAt(z)+ch,3.2])}
A(gc('C'+key+W+L+H+seg,()=>loft(cs,Math.max(14,seg-4))),MAT.glass,0,0,0);
if(P.roof){let ua=-1,ub=-1;for(let i=0;i<=NC;i++){if(cb.pk*interp(cb.k,i/NC)>=cb.pk*.94){if(ua<0)ua=i;ub=i}}
if(ua>=0){const rs=[],NR=12;for(let i=0;i<=NR;i++){const uu=lerp(ua/NC,ub/NC,i/NR),z=lerp(c0,c1,uu),ch=cb.pk*interp(cb.k,uu),tp=[.35,.75,1,1,1,1,1,1,1,1,1,.75,.35][i];rs.push([z,cwAt(z)*.93*tp,topAt(z)+ch-.05,topAt(z)+ch+.012,3])}
A(gc('R'+key+W+L+H,()=>loft(rs,14)),paint,0,0,0,0,0,0,true)}}
// listras de corrida (capô e traseira)
if(P.stripes||S.st){const sc=new TH.MeshStandardMaterial({color:(col==0xffffff||col==0xf4c430)?0x111111:0xf5f5f5,metalness:.2,roughness:.4}),mkS=(za,zb)=>{const ss=[],n=8;for(let i=0;i<=n;i++){const z=lerp(za,zb,i/n),tp=topAt(z),t=i==0||i==n?.5:1;ss.push([z,.13*t*(W/1.8),tp-.03,tp+.008,6])}return loft(ss,10)};
A(gc('S1'+key+W+L,()=>mkS(c1+.04,hl*.95)),sc,0,0,0);A(gc('S2'+key+W+L,()=>mkS(-hl*.95,c0-.04)),sc,0,0,0)}
// base escura, soleiras, spoiler frontal e difusor
A(Bx(W*.8,.05,L*.9),MAT.black,0,.27,0);
[1,-1].forEach(s=>{A(Bx(.05,.1,L*.46),MAT.dark,s*(hwAt(0)*.97),.31,0);});
A(Bx(W*.7,.03,.2),MAT.carbon,0,.255,hl-.01,.0,0,0);A(Bx(W*.62,.1,.26),MAT.carbon,0,.34,-hl+.06,-.35,0,0);
for(let i=-2;i<=2;i++)A(Bx(.02,.1,.24),MAT.dark,i*W*.1,.34,-hl+.06,-.35);
// ===== rodas =====
const wr=P.wr,wp=wheelParts(P.rim,wr,tseg,P.fat),wz=hl*.66,wheels=[],bdm=SM(0x9aa0a8,1,.35),rimM=P.rim==0||key=='rally'?MAT.gun:key=='truck'?MAT.chrome:MAT.chrome;u.bd=bdm;
const archR=wr+.03;
[[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([sd,sz])=>{const z=sz*wz,xs=sxAt(z,wr),p=new TH.Group(),s=new TH.Group();p.position.set(sd*(xs-.075),.38,z);const wo=new TH.Group();wo.position.y=wr-.38;p.add(wo);wo.add(s);
const t=new TH.Mesh(wp.tire,MAT.rubber);t.castShadow=true;s.add(t,new TH.Mesh(wp.rim,rimM),new TH.Mesh(wp.barrel,MAT.dark),new TH.Mesh(wp.disc,bdm));if(sd<0)s.scale.x=-1;
const cal=new TH.Mesh(Bx(.06,.13,.2),MAT.red);cal.position.set(sd*.05,wr*.6,-.02);wo.add(cal);
const bm=new TH.MeshBasicMaterial({color:0x15161a,transparent:true,opacity:0,depthWrite:false}),bl=new TH.Mesh(CX(wr*.98,.2,16),bm);wo.add(bl);
g.add(p);wheels.push({p,s,f:sz>0,bl:bm});
// arco da roda (disco escuro ao redor do pneu)
const arch=new TH.Mesh(new TH.CircleGeometry(archR,tseg),MAT.black);arch.rotation.y=sd*PI/2;arch.position.set(sd*(xs+.008),wr,z);g.add(arch);
const fe=new TH.Mesh(gc('fe'+archR+tseg,()=>new TH.TorusGeometry(archR+.025,.04,6,tseg,PI).rotateY(PI/2)),paint);fe.position.set(sd*(xs-.005),wr,z);fe.castShadow=true;g.add(fe)});
u.wh=wheels;
// ===== luzes =====
const tl=new TH.MeshBasicMaterial({color:0x991020});u.tl=tl;u.tg=[];
const hz=hl*.9,hx=hwAt(hz)*.64,hy=topAt(hz)-.17;
[1,-1].forEach(s=>{
 if(P.hl=='round'||P.hl=='quad'){const n=P.hl=='quad'?2:1;for(let k=0;k<n;k++){const r=P.hl=='quad'?.075:.11,xx=s*(hx+(P.hl=='quad'?(k?.17:-.02):0));A(CZ(r+.02,.06,16),MAT.dark,xx,hy,hz-.01);A(SP(r,1,1,.5),MAT.lens,xx,hy,hz+.025);A(new TH.TorusGeometry(r+.012,.014,6,16),MAT.chrome,xx,hy,hz+.03)}}
 else if(P.hl=='slit'){A(Bx(W*.2,.075,.09),MAT.dark,s*hx,hy,hz-.01,0,s*.35,0);A(Bx(W*.17,.03,.05),MAT.led,s*hx,hy+.005,hz+.03,0,s*.35,0);A(Bx(W*.1,.014,.05),MAT.led,s*hx*1.02,hy-.05,hz+.02,0,s*.35,0)}
 else A(Bx(W*.34,.03,.05),MAT.cyan,s*W*.18,hy,hz+.04,0,s*.3,0);
 u.hs=1;g.add(vGl(0xffffd0,1.0,s*hx,hy,hz+.2,.7));
 const tz=-hl*.93,ty=topAt(tz)-.14;
 if(P.tl=='twin'){A(CZ(.09,.04,16),tl,s*hwAt(tz)*.62,ty,tz-.01);A(new TH.TorusGeometry(.1,.014,6,16),MAT.dark,s*hwAt(tz)*.62,ty,tz-.005)}
 else if(P.tl=='quad'){[0,1].forEach(k=>A(CZ(.065,.04,14),tl,s*(hwAt(tz)*.5+k*.17),ty,tz-.01))}
 else if(P.tl=='slits'){[0,1,2].forEach(k=>A(Bx(W*.15,.018,.04),tl,s*hwAt(tz)*.56,ty+.04-k*.04,tz-.01,0,s*.2,0))}
 u.tg.push(vGl(0xff2030,.9,s*hwAt(tz)*.62,ty,tz-.16,.6));g.add(u.tg[u.tg.length-1])});
if(P.tl=='bar')A(Bx(W*.78,.06,.05),tl,0,topAt(-hl*.93)-.13,-hl*.93-.01);
// ===== retrovisores, maçanetas, linhas de porta, número =====
const mz=zc(.82);[1,-1].forEach(s=>{const mx=cwAt(mz)+.04;A(Bx(.1,.07,.1),paint,s*(mx+.09),topAt(mz)+.1,mz,0,0,0,true);A(Bx(.1,.02,.02),MAT.dark,s*mx,topAt(mz)+.07,mz);
 [.2,.78].forEach(f=>{const z=zc(f);A(Bx(.012,.28,.012),MAT.black,s*(sxAt(z,.55)+.004),.56,z)});
 A(Bx(.012,.025,.14),MAT.chrome,s*(sxAt(zc(.7),.6)+.006),.62,zc(.7));
 const nm=A(new TH.PlaneGeometry(.42,.42),new TH.MeshBasicMaterial({map:numTex(1+(rnd()*98|0)),transparent:true}),s*(sxAt(zc(.45),.52)+.012),.5,zc(.45)-.02);nm.rotation.y=s*PI/2});
// placa
A(Bx(.5,.14,.02),MAT.white,0,.46,-hl-.005);
// escapamentos
const exs=P.ex;if(exs){const xs=exs==1?[0]:exs==2?[-.3*W,.3*W]:[-.3*W,-.2*W,.2*W,.3*W];xs.forEach(x=>{A(CZ(.05,.3,12),MAT.chrome,x,.3,-hl+.0);A(CZ(.035,.31,10),MAT.black,x,.3,-hl-.001)})}
// aerofólios, entradas de ar e extras de cada estilo
extras(key,{A,g,P,S,W,L,H,hl,hwh,hwAt,topAt,lowAt,sxAt,cwAt,zc,c0,c1,bt0,roofY,paint,wz,wr});
// interior (visível pelo vidro)
const seatZ=zc(.36),wheelZ=zc(.62),dashZ=zc(.84),hip=Math.max(.33,roofY-.92);
A(Bx(W*.6,.1,.26),MAT.seat,0,topAt(dashZ)-.02,dashZ);A(Bx(.5,.1,.5),MAT.seat,0,hip-.1,seatZ);A(Bx(.5,.58,.1),MAT.seat,0,hip+.2,seatZ-.27,-.18);
const sw=new TH.Group();sw.position.set(0,hip+.24,wheelZ);sw.rotation.x=-.9;sw.add(new TH.Mesh(new TH.TorusGeometry(.13,.02,8,20),MAT.dark),new TH.Mesh(CZ(.025,.1,6).rotateX(0),MAT.dark));sw.userData.base=sw.rotation.x;g.add(sw);u.sw=sw;
const d=window.mkDriver(Object.assign({room:roofY-hip},pil));d.position.set(0,hip,seatZ);g.add(d);u.dr=d;u.seat={y:hip,z:seatZ,wy:hip+.24,wz:wheelZ};
// sombra de contato e brilho colorido
const cs2=new TH.Mesh(new TH.PlaneGeometry(1,1).rotateX(-PI/2),new TH.MeshBasicMaterial({map:SHT,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));cs2.scale.set(W*1.5,1,L*1.25);cs2.position.y=.035;g.add(cs2);
const ug=new TH.Mesh(new TH.PlaneGeometry(1,1).rotateX(-PI/2),new TH.MeshBasicMaterial({map:GT,color:col,blending:TH.AdditiveBlending,transparent:true,depthWrite:false,opacity:.26}));ug.scale.set(W*2.4,1,L*1.5);ug.position.y=.05;g.add(ug);
// chama do nitro
const fl=new TH.Group();[1,-1].forEach(s=>{const mkc=(r,l,c,o)=>{const m=new TH.Mesh(new TH.ConeGeometry(r,l,10,1,true).rotateX(-PI/2),new TH.MeshBasicMaterial({color:c,blending:TH.AdditiveBlending,transparent:true,opacity:o,depthWrite:false,side:TH.DoubleSide}));m.position.set(s*W*.3,.32,-hl-l/2);fl.add(m)};mkc(.2,2.4,0x55ccff,.8);mkc(.1,1.4,0xffffff,.9)});fl.visible=false;g.add(fl);u.fl=fl;
// faróis do jogador
if(pil.lamp){const l=new TH.SpotLight(0xfff4cc,0,70,.5,.55,1),o=new TH.Object3D();l.position.set(0,.8,hl);o.position.set(0,0,hl+25);g.add(l,o);l.target=o;u.lamp=l;
const b=new TH.Mesh(new TH.ConeGeometry(3.2,16,16,1,true).rotateX(-PI/2),new TH.MeshBasicMaterial({color:0xfff2c0,transparent:true,opacity:.07,blending:TH.AdditiveBlending,depthWrite:false,side:TH.DoubleSide}));b.position.set(0,.7,hl+8);b.visible=false;g.add(b);u.hb=b}
return g}
// ===== extras por estilo =====
function extras(key,X){const{A,g,P,W,L,hl,hwAt,topAt,lowAt,sxAt,cwAt,zc,c0,c1,paint,hwh,roofY}=X,D=MAT.dark,C=MAT.carbon;
const wing=(z,y,w,hgt,stand)=>{A(Bx(w,.05,.34),C,0,y,z,.08,0,0,true);A(Bx(.04,.14,.3),D,w/2,y+.05,z);A(Bx(.04,.14,.3),D,-w/2,y+.05,z);[1,-1].forEach(s=>A(Bx(.05,y-topAt(z)+.04,.08),D,s*stand,(y+topAt(z))/2,z+.05))};
const slats=(z0,n,x,w)=>{for(let i=0;i<n;i++)[1,-1].forEach(s=>A(Bx(w,.01,.035),D,s*x,topAt(z0+i*.1)+.004,z0+i*.1))};
const grille=(w,h,y)=>{A(Bx(w,h,.05),D,0,y,hl*.975);A(Bx(w+.03,.02,.052),MAT.chrome,0,y+h/2,hl*.975);A(Bx(w+.03,.02,.052),MAT.chrome,0,y-h/2,hl*.975)};
switch(key){
case'gt':slats(hl*.42,3,W*.2,.3);grille(W*.36,.1,.4);A(Bx(W*.76,.04,.22),paint,0,topAt(-hl*.84)+.04,-hl*.82,.18,0,0,true);[1,-1].forEach(s=>A(Bx(.012,.08,.3),D,s*(sxAt(hl*.55,.5)+.004),.5,hl*.55));break;
case'muscle':{A(Bx(W*.34,.1,.5),paint,0,topAt(hl*.4)+.05,hl*.4,-.05,0,0,true);A(Bx(W*.3,.07,.06),D,0,topAt(hl*.4)+.07,hl*.4+.26);A(Bx(W*.84,.05,.2),paint,0,topAt(-hl*.9)+.07,-hl*.86,.12,0,0,true);grille(W*.5,.09,.38);break}
case'hatch':A(Bx(W*.74,.04,.2),paint,0,topAt(zc(.02))+.34,zc(.0)-.06,.15,0,0,true);[1,-1].forEach(s=>A(Bx(.04,.1,.12),paint,s*W*.33,topAt(zc(.02))+.3,zc(.0)-.06));grille(W*.36,.08,.38);break;
case'sedan':A(Bx(W*.74,.05,.18),paint,0,topAt(-hl*.9)+.07,-hl*.88,.1,0,0,true);grille(W*.42,.08,.38);[1,-1].forEach(s=>{A(Bx(.012,.07,.2),D,s*(sxAt(hl*.6,.5)+.004),.5,hl*.6);A(Bx(.012,.07,.2),D,s*(sxAt(hl*.55,.45)+.004),.43,hl*.55)});break;
case'super':wing(-hl*.88,topAt(-hl*.88)+.34,W*.9,0,W*.28);[1,-1].forEach(s=>{A(Bx(.012,.12,.5),D,s*(sxAt(-hl*.2,.5)+.006),.5,-hl*.2);A(Bx(.012,.1,.34),D,s*(sxAt(hl*.4,.46)+.006),.46,hl*.4)});A(Bx(W*.5,.07,.05),D,0,.36,hl*.97);[1,-1].forEach(s=>A(Bx(.05,.1,.2),C,s*W*.46,.3,hl-.15));break;
case'rally':{[-.18,-.06,.06,.18].forEach(x=>{A(CZ(.065,.05,14),MAT.dark,x*W*1.1,.52,hl*.985);A(CZ(.05,.02,14),MAT.lens,x*W*1.1,.52,hl*.985+.03)});A(Bx(W*.7,.05,.3),MAT.gun,0,.27,hl-.1);
[1,-1].forEach(s=>{A(Bx(.04,.2,.18),D,s*(hwAt(hl*.6)*.96),.3,hl*.6);A(Bx(.04,.2,.18),D,s*(hwAt(-hl*.6)*.96),.3,-hl*.6)});A(Bx(W*.2,.1,.4),paint,0,roofY+.03,zc(.55),0,0,0,true);A(Bx(W*.2,.03,.14),D,0,roofY+.075,zc(.62));wing(-hl*.94,topAt(-hl*.94)+.3,W*.7,0,W*.26);slats(hl*.4,2,W*.18,.26);A(Bx(.05,.05,.12),MAT.red,.26,.28,hl);break}
case'ev':[1,-1].forEach(s=>{A(Bx(.012,.02,.5),MAT.cyan,s*(sxAt(0,.5)+.004),.44,0)});A(Bx(W*.7,.02,.03),MAT.cyan,0,topAt(hl*.96)-.04,hl*.975);A(Bx(W*.6,.012,.9),MAT.dark,0,topAt(hl*.5)+.002,hl*.5);break;
case'truck':{const bz=-hl*.55,bl=(c0+hl*.93)*.5,len=(c0-(-hl*.93)),fy=topAt(-hl*.6),wy=fy+.18;
[1,-1].forEach(s=>A(Bx(.07,.36,len),paint,s*(hwAt(bz)*.9),wy,(c0-hl*.93)/2,0,0,0,true));A(Bx(W*.86,.38,.08),paint,0,wy+.01,c0-.02,0,0,0,true);A(Bx(W*.86,.34,.07),paint,0,wy-.01,-hl*.93,0,0,0,true);A(Bx(W*.76,.02,len),D,0,fy+.012,(c0-hl*.93)/2);
A(Bx(W*.7,.07,.09),MAT.chrome,0,.5,hl+.0);[1,-1].forEach(s=>A(Bx(.05,.4,.07),MAT.chrome,s*W*.3,.42,hl-.0));grille(W*.5,.16,.55);A(Bx(W*.62,.06,.1),MAT.dark,0,roofY+.04,zc(.7));[-.2,0,.2].forEach(x=>A(CZ(.04,.04,10),MAT.lens,x*W,roofY+.05,zc(.7)+.06));
[1,-1].forEach(s=>A(Bx(.14,.04,.9),MAT.dark,s*(hwAt(0)*.98),.3,zc(.5)));break}
case'drift':wing(-hl*.9,topAt(-hl*.9)+.5,W*1.0,0,W*.34);[1,-1].forEach(s=>{A(Bx(.2,.025,.18),C,s*(hwh*.9),.28,hl-.1,0,0,s*.3);A(Bx(.012,.1,.45),D,s*(sxAt(hl*.5,.48)+.006),.48,hl*.5)});A(Bx(W*.3,.07,.4),D,0,topAt(hl*.4)+.02,hl*.4);grille(W*.4,.08,.38);break;
case'hyper':A(Bx(.03,.15,L*.26),paint,0,topAt(-hl*.66)+.1,-hl*.66,0,0,0,true);wing(-hl*.9,topAt(-hl*.9)+.2,W*.7,0,W*.2);[1,-1].forEach(s=>{A(Bx(.012,.1,.5),D,s*(sxAt(-hl*.15,.5)+.006),.5,-hl*.15);A(Bx(.012,.07,.4),D,s*(sxAt(hl*.45,.46)+.006),.46,hl*.45);A(Bx(.05,.1,.2),C,s*W*.46,.3,hl-.15)});break}}
// ===== instala =====
mkCar=function(S,col,pil){return mk(S,col,pil||{})};
buildMenu();rs();
})();
