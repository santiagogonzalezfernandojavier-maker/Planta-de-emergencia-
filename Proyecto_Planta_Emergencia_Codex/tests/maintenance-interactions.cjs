// Exercise holds through frame(), including the camera handoff used in the real application.
const assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
(async()=>{
 const root=path.resolve(__dirname,'..'),port=Number(process.env.TEST_PORT||4194);
 const server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,env:{...process.env,PORT:String(port)},stdio:'ignore'});let browser,page;
 try{
  let ready=false;for(let i=0;i<100;i++){try{ready=(await fetch('http://127.0.0.1:'+port)).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,80));}assert.ok(ready);
  browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
  page=await browser.newPage({viewport:{width:1500,height:950}});const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('Page error:',e.message);});
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);await page.goto('http://127.0.0.1:'+port);
  await page.waitForFunction(()=>document.documentElement.classList.contains('ready32'),{},{polling:100,timeout:180000});
  await page.evaluate(()=>{
   GameInterface.closeMenu();Maintenance.begin('guided');
   Walk31.restoreInspection({zone:'plant',floor:-.07,position:[.15,1.58,3.8],yaw:0,pitch:0,crouch:false,inspection:false});
   Walk31.bag(true);if(!Maintenance.takeKit())throw Error('Equipment setup failed');Maintenance.suspend33();
   const act=(tool,id)=>{Maintenance.select(tool);if(!Maintenance.act(id))throw Error('Setup action failed: '+id);};
   act('plan','control');Maintenance.next();act('hand','control');act('lock','control');Maintenance.next();act('hand','isolate');Maintenance.next();Maintenance.resume33();
   // Keep the production frame/camera/update ordering. Only rasterization is replaced;
   // scene and camera matrices still update exactly as a renderer requires.
   const render=renderer.render.bind(renderer);renderer.render=()=>{scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);};
   let time=performance.now();window.advance46=seconds=>{for(let i=0;i<Math.ceil(seconds/.04);i++){time+=40;frame(time);}};
   window.capture46=()=>{render(scene,camera);};
   window.aim46=(point,position=Walk31.state().position)=>{const d=new T.Vector3(...point).sub(new T.Vector3(...position));Walk31.restoreInspection({zone:'plant',floor:-.07,position,yaw:Math.atan2(-d.x,-d.z),pitch:Math.atan2(d.y,Math.hypot(d.x,d.z)),crouch:false,inspection:false});};
   window.rod46=()=>{const g=scene.getObjectByName('Varilla sostenida en primera persona'),oil=g.getObjectByName('Aceite en el extremo de lectura'),cloth=scene.getObjectByName('Herramienta del jugador');g.updateWorldMatrix(true,true);return {visible:g.visible,handle:g.getWorldPosition(new T.Vector3()).toArray(),tip:g.localToWorld(new T.Vector3(0,-.23,0)).toArray(),cloth:cloth.getWorldPosition(new T.Vector3()).toArray(),oil:oil.visible,opacity:oil.material.opacity,worldLift:scene.getObjectByName('Varilla de aceite en el motor').position.y};};
   aim46([-.82,1.08,.93],[-.82,1.58,1.60]);advance46(.08);
  });
  async function press(seconds=.4){await page.keyboard.down('KeyE');await page.evaluate(s=>advance46(s),seconds);await page.keyboard.up('KeyE');}
  assert.equal(await page.evaluate(()=>Maintenance.state().index),3);console.log('Flow: dipstick hold and lower-end wiping');
  await press();await page.evaluate(()=>advance46(.5));assert.equal(await page.evaluate(()=>Maintenance.state().step),1);
  const extracted=await page.evaluate(()=>rod46());assert.equal(extracted.visible,true);assert.ok(extracted.worldLift>.3);
  await page.keyboard.press('KeyE');await page.evaluate(()=>advance46(.40));
  const wiping=await page.evaluate(()=>rod46());assert.equal(await page.evaluate(()=>Maintenance.state().step),1,'Wipe completed before the cloth animation');
  const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));assert.ok(distance(wiping.handle,extracted.handle)<.005,'Dipstick dropped while wiping');assert.ok(distance(wiping.cloth,wiping.tip)<.10,'Cloth misses the measuring end');assert.ok(distance(wiping.cloth,wiping.tip)<distance(wiping.cloth,wiping.handle));
  await page.evaluate(()=>capture46());await page.screenshot({path:path.join(os.tmpdir(),'d46-varilla-limpieza.png')});
  await page.evaluate(()=>Walk31.pause(true));await page.evaluate(()=>advance46(1));assert.equal(await page.evaluate(()=>Maintenance.state().step),1,'Pause completed a pending wipe');
  await page.evaluate(()=>{Walk31.pause(false);advance46(.04);});await page.keyboard.press('KeyE');await page.evaluate(()=>advance46(1.2));
  assert.equal(await page.evaluate(()=>Maintenance.state().step),2);const cleaned=await page.evaluate(()=>rod46());assert.equal(cleaned.visible,true);assert.equal(cleaned.oil,false);assert.ok(distance(cleaned.handle,extracted.handle)<.005);assert.equal(cleaned.worldLift,extracted.worldLift);
  await page.evaluate(()=>{Maintenance.suspend33();Walk31.enterZone('yard');advance46(.08);});assert.equal(await page.evaluate(()=>rod46().visible),false,'Suspended practice leaked its dipstick into the substation');await page.evaluate(()=>{Maintenance.resume33();advance46(.08);});assert.equal(await page.evaluate(()=>Maintenance.state().step),2);assert.equal(await page.evaluate(()=>rod46().visible),true);
  await page.evaluate(()=>aim46([-.82,1.08,.93]));await press(.8);assert.equal(await page.evaluate(()=>Maintenance.state().step),3);assert.equal(await page.evaluate(()=>rod46().visible),false);assert.equal(await page.evaluate(()=>rod46().worldLift),0);
  await page.evaluate(()=>aim46([-.82,1.08,.93]));await press(.5);assert.equal(await page.evaluate(()=>Maintenance.state().step),4);assert.equal(await page.evaluate(()=>rod46().oil),true);
  await page.keyboard.press('KeyE');assert.equal(await page.evaluate(()=>Maintenance.state().done),true);await page.keyboard.press('KeyE');assert.equal(await page.evaluate(()=>Maintenance.state().index),4);
  console.log('Flow: radiator hold through the production frame');const point=i=>[-2.48,.62+Math.floor(i/2)*.18,i%2?.48:-.48];
  await page.evaluate(p=>aim46(p,[-3.1,1.58,0]),point(6));
  await page.keyboard.down('KeyE');await page.evaluate(()=>advance46(.20));assert.ok(await page.evaluate(()=>Maintenance.rigState().contact)>.15);assert.ok((await page.evaluate(()=>Maintenance.state().needed)).includes('dust6'));
  await page.evaluate(()=>capture46());await page.screenshot({path:path.join(os.tmpdir(),'d46-radiador-progreso.png')});
  await page.keyboard.up('KeyE');await page.evaluate(()=>advance46(.16));assert.equal(await page.evaluate(()=>Maintenance.rigState().contact),0);
  await press(.7);assert.ok(!(await page.evaluate(()=>Maintenance.state().needed)).includes('dust6'),'Real frame hold did not inspect the sector');
  // A hold on the visible label must work even when the crosshair is elsewhere.
  await page.evaluate(p=>aim46(p),point(7));await page.waitForTimeout(100);await page.evaluate(()=>advance46(.04));
  const label=page.locator('#wDots [data-id=dust7] em');assert.equal(await label.isVisible(),true);const box=await label.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.evaluate(()=>advance46(.7));await page.mouse.up();assert.ok(!(await page.evaluate(()=>Maintenance.state().needed)).includes('dust7'),'Holding the marker label did not inspect');
  for(let i=0;i<6;i++){await page.evaluate(p=>aim46(p),point(i));await press(.7);}
  assert.equal(await page.evaluate(()=>Maintenance.state().step),1);assert.equal(await page.evaluate(()=>Maintenance.state().tool),'brush');
  for(let i=0;i<8;i++){await page.evaluate(p=>aim46(p),point(i));await press(.9);}
  assert.equal(await page.evaluate(()=>Maintenance.state().done),true);assert.equal(await page.evaluate(()=>Maintenance.state().records.length),5);
  assert.deepEqual(errors,[]);console.log(JSON.stringify({productionFrame:true,heldKeyboard:true,markerLabelHold:true,allRadiatorSectors:true,heldDipstick:true,clothTouchesMeasuringEnd:true,noDipstickDrop:true,cancelWipeOnPause:true,viewChangePreservesDipstick:true,readAndReinsert:true,pageErrors:errors}));
 }catch(e){if(page){console.error(await page.evaluate(()=>({walk:Walk31.state(),maintenance:Maintenance.state(),rig:Maintenance.rigState()})).catch(()=>null));await page.screenshot({path:path.join(os.tmpdir(),'d46-maintenance-failure.png')}).catch(()=>{});}throw e;}finally{await browser?.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
