/* Regression of the migrated HTTP application. Requires npm install and a Playwright browser. */
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('node:child_process');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
(async () => {
  execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: root });
  const port = Number(process.env.TEST_PORT || 4175);
  const server = spawn(process.execPath, ['scripts/serve.mjs'], {
    cwd: root, env: { ...process.env, PORT: String(port) }, stdio: 'ignore'
  });
  let browser;
  try {
    let available = false;
    for (let i=0; i<100; i++) {
      try { available = (await fetch(`http://127.0.0.1:${port}`)).ok; } catch {}
      if (available) break;
      await new Promise(resolve => setTimeout(resolve,100));
    }
    assert.ok(available, 'Local server did not start');
    browser = await chromium.launch({
      headless: true,
      ...(process.env.CHROMIUM_PATH ? { executablePath:process.env.CHROMIUM_PATH } : {}),
      ...(process.env.CHROMIUM_ARGS_JSON ? { args:JSON.parse(process.env.CHROMIUM_ARGS_JSON) } : {})
    });
    const page = await browser.newPage({ viewport:{width:1400,height:900} });
    page.setDefaultTimeout(30000);
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
    await page.goto(`http://127.0.0.1:${port}`,{timeout:180000});
    await page.waitForFunction(()=>document.documentElement.classList.contains('ready32'), {}, {polling:100});
    assert.equal(await page.locator('#gameLaunch').isVisible(),true);
    await page.locator('#gameMaintenance').click();await page.locator('#wBeginG').click();
    await page.evaluate(()=>frame(performance.now()+1000));
    assert.equal(await page.evaluate(()=>Personnel.count()),4);
    const standing=await page.evaluate(()=>Walk31.state().position[1]);
    await page.keyboard.press('KeyC');
    assert.ok((await page.evaluate(()=>Walk31.state().position[1]))<standing-.3);
    await page.keyboard.press('KeyC');
    const yaw=await page.evaluate(()=>Walk31.state().yaw);
    await page.mouse.move(800,400);await page.mouse.down();
    await page.mouse.move(1000,420,{steps:12});await page.mouse.up();
    assert.ok(Math.abs((await page.evaluate(()=>Walk31.state().yaw))-yaw)>.4);
    const pace=await page.evaluate(()=>{Walk31.enterZone('plant');const before=Walk31.state().position;return before;});
    await page.keyboard.down('KeyW');await page.evaluate(()=>Walk31.frame(.08));await page.keyboard.up('KeyW');
    const walking=await page.evaluate(()=>Walk31.state().position);
    await page.evaluate(()=>Walk31.enterZone('plant'));
    await page.keyboard.down('ShiftLeft');await page.keyboard.down('KeyW');await page.evaluate(()=>Walk31.frame(.08));await page.keyboard.up('KeyW');await page.keyboard.up('ShiftLeft');
    const fast=await page.evaluate(()=>Walk31.state().position);
    assert.ok(Math.hypot(fast[0]-pace[0],fast[2]-pace[2])>Math.hypot(walking[0]-pace[0],walking[2]-pace[2])*1.5);
    // Actual mouse capture: moving without a held button must rotate the view.
    await page.locator('#fpLook').click();
    await page.waitForFunction(()=>document.pointerLockElement===renderer.domElement);
    const lockedYaw=await page.evaluate(()=>Walk31.state().yaw);
    await page.mouse.move(1100,450,{steps:6});
    assert.ok(Math.abs((await page.evaluate(()=>Walk31.state().yaw))-lockedYaw)>.01);
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>Walk31.state().paused);
    const pausedPosition=await page.evaluate(()=>Walk31.state().position);
    await page.keyboard.down('KeyW');
    await page.evaluate(()=>Walk31.frame(.08));
    await page.keyboard.up('KeyW');
    assert.deepEqual(await page.evaluate(()=>Walk31.state().position),pausedPosition);
    await page.locator('#walkFreeCursor').click();
    await page.keyboard.press('KeyQ');
    assert.ok(await page.locator('#work26 .w-side').isVisible());
    await page.keyboard.press('KeyQ');
    assert.equal(await page.locator('#work26 .w-side').isVisible(),false);
    // Anatomical eyes replace the duplicate legacy pairs in all four people.
    assert.ok(await page.evaluate(()=>Personnel.group.children.every(g=>g.children.filter(o=>o.material?.name.startsWith('Esclerótica')).length===2)));
    assert.equal(await page.evaluate(()=>CCM34.toggle(0)),false);
    assert.equal(await page.locator('#cabinetKeysButton').count(),0);
    assert.equal(await page.locator('[data-key38]').count(),0);
    await page.locator('#nav33toggle').click();
    await page.locator('[data-zone33=yard]').click();
    assert.equal(await page.evaluate(()=>Walk31.state().zone),'yard');
    await page.locator('#nav33toggle').click();await page.locator('[data-zone33=ccm]').click();
    await page.evaluate(()=>frame(performance.now()+2000));
    assert.equal(await page.evaluate(()=>CCM34.state().length),26);
    await page.keyboard.down('KeyW');
    await page.evaluate(()=>{for(let i=0;i<7;i++)Walk31.frame(.08)});
    await page.keyboard.up('KeyW');await page.keyboard.press('KeyE');
    await page.evaluate(()=>{for(let i=0;i<35;i++)CCM34.frame(.033)});
    assert.ok((await page.evaluate(()=>CCM34.state())).some(d=>d.open));
    const coverCheck=await page.evaluate(()=>{const id=CCM34.state().findIndex(d=>d.open);if(!CCM34.toggleCover(id))throw Error('Inner cover did not detach');if(CCM34.toggle(id))throw Error('Door closed over missing cover');if(!CCM34.toggleCover(id))throw Error('Inner cover did not return');return{types:new Set(CCM34.state().map(d=>d.type)).size,restored:CCM34.state()[id].covered};});
    assert.ok(coverCheck.types>=8);assert.equal(coverCheck.restored,true);
    await page.locator('#closeCCM34').click();
    assert.ok((await page.evaluate(()=>CCM34.state())).every(d=>!d.open));
    await page.locator('#nav33toggle').click();await page.locator('[data-zone33=practice]').click();
    assert.equal(await page.evaluate(()=>Walk31.state().zone),'plant');
    assert.equal(await page.evaluate(()=>Protection33.masts),4);
    assert.equal(await page.evaluate(()=>Protection33.apartarrayos),9);
    assert.deepEqual(errors,[]);
    // Climb the actual staircase and return using movement, without zone-menu teleportation.
    const stairRoundTrip=await page.evaluate(()=>{
      Walk31.enterZone('plant');const before=Maintenance.state();
      const canvas=renderer.domElement,key=(code,type)=>canvas.dispatchEvent(new KeyboardEvent(type,{code,key:code.startsWith('Key')?code.slice(3).toLowerCase():code,bubbles:true,cancelable:true}));
      function moveTo(x,z){let tries=0;while(Math.hypot(Walk31.state().position[0]-x,Walk31.state().position[2]-z)>.025){if(++tries>1500)throw Error('Walking blocked '+JSON.stringify(Walk31.state())+' toward '+x+','+z);const p=Walk31.state().position,desired=Math.atan2(-(x-p[0]),-(z-p[2])),difference=Math.atan2(Math.sin(desired-Walk31.state().yaw),Math.cos(desired-Walk31.state().yaw));if(Math.abs(difference)>.002){const code=difference>0?'ArrowLeft':'ArrowRight';key(code,'keydown');for(let remaining=Math.abs(difference);remaining>1e-6;){const dt=Math.min(.08,remaining/1.6);Walk31.frame(dt);remaining-=dt*1.6;}key(code,'keyup');}const distance=Math.hypot(x-p[0],z-p[2]);key('KeyW','keydown');Walk31.frame(Math.min(.04,distance/1.65));key('KeyW','keyup');}}
      moveTo(1.8,5.6);moveTo(-5.65,5.6);moveTo(-5.65,0);const mid=Walk31.state();
      if(mid.zone!=='stairs'||mid.floor<2||mid.floor>5)throw Error('Stair height did not follow treads');
      if(Walk31.canStand(-4.8,mid.position[2]))throw Error('Side rail was passable');
      moveTo(-5.65,-5.75);moveTo(-5.65,-6.7);moveTo(14,-6.7);moveTo(14,5.4);const yard=Walk31.state();
      if(yard.zone!=='yard'||Math.abs(yard.floor-6.65)>.01)throw Error('Did not reach substation');
      moveTo(14,-6.7);moveTo(-5.65,-6.7);moveTo(-5.65,5.6);moveTo(1.8,5.6);moveTo(1.8,4.1);const end=Walk31.state(),after=Maintenance.state();
      if(end.zone!=='plant'||Math.abs(end.floor+.07)>.01)throw Error('Did not return to basement');
      if(before.index!==after.index||before.records.length!==after.records.length)throw Error('Stair travel reset maintenance');
      return{up:true,down:true,progressPreserved:true};
    });
    assert.deepEqual(stairRoundTrip,{up:true,down:true,progressPreserved:true});
    // Walk the twelve actual work orders through the shipped interaction API.
    await page.evaluate(()=>{Walk31.enterZone('plant');});
    assert.ok(await page.locator('#missionCard').isVisible());
    assert.equal(await page.evaluate(()=>Maintenance.state().workOrder.ready),true);
    assert.equal(await page.locator('#wPrepareOrder').count(),0);
    console.log('Flow: equipment and automatic progression');
    // Pick up the complete equipment once, perform a real E action, then let the next activity start itself.
    await page.evaluate(()=>{const c=renderer.domElement;c.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW',key:'w',bubbles:true}));for(let i=0;i<8;i++)Walk31.frame(.08);c.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyW',key:'w',bubbles:true}));if(!Walk31.bag(true))throw Error('Initial bag route failed');});
    await page.evaluate(()=>{CCM34.frame(0);Walk31.frame(0);renderer.render(scene,camera);});
    await page.screenshot({path:path.join(require('node:os').tmpdir(),'d40-equipo.png')});
    await page.locator('#takeKit40').click();
    await page.evaluate(()=>{if(document.pointerLockElement)document.exitPointerLock();});await page.waitForTimeout(100);await page.evaluate(()=>Walk31.pause(false));
    assert.equal(await page.evaluate(()=>Maintenance.state().kit),true);
    await page.evaluate(()=>{const c=renderer.domElement;c.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW',key:'w',bubbles:true}));for(let i=0;i<3;i++)Walk31.frame(.08);c.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyW',key:'w',bubbles:true}));const entry=Cabinets38.entries().find(d=>d.id==='G01-CONTROL');let target;entry.leaf.traverse(o=>{if(o.userData.workTarget==='control')target=o;});camera.lookAt(target.getWorldPosition(new T.Vector3()));camera.updateMatrixWorld(true);});
    await page.keyboard.press('KeyE');
    assert.equal(await page.evaluate(()=>Maintenance.state().done),false);
    await page.evaluate(()=>{for(let i=0;i<6;i++)Walk31.frame(.08)});
    assert.equal(await page.evaluate(()=>Maintenance.state().done),true);
    await page.waitForTimeout(4100);await page.evaluate(()=>Walk31.frame(0));
    assert.equal(await page.evaluate(()=>Maintenance.state().index),1);
    assert.equal(await page.evaluate(()=>Walk31.state().journal),false);
    assert.equal(await page.evaluate(()=>Maintenance.state().tool),'hand');
    await page.evaluate(()=>{CCM34.frame(0);renderer.render(scene,camera);});await page.screenshot({path:path.join(require('node:os').tmpdir(),'d40-guiado.png')});
    console.log('Flow: assessment checks');
    await page.evaluate(()=>{Maintenance.close();Maintenance.open();Maintenance.begin('eval');});
    await page.keyboard.press('KeyQ');
    await page.locator('[name=orderCheck]').first().check();
    await page.keyboard.press('KeyQ');assert.equal(await page.locator('#work26 .w-side').isVisible(),false);
    await page.keyboard.press('KeyQ');
    await page.locator('#wPrepareOrder').click();
    assert.match(await page.locator('#orderMessage').innerText(),/Confirma/);
    await page.evaluate(()=>{document.querySelectorAll('[name=orderCheck]').forEach(el=>el.click());});
    await page.locator('[name=orderDecision][value="1"]').check();
    await page.locator('#wPrepareOrder').click();
    assert.match(await page.locator('#orderMessage').innerText(),/opción/);
    await page.locator('[name=orderDecision][value="0"]').check();
    await page.locator('#wPrepareOrder').click();
    assert.equal(await page.evaluate(()=>Maintenance.state().workOrder.ready),true);
    assert.match(await page.locator('.job-next').innerText(),/pantalla.*pulsa E/);
    assert.ok(await page.locator('#wResumeJob').isVisible());
    await page.keyboard.press('KeyQ');
    await page.evaluate(()=>{Maintenance.close();Maintenance.open();Maintenance.begin('guided');});
    console.log('Flow: complete twelve activities');
    await page.exposeFunction('capture41',name=>page.screenshot({path:path.join(require('node:os').tmpdir(),name+'.png')}));
    await page.exposeFunction('holdMouse41',async(x,y)=>{await page.mouse.move(x,y);await page.mouse.down();});
    await page.exposeFunction('releaseMouse41',()=>page.mouse.up());
    const results=await page.evaluate(async()=>{

      const canvas=renderer.domElement;
      const key=(code,type)=>canvas.dispatchEvent(new KeyboardEvent(type,{code,key:code.startsWith('Key')?code.slice(3).toLowerCase():code,bubbles:true,cancelable:true}));
      function turn(yaw){let difference=Math.atan2(Math.sin(yaw-Walk31.state().yaw),Math.cos(yaw-Walk31.state().yaw));const code=difference>0?'ArrowLeft':'ArrowRight';key(code,'keydown');for(let remaining=Math.abs(difference);remaining>1e-6;){const dt=Math.min(.08,remaining/1.6);Walk31.frame(dt);remaining-=dt*1.6;}key(code,'keyup');}
      function travel(x,z,tolerance=1.15){
        const start=Walk31.state().position,spacing=.24,queue=[[0,0]],seen=new Map([['0,0',null]]);let end=null;
        for(let head=0;head<queue.length&&head<12000;head++){
          const cell=queue[head],px=start[0]+cell[0]*spacing,pz=start[2]+cell[1]*spacing;
          if(Math.hypot(px-x,pz-z)<tolerance){end=cell;break;}
          for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const next=[cell[0]+dx,cell[1]+dz],id=next.join(',');if(!seen.has(id)&&Walk31.canStand(start[0]+next[0]*spacing,start[2]+next[1]*spacing)){seen.set(id,cell);queue.push(next);}}
        }
        if(!end)throw Error('No route to '+x+','+z);
        const route=[];for(let cell=end;cell;cell=seen.get(cell.join(',')))route.unshift(cell);
        for(const cell of route.slice(1)){const p=Walk31.state().position,dx=start[0]+cell[0]*spacing-p[0],dz=start[2]+cell[1]*spacing-p[2];turn(Math.atan2(-dx,-dz));key('KeyW','keydown');for(let remaining=Math.hypot(dx,dz);remaining>1e-5;){const dt=Math.min(.08,remaining/1.65);Walk31.frame(dt);remaining-=dt*1.65;}key('KeyW','keyup');}
      }
      function aim(point){const p=Walk31.state().position,d=new T.Vector3(...point).sub(new T.Vector3(...p));turn(Math.atan2(-d.x,-d.z));const pitch=Math.atan2(d.y,Math.hypot(d.x,d.z)),delta=pitch-Walk31.state().pitch,code=delta>0?'ArrowUp':'ArrowDown';key(code,'keydown');for(let left=Math.abs(delta);left>1e-6;){const dt=Math.min(.08,left);Walk31.frame(dt);left-=dt;}key(code,'keyup');Walk31.frame(0);}
      function take(tool){if(!Maintenance.state().kit){travel(.15,3.05);if(!Walk31.bag(true)||!Maintenance.takeKit())throw Error('Equipment pickup failed');}Maintenance.select(tool);}
      function act(id,x,z,amount=0){travel(x,z);if(!Maintenance.act(id,amount))throw Error('Action rejected: '+id+' order '+Maintenance.state().index);}
      function prepare(){if(Maintenance.state().mode==='guided'){if(!Maintenance.state().workOrder.ready)throw Error('Guided activity was gated');return;}throw Error('Unexpected assessment mode');}
      function advance(){if(!Maintenance.state().done)throw Error('Order not complete '+Maintenance.state().index);const before=Maintenance.state().index;key('KeyE','keydown');key('KeyE','keyup');if(Maintenance.state().index!==before+1)throw Error('E did not continue without journal');prepare();}
      // The controller keeps its controls and progress when its real door moves.
      travel(2.47,1.7);if(!Cabinets38.toggle('G01-CONTROL'))throw Error('G01 key did not open controller');for(let i=0;i<40;i++)CCM34.frame(.033);
      const controller=Cabinets38.entries().find(d=>d.id==='G01-CONTROL');updateView();if(controller.coverHit.material.opacity!==0)throw Error('Invisible interaction proxy became opaque');camera.lookAt(controller.coverHit.getWorldPosition(new T.Vector3()));camera.updateMatrixWorld(true);
      if(!Cabinets38.cover())throw Error('Controller inner cover did not detach');if(Cabinets38.toggle('G01-CONTROL'))throw Error('Controller closed over removed cover');if(!Cabinets38.cover())throw Error('Controller cover did not return');if(!Cabinets38.toggle('G01-CONTROL'))throw Error('Controller did not close');for(let i=0;i<40;i++)CCM34.frame(.033);
      travel(3.65,1.7);const transfer=Cabinets38.entries().find(d=>d.id==='G01-TRANSFER');if(!Cabinets38.toggle('G01-TRANSFER'))throw Error('Transfer cabinet did not open');for(let i=0;i<40;i++)CCM34.frame(.033);camera.lookAt(transfer.coverHit.getWorldPosition(new T.Vector3()));camera.updateMatrixWorld(true);if(!Cabinets38.cover()||!Cabinets38.cover()||!Cabinets38.toggle('G01-TRANSFER'))throw Error('Transfer cover failed');for(let i=0;i<40;i++)CCM34.frame(.033);
      travel(1.05,3.4);if(!Cabinets38.toggleCanopy()||!Cabinets38.canopyCovered())throw Error('Generator cover did not install');if(!Cabinets38.toggleCanopy()||Cabinets38.canopyCovered())throw Error('Generator cover did not remove');
      take('plan');act('control',2.47,1.17);advance();
      take('hand');act('control',2.47,1.17);if(Maintenance.state().done)throw Error('Lock completed before personal padlock');take('lock');act('control',2.47,1.17);advance();
      take('hand');act('isolate',.6,1.12);advance();
      take('hand');act('dipstick',-.82,.93);take('rag');act('dipstick',-.82,.93);take('hand');act('dipstick',-.82,.93);act('dipstick',-.82,.93);
      if(Walk31.state().journal||!document.querySelector('#flowQuick40'))throw Error('Oil reading requires a modal');key('KeyE','keydown');key('KeyE','keyup');advance();
      take('light');travel(-2.95,0,.12);const lamp=scene.getObjectByName('Haz de la linterna de inspección'),hands=scene.getObjectByName('Manos enguantadas del jugador');Walk31.frame(0);if(!lamp.visible||lamp.intensity<10||!hands.visible)throw Error('Flashlight or hands inactive');
      for(let i=0;i<8;i++){const point=[-2.48,.62+Math.floor(i/2)*.18,i%2?.48:-.48];aim(point);if(!Maintenance.clearSight('dust'+i,true))throw Error('Radiator zone blocked '+i+' '+JSON.stringify(Maintenance.clearSight.blocker));if(i===0){lamp.visible=false;renderer.render(scene,camera);await window.capture41('d41-linterna-apagada');Walk31.frame(0);renderer.render(scene,camera);await window.capture41('d41-linterna');}key('KeyE','keydown');for(let j=0;j<9;j++)Walk31.frame(.08);key('KeyE','keyup');if(Maintenance.state().needed.includes('dust'+i))throw Error('Held inspection failed '+i+' '+JSON.stringify({state:Maintenance.state(),walk:Walk31.state(),rig:Maintenance.rigState()}));}
      if(Maintenance.state().done)throw Error('Inspection treated as cleaning');take('brush');
      for(let i=0;i<8;i++){aim([-2.48,.62+Math.floor(i/2)*.18,i%2?.48:-.48]);if(i===0){const p=Maintenance.targetScreen('dust0');await window.holdMouse41(p.x,p.y);}else key('KeyE','keydown');for(let j=0;j<4;j++)Walk31.frame(.08);if(i===0){renderer.render(scene,camera);await window.capture41('d41-cepillado');}for(let j=0;j<9&&!Maintenance.state().done;j++)Walk31.frame(.08);if(i===0)await window.releaseMouse41();else key('KeyE','keyup');if(Maintenance.state().needed.includes('dust'+i))throw Error('Held cleaning failed '+i);}if(Maintenance.state().index===4)advance();else if(Maintenance.state().index!==5||Maintenance.state().records.length!==5)throw Error('Unexpected automatic progress after cleaning');
      take('socket');act('boltA',-.65,.65,1);act('boltB',-.65,.65,1);take('hand');act('cap',-.68,.6);take('spare');act('cap',-.68,.6);if(Maintenance.state().done)throw Error('Filter accepted with open cover');take('hand');act('cap',-.68,.6);take('socket');act('boltA',-.65,.65,1);if(Maintenance.state().done)throw Error('Filter accepted with one open fastener');act('boltB',-.65,.65,1);advance();
      take('brush');travel(.25,.85);if(Maintenance.act('positive'))throw Error('Energized battery brushing allowed');take('light');act('positive',0,.85);act('negative',.5,.85);if(!Maintenance.state().done||!Maintenance.state().records.at(-1).result.includes('Se guardó una nota'))throw Error('Battery review did not explain its automatic record');advance();
      take('meter');act('positive',0,.85);act('negative',.5,.85);if(Walk31.state().journal||!document.querySelector('#flowQuick40'))throw Error('Battery reading requires a modal');key('KeyE','keydown');key('KeyE','keyup');advance();
      take('light');for(const [id,x]of [['earthA',1.2],['earthB',1.5],['earthC',1.8]])act(id,x,1.15);advance();
      take('hand');act('ragFloor',-.35,3);act('wrenchFloor',.65,3);advance();
      take('hand');act('isolate',.6,1.12);if(!Maintenance.state().locked)throw Error('Unlock before personal padlock removal');take('lock');act('control',2.47,1.17);advance();
      if(Maintenance.state().index!==11)throw Error('Final order missing');
      key('KeyE','keydown');key('KeyE','keyup');if(!Maintenance.state().testing)throw Error('Authorized functional test did not start');
      for(let i=0;i<1500&&!UnidadVII.state().test?.done;i++)tick(.08);renderUI();if(!Maintenance.state().finished)throw Error('Functional transfer did not complete: '+JSON.stringify(UnidadVII.state()));
      Maintenance.suspend33();Walk31.enterZone('yard');
      const exterior=[];
      for(const [name,x,z]of [['QF-01',26.5,4.4],['PR-01',21.1,3.5],['DC-01',25.85,-2.8],['SE-QG',18.4,3.4],['SE-QN',17.9,.7],['SE-QS',20.8,1.3]]){
        travel(x,z);const entry=Cabinets38.entries().find(d=>d.id===name);if(!entry)throw Error('Missing cabinet '+name);camera.lookAt(entry.coverHit.getWorldPosition(new T.Vector3()));camera.updateMatrixWorld(true);
        if(!Cabinets38.use()||!entry.open)throw Error('Key/ray did not open '+name);for(let i=0;i<40;i++)CCM34.frame(.033);
        if(!Cabinets38.cover()||entry.covered)throw Error('Cover did not detach '+name);if(!Cabinets38.cover()||!entry.covered)throw Error('Cover did not return '+name);
        if(!Cabinets38.use()||entry.open)throw Error('Door did not close '+name);for(let i=0;i<40;i++)CCM34.frame(.033);exterior.push(name);
      }
      const completed=Maintenance.state().records.length,evidence=Maintenance.state().records.every(r=>r.workOrder?.source==='scenario-briefing'&&r.workOrder.checks.length===0);
      Maintenance.close();build();Walk31.enterZone('plant');
      const rebuilt=Cabinets38.entries().find(d=>d.id==='G01-CONTROL');let mounted=false;rebuilt.leaf.traverse(o=>{if(o.userData.workTarget==='control')mounted=true;});if(!mounted)throw Error('Configuration rebuild lost cabinet controls');
      return{completed,evidence,functionalTestCompleted:true,controllerDoor:true,removableCover:true,canopy:true,exterior,rebuild:true};
    });
    assert.equal(results.completed,12);assert.equal(results.evidence,true);assert.equal(results.functionalTestCompleted,true);
    console.log(JSON.stringify({startup:true,operators:4,crouch:true,mouseLook:true,pointerLock:true,pause:true,journal:true,eyesDeduplicated:true,zones:true,doors:26,doorInteraction:true,returnToPractice:true,workOrders:results,stairs:stairRoundTrip,pageErrors:errors}));
  } finally {
    await browser?.close();server.kill();
  }
})().catch(e=>{console.error(e);process.exitCode=1});
