// ===== audio.js : novos efeitos (SFX) e volume da música. O som do motor continua o original do game.js. =====
(function(){
'use strict';
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
// ---------- efeitos extras ----------
window.SFX=function(k){if(!AC||!ax())return;const t=AC.currentTime;
if(k=='item'){tone(520,t,.1,'square',.08);tone(780,t+.08,.1,'square',.08);tone(1040,t+.16,.2,'triangle',.1)}
else if(k=='shield'){tone(300,t,.5,'sine',.12);tone(600,t,.4,'triangle',.06);nz(t,.4,500,.1,2500)}
else if(k=='magnet'){tone(180,t,.6,'sawtooth',.06);tone(360,t+.05,.5,'triangle',.08);tone(720,t+.1,.4,'sine',.08)}
else if(k=='oil'){nz(t,.5,900,.18,200);tone(160,t,.4,'sawtooth',.05)}
else if(k=='coin'){tone(988,t,.07,'square',.07);tone(1319,t+.07,.22,'square',.07)}
else if(k=='elim'){tone(180,t,.5,'sawtooth',.12);tone(120,t+.25,.6,'sawtooth',.12);nz(t,.3,200,.2,80)}
else if(k=='thunder'){nz(t,1.6,220,.4,50);nz(t+.25,1.2,160,.3,40)}
else if(k=='lap'){tone(660,t,.15,'triangle',.14);tone(990,t+.15,.35,'triangle',.14)}
else if(k=='win'){[523,659,784,1047].forEach((f,i)=>tone(f,t+i*.1,.3,'triangle',.13))}
else if(k=='rev'){const o=AC.createOscillator(),g=AC.createGain(),l=AC.createBiquadFilter();o.type='sawtooth';l.type='lowpass';l.frequency.value=900;
o.frequency.setValueAtTime(55,t);o.frequency.exponentialRampToValueAtTime(190,t+.35);o.frequency.exponentialRampToValueAtTime(70,t+.8);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.09,t+.12);g.gain.exponentialRampToValueAtTime(.0001,t+.85);
o.connect(l);l.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.9)}};
// ---------- volume da música (Configurações > Música) ----------
setInterval(()=>{if(!AC||typeof mg=='undefined'||!mg)return;if(!mg._o){const g=AC.createGain();mg.disconnect();mg.connect(g);g.connect(AC.destination);mg._o=g}
mg._o.gain.setTargetAtTime([0,.35,1][G.mv==null?2:G.mv],AC.currentTime,.1)},250);
})();
