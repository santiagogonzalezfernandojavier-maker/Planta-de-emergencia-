import fs from'node:fs';import path from'node:path';import crypto from'node:crypto';import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),manifest=JSON.parse(fs.readFileSync(path.join(root,'MANIFEST_SHA256.json'),'utf8'));
let failed=0;for(const[name,expected]of Object.entries(manifest.files)){try{const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex');if(actual!==expected){console.error('Changed:',name);failed++;}}catch{console.error('Missing:',name);failed++;}}
console.log(`${Object.keys(manifest.files).length} files checked; ${failed} differences.`);process.exitCode=failed?1:0;
