import fs from 'node:fs';
import {syncCheckout} from './sync.mjs';
// Codespaces supervisor: updates only a clean checkout on its existing branch.
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
fs.mkdirSync(path.join(root,'.runtime'),{recursive:true});
fs.writeFileSync(path.join(root,'.runtime/codespaces.pid'),String(process.pid));
const run=(cmd,args)=>spawnSync(cmd,args,{cwd:root,encoding:'utf8',timeout:120000});
let child,busy=false,stopping=false;
const sync=()=>syncCheckout(root);
function start(){child=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,stdio:'inherit'});child.on('exit',()=>{if(!stopping)setTimeout(start,3000);});}
sync();
const installed=run('npm',['ci','--no-audit','--no-fund']);
if(installed.status!==0)console.log('No se instalaron las herramientas de pruebas; el simulador no requiere dependencias de producción.');
start();
const timer=setInterval(()=>{if(busy)return;busy=true;try{if(sync())child?.kill('SIGTERM');}finally{busy=false;}},30000);
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{stopping=true;clearInterval(timer);child?.kill(signal);});
