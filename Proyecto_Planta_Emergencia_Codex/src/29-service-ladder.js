// Portable access platform: its rendered treads and walking surfaces share dimensions.
const ServiceLadder47=(()=>{
 const layout={x:-1.25,low:2.86,high:2.08,front:1.34,width:.78,clearance:.20,tread:.26,rise:.25,count:3,floor:-.07,stowed:[-3.1,-.07,2.45]};
 function create(owner){
  const group=new T.Group(),front=new T.Group(),rear=new T.Group();group.name='Escalera de plataforma para el filtro';group.userData.noCompact=true;owner.add(group);group.add(front,rear);
  const rail=mat('#dbab35',.18),metal=mat('#a9b3b4',.72),rubber=mat('#232d31'),brace=mat('#3f5260',.6);
  function bar(parent,a,b,width,material){const p=new T.Vector3(...a),q=new T.Vector3(...b),o=box(parent,[width,p.distanceTo(q),width],p.clone().add(q).multiplyScalar(.5).toArray(),material);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),q.sub(p).normalize());return o;}
  const w=layout.width/2,deck=layout.count*layout.rise;
  for(const x of [-w,w]){
   bar(front,[x,.03,layout.low],[x,deck+.90,layout.front],.065,rail);
   bar(rear,[x,.03,layout.front],[x,deck,layout.high-.20],.065,rail);
   for(const z of [layout.low,layout.front])box(z===layout.low?front:rear,[.12,.055,.14],[x,.025,z],rubber);
   bar(front,[x,.42,layout.low-.36],[x,.42,layout.front+.25],.025,brace);
  }
  for(let i=0;i<layout.count;i++){
   const y=(i+1)*layout.rise,z=layout.low-(i+.5)*layout.tread;
   box(front,[layout.width-.05,.045,layout.tread],[0,y-.022,z],metal);
   for(let r=0;r<5;r++)box(front,[layout.width-.12,.008,.009],[0,y+.004,z-.09+r*.045],rubber);
  }
  box(front,[layout.width-.05,.045,layout.high-layout.front],[0,deck-.022,(layout.high+layout.front)/2],metal);
  for(let n=0;n<12;n++)box(front,[layout.width-.12,.008,.012],[0,deck+.004,layout.front+.035+n*.058],rubber);
  bar(front,[-w,deck+.90,layout.front],[w,deck+.90,layout.front],.05,rail);
  cabinetLabel20(front,'PLATAFORMA · FILTRO',[0,deck+.68,layout.front+.03],.53,.12);
  let deployed=false;
  function place(value){deployed=!!value;group.position.set(deployed?layout.x:layout.stowed[0],layout.floor,deployed?0:layout.stowed[2]-layout.high);rear.scale.z=deployed?1:.10;rear.position.z=deployed?0:layout.high*.90;front.scale.z=deployed?1:.16;front.position.z=deployed?0:layout.high*.84;renderer.shadowMap.needsUpdate=true;}
  function within(x,z){return Math.abs(x-layout.x)<layout.width/2&&z>=layout.front&&z<=layout.low;}
  function route(from,x,z){
   if(!deployed)return Math.abs(x-layout.stowed[0])<.57&&Math.abs(z-layout.stowed[2])<.26?null:undefined;
   const start=within(from.x,from.z),end=within(x,z);
   if(!start&&!end)return undefined;
   if(end){
    if(Math.abs(x-layout.x)>layout.clearance)return null;
    if(!start&&from.z<layout.low)return null; // Enter through the lowest tread, never the side.
    const n=z<=layout.high?layout.count:Math.min(layout.count,Math.floor((layout.low-z)/layout.tread)+1),height=layout.floor+n*layout.rise;
    return Math.abs(height-from.floor)>.251?null:{height,zone:'plant',step:n};
   }
   if(z<layout.low||Math.abs(x-layout.x)>layout.clearance||Math.abs(from.floor-layout.floor-layout.rise)>.001)return null;
   return {height:layout.floor,zone:'plant',step:null};
  }
  place(false);
  return{group,place,route,within,state:()=>({deployed,platform:layout.floor+layout.count*layout.rise,layout}),target:()=>deployed?[layout.x,.56,layout.low-.10]:[layout.stowed[0],.9,layout.stowed[2]]};
 }
 return{layout,create};
})();
