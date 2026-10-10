const $=i=>document.getElementById(i),R=Math.random,PI=Math.PI,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const CARS=[{n:'Falcão GT',top:64,acc:22,grip:5.5,nit:1,w:1.8,l:4,h:.5,sp:1},{n:'Trovão V8',top:70,acc:19,grip:4.5,nit:1.2,w:2,l:4.5,h:.55,sp:2},{n:'Pulga Turbo',top:58,acc:25,grip:6.8,nit:.9,w:1.6,l:3.4,h:.65,sp:0},
{n:'Lobo RS',top:66,acc:21,grip:5.8,nit:1,w:1.85,l:4.1,h:.5,sp:2,st:1},{n:'Fúria X',top:72,acc:17,grip:4.2,nit:1.3,w:2.05,l:4.7,h:.48,sp:2,st:1},{n:'Gazela Rally',top:60,acc:24,grip:7,nit:1,w:1.75,l:3.8,h:.7,sp:1,st:1},
{n:'Raio Elétrico',top:68,acc:26,grip:5.2,nit:.8,w:1.8,l:3.9,h:.45,sp:1,st:1},{n:'Titã Pesado',top:62,acc:15,grip:3.8,nit:1.6,w:2.2,l:5,h:.6,sp:0},{n:'Cobra Drift',top:66,acc:21,grip:3.2,nit:1.1,w:1.85,l:4.2,h:.5,sp:2,st:1},{n:'Fênix Hiper',top:72,acc:21,grip:5.2,nit:.85,w:1.9,l:4.4,h:.45,sp:2,st:1}];
const TRACKS=[{n:'Circuito Verde',R:260,a:60,k:3,ph:0,g:0x3f8f3f,sky:0x87ceeb,t:0x1f6b2a},{n:'Deserto Dunas',R:340,a:110,k:2,ph:1,g:0xd9b36b,sky:0xf5d7a1,t:0x9a7b3c},{n:'Neve Alpina',R:300,a:80,k:5,ph:2,g:0xeef3f7,sky:0xbcd4e6,t:0x2d5a4a},
{n:'Cidade Neon',R:280,a:70,k:4,ph:3,g:0x2b2f3a,sky:0x1b2a4a,t:0x6a5acd},{n:'Vulcão',R:320,a:100,k:3,ph:4,g:0x4a2f2a,sky:0xd9805a,t:0x331a14},{n:'Costa Tropical',R:360,a:85,k:6,ph:5,g:0xe7d28a,sky:0x66c8f0,t:0x2f9e44}];
const COLS=[0xe63946,0x2a6fdb,0xf4c430,0x2ecc71,0xffffff,0x9b59b6,0x222222],hx=c=>'#'+c.toString(16).padStart(6,'0');
let G={car:0,col:0,trk:0,mode:0,wx:0,laps:3,bots:5,cam:2,hc:1,su:0,hs:0,q:1,vol:1,auto:1,diff:1},career=0;
try{career=+localStorage.getItem('trc')||0}catch(e){}
const ren=new THREE.WebGLRenderer({canvas:$('g'),antialias:true}),scn=new THREE.Scene(),cam=new THREE.PerspectiveCamera(70,1,.1,2500);
const hemi=new THREE.HemisphereLight(0xffffff,0x556677,.9),sun=new THREE.DirectionalLight(0xffffff,.9);sun.position.set(200,300,100);scn.add(hemi,sun);
let N=400,trk,W={aw:0},world=new THREE.Group(),bots=[],pl=null,prev=null,state='menu',cd=0,tm=0,cur='menu',cars=[];
// chuva
const rg=new THREE.BufferGeometry(),rp=new Float32Array(1500*3);for(let i=0;i<1500;i++){rp[i*3]=R()*80-40;rp[i*3+1]=R()*40;rp[i*3+2]=R()*80-40}
rg.setAttribute('position',new THREE.BufferAttribute(rp,3));const rain=new THREE.Points(rg,new THREE.PointsMaterial({color:0xaaccff,size:.25}));rain.frustumCulled=false;rain.visible=false;scn.add(rain);
// partículas
const PS=[];for(let i=0;i<170;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(1,6,5),new THREE.MeshBasicMaterial({transparent:true,depthWrite:false}));m.visible=false;m.life=0;scn.add(m);PS.push(m)}
let pi=0;function emit(x,y,z,c,s,l,vx,vy,vz){const m=PS[pi++%170];m.position.set(x,y,z);m.material.color.setHex(c);m.s=s;m.l=l;m.life=l;m.v=[vx,vy,vz];m.visible=true}
function parts(dt){PS.forEach(m=>{if(m.life>0){m.life-=dt;const k=m.life/m.l;m.position.x+=m.v[0]*dt;m.position.y+=m.v[1]*dt;m.position.z+=m.v[2]*dt;m.scale.setScalar(m.s*(1.6-k));m.material.opacity=k*.7;if(m.life<=0)m.visible=false}})}
// modelos
function mkCar(S,col,pil){const g=new THREE.Group(),M=c=>new THREE.MeshLambertMaterial({color:c});
const b=new THREE.Mesh(new THREE.BoxGeometry(S.w,S.h,S.l),M(col));b.position.y=.5;g.add(b);
const cb=new THREE.Mesh(new THREE.BoxGeometry(S.w*.8,.45,S.l*.42),new THREE.MeshLambertMaterial({color:0x223344,transparent:true,opacity:.6}));cb.position.set(0,.95,-.2);g.add(cb);
const wg=new THREE.CylinderGeometry(.38,.38,.3,14);wg.rotateZ(PI/2);
[[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([x,z])=>{const w=new THREE.Mesh(wg,M(0x111111));w.position.set(x*S.w/2,.38,z*S.l*.33);g.add(w)});
if(S.sp){const s=new THREE.Mesh(new THREE.BoxGeometry(S.w,.08,.5),M(0x111111));s.position.set(0,1.05+S.sp*.1,-S.l/2+.2);g.add(s)}
const hl=new THREE.Mesh(new THREE.BoxGeometry(S.w*.8,.12,.05),new THREE.MeshBasicMaterial({color:0xffffcc}));hl.position.set(0,.6,S.l/2);g.add(hl);
if(S.st){const t=new THREE.Mesh(new THREE.BoxGeometry(.3,.02,S.l*.9),new THREE.MeshBasicMaterial({color:0xffffff}));t.position.set(0,.5+S.h/2+.01,0);g.add(t)}const d=new THREE.Group(),hg=pil.hs==0?new THREE.SphereGeometry(.2,10,8):pil.hs==1?new THREE.BoxGeometry(.34,.34,.38):new THREE.CylinderGeometry(.17,.21,.4,10);
const h=new THREE.Mesh(hg,M(pil.hc));h.position.y=.38;const t=new THREE.Mesh(new THREE.BoxGeometry(.5,.4,.3),M(pil.su));t.position.y=0;d.add(h,t);d.position.set(0,1.0,-.3);g.add(d);g.userData.dr=d;
if(pil.lamp){const l=new THREE.PointLight(0xfff4cc,0,45);l.position.set(0,1.5,4);g.add(l);g.userData.lamp=l}
return g}
// pista
function mkTrack(T){const p=[];for(let i=0;i<N;i++){const t=i/N*2*PI,r=T.R+T.a*Math.sin(T.k*t+T.ph);p.push({x:Math.cos(t)*r,z:Math.sin(t)*r*.8})}
for(let i=0;i<N;i++){const a=p[i],b=p[(i+1)%N],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz);a.tx=dx/l;a.tz=dz/l;a.nx=-a.tz;a.nz=a.tx;a.l=l}return p}
function strip(o0,o1,y,cf){const pos=[],col=[],P=(i,o)=>{const a=trk[i%N];return[a.x+a.nx*o,y,a.z+a.nz*o]};
for(let i=0;i<N;i++){const c=cf(i),q=[P(i,o0),P(i,o1),P(i+1,o1),P(i+1,o0)];[0,1,2,0,2,3].forEach(k=>{pos.push(...q[k]);col.push(...c)})}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
return new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}))}
const HW=9;
function near(x,z,h){let b=1e9,k=0,s=h==null?0:h-12,e=h==null?N:h+12;for(let i=s;i<e;i++){const j=(i+N)%N,a=trk[j],d=(a.x-x)**2+(a.z-z)**2;if(d<b){b=d;k=j}}return k}
function build(ti){scn.remove(world);world=new THREE.Group();scn.add(world);const T=TRACKS[ti];W.T=T;trk=mkTrack(T);W.seg=trk.reduce((s,a)=>s+a.l,0)/N;
const gr=new THREE.Mesh(new THREE.PlaneGeometry(8000,8000),new THREE.MeshLambertMaterial({color:T.g}));gr.rotation.x=-PI/2;gr.position.y=-.05;world.add(gr);
world.add(strip(-HW,HW,.02,i=>i%2?[.2,.2,.22]:[.22,.22,.24]));
const cc=i=>i%4<2?[.9,.1,.1]:[.95,.95,.95];world.add(strip(HW,HW+1.5,.03,cc),strip(-HW-1.5,-HW,.03,cc));
const fl=new THREE.Mesh(new THREE.BoxGeometry(HW*2,.05,2),new THREE.MeshBasicMaterial({color:0xffffff}));fl.position.set(trk[0].x,.06,trk[0].z);fl.rotation.y=Math.atan2(trk[0].tx,trk[0].tz);world.add(fl);
let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;trk.forEach(a=>{x0=Math.min(x0,a.x);x1=Math.max(x1,a.x);z0=Math.min(z0,a.z);z1=Math.max(z1,a.z)});W.b=[x0,x1,z0,z1];
const tr=new THREE.InstancedMesh(new THREE.ConeGeometry(3,10,6),new THREE.MeshLambertMaterial({color:T.t}),220),m=new THREE.Matrix4();
for(let i=0;i<220;i++){let x,z,ok=0;for(let k=0;k<30&&!ok;k++){const a=R()*2*PI,r=(.1+R()*1.7)*T.R;x=Math.cos(a)*r;z=Math.sin(a)*r;ok=1;for(let j=0;j<N;j+=5)if((trk[j].x-x)**2+(trk[j].z-z)**2<700){ok=0;break}}
const s=.7+R()*1.2;m.makeScale(s,s,s);m.setPosition(x,5*s,z);tr.setMatrixAt(i,m)}world.add(tr);
for(let i=0;i<14;i++){const a=i/14*2*PI,c=new THREE.Mesh(new THREE.ConeGeometry(160+R()*120,260+R()*220,5),new THREE.MeshLambertMaterial({color:ti==2?0xdfe8f0:0x6b7a8a}));c.position.set(Math.cos(a)*1300,100,Math.sin(a)*1300);world.add(c)}
setWx()}
function setWx(){const w=G.wx==3?W.aw:G.wx,T=W.T||TRACKS[0];W.rain=w==1;const sk=w==2?0x070b1c:w==1?0x6b7785:T.sky;scn.background=new THREE.Color(sk);scn.fog=new THREE.Fog(sk,w==1?60:w==2?90:300,w==1?420:w==2?500:1600);
hemi.intensity=w==2?.3:w==1?.6:.9;sun.intensity=w==2?.1:w==1?.4:.9;rain.visible=W.rain;W.night=w==2;if(pl&&pl.mesh.userData.lamp)pl.mesh.userData.lamp.intensity=W.night?1.3:0}
// entidades
function pilot(){return{hc:COLS[G.hc],su:COLS[G.su],hs:G.hs}}
function mkEnt(S,col,pil,player){const e={s:S,mesh:mkCar(S,col,{...pil,lamp:player}),x:0,z:0,h:0,vx:0,vz:0,vf:0,gear:1,nit:1,nt:0,idx:0,lap:0,prog:0,off:0,drift:0,pl:player};world.add(e.mesh);return e}
function place(e,idx,side){const a=trk[idx%N];e.x=a.x+a.nx*side;e.z=a.z+a.nz*side;e.h=Math.atan2(a.tx,a.tz);e.vx=e.vz=e.vf=0;e.idx=idx%N;e.mesh.position.set(e.x,0,e.z);e.mesh.rotation.y=e.h}
function mkBots(n,diff,mul){bots=[];const bo=G.mode==1?career*7:(R()*BN.length|0);for(let k=1;k<=n;k++){const S=CARS[k%CARS.length],e=mkEnt(S,COLS[(k+2)%7],{hc:COLS[k%7],su:COLS[(k+3)%7],hs:k%3});const row=k>>1;e.i=N-3-row*2;const bn=BN[(k*5+bo)%BN.length];e.nm=bn+" · "+S.n;e.mesh.add(tag(bn));e.sk=(.9+R()*.1)*diff*mul;e.off=e.bo=k%2?-4:4;e.v=0;e.bot=1;botMove(e,0);bots.push(e)}}
function botMove(b,dt){const k=Math.floor(b.i)%N,A=trk[k],B=trk[(k+8)%N],cu=Math.abs(A.tx*B.tz-A.tz*B.tx),v=b.s.top*b.sk*(1-Math.min(.36,cu*4.2))*(b.cap==null?1:b.cap)*(W.rain?.93:1);
b.v+=(v-b.v)*Math.min(1,dt*1.5);b.i+=b.v*dt/W.seg;const k0=Math.floor(b.i),f=b.i-k0,a=trk[k0%N],c=trk[(k0+1)%N];
b.x=a.x+(c.x-a.x)*f+a.nx*b.off;b.z=a.z+(c.z-a.z)*f+a.nz*b.off;b.h=Math.atan2(a.tx,a.tz);b.vf=b.v;b.prog=b.i;b.mesh.position.set(b.x,0,b.z);b.mesh.rotation.y=b.h}
// física
function phys(c,dt,u){const S=c.s;let s=Math.sin(c.h),co=Math.cos(c.h),vf=c.vx*s+c.vz*co;
c.h-=u.st*1.9*cl(vf/7,-1,1)*dt/(1+Math.abs(vf)/70)*(u.dr?1.6:1);
s=Math.sin(c.h);co=Math.cos(c.h);vf=c.vx*s+c.vz*co;let vl=-c.vx*co+c.vz*s;
const GR=[0,.3,.5,.68,.85,1],gmx=g=>S.top*GR[g];
if(G.auto){if(c.gear==0){if(u.th>0&&vf>-1)c.gear=1}else if(u.br>0&&u.th==0&&vf<1.5)c.gear=0;else{if(c.gear<5&&vf>gmx(c.gear)*.94)c.gear++;else if(c.gear>1&&vf<gmx(c.gear-1)*.7)c.gear--}}
const rev=c.gear==0,ar=rev&&G.auto,dv=ar?u.br:u.th,bk=ar?u.th:u.br;
c.nt=u.nt&&c.nit>0&&!(c.nc>0)&&!rev&&dv>0;const gm=rev?14:gmx(c.gear)*(c.nt?1.3:1);let a=0;
if(dv>0){if(rev)a=-S.acc*.6*dv;else{const f=Math.max(0,1-Math.pow(Math.max(vf,0)/gm,3));a=S.acc*[0,1,.9,.8,.7,.65][c.gear]*(c.nt?1.8:1)*f*dv;if(vf>gm)a=-4}}
if(bk>0&&Math.abs(vf)>.3)a-=Math.sign(vf)*38*bk;a-=vf*.04+vf*Math.abs(vf)*.0006;if(c.off)a-=vf*1.2;vf+=a*dt;
vl*=Math.exp(-S.grip*(W.rain?.65:1)*(u.dr?.22:1)*dt);
c.vx=s*vf-co*vl;c.vz=co*vf+s*vl;c.x+=c.vx*dt;c.z+=c.vz*dt;c.vf=vf;c.drift=Math.abs(vl)>4;
if(c.nc>0){c.nc-=dt;c.nit=cl(1-c.nc/5,0,1);if(c.nc<=0){c.nc=0;c.nit=1}}else{c.nit=cl(c.nit+(c.nt?-.3/S.nit:.04)*dt,0,1);if(c.nit<=0&&c.nt){c.nit=0;c.nc=5}}
const k=near(c.x,c.z,c.idx),A=trk[k],d=(c.x-A.x)*A.nx+(c.z-A.z)*A.nz;c.off=Math.abs(d)>HW+1.5;
if(Math.abs(d)>16){const o=d-Math.sign(d)*16;c.x-=A.nx*o;c.z-=A.nz*o;c.vx*=.9;c.vz*=.9}
if(c.idx>N*.75&&k<N*.25)c.lap++;else if(c.idx<N*.25&&k>N*.75)c.lap--;c.idx=k;c.prog=c.lap*N+k;
c.mesh.position.set(c.x,0,c.z);c.mesh.rotation.y=c.h;c.mesh.rotation.z=cl(-vl*.012,-.12,.12);
const bx=c.x-Math.sin(c.h)*c.s.l/2,bz=c.z-Math.cos(c.h)*c.s.l/2;
if(c.drift&&R()<.6)emit(bx+(R()-.5)*2,.3,bz+(R()-.5)*2,0xdddddd,.5,.7,0,1,0);
if(c.nt)emit(bx,.6,bz,R()<.5?0x4cc9ff:0xffaa33,.35,.3,-Math.sin(c.h)*8,0,-Math.cos(c.h)*8);
if(W.rain&&Math.abs(vf)>10&&R()<.4)emit(bx,.2,bz,0x99aabb,.3,.5,0,1.5,0)}
// entrada
const K={};let J={x:0,y:0},TB={nt:0,dr:0};
addEventListener('keydown',e=>{aud();K[e.code]=1;if(e.code=='KeyE')gup();if(e.code=='KeyQ')gdn();if(e.code=='KeyC')G.cam=(G.cam+1)%3;if(e.code=='KeyT')togAuto();if(e.code=='KeyP'||e.code=='Escape')pause();if(e.code=='Space'||e.code.startsWith('Arrow'))e.preventDefault()});
addEventListener('keyup',e=>K[e.code]=0);
function inp(){return{st:cl((K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0)+J.x,-1,1),th:Math.max(K.KeyW||K.ArrowUp?1:0,J.y>0?J.y:0),br:Math.max(K.KeyS||K.ArrowDown?1:0,J.y<0?-J.y:0),dr:K.Space||TB.dr,nt:K.ShiftLeft||K.ShiftRight||TB.nt}}
function gup(){if(pl&&!G.auto&&state=='race')pl.gear=Math.min(5,pl.gear+1)}function gdn(){if(pl&&!G.auto&&state=='race')pl.gear=Math.max(0,pl.gear-1)}
function togAuto(){G.auto=G.auto?0:1;$('am').textContent=G.auto?'AUTO':'MANUAL'}
const jz=$('joy'),kn=$('knob');function jm(e){const r=jz.getBoundingClientRect(),dx=cl((e.clientX-r.left-55)/40,-1,1),dy=cl((e.clientY-r.top-55)/40,-1,1);J.x=dx;J.y=-dy;kn.style.left=30+dx*30+'px';kn.style.top=30+dy*30+'px'}
jz.onpointerdown=e=>{aud();jz.setPointerCapture(e.pointerId);jm(e)};jz.onpointermove=e=>{if(e.buttons||e.pressure)jm(e)};jz.onpointerup=jz.onpointercancel=()=>{J={x:0,y:0};kn.style.left=kn.style.top='30px'};
function hold(id,f){const b=$(id);b.onpointerdown=e=>{aud();f(1)};b.onpointerup=b.onpointerleave=b.onpointercancel=()=>f(0)}
hold('bn',v=>TB.nt=v);hold('bd',v=>TB.dr=v);hold('bu',v=>v&&gup());hold('bw',v=>v&&gdn());hold('bc',v=>v&&(G.cam=(G.cam+1)%3));
// áudio
let AC,eo,eg,ng;function aud(){if(AC||!G.vol)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();eo=AC.createOscillator();eo.type='sawtooth';const f=AC.createBiquadFilter();f.frequency.value=600;eg=AC.createGain();eg.gain.value=0;eo.connect(f);f.connect(eg);eg.connect(AC.destination);eo.start();
const b=AC.createBuffer(1,AC.sampleRate,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=R()*2-1;const n=AC.createBufferSource();n.buffer=b;n.loop=true;const nf=AC.createBiquadFilter();nf.type='bandpass';nf.frequency.value=1600;ng=AC.createGain();ng.gain.value=0;n.connect(nf);nf.connect(ng);ng.connect(AC.destination);n.start()}catch(e){AC=null}}
function beep(f,d){if(!AC||!G.vol)return;const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;g.gain.value=.15;o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}
function sfx(u){if(!AC)return;const on=state=='race'&&G.vol&&pl;if(!on){eg.gain.value=0;ng.gain.value=0;return}const gm=pl.gear==0?14:pl.s.top*pl.gear/5,rp=cl(Math.abs(pl.vf)/gm,0,1.1);
eo.frequency.value=45+rp*150+(pl.nt?30:0);eg.gain.value=.04+.05*u.th;ng.gain.value=(pl.drift?.07:0)+(pl.nt?.12:0)+(W.rain?.03:0)}
// HUD
const gc=$('spd'),gx=gc.getContext('2d'),mc=$('mm'),mx=mc.getContext('2d');
function sizeHud(){const d=Math.min(devicePixelRatio,2),h=innerHeight,gs=Math.round(cl(h*.34,100,190)),ms=Math.round(cl(h*.24,76,140));gc.width=gc.height=gs*d;gc.style.width=gc.style.height=gs+'px';mc.width=mc.height=ms*d;mc.style.width=mc.style.height=ms+'px'}
function rs(){ren.setPixelRatio(G.q==0?1:Math.min(devicePixelRatio,G.q==1?1.5:2));ren.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();sizeHud()}
addEventListener('resize',rs);if(window.visualViewport)visualViewport.addEventListener('resize',rs);addEventListener('orientationchange',()=>setTimeout(rs,200));
function gauge(){const g=gx,s=gc.width,c=s/2,r=c*.92,a0=PI*.75,sp=PI*1.5,v=Math.abs(pl.vf)*3.6,f=Math.min(1,v/300);g.clearRect(0,0,s,s);g.save();g.translate(c,c);
g.beginPath();g.arc(0,0,r,0,2*PI);g.fillStyle='rgba(8,12,28,.5)';g.fill();g.strokeStyle='rgba(0,229,255,.35)';g.lineWidth=2;g.stroke();g.lineWidth=r*.09;g.lineCap='round';g.strokeStyle='#223';g.beginPath();g.arc(0,0,r*.84,a0,a0+sp);g.stroke();
const gr=g.createLinearGradient(-r,0,r,0);gr.addColorStop(0,'#00e5ff');gr.addColorStop(.6,'#7c4dff');gr.addColorStop(1,'#ff2d75');g.strokeStyle=pl.nt?'#4cc9ff':gr;g.beginPath();g.arc(0,0,r*.84,a0,a0+sp*f);g.stroke();
g.lineWidth=Math.max(1,r*.015);g.strokeStyle='#89a';g.fillStyle='#cde';g.font=`${r*.1}px system-ui`;g.textAlign='center';g.textBaseline='middle';
for(let k=0;k<=300;k+=20){const a=a0+sp*k/300,l=k%40?.05:.09;g.beginPath();g.moveTo(Math.cos(a)*r*.7,Math.sin(a)*r*.7);g.lineTo(Math.cos(a)*r*(.7-l),Math.sin(a)*r*(.7-l));g.stroke();if(!(k%40))g.fillText(k,Math.cos(a)*r*.5,Math.sin(a)*r*.5)}
const na=a0+sp*f;g.strokeStyle='#ff2d75';g.lineWidth=r*.03;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(na)*r*.62,Math.sin(na)*r*.62);g.stroke();g.fillStyle='#ff3d5a';g.beginPath();g.arc(0,0,r*.05,0,2*PI);g.fill();
g.fillStyle='#fff';g.font=`900 ${r*.32}px system-ui`;g.fillText(Math.round(v),0,r*.34);g.font=`${r*.1}px system-ui`;g.fillText('km/h',0,r*.54);
g.font=`900 ${r*.3}px system-ui`;g.fillStyle=pl.gear==0?'#ff3d5a':'#4cc9ff';g.fillText(pl.gear==0?'R':pl.gear,0,-r*.2);
g.fillStyle='#223';g.fillRect(-r*.35,r*.68,r*.7,r*.07);g.fillStyle='#4cc9ff';g.fillRect(-r*.35,r*.68,r*.7*pl.nit,r*.07);g.restore()}
function mini(){const s=mc.width,b=W.b,k=(s*.84)/Math.max(b[1]-b[0],(b[3]-b[2])),ox=s/2-(b[0]+b[1])/2*k,oz=s/2-(b[2]+b[3])/2*k,X=x=>x*k+ox,Z=z=>z*k+oz;
mx.clearRect(0,0,s,s);mx.fillStyle='rgba(8,12,24,.7)';mx.beginPath();mx.arc(s/2,s/2,s/2,0,2*PI);mx.fill();mx.strokeStyle='#aab';mx.lineWidth=s*.035;mx.beginPath();trk.forEach((a,i)=>i?mx.lineTo(X(a.x),Z(a.z)):mx.moveTo(X(a.x),Z(a.z)));mx.closePath();mx.stroke();
cars.forEach(c=>{mx.fillStyle=c.pl?'#ff3d5a':'#4cc9ff';mx.beginPath();mx.arc(X(c.x),Z(c.z),s*(c.pl?.04:.028),0,2*PI);mx.fill()})}
// câmera
function camUpd(dt){const c=pl,s=Math.sin(c.h),co=Math.cos(c.h),m=G.cam;c.mesh.userData.dr.visible=m!=0;let p;
if(m==0){cam.position.set(c.x+s*.2,1.25,c.z+co*.2)}else{const d=m==1?4.2:8.5,h=m==1?1.6:3.6;p=new THREE.Vector3(c.x-s*d,h,c.z-co*d);cam.position.lerp(p,1-Math.exp(-10*dt))}
cam.lookAt(c.x+s*(m==0?20:3),m==0?1.1:1,c.z+co*(m==0?20:3));const f=65+Math.min(25,Math.abs(c.vf)*.3)+(c.nt?10:0);cam.fov+=(f-cam.fov)*.1;cam.updateProjectionMatrix()}
// loop
let last=0,wt=0,bt=0;
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000||0);last=t;
if(state=='race'||state=='end')race(dt);else if(state=='menu')menuUpd(dt,t);
if(rain.visible){const p=rg.attributes.position,c=state=='menu'?cam.position:(pl?pl.mesh.position:cam.position);rain.position.set(c.x,0,c.z);for(let i=0;i<1500;i++){let y=p.getY(i)-45*dt;if(y<0)y+=40;p.setY(i,y)}p.needsUpdate=true}
if(G.wx==3&&state!='pause'){wt+=dt;if(wt>45){wt=0;W.aw=(W.aw+1)%3;setWx()}}
parts(dt);ren.render(scn,cam)}
function menuUpd(dt,t){bots.forEach(b=>botMove(b,dt));const gar=cur=='gar',a=t*(gar?.0002:.0003),p=prev.position,r=gar?(innerWidth<innerHeight?12:8):7;cam.fov=gar?45:60;if(gar)cam.setViewOffset(innerWidth,innerHeight,-innerWidth*.2,0,innerWidth,innerHeight);else cam.clearViewOffset();cam.updateProjectionMatrix();cam.position.set(p.x+Math.cos(a)*r,gar?2:2.5+Math.sin(a*.7),p.z+Math.sin(a)*r);cam.lookAt(p.x,1,p.z)}
function race(dt){let u={st:0,th:0,br:0,dr:0,nt:0};if(state=='race'&&cd<=0)u=inp();
if(cd>0){const o=Math.ceil(cd);cd-=dt;const n=Math.ceil(cd);if(n!=o||cd==3.5-dt){cdS(n)}$('cd').textContent=cd>0?Math.ceil(cd):cd>-1?'GO!':''}else if(cd>-1){cd-=dt;$('cd').textContent=cd>-1?'GO!':''}
if(state=='end'){u={st:0,th:0,br:.5,dr:0,nt:0}}
if(cd<=0)tm+=dt;
phys(pl,dt,u);
bots.forEach(b=>{b.cap=cd>0?0:1+cl((pl.prog-b.i)/N*1.2,-.03,[.08,.13,.2][G.diff]);
if(cd<=0&&G.mode!=2&&G.diff>0&&b.bo!=null&&state=='race'){const gp2=b.i-pl.prog,A=trk[pl.idx],dl=(pl.x-A.x)*A.nx+(pl.z-A.z)*A.nz,tg=gp2>.5&&gp2<7?cl(dl,-6.5,6.5):b.bo;b.off+=(tg-b.off)*Math.min(1,dt*[0,.6,1.4][G.diff])}
botMove(b,dt);if(!b.ft&&G.mode!=2&&b.i>=(G.laps+1)*N)b.ft=tm;const dx=pl.x-b.x,dz=pl.z-b.z,d=Math.hypot(dx,dz);if(d<2.8&&d>0){pl.x+=dx/d*(2.8-d);pl.z+=dz/d*(2.8-d);pl.vx*=.97;pl.vz*=.97}});
camUpd(dt);sfx(u);extra(dt);
const pos=1+bots.filter(b=>b.prog>pl.prog).length,lap=cl(pl.lap,1,G.laps);
$('info').innerHTML=`<div class=pos>${pos}<small>/${bots.length+1}</small></div><span class=chip>VOLTA ${lap}/${G.mode==2?'∞':G.laps}</span><span class=chip>${fmt(tm)}</span>`;$('gv').textContent=pl.gear==0?'R':pl.gear;
gauge();mini();if(state=='end'){bt+=dt;if(bt>.5){bt=0;$('ed').innerHTML=board()}}
if(state=='race'&&G.mode!=2&&pl.lap>G.laps)finish(pos)}
function fmt(t){t=Math.max(0,t);return Math.floor(t/60)+':'+(t%60).toFixed(2).padStart(5,'0')}
function board(){const L=cars.map(c=>({n:c.pl?PN()+' (você)':c.nm,ft:c.ft,p:c.prog,pl:c.pl}));L.sort((a,b)=>a.ft&&b.ft?a.ft-b.ft:a.ft?-1:b.ft?1:b.p-a.p);
return'<table>'+L.map((r,i)=>`<tr class="${r.pl?'me':''}"><td>${i+1}º</td><td>${r.n}</td><td>${r.ft?fmt(r.ft):'em corrida…'}</td></tr>`).join('')+'</table>'}
function finish(){state='end';pl.ft=tm;const pos=1+bots.filter(b=>b.ft).length,TL=TRACKS.length;let d='';
if(G.mode==1){if(pos<=3){career=Math.min(career+1,TL);try{localStorage.setItem('trc',career)}catch(e){}d=career>=TL?'🏆 Você é o campeão da carreira!':'Próxima etapa desbloqueada!'}else d='Fique no pódio (top 3) para avançar.'}
$('et').textContent=pos==1?'🏆 VITÓRIA!':'Você chegou em '+pos+'º';$('ed').innerHTML=board();$('en').textContent=d;scr('end')}
// fluxo
function hide(){document.querySelectorAll('.scr').forEach(s=>s.classList.remove('on'))}
function scr(id){hide();$(id).classList.add('on');cur=id;if(id=='sel')renderSel();if(id=='set')renderSet();if(id=='gar')renderGar()}
function row(l,k,it){return`<div class=row><b>${l}</b>${it.map((x,i)=>`<button class="${G[k]==i?'on':''}" onclick="pick('${k}',${i})">${x}</button>`).join('')}</div>`}
const sw=c=>`<span class=sw style="background:${hx(c)}"></span>`,bar=v=>`<div class=bar><i style="width:${v*100}%"></i></div>`;
function pick(k,i){G[k]=i;if(k=='wx'){W.aw=0;setWx()}if(k=='q')rs();if(state=='menu'){if(['car','col','hc','su','hs'].includes(k))mkPrev();if(k=='trk')buildMenu()}cur=='set'?renderSet():cur=='gar'?renderGar():renderSel()}
function renderSel(){const S=CARS[G.car],M=G.mode;let h=`<h2 style="margin:0;text-align:center">${['Corrida Livre','Carreira','Treino Livre'][M]}</h2>`;
h+=`<div class=row><b>Carro</b><button onclick="openGar('sel')">🚗 ${S.n} · Trocar e personalizar</button></div>`;
if(M==1)h+=`<div class=row>Etapa ${Math.min(career,TRACKS.length-1)+1}/${TRACKS.length} — ${TRACKS[Math.min(career,TRACKS.length-1)].n}</div>`;else h+=row('Pista','trk',TRACKS.map(t=>t.n));
h+=row('Clima','wx',['☀️ Sol','🌧️ Chuva','🌙 Noite','🔄 Auto']);
if(M==0)h+=`<div class=row><b>Voltas</b>${[2,3,5].map(n=>`<button class="${G.laps==n?'on':''}" onclick="pick('laps',${n})">${n}</button>`).join('')}</div>`;
if(M!=2)h+=row('Dificuldade','diff',['Fácil','Normal','Difícil']);
h+=`<div class=row><button onclick="toMenu()">← Voltar</button><button class="pri big" onclick="start()">▶ INICIAR</button></div>`;$('selc').innerHTML=h}
let gf='menu';function openGar(f){gf=f;scr('gar')}
function renderGar(){let h='<h2>Garagem</h2><div class=list>'+CARS.map((c,i)=>`<button class="car ${G.car==i?'on':''}" onclick="pick('car',${i})"><span>${c.n}</span><span class=st>${bar((c.top-55)/20+.15)}${bar(c.acc/30)}${bar(c.grip/8)}</span></button>`).join('')+'</div><div style="font-size:11px;opacity:.6">Barras: velocidade · aceleração · aderência</div>';
h+=row('Cor do carro','col',COLS.map(sw))+row('Capacete','hc',COLS.map(sw))+row('Uniforme','su',COLS.map(sw))+row('Modelo do capacete','hs',['Redondo','Cubo','Cilíndrico'])+'<button class=pri onclick="scr(gf)">✔ Confirmar</button>';$('garc').innerHTML=h}
function renderSet(){$('setc').innerHTML=`<h2 style="margin:0;text-align:center">Configurações</h2>`+row('Gráficos','q',['Baixo','Médio','Alto'])+row('Som','vol',['Mudo','Ligado'])+row('Câmera','cam',['1ª pessoa','2ª pessoa','3ª pessoa'])+row('Câmbio','auto',['Manual','Automático'])+row('Clima','wx',['☀️ Sol','🌧️ Chuva','🌙 Noite','🔄 Auto'])+`<div class=row><button onclick="fs()">⛶ Tela cheia</button><button class=pri onclick="state=='pause'||pl&&state=='race'?scr('pause'):toMenu()">OK</button></div>`}
function fs(){try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}catch(e){}}
function clear(){bots=[];cars=[];pl=null;prev=null}
function mkPilot(p){const g=new THREE.Group(),M=c=>new THREE.MeshLambertMaterial({color:c}),bx=(w,h,d,c,x,y)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c));m.position.set(x,y,0);g.add(m)};
bx(.32,.9,.3,0x222222,-.2,.45);bx(.32,.9,.3,0x222222,.2,.45);bx(.8,.8,.4,p.su,0,1.3);bx(.25,.8,.25,p.su,-.55,1.25);bx(.25,.8,.25,p.su,.55,1.25);
const hg=p.hs==0?new THREE.SphereGeometry(.3,12,10):p.hs==1?new THREE.BoxGeometry(.55,.55,.6):new THREE.CylinderGeometry(.26,.32,.62,12),h=new THREE.Mesh(hg,M(p.hc));h.position.y=2;g.add(h);
const v=new THREE.Mesh(new THREE.BoxGeometry(.4,.14,.1),M(0x111111));v.position.set(0,2.03,.28);g.add(v);return g}
function mkPrev(){if(prev)world.remove(prev);prev=mkCar(CARS[G.car],COLS[G.col],pilot());const pg=mkPilot(pilot());pg.position.set(2.8,0,.4);prev.add(pg);const a=trk[60];prev.position.set(a.x+a.nx*14,0,a.z+a.nz*14);prev.rotation.y=Math.atan2(a.tx,a.tz);world.add(prev)}
function buildMenu(){clear();build(G.trk);mkPrev();mkBots(6,1,1);bots.forEach((b,i)=>b.i=60+i*55)}
function toMenu(){state='menu';$('hud').style.display='none';buildMenu();scr('menu')}
function go(m){G.mode=m;G.bots=m==2?0:5;if(m==1)G.laps=2;else if(G.laps<2)G.laps=3;aud();scr('sel')}
function start(){aud();clear();const ti=G.mode==1?Math.min(career,TRACKS.length-1):G.trk;build(ti);const M=G.mode,nb=M==2?0:G.bots,laps=M==1?2:G.laps;G.laps=M==2?99:laps;
pl=mkEnt(CARS[G.car],COLS[G.col],pilot(),true);place(pl,N-3-(M==2?0:[0,1,3][G.diff])*2,4);pl.lap=0;
mkBots(nb,[.9,1.02,1.12][G.diff]*(M==1?.9+career*.07:1),1);bots.forEach(b=>b.i=b.i);cars=[pl,...bots];
if(pl.mesh.userData.lamp)pl.mesh.userData.lamp.intensity=W.night?1.3:0;
cam.clearViewOffset();tm=0;cd=3.5;state='race';cam.position.set(pl.x,3,pl.z-8);hide();cur='';$('hud').style.display='block';$('tc').style.display=matchMedia('(pointer:coarse)').matches?'block':'none';$('am').textContent=G.auto?'AUTO':'MANUAL';$('cd').textContent='';sizeHud()}
function pause(){if(state=='race'){state='pause';scr('pause')}else if(state=='pause'){state='race';hide();cur=''}}
// ===== EXTRAS: nomes, comentarista, música, sfx, vfx =====
const BN=['Rafael Souza','Daniela Costa','Lucas Almeida','Mariana Lima','Bruno Carvalho','Tatiana Rocha','Gabriel Ribeiro','Camila Martins','Carlos Ferreira','Juliana Pereira','Thiago Barbosa','Beatriz Gomes','Felipe Araújo','Larissa Dias','Vitor Nunes','Fernanda Castro','Henrique Melo','Alice Moreira','Otávio Ramos','Patrícia Cardoso','Eduardo Teixeira','Sofia Mendes','Rodrigo Freitas','Letícia Barros'];
const pnI=$('pn');try{pnI.value=localStorage.getItem('trn')||''}catch(e){}
pnI.addEventListener('keydown',e=>e.stopPropagation());pnI.addEventListener('input',()=>{try{localStorage.setItem('trn',pnI.value)}catch(e){}});
function PN(){return(pnI.value.trim()||'Piloto').slice(0,14)}
function tag(t){const c=document.createElement('canvas');c.width=256;c.height=48;const x=c.getContext('2d');x.fillStyle='rgba(0,0,0,.55)';x.fillRect(0,0,256,48);x.fillStyle='#fff';x.font='bold 24px system-ui';x.textAlign='center';x.fillText(t,128,33);const p=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthWrite:false}));p.scale.set(5,.94,1);p.position.y=2.7;return p}
const CM={
st:'Motores roncando, a grade está pronta!|Bem-vindos à corrida! {p} larga neste grid.|Silêncio na arquibancada... vai começar!|Pneus quentes, pilotos focados.|Hoje o asfalto promete emoção!|Todos os olhos em {p} na largada.|Cinto afivelado, que comece o show!|Respira fundo, {p}, a luz vai apagar!',
go:'Largou! Que arrancada!|E lá vão eles!|Verde! Todo mundo acelerando!|Começou a briga pela primeira curva!|Pé embaixo, {p}!|Largada limpa, ótimo começo!',
lead:'{p} assume a liderança!|Ultrapassagem sobre {b}, agora é líder!|Na ponta! {p} dispara na frente!|Que manobra! A liderança é de {p}!|Líder da prova, {p} está voando!|{b} ficou para trás, {p} manda!|Primeiro lugar conquistado!|Agora é só defender a ponta!',
lost:'{b} toma a liderança de {p}!|Perdeu a ponta! Hora de reagir!|{b} passou e está na frente!|A liderança escapou, vai atrás!|Cuidado, {b} vem forte!|Que ataque de {b}!|Líder trocou! {b} comanda agora!',
ov:'Passou {b} com classe!|{p} deixa {b} para trás!|Ultrapassagem limpa sobre {b}!|{b} engoliu poeira!|Que bote, {p}!|Mais uma posição ganha!|Voando baixo e passando {b}!|{p} está embalado!|Chegou por fora e passou {b}!|Subindo no pelotão!',
ovd:'{b} passou {p}!|{b} voou pela esquerda!|Perdeu posição para {b}!|Hora de revidar, {p}!|{b} colou e ultrapassou!|Posição perdida, segura a cabeça!|{b} aproveitou o vacilo!|Não deixa {b} escapar!|Dá o troco em {b}!|{b} está empolgado hoje!',
dr:'Que drift lindo!|Traseira solta, mas controlada!|Fumaça nos pneus, que espetáculo!|{p} dança com o carro!|Derrapada de cinema!|Isso é arte de lado!|A curva foi na vassourinha!|Segurou o drift, impressionante!',
nt:'Nitro ativado, haja motor!|Chama azul no escapamento!|Disparou com o nitro!|Aí sim, é bala!|Nitro no talo!|Foguete na reta!|Segura que lá vai {p}!|Que arrancada turbinada!',
ne:'Nitro zerado! Agora espera recarregar.|Acabou o nitro, cuidado!|Tanque de nitro vazio!|Sem nitro por 5 segundos!|Esgotou o turbo, pé firme!|Nitro em recarga, paciência!',
nr:'Nitro recarregado, liberado!|Tanque cheio de novo!|Nitro pronto para outra!|Recarga completa, bora!|Voltou o turbo, aproveita!',
off:'Saiu da pista! Volta, {p}!|Pneus na grama, perdendo tempo!|Cuidado com a terra!|Passeio fora do asfalto!|Volta pro traçado, {p}!|Fora da pista, a velocidade cai!|Essa área externa complica!',
lap:'Mais uma volta completada!|Nova volta, ritmo forte!|Passou pela linha, segue firme!|Contagem de voltas avançando!|Volta rápida, {p}!|Mantém o ritmo, {p}!',
fl:'Última volta! Tudo ou nada!|Volta final, segura a pressão!|Falta uma volta para a glória!|Ultimíssima volta, {p}!|Bandeira quase à vista!',
win:'Vitória! {p} é o campeão!|Bandeirada! Que corrida espetacular!|Primeiro lugar, parabéns {p}!|Show de pilotagem, vitória merecida!|Pódio mais alto para {p}!',
pod:'Pódio garantido, bela corrida!|Terminou entre os três melhores!|Bom resultado, {p}!',
los:'Fim de prova, a revanche vem aí!|Não foi dessa vez, tente de novo!|Terminou a corrida, cabeça erguida!',
rain:'A chuva deixa o asfalto escorregadio!|Pista molhada, cuidado nas curvas!|Chuva forte, aderência no limite!|Pneus sofrendo na pista molhada!',
night:'Corrida noturna, faróis ligados!|De noite tudo é mais emocionante!|Escuridão total, só os faróis guiam!|Noite perfeita para velocidade!',
sp:'Que velocidade absurda!|Cravou mais de 250 km/h!|Isso é voar baixo!|Ponteiro quase no limite!|Velocímetro gritando!',
col:'Batida com {b}! Cuidado!|Pancada! {b} estava ali!|Encostou em {b}, faíscas!|Toque forte, segura o carro!|Contato com {b}!|Ai! Isso doeu no carro!',
last:'Lanterna! É hora de reagir!|Último lugar, mas ainda dá tempo!|Corrida longa, {p} pode recuperar!|Acorda, {p}, o pelotão está longe!|Vamos subir no grid!',
idle:'Corrida equilibrada até aqui.|O ritmo está intenso!|Que disputa acirrada!|Os motores nem esfriam!|Pilotos no limite de aderência!|Cada curva conta nessa prova!|Alto nível de pilotagem hoje!|Atenção na próxima curva!|A torcida está de pé!|Corrida eletrizante!|Quem vai levar essa?|Ritmo forte de todos os carros!'};
let cP=null,cS={},gp={},cH=0,cQ=0,cI=0,cE=0,cL=0,cG=0,cW=0,cC=0,cV=0,pp=0,pD=0,pO=0,pLs=0,pNt=0,pNc=0,sb='';
const SP=['Dudu','Marcelin','Romarin','Romano','Johns Paulsen','Kaká Pelek','Daniels Patetisc'];let cq=[],cLast='';
function spk(){let n;do{n=SP[R()*SP.length|0]}while(n==cLast);return cLast=n}
const RP='Concordo total, {o}!|Exatamente isso, {o}!|Boa observação, {o}!|Hmm, eu discordo um pouco, {o}...|Isso foi demais, hein!|E ainda tem muita corrida pela frente!|{o} falou tudo!|Se eu fosse o piloto, faria igual.|Ô {o}, você tem razão!|Isso é o que eu chamo de corrida!'.split('|');
const DL=['{o}, viu aquela largada?|Vi sim! Parecia um foguete.|Quero ver se mantém esse ritmo.|Com essa pilotagem, {p} vai longe!',
'Qual é a sua aposta para hoje, {o}?|Eu fico com {p}, sem dúvida.|Corajoso! Os rivais estão afiados.|Pois é, mas torcer não custa nada!',
'{o}, o que acha dessa pista?|Cheia de armadilhas, cada curva pede respeito.|Verdade, quem errar o traçado paga caro.|E quem acertar voa baixo!',
'Você já pilotou um carro desses, {o}?|Só em sonho, e batia em tudo!|Hahaha, sonho de piloto com medo de curva!|Ao menos no sonho eu chegava em primeiro.',
'{o}, quanto tempo acha que dura o nitro?|Muito pouco! Quando zera, é esperar recarregar.|Cinco segundos de ansiedade total.|Melhor guardar para a reta certa.',
'O pelotão está bem apertado, {o}.|Apertadíssimo! Qualquer erro vira posição perdida.|Me deu até frio na barriga.|Fecha o olho que eu aviso quando passar.',
'{o}, o café acabou aqui na cabine.|De novo? Você bebe mais que o motor do Trovão V8!|Hahaha, é o combustível da narração!|Então volta rápido, que a corrida não espera.',
'Reparou no drift, {o}?|Reparei! Controlou a traseira como mestre.|Isso é treino de garagem, sem dúvida.|Ou muita sorte, vai saber!',
'{o}, qual carro você levaria para casa?|O Fênix Hiper, pela velocidade final.|Eu ficaria com o Pulga Turbo, pequeno e esperto.|Cada um com seu gosto, o importante é acelerar!',
'Será que vai chover, {o}?|Só olhar o céu para saber.|Se chover, a aderência vai embora.|Aí quem tem coragem aparece!',
'Que corrida, {o}! Meu coração não aguenta.|Respira, a transmissão está só começando.|Fácil falar, o {o} aqui está suando!|Então vamos juntos até a bandeirada!',
'{o}, me explica uma coisa: por que o nitro é azul?|Porque combina com o céu e com a velocidade.|Boa resposta, ninguém contesta.|Ciência não é meu forte, mas o visual é lindo!',
'A torcida está enlouquecida, {o}.|Dá para ouvir daqui o barulho!|E o piloto {p} nem liga, está concentrado.|Foco total, é assim que se ganha.']
function chat(){let a=spk(),b=spk();cq=DL[R()*DL.length|0].split('|').map((t,i)=>({n:i%2?b:a,t:t.split('{o}').join(i%2?a:b).split('{p}').join(PN())}))}
function say(k,f){if(!f&&(cH>0||gp[k]>0))return;const a=CM[k].split('|');let i,l=cS[k];do{i=R()*a.length|0}while(i==l&&a.length>1);cS[k]=i;gp[k]=14;
cq=[];const sp=spk();$('cm').innerHTML='<b>🎙️ '+sp+'</b>'+a[i].split('{b}').join(sb||'o rival').split('{p}').join(PN());$('cm').className='on';cH=4.2;cI=0;if(R()<.3){const o=spk();cq=[{n:o,t:RP[R()*RP.length|0].split('{o}').join(sp)}]}}
function extra(dt){if(pl!==cP){cP=pl;cS={};gp={};cH=cE=cL=cG=cW=cC=cV=pp=pD=pO=pLs=pNt=pNc=0;cI=0;bots.forEach(b=>b.ah=-1);say('st',1)}
cH-=dt;cC-=dt;cI+=dt;if(cH<=0){if(cq.length){const q=cq.shift();$('cm').innerHTML='<b>🎙️ '+q.n+'</b>'+q.t;$('cm').className='on';cH=4.2;cI=0}else $('cm').className=''}for(const k in gp)gp[k]-=dt;
const pos=1+bots.filter(b=>b.prog>pl.prog).length;
if(state=='race'&&cd<=0){
if(!cG){cG=1;say('go',1);for(let i=0;i<10;i++)emit(pl.x-Math.sin(pl.h)*2+(R()-.5)*2,.4,pl.z-Math.cos(pl.h)*2+(R()-.5)*2,0xdddddd,.8,1,(R()-.5)*3,1,(R()-.5)*3)}
let ev=0;bots.forEach(b=>{const d=b.prog-pl.prog;if(b.ah<0)b.ah=d>0?1:0;else if(d>2&&!b.ah){b.ah=1;ev=-1;sb=b.nm.split(' · ')[0]}else if(d<-2&&b.ah){b.ah=0;ev=1;sb=b.nm.split(' · ')[0]}});
if(ev){if(ev>0&&pos==1)say('lead',1);else if(ev<0&&pp==1)say('lost',1);else say(ev>0?'ov':'ovd',1);if(ev>0)sf('ov')}
pD=pl.drift?pD+dt:0;if(pD>1.2){say('dr');pD=0}
if(pl.off&&Math.abs(pl.vf)>5){pO+=dt;if(R()<.5)emit(pl.x-Math.sin(pl.h)*2,.3,pl.z-Math.cos(pl.h)*2,0x8a7a5a,.6,.8,0,1.5,0)}else pO=0;if(pO>1.5){say('off');pO=0}
if(pl.nt&&!pNt){say('nt');sf('nt')}pNt=pl.nt;
if(pl.nc>0&&!pNc){say('ne',1);sf('ne')}if(!(pl.nc>0)&&pNc){say('nr',1);sf('nr')}pNc=pl.nc>0;
if(pl.lap>cL){cL=pl.lap;if(cL>=2){sf('lap');say(cL==G.laps&&G.mode!=2?'fl':'lap',1)}}
if(pl.vf*3.6>250)say('sp');
bots.forEach(b=>{if(cC<=0&&Math.hypot(pl.x-b.x,pl.z-b.z)<3){cC=2;sb=b.nm.split(' · ')[0];sf('col');for(let i=0;i<6;i++)emit(pl.x,.8,pl.z,0xffcc33,.2,.5,(R()-.5)*10,3,(R()-.5)*10);say('col',1)}});
pLs=bots.length&&pos==bots.length+1?pLs+dt:0;if(pLs>7){say('last');pLs=0}
if(tm>6&&!cW){cW=1;say(W.rain?'rain':W.night?'night':'idle',1)}
if(cI>16&&!cq.length){if(R()<.55)chat();else say('idle',1)}
if(pl.nt){cam.position.x+=(R()-.5)*.1;cam.position.y+=(R()-.5)*.1;emit(pl.x-Math.sin(pl.h)*2.2,.6,pl.z-Math.cos(pl.h)*2.2,0xff6a00,.5,.25,-Math.sin(pl.h)*10,0,-Math.cos(pl.h)*10)}}
wind(dt);pp=pos;$('nc').textContent=pl.nc>0?'⚡ NITRO RECARREGANDO '+pl.nc.toFixed(1)+'s':'';$('fx').style.opacity=pl.nt?1:0;
if(state=='end'&&!cE){cE=1;const p=1+bots.filter(b=>b.ft).length;cV=p<=3;say(p==1?'win':p<=3?'pod':'los',1);sf(cV?'win':'los')}
if(state=='end'&&cV&&R()<.6)emit(pl.x+(R()-.5)*14,7,pl.z+(R()-.5)*14,COLS[R()*7|0],.3,2.5,0,-3,0)}
// vento / velocidade
const wd=$('wd'),wq=wd.getContext('2d'),WL=[];for(let i=0;i<46;i++)WL.push({a:R()*2*PI,r:R(),s:.6+R()});let ws=0;
function wind(dt){const f=pl&&(state=='race'||state=='end')?cl((Math.abs(pl.vf)*3.6-90)/200+(pl.nt?.25:0),0,1):0;ws+=(f-ws)*Math.min(1,dt*4);
if(G.cam!=0&&ws>.01){cam.position.x-=Math.sin(pl.h)*ws*.9;cam.position.z-=Math.cos(pl.h)*ws*.9}
const w=innerWidth>>1,h=innerHeight>>1;if(wd.width!=w||wd.height!=h){wd.width=w;wd.height=h}wq.clearRect(0,0,w,h);if(ws<.02)return;
const cx=w/2,cy=h/2,m=Math.hypot(cx,cy);wq.lineWidth=1.5;
WL.forEach(l=>{l.r+=dt*(.6+ws*1.8)*l.s;if(l.r>1){l.r=.05+R()*.1;l.a=R()*2*PI}const r0=m*(.3+l.r*.85),r1=r0+m*.14*ws*(1+l.r)*l.s;wq.strokeStyle='rgba(255,255,255,'+(ws*.35*Math.min(1,l.r*3)).toFixed(3)+')';wq.beginPath();wq.moveTo(cx+Math.cos(l.a)*r0,cy+Math.sin(l.a)*r0);wq.lineTo(cx+Math.cos(l.a)*r1,cy+Math.sin(l.a)*r1);wq.stroke()})}
// áudio extra
let nb,mg,mt=0,ms=0;
function ax(){if(!AC||!G.vol)return 0;if(!nb){nb=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=R()*2-1}return 1}
function tone(f,t,d,ty,v,dst){const o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(dst||AC.destination);o.start(t);o.stop(t+d+.02)}
function nz(t,d,f,v,f2,dst){const s=AC.createBufferSource();s.buffer=nb;const b=AC.createBiquadFilter();b.type='bandpass';b.frequency.setValueAtTime(f,t);b.frequency.exponentialRampToValueAtTime(f2,t+d);const g=AC.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(b);b.connect(g);g.connect(dst||AC.destination);s.start(t);s.stop(t+d)}
function cdS(n){const e=$('cd');e.style.animation='none';e.offsetWidth;e.style.animation='pop .5s ease-out';e.style.color=n>0?'#fff':'#5dff8a';if(!ax())return;const t=AC.currentTime;
if(n>0)tone(440,t,.3,'square',.1);else{tone(880,t,.7,'square',.11);tone(1320,t,.7,'triangle',.1);nz(t,.9,700,.25,3500);tone(70,t,.8,'sawtooth',.12)}}
function sf(k){if(!ax())return;const t=AC.currentTime;
if(k=='nt'){nz(t,.7,400,.2,4000);tone(200,t,.4,'sawtooth',.06)}
else if(k=='ne'){tone(400,t,.15,'square',.07);tone(250,t+.15,.35,'square',.07)}
else if(k=='nr'){tone(880,t,.15,'triangle',.12);tone(1320,t+.12,.3,'triangle',.12)}
else if(k=='lap'){tone(660,t,.15,'triangle',.14);tone(990,t+.15,.35,'triangle',.14)}
else if(k=='col'){nz(t,.3,250,.35,60);tone(70,t,.25,'sine',.3)}
else if(k=='ov')nz(t,.35,1000,.12,2800);
else(k=='win'?[523,659,784,1047,1319]:[392,349,294,262]).forEach((f,i)=>tone(f,t+i*.14,.4,'triangle',.14))}
// música de fundo (sintetizada, loop Am-F-C-G)
const CH=[[55,220,261.6,329.6],[43.65,174.6,220,261.6],[65.41,261.6,329.6,392],[49,196,246.9,293.7]];
function mus(){if(!AC||!ax()){if(mg)mg.gain.value=0;return}if(!mg){mg=AC.createGain();mg.connect(AC.destination);mt=AC.currentTime+.1}
const rc=state=='race'||state=='end';mg.gain.value=state=='pause'?.2:rc?.4:.7;if(mt<AC.currentTime-.5)mt=AC.currentTime+.05;
while(mt<AC.currentTime+.25){const i=ms&15,c=CH[(ms>>4)&3];
if(!(i&1))tone(c[0],mt,.2,'sawtooth',.09,mg);
if(i==0){tone(c[1],mt,1.8,'sine',.06,mg);tone(c[2],mt,1.8,'sine',.05,mg)}
if(rc||!(i&1))tone(c[1+i%3]*(i&4?2:1),mt,.1,'triangle',.05,mg);
if(rc&&!(i&3)){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(130,mt);o.frequency.exponentialRampToValueAtTime(40,mt+.12);g.gain.setValueAtTime(.25,mt);g.gain.exponentialRampToValueAtTime(.0001,mt+.15);o.connect(g);g.connect(mg);o.start(mt);o.stop(mt+.2)}
if(rc&&i&1)nz(mt,.04,7000,.05,7000,mg);
mt+=.12;ms++}}
setInterval(mus,40);
requestAnimationFrame(loop);
// ===== UPGRADE GRÁFICO =====
ren.shadowMap.enabled=true;ren.shadowMap.type=THREE.PCFSoftShadowMap;ren.toneMapping=THREE.ACESFilmicToneMapping;ren.toneMappingExposure=1.1;
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-60,right:60,top:60,bottom:-60,near:1,far:500});sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.0004;sun.shadow.normalBias=.06;scn.add(sun.target);
function vCv(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t}
const GT=vCv(64,64,x=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.4)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64)});
const vGl=(c,s,x,y,z,o)=>{const p=new THREE.Sprite(new THREE.SpriteMaterial({map:GT,color:c,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:o||1}));p.scale.set(s,s,1);p.position.set(x,y,z);return p};
// texturas
const ASP=vCv(128,256,(x,w,h)=>{x.fillStyle='#3a3b42';x.fillRect(0,0,w,h);for(let i=0;i<5000;i++){const v=40+R()*50|0;x.fillStyle=`rgba(${v},${v},${v+4},.5)`;x.fillRect(R()*w,R()*h,1+R()*1.5,1+R()*1.5)}
x.fillStyle='rgba(0,0,0,.2)';x.fillRect(w*.28,0,16,h);x.fillRect(w*.64,0,16,h);x.fillStyle='#e6e6e6';x.fillRect(3,0,4,h);x.fillRect(w-7,0,4,h);x.fillRect(62,0,4,h/2)});
const GRT=vCv(256,256,(x,w,h)=>{x.fillStyle='#d4d4d4';x.fillRect(0,0,w,h);for(let i=0;i<30;i++){x.fillStyle=`rgba(${R()<.5?255:90},${R()<.5?255:90},${R()<.5?255:90},.06)`;x.beginPath();x.arc(R()*w,R()*h,10+R()*30,0,7);x.fill()}for(let i=0;i<4000;i++){const v=150+R()*105|0;x.fillStyle=`rgba(${v},${v},${v},.6)`;x.fillRect(R()*w,R()*h,1+R()*2,1+R()*3)}});GRT.repeat.set(500,500);
// reflexos (ambiente)
const vEnv=(a,b,c,l)=>{const t=vCv(256,128,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,a);g.addColorStop(.5,b);g.addColorStop(.5,c);g.addColorStop(1,'#000');x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle=l;for(let i=0;i<6;i++)x.fillRect(i*43+8,18,22,10)});t.mapping=THREE.EquirectangularReflectionMapping;return t},
EV=[vEnv('#4f8fe8','#ffffff','#3b3b40','#fff'),vEnv('#5d6773','#99a3ae','#22262b','#bbb'),vEnv('#02040a','#1a2440','#050608','#ffd9a0')];
// céu: gradiente + sol/lua, estrelas cintilantes, nuvens
const SU={top:{value:new THREE.Color(0x2a62c8)},bot:{value:new THREE.Color(0x87ceeb)},sc:{value:new THREE.Vector3(1,.88,.65)},sd:{value:new THREE.Vector3(110,110,50).normalize()},t:{value:0}};
const sky=new THREE.Mesh(new THREE.SphereGeometry(2200,32,16),new THREE.ShaderMaterial({uniforms:SU,side:THREE.BackSide,depthWrite:false,fog:false,vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 top,bot,sc,sd;varying vec3 p;void main(){vec3 d=normalize(p);float h=max(d.y,0.);vec3 c=mix(bot,top,pow(h,.5));float s=max(dot(d,sd),0.);c+=sc*(pow(s,900.)*4.+pow(s,18.)*.35+pow(s,4.)*.08);gl_FragColor=vec4(c,1.);}'}));sky.renderOrder=-2;sky.frustumCulled=false;scn.add(sky);
const sg=new THREE.BufferGeometry(),vsp=new Float32Array(4500),vsf=new Float32Array(1500);for(let i=0;i<1500;i++){const a=R()*2*PI,y=R(),r=Math.sqrt(1-y*y)*2100;vsp.set([Math.cos(a)*r,y*2100,Math.sin(a)*r],i*3);vsf[i]=R()}
sg.setAttribute('position',new THREE.BufferAttribute(vsp,3));sg.setAttribute('ph',new THREE.BufferAttribute(vsf,1));
const SM=new THREE.ShaderMaterial({uniforms:{t:SU.t,o:{value:0}},transparent:true,depthWrite:false,vertexShader:'attribute float ph;uniform float t;varying float a;void main(){a=.5+.5*sin(t*2.+ph*6.28);gl_PointSize=1.5+2.5*a;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float o;varying float a;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(.8,.9,1.,o*(.4+.6*a)*(1.-d*2.));}'});
const stars=new THREE.Points(sg,SM);stars.frustumCulled=false;stars.renderOrder=-1;scn.add(stars);let vN=0,vt=0;
const CT=vCv(256,128,x=>{for(let i=0;i<14;i++){const cx=40+R()*176,cy=50+R()*30,r=22+R()*30,g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,256,128)}});
const cloudG=new THREE.Group();for(let i=0;i<16;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:CT,transparent:true,depthWrite:false,fog:false,opacity:.85}));s.scale.set(500+R()*400,220+R()*100,1);s.u={a:R()*2*PI,s:.004+R()*.006,r:900+R()*700,h:260+R()*260};cloudG.add(s)}scn.add(cloudG);
// carro detalhado
function mkCar(S,col,pil){const g=new THREE.Group(),Wd=S.w,L=S.l,H=S.h,M=(c,m,r)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r}),
A=(geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m},Bx=(w,h,d)=>new THREE.BoxGeometry(w,h,d),
pt=M(col,.75,.22),dk=M(0x111216,.4,.55),gls=new THREE.MeshStandardMaterial({color:0x0b1626,metalness:.9,roughness:.08,transparent:true,opacity:.55});
A(Bx(Wd,H,L),pt,0,.5,0);A(Bx(Wd*.94,.1,L*.3),pt,0,.5+H/2,L*.3);
const cb=A(new THREE.CylinderGeometry(.5,.72,.45,4).rotateY(PI/4),gls,0,.5+H/2+.22,-.2);cb.scale.set(Wd*.78,1,L*.4);A(Bx(Wd*.5,.04,L*.2),pt,0,.5+H/2+.45,-.2);
A(Bx(Wd*1.02,.12,.35),dk,0,.3,L/2);A(Bx(Wd*1.02,.12,.4),dk,0,.3,-L/2);
[1,-1].forEach(s=>{A(Bx(.1,.14,L*.5),dk,s*Wd/2,.3,0);A(new THREE.CylinderGeometry(.07,.07,.3,8).rotateX(PI/2),M(0x888888,1,.2),s*Wd*.3,.38,-L/2-.1);A(Bx(.14,.1,.2),pt,s*(Wd/2+.08),.5+H/2+.15,.55)});
const hm=new THREE.MeshBasicMaterial({color:0xffffe0}),tl=new THREE.MeshBasicMaterial({color:0xff2030});
[1,-1].forEach(s=>{A(Bx(Wd*.28,.1,.06),hm,s*Wd*.3,.58,L/2);A(Bx(Wd*.3,.08,.06),tl,s*Wd*.3,.58,-L/2);g.add(vGl(0xffffd0,1.6,s*Wd*.3,.6,L/2+.2,.7),vGl(0xff2030,1.4,s*Wd*.3,.6,-L/2-.2,.6))});
if(S.st)A(Bx(.3,.02,L*.9),M(0xffffff,.2,.3),0,.5+H/2+.01,0);
if(S.sp){const y=1.05+S.sp*.1;A(Bx(Wd,.08,.5),dk,0,y,-L/2+.2);[1,-1].forEach(s=>A(Bx(.06,y-.6,.1),dk,s*Wd*.35,(y+.6)/2,-L/2+.25))}
const ug=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-PI/2),new THREE.MeshBasicMaterial({map:GT,color:col,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:.7}));ug.scale.set(Wd*2.4,1,L*1.5);ug.position.y=.05;g.add(ug);
const tire=M(0x0c0c0e,0,.9),rim=M(0xc8ccd4,1,.18),wh=[];
[[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([x,z])=>{const p=new THREE.Group(),s=new THREE.Group();p.position.set(x*Wd/2,.38,z*L*.33);p.add(s);
const t=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.3,24).rotateZ(PI/2),tire);t.castShadow=true;s.add(t,new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.31,20).rotateZ(PI/2),dk),new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.34,10).rotateZ(PI/2),rim));
for(let i=0;i<5;i++){const k=new THREE.Mesh(Bx(.33,.06,.48),rim);k.rotation.x=i*PI/5;s.add(k)}g.add(p);wh.push({p,s,f:z>0})});g.userData.wh=wh;
const fl=new THREE.Group();[1,-1].forEach(s=>{const c=new THREE.Mesh(new THREE.ConeGeometry(.18,2.4,10,1,true).rotateX(-PI/2),new THREE.MeshBasicMaterial({color:0x55ccff,blending:THREE.AdditiveBlending,transparent:true,opacity:.8,depthWrite:false,side:THREE.DoubleSide}));c.position.set(s*Wd*.3,.38,-L/2-1.3);fl.add(c)});fl.visible=false;g.add(fl);g.userData.fl=fl;
const Ml=c=>new THREE.MeshLambertMaterial({color:c}),d=new THREE.Group(),hg=pil.hs==0?new THREE.SphereGeometry(.2,12,10):pil.hs==1?new THREE.BoxGeometry(.34,.34,.38):new THREE.CylinderGeometry(.17,.21,.4,12);
const h=new THREE.Mesh(hg,M(pil.hc,.3,.35)),t=new THREE.Mesh(Bx(.5,.4,.3),Ml(pil.su));h.position.y=.38;d.add(h,t);d.children.forEach(m=>m.castShadow=true);d.position.set(0,1.0,-.3);g.add(d);g.userData.dr=d;
if(pil.lamp){const l=new THREE.SpotLight(0xfff4cc,0,70,.5,.55,1),o=new THREE.Object3D();l.position.set(0,.8,L/2);o.position.set(0,0,L/2+25);g.add(l,o);l.target=o;g.userData.lamp=l}
return g}
// pista com textura
let SR=0;
function strip(o0,o1,y,cf){const road=SR++==0,pos=[],col=[],uv=[],P=(i,o)=>{const a=trk[i%N];return[a.x+a.nx*o,y,a.z+a.nz*o]};
for(let i=0;i<N;i++){const c=road?(i%2?[.93,.93,.95]:[1,1,1]):cf(i),q=[P(i,o0),P(i,o1),P(i+1,o1),P(i+1,o0)],v=i*.25,U=[[0,v],[1,v],[1,v+.25],[0,v+.25]];[0,1,2,0,2,3].forEach(k=>{pos.push(...q[k]);col.push(...c);uv.push(...U[k])})}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
const m=new THREE.Mesh(g,road?new THREE.MeshStandardMaterial({vertexColors:true,map:ASP,roughness:.9,metalness:0,side:THREE.DoubleSide}):new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));m.receiveShadow=true;if(road)W.road=m;return m}
// cenário extra: árvores com tronco, postes, pórtico, montanhas facetadas
const _bd=build;build=function(ti){SR=0;_bd(ti);const T=W.T,gr=world.children[0];gr.material.map=GRT;gr.receiveShadow=true;
const tr=world.children.find(o=>o.isInstancedMesh),mt=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3(),
tk=new THREE.InstancedMesh(new THREE.CylinderGeometry(.35,.55,3,7),new THREE.MeshLambertMaterial({color:0x5a3a22}),220),
tp=new THREE.InstancedMesh(new THREE.ConeGeometry(2.4,6,7),new THREE.MeshLambertMaterial({color:new THREE.Color(T.t).offsetHSL(0,0,.06)}),220);
for(let i=0;i<220;i++){tr.getMatrixAt(i,mt);mt.decompose(p,q,s);const x=p.x,z=p.z,k=s.x;mt.compose(p.set(x,1.5*k,z),q,s);tk.setMatrixAt(i,mt);mt.compose(p.set(x,8.2*k,z),q,s.multiplyScalar(.72));tp.setMatrixAt(i,mt)}
tr.castShadow=tk.castShadow=tp.castShadow=true;world.add(tk,tp);
world.children.forEach(o=>{if(o.geometry&&o.geometry.type=='ConeGeometry'&&o.geometry.parameters.radialSegments==5){o.material.flatShading=true;o.material.needsUpdate=true}});
const pn=40,neon=T===TRACKS[3],lc=neon?0xff4fd8:0xfff1c0,pm=new THREE.InstancedMesh(new THREE.CylinderGeometry(.12,.18,9,6),new THREE.MeshLambertMaterial({color:0x8a8f99}),pn*2),hd=new THREE.InstancedMesh(new THREE.BoxGeometry(1.4,.25,.5),new THREE.MeshBasicMaterial({color:lc}),pn*2);W.gl=new THREE.Group();
for(let i=0;i<pn*2;i++){const a=trk[(i>>1)*(N/pn)|0],o=(i&1?-1:1)*(HW+4),x=a.x+a.nx*o,z=a.z+a.nz*o;mt.makeTranslation(x,4.5,z);pm.setMatrixAt(i,mt);mt.makeTranslation(x,9.1,z);hd.setMatrixAt(i,mt);W.gl.add(vGl(lc,11,x,8.8,z,.85))}
pm.castShadow=true;world.add(pm,hd,W.gl);
const a0=trk[0],gg=new THREE.Group(),bm=new THREE.MeshStandardMaterial({color:0x222831,metalness:.8,roughness:.3}),
bt=vCv(512,64,(x,w,h)=>{x.fillStyle='#0a0e1a';x.fillRect(0,0,w,h);for(let i=0;i<4;i++)for(let j=0;j<8;j++){x.fillStyle=(i+j)%2?'#fff':'#111';x.fillRect(j*8,i*16,8,16);x.fillRect(w-64+j*8,i*16,8,16)}x.font='900 38px system-ui';x.textAlign='center';x.fillStyle='#00e5ff';x.shadowColor='#00e5ff';x.shadowBlur=14;x.fillText('OLD RACERS',w/2,45)});
[-1,1].forEach(k=>{const b=new THREE.Mesh(new THREE.BoxGeometry(.7,10,.7),bm);b.position.set(k*(HW+2),5,0);b.castShadow=true;gg.add(b)});
const bn=new THREE.Mesh(new THREE.BoxGeometry((HW+2)*2,1.8,.8),new THREE.MeshBasicMaterial({map:bt}));bn.position.y=9.6;gg.add(bn,vGl(0x00e5ff,14,0,9.6,-.6,.4));gg.position.set(a0.x,0,a0.z);gg.rotation.y=Math.atan2(a0.tx,a0.tz);world.add(gg);setWx()}
// clima / céu
const _sw=setWx;setWx=function(){_sw();const w=G.wx==3?W.aw:G.wx,T=W.T||TRACKS[0],ti=TRACKS.indexOf(T),sk=new THREE.Color(w==2?0x070b1c:w==1?0x6b7785:T.sky);
SU.top.value.copy(w==2?new THREE.Color(0x01030c):w==1?new THREE.Color(0x3f4a58):sk.clone().lerp(new THREE.Color(ti==4?0x3a1410:0x2a62c8),ti==4?.7:.55));SU.bot.value.copy(sk);
SU.sc.value.set(...(w==2?[.55,.65,1]:w==1?[0,0,0]:[1,.88,.65]));vN=w==2?1:0;
cloudG.children.forEach(c=>{c.material.color.set(w==2?0x1a2236:w==1?0x59616d:0xffffff);c.material.opacity=w==2?.35:w==1?.9:.85});
scn.environment=EV[w==2?2:w==1?1:0];ren.toneMappingExposure=w==2?1.3:1.1;if(W.road){W.road.material.roughness=w==1?.2:.9;W.road.material.metalness=w==1?.35:0}if(W.gl)W.gl.visible=w==2};
// rodas, chama do nitro, fumaça do drift
function vWl(c,dt,st){const u=c.mesh.userData,w=u.wh;if(!w)return;c.ws=(c.ws||0)+c.vf*dt/.38;w.forEach(k=>{k.s.rotation.x=c.ws;if(k.f)k.p.rotation.y=-(st||0)*.45});
if(u.fl){u.fl.visible=!!c.nt;if(c.nt)u.fl.scale.z=.8+R()*.7}
if(c.pl&&c.drift&&R()<.8){const s=Math.sin(c.h),k=Math.cos(c.h),l=c.s.l*.33;for(const q of[-1,1])emit(c.x-s*l+k*q*c.s.w/2,.2,c.z-k*l-s*q*c.s.w/2,0xcccccc,.7,1,0,1.2,0)}}
const _ph=phys;phys=function(c,dt,u){_ph(c,dt,u);vWl(c,dt,u.st)};
const _bm=botMove;botMove=function(b,dt){_bm(b,dt);vWl(b,dt,0)};
const _em=emit;emit=function(x,y,z,c,s,l,a,b,d){_em(x,y,z,c,s,l,a,b,d);PS[(pi-1)%170].material.blending=[0x4cc9ff,0xffaa33,0xff6a00,0xffcc33].includes(c)?THREE.AdditiveBlending:THREE.NormalBlending};
const _rs=rs;rs=function(){_rs();sun.castShadow=G.q>0};
const _pa=parts;parts=function(dt){_pa(dt);vt+=dt;const o=(state=='menu'||!pl)?prev:pl.mesh,t=o?o.position:cam.position;
sun.target.position.copy(t);sun.position.set(t.x+110,t.y+110,t.z+50);sky.position.copy(cam.position);stars.position.copy(cam.position);cloudG.position.set(cam.position.x,0,cam.position.z);SU.t.value=vt;
cloudG.children.forEach(c=>{c.u.a+=dt*c.u.s;c.position.set(Math.cos(c.u.a)*c.u.r,c.u.h,Math.sin(c.u.a)*c.u.r)});SM.uniforms.o.value+=(vN-SM.uniforms.o.value)*Math.min(1,dt*2)};
// interface
const vs=document.createElement('style');vs.textContent='#vg{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 58%,rgba(0,0,0,.5));pointer-events:none}h1{animation:glw 3s ease-in-out infinite alternate}@keyframes glw{to{filter:drop-shadow(0 0 30px rgba(255,45,117,.55))}}.card{box-shadow:0 8px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.12)}';document.head.appendChild(vs);
const vg=document.createElement('div');vg.id='vg';$('hud').insertBefore(vg,$('hud').firstChild);

