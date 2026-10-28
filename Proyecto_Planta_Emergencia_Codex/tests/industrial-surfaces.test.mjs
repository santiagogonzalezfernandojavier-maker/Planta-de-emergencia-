import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const directory=new URL('../assets/textures/industrial/',import.meta.url);
const manifest=JSON.parse(fs.readFileSync(new URL('manifest.json',directory),'utf8'));
test('twelve authored material families have both complete, intact, bounded offline PBR resolutions',()=>{
 assert.equal(Object.keys(manifest.materials).length,12);assert.match(manifest.origin,/originales/);
 let total=0;
 for(const [kind,material]of Object.entries(manifest.materials)){
  assert.ok(material.tileMetres>0&&material.tileMetres<=3,kind);assert.ok(material.normalStrength>0&&material.normalStrength<=1,kind);
  for(const resolution of ['512','1024']){
   const files=material.levels[resolution];assert.deepEqual(Object.keys(files).sort(),['base','normal','orm']);assert.equal(new Set(Object.values(files).map(f=>f.sha256)).size,3,kind);
   for(const file of Object.values(files)){assert.equal(file.file.includes('/'),false);const bytes=fs.readFileSync(new URL(file.file,directory));assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(bytes.length,file.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),file.sha256);total+=bytes.length;}
  }
 }
 assert.ok(total<6_500_000,'Texture payload is too large for the standalone simulator');
});
