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