// ===== UPGRADE 2 =====
const SK=new THREE.InstancedMesh(new THREE.PlaneGeometry(.35,1.3).rotateX(-PI/2),new THREE.MeshBasicMaterial({color:0x050505,transparent:true,opacity:.55,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),1200);SK.frustumCulled=false;scn.add(SK);let ski=0,sx=0,sz=0;
function vRst(){const z=new THREE.Matrix4().makeScale(0,0,0);for(let i=0;i<1200;i++)SK.setMatrixAt(i,z);SK.instanceMatrix.needsUpdate=true;ski=0}vRst();
const lf=document.createElement('div');lf.style.cssText='position:fixed;width:360px;height:360px;margin:-180px 0 0 -180px;border-radius:50%;pointer-events:none;opacity:0;background:radial-gradient(circle,rgba(255,240,200,.9),rgba(255,200,120,.25) 30%,transparent 65%);mix-blend-mode:screen';document.body.insertBefore(lf,$('g').nextSibling);
// detalhes extras nos carros
const _mc=mkCar;mkCar=function(S,col,pil){const g=_mc(S,col,pil),Wd=S.w,L=S.l,H=S.h;g.rotation.order='YXZ';
const n=1+(R()*98|0),nm=new THREE.MeshBasicMaterial({map:vCv(64,64,x=>{x.fillStyle='#fff';x.beginPath();x.arc(32,32,30,0,7);x.fill();x.fillStyle='#111';x.font='900 34px system-ui';x.textAlign='center';x.fillText(n,32,44)}),transparent:true}),dk=new THREE.MeshStandardMaterial({color:0x111216,metalness:.4,roughness:.5});
[1,-1].forEach(s=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(.5,.5),nm);p.position.set(s*(Wd/2+.012),.52,-.15);p.rotation.y=s*PI/2;g.add(p)});
const sc=new THREE.Mesh(new THREE.BoxGeometry(.5,.1,.5),dk);sc.position.set(0,.5+H/2+.08,L*.3);sc.castShadow=true;g.add(sc);
const pl=new THREE.Mesh(new THREE.BoxGeometry(.5,.15,.03),new THREE.MeshBasicMaterial({color:0xf2f2f2}));pl.position.set(0,.5,-L/2-.02);g.add(pl);
g.userData.tg=[];g.traverse(o=>{const c=o.material&&o.material.color;if(c&&c.getHex()==0xff2030){if(o.isSprite)g.userData.tg.push(o);else if(o.isMesh)g.userData.tl=o.material}});
if(pil.lamp){const b=new THREE.Mesh(new THREE.ConeGeometry(3.2,16,16,1,true).rotateX(-PI/2),new THREE.MeshBasicMaterial({color:0xfff2c0,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));b.position.set(0,.7,L/2+8);b.visible=false;g.add(b);g.userData.hb=b}
return g};
// helpers de cenário
// posiciona a arquibancada sem invadir a pista: testa os dois lados e deslocamentos ao longo da reta,
// e afasta o que for preciso para que nenhum trecho da pista (inclusive curvas e trechos vizinhos) encoste nela
function vStand(st,a0){const th=Math.atan2(a0.tx,a0.tz);let best=null;
for(const sd of[1,-1])for(const dz of[0,-25,25,-50,50,-75,75]){const xx=a0.tz*sd,xz=-a0.tx*sd,zx=a0.tx*sd,zz=a0.tz*sd;let mx=-1e9;
for(let j=0;j<N;j++){const p=trk[j],dx=p.x-a0.x,dy=p.z-a0.z,lx=dx*xx+dy*xz,lz=dx*zx+dy*zz;if(lz>dz-80&&lz<dz+80&&lx>-HW-2&&lx<70&&lx>mx)mx=lx}
const ex=Math.max(2,mx-2.5),sc=ex+Math.abs(dz)*.04;if(!best||sc<best.sc-1e-6)best={sd,dz,ex,sc}}
st.position.set(a0.x,0,a0.z);st.rotation.y=th+(best.sd<0?PI:0);st.translateX(best.ex);st.translateZ(best.dz)}
function vSc(n,a,b,md){const o=[];for(let i=0;i<n;i++)for(let k=0;k<25;k++){const an=R()*2*PI,r=(a+R()*(b-a))*W.T.R,x=Math.cos(an)*r,z=Math.sin(an)*r*.8;let ok=1;for(let j=0;j<N;j+=4)if((trk[j].x-x)**2+(trk[j].z-z)**2<md*md){ok=0;break}if(ok){o.push([x,z]);break}}return o}
function vIn(geo,mat,pts,y,s0,s1){const m=new THREE.InstancedMesh(geo,mat,pts.length),mt=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),s=new THREE.Vector3(),u=new THREE.Vector3(0,1,0);pts.forEach((c,i)=>{const k=s0+R()*(s1-s0);q.setFromAxisAngle(u,R()*6.3);mt.compose(p.set(c[0],y*k,c[1]),q,s.set(k,k,k));m.setMatrixAt(i,mt)});m.castShadow=true;world.add(m);return m}
function vPar(n,c,sz,vy,add){const g=new THREE.BufferGeometry(),a=new Float32Array(n*3);for(let i=0;i<n*3;i+=3){a[i]=R()*140-70;a[i+1]=R()*40;a[i+2]=R()*140-70}g.setAttribute('position',new THREE.BufferAttribute(a,3));const p=new THREE.Points(g,new THREE.PointsMaterial({color:c,size:sz,map:GT,transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}));p.frustumCulled=false;p.vy=vy;world.add(p);W.pp=p}
const _b2=build;build=function(ti){_b2(ti);vRst();const T=W.T,mt=new THREE.Matrix4();W.pp=null;W.cr=[];
vIn(new THREE.DodecahedronGeometry(1.5,0),new THREE.MeshLambertMaterial({color:ti==2?0xc9d3dc:0x7a7a80,flatShading:true}),vSc(70,.15,1.5,14),.5,.6,2.2);
if(ti!=1&&ti!=2&&ti!=4)vIn(new THREE.IcosahedronGeometry(1.3,1),new THREE.MeshLambertMaterial({color:new THREE.Color(T.t).offsetHSL(.02,.1,.1)}),vSc(80,.15,1.4,12),.6,.7,1.6);
// arquibancada com torcida animada
const a0=trk[0],st=new THREE.Group(),sm=new THREE.MeshStandardMaterial({color:0x2b3040,metalness:.5,roughness:.5});
for(let r=0;r<3;r++){const b=new THREE.Mesh(new THREE.BoxGeometry(2,(r+1)*1.1,140),sm);b.position.set(HW+8+r*2,(r+1)*.55,0);b.castShadow=b.receiveShadow=true;st.add(b);
const cr=new THREE.InstancedMesh(new THREE.BoxGeometry(.8,1.3,.8),new THREE.MeshLambertMaterial(),88);for(let i=0;i<88;i++){mt.makeTranslation(HW+8+r*2,(r+1)*1.1+.65,-68+i*1.55);cr.setMatrixAt(i,mt);cr.setColorAt(i,new THREE.Color().setHSL(R(),.7,.55))}cr.castShadow=true;st.add(cr);W.cr.push(cr)}
const rf=new THREE.Mesh(new THREE.BoxGeometry(8,.3,140),sm);rf.position.set(HW+10,6.4,0);rf.castShadow=true;st.add(rf);[-66,-22,22,66].forEach(z=>{const p=new THREE.Mesh(new THREE.BoxGeometry(.3,6.4,.3),sm);p.position.set(HW+13.5,3.2,z);st.add(p)});
vStand(st,a0);world.add(st);
// outdoors
const ad=['TURBO NITRO','FÊNIX HIPER','GRIP+ PNEUS','ARENA RACE'].map((t,i)=>vCv(256,100,(x,w,h)=>{x.fillStyle=['#ff2d75','#00b8d4','#f4c430','#7c4dff'][i];x.fillRect(0,0,w,h);x.fillStyle='#fff';x.font='900 30px system-ui';x.textAlign='center';x.fillText(t,w/2,60);x.strokeStyle='#fff';x.lineWidth=5;x.strokeRect(5,5,w-10,h-10)})),pm=new THREE.MeshLambertMaterial({color:0x666b75});
for(let i=0;i<10;i++){const a=trk[(30+i*38)%N],o=(i&1?-1:1)*(HW+7),g=new THREE.Group(),b=new THREE.Mesh(new THREE.PlaneGeometry(10,4),new THREE.MeshBasicMaterial({map:ad[i%4],side:THREE.DoubleSide}));b.position.y=5;g.add(b);[-4,4].forEach(x=>{const p=new THREE.Mesh(new THREE.BoxGeometry(.25,5,.25),pm);p.position.set(x,2.5,0);g.add(p)});g.position.set(a.x+a.nx*o,0,a.z+a.nz*o);g.rotation.y=Math.atan2(a.tx,a.tz)+PI/2;world.add(g)}
// pneus nas curvas fechadas
const tp=[];for(let i=0;i<N;i++){const A=trk[i],B=trk[(i+8)%N],cr=A.tx*B.tz-A.tz*B.tx;if(Math.abs(cr)>.2){const o=-Math.sign(cr)*(HW+2.8);tp.push([A.x+A.nx*o,A.z+A.nz*o])}}
if(tp.length){const tb=new THREE.InstancedMesh(new THREE.CylinderGeometry(.7,.7,.55,12),new THREE.MeshLambertMaterial(),tp.length*2);tp.forEach((c,i)=>[0,1].forEach(k=>{mt.makeTranslation(c[0],.3+k*.55,c[1]);tb.setMatrixAt(i*2+k,mt);tb.setColorAt(i*2+k,new THREE.Color(((i>>2)+k)%2?0xe63946:0xf2f2f2))}));tb.castShadow=true;world.add(tb)}
// por pista
if(ti==3){const wt=vCv(64,128,(x,w,h)=>{x.fillStyle='#10142a';x.fillRect(0,0,w,h);for(let i=0;i<12;i++)for(let j=0;j<6;j++)if(R()<.65){x.fillStyle=['#ffd27a','#6fe9ff','#ff6fd0','#fff'][R()*4|0];x.fillRect(j*10+3,i*10+4,6,6)}}),pts=vSc(90,.15,1.4,40),bi=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({map:wt,color:0xb0b8d8}),pts.length),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();pts.forEach((c,i)=>{const w=14+R()*14,h=30+R()*90;mt.compose(p.set(c[0],h/2,c[1]),q,s.set(w,h,w));bi.setMatrixAt(i,mt)});world.add(bi)}
if(ti==1)vIn(new THREE.CylinderGeometry(.6,.7,6,8),new THREE.MeshLambertMaterial({color:0x3b7a3b}),vSc(45,.15,1.4,14),3,.7,1.6);
if(ti==2)vPar(700,0xffffff,.5,-3,0);
if(ti==4){const lp=vSc(14,.2,1.2,30);vIn(new THREE.CircleGeometry(6,20).rotateX(-PI/2),new THREE.MeshBasicMaterial({color:0xff6a1a}),lp,.03,1,3);lp.forEach(c=>world.add(vGl(0xff5a10,40,c[0],3,c[1],.5)));vPar(500,0xff7a20,.8,5,1)}
if(ti==5){const sea=new THREE.Mesh(new THREE.RingGeometry(700,4000,64).rotateX(-PI/2),new THREE.MeshStandardMaterial({color:0x1aa3c8,metalness:.6,roughness:.15}));sea.position.y=-.02;world.add(sea)}};
// frenagem, inclinação da suspensão e marcas de pneu
const _p3=phys;phys=function(c,dt,u){_p3(c,dt,u);const m=c.mesh.userData,a=(c.vf-(c.pv||0))/Math.max(dt,.001);c.pv=c.vf;c.pa=(c.pa||0)+(a-(c.pa||0))*Math.min(1,dt*6);c.mesh.rotation.x=cl(-c.pa*.0025,-.05,.05);
if(m.tl){const b=u.br>0&&c.vf>1;m.tl.color.setHex(b?0xff5060:0x991020);m.tg.forEach(s=>s.material.opacity=b?1:.5)}
if(c.drift&&Math.hypot(c.x-sx,c.z-sz)>.7){sx=c.x;sz=c.z;const s=Math.sin(c.h),k=Math.cos(c.h),l=c.s.l*.33,q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.atan2(c.vx,c.vz)),p=new THREE.Vector3(),sc=new THREE.Vector3(1,1,1),mt=new THREE.Matrix4();
for(const e of[-1,1]){mt.compose(p.set(c.x-s*l+k*e*c.s.w/2,.045,c.z-k*l-s*e*c.s.w/2),q,sc);SK.setMatrixAt(ski++%1200,mt)}SK.instanceMatrix.needsUpdate=true}};
const _b3=botMove;botMove=function(b,dt){_b3(b,dt);b.nt=b.v>b.s.top*.8&&Math.sin(vt*.8+b.off*3)>.75};
// efeitos por frame
const _p2=parts;parts=function(dt){_p2(dt);const hb=pl&&pl.mesh.userData.hb;if(hb)hb.visible=!!W.night&&state!='menu';
if(W.cr)W.cr.forEach((m,i)=>m.position.y=Math.abs(Math.sin(vt*5+i*2))*.25);
if(W.pp){const p=W.pp,a=p.geometry.attributes.position.array,v=p.vy;p.position.set(cam.position.x,0,cam.position.z);for(let i=0;i<a.length;i+=3){a[i+1]+=v*dt;a[i]+=Math.sin(vt+i)*dt*.8;if(a[i+1]<0)a[i+1]+=40;else if(a[i+1]>40)a[i+1]-=40}p.geometry.attributes.position.needsUpdate=true}
const v=SU.sd.value.clone().multiplyScalar(1000).add(cam.position).project(cam);lf.style.left=(v.x*.5+.5)*innerWidth+'px';lf.style.top=(.5-v.y*.5)*innerHeight+'px';lf.style.opacity=v.z<1&&!W.night&&!W.rain?cl(1.2-Math.hypot(v.x,v.y)*.8,0,1)*.8:0};
buildMenu();
rs();
// ===== UPGRADE 3: OLD RACERS (carros detalhados, rodas animadas, partículas macias, câmera) =====
(function(){
const S3=(c,m,r)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r});
const SHT=vCv(64,64,x=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(0,0,0,.8)');g.addColorStop(.6,'rgba(0,0,0,.3)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64)});
const CF=vCv(16,16,x=>{x.fillStyle='#131418';x.fillRect(0,0,16,16);x.fillStyle='#2b2e36';for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i+j)%2)x.fillRect(i*4,j*4,4,4)});CF.repeat.set(5,5);
// carros: pintura com verniz, fibra de carbono, arcos de roda, grade, faróis, freios, sombra de contato
const _mk=mkCar;mkCar=function(S,col,pil){
const g=_mk(S,col,pil),Wd=S.w,L=S.l,H=S.h,u=g.userData,
paint=new THREE.MeshPhysicalMaterial({color:col,metalness:.55,roughness:.28,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:1.4}),
cfm=new THREE.MeshStandardMaterial({map:CF,metalness:.5,roughness:.35}),blk=S3(0x08090b,.2,.7),
lens=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffc0,emissiveIntensity:1.3}),
A=(geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m},Bx=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
g.traverse(o=>{if(!o.isMesh||!o.material.color)return;const h=o.material.color.getHex();if(h==col&&o.material.metalness==.75)o.material=paint;else if(h==0x111216)o.material=cfm});
[1,-1].forEach(s=>{
[1,-1].forEach(z=>A(new THREE.TorusGeometry(.42,.05,6,20,PI).rotateY(PI/2),paint,s*(Wd/2+.02),.34,z*L*.33));
A(Bx(.015,H*.85,.02),blk,s*(Wd/2+.01),.5,L*.12);A(Bx(.015,H*.85,.02),blk,s*(Wd/2+.01),.5,-L*.22);A(Bx(.02,.03,.16),blk,s*(Wd/2+.015),.55+H*.15,-L*.05);
A(new THREE.SphereGeometry(.085,10,8),lens,s*Wd*.3,.58,L/2+.02);A(Bx(Wd*.12,.05,.5),blk,s*Wd*.2,.5+H/2+.075,L*.3)});
A(Bx(Wd*.28,.12,.05),blk,0,.5,L/2+.005);
const cs=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-PI/2),new THREE.MeshBasicMaterial({map:SHT,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));cs.scale.set(Wd*1.5,1,L*1.25);cs.position.y=.035;g.add(cs);
const bdm=S3(0x9aa0a8,1,.35),cal=S3(0xd01020,.3,.4);u.bd=bdm;
u.wh.forEach(w=>{const s=w.s,x=w.p.position.x>0?1:-1,tm=s.children[0].material,rm=s.children[2].material;
[.15,-.15].forEach(k=>{const t=new THREE.Mesh(new THREE.TorusGeometry(.31,.07,8,24).rotateY(PI/2),tm);t.position.x=k;s.add(t)});
const lip=new THREE.Mesh(new THREE.TorusGeometry(.25,.025,6,20).rotateY(PI/2),rm);lip.position.x=x*.14;s.add(lip);
const d=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.03,20).rotateZ(PI/2),bdm);d.position.x=-x*.07;s.add(d);
const c=new THREE.Mesh(Bx(.08,.14,.2),cal);c.position.set(-x*.07,.2,-.04);w.p.add(c);
const bm=new THREE.MeshBasicMaterial({color:0x15161a,transparent:true,opacity:0,depthWrite:false}),bl=new THREE.Mesh(new THREE.CylinderGeometry(.37,.37,.2,20).rotateZ(PI/2),bm);w.p.add(bl);w.bl=bm});
return g};
// partículas macias (sprites) para fumaça, poeira, faíscas e chamas
PS.forEach((m,i)=>{scn.remove(m);const p=new THREE.Sprite(new THREE.SpriteMaterial({map:GT,transparent:true,depthWrite:false}));p.visible=false;p.life=0;scn.add(p);PS[i]=p});
const _e3=emit;emit=function(x,y,z,c,s,l,a,b,d){_e3(x,y,z,c,s*2.4,l,a,b,d)};
const rm=rain.material;rm.map=GT;rm.transparent=true;rm.depthWrite=false;rm.opacity=.7;rm.size=.45;rm.needsUpdate=true;
// animação de rodas, suspensão, motorista, estouros de escapamento e faíscas
function an(c,dt,st,br){const m=c.mesh,u=m.userData,sp=Math.abs(c.vf||0),t=vt,of=c.pl&&c.off;
(u.wh||[]).forEach((w,i)=>{w.p.position.y=.38+Math.sin(t*(17+i*3)+i*2)*Math.min(sp,60)*.0005+(of?Math.sin(t*45+i*5)*.02*Math.min(sp/25,1):0);if(w.bl)w.bl.opacity=cl((sp-16)/45,0,.5)});
if(u.bd)u.bd.emissive.setHex(br&&sp>12?0xaa2200:0);
if(u.dr)u.dr.rotation.set(0,-st*.35,-st*.1);
m.position.y=Math.sin(t*38+(c.x||0))*.005*cl(sp/40,0,1)+(of?Math.sin(t*55)*.02*cl(sp/30,0,1):0)}
const _p4=phys;phys=function(c,dt,i){_p4(c,dt,i);c.sv=i.st;an(c,dt,i.st,i.br>0);const sp=Math.abs(c.vf),bx=c.x-Math.sin(c.h)*c.s.l/2,bz=c.z-Math.cos(c.h)*c.s.l/2;
if(c.pg!=null&&c.gear>c.pg&&sp>8&&i.th>0)for(let k=0;k<4;k++)emit(bx+(R()-.5)*.8,.45,bz+(R()-.5)*.8,0xffaa33,.35,.2,(R()-.5)*3,1+R()*2,(R()-.5)*3);
c.pg=c.gear;if(c.drift&&sp>18&&R()<.35)emit(bx,.25,bz,0xffcc33,.12,.35,(R()-.5)*5,2+R()*2,(R()-.5)*5)};
const _b5=botMove;botMove=function(b,dt){_b5(b,dt);an(b,dt,0,0)};
const _p5=parts;parts=function(dt){_p5(dt);if(state=='menu'&&prev&&prev.userData.wh)prev.userData.wh.forEach(k=>k.s.rotation.x+=dt*3)};
// câmera: inclina nas curvas e treme em alta velocidade
const _cu=camUpd;camUpd=function(dt){_cu(dt);const sp=Math.abs(pl.vf);cam.rotateZ(-(pl.sv||0)*.03*cl(sp/45,0,1));if(sp>35){const k=(sp-35)*.0006;cam.position.x+=(R()-.5)*k;cam.position.y+=(R()-.5)*k}};
// pista com relevo e sombras mais nítidas na qualidade alta
const _b4=build;build=function(ti){_b4(ti);if(W.road){W.road.material.bumpMap=ASP;W.road.material.bumpScale=.5;W.road.material.needsUpdate=true}};
let q0=-1;const _r3=rs;rs=function(){_r3();if(q0!=G.q){q0=G.q;const z=G.q==2?4096:G.q==1?2048:1024;sun.shadow.mapSize.set(z,z);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}}};
rs();buildMenu();
})();

