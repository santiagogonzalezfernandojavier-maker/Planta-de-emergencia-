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
    await page.locator('#fpCrouch').click();
    assert.ok((await page.evaluate(()=>Walk31.state().position[1]))<standing-.3);
    await page.locator('#fpCrouch').click();
    const yaw=await page.evaluate(()=>Walk31.state().yaw);
    await page.mouse.move(800,400);await page.mouse.down();
    await page.mouse.move(1000,420,{steps:12});await page.mouse.up();
    assert.ok(Math.abs((await page.evaluate(()=>Walk31.state().yaw))-yaw)>.4);
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
    console.log(JSON.stringify({startup:true,operators:4,crouch:true,mouseLook:true,zones:true,doors:26,doorInteraction:true,returnToPractice:true,pageErrors:errors}));
  } finally {
    await browser?.close();server.kill();
  }
})().catch(e=>{console.error(e);process.exitCode=1});
