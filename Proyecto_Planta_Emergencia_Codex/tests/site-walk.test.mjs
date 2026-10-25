import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('../src/00-site-walk.js',import.meta.url),'utf8')+';globalThis.api=SiteWalk37;',context);
const site=context.api;
function travel(from,x,z){const distance=Math.hypot(x-from.x,z-from.z),count=Math.ceil(distance/.07);for(let i=0;i<count;i++){const nextX=from.x+(x-from.x)/(count-i),nextZ=from.z+(z-from.z)/(count-i),next=site.step(from,nextX,nextZ);assert.ok(next,'Blocked at '+nextX+','+nextZ+' from floor '+from.floor);assert.ok(Math.abs(next.height-from.floor)<=site.maxStep+1e-6);from={x:nextX,z:nextZ,floor:next.height,zone:next.zone};}return from;}
test('all 36 physical treads join the basement and deck in both directions',()=>{
 let p={x:-5.65,z:5.65,floor:-.07};p=travel(p,-5.65,-5.75);assert.equal(p.floor,6.5);assert.equal(p.zone,'yard');
 p=travel(p,-5.65,-6.7);p=travel(p,14,-6.7);p=travel(p,14,5.4);assert.equal(p.floor,6.65);
 p=travel(p,14,-6.7);p=travel(p,-5.65,-6.7);p=travel(p,-5.65,5.65);assert.equal(p.floor,-.07);assert.equal(p.zone,'plant');
});
test('handrails, stair opening, equipment and floor differences remain solid',()=>{
 assert.equal(site.step({x:-4.7,z:0,floor:-.07},-5.1,0),null);
 assert.equal(site.step({x:-5.65,z:0,floor:site.surface(-5.65,0,3).height},-4.9,0),null);
 assert.equal(site.surface(-4.5,0,6.5),null);
 assert.equal(site.step({x:8.7,z:0,floor:6.5},9,0),null);
 assert.ok(site.step({x:8.8,z:-6.7,floor:6.5},9,-6.7));
 assert.equal(site.step({x:0,z:2,floor:-.07},0,0),null);
 assert.equal(site.step({x:9.2,z:0,floor:6.5},11,3.9),null);
 assert.equal(site.step({x:0,z:0,floor:6.5},30,0),null);
});
test('radiator access removes only the collider corresponding to its removed service duct',()=>{
 assert.equal(site.surface(-2.95,-.5,-.07),null);
 assert.ok(site.surface(-2.95,-.5,-.07,true));
 assert.equal(site.surface(0,0,-.07,true),null);
 assert.equal(site.surface(-4.8,-3,-.07,true),null);
});
