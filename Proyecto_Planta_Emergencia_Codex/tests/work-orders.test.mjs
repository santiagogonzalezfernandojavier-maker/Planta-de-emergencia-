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
 assert.match(order.options[order.answer],/Inspeccionar.*limpieza queda pendiente/);
 assert.match(order.criterion,/corrosión queda visible/);
 assert.match(orders[7].criterion,/no prueba la capacidad/);
});

test('every activity provides an executable action, tool and visible completion result',()=>{
 for(const order of orders){
  assert.ok(order.steps.length>0);
  for(const step of order.steps){assert.match(step.action,/\b(E|Q)\b/);assert.ok(step.tool.length>0);assert.ok(step.result.length>15);}
 }
 assert.match(orders[6].steps[0].result,/guarda una nota/);
 assert.match(orders[6].criterion,/automáticamente/);
});
