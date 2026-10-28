const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const root=path.resolve(__dirname,'../dist/site'),manifest=JSON.parse(fs.readFileSync(path.join(root,'version.json'),'utf8'));let browser,updated=false;
 const server=http.createServer((req,res)=>{
  const name=new URL(req.url,'http://localhost').pathname;
  if(name==='/Planta-de-emergencia-/version.json'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(updated?{...manifest,version:'next',release:'prueba-siguiente'}:manifest));return;}
  if(name==='/Planta-de-emergencia-/'){res.setHeader('Content-Type','text/html');res.end(fs.readFileSync(path.join(root,'index.html')));return;}
  res.writeHead(404).end();
 });
 try{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
  const page=await browser.newPage({viewport:{width:1400,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto('http://127.0.0.1:'+server.address().port+'/Planta-de-emergencia-/');
  await page.waitForFunction(()=>document.documentElement.classList.contains('ready32'),{},{timeout:180000,polling:100});
  await page.evaluate(()=>frame(performance.now()+1000));assert.equal(await page.evaluate(()=>Personnel.count()),4);
  assert.equal(await page.evaluate(()=>Maintenance.state().quality),'D49.1');
  assert.equal(await page.locator('#gameLaunch').isVisible(),true);
  assert.equal(await page.evaluate(()=>Maintenance.state().active),false);
  await page.locator('#gameMaintenance').click();await page.locator('#wBeginG').click();
  assert.equal(await page.evaluate(()=>Maintenance.state().active),true);
  const before=await page.evaluate(()=>Maintenance.state().index);updated=true;
  await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  await page.waitForFunction(()=>!!document.getElementById('site-update'),{},{polling:100});
  assert.match(await page.locator('#site-update').innerText(),/prueba-siguiente/);
  assert.equal(await page.evaluate(()=>Maintenance.state().index),before);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({staticSite:true,repositorySubpath:true,operators:4,release:manifest.release,updateNotice:true,activePracticePreserved:true,pageErrors:errors}));
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
