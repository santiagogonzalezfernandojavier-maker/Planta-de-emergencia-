import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function inventory(){const c=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('../src/00-cabinet-hardware.js',import.meta.url),'utf8')+';globalThis.access=CabinetAccess38;',c);return c.access;}
test('doors require proximity but no key collection',()=>{
 const access=inventory();for(const area of ['plant','yard','ccm']){assert.equal(access.check(area,1).ok,true);assert.equal(access.check(area,3).ok,false);}
});
