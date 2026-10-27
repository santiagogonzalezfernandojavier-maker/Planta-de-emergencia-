// Check the public UI and composed production frame, including camera/session restoration.
const assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
(async()=>{
 const root=path.resolve(__dirname,'..'),port=Number(process.env.TEST_PORT||4196);
 const server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,env:{...process.env,PORT:String(port)},stdio:'ignore'});let browser,page;
 try{
  let ready=false;for(let i=0;i<100;i++){try{ready=(await fetch('http://127.0.0.1:'+port)).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,100));}assert.ok(ready);
  browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
  page=await browser.newPage({viewport:{width:1500,height:950}});page.setDefaultTimeout(30000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);await page.goto('http://127.0.0.1:'+port,{timeout:180000});
  await page.waitForFunction(()=>document.documentElement.classList.contains('ready32'),{},{polling:100,timeout:180000});
  await page.evaluate(()=>{const render=renderer.render.bind(renderer);renderer.render=()=>{scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);};let time=performance.now();window.advance48=seconds=>{for(let i=0;i<Math.ceil(seconds/.04);i++){time+=40;frame(time);}};window.capture48=()=>render(scene,camera);});
  assert.equal(await page.locator('.entry-card48').count(),6);assert.equal(await page.evaluate(()=>Walk31.state().active||Maintenance.state().active),false);
  const cards=await page.locator('.entry-card48').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));
  assert.ok(cards.every(c=>c.width>300));assert.ok(Math.abs(cards[0].y-cards[1].y)<2);assert.ok(Math.abs(cards[2].y-cards[3].y)<2,'The exploration card breaks the mode grid');
  await page.screenshot({path:path.join(os.tmpdir(),'d48-menu-validado.png')});
  await page.locator('#menuHelp48').click();assert.equal(await page.locator('#gameHelp').isVisible(),true);await page.keyboard.press('Escape');
  await page.locator('#menuPlates48').click();await page.evaluate(()=>advance48(1));
  assert.equal(await page.evaluate(()=>EquipmentInspector48.state().active),true);assert.equal(await page.locator('#plateSelect48 option').count(),20);
  await page.locator('#plateSelect48').selectOption('AP-TP');await page.evaluate(()=>advance48(1));
  assert.match(await page.locator('#plateData48').innerText(),/NEXORA/);assert.match(await page.locator('#plateData48').innerText(),/MCOV.*\n.*Por definir/);assert.equal(await page.evaluate(()=>document.getElementById('flows').checked),false);
  const fit=()=>page.evaluate(()=>{const e=EquipmentInspector48.plates().find(e=>e.id===EquipmentInspector48.state().selected),r=renderer.domElement.getBoundingClientRect(),panel=document.getElementById('equipmentInspector48').getBoundingClientRect(),points=[[-1,-1],[-1,1],[1,1],[1,-1]].map(([x,y])=>{const p=e.group.localToWorld(new T.Vector3(x*e.w/2,y*e.h/2,.007)).project(camera);return{x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};});return{points,panel:panel.toJSON(),canvas:r.toJSON()};});
  function assertFit(v,mobile=false){for(const p of v.points){assert.ok(Number.isFinite(p.x+p.y));assert.ok(p.x>v.canvas.left&&p.x<v.canvas.right);assert.ok(p.y>v.canvas.top&&p.y<v.canvas.bottom);assert.ok(mobile?p.y<v.panel.top:p.x<v.panel.left,'Plate falls behind the information panel');}}
  assertFit(await fit());
  const distanceBefore=await page.evaluate(()=>camera.position.distanceTo(EquipmentInspector48.plates().find(e=>e.id==='AP-TP').group.getWorldPosition(new T.Vector3())));
  await page.locator('#plateZoomIn48').click();await page.evaluate(()=>advance48(.1));assert.ok(await page.evaluate(()=>camera.position.distanceTo(EquipmentInspector48.plates().find(e=>e.id==='AP-TP').group.getWorldPosition(new T.Vector3())))<distanceBefore);
  await page.locator('#plateFit48').click();
  const plates=await page.evaluate(()=>{const info=EquipmentInspector48.plates().map(e=>({id:e.id,w:e.face.material.map.image.width,h:e.face.material.map.image.height}));const labels=[...EquipmentLabels48.faces].filter(o=>o.userData.labelText.startsWith('AP-TP ·'));return{info,labels:labels.map(o=>({width:o.geometry.parameters.width,height:o.geometry.parameters.height,iw:o.material.map.image.width,ih:o.material.map.image.height,y:o.getWorldPosition(new T.Vector3()).y}))};});
  assert.equal(plates.info.length,20);assert.ok(plates.info.every(e=>e.w===1024&&e.h===640));assert.ok(plates.labels.length);for(const l of plates.labels){assert.ok(Math.abs(l.iw/l.ih-l.width/l.height)<.3);assert.ok(l.y>7.4&&l.y<7.6);}
  for(const id of plates.info.map(e=>e.id)){await page.locator('#plateSelect48').selectOption(id);await page.evaluate(()=>advance48(.8));assertFit(await fit());}
  console.log('Plates: 20 fitted views, zoom, fictional brand and unknown engineering ratings');
  for(const [id,role]of [['QG','Resorte de acumulación de energía'],['PR-01','Relés auxiliares de disparo y cierre']]){
   await page.locator('#plateSelect48').selectOption(id);const before=await page.evaluate(id=>{const d=Cabinets38.entries().find(e=>e.id===(id==='QG'?'SE-QG':id));return{open:d.open,angle:d.angle,covered:d.covered};},id);
   await page.locator('#plateInterior48').click();await page.evaluate(()=>advance48(1));
   const interior=await page.evaluate(({id,role})=>{const d=Cabinets38.entries().find(e=>e.id===(id==='QG'?'SE-QG':id)),part=d.assembly48.fixed.children.find(o=>o.userData.cabinetRole48===role),surface=part.children.find(o=>o.isMesh&&o.geometry.type!=='TubeGeometry'&&o.geometry.type!=='PlaneGeometry'),target=new T.Box3().setFromObject(surface).getCenter(new T.Vector3()),normal=new T.Vector3(0,0,1).transformDirection(d.owner.matrixWorld),ray=new T.Raycaster(target.clone().addScaledVector(normal,2),normal.clone().negate());const hit=ray.intersectObject(d.owner,true).find(h=>{if(h.object.material.transparent)return false;for(let o=h.object;o;o=o.parent)if(!o.visible)return false;return true;});let ancestor=hit?.object;while(ancestor&&ancestor!==part)ancestor=ancestor.parent;const old=[];d.owner.traverse(o=>{if(o.userData.replacedSolid48)old.push(o.visible);});return{visibleComponent:ancestor===part,firstHit:hit?.object.name,old,open:d.open,role:part.userData.cabinetRole48,light:CCM34.inspectionLight.visible};},{id,role});
   assert.equal(interior.open,true);assert.equal(interior.visibleComponent,true,JSON.stringify(interior));assert.ok(interior.old.length>0);assert.ok(interior.old.every(v=>v===false));assert.equal(interior.light,true);
   await page.evaluate(()=>capture48());await page.screenshot({path:path.join(os.tmpdir(),'d48-interior-'+id+'-validado.png')});
   await page.locator('#plateClose48').click();assert.deepEqual(await page.evaluate(id=>{const d=Cabinets38.entries().find(e=>e.id===(id==='QG'?'SE-QG':id));return{open:d.open,angle:d.angle,covered:d.covered};},id),before);
   await page.evaluate(()=>EquipmentInspector48.open('AP-01'));await page.evaluate(()=>advance48(.8));
  }
  await page.locator('#plateClose48').click();await page.evaluate(()=>ProtectionPanel44.show('ap','AP-TP'));await page.locator('#protectionPlate48').click();assert.equal(await page.evaluate(()=>EquipmentInspector48.state().selected),'AP-TP');
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{advance48(1);});assertFit(await fit(),true);await page.evaluate(()=>capture48());await page.screenshot({path:path.join(os.tmpdir(),'d48-placa-movil-validada.png')});
  await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>EquipmentInspector48.state().active),false);await page.setViewportSize({width:1500,height:950});
  // Explicit exploration and returning from the menu preserve the player's pose.
  await page.evaluate(()=>GameInterface.openMenu());await page.locator('#gameEnter').click();assert.equal(await page.evaluate(()=>Walk31.state().active),true);assert.equal(await page.locator('#missionCard').isVisible(),false);
  const walk=await page.evaluate(()=>{Walk31.restoreInspection({...Walk31.state(),position:[-3.4,1.58,3.2],yaw:.3,pitch:-.12,crouch:false});advance48(.08);return Walk31.state();});
  await page.keyboard.press('Escape');await page.locator('#walkHome48').click();assert.equal(await page.locator('#gameLaunch').isVisible(),true);await page.locator('#gameContinue').click();assert.deepEqual(await page.evaluate(()=>Walk31.state().position),walk.position);assert.equal(await page.evaluate(()=>Walk31.state().yaw),walk.yaw);
  await page.evaluate(()=>{GameInterface.openMenu();});await page.locator('#gameMaintenance').click();await page.locator('#wBeginG').click();await page.evaluate(()=>advance48(.1));
  assert.equal(await page.locator('#missionAim48').isVisible(),true);assert.equal(await page.locator('#missionUse48').isVisible(),true);
  const beforeAim=await page.evaluate(()=>Walk31.state());await page.locator('#missionAim48').click();const afterAim=await page.evaluate(()=>Walk31.state());assert.deepEqual(afterAim.position,beforeAim.position);assert.notEqual(afterAim.yaw,beforeAim.yaw);
  await page.evaluate(()=>{Walk31.bag(true);Maintenance.takeKit();Walk31.bag(false);Maintenance.select('light');Walk31.restoreInspection({...Walk31.state(),position:[-.9,1.58,2.4],yaw:.18,pitch:-.08,crouch:false});advance48(.1);});
  const practice=await page.evaluate(()=>({walk:Walk31.state(),maintenance:Maintenance.state(),lamp:Walk31.lampState().on,flows:document.getElementById('flows').checked}));
  await page.evaluate(()=>{EquipmentInspector48.open('G-01');advance48(.8);});await page.locator('#plateClose48').click();await page.evaluate(()=>advance48(.08));
  assert.deepEqual(await page.evaluate(()=>Walk31.state().position),practice.walk.position);assert.equal(await page.evaluate(()=>Walk31.state().yaw),practice.walk.yaw);assert.equal(await page.evaluate(()=>Maintenance.state().index),practice.maintenance.index);assert.equal(await page.evaluate(()=>Maintenance.state().tool),practice.maintenance.tool);assert.deepEqual(await page.evaluate(()=>Maintenance.state().records),practice.maintenance.records);assert.equal(await page.evaluate(()=>Walk31.lampState().on),practice.lamp);assert.equal(await page.evaluate(()=>document.getElementById('flows').checked),practice.flows);
  const personnel=await page.evaluate(()=>Personnel.group.children.map(g=>({height:new T.Box3().setFromObject(g).getSize(new T.Vector3()).y,gloves:g.children.some(o=>o.material?.vertexColors&&o.material?.name.startsWith('Herraje')),details:g.children.length})));assert.equal(personnel.length,4);assert.ok(personnel.every(p=>p.height>1.5&&p.height<2&&p.details>50));
  await page.evaluate(()=>{Maintenance.close();build();scene.updateMatrixWorld(true);});
  const remounted=await page.evaluate(()=>EquipmentInspector48.plates().map(e=>{let attached=false;for(let o=e.group;o;o=o.parent)if(o===scene)attached=true;return{id:e.id,attached};}));assert.equal(remounted.length,20);assert.equal(new Set(remounted.map(e=>e.id)).size,20);assert.ok(remounted.every(e=>e.attached));
  const refreshed=await page.evaluate(()=>{const value=cfg.rating;cfg.rating=80;EquipmentInspector48.refresh();const result=EquipmentInspector48.data('G-01').fields.find(f=>f.name==='Potencia activa').value;cfg.rating=value;EquipmentInspector48.refresh();return result;});assert.equal(refreshed,'80 kW');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({sixIndependentModes:true,clearMainAction:true,aimWithoutTeleport:true,plateViews:20,cabinetComponentsVisible:true,doorStateRestored:true,mobilePlateFit:true,menuResume:true,practiceRestored:true,rebuildRemountsPlates:true,configurationRefresh:true,operators:personnel.length,pageErrors:errors}));
 }catch(e){if(page){await page.screenshot({path:path.join(os.tmpdir(),'d48-experience-failure.png')}).catch(()=>{});}throw e;}finally{await browser?.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
