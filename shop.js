// ===== shop.js : moedas, compra de carros, melhorias (motor, pneus, freios, nitro) e prêmios das corridas =====
// Carregar DEPOIS de save.js e modes.js.
(function(){
'use strict';
const D=SV.d,MAXL=5;
const PRICE=[0,1500,0,2500,3500,2200,3000,2800,3200,6000];       // 0 e 2 já vêm de graça
const UPS=[['e','🏎️','Motor','velocidade e aceleração'],['t','🛞','Pneus','aderência'],['b','🛑','Freios','frenagem'],['n','⚡','Nitro','duração do nitro']];
const tier=i=>CARS[i].top/64,upCost=(i,l)=>Math.round((250+l*300)*tier(i)/10)*10;
const maxed=i=>UPS.every(u=>SV.lvl(i,u[0])>=MAXL);
// ---------- garagem ----------
window.SHOP={
buy(){const i=G.car,p=PRICE[i];if(SV.owned(i))return;if(D.coins<p){TOAST('Moedas insuficientes: faltam '+(p-D.coins),'linear-gradient(100deg,#ff5a6e,#7c4dff)');return}
SV.add(-p);D.own.push(i);D.sel=i;SV.save();TOAST('🚗 '+CARS[i].n+' é seu!');window.SFX&&SFX('win');renderGar()},
up(k){const i=G.car;if(!SV.owned(i))return;const l=SV.lvl(i,k);if(l>=MAXL)return;const c=upCost(i,l);if(D.coins<c){TOAST('Moedas insuficientes','linear-gradient(100deg,#ff5a6e,#7c4dff)');return}
SV.add(-c);(D.up[i]=D.up[i]||{})[k]=l+1;SV.save();window.SFX&&SFX('coin');renderGar()},
ok(){if(!SV.owned(G.car)){TOAST('Compre o carro para usá-lo','linear-gradient(100deg,#ff5a6e,#7c4dff)');return}scr(gf)}};
const _rg=renderGar;renderGar=function(){_rg();const el=$('garc'),i=G.car,own=SV.owned(i);let h=el.innerHTML;
h=h.replace(/<h2>Garagem<\/h2>/,`<h2>Garagem <span style="float:right;font-size:15px;color:#ffe14d">🪙 ${D.coins}</span></h2>`);
let box;
if(own)box='<div class="upg"><b style="font-size:11px;letter-spacing:1px;opacity:.7">MELHORIAS</b>'+UPS.map(u=>{const l=SV.lvl(i,u[0]);return`<div class="urow"><span title="${u[3]}">${u[1]} ${u[2]}</span><span class="pips">${'■'.repeat(l)}<i>${'■'.repeat(MAXL-l)}</i></span>${l>=MAXL?'<button disabled>MÁX</button>':`<button onclick="SHOP.up('${u[0]}')">🪙 ${upCost(i,l)}</button>`}</div>`}).join('')+'</div>';
else box=`<div class="upg"><b>🔒 ${CARS[i].n}</b><button class="pri" onclick="SHOP.buy()">Comprar por 🪙 ${PRICE[i]}</button></div>`;
h=h.replace(/<div class="?row"?>\s*<b>Cor do carro<\/b>/,m=>box+m);
h=h.replace(/onclick="scr\(gf\)"/,'onclick="SHOP.ok()"');el.innerHTML=h;
el.querySelectorAll('button.car').forEach((b,k)=>{if(!SV.owned(k)){b.style.opacity=.7;b.children[0].innerHTML+=` <small style="color:#ffe14d">🔒 🪙 ${PRICE[k]}</small>`}})};
const css=document.createElement('style');css.textContent='.upg{display:flex;flex-direction:column;gap:6px;padding:10px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12)}.urow{display:flex;align-items:center;gap:8px;justify-content:space-between;font-size:13px}.urow span:first-child{min-width:92px}.urow button{padding:5px 10px;font-size:12px;min-width:74px}.pips{letter-spacing:2px;color:#4cf0ff;font-size:11px;flex:1}.pips i{font-style:normal;color:rgba(255,255,255,.2)}.urow button:disabled{opacity:.5;cursor:default}.mcoin{position:absolute;top:calc(26px + env(safe-area-inset-top,0px));right:16px;z-index:3;padding:6px 14px;border-radius:20px;background:rgba(10,14,30,.6);border:1px solid rgba(255,225,77,.5);color:#ffe14d;font:900 15px system-ui;letter-spacing:1px;margin:0}.mo{text-align:left}';document.head.appendChild(css);
const _pk=pick;pick=function(k,i){const o=G.car;_pk(k,i);if(k=='car'){if(SV.owned(i)){D.sel=i;SV.save()}window.SFX&&SFX('rev')}};
// ---------- melhorias aplicadas ao carro do jogador ----------
const _st=start;start=function(){if(!SV.owned(G.car)){G.car=SV.owned(D.sel)?D.sel:0}_st();
if(!pl)return;const i=G.car,e=SV.lvl(i,'e'),t=SV.lvl(i,'t'),n=SV.lvl(i,'n'),b=SV.lvl(i,'b'),s=pl.s;
pl.s=Object.assign({},s,{top:s.top*(1+.022*e),acc:s.acc*(1+.04*e),grip:s.grip*(1+.05*t),nit:s.nit*(1+.16*n)});pl.bk=1+.12*b;D.race=0;SES.drift=0};
const SES={drift:0};
const _ph=phys;phys=function(c,dt,u){_ph(c,dt,u);if(c!==pl)return;
if(c.bk>1&&u.br>0&&c.vf>1){const f=Math.exp(-(c.bk-1)*1.2*dt);c.vx*=f;c.vz*=f}
if(c.drift&&!c.off&&state=='race')SES.drift+=dt};
// ---------- prêmio ----------
const _fin=finish;finish=function(){_fin();if(G.mode>=3)return;const pos=1+bots.filter(b=>b.ft).length,M=G.mode;
if(M==2){$('en').textContent='Treino livre: sem prêmio em moedas.';return}
const base=[0,300,200,130,80,50,40][pos]||30,k=(M==0?cl2(G.laps/3,.7,1.7):1)*[.8,1,1.35][G.diff]*(M==1?1.2:1),dr=Math.min(150,Math.round(SES.drift*4)),
nb=0,tot=Math.round(base*k)+dr,old=$('en').textContent;
SV.add(tot);D.races++;if(pos==1)D.wins++;SV.save();
const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
$('en').innerHTML=(old?esc(old)+'<br>':'')+`<b style="color:#ffe14d">🪙 +${tot}</b> <small style="opacity:.8">(${pos}º lugar${dr?` · drift +${dr}`:''})</small><br><small style="opacity:.7">Saldo: 🪙 ${D.coins}</small>`};
const cl2=(v,a,b)=>Math.max(a,Math.min(b,v));
SV.upd();
})();
