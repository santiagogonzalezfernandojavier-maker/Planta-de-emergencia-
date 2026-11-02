// v11 · Portada y estilo "Industrial seguridad" (negro + amarillo de advertencia)
(function(){
const $$=id=>document.getElementById(id);
const st=document.createElement('style');st.id='industrialUI';
st.textContent=`
:root{--ind-y:#ffc400;--ind-y2:#ffdc5a;--ind-k:#0b0b0a;--ind-k2:#171715;--ind-line:#3a3720;--ind-txt:#f4f1e4;--ind-mut:#b9b49a}
dialog#gameLaunch{background:#0b0b0a;color:var(--ind-txt);font-family:Bahnschrift,"Segoe UI Semibold","Arial Narrow",Arial,sans-serif;overflow:auto}
dialog#gameLaunch::backdrop{background:#000}
dialog#gameLaunch::before{background-image:linear-gradient(#ffc40010 1px,transparent 1px),linear-gradient(90deg,#ffc40010 1px,transparent 1px)!important;background-size:56px 56px!important;animation:none!important}
dialog#gameLaunch::after{content:"";position:fixed;left:0;right:0;top:0;height:14px;z-index:3;pointer-events:none;background:repeating-linear-gradient(-45deg,var(--ind-y) 0 18px,#0b0b0a 18px 36px)}
dialog#gameLaunch .g-launch-wrap{position:relative;max-width:1500px;padding:34px 4.5vw 22px}
dialog#gameLaunch .g-launch-wrap:before{display:none}
dialog#gameLaunch .g-launch-wrap:after{content:"";position:fixed;left:0;right:0;bottom:0;height:10px;pointer-events:none;background:repeating-linear-gradient(-45deg,var(--ind-y) 0 18px,#0b0b0a 18px 36px)}
dialog#gameLaunch .g-launch-top{border-bottom:2px solid var(--ind-y);padding-bottom:16px}
dialog#gameLaunch .g-brand{font-size:15px;letter-spacing:2.5px;font-weight:700;color:var(--ind-txt)}
dialog#gameLaunch .g-brand-mark{background:var(--ind-y);color:#000;border:0;border-radius:0;padding:8px 12px;font-weight:800;clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,0 100%)}
dialog#gameLaunch .g-launch-meta{color:var(--ind-mut);font:600 12px Bahnschrift,Arial,sans-serif;letter-spacing:2px}
dialog#gameLaunch .g-gloss-btn{color:var(--ind-y2);border-bottom-color:var(--ind-y);font-size:14px}
dialog#gameLaunch .g-eyebrow{display:none}
dialog#gameLaunch .g-launch-main{grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:4vw;padding:30px 0}
dialog#gameLaunch .g-launch-intro h2{font-family:Impact,Bahnschrift,"Arial Narrow",sans-serif!important;font-weight:400!important;text-transform:uppercase;letter-spacing:1px!important;line-height:.95!important;font-size:clamp(44px,6.4vw,100px)!important;color:var(--ind-txt);text-shadow:none!important;margin:0 0 14px!important}
dialog#gameLaunch .g-launch-intro h2 em{color:#000!important;background:var(--ind-y);text-shadow:none!important;padding:0 .18em;display:inline-block;margin-top:.08em;transform:skewX(-6deg)}
dialog#gameLaunch .g-launch-intro p{font:500 clamp(15px,1.25vw,19px)/1.4 Bahnschrift,"Segoe UI",Arial,sans-serif;color:var(--ind-mut);max-width:560px;margin:0 0 18px!important}
dialog#gameLaunch .g-entry-actions{gap:10px!important;counter-reset:lvl}
dialog#gameLaunch .g-entry-actions button{counter-increment:lvl;position:relative;display:grid!important;grid-template-columns:62px 1fr;column-gap:16px;align-items:center;max-width:620px!important;padding:12px 22px 12px 14px!important;border:2px solid var(--ind-line)!important;border-left:8px solid var(--ind-y)!important;border-radius:0!important;background:linear-gradient(90deg,#1b1a12,#0f0f0d)!important;color:var(--ind-txt)!important;font:800 clamp(18px,1.6vw,24px) Bahnschrift,"Arial Narrow",Arial,sans-serif!important;letter-spacing:1.5px!important;text-transform:uppercase;clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%);transition:transform .12s,background .12s,border-color .12s}
dialog#gameLaunch .g-entry-actions button::before{content:counter(lvl);grid-row:1/span 3;grid-column:1;display:grid;place-items:center;width:56px;height:56px;background:var(--ind-y);color:#000;font:400 38px Impact,Bahnschrift,sans-serif;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)}
dialog#gameLaunch .g-entry-actions button>*{grid-column:2}
dialog#gameLaunch .g-entry-actions button span{display:none}
dialog#gameLaunch #gameAnatomy{display:none!important}
dialog#gameLaunch .g-launch-right{border-radius:0!important}
dialog#gameLaunch .g-entry-actions button small.g-desc{margin-top:3px!important;font:500 clamp(13px,1vw,15px)/1.3 Bahnschrift,"Segoe UI",Arial,sans-serif!important;letter-spacing:.2px!important;text-transform:none;color:var(--ind-mut)!important}
dialog#gameLaunch .g-entry-actions button:hover,dialog#gameLaunch .g-entry-actions button:focus-visible{transform:translateX(14px)!important;background:linear-gradient(90deg,#4a4210,#17160e)!important;border-color:var(--ind-y)!important;outline:none}
dialog#gameLaunch .g-entry-actions button:focus-visible::after{content:"▶";position:absolute;left:-26px;top:50%;transform:translateY(-50%);color:var(--ind-y);font-size:20px}
dialog#gameLaunch .g-order{color:var(--ind-y2)!important;font:700 14px Bahnschrift,Arial,sans-serif!important}
dialog#gameLaunch .g-launch-right{background:#12120f;border:2px solid var(--ind-line);padding:18px;clip-path:polygon(0 0,calc(100% - 22px) 0,100% 22px,100% 100%,0 100%)}
dialog#gameLaunch .g-launch-right-head strong{font:400 26px Impact,Bahnschrift,sans-serif;text-transform:uppercase;letter-spacing:1px;color:var(--ind-y)}
dialog#gameLaunch .g-mission-choice{border-radius:0;border:2px solid var(--ind-line);border-left:8px solid var(--ind-y);background:#17160e;color:var(--ind-txt)}
dialog#gameLaunch .g-mission-choice:hover,dialog#gameLaunch .g-mission-choice:focus-visible{background:#4a4210;border-color:var(--ind-y);outline:none}
dialog#gameLaunch .g-mission-num{color:#000;background:var(--ind-y);padding:2px 8px;font-family:Impact,sans-serif}
dialog#gameLaunch .g-route-label{fill:var(--ind-mut)}dialog#gameLaunch .g-route-value{fill:var(--ind-y2)}
dialog#gameLaunch .g-launch-foot{border-top:2px solid var(--ind-line);color:var(--ind-mut);font:600 12px Bahnschrift,Arial,sans-serif;letter-spacing:1.5px;padding:10px 0 18px}
#gameKeys{display:flex;gap:18px;flex-wrap:wrap;align-items:center;margin-top:14px;font:600 14px Bahnschrift,"Segoe UI",Arial,sans-serif;color:var(--ind-mut)}
#gameKeys span[hidden]{display:none!important}
#gameKeys span{display:inline-flex;align-items:center;gap:7px}
#gameKeys kbd,.ind-kbd{display:inline-grid;place-items:center;min-width:30px;height:28px;padding:0 8px;background:#f4f1e4;color:#000;border-bottom:4px solid #8d8a78;border-radius:4px;font:800 14px Bahnschrift,Arial,sans-serif}
@media(max-height:820px){dialog#gameLaunch .g-launch-foot{display:none}dialog#gameLaunch .g-launch-wrap{padding:26px 4.5vw 30px}dialog#gameLaunch .g-launch-main{padding:16px 0!important}dialog#gameLaunch .g-launch-intro p{display:none}dialog#gameLaunch .g-entry-actions{gap:7px!important}dialog#gameLaunch .g-order{margin:8px 0 0!important}dialog#gameLaunch .g-launch-intro h2{font-size:clamp(34px,8vh,62px)!important}dialog#gameLaunch .g-entry-actions button::before{width:44px;height:44px;font-size:28px}dialog#gameLaunch .g-entry-actions button{grid-template-columns:48px 1fr;padding:8px 18px 8px 10px!important}#gameKeys{margin-top:8px}}
@media(max-width:900px){dialog#gameLaunch .g-launch-main{grid-template-columns:1fr}}
/* Interfaz dentro del juego */
body.game-ui header,body.game-ui #viewbar,body.game-ui #gameTelemetry,body.game-ui #gameDock{font-family:Bahnschrift,"Segoe UI",Arial,sans-serif}
body.game-ui #gameDock button,body.game-ui #viewbar button{border-radius:0}
body.game-ui #gameDock button:hover,body.game-ui #viewbar button:hover{border-color:var(--ind-y)}
#opNarrator{border-radius:0!important;border:2px solid var(--ind-line)!important;border-left:8px solid var(--ind-y)!important;background:#0b0b0aee!important;font-family:Bahnschrift,"Segoe UI",Arial,sans-serif!important}
#opNarrator button{border-radius:0!important}
#fixCard,#walkWelcome .ww-card{border-radius:0!important;border:2px solid var(--ind-y)!important;background:#0b0b0af2!important;font-family:Bahnschrift,"Segoe UI",Arial,sans-serif}
#walkWelcome .ww-it kbd{background:#f4f1e4!important;color:#000!important;border-bottom:4px solid #8d8a78!important;border-radius:4px!important}
#walkWelcome h2{color:var(--ind-y)!important;font-family:Impact,Bahnschrift,sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:1px}
/* Menos ruido en pantalla */
body.game-ui #opNarrator .on-m,body.game-ui #opNarrator .on-r{display:none!important}
body.game-ui .view-title{display:none!important}
body.game-ui #gameObjective{display:none!important}
body.game-ui:not(.show-extra) #viewbar #toggleRail,body.game-ui:not(.show-extra) #viewbar #proFull,body.game-ui:not(.show-extra) #viewbar #dayNightToggle,body.game-ui:not(.show-extra) #viewbar #toggleObjectives,body.game-ui:not(.show-extra) #viewbar #showSingle,body.game-ui:not(.show-extra) #viewbar #cutGeneralButton,body.game-ui:not(.show-extra) #viewbar [data-extra="1"]{display:none!important}
body.game-ui #gameTelemetry .metric:first-child,body.game-ui #gameTelemetry .metric:last-child{display:none!important}
#extraBtn{font-weight:700}
#coverArtBox{display:flex;flex-direction:column;gap:12px}
#coverArt{width:100%;height:auto;max-height:56vh}
.ca-fan{transform-box:fill-box;transform-origin:center;animation:caSpin 3.5s linear infinite}
.ca-bolt{animation:caPulse 2.6s ease-in-out infinite}
@keyframes caSpin{to{transform:rotate(360deg)}}@keyframes caPulse{0%,100%{opacity:1}50%{opacity:.45}}
.ca-spec{display:flex;gap:10px}
.ca-spec span{flex:1;border:2px solid var(--ind-line);border-left:6px solid var(--ind-y);padding:6px 10px;font:600 13px Bahnschrift,Arial,sans-serif;color:var(--ind-mut);display:flex;flex-direction:column}
.ca-spec b{font:400 26px Impact,Bahnschrift,sans-serif;color:var(--ind-y);letter-spacing:1px}
@media(max-height:820px){#coverArt{max-height:46vh}.ca-spec b{font-size:20px}}
@media(prefers-reduced-motion:reduce){.ca-fan,.ca-bolt{animation:none}}
@media(prefers-reduced-motion:reduce){dialog#gameLaunch .g-entry-actions button{transition:none}}
`;
document.head.append(st);


// Calidad alta (opcional): más nitidez y más luces. Si va lenta, se vuelve a «Automática» en el mismo selector.
{const q=$$('quality33');if(q&&window.Performance33){
 if(!q.querySelector('[value="high"]')){q.insertAdjacentHTML('beforeend','<option value="high">Calidad alta</option>');}
 const prev=q.onchange;
 q.onchange=e=>{
  if(q.value==='high'){Performance33.setMode('detail');renderer.setPixelRatio(Math.min(Math.max(devicePixelRatio*1.25,1.5),2));renderer.shadowMap.needsUpdate=true;window.__highQuality=true;}
  else{window.__highQuality=false;prev&&prev.call(q,e);}
 };
}}

// Operarios con vida: cabeza que mira (equipo, tablet, alrededor) y respiración. Las poses de brazos y piernas son fijas.
(function(){
 if(typeof Personnel==='undefined')return;
 const looks=[[0.0,.0],[.5,-.05],[-.55,.0],[.25,.28],[-.2,.3],[.7,.05]];
 const rig=[];
 Personnel.ready.then(()=>{
  Personnel.group.children.forEach((g,i)=>{
   const pivot=new T.Group();pivot.position.set(0,1.46,.0);g.add(pivot);
   [...g.children].forEach(m=>{if(!m.isMesh)return;m.geometry.computeBoundingBox();if(m.geometry.boundingBox.min.y>1.38){pivot.add(m);m.position.y=-1.46;m.castShadow=false;}});
   rig.push({g,pivot,base:g.rotation.y,t:i*2.3,next:0,from:[0,0],to:[0,0],k:1,hold:1+i*.7,phase:i*1.7});
  });
 });
 let last=performance.now(),acc=0;
 function tick(now){
  requestAnimationFrame(tick);
  const dt=Math.max(0,Math.min(.1,(now-last)/1000));last=now;acc+=dt;if(acc<1/24)return;const d=acc;acc=0;
  if(window.gameMenuActive||window.plantPresentationActive||document.hidden||!Personnel.group.visible)return;
  for(const r of rig){
   r.t+=d;r.hold-=d;
   if(r.hold<=0){r.from=[r.pivot.rotation.y,r.pivot.rotation.x];const L=looks[Math.floor(Math.random()*looks.length)];r.to=[L[0],L[1]];r.k=0;r.hold=1.6+Math.random()*2.8;}
   if(r.k<1){r.k=Math.min(1,r.k+d/.7);const e=r.k*r.k*(3-2*r.k);r.pivot.rotation.y=r.from[0]+(r.to[0]-r.from[0])*e;r.pivot.rotation.x=r.from[1]+(r.to[1]-r.from[1])*e;}
   r.g.scale.y=(r.g.userData.sy||(r.g.userData.sy=r.g.scale.y))*(1+Math.sin(r.t*1.6+r.phase)*.004);
  }
 }
 requestAnimationFrame(tick);
 window.PersonnelLife={rig};
})();

// Botón «Más» para las opciones que casi no se usan
{const tools=document.querySelector('#viewbar .nav-tools');
 if(tools&&!$$('extraBtn')){
  [...tools.children].forEach(b=>{if(b.tagName==='BUTTON'&&/^Circuito$/i.test(b.textContent.trim()))b.dataset.extra='1';});
  const m=document.createElement('button');m.id='extraBtn';m.type='button';m.textContent='Más opciones';m.setAttribute('aria-pressed','false');
  m.onclick=()=>{const on=document.body.classList.toggle('show-extra');m.setAttribute('aria-pressed',String(on));m.textContent=on?'Menos opciones':'Más opciones';};
  tools.append(m);}}

// Ilustración de portada: grupo electrógeno (reemplaza el diagrama de rutas)
{const pane=$$('gameRoutePane');if(pane&&!$$('coverArtBox')){
 [...pane.children].forEach(c=>{c.style.display='none';});
 const box=document.createElement('div');box.id='coverArtBox';box.innerHTML=`<svg id="coverArt" viewBox="0 0 560 400" role="img" aria-label="Dibujo del grupo electrógeno: radiador, motor diésel, alternador y tablero de control">
<defs><pattern id="caHaz" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="7" height="14" fill="#ffc400"/><rect x="7" width="7" height="14" fill="#0b0b0a"/></pattern></defs>
<g class="ca-bolt"><path d="M292 8 L262 62 H284 L270 104 L316 44 H292 Z" fill="#ffc400"/></g>
<g stroke="#ffc400" stroke-width="2.5" stroke-linejoin="round" fill="#161510">
<rect x="40" y="300" width="480" height="22" fill="url(#caHaz)" stroke="none"/><rect x="40" y="300" width="480" height="22" fill="none"/>
<rect x="56" y="322" width="26" height="22" /><rect x="478" y="322" width="26" height="22"/>
<rect x="52" y="150" width="86" height="150" fill="#1f1d12"/>
<g stroke-width="1.6"><path d="M62 166H128M62 182H128M62 198H128M62 214H128M62 230H128M62 246H128M62 262H128M62 278H128"/></g>
<circle cx="95" cy="225" r="36" fill="#0b0b0a"/><g class="ca-fan" stroke-width="3"><path d="M95 190V260M60 225H130M70 200L120 250M120 200L70 250"/></g>
<rect x="138" y="170" width="190" height="130" fill="#ffc400"/>
<rect x="150" y="184" width="166" height="26" fill="#0b0b0a" stroke="none"/><g fill="#ffc400" stroke="none"><rect x="160" y="190" width="14" height="14"/><rect x="186" y="190" width="14" height="14"/><rect x="212" y="190" width="14" height="14"/><rect x="238" y="190" width="14" height="14"/><rect x="264" y="190" width="14" height="14"/><rect x="290" y="190" width="14" height="14"/></g>
<rect x="150" y="224" width="166" height="62" fill="#e0ac00" stroke="#0b0b0a"/><path d="M150 244H316M150 264H316" stroke="#0b0b0a"/>
<path d="M170 170V112H190V170M240 170V132H252V170" fill="#161510"/><rect x="164" y="102" width="32" height="12" fill="#161510"/>
<rect x="328" y="196" width="40" height="104" fill="#1f1d12"/><rect x="368" y="184" width="104" height="116" rx="10" fill="#1f1d12"/>
<g stroke-width="1.6"><path d="M384 184V300M400 184V300M416 184V300M432 184V300M448 184V300"/></g>
<rect x="472" y="212" width="22" height="64" fill="#161510"/>
<rect x="384" y="104" width="96" height="76" fill="#12120f"/><rect x="394" y="114" width="42" height="26" fill="#0b0b0a"/><path d="M398 134l8-10 8 6 10-12 8 10" stroke-width="2" fill="none"/><circle cx="458" cy="124" r="6" fill="#ffc400"/><circle cx="458" cy="146" r="6" fill="#0b0b0a"/><rect x="394" y="150" width="76" height="16" fill="#0b0b0a"/><path d="M402 158H462" stroke-width="2"/>
</g>
<g font-family="Bahnschrift,'Segoe UI',Arial,sans-serif" font-size="15" font-weight="700" fill="#f4f1e4">
<g stroke="#f4f1e4" stroke-width="1.5" fill="none"><path d="M95 150V128"/><path d="M233 322V338"/><path d="M420 322V338"/></g>
<text x="95" y="120" text-anchor="middle">Radiador</text>
<text x="233" y="356" text-anchor="middle">Motor diésel</text>
<text x="432" y="92" text-anchor="middle">Tablero de control</text>
<text x="420" y="356" text-anchor="middle">Alternador</text>
</g>
</svg>
<div class="ca-spec"><span><b>50 kW</b>potencia</span><span><b>480 V</b>salida</span><span><b>60 Hz</b>frecuencia</span></div>`;pane.prepend(box);}}

// Sonido ambiente sintetizado: motor del generador según rpm, alarma al fallar la red, arranque, relevador de transferencia y pasos.
(function(){
 let ac=null,master,eng,engF,engG,engO1,engO2,noise,lastStage=null,lastSource=null,lastGrid=null,stepT=0,lastPos=null,started=false;
 const muted=()=>{const b=document.getElementById('hudSound');return b&&b.getAttribute('aria-pressed')==='true';};
 function init(){
  if(ac)return;try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
  master=ac.createGain();master.gain.value=.9;master.connect(ac.destination);
  engG=ac.createGain();engG.gain.value=0;engF=ac.createBiquadFilter();engF.type='lowpass';engF.frequency.value=200;
  engO1=ac.createOscillator();engO1.type='sawtooth';engO2=ac.createOscillator();engO2.type='square';
  engO1.frequency.value=20;engO2.frequency.value=10;
  const g2=ac.createGain();g2.gain.value=.5;engO1.connect(engF);engO2.connect(g2);g2.connect(engF);engF.connect(engG);engG.connect(master);engO1.start();engO2.start();
  const len=ac.sampleRate,buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;noise=buf;
 }
 function resume(){init();if(ac&&ac.state==='suspended')ac.resume();started=true;}
 ['pointerdown','keydown'].forEach(t=>window.addEventListener(t,resume,{capture:true}));
 const tone=(f,t,d,type,v,f2)=>{const n=ac.currentTime+t,o=ac.createOscillator(),g=ac.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,n);if(f2)o.frequency.exponentialRampToValueAtTime(f2,n+d);g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(v||.08,n+.01);g.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(g);g.connect(master);o.start(n);o.stop(n+d+.02);};
 const burst=(t,d,v,freq)=>{const n=ac.currentTime+t,src=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();src.buffer=noise;f.type='bandpass';f.frequency.value=freq||800;g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.0001,n+d);src.connect(f);f.connect(g);g.connect(master);src.start(n);src.stop(n+d+.02);};
 const alarm=()=>{for(let i=0;i<3;i++){tone(880,i*.32,.2,'square',.05);tone(660,i*.32+.16,.14,'square',.04);}};
 const crank=()=>{for(let i=0;i<7;i++)tone(70+i*6,i*.22,.18,'sawtooth',.06,50+i*5);burst(0,1.5,.04,300);};
 const clunk=()=>{tone(110,0,.18,'square',.1,60);burst(0,.12,.12,1800);tone(70,.12,.3,'sine',.12,45);};
 function loop(){
  if(!ac||!started)return;
  const mute=muted();master.gain.value=mute?0:.9;
  const sv=(typeof s!=='undefined'&&s)?s:null;if(!sv)return;
  const rpm=sv.rpm||0,t=ac.currentTime;
  const menuOpen=!!(window.gameMenuActive||window.plantPresentationActive);
  const inPlant=(typeof campusNav!=='undefined'&&campusNav.mode==='basement')||(window.Walk31&&Walk31.state().active&&Walk31.state().zone==='plant');
  const loud=menuOpen?.2:(inPlant?1:.35);
  const k=Math.min(1,rpm/1800);
  engO1.frequency.setTargetAtTime(14+k*46,t,.15);engO2.frequency.setTargetAtTime(7+k*23,t,.15);
  engF.frequency.setTargetAtTime(120+k*380,t,.2);
  engG.gain.setTargetAtTime(rpm>20?(.04+.1*k)*loud:0,t,.25);
  if(lastStage!==null&&sv.stage!==lastStage){if(sv.stage==='starting')crank();if(sv.stage==='fault')alarm();}
  if(lastGrid!==null&&sv.grid!==lastGrid&&!sv.grid)alarm();
  if(lastSource!==null&&sv.source!==lastSource&&(sv.source==='gen'||sv.source==='grid'))clunk();
  lastStage=sv.stage;lastSource=sv.source;lastGrid=sv.grid;
  // pasos
  try{const w=window.Walk31&&Walk31.state();if(w&&w.active&&!menuOpen){const p=w.position;if(lastPos){const d=Math.hypot(p[0]-lastPos[0],p[2]-lastPos[2]);if(d>.02){stepT+=d;if(stepT>.75){stepT=0;burst(0,.07,.05,260);}}}lastPos=p.slice();}else lastPos=null;}catch(e){}
 }
 setInterval(loop,100);
 window.AmbientSound={state:()=>({on:!!ac,gain:engG?engG.gain.value:0})};
})();
const menu=$$('gameLaunch');
if(!menu)return;
// Aviso de teclas bajo los botones
const box=menu.querySelector('.g-entry-actions');
if(box&&!$$('gameKeys')){
 const k=document.createElement('div');k.id='gameKeys';
 k.innerHTML='<span><kbd>↑</kbd><kbd>↓</kbd> elegir</span><span><kbd>Enter</kbd> entrar</span><span><kbd>Esc</kbd> volver al menú</span><span id="gameKeysPad" hidden>Control: cruceta y A</span>';
 const ord=menu.querySelector('.g-order');(ord||box).after(k);
}
// Quita los números viejos del texto («01 Elegir una misión»): ahora el número es el nivel
[...menu.querySelectorAll('.g-entry-actions button')].forEach(b=>{const tn=[...b.childNodes].find(x=>x.nodeType===3&&/\S/.test(x.textContent));if(tn)tn.textContent=tn.textContent.replace(/^[\s\u00a0]*\d{2}[\s\u00a0]+/,'').trim();});
const btns=()=>[...menu.querySelectorAll('.g-entry-actions button')].filter(b=>!b.hidden&&b.style.display!=='none'&&b.offsetParent!==null);
// Teclado: flechas mueven entre niveles
menu.addEventListener('keydown',e=>{
 if(!menu.open)return;
 const dir=(e.key==='ArrowDown'||e.key==='ArrowRight')?1:(e.key==='ArrowUp'||e.key==='ArrowLeft')?-1:0;
 if(!dir)return;
 const l=btns();if(!l.length)return;
 const i=l.indexOf(document.activeElement);
 e.preventDefault();l[(i+dir+l.length)%l.length].focus();
});
// Control: cruceta / palanca mueven, A entra. Solo mientras el menú está abierto.
let prev={u:0,d:0,a:0},padTimer=0;
function pad(){
 if(!menu.open)return;
 let g=null;try{const l=navigator.getGamepads?navigator.getGamepads():[];for(const x of l)if(x){g=x;break;}}catch(e){clearInterval(padTimer);padTimer=0;return;}
 if(!g)return;
 const hint=$$('gameKeysPad');if(hint)hint.hidden=false;
 const ay=g.axes[1]||0;
 const u=(g.buttons[12]&&g.buttons[12].pressed)||ay<-.6?1:0,d=(g.buttons[13]&&g.buttons[13].pressed)||ay>.6?1:0,a=(g.buttons[0]&&g.buttons[0].pressed)?1:0;
 const l=btns(),i=l.indexOf(document.activeElement);
 if(u&&!prev.u&&l.length)l[(i<=0?l.length:i)-1].focus();
 if(d&&!prev.d&&l.length)l[(i+1)%l.length].focus();
 if(a&&!prev.a&&i>=0)l[i].click();
 prev={u,d,a};
}
padTimer=setInterval(pad,90);
// Al abrirse, el foco queda en el primer nivel (sin entrar solo)
const focusFirst=()=>{if(menu.open){const l=btns();if(l.length&&!menu.contains(document.activeElement)||document.activeElement===menu)l[0]&&l[0].focus({preventScroll:true});}};
new MutationObserver(()=>setTimeout(focusFirst,50)).observe(menu,{attributes:true,attributeFilter:['open']});
setTimeout(focusFirst,300);
})();
