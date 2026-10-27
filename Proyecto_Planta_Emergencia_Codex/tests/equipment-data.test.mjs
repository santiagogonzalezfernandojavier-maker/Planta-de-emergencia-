import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(new URL('../src/68-equipment-data.js',import.meta.url),'utf8')+';globalThis.api=EquipmentData48;',context);
const api=context.api;
test('equipment plates distinguish circuit voltage from unassigned arrester and transformer ratings',()=>{
 assert.equal(new Set(api.definitions.map(d=>d.id)).size,20);
 for(const id of ['AP-01','AP-TE','AP-TP']){
  const data=api.get(id);assert.equal(data.fields.find(f=>f.name==='Tensión de la red').value,'13.8 kV');
  assert.ok(data.unknown.some(f=>f.name==='MCOV / Uc'));assert.ok(data.unknown.some(f=>f.name==='Tensión asignada Ur'));
  assert.ok(data.unknown.every(f=>f.value==='Por definir'));
 }
 for(const id of ['TE','TP'])assert.equal(api.get(id).unknown.find(f=>f.name==='Potencia nominal (kVA)').value,'Por definir');
 for(const {id}of api.definitions){const data=api.get(id);assert.equal(data.brand,'NEXORA');assert.match(data.origin,/ficticios/);assert.ok(data.unknown.length>0);}
});
test('generator plate follows scenario changes and identifies calculated apparent power',()=>{
 const data=api.get('G-01',{rating:120,freq:50,phase:1,fuel:'ng'}),fields=Object.fromEntries(data.fields.map(f=>[f.name,f]));
 assert.equal(fields['Potencia activa'].value,'120 kW');assert.equal(fields['Potencia aparente de referencia'].value,'150.0 kVA');assert.match(fields['Potencia aparente de referencia'].origin,/Calculada.*0.80/);
 assert.equal(fields.Frecuencia.value,'50 Hz');assert.match(fields.Tensión.value,/monofásico/);assert.equal(fields.Combustible.value,'Gas natural');assert.equal(api.get('unknown'),null);
});
