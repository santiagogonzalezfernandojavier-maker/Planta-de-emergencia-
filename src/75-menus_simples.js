// v12.23 · Menús más simples: en cada pantalla solo queda lo que se usa.
(function(){
 const $=id=>document.getElementById(id);
 const st=document.createElement('style');st.textContent=`
/* Barra superior: fuera los datos que no se usan al presentar (nivel/XP, "simulación local", grupo, reloj) */
body.game-ui header small,body.game-ui .sim-tag,body.game-ui .hmi-config,body.game-ui .hmi-meta>span:not(.sim-tag):not(.hmi-config),
body.game-ui #hudXP .hx-lv,body.game-ui #hudXP .hx-main{display:none!important}
body.game-ui #hudXP{background:none!important;border:0!important;clip-path:none!important;padding:0!important}
/* Menú inicial */
dialog#gameLaunch .g-launch-meta{display:none!important}
/* Rutina de mantenimiento: solo la tarjeta de la tarea y la señal */
body.rutina-on #nav33,body.rutina-on #turnPad34,body.rutina-on #sceneFooter,body.rutina-on #edu{display:none!important}
/* Despiece: las etiquetas alrededor del modelo ya son la lista */
#ppPartList,.pp-note,#ppRotation,.pp-kicker{display:none!important}
#rtIntro .rt-keys{list-style:none;margin:10px 0 16px;padding:0;display:grid;gap:9px}
#rtIntro .rt-keys li{display:flex;align-items:center;gap:10px}
#rtIntro .rt-keys span.k{min-width:128px;display:inline-flex;gap:3px}
`;document.head.appendChild(st);
 // Título de la barra según el modo
 const h1=document.querySelector('header h1'),name=()=>document.body.classList.contains('func-mode')?'Funcionamiento de la planta':document.body.classList.contains('rutina-on')?'Mantenimiento práctico':'Planta de emergencia';
 const sync=()=>{if(h1&&h1.textContent!==name())h1.textContent=name();};
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});sync();
 // Despiece: salir vuelve al menú y el botón principal lleva al nivel 2
 const c=$('ppClose'),e=$('ppEnter');
 if(c&&e){const leave=c.onclick;
  c.textContent='Volver al menú';c.onclick=ev=>{leave&&leave.call(c,ev);try{GameInterface.openMenu(true);}catch(x){}};
  e.textContent='Ver funcionamiento →';e.onclick=ev=>{leave&&leave.call(e,ev);const t=$('gameTraining');if(t)t.click();};}
})();