// ===== UPGRADE 4: ÁRVORES COM TEXTURA DE MADEIRA E FOLHAS =====
(function(){
const WT=vCv(64,128,(x,w,h)=>{x.fillStyle='#6a4a2c';x.fillRect(0,0,w,h);
for(let i=0;i<w;i++){const d=R()<.5;x.fillStyle='rgba('+(d?30:200)+','+(d?18:150)+','+(d?8:100)+','+(.12+R()*.18)+')';x.fillRect(i,0,1+R()*2,h)}
for(let i=0;i<40;i++){const px=R()*w;x.strokeStyle='rgba(25,14,6,'+(.2+R()*.3)+')';x.lineWidth=1+R()*1.5;x.beginPath();x.moveTo(px,R()*h);x.bezierCurveTo(px+4,R()*h,px-4,R()*h,px+R()*6-3,R()*h);x.stroke()}
for(let i=0;i<3;i++){x.fillStyle='rgba(20,10,4,.6)';x.beginPath();x.ellipse(R()*w,R()*h,3+R()*3,5+R()*4,0,0,7);x.fill()}});
WT.repeat.set(2,2);
const LT=vCv(128,128,(x,w,h)=>{x.fillStyle='#8c8c8c';x.fillRect(0,0,w,h);
for(let i=0;i<900;i++){const v=70+R()*185|0;x.save();x.translate(R()*w,R()*h);x.rotate(R()*7);x.fillStyle='rgba('+v+','+v+','+v+',.85)';x.beginPath();x.ellipse(0,0,1.5+R()*2,4+R()*5,0,0,7);x.fill();x.restore()}
for(let i=0;i<120;i++){x.fillStyle='rgba(30,30,30,.35)';x.beginPath();x.arc(R()*w,R()*h,2+R()*4,0,7);x.fill()}});
LT.repeat.set(4,3);
const isI=(o,t,s)=>o.isInstancedMesh&&o.geometry.type==t&&o.geometry.parameters.radialSegments==s;
const LY=[[3.3,4.6,4.7],[2.5,4,6.6],[1.7,3.6,8.4]],UP=new THREE.Vector3(0,1,0);
const _b6=build;build=function(ti){_b6(ti);const T=W.T,tr=world.children.find(o=>isI(o,'ConeGeometry',6));
if(tr){const n=tr.count,mt=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3(),col=new THREE.Color(),
tk=new THREE.InstancedMesh(new THREE.CylinderGeometry(.3,.6,5,9),new THREE.MeshLambertMaterial({map:WT}),n),
lf=new THREE.InstancedMesh(new THREE.ConeGeometry(1,1,10,1),new THREE.MeshLambertMaterial({map:LT}),n*3);
for(let i=0;i<n;i++){tr.getMatrixAt(i,mt);mt.decompose(p,q,s);const k=s.x,x=p.x,z=p.z;
mt.compose(p.set(x,2.5*k,z),q.setFromAxisAngle(UP,R()*6.3),s.set(k,k,k));tk.setMatrixAt(i,mt);
col.set(T.t).offsetHSL((R()-.5)*.04,.05,.2+R()*.1);
LY.forEach((l,j)=>{const w=l[0]*k;mt.compose(p.set(x,l[2]*k,z),q.setFromAxisAngle(UP,R()*6.3),s.set(w,l[1]*k,w));lf.setMatrixAt(i*3+j,mt);lf.setColorAt(i*3+j,col)})}
lf.instanceColor.needsUpdate=true;tk.castShadow=lf.castShadow=true;tk.receiveShadow=lf.receiveShadow=true;
world.children.filter(o=>o===tr||isI(o,'CylinderGeometry',7)||isI(o,'ConeGeometry',7)).forEach(o=>{world.remove(o);o.geometry.dispose()});
world.add(tk,lf)}
world.children.filter(o=>o.isInstancedMesh&&o.geometry.type=='IcosahedronGeometry').forEach(o=>{o.material.map=LT;o.material.needsUpdate=true})};
buildMenu();
})();

