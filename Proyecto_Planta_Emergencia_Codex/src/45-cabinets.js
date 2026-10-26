// Articulated service doors and removable deadfronts; no inventory gate or extra render loop.
const Cabinets38=(()=>{
 const steel=mat('#9ca9a7',.75),dark=mat('#273034');
 document.querySelector('.walk-bindings').insertAdjacentHTML('beforeend','<span><kbd>V</kbd>Retirar / reponer cubierta</span>');
 const hint=document.createElement('div');hint.id='cabinetHint38';hint.setAttribute('role','status');$('viewer').append(hint);
 const canopyButton=document.createElement('button');canopyButton.id='canopy38';canopyButton.textContent='Instalar cubierta G-01';$('viewer').append(canopyButton);
 let expires=0,toast='',canopy,canopyCovered=false,lastZone=Walk31.state().zone,lastHint40=0;
 function message(text){toast=text;expires=performance.now()+4500;hint.textContent=text;}
 function visible(object){while(object){if(!object.visible)return false;if(object===scene)return true;object=object.parent;}return false;}
 function entries(){return CabinetParts38.filter(d=>visible(d.owner));}
 function distance(object){return new T.Box3().setFromObject(object).distanceToPoint(camera.position);}
 function authorize(key,object){const result=CabinetAccess38.check(key,object.isGroup&&object.children.length?distance(object):object.getWorldPosition(new T.Vector3()).distanceTo(camera.position));if(!result.ok)message(result.message);return result.ok;}
 // Replace the QF solid block while preserving its feeder, duct and moving flow arrows.
 articulateCabinet38(qfFactory,{id:'QF-01',key:'yard',x:26.5,y:7.7,z:3.26,w:.80,h:1.65,depth:.68,type:'feeder',body:o=>o.geometry.type==='BoxGeometry'&&Math.abs(o.geometry.parameters.width-.9)<.001&&Math.abs(o.geometry.parameters.height-1.8)<.001,front:o=>Math.abs(o.position.x-26.5)<.50&&o.position.y>6.85&&o.position.y<8.55&&o.position.z>=3.24});
 function finishCabinets(){
 // Preserve the metal latch detail on every service door.
 for(const d of CabinetParts38){if(!visible(d.owner)||d.finished38)continue;d.finished38=true;const width=new T.Box3().setFromObject(d.leaf).getSize(new T.Vector3()).x;cyl(d.leaf,.016,.016,[Math.max(.07,width-.06),-.05,.065],steel,'z');box(d.leaf,[.003,.015,.003],[Math.max(.07,width-.06),-.05,.075],dark);}
 const control=CabinetParts38.find(d=>d.id==='G01-CONTROL'&&visible(d.owner));if(control)Maintenance.mountControlDoor?.(control.leaf);
 for(const p of pieces.filter(p=>p.userData.name==='Identificación y pantalla del grupo'))for(const o of [...p.children])if(o.position.x>2.1&&o.position.x<2.9&&o.position.z>1.05)o.visible=false;
 // Retire the duplicate fixed interior behind the newly articulated controller.
 pieces.filter(p=>p.userData.name?.startsWith('Interior del gabinete')).forEach(p=>{p.userData.replaced38=true;p.visible=false;});
 }
 finishCabinets();
 function installCanopy(){
  pieces.filter(p=>['Cubierta sin marcas','Gabinete acústico con puertas'].includes(p.userData.name)).forEach(p=>{p.userData.replaced38=true;p.visible=false;});
  canopy=new T.Group();canopy.name='G-01 · envolvente acústica desmontable';canopy.userData.noCompact=true;root.add(canopy);
  const coat=new T.MeshStandardMaterial({color:'#adb4a5',metalness:.14,roughness:.57});coat.userData.hdFinish='paint';
  const roofShape=new T.Shape();roofShape.moveTo(-3.06,-1.38);roofShape.lineTo(3.06,-1.38);roofShape.lineTo(3.06,1.38);roofShape.lineTo(-3.06,1.38);roofShape.closePath();const exhaustOpening=new T.Path();exhaustOpening.absarc(1.65,-.8,.17,0,Math.PI*2,true);roofShape.holes.push(exhaustOpening);const roof=new T.ExtrudeGeometry(roofShape,{depth:.055,bevelEnabled:false});roof.rotateX(Math.PI/2);mesh(canopy,roof,coat,[0,3.04,0]);
  const collar=mesh(canopy,new T.TorusGeometry(.175,.012,8,32),steel,[1.65,3.05,-.8]);collar.rotation.x=Math.PI/2;cyl(canopy,.108,.16,[1.65,3.12,-.8],steel);
  for(const x of [-3.04,3.04]){box(canopy,[.035,2.63,2.70],[x,1.66,0],coat);for(let j=0;j<15;j++)box(canopy,[.012,.025,1.75],[x+Math.sign(x)*.024,1.14+j*.055,0],dark);}
  for(const z of [-1.36,1.36])for(let j=0;j<3;j++){
   const x=-2+j*2,pivot=new T.Group(),leaf=new T.Group();canopy.add(pivot);pivot.position.set(x-.97,1.66,z);pivot.add(leaf);if(z<0){pivot.position.x=x+.97;leaf.rotation.y=Math.PI;}pivot.userData.noCompact=true;pivot.userData.canopyHinge38=true;
   cabinetSkin20(leaf,1.92,2.58,.028,[.96,0,0],coat,.02);
   for(const y of [-.90,.90])cyl(leaf,.018,.12,[.012,y,.005],steel);
   box(leaf,[.038,.18,.048],[1.79,0,.04],dark);cyl(leaf,.017,.015,[1.79,-.13,.04],steel,'z');
   cabinetLabel20(leaf,'G-01 · PANEL '+(j+1),[.96,.91,.018],.61,.07);
   for(let n=0;n<12;n++)box(leaf,[.62,.014,.008],[.96,-.61+n*.032,.021],dark);
   const d={id:'G01-PANEL-'+(z>0?'F':'R')+j,key:'plant',type:'canopy',owner:canopy,pivot,leaf,cover:null,covered:false,open:false,angle:0,target:0};leaf.traverse(o=>{if(o.isMesh)o.userData.cabinet38=d.id;});CabinetParts38.push(d);
  }
  canopy.visible=canopyCovered;SurfaceRealism.finishScene(canopy);
 }
 installCanopy();
 const priorBuild=build;build=function(){priorBuild();for(let i=CabinetParts38.length-1;i>=0;i--){let parent=CabinetParts38[i].owner;while(parent&&parent!==scene)parent=parent.parent;if(!parent)CabinetParts38.splice(i,1);}installCanopy();finishCabinets();for(const d of entries())SurfaceRealism.finishScene(d.owner);};
 function toggleCanopy(){if(!authorize('plant',canopy))return false;const p=Walk31.state().position;if(!canopyCovered&&Math.abs(p[0])<3.12&&Math.abs(p[2])<1.45){message('Aléjate de la envolvente antes de volver a montarla.');return false;}canopyCovered=!canopyCovered;canopy.visible=canopyCovered;canopyButton.textContent=canopyCovered?'Retirar cubierta G-01 · V':'Instalar cubierta G-01';renderer.shadowMap.needsUpdate=true;message(canopyCovered?'Cubierta montada. E abre cada panel.':'Cubierta G-01 retirada para inspección.');return true;}
 canopyButton.onclick=toggleCanopy;
 const coverRoots=[];
 for(const d of CCM34.doors){if(!d.cover)continue;const center=new T.Vector3(d.pivot.position.x+d.w/2,d.pivot.position.y,6.82);const hit=mesh(basementCCM,new T.PlaneGeometry(d.w,d.h),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}),center.toArray());hit.userData.ccmCover38=CCM34.doors.indexOf(d);coverRoots.push(hit);}
 
 function raycast(objects,e){const r=renderer.domElement.getBoundingClientRect(),ray=new T.Raycaster();ray.setFromCamera(e?new T.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2):new T.Vector2(),camera);const candidates=objects.filter(visible);candidates.forEach(o=>o.updateWorldMatrix(true,true));return ray.intersectObjects(candidates,true);}
 function pick(e){const roots=entries().filter(d=>d.openable!==false).flatMap(d=>[d.leaf,...(d.coverHit?[d.coverHit]:[])]);return raycast(roots,e)[0]?.object;}
 function toggle(id){const d=entries().find(d=>d.id===id);if(!d||d.openable===false)return false;if(!d.open&&!authorize(d.key,d.leaf))return false;if(d.open&&d.cover&&!d.covered){message('Repón la cubierta interior con V antes de cerrar la puerta.');return false;}if(distance(d.leaf)>2.8){message('Acércate a la puerta.');return false;}Maintenance.gesture?.(d.leaf);d.open=!d.open;d.target=d.open?-Math.PI*.56:0;message(d.id+' · puerta '+(d.open?'abierta':'cerrada'));return true;}
 function use(e){const hit=pick(e);const id=hit?.userData.cabinet38||hit?.userData.cover38;if(!id)return false;toggle(id);return true;}
 function cover(e){const hit=raycast([...coverRoots,...entries().filter(d=>d.coverHit).map(d=>d.coverHit)],e)[0]?.object;if(hit?.userData.ccmCover38!==undefined)return CCM34.toggleCover(hit.userData.ccmCover38);const id=hit?.userData.cover38,d=entries().find(d=>d.id===id);if(d){if(d.openable===false)return false;if(!authorize(d.key,d.leaf))return false;if(!d.open){message('Abre primero la puerta con E.');return false;}Maintenance.gesture?.(d.cover);d.covered=!d.covered;d.cover.visible=d.covered;renderer.shadowMap.needsUpdate=true;message(d.covered?'Cubierta interior repuesta.':'Cubierta interior retirada; componentes conservados.');return true;}if(Walk31.state().zone==='plant')return toggleCanopy();message('Apunta a la cubierta interior de un gabinete abierto.');return false;}
 function blocks(x,z){const position=Walk31.state().position,candidates=[];for(const d of entries()){if(d.interior){d.bodyBounds??=new T.Box3().setFromObject(d.interior).expandByScalar(.16);candidates.push(d.bodyBounds);}if(d.open||d.type==='canopy')candidates.push(new T.Box3().setFromObject(d.leaf).expandByScalar(.16));}
 for(const b of candidates){if(position[1]<b.min.y-.2||position[1]>b.max.y+1.6)continue;const inside=b.containsPoint(new T.Vector3(position[0],Math.max(b.min.y,Math.min(b.max.y,position[1])),position[2]));if(!inside&&x>b.min.x&&x<b.max.x&&z>b.min.z&&z<b.max.z)return true;}return false;}

 const priorFrame=CCM34.frame;CCM34.frame=function(dt){priorFrame(dt);if(lastZone!==Walk31.state().zone){expires=0;lastZone=Walk31.state().zone;}let changed=false;for(const d of entries()){if(Math.abs(d.angle-d.target)>.001){d.angle+=(d.target-d.angle)*Math.min(1,dt*8);d.pivot.rotation.y=d.angle;changed=true;}}if(changed)renderer.shadowMap.needsUpdate=true;canopyButton.hidden=!Walk31.state().active||Walk31.state().zone!=='plant';if(performance.now()<expires){hint.textContent=toast;const target=$('fpTarget');if(target)target.hidden=true;return;}const workHint=Maintenance.contextHint?.();if(workHint){hint.textContent=workHint;const target=$('fpTarget');if(target)target.hidden=true;return;}if(performance.now()-lastHint40<120)return;lastHint40=performance.now();const hit=pick(),id=hit?.userData.cabinet38||hit?.userData.cover38;hint.textContent=id?'E · puerta '+id+' · V cubierta':Walk31.state().zone==='ccm'?'E puerta · V cubierta interior':'';const target=$('fpTarget');if(target)target.hidden=!!hint.textContent;};
 for(const d of CabinetParts38)if(visible(d.owner)){SurfaceRealism.finishScene(d.owner);d.pivot.userData.noCompact=true;}
 SurfaceRealism.finishScene(basementCCM);
 document.addEventListener('keydown',e=>{if(!Walk31.state().active||e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select'))return;if(e.code==='KeyV'&&!Walk31.state().paused&&!Walk31.state().journal&&!Walk31.state().bag){e.preventDefault();e.stopImmediatePropagation();cover();}},true);
 const style=document.createElement('style');style.textContent='#canopy38{position:absolute;z-index:43;font:11px system-ui;padding:8px 10px;color:#d9e7df;background:#122b34e6;border:1px solid #57716f;border-radius:5px}#canopy38{right:12px;bottom:16px}#canopy38[hidden]{display:none}#cabinetHint38{position:absolute;bottom:66px;left:50%;transform:translateX(-50%);z-index:45;max-width:min(520px,85%);background:#0a1c26dd;color:#e3ddbe;padding:7px 12px;border-radius:5px;font:11px/1.5 system-ui;pointer-events:none}#cabinetHint38:empty{display:none}.walk-menu-card{max-height:85vh;overflow:auto}.cabinet-scope{font-size:10px!important}@media(max-width:700px){#canopy38{bottom:115px;max-width:150px;font-size:10px}#cabinetHint38{bottom:165px}}';document.head.append(style);
 return{message,authorize,use,cover,toggle,toggleCanopy,blocks,presentationCover(){const copy=canopy.clone(true);copy.traverse(o=>{if(o.userData.canopyHinge38)o.rotation.y=0;});return copy;},canopyCovered:()=>canopyCovered,state:()=>({canopy:canopyCovered,doors:entries().map(d=>({id:d.id,key:d.key,type:d.type,openable:d.openable!==false,open:d.open,covered:d.covered}))}),entries};
})();
window.Cabinets38=Cabinets38;
