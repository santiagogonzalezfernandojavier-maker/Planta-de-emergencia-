// One camera controller, using the existing scene frame; the walking session is restored on exit.
const EquipmentInspector48=(()=>{
 const viewer=$('viewer'),entries=new Map(),panel=document.createElement('section');
 panel.id='equipmentInspector48';panel.hidden=true;panel.setAttribute('role','region');panel.setAttribute('aria-label','Placas de datos de los equipos');viewer.append(panel);
 panel.innerHTML='<header><span>IDENTIFICACIÓN DEL EQUIPO</span><button id="plateClose48">Volver a mi vista</button></header><label for="plateSelect48">Equipo</label><select id="plateSelect48"></select><div id="plateData48"></div><div class="plate-tools48"><button id="plateZoomOut48" aria-label="Alejar placa">−</button><button id="plateFit48">Encuadrar placa</button><button id="plateZoomIn48" aria-label="Acercar placa">+</button></div><button id="plateInterior48" hidden>Ver interior del gabinete</button><p id="plateViewHint48" role="status"></p>';
 let active=false,selected='AP-01',saved=null,zoom=1,transition=null,layout='',view='plate',refreshKey='';
 const doors=new Map(),reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function attached(object){for(let p=object;p;p=p.parent)if(p===scene)return true;return false;}
 function drawTexture(data){
  const c=document.createElement('canvas');c.width=1024;c.height=640;const x=c.getContext('2d');
  x.fillStyle='#e3e7e5';x.fillRect(0,0,c.width,c.height);x.strokeStyle='#5a6d75';x.lineWidth=5;x.strokeRect(12,12,1000,616);
  x.fillStyle='#153b48';x.fillRect(25,25,974,104);x.fillStyle='#ffffff';x.textBaseline='middle';x.font='700 46px Arial';x.fillText('NEXORA',48,65);
  x.font='600 24px Arial';x.textAlign='right';x.fillText(data.id+' / '+data.model,974,65);x.font='20px Arial';x.fillText('MODELO DIDÁCTICO · MARCA FICTICIA',974,105);x.textAlign='left';
  x.fillStyle='#18343d';let title=30;x.font='700 '+title+'px Arial';while(x.measureText(data.name).width>926)x.font='700 '+(--title)+'px Arial';x.fillText(data.name,48,162);
  const rows=[...data.fields,...data.unknown],height=Math.min(47,392/rows.length);
  rows.forEach((row,i)=>{const y=197+i*height;x.fillStyle=i%2?'#d2dcd9':'#e9eeeb';x.fillRect(36,y,952,height);x.fillStyle='#36515b';x.font='24px Arial';let name=row.name;while(x.measureText(name).width>427&&name.length>4)name=name.slice(0,-2);x.fillText(name,48,y+height/2);x.fillStyle=row.origin==='Pendiente de proyecto'?'#65523b':'#132e37';let size=24;x.font='600 '+size+'px Arial';while(x.measureText(row.value).width>480&&size>14)x.font='600 '+(--size)+'px Arial';x.fillText(row.value,490,y+height/2);});
  x.fillStyle='#36515b';x.font='20px Arial';x.fillText('Datos del escenario. Capacidades pendientes según proyecto.',48,606);
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return texture;
 }
 function register(id,owner,position,w=.56,h=.35,rotation=0){
  if(!owner)return;const old=entries.get(id);if(old&&attached(old.group))return;if(old){old.face.material.map.dispose();old.face.material.dispose();old.group.traverse(o=>{if(o.isMesh)o.geometry.dispose();});old.group.removeFromParent();}
  const group=new T.Group();group.name=id+' · placa de datos NEXORA';group.userData.noCompact=true;group.position.set(...position);group.rotation.y=rotation;owner.add(group);
  const plate=box(group,[w+.02,h+.02,.012],[0,0,0],mat('#9dadb1',.75));plate.castShadow=false;
  const data=EquipmentData48.get(id,cfg),face=mesh(group,new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:drawTexture(data),toneMapped:false}),[0,0,.007]);
  face.name=id+' · datos de placa';face.castShadow=face.receiveShadow=false;face.userData.equipment48=id;
  for(const dx of [-w*.47,w*.47])for(const dy of [-h*.45,h*.45])cabinetFastener20(group,[dx,dy,.008]);
  const cabinetId=CabinetParts38.find(d=>d.leaf===owner)?.id;if(cabinetId)group.traverse(o=>{if(o.isMesh)o.userData.cabinet38=cabinetId;});
  const ccmDoor=CCM34.doors.findIndex(d=>d.leaf===owner);if(ccmDoor>=0)group.traverse(o=>{if(o.isMesh)o.userData.door34=ccmDoor;});
  entries.set(id,{id,group,face,w,h});
 }
 function install(){
  register('G-01',root,[1.70,.72,1.38],.60,.37);
  register('Q0',substation.site,[4.7,.60,1.235],.48,.30);
  for(const [id,x,z]of [['TE',11.6,3.6],['TP',24.4,-.8]])register(id,substation.subParts[id],[x-.23,7.72,z+.79],.49,.30);
  for(const b of ProtectionLayout44.banks)register(b.id,ProtectionModel44.surge.children.find(g=>g.name.startsWith(b.id+' ·')),[b.x,7.10,b.z+.32],.60,.35);
  for(const [id,x,z]of [['QN',17.9,-1.6],['QG',18.4,1.3],['QS',20.8,-.9]])register(id,substation.subParts[id],[x+.61,7.15,z+.58],.40,.28);
  for(const [id,key,x,z]of [['TC-01','ct',18.3,-4.65],['TP-M','vt',19.95,-3.75]]){
   const owner=substation.referenceParts[key];if(!entries.has(id)){box(owner,[.025,.85,.025],[x,7.08,z+.47],mat('#809497',.6));}register(id,owner,[x,7.52,z+.50],.56,.35);
  }
  for(const id of ['PR-01','DC-01','QF-01']){const d=Cabinets38.entries().find(e=>e.id===id);if(d)register(id,d.leaf,[d.dimensions48.w*.47,id==='PR-01'?-.34:-.30,.058],id==='PR-01'?.39:.43,id==='PR-01'?.22:.28);}
  const principal=CCM34.doors[0];if(principal)register('CCM-01',principal.leaf,[principal.w/2,-principal.h*.20,.075],.50,.31);
  for(const m of ProtectionLayout44.masts)register(m.id,ProtectionModel44.lightning.children.find(g=>g.name.startsWith(m.id+' ·')),[m.x,7.54,m.z+m.front*.34],.56,.34,m.front<0?Math.PI:0);
  for(const face of EquipmentLabels48.faces){if(!attached(face)){EquipmentLabels48.faces.delete(face);continue;}const id=EquipmentData48.definitions.find(d=>(face.userData.labelText||'').startsWith(d.id+' ')||(face.userData.labelText||'').startsWith(d.id+' ·'));if(id)face.userData.equipment48=id.id;}
 }
 function stateOfCamera(){return{walk:Walk31.state(),plant:Maintenance.state().active,tool:Maintenance.state().tool,lamp:Walk31.lampState().on,angle,elevation,distance,pan:panOffset.clone(),target:campusNav.target.clone(),mode:campusNav.mode,spinning,tour:campusNav.tour,fov:camera.fov,near:camera.near,view:camera.view?{...camera.view}:null,position:camera.position.clone(),quaternion:camera.quaternion.clone(),checks:[...document.querySelectorAll('input[id^="hide"]')].map(e=>[e,e.checked]),flows:$('flows').checked,title:$('viewName').textContent,code:$('viewCode').textContent};}
 function cabinet(){return Cabinets38.entries().find(d=>d.id===(['QN','QG','QS'].includes(selected)?'SE-'+selected:selected));}
 function showData(){
  const d=EquipmentData48.get(selected,cfg);if(!d)return;
  $('plateData48').innerHTML='<span class="plate-brand48">NEXORA <small>'+escape(d.model)+'</small></span><h2>'+escape(d.id)+' · '+escape(d.name)+'</h2><p class="plate-origin48">Marca y modelo ficticios · datos del escenario</p><dl>'+d.fields.map(f=>'<div><dt>'+escape(f.name)+'</dt><dd>'+escape(f.value)+(f.origin.startsWith('Calculada')?'<small>'+escape(f.origin)+'</small>':'')+'</dd></div>').join('')+'</dl><details open><summary>Datos pendientes de proyecto</summary><dl>'+d.unknown.map(f=>'<div><dt>'+escape(f.name)+'</dt><dd>Por definir</dd></div>').join('')+'</dl></details>';
  $('plateInterior48').hidden=!cabinet()?.assembly48;
  $('plateInterior48').textContent=view==='interior'?'Volver a la placa':'Ver interior del gabinete';
  $('plateViewHint48').textContent=view==='interior'?'Mecanismo y circuitos secundarios representativos. E/V conservan su uso al volver al recorrido.':'La cámara muestra la placa montada en el equipo. Usa +/− o la rueda para ajustar el acercamiento. Esc vuelve a tu vista.';
 }
 function refresh(){for(const e of entries.values()){const old=e.face.material.map;e.face.material.map=drawTexture(EquipmentData48.get(e.id,cfg));old.dispose();}if(active)showData();}
 function select(id){if(!entries.has(id))return;selected=id;view='plate';zoom=1;layout='';$('plateSelect48').value=id;showData();transition={position:camera.position.clone(),quaternion:camera.quaternion.clone(),age:0};}
 function open(id='AP-01'){
  if(window.PresentationTour45?.state().active)PresentationTour45.stop();
  if(window.gameMenuActive)GameInterface.closeMenu();
  if($('techDialog').open)$('techDialog').close();if($('plantPresentation').open)PlantPresentation.close();
  if(!active){saved=stateOfCamera();Maintenance.suspend33();campusNav.tour=false;spinning=false;panOffset.set(0,0,0);active=true;document.body.classList.add('equipment-inspecting48');}
  install();panel.hidden=false;$('hideFence').checked=true;$('flows').checked=false;for(const p of particles)p.dot.visible=false;substation.update();camera.fov=36;camera.near=.04;camera.updateProjectionMatrix();
  select(entries.has(id)?id:'AP-01');$('plateClose48').focus();frameUI(0);
 }
 function close(){if(!active)return;active=false;panel.hidden=true;document.body.classList.remove('equipment-inspecting48');
  for(const [d,v]of doors){Object.assign(d,v);d.pivot.rotation.y=v.angle;d.cover.visible=v.covered;}doors.clear();
  camera.clearViewOffset();camera.fov=saved.fov;camera.near=saved.near;camera.updateProjectionMatrix();
  if(saved.walk.active){if(saved.plant&&saved.walk.zone==='plant')Maintenance.resume33();else{Walk31.enterZone(saved.walk.zone);Walk31.equipInspection(saved.tool);}Walk31.restoreInspection(saved.walk);if(Walk31.lampState().on!==saved.lamp)Walk31.toggleLamp();Walk31.pause(saved.walk.paused);}
  else{angle=saved.angle;elevation=saved.elevation;distance=saved.distance;campusNav.target.copy(saved.target);panOffset.copy(saved.pan);campusNav.mode=saved.mode;spinning=saved.spinning;campusNav.tour=saved.tour;camera.position.copy(saved.position);camera.quaternion.copy(saved.quaternion);}
  if(saved.view?.enabled){const v=saved.view;camera.setViewOffset(v.fullWidth,v.fullHeight,v.offsetX,v.offsetY,v.width,v.height);}
  $('flows').checked=saved.flows;CCM34.inspectionLight.visible=false;for(const [e,value]of saved.checks)e.checked=value;$('viewName').textContent=saved.title;$('viewCode').textContent=saved.code;substation.update();renderer.shadowMap.needsUpdate=true;
 }
 function interior(){const d=cabinet();if(!d?.assembly48)return;if(view==='interior'){view='plate';}else{
   if(!doors.has(d))doors.set(d,{open:d.open,angle:d.angle,target:d.target,covered:d.covered});d.open=true;d.target=-Math.PI*.56;view='interior';
  }zoom=1;layout='';transition={position:camera.position.clone(),quaternion:camera.quaternion.clone(),age:0};showData();}
 function frameUI(dt){
  const key=[cfg.rating,cfg.freq,cfg.phase,cfg.fuel].join('|');if(key!==refreshKey){refreshKey=key;refresh();}
  if(!active)return;const e=entries.get(selected);if(!e)return;
  const d=cabinet(),canvas=renderer.domElement.getBoundingClientRect(),rect=panel.getBoundingClientRect(),mobile=canvas.width<=700;
  const availableW=mobile?canvas.width:Math.max(140,canvas.width-rect.width-28),availableH=mobile?Math.max(100,canvas.height-rect.height-22):canvas.height;
  const marker=view==='interior'&&d?d.interior:e.group;marker.updateWorldMatrix(true,true);
  let center,normal,width,height;
  if(view==='interior'&&d){const a=d.dimensions48;center=d.owner.localToWorld(new T.Vector3(a.x,a.y,a.z));normal=new T.Vector3(0,0,1).transformDirection(d.owner.matrixWorld);width=a.w*1.3;height=a.h*1.20;}
  else{center=e.group.getWorldPosition(new T.Vector3());normal=new T.Vector3(0,0,1).transformDirection(e.group.matrixWorld);width=e.w;height=e.h;}
  const aspect=canvas.width/Math.max(1,canvas.height),ratio=Math.max(height/(availableH/canvas.height),width/(aspect*availableW/canvas.width));
  const radius=Math.max(.38,ratio/(2*Math.tan(camera.fov*Math.PI/360))*1.20)/zoom,position=center.clone().addScaledVector(normal,radius);
  const targetQ=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().lookAt(position,center,new T.Vector3(0,1,0)));
  const nextLayout=[canvas.width,canvas.height,rect.width,rect.height,zoom,view].join('|');
  if(nextLayout!==layout){layout=nextLayout;camera.aspect=aspect;camera.setViewOffset(canvas.width,canvas.height,mobile?0:rect.width/2+14,mobile?rect.height/2+11:0,canvas.width,canvas.height);}
  campusNav.target.copy(center);angle=Math.atan2(normal.x,normal.z);elevation=Math.atan2(normal.y,Math.hypot(normal.x,normal.z));distance=radius;
  if(transition){transition.age+=Math.max(0,dt);const t=reduced.matches?1:Math.min(1,transition.age/.65),ease=t*t*(3-2*t);camera.position.copy(transition.position).lerp(position,ease);camera.quaternion.copy(transition.quaternion).slerp(targetQ,ease);if(t===1)transition=null;}
  else{camera.position.copy(position);camera.quaternion.copy(targetQ);}camera.updateMatrixWorld(true);CCM34.inspectionLight.visible=view==='interior';if(view==='interior'){CCM34.inspectionLight.position.copy(camera.position);CCM34.inspectionLight.intensity=Math.min(10,radius*radius*5);}
 }
 function adjust(delta){zoom=Math.max(.65,Math.min(1.8,zoom+delta));layout='';}
 $('plateSelect48').innerHTML=EquipmentData48.definitions.map(e=>'<option value="'+e.id+'">'+e.id+' · '+e.name+'</option>').join('');
 $('plateSelect48').onchange=e=>select(e.target.value);$('plateClose48').onclick=close;$('plateInterior48').onclick=interior;$('plateZoomIn48').onclick=()=>adjust(.15);$('plateZoomOut48').onclick=()=>adjust(-.15);$('plateFit48').onclick=()=>{zoom=1;layout='';};
 const entry=document.createElement('button');entry.id='platesOpen48';entry.textContent='Placas de datos · NEXORA';entry.onclick=()=>open();$('nav33menu').prepend(entry);
 document.addEventListener('keydown',e=>{if(active&&e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}},true);
 document.addEventListener('pointerdown',e=>{if(!active||e.target!==renderer.domElement)return;e.preventDefault();e.stopImmediatePropagation();const r=renderer.domElement.getBoundingClientRect(),ray=new T.Raycaster();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);const objects=[...entries.values()].map(e=>e.face).concat([...EquipmentLabels48.faces].filter(o=>o.userData.equipment48&&attached(o)));const hit=ray.intersectObjects(objects,false).find(h=>{for(let p=h.object;p;p=p.parent)if(!p.visible)return false;return true;});if(hit?.object.userData.equipment48)select(hit.object.userData.equipment48);},true);
 document.addEventListener('wheel',e=>{if(!active||e.target!==renderer.domElement)return;e.preventDefault();e.stopImmediatePropagation();adjust(e.deltaY>0?-.10:.10);},{capture:true,passive:false});
 install();const oldBuild=build;build=function(){oldBuild();install();refresh();};const oldFrame=CCM34.frame;CCM34.frame=function(dt){oldFrame(dt);frameUI(dt);};
 return{open,close,select,interior,frame:frameUI,refresh,state:()=>({active,selected,view,zoom,transitioning:!!transition}),data:id=>EquipmentData48.get(id,cfg),plates:()=>[...entries.values()]};
})();
window.EquipmentInspector48=EquipmentInspector48;
