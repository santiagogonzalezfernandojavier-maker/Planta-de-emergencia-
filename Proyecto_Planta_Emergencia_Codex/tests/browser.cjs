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
    console.log(JSON.stringify({startup:true,operators:4,crouch:true,mouseLook:true,pointerLock:true,pause:true,journal:true,eyesDeduplicated:true,zones:true,doors:26,doorInteraction:true,returnToPractice:true,pageErrors:errors}));
  } finally {
    await browser?.close();server.kill();
  }
})().catch(e=>{console.error(e);process.exitCode=1});