// ===== UPGRADE 5: TORCIDA COM PESSOAS (cabeça, cabelo, tronco, braços e pernas) =====
(function(){
const UP=new THREE.Vector3(0,1,0),ZA=new THREE.Vector3(0,0,1),SC=new THREE.Vector3(1,1,1),mt=new THREE.Matrix4(),v=new THREE.Vector3(),q=new THREE.Quaternion(),q2=new THREE.Quaternion();
const SKIN=[0xf1c27d,0xe0ac69,0xc68642,0x8d5524,0xffdbac,0x6b4423],HAIR=[0x111111,0x3b2414,0x6a4a2a,0xd9b45a,0xa0522d,0x8a8a8a],PANT=[0x223355,0x333333,0x554433,0x1a1a1a,0x445566,0x2d3b2d];
function put(m,k,p,lx,ly,lz,rz,jp){v.set(lx,ly+jp,lz).applyAxisAngle(UP,p.yaw).add(p.pos);q.setFromAxisAngle(UP,p.yaw);if(rz){q2.setFromAxisAngle(ZA,rz);q.multiply(q2)}mt.compose(v,q,SC);m.setMatrixAt(k,mt)}
function anim(t){const P=W.pe;if(!P)return;
P.ps.forEach((p,i)=>{const w=.5+.5*Math.sin(t*1.8-p.z*.12),a=p.e*(.25+.75*w),jp=a*Math.abs(Math.sin(t*6+p.ph))*.22,sw=Math.sin(t*7+p.ph),ang=a*(.62*PI+.2*PI*sw)+(1-a)*(.07+.04*sw);
put(P.lg,2*i,p,-.1,.275,0,0,jp);put(P.lg,2*i+1,p,.1,.275,0,0,jp);put(P.to,i,p,0,.8,0,0,jp);put(P.hd,i,p,0,1.2,0,0,jp);put(P.hr,i,p,0,1.215,-.01,0,jp);
put(P.am,2*i,p,-.27,1.0,0,-ang,jp);put(P.am,2*i+1,p,.27,1.0,0,ang,jp)});
['lg','to','hd','hr','am'].forEach(k=>P[k].instanceMatrix.needsUpdate=true)}
const _b7=build;build=function(ti){_b7(ti);const old=W.cr||[];if(!old.length)return;const st=old[0].parent;if(!st)return;
old.forEach(m=>{st.remove(m);m.geometry.dispose()});W.cr=[];
const n=354,mk=(geo,c)=>{const m=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial(),c);m.castShadow=true;m.frustumCulled=false;st.add(m);return m},
lg=mk(new THREE.BoxGeometry(.15,.55,.16),n*2),to=mk(new THREE.BoxGeometry(.42,.5,.24),n),hd=mk(new THREE.SphereGeometry(.15,10,8),n),
hr=mk(new THREE.SphereGeometry(.16,10,5,0,2*PI,0,PI*.55),n),am=mk(new THREE.BoxGeometry(.11,.5,.11).translate(0,-.25,0),n*2),ps=[],c=new THREE.Color(),pk=a=>a[R()*a.length|0];
for(let r=0;r<3;r++)for(let i=0;i<118;i++){const k=ps.length,z=-68+i*1.15;ps.push({pos:new THREE.Vector3(HW+8+r*2+(R()-.5)*.5,(r+1)*1.1,z+(R()-.5)*.3),yaw:-PI/2+(R()-.5)*.6,ph:R()*6.3,e:R()<.7?.6+R()*.4:.15,z});
c.setHex(pk(PANT));lg.setColorAt(2*k,c);lg.setColorAt(2*k+1,c);c.setHSL(R(),.65,.3+R()*.3);to.setColorAt(k,c);
c.setHex(pk(SKIN));hd.setColorAt(k,c);am.setColorAt(2*k,c);am.setColorAt(2*k+1,c);
if(R()<.2)c.setHSL(R(),.7,.5);else c.setHex(pk(HAIR));hr.setColorAt(k,c)}
[lg,to,hd,hr,am].forEach(m=>m.instanceColor.needsUpdate=true);
W.pe={ps,lg,to,hd,hr,am,g:st};anim(0)};
const _p7=parts;parts=function(dt){_p7(dt);if(W.pe&&cam.position.distanceTo(W.pe.g.position)<260)anim(vt)};
buildMenu();
})();