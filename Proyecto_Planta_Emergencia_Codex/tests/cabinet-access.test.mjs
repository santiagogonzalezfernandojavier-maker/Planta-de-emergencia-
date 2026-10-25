import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function inventory(){const c=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('../src/00-cabinet-hardware.js',import.meta.url),'utf8')+';globalThis.access=CabinetAccess38;',c);return c.access;}
test('a matching physical key and proximity are both required',()=>{
 const keys=inventory();assert.equal(keys.check('plant',1).ok,false);assert.equal(keys.collect('unknown'),false);assert.equal(keys.collect('plant'),true);assert.equal(keys.check('plant',1).ok,true);assert.equal(keys.check('plant',3).ok,false);assert.equal(keys.check('yard',1).ok,false);assert.equal(keys.check('ccm',1).ok,false);
 keys.collect('yard');keys.collect('ccm');assert.equal(keys.list().length,3);
});
