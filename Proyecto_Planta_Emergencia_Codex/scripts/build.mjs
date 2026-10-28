import vm from 'node:vm';import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const order=JSON.parse(read('src/order.json')),payload=fs.readFileSync(path.join(root,'assets/personnel/scene-data.json.gz')).toString('base64');
const finishes=JSON.parse(read('assets/textures/industrial/manifest.json'));
for(const material of Object.values(finishes.materials))for(const level of Object.values(material.levels))for(const asset of Object.values(level)){const bytes=fs.readFileSync(path.join(root,'assets/textures/industrial',asset.file));if(asset.sha256&&crypto.createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw Error('La textura no coincide con su manifiesto: '+asset.file);asset.uri='data:image/webp;base64,'+bytes.toString('base64');}
const app='const PERSONNEL_GZIP_BASE64='+JSON.stringify(payload)+';\nconst INDUSTRIAL_SURFACES_49='+JSON.stringify(finishes)+';\n'+order.map(p=>'\n// SOURCE: src/'+p+'\n'+read('src/'+p)).join('\n'),vendor=read('vendor/three.js'),css=read('src/styles/app.css'),template=read('src/index.template.html');
new vm.Script(app,{filename:'app.js'});
for(const key of ['APP_STYLE','VENDOR_SCRIPT','APP_SCRIPT'])if(!template.includes('<!--'+key+'-->'))throw new Error('Missing marker '+key);
const render=(style,vend,code)=>template.replace('<!--APP_STYLE-->',()=>style).replace('<!--VENDOR_SCRIPT-->',()=>vend).replace('<!--APP_SCRIPT-->',()=>code);
for(const d of ['build','dist'])fs.mkdirSync(path.join(root,d),{recursive:true});
fs.writeFileSync(path.join(root,'build/app.js'),app);
fs.writeFileSync(path.join(root,'index.html'),render('<link rel="stylesheet" href="src/styles/app.css">','<script src="vendor/three.js"></script>','<script src="build/app.js"></script>'));
fs.writeFileSync(path.join(root,'dist/ABRIR_SIMULADOR.html'),render('<style>'+css+'</style>','<script>'+vendor+'</script>','<script>'+app+'</script>'));
console.log('Built index.html, build/app.js and dist/ABRIR_SIMULADOR.html');
