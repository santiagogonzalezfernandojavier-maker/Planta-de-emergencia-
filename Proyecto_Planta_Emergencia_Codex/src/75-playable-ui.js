// Organize existing modes and actions without replacing their simulation or work orders.
(()=>{
 document.body.classList.add('playable48');
 const launch=$('gameLaunch'),actions=launch.querySelector('.g-entry-actions');
 const modes=[
  ['gameAnatomy','01','Conocer el equipo','Anatomía 3D, cubierta y componentes.'],
  ['gameMaintenance','02','Practicar en la planta','12 actividades con herramientas y pasos guiados.'],
  ['gameSubstationMaintenance44','03','Practicar en subestación','Inspección, bajantes y comparación térmica.'],
  ['gameEnter','04','Explorar instalación','Recorrido libre a pie: WASD y mouse.'],
  ['gamePresentation45','05','Ver una demostración','Recorrido de presentación con siguiente y anterior.'],
  ['gameTraining','06','Pruebas eléctricas','Falla de red, transferencia y respuesta a la carga.']
 ];
 const buttons=modes.map(([id,n,title,description])=>{const b=$(id);b.classList.add('entry-card48');b.innerHTML='<span class="entry-number48">'+n+'</span><span><b>'+title+'</b><small>'+description+'</small></span><span aria-hidden="true">›</span>';return b;});
 actions.replaceChildren(...buttons);launch.querySelector('.g-launch-intro>h2').innerHTML='Comprende el equipo.<br><em>Practica paso a paso.</em>';
 launch.querySelector('.g-launch-intro>p').textContent='Elige una modalidad. En las prácticas verás qué buscar, qué hacer y cómo comprobar el resultado.';
 const extra=document.createElement('div');extra.className='entry-reference48';
 extra.innerHTML='<button id="menuPlates48">Placas de datos</button><button id="menuUnifilar48">Unifilar técnico</button><button id="menuHelp48">Cómo jugar</button>';
 actions.after(extra);$('menuPlates48').onclick=()=>EquipmentInspector48.open('G-01');$('menuUnifilar48').onclick=()=>{GameInterface.closeMenu();$('showSingle').click();};$('menuHelp48').onclick=()=>$('gameHelp').showModal();
 launch.querySelector('.g-launch-note').textContent='WASD: moverte · F: mirar con mouse · E: actuar · Q: ayuda · Esc: pausa';
 const help=$('gameHelp');help.querySelector('p').textContent='Durante el recorrido, sigue la tarjeta Haz ahora. Mirar pieza orienta la cámara; el botón principal indica la acción del paso y si debes mantenerlo.';
 help.querySelector('dl').innerHTML='<dt>WASD</dt><dd>Caminar; Shift acelera el paso.</dd><dt>F / clic en espacio libre</dt><dd>Mirar al mover el mouse. Esc libera el cursor.</dd><dt>E / botón de acción</dt><dd>Usar la pieza señalada; mantener cuando se indique.</dd><dt>Q</dt><dd>Pasos, explicación y registro de la actividad.</dd><dt>B</dt><dd>Abrir la bolsa al estar cerca de ella.</dd><dt>L</dt><dd>Encender o apagar la linterna equipada.</dd><dt>C / Z</dt><dd>Agacharte / vista de inspección.</dd><dt>Esc</dt><dd>Pausar, liberar cursor y volver al menú.</dd><dt>Vista general</dt><dd>Arrastrar desplaza; Shift + arrastrar gira; la rueda acerca.</dd><dt>Pruebas eléctricas</dt><dd>Fuera del recorrido: E/X arranca/detiene; G conmuta la red; Espacio pausa; R reinicia.</dd>';
 let menuReturn=null;
 const home=document.createElement('button');home.id='walkHome48';home.textContent='Menú principal';$('walkGameMenu').querySelector('.walk-menu-card').append(home);
 home.onclick=()=>{menuReturn={walk:Walk31.state(),plant:Maintenance.state().active,tool:Maintenance.state().tool};Walk31.pause(false);Maintenance.suspend33();GameInterface.openMenu();};
 const continueSession=$('gameContinue').onclick;$('gameContinue').onclick=()=>{continueSession();if(!menuReturn)return;const v=menuReturn;menuReturn=null;if(v.plant&&v.walk.zone==='plant')Maintenance.resume33();else{Walk31.enterZone(v.walk.zone);Walk31.equipInspection(v.tool);}Walk31.restoreInspection(v.walk);Walk31.pause(false);};
 for(const button of buttons){const action=button.onclick;button.onclick=e=>{menuReturn=null;action(e);};}
 const explore=$('gameEnter').onclick;$('gameEnter').onclick=()=>{explore();Maintenance.suspend33();Walk31.enterZone('plant');};
 // Consultation tools live in the same menu instead of covering the left of the scene.
 const menu=$('nav33menu');
 for(const id of ['safetyOpen42','duOpen42','protectionOpen44']){const button=$(id);if(button)menu.append(button);}
 menu.addEventListener('click',e=>{if(e.target.closest('button')){menu.hidden=true;$('nav33toggle').setAttribute('aria-expanded','false');}});
})();
