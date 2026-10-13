// ===== menu.js : decoração animada da tela inicial (grade, linhas de velocidade, faíscas) =====
// Só adiciona elementos ao #menu; as faíscas só animam enquanto o menu está visível.
(function(){
'use strict';
const m=document.getElementById('menu');if(!m)return;
const mk=(c,h)=>{const d=document.createElement('div');d.className='mbg '+c;if(h)d.innerHTML=h;m.insertBefore(d,m.firstChild);return d};
mk('mflag b');mk('mflag t');
let sp='';for(let i=0;i<14;i++)sp+=`<i style="top:${(Math.random()*92+2).toFixed(1)}%;animation-duration:${(.7+Math.random()*1.1).toFixed(2)}s;animation-delay:${(Math.random()*2).toFixed(2)}s;width:${(14+Math.random()*30).toFixed(0)}vw"></i>`;
mk('mspd',sp);mk('mgrid');
const cv=document.createElement('canvas');cv.id='mpart';mk('',null).appendChild(cv);
// tagline e versão
const h1=m.querySelector('h1'),tg=document.createElement('div');tg.className='mtag';tg.textContent='ACELERE · DERRAPE · VENÇA';h1.after(tg);
const v=document.createElement('div');v.className='mver';v.textContent='3D RACING';m.appendChild(v);
// ícones nos botões: os textos já têm emoji; só garante uma classe
// faíscas
const x=cv.getContext('2d'),P=[];let W=0,H=0,run=0;
const rs=()=>{const d=Math.min(devicePixelRatio||1,1.5);W=cv.width=innerWidth*d;H=cv.height=innerHeight*d};rs();addEventListener('resize',rs);
const mkp=i=>({x:Math.random()*W,y:i?H+10:Math.random()*H,v:.4+Math.random()*1.4,r:.6+Math.random()*2,c:Math.random()<.5?'0,229,255':'255,45,117',a:.2+Math.random()*.6,w:Math.random()*6.28});
for(let i=0;i<(innerWidth<700?40:80);i++)P.push(mkp(0));
function loop(){if(!m.classList.contains('on')){run=0;return}
x.clearRect(0,0,W,H);for(const p of P){p.y-=p.v*(H/700);p.w+=.02;p.x+=Math.sin(p.w)*.4;if(p.y<-10)Object.assign(p,mkp(1));
x.fillStyle=`rgba(${p.c},${p.a})`;x.shadowColor=`rgba(${p.c},1)`;x.shadowBlur=8;x.beginPath();x.arc(p.x,p.y,p.r,0,6.3);x.fill()}
requestAnimationFrame(loop)}
// reinicia o loop quando o menu volta a aparecer
new MutationObserver(()=>{if(m.classList.contains('on')&&!run){run=1;requestAnimationFrame(loop)}}).observe(m,{attributes:true,attributeFilter:['class']});
if(m.classList.contains('on')){run=1;requestAnimationFrame(loop)}
})();
