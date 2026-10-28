// Shared shell, doorway and walkable floor. Equipment is representative, not a vendor design.
const ControlHouse491={left:22.75,right:26.05,front:-4.40,back:-6.95,doorLeft:23.45,doorRight:25.25,floor:6.98,
 surface(x,z){if(x<this.left-.18||x>this.right+.18||z<this.back-.18||z> -4.02)return undefined;
  if(z>this.front){if(x<this.doorLeft+.18||x>this.doorRight-.18)return null;return{height:6.82,zone:'yard'};}
  if(x<this.left+.24||x>this.right-.24||z<this.back+.24)return null;
  if(z>this.front-.18&&(x<this.doorLeft+.18||x>this.doorRight-.18))return null;
  if(z< -6.04||x<23.30||x>25.65)return null;
  return{height:this.floor,zone:'yard'};
 }};
function createControlHouse491(house){
 const d=ControlHouse491,wall=mat('#b4b7af'),steel=mat('#899b9f',.7),paint=mat('#9badb1',.18),dark=mat('#24343b');
 house.name='SC-01 · caseta de control con interior';house.userData.noCompact=true;
 box(house,[3.5,.16,2.75],[24.4,6.90,-5.70],wall);box(house,[1.95,.17,.35],[24.35,6.735,-4.20],wall);
 for(const x of [d.left,d.right])box(house,[.16,2.45,2.55],[x,8.205,-5.675],wall);
 box(house,[3.3,2.45,.16],[24.4,8.205,d.back],wall);
 box(house,[.70,2.45,.16],[23.10,8.205,d.front],wall);box(house,[.80,2.45,.16],[25.65,8.205,d.front],wall);box(house,[1.80,.35,.16],[24.35,9.255,d.front],wall);
 box(house,[3.6,.16,2.85],[24.4,9.51,-5.70],wall);
 for(const x of [d.doorLeft,d.doorRight])box(house,[.055,2.14,.12],[x,8.05,d.front+.02],steel);
 box(house,[1.84,.05,.12],[24.35,9.115,d.front+.02],steel);
 for(const [side,hinge,sign]of [['IZQ',d.doorLeft,1],['DER',d.doorRight,-1]]){
  const pivot=new T.Group(),leaf=new T.Group();pivot.name='SC-01 · bisagra '+side;pivot.userData.noCompact=true;house.add(pivot);pivot.position.set(hinge,8.045,d.front+.09);pivot.add(leaf);
  box(leaf,[.88,2.10,.045],[sign*.44,0,0],paint);box(leaf,[.034,.23,.05],[sign*.77,-.12,.055],dark);
  for(const y of [-.78,.78])cyl(leaf,.019,.12,[0,y,0],steel);
  cabinetLabel20(leaf,side==='IZQ'?'SC-01 · CONTROL':'ACCESO AL INTERIOR',[sign*.44,.68,.027],.70,.085);
  const id='SC-PUERTA-'+side;leaf.traverse(o=>{if(o.isMesh)o.userData.cabinet38=id;});CabinetParts38.push({id,key:'yard',type:'building',openable:true,owner:house,pivot,leaf,cover:null,open:false,angle:0,target:0,openAngle:sign===1?-Math.PI*.54:Math.PI*.54,covered:false});
 }
 cabinetLabel20(house,'SC-01 · CASETA DE CONTROL',[24.35,9.29,d.front+.09],1.9,.14);
 for(const [id,x,type,title]of [['SC-PR',23.7,'protection','PROTECCIÓN / IED'],['SC-PLC',24.45,'control','CONTROL / SEÑALES'],['SC-DC',25.2,'dc','SERVICIOS DC']]){
  const g=new T.Group();g.name=id+' · '+title;house.add(g);box(g,[.65,1.65,.035],[x,7.95,-6.26],paint);
  cabinetLabel20(g,title,[x,8.52,-6.23],.58,.075);box(g,[.28,.16,.02],[x,8.25,-6.23],dark);cabinetLabel20(g,'NEXORA · '+id,[x,8.25,-6.215],.25,.065);
  articulateCabinet38(g,{id,key:'yard',type,x,y:7.95,z:-6.24,w:.65,h:1.65,depth:.40,front:o=>o.position.z> -6.28});
 }
 // Workbench, terminal panel, cable tray and visible secondary conduits.
 box(house,[.42,.06,.85],[23.05,7.74,-5.45],steel);for(const z of [-5.78,-5.1])box(house,[.035,.75,.035],[23.07,7.35,z],steel);
 box(house,[.16,.22,.30],[23.06,7.89,-5.5],paint);cabinetLabel20(house,'PRUEBA / SEÑALES',[23.12,8.25,-5.85],.55,.09);
 for(const y of [7.07,9.10]){tube(house,[[22.97,y,-6.65],[25.8,y,-6.65],[25.8,y,-5.1]],.022,steel);}
 for(const x of [23.7,24.45,25.2])tube(house,[[x,8.80,-6.55],[x,9.10,-6.55],[25.8,9.10,-6.55]],.015,steel);
 cabinetLabel20(house,'INSPECCIÓN DIDÁCTICA · CIRCUITOS SECUNDARIOS',[24.35,9.12,-6.84],2.45,.10);
}
