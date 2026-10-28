import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.glb':'model/gltf-binary','.gz':'application/gzip','.svg':'image/svg+xml','.pdf':'application/pdf'};
let version='',buildError=false;
function refresh(){
 try{
  const order=JSON.parse(fs.readFileSync(path.join(root,'src/order.json'),'utf8'));
  const finishes=JSON.parse(fs.readFileSync(path.join(root,'assets/textures/industrial/manifest.json'),'utf8'));
  const surfaceFiles=Object.values(finishes.materials).flatMap(m=>Object.values(m.levels).flatMap(level=>Object.values(level).map(asset=>'assets/textures/industrial/'+asset.file)));
  const files=['scripts/build.mjs','src/order.json','src/index.template.html','src/styles/app.css','vendor/three.js','assets/personnel/scene-data.json.gz','assets/textures/industrial/manifest.json',...surfaceFiles,...order.map(p=>'src/'+p)];
  const stamp=crypto.createHash('sha256').update(files.map(p=>{const s=fs.statSync(path.join(root,p));return p+':'+s.mtimeMs+':'+s.size;}).join('\n')).digest('hex');
  if(stamp!==version){
   const result=spawnSync(process.execPath,['scripts/build.mjs'],{cwd:root,encoding:'utf8'});
   if(result.status!==0)throw Error(result.stderr||'Build failed');
   version=stamp;buildError=false;console.log('Simulador actualizado · '+stamp.slice(0,8));
  }
 }catch(error){buildError=true;console.error('No se pudo reconstruir el simulador:',error.message);}
}
function client(){return `<script>(()=>{const initial=${JSON.stringify(version)};let checking=false;async function check(entering){if(checking||document.hidden)return;checking=true;try{const r=await fetch('/__dev/version',{cache:'no-store'});if(!r.ok)return;const current=await r.json();if(current.version!==initial){const state=window.Maintenance?.state();const inProgress=state?.active&&(state.index>0||state.step>0||state.workOrder?.ready);if(entering&&!inProgress){location.reload();return;}if(!document.getElementById('simulator-update')){const b=document.createElement('button');b.id='simulator-update';b.textContent='Nueva versión disponible · actualizar (reinicia el recorrido)';b.style='position:fixed;bottom:75px;left:50%;transform:translateX(-50%);z-index:999999;background:#e4bb70;color:#17242b;border:1px solid #fff;padding:12px 18px;border-radius:6px;cursor:pointer';b.onclick=()=>location.reload();document.body.append(b);}}}catch{}finally{checking=false;}}setInterval(()=>check(false),5000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)check(true);});})();</script>`;}
refresh();
http.createServer((req,res)=>{
 let decoded;
 try{decoded=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 if(decoded==='/'||decoded==='/index.html'||decoded==='/__dev/version')refresh();
 if(decoded==='/__dev/health'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify({service:'planta-emergencia',pid:process.pid,version,buildError}));return;}
 if(decoded==='/__dev/version'){
  res.writeHead(!version?503:200,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify({version}));return;
 }
 const relative=decoded==='/'?'/index.html':decoded;
 const dest=path.resolve(root,'.'+relative);
 if((dest!==root&&!dest.startsWith(root+path.sep))||relative.split('/').some(p=>p.startsWith('.')||p==='node_modules')){res.writeHead(403).end();return;}
 fs.stat(dest,(err,stat)=>{
  if(err||!stat.isFile()){res.writeHead(404).end('Not found');return;}
  // Do not allow symlinks to expose files outside the project.
  let real;try{real=fs.realpathSync(dest);}catch{res.writeHead(404).end();return;}if(!real.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(buildError&&!fs.existsSync(path.join(root,'index.html'))&&(decoded==='/'||decoded==='/index.html')){res.writeHead(503).end('No se pudo construir la nueva versión. Revisa la terminal.');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(dest)]||'application/octet-stream','Cache-Control':'no-store'});
  if(dest===path.join(root,'index.html')){res.end(fs.readFileSync(dest,'utf8').replace('</body>',client()+'</body>'));return;}
  fs.createReadStream(dest).pipe(res);
 });
}).listen(port,'127.0.0.1',()=>console.log(`Simulator: http://127.0.0.1:${port}`));
