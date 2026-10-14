// ===== online.js : multiplayer online (até 6 jogadores) com PeerJS =====
// Carregar DEPOIS de perf.js e ANTES de menu.js. Precisa do script do PeerJS no index.html.
//
// COMO FUNCIONA (resumo):
//  - Um jogador cria a sala (HOST) e recebe um código de 4 letras. Os outros (CONVIDADOS) digitam o código.
//  - Todo mundo roda a PRÓPRIA física do carro (sem atraso na direção) e envia ~20x/s a posição para os outros.
//  - Os carros dos outros jogadores são "rivais" (bots) que, em vez da IA, seguem as posições recebidas (NETMOVE).
//  - Os convidados falam só com o host; o host repassa as mensagens para os demais (topologia em estrela).
(function(){
'use strict';
const MAXP=6,PFX='oldracers3d-',RATE=.05;           // 6 jogadores; envia estado a cada 0,05 s
const CFG=window.ONLINE_CFG||{};                      // opcional: servidor PeerJS próprio ({host,port,path,secure,config})
const CH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';          // letras/números sem ambiguidade (sem O/0, I/1)
const WXN=['☀️ Sol','🌧️ Chuva','🌙 Noite','🌅 Pôr do sol'],WXV=[0,1,2,4];
const NET={on:0,host:0,phase:'home',peer:null,conn:null,conns:{},code:'',me:0,players:[],cfg:{},racing:0,go:0,keep:0,rem:{},err:'',acc:0};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(v,d)=>Number.isFinite(+v)?+v:d, r2=v=>Math.round(v*100)/100;
const myInfo=()=>({n:PN(),car:G.car,col:G.col,hc:G.hc,su:G.su,hs:G.hs});
// valida/limita o que chega da rede (nunca confiar em dados de fora)
const ab=v=>Math.abs(num(v,0)|0);
const clean=m=>({n:String(m.n||'Piloto').slice(0,14),car:ab(m.car),col:ab(m.col),hc:ab(m.hc),su:ab(m.su),hs:ab(m.hs)});
const cp=l=>(Array.isArray(l)?l:[]).slice(0,MAXP).map(p=>Object.assign({id:ab(p&&p.id)},clean(p||{})));   // lista de jogadores vinda do host
const curCfg=()=>({trk:G.trk>=0&&G.trk<TRACKS.length?G.trk:0,laps:[2,3,5].indexOf(G.laps)>=0?G.laps:3,wx:WXV.indexOf(G.wx)>=0?G.wx:0});

// ---------- envio ----------
function bcast(m,except){for(const id in NET.conns){if(+id===except)continue;try{NET.conns[id].send(m)}catch(e){}}}   // host -> convidados
function send(m){if(!NET.on)return;if(NET.host){m.i=0;bcast(m)}else if(NET.conn&&NET.conn.open){try{NET.conn.send(m)}catch(e){}}}

// ---------- conexão ----------
function mkPeer(id){if(typeof Peer=='undefined'){fail('A biblioteca PeerJS não carregou (sem internet?)');return null}
try{return id?new Peer(id,CFG):new Peer(CFG)}catch(e){fail('Erro ao iniciar o PeerJS');return null}}
const errTxt=e=>e&&e.type=='peer-unavailable'?'Sala não encontrada':e&&e.type=='network'?'Sem conexão com o servidor':'Erro de conexão ('+(e&&e.type||'?')+')';
function fail(msg){leave();NET.err=msg;NET.phase='home';if(cur=='online')render();else TOAST(msg,'linear-gradient(100deg,#ff5a6e,#7c4dff)')}
function leave(){const p=NET.peer;NET.peer=null;NET.on=0;NET.host=0;NET.conn=null;NET.conns={};NET.players=[];NET.rem={};NET.racing=0;NET.go=0;NET.phase='home';
try{p&&p.destroy()}catch(e){}if(G.mode==6){G.mode=0;G.bots=5}}
function lost(){if(!NET.on&&NET.phase!='connecting')return;const wasOn=NET.on;leave();if(wasOn){TOAST('Conexão com o host perdida','linear-gradient(100deg,#ff5a6e,#7c4dff)');if(state!='menu')toMenu();else if(cur=='online')render()}}

// HOST: cria a sala
function hostRoom(n){NET.phase='connecting';NET.err='';render();
const code=Array.from({length:4},()=>CH[Math.random()*CH.length|0]).join(''),p=mkPeer(PFX+code);if(!p)return;NET.peer=p;
p.on('open',()=>{NET.on=1;NET.host=1;NET.code=code;NET.me=0;NET.players=[Object.assign({id:0},myInfo())];NET.cfg=curCfg();NET.phase='lobby';render()});
p.on('connection',onGuest);
p.on('error',e=>{if(e.type=='unavailable-id'&&(n||0)<5){try{p.destroy()}catch(_){}hostRoom((n||0)+1)}else fail(errTxt(e))});
p.on('disconnected',()=>{try{p.reconnect()}catch(e){}})}      // só o servidor de sinalização caiu: as conexões abertas seguem funcionando
// HOST: um convidado se conectou
function onGuest(c){let id=-1;
c.on('data',m=>{if(!m||typeof m!='object')return;
if(m.t=='hi'){if(id>=0)return;
if(NET.racing||NET.players.length>=MAXP){try{c.send({t:'no',r:NET.racing?'A corrida já começou':'Sala cheia (máx. 6)'})}catch(e){}setTimeout(()=>{try{c.close()}catch(e){}},400);return}
id=1;while(NET.conns[id])id++;NET.conns[id]=c;const p=Object.assign({id},clean(m));NET.players.push(p);
c.send({t:'wel',id,players:NET.players,cfg:NET.cfg});bcast({t:'pl',players:NET.players},id);TOAST('👋 '+p.n+' entrou na sala');render();return}
if(id<0)return;
if(m.t=='info'){const p=NET.players.find(x=>x.id==id);if(p){Object.assign(p,clean(m));bcast({t:'pl',players:NET.players});render()}}
else if(m.t=='s'){m.i=id;onState(m);bcast(m,id)}                      // repassa a posição para os outros convidados
else if(m.t=='fin'){m.i=id;onFin(m);bcast(m,id)}});
const gone=()=>{if(id>=0&&NET.conns[id]===c)drop(id)};c.on('close',gone);c.on('error',gone)}
function drop(id){delete NET.conns[id];const p=NET.players.find(x=>x.id==id);NET.players=NET.players.filter(x=>x.id!=id);removeBot(id);
bcast({t:'pl',players:NET.players});if(p)TOAST('🚪 '+p.n+' saiu');render()}
function removeBot(id){const b=NET.rem[id];if(!b)return;delete NET.rem[id];const i=bots.indexOf(b);if(i>=0)bots.splice(i,1);const j=cars.indexOf(b);if(j>=0)cars.splice(j,1);b.mesh.parent&&b.mesh.parent.remove(b.mesh)}

// CONVIDADO: entra na sala
function joinRoom(code){code=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
if(code.length!=4){NET.err='Digite o código de 4 caracteres';render();return}
NET.phase='connecting';NET.err='';NET.code=code;render();const p=mkPeer();if(!p)return;NET.peer=p;let ok=0;
const to=setTimeout(()=>{if(!ok)fail('Não foi possível conectar (sala não encontrada ou rede bloqueando)')},12000);
p.on('error',e=>{clearTimeout(to);fail(errTxt(e))});
p.on('open',()=>{const c=p.connect(PFX+code,{reliable:true});NET.conn=c;
c.on('open',()=>c.send(Object.assign({t:'hi'},myInfo())));
c.on('data',m=>{if(!m||typeof m!='object')return;
if(m.t=='wel'){ok=1;clearTimeout(to);NET.on=1;NET.host=0;NET.me=ab(m.id);NET.players=cp(m.players);NET.cfg=m.cfg||{};NET.phase='lobby';render()}
else if(m.t=='no'){clearTimeout(to);fail(m.r||'Entrada recusada')}
else if(m.t=='pl'){NET.players=cp(m.players);render()}
else if(m.t=='cfg'){NET.cfg=m.cfg||{};render()}
else if(m.t=='go')begin(m)
else if(m.t=='s')onState(m)
else if(m.t=='fin')onFin(m)});
c.on('close',lost);c.on('error',lost)})}

// ---------- recebimento dos estados dos outros jogadores ----------
function onState(m){const b=NET.rem[m.i];if(!b)return;const s=b.net;
if(![m.x,m.z,m.h,m.vx,m.vz,m.vf,m.p].every(Number.isFinite))return;
s.x=m.x;s.z=m.z;s.h=m.h;s.vx=m.vx;s.vz=m.vz;s.vf=m.vf;s.p=m.p;s.nt=m.nt|0;s.dr=m.dr|0;s.t=performance.now()}
function onFin(m){const b=NET.rem[m.i];if(b&&Number.isFinite(m.ft))b.ft=m.ft}
// chamado pelo botMove do game.js no lugar da IA, para os carros dos outros jogadores
window.NETMOVE=function(b,dt){const s=b.net;if(!s)return;
const age=NET.on?Math.min(.3,(performance.now()-s.t)/1000):0;          // quanto tempo desde o último pacote (limitado a 0,3 s)
const tx=s.x+s.vx*age,tz=s.z+s.vz*age;                                 // extrapola pela velocidade
if(Math.hypot(tx-b.x,tz-b.z)>25){b.x=tx;b.z=tz}else{const k=1-Math.exp(-dt*12);b.x+=(tx-b.x)*k;b.z+=(tz-b.z)*k}   // suaviza (se errou muito, teleporta)
let dh=s.h-b.h;dh=Math.atan2(Math.sin(dh),Math.cos(dh));b.h+=dh*(1-Math.exp(-dt*14));
b.vx=s.vx;b.vz=s.vz;b.vf=s.vf;b.v=Math.hypot(s.vx,s.vz);
const pt=s.p+Math.max(0,s.vf)/W.seg*age;b.prog+=(pt-b.prog)*Math.min(1,dt*10);if(!b.ft)b.prog=Math.min(b.prog,(G.laps+1)*N-.01);b.i=b.prog;   // progresso na pista (posição/colocação)
const c=Math.cos(b.h),sn=Math.sin(b.h),vl=-b.vx*c+b.vz*sn;
b.mesh.position.set(b.x,0,b.z);b.mesh.rotation.y=b.h;b.mesh.rotation.z=cl(-vl*.012,-.12,.12);
if(Math.hypot(b.x-cam.position.x,b.z-cam.position.z)<90){                // efeitos só perto da câmera
const bx=b.x-sn*b.s.l/2,bz=b.z-c*b.s.l/2;
if(s.dr&&R()<.6)emit(bx+(R()-.5)*2,.3,bz+(R()-.5)*2,0xdddddd,.5,.7,0,1,0);
if(s.nt)emit(bx,.6,bz,R()<.5?0x4cc9ff:0xffaa33,.35,.3,-sn*8,0,-c*8)}}

// ---------- largada ----------
function hostGo(){if(!NET.host)return;if(NET.players.length<2){TOAST('Precisa de pelo menos 2 jogadores');return}
NET.players[0]=Object.assign({id:0},myInfo());NET.cfg=curCfg();
const m={t:'go',cfg:NET.cfg,players:NET.players};bcast(m);begin(m)}
function begin(m){NET.players=m.players?cp(m.players):NET.players;NET.cfg=m.cfg||NET.cfg;const c=NET.cfg;
G.mode=6;G.bots=0;G.trk=num(c.trk,0);G.laps=[2,3,5].indexOf(c.laps)>=0?c.laps:3;G.wx=WXV.indexOf(c.wx)>=0?c.wx:0;   // direto em G (não grava no save)
NET.racing=1;NET.go=1;try{start()}finally{NET.go=0}}
// depois do start() normal: posiciona cada jogador no grid e cria os carros dos outros
function afterStart(){NET.rem={};const ps=NET.players,at=i=>[N-3-(i>>1)*2,i%2?-4:4],mi=Math.max(0,ps.findIndex(p=>p.id==NET.me));
let a=at(mi);place(pl,a[0],a[1]);pl.prog=a[0];
ps.forEach((p,i)=>{if(p.id==NET.me)return;const S=CARS[p.car%CARS.length],e=mkEnt(S,COLS[p.col%COLS.length],{hc:COLS[p.hc%COLS.length],su:COLS[p.su%COLS.length],hs:p.hs|0});
a=at(i);place(e,a[0],a[1]);e.nm=p.n+' · '+S.n;e.mesh.add(tag(p.n));e.i=e.prog=a[0];e.v=0;e.off=0;
e.net={x:e.x,z:e.z,h:e.h,vx:0,vz:0,vf:0,p:a[0],nt:0,dr:0,t:performance.now()};bots.push(e);cars.push(e);NET.rem[p.id]=e});NET.acc=0}

// ---------- ganchos nas funções do jogo ----------
const _st=start;start=function(){
if(NET.on&&G.mode==6&&!NET.go){if(NET.host)hostGo();else TOAST('Só o host inicia a próxima corrida');return}   // "Próxima / Repetir" online
_st();if(NET.on&&NET.go)afterStart()};
const _race=race;race=function(dt){_race(dt);
if(NET.on&&NET.racing&&pl&&(state=='race'||state=='end')){NET.acc+=dt;if(NET.acc>=RATE){NET.acc=0;
send({t:'s',x:r2(pl.x),z:r2(pl.z),h:Math.round(pl.h*1000)/1000,vx:r2(pl.vx),vz:r2(pl.vz),vf:r2(pl.vf),p:r2(pl.prog),nt:pl.nt?1:0,dr:pl.drift?1:0})}}};
const _fin=finish;finish=function(){_fin();if(!(NET.on&&G.mode==6))return;send({t:'fin',ft:pl.ft});
$('en').textContent='🌐 Sala '+NET.code+(NET.host?' · toque em "Próxima / Repetir" para correr de novo':' · aguarde o host iniciar a próxima corrida')};
const _tm=toMenu;toMenu=function(){if(NET.on&&!NET.keep)leave();_tm()};
const _pa=pause;pause=function(){if(NET.on&&state=='race'){TOAST('Não dá para pausar no online');return}_pa()};
const _scr=scr;scr=function(id){_scr(id);if(id=='online'){if(NET.host)NET.racing=0;if(NET.on&&NET.phase!='lobby')NET.phase='lobby';render()}
if(id=='end'){const b=$('onb');if(b)b.style.display=NET.on?'':'none'}};
const _pk=pick;pick=function(k,i){_pk(k,i);
if(NET.on&&NET.host&&(k=='trk'||k=='wx'||k=='laps')){NET.cfg=curCfg();bcast({t:'cfg',cfg:NET.cfg})}
if(NET.on&&['car','col','hc','su','hs'].indexOf(k)>=0)sendInfo();
if(cur=='online')render()};
function sendInfo(){if(!NET.on)return;if(NET.host){NET.players[0]=Object.assign({id:0},myInfo());bcast({t:'pl',players:NET.players})}else send(Object.assign({t:'info'},myInfo()))}
function toLobby(){NET.keep=1;try{toMenu()}finally{NET.keep=0}sendInfo();scr('online')}
addEventListener('pagehide',()=>{if(NET.peer)try{NET.peer.destroy()}catch(e){}});

// ---------- telas ----------
const sc=document.createElement('div');sc.id='online';sc.className='scr';sc.innerHTML='<div class="card" id="onc"></div>';document.body.appendChild(sc);
const css=document.createElement('style');css.textContent='#online input{font:inherit;color:#fff;background:rgba(255,255,255,.1);border:1px solid rgba(0,229,255,.5);border-radius:12px;padding:10px;text-align:center;width:140px;letter-spacing:6px;text-transform:uppercase;outline:0}#online .code{font:900 44px system-ui;letter-spacing:10px;text-align:center;color:#4cf0ff;text-shadow:0 0 18px rgba(0,229,255,.5)}#online .err{color:#ff8a98;text-align:center}#menu .big:nth-of-type(7){animation-delay:1.35s}';document.head.appendChild(css);
function render(){if(cur!='online')return;const el=$('onc'),P=NET.players,H=NET.host;let h='<h2>🌐 Online</h2>';
if(NET.phase=='connecting')h+='<div style="text-align:center">Conectando…</div><div class=row><button onclick="ONL.leave()">Cancelar</button></div>';
else if(NET.phase=='lobby'){const c=NET.cfg,T=TRACKS[num(c.trk,0)]||TRACKS[0];
h+=`<div style="text-align:center;opacity:.7;font-size:12px;letter-spacing:2px">CÓDIGO DA SALA</div><div class=code>${esc(NET.code)}</div>`;
if(H)h+='<div class=row><button onclick="ONL.copy()">🔗 Copiar link para os amigos</button></div>';
h+=`<div style="text-align:center;font-size:12px;opacity:.7">Jogadores ${P.length}/${MAXP}</div><table>${P.map(p=>`<tr class="${p.id==NET.me?'me':''}"><td>${p.id==0?'👑 ':''}${esc(p.n)}${p.id==NET.me?' (você)':''}</td><td>${esc((CARS[p.car%CARS.length]||CARS[0]).n)}</td></tr>`).join('')}</table>`;
if(H){h+=`<div class=row><b>Pista</b>${TRACKS.map((t,i)=>`<button class="${G.trk==i?'on':''}" onclick="ONL.set('trk',${i})">${esc(t.n)}</button>`).join('')}</div>`;
h+=`<div class=row><b>Clima</b>${WXV.map((v,i)=>`<button class="${G.wx==v?'on':''}" onclick="ONL.set('wx',${v})">${WXN[i]}</button>`).join('')}</div>`;
h+=`<div class=row><b>Voltas</b>${[2,3,5].map(n=>`<button class="${G.laps==n?'on':''}" onclick="ONL.set('laps',${n})">${n}</button>`).join('')}</div>`}
else h+=`<div style="text-align:center;font-size:13px;opacity:.85">Pista: <b>${esc(T.n)}</b> · ${num(c.laps,3)} voltas · ${WXN[Math.max(0,WXV.indexOf(c.wx))]}<br><span style="opacity:.7">Aguardando o host iniciar…</span></div>`;
h+=`<div class=row><button onclick="ONL.gar()">🚗 Garagem</button>${H?`<button class="pri" ${P.length<2?'disabled style="opacity:.5"':''} onclick="ONL.go()">🏁 Largar</button>`:''}<button onclick="ONL.leave()">Sair da sala</button></div>`}
else{h+=`<div style="text-align:center;font-size:13px;opacity:.85">Piloto: <b>${esc(PN())}</b> <span style="opacity:.6">(mude o nome no menu principal)</span></div>`;
if(NET.err)h+=`<div class=err>${esc(NET.err)}</div>`;
h+='<button class="big pri" onclick="ONL.host()">➕ Criar sala</button><div class=row><input id=ocode maxlength=4 placeholder="CÓDIGO" autocomplete=off><button onclick="ONL.join()">Entrar</button></div><div class=row><button onclick="scr(\'menu\')">← Voltar</button></div>'}
el.innerHTML=h;const oc=$('ocode');if(oc){oc.addEventListener('keydown',e=>{e.stopPropagation();if(e.key=='Enter')ONL.join()});oc.addEventListener('input',()=>{oc.value=oc.value.toUpperCase().replace(/[^A-Z0-9]/g,'')})}}
window.ONL={host(){hostRoom()},join(){joinRoom(($('ocode')||{}).value)},go:hostGo,gar(){openGar('online')},lobby:toLobby,
set(k,v){pick(k,v)},leave(){leave();NET.err='';render()},
copy(){const u=location.origin+location.pathname+'?sala='+NET.code;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>TOAST('🔗 Link copiado!'),()=>{try{prompt('Copie o link:',u)}catch(e){}})}};
// botão "Online" no menu principal e botão "Sala" na tela de fim de corrida
const mb=document.querySelector('#menu button[onclick*="modes"]');
if(mb){const b=document.createElement('button');b.className='big';b.textContent='🌐 Online';b.onclick=()=>scr('online');mb.after(b)}
const eb=document.querySelector('#end button[onclick*="toMenu"]');
if(eb){const b=document.createElement('button');b.className='big';b.id='onb';b.textContent='🌐 Sala';b.style.display='none';b.onclick=toLobby;eb.before(b)}
// link de convite: abrir o jogo com ?sala=CODIGO entra direto na sala
const q=new URLSearchParams(location.search).get('sala');
if(q)setTimeout(()=>{scr('online');joinRoom(q)},600);
})();