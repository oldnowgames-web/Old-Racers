// ===== scenery.js : colinas distantes, palmeiras na Costa Tropical e vegetação rasteira =====
// Carregar DEPOIS de game.js e track.js. Respeita G.q (0 = nada extra) e não coloca nada sobre a pista.
(function(){
'use strict';
const TH=THREE,PI=Math.PI,UP=new TH.Vector3(0,1,0);
const far=(x,z,m)=>{for(let j=0;j<N;j+=4)if((trk[j].x-x)**2+(trk[j].z-z)**2<m*m)return false;return true};
const _b=build;build=function(ti){_b(ti);const T=W.T,hq=G.q,mt=new TH.Matrix4(),p=new TH.Vector3(),q=new TH.Quaternion(),s=new TH.Vector3(),col=new TH.Color();
// colinas suaves ao longe (verde, dunas, neve)
if(hq>0&&(ti==0||ti==1||ti==2)){const pts=[];for(let i=0;i<40&&pts.length<(hq==1?14:24);i++){const a=R()*2*PI,r=(.9+R()*1.1)*T.R,x=Math.cos(a)*r,z=Math.sin(a)*r*.8,w=50+R()*90;if(far(x,z,w*.85+30))pts.push([x,z,w])}
if(pts.length){const hl=new TH.InstancedMesh(new TH.SphereGeometry(1,16,10),new TH.MeshLambertMaterial({color:new TH.Color(T.g).offsetHSL(0,ti==2?0:.02,ti==2?-.04:-.07)}),pts.length);q.set(0,0,0,1);
pts.forEach((c,i)=>{const h=(ti==1?9:14)+R()*16;mt.compose(p.set(c[0],-h*.25,c[1]),q,s.set(c[2],h,c[2]*(.7+R()*.5)));hl.setMatrixAt(i,mt)});hl.receiveShadow=true;world.add(hl)}}
// palmeiras (substituem os pinheiros da Costa Tropical)
if(ti==5){const tk=world.children.find(o=>o.isInstancedMesh&&o.geometry.type=='CylinderGeometry'&&o.geometry.parameters.radialSegments==9),lf=world.children.find(o=>o.isInstancedMesh&&o.geometry.type=='ConeGeometry'&&o.geometry.parameters.radialSegments==10);
if(tk&&lf){const n=Math.min(tk.count,hq==0?70:150),FR=7,tm=new TH.InstancedMesh(new TH.CylinderGeometry(.2,.42,1,7).translate(0,.5,0),new TH.MeshLambertMaterial({color:0x8a6a44}),n),
fr=new TH.InstancedMesh(new TH.BoxGeometry(.9,.06,4.4).translate(0,0,2.2),new TH.MeshLambertMaterial({side:TH.DoubleSide}),n*FR),qt=new TH.Quaternion(),qy=new TH.Quaternion(),qx=new TH.Quaternion(),e=new TH.Euler(),v=new TH.Vector3(),b0=new TH.Vector3();
for(let i=0;i<n;i++){tk.getMatrixAt(i,mt);mt.decompose(p,q,s);const k=s.x,hh=6+k*3.2;b0.set(p.x,0,p.z);e.set((R()-.5)*.22,0,(R()-.5)*.22);qt.setFromEuler(e);
mt.compose(b0,qt,s.set(1,hh,1));tm.setMatrixAt(i,mt);v.set(0,hh,0).applyQuaternion(qt).add(b0);col.setHSL(.27+R()*.06,.55,.26+R()*.1);
for(let f=0;f<FR;f++){qy.setFromAxisAngle(UP,f/FR*2*PI+R()*.3);qx.setFromAxisAngle(new TH.Vector3(1,0,0),.35+R()*.5);q.copy(qy).multiply(qx);const sc=.85+R()*.4;mt.compose(v,q,s.set(sc,1,sc));fr.setMatrixAt(i*FR+f,mt);fr.setColorAt(i*FR+f,col)}}
fr.instanceColor.needsUpdate=true;tm.castShadow=true;world.remove(tk,lf);tk.geometry.dispose();lf.geometry.dispose();world.add(tm,fr)}}
// tufos de vegetação rasteira ao lado da pista
const cfg={0:[0x2f6f2a,900],1:[0x8a7a3a,500],4:[0x1a1210,400],5:[0x3a8f3a,700]}[ti];
if(hq>0&&cfg){const n=hq==1?cfg[1]>>1:cfg[1],tf=new TH.InstancedMesh(new TH.ConeGeometry(.16,.9,4).translate(0,.45,0),new TH.MeshLambertMaterial({color:0xffffff}),n);
for(let i=0;i<n;i++){const idx=25+(R()*(N-50)|0),a=trk[idx],o=(R()<.5?-1:1)*(HW+3.5+R()*R()*40),k=.6+R()*1.3;
mt.compose(p.set(a.x+a.nx*o,0,a.z+a.nz*o),q.setFromAxisAngle(UP,R()*6.3),s.set(k,k*(.8+R()),k));tf.setMatrixAt(i,mt);tf.setColorAt(i,col.setHex(cfg[0]).offsetHSL((R()-.5)*.05,0,(R()-.5)*.12))}
tf.instanceColor.needsUpdate=true;world.add(tf)}};
buildMenu();rs();
})();
