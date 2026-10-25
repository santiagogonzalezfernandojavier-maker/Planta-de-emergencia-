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
    page.setDefaultTimeout(180000);
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
    await page.goto(`http://127.0.0.1:${port}`,{timeout:180000});
    await page.waitForFunction(()=>document.documentElement.classList.contains('ready32'), {}, {polling:100});
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
    await page.locator('#nav33toggle').click();
    await page.locator('[data-zone33=yard]').click();
    assert.equal(await page.evaluate(()=>Walk31.state().zone),'yard');
    await page.locator('[data-zone33=ccm]').click();
    await page.evaluate(()=>frame(performance.now()+2000));
    assert.equal(await page.evaluate(()=>CCM34.state().length),26);
    await page.keyboard.down('KeyW');
    await page.evaluate(()=>{for(let i=0;i<7;i++)Walk31.frame(.08)});
    await page.keyboard.up('KeyW');await page.keyboard.press('KeyE');
    await page.evaluate(()=>{for(let i=0;i<35;i++)CCM34.frame(.033)});
    assert.ok((await page.evaluate(()=>CCM34.state())).some(d=>d.open));
    await page.locator('#closeCCM34').click();
    assert.ok((await page.evaluate(()=>CCM34.state())).every(d=>!d.open));
    await page.locator('[data-zone33=practice]').click();
    assert.equal(await page.evaluate(()=>Walk31.state().zone),'plant');
    assert.equal(await page.evaluate(()=>Protection33.masts),4);
    assert.equal(await page.evaluate(()=>Protection33.apartarrayos),3);
    assert.deepEqual(errors,[]);
    // Walk the twelve actual work orders through the shipped interaction API.
    await page.evaluate(()=>{Walk31.enterZone('plant');});
    assert.ok(await page.locator('#missionCard').isVisible());
    await page.keyboard.press('KeyQ');
    await page.locator('#wPrepareOrder').click();
    assert.match(await page.locator('#orderMessage').innerText(),/Confirma/);
    await page.evaluate(()=>{document.querySelectorAll('[name=orderCheck]').forEach(el=>el.click());});
    await page.locator('[name=orderDecision][value="1"]').check();
    await page.locator('#wPrepareOrder').click();
    assert.match(await page.locator('#orderMessage').innerText(),/decisión/);
    await page.locator('[name=orderDecision][value="0"]').check();
    await page.locator('#wPrepareOrder').click();
    assert.equal(await page.evaluate(()=>Maintenance.state().workOrder.ready),true);
    await page.keyboard.press('KeyQ');
    const results=await page.evaluate(()=>{
      const canvas=renderer.domElement;
      const key=(code,type)=>canvas.dispatchEvent(new KeyboardEvent(type,{code,key:code.startsWith('Key')?code.slice(3).toLowerCase():code,bubbles:true,cancelable:true}));
      function turn(yaw){let difference=Math.atan2(Math.sin(yaw-Walk31.state().yaw),Math.cos(yaw-Walk31.state().yaw));const code=difference>0?'ArrowLeft':'ArrowRight';key(code,'keydown');for(let remaining=Math.abs(difference);remaining>1e-6;){const dt=Math.min(.08,remaining/1.6);Walk31.frame(dt);remaining-=dt*1.6;}key(code,'keyup');}
      function travel(x,z){
        const start=Walk31.state().position,spacing=.24,queue=[[0,0]],seen=new Map([['0,0',null]]);let end=null;
        for(let head=0;head<queue.length&&head<12000;head++){
          const cell=queue[head],px=start[0]+cell[0]*spacing,pz=start[2]+cell[1]*spacing;
          if(Math.hypot(px-x,pz-z)<1.15){end=cell;break;}
          for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const next=[cell[0]+dx,cell[1]+dz],id=next.join(',');if(!seen.has(id)&&Walk31.canStand(start[0]+next[0]*spacing,start[2]+next[1]*spacing)){seen.set(id,cell);queue.push(next);}}
        }
        if(!end)throw Error('No route to '+x+','+z);
        const route=[];for(let cell=end;cell;cell=seen.get(cell.join(',')))route.unshift(cell);
        for(const cell of route.slice(1)){const p=Walk31.state().position,dx=start[0]+cell[0]*spacing-p[0],dz=start[2]+cell[1]*spacing-p[2];turn(Math.atan2(-dx,-dz));key('KeyW','keydown');for(let remaining=Math.hypot(dx,dz);remaining>1e-5;){const dt=Math.min(.08,remaining/1.65);Walk31.frame(dt);remaining-=dt*1.65;}key('KeyW','keyup');}
      }
      function take(tool){if(tool==='hand'){Maintenance.select('hand');return;}travel(.15,3.05);if(!Walk31.bag(true))throw Error('Bag unreachable '+JSON.stringify(Walk31.state()));Maintenance.select(tool);}
      function act(id,x,z,amount=0){travel(x,z);if(!Maintenance.act(id,amount))throw Error('Action rejected: '+id+' order '+Maintenance.state().index);}
      function prepare(){document.querySelector('#fpJournal').click();document.querySelectorAll('[name=orderCheck]').forEach(el=>el.click());const i=Maintenance.state().index;document.querySelector('[name=orderDecision][value="'+WorkOrders36.orders[i].answer+'"]').click();document.querySelector('#wPrepareOrder').click();if(!Maintenance.state().workOrder.ready)throw Error('Order not prepared');document.querySelector('#fpJournal').click();}
      function advance(){if(!Maintenance.state().done)throw Error('Order not complete '+Maintenance.state().index);Maintenance.next();prepare();}
      take('plan');act('control',2.47,1.17);advance();
      take('hand');act('control',2.47,1.17);if(Maintenance.state().done)throw Error('Lock completed before personal padlock');take('lock');act('control',2.47,1.17);advance();
      take('hand');act('isolate',.6,1.12);advance();
      take('hand');act('dipstick',-.82,.93);take('rag');act('dipstick',-.82,.93);take('hand');act('dipstick',-.82,.93);act('dipstick',-.82,.93);
      document.querySelector('#fpJournal').click();document.querySelector('#wOilReading').value='63';document.querySelector('#wReading').click();document.querySelector('#fpJournal').click();advance();
      take('light');for(let i=0;i<8;i++)act('dust'+i,-2.38,i%2?.36:-.36);if(Maintenance.state().done)throw Error('Inspection treated as cleaning');take('brush');for(let i=0;i<8;i++)act('dust'+i,-2.38,i%2?.36:-.36);advance();
      take('socket');act('boltA',-.65,.65,1);act('boltB',-.65,.65,1);take('hand');act('cap',-.68,.6);take('spare');act('cap',-.68,.6);if(Maintenance.state().done)throw Error('Filter accepted with open cover');take('hand');act('cap',-.68,.6);take('socket');act('boltA',-.65,.65,1);if(Maintenance.state().done)throw Error('Filter accepted with one open fastener');act('boltB',-.65,.65,1);advance();
      take('brush');travel(.25,.85);if(Maintenance.act('positive'))throw Error('Energized battery brushing allowed');take('light');act('positive',0,.85);act('negative',.5,.85);advance();
      take('meter');act('positive',0,.85);act('negative',.5,.85);document.querySelector('#fpJournal').click();document.querySelector('#wReading').click();document.querySelector('#fpJournal').click();advance();
      take('light');for(const [id,x]of [['earthA',1.2],['earthB',1.5],['earthC',1.8]])act(id,x,1.15);advance();
      take('hand');act('ragFloor',-.35,3);act('wrenchFloor',.65,3);advance();
      take('hand');act('isolate',.6,1.12);if(!Maintenance.state().locked)throw Error('Unlock before personal padlock removal');take('lock');act('control',2.47,1.17);advance();
      if(Maintenance.state().index!==11)throw Error('Final order missing');
      Maintenance.runTest();if(!Maintenance.state().testing)throw Error('Authorized functional test did not start');
      for(let i=0;i<1500&&!UnidadVII.state().test?.done;i++)tick(.08);renderUI();if(!Maintenance.state().finished)throw Error('Functional transfer did not complete: '+JSON.stringify(UnidadVII.state()));return{completed:Maintenance.state().records.length,evidence:Maintenance.state().records.every(r=>r.workOrder?.decision),functionalTestCompleted:true};
    });
    assert.equal(results.completed,12);assert.equal(results.evidence,true);assert.equal(results.functionalTestCompleted,true);
    console.log(JSON.stringify({startup:true,operators:4,crouch:true,mouseLook:true,pointerLock:true,pause:true,journal:true,eyesDeduplicated:true,zones:true,doors:26,doorInteraction:true,returnToPractice:true,workOrders:results,pageErrors:errors}));
  } finally {
    await browser?.close();server.kill();
  }
})().catch(e=>{console.error(e);process.exitCode=1});
