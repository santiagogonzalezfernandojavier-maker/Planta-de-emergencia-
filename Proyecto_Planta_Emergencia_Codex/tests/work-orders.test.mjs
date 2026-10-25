import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(new URL('../src/25-work-orders.js',import.meta.url),'utf8')+';globalThis.ordersAPI=WorkOrders36;',context);
const {orders,validate}=context.ordersAPI;
test('all twelve orders block unconfirmed conditions and unsuitable decisions',()=>{
 assert.equal(orders.length,12);
 for(let i=0;i<orders.length;i++){
  const order=orders[i],checks=order.checks.map(()=>true);
  assert.equal(validate(i,[],order.answer).ok,false);
  assert.equal(validate(i,checks,null).ok,false);
  assert.equal(validate(i,checks,1-order.answer).ok,false);
  assert.equal(validate(i,checks,order.answer).ok,true);
 }
 assert.equal(validate(99,[],0).ok,false);
});
test('battery corrosion order explicitly preserves the energized inspection boundary',()=>{
 const order=orders[6];
 assert.match(order.options[order.answer],/Inspeccionar.*correctiva/);
 assert.match(order.criterion,/corrosión queda visible/);
 assert.match(orders[7].criterion,/limitación/);
});
