import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.PORT||4173),restartMs=Number(process.env.PLANTA_RESTART_MS||3000);
fs.mkdirSync(path.join(root,'.runtime'),{recursive:true});
fs.writeFileSync(path.join(root,'.runtime/codespaces.pid'),String(process.pid));
let child,worker,starting=false,stopping=false;
async function healthy(){try{const r=await fetch(`http://127.0.0.1:${port}/__dev/version`,{signal:AbortSignal.timeout(2000)});return r.ok&&typeof(await r.json()).version==='string';}catch{return false;}}
async function start(){
 if(stopping||starting||child)return;starting=true;
 try{
  if(await healthy())return; // Adopt a running npm start instead of fighting for its port.
  if(stopping)return;
  child=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,stdio:'inherit'});
  child.on('error',e=>console.error('No se pudo iniciar el servidor:',e.message));
  child.on('exit',()=>{child=null;if(!stopping)setTimeout(start,restartMs).unref();});
 }finally{starting=false;}
}
function sync(){
 if(stopping||worker)return;
 // Git/network work runs in another process: it must never block HTTP startup or responses.
 worker=spawn(process.execPath,['scripts/sync-worker.mjs'],{cwd:root,stdio:'inherit',timeout:150000});
 worker.on('error',e=>console.log('Se mantiene la versión local:',e.message));
 worker.on('exit',()=>{worker=null;});
}
start();sync();
const updates=setInterval(sync,30000),watch=setInterval(start,5000);
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{stopping=true;clearInterval(updates);clearInterval(watch);worker?.kill(signal);child?.kill(signal);});
