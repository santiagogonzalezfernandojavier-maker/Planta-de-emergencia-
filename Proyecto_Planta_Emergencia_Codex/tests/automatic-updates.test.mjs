import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
import {syncCheckout} from '../scripts/sync.mjs';
const project=new URL('../',import.meta.url);
const git=(cwd,...args)=>{const r=spawnSync('git',args,{cwd,encoding:'utf8'});assert.equal(r.status,0,r.stderr);return r.stdout.trim();};
function commit(root,message){git(root,'-c','user.name=Test','-c','user.email=test@local','commit','-am',message);}
test('automatic synchronization fast-forwards clean work and preserves edits and diverged commits',()=>{
 const base=fs.mkdtempSync(path.join(os.tmpdir(),'planta-sync-'));
 try{
  const remote=path.join(base,'origin'),writer=path.join(base,'writer'),reader=path.join(base,'reader');fs.mkdirSync(remote);git(remote,'init','--bare','--initial-branch=main');git(base,'clone',remote,writer);
  fs.writeFileSync(path.join(writer,'scene.txt'),'one');git(writer,'add','.');commit(writer,'first');git(writer,'push','origin','main');git(base,'clone',remote,reader);
  fs.writeFileSync(path.join(writer,'scene.txt'),'two');commit(writer,'second');git(writer,'push','origin','main');assert.equal(syncCheckout(reader,()=>{}),true);assert.equal(fs.readFileSync(path.join(reader,'scene.txt'),'utf8'),'two');
  fs.writeFileSync(path.join(reader,'scene.txt'),'my local edit');fs.writeFileSync(path.join(writer,'scene.txt'),'three');commit(writer,'third');git(writer,'push','origin','main');assert.equal(syncCheckout(reader,()=>{}),false);assert.equal(fs.readFileSync(path.join(reader,'scene.txt'),'utf8'),'my local edit');
  commit(reader,'local commit');const head=git(reader,'rev-parse','HEAD');assert.equal(syncCheckout(reader,()=>{}),false);assert.equal(git(reader,'rev-parse','HEAD'),head);
 }finally{fs.rmSync(base,{recursive:true,force:true});}
});
test('server rebuilds changed sources, advertises a new version and protects private paths',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'planta-server-'));let child;
 try{
  for(const folder of ['scripts','src/styles','vendor','assets/personnel','.runtime'])fs.mkdirSync(path.join(root,folder),{recursive:true});
  for(const name of ['serve.mjs','build.mjs'])fs.copyFileSync(new URL('scripts/'+name,project),path.join(root,'scripts',name));
  fs.writeFileSync(path.join(root,'package.json'),'{"type":"module"}');
  fs.writeFileSync(path.join(root,'src/order.json'),'["main.js"]');fs.writeFileSync(path.join(root,'src/main.js'),'window.example=1;');fs.writeFileSync(path.join(root,'src/styles/app.css'),'body{color:red}');fs.writeFileSync(path.join(root,'vendor/three.js'),'// vendor');fs.writeFileSync(path.join(root,'assets/personnel/scene-data.json.gz'),'fixture');fs.writeFileSync(path.join(root,'src/index.template.html'),'<html><head><!--APP_STYLE--></head><body><!--VENDOR_SCRIPT--><!--APP_SCRIPT--></body></html>');
  fs.writeFileSync(path.join(root,'.runtime/private'),'private');
  const socket=net.createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(resolve=>socket.close(resolve));
  child=spawn(process.execPath,[path.join(root,'scripts/serve.mjs')],{env:{...process.env,PORT:String(port)},stdio:'ignore'});
  const url='http://127.0.0.1:'+port;let ready=false;
  for(let i=0;i<100;i++){try{if((await fetch(url)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,50));}assert.equal(ready,true);
  const first=await(await fetch(url+'/__dev/version')).json();assert.match(await(await fetch(url)).text(),/Nueva versión disponible/);
  fs.writeFileSync(path.join(root,'src/main.js'),'window.example=222;');
  const second=await(await fetch(url+'/__dev/version')).json();assert.notEqual(second.version,first.version);assert.match(await(await fetch(url+'/build/app.js')).text(),/example=222/);
  assert.equal((await fetch(url+'/.runtime/private')).status,403);
  fs.symlinkSync(path.join(root,'package.json'),path.join(root,'public-link.json'));assert.equal((await fetch(url+'/public-link.json')).status,200);
  fs.symlinkSync('/etc/passwd',path.join(root,'escape.txt'));assert.equal((await fetch(url+'/escape.txt')).status,403);
 }finally{if(child&&child.exitCode===null){child.kill();await once(child,'exit');}fs.rmSync(root,{recursive:true,force:true});}
});
