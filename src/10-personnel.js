const Personnel=(()=>{
 const group=new T.Group();group.name='Operarios · modelos Blender';substation.site.add(group);
 const positions=[[-1.7,-.09,3.35],[2.35,-.09,4.15],[15.15,6.62,4.85],[22.1,6.62,4.85]],angles=[-.20,-.42,.60,-.65];
 const decode=s=>{const b=atob(s),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a.buffer;};
 const actors=[];let status='loading';
 const ready=(async()=>{const response=new Response(new Blob([decode(PERSONNEL_GZIP_BASE64)]).stream().pipeThrough(new DecompressionStream('gzip'))),data=await response.json();
 const geos=data.geometries.map(o=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(decode(o.p)),3));g.setAttribute('normal',new T.BufferAttribute(new Float32Array(decode(o.n)),3));g.setAttribute('uv',new T.BufferAttribute(new Float32Array(decode(o.uv)),2));g.setIndex(new T.BufferAttribute(new Uint32Array(decode(o.i)),1));if(o.c)g.setAttribute('color',new T.BufferAttribute(new Float32Array(decode(o.c)),3));if(o.j){g.setAttribute('skinIndex',new T.BufferAttribute(new Uint8Array(decode(o.j)),4));g.setAttribute('skinWeight',new T.BufferAttribute(new Float32Array(decode(o.w)),4));}g.computeBoundingSphere();return g;});
 const maps=new Map(),mats=data.materials.map(d=>{const m=new T.MeshStandardMaterial({color:new T.Color(...d.color),roughness:d.roughness,metalness:d.metalness,transparent:d.transparent,opacity:d.opacity,depthWrite:!d.transparent});m.name=d.name;m.userData.human22=true;if(/^Tejido/.test(d.name)){m.roughness=1;m.metalness=0;}if(d.map){if(!maps.has(d.map)){const t=new T.TextureLoader().load(d.map,()=>renderer.shadowMap.needsUpdate=true);t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());maps.set(d.map,t);}m.map=maps.get(d.map);}return m;});
 const bc=document.createElement('canvas');bc.width=bc.height=64;{const c=bc.getContext('2d'),gr=c.createRadialGradient(32,32,2,32,32,31);gr.addColorStop(0,'rgba(0,0,0,.62)');gr.addColorStop(.6,'rgba(0,0,0,.28)');gr.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gr;c.fillRect(0,0,64,64);}
 const blobMat=new T.MeshBasicMaterial({map:new T.CanvasTexture(bc),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 data.people.forEach((p,i)=>{const g=new T.Group();g.name=p.name;g.userData.role=p.role;g.userData.source='Blender 4.0.2';g.position.set(...positions[i]);g.rotation.y=angles[i];if(i%2)g.scale.set(.96,.965,.96);
  const bones=[],byName={};
  if(p.bones){p.bones.forEach(b=>{const o=new T.Bone();o.name=b.n;const par=b.p>=0?p.bones[b.p].t:[0,0,0];o.position.set(b.t[0]-par[0],b.t[1]-par[1],b.t[2]-par[2]);o.userData.rest=o.position.clone();bones.push(o);byName[b.n]=o;(b.p>=0?bones[b.p]:g).add(o);});}
  g.updateMatrixWorld(true);
  const skeleton=bones.length?new T.Skeleton(bones):null;
  for(const [gi,mi]of p.meshes){const skinned=skeleton&&geos[gi].getAttribute('skinIndex');const o=skinned?new T.SkinnedMesh(geos[gi],mats[mi]):new T.Mesh(geos[gi],mats[mi]);if(geos[gi].getAttribute('color'))o.material.vertexColors=true;o.castShadow=!skinned;o.receiveShadow=true;g.add(o);if(skinned)o.bind(skeleton);}
  if(skeleton){const blob=new T.Mesh(new T.PlaneGeometry(1.15,1.15),blobMat);blob.rotation.x=-Math.PI/2;blob.position.y=.025;blob.renderOrder=-1;blob.userData.blob=true;g.add(blob);
   actors.push({g,i,role:p.role,pose:p.pose,B:byName,home:new T.Vector3(...positions[i]),base:angles[i],yaw:angles[i]});}
  group.add(g);});
 status='ready';renderer.shadowMap.needsUpdate=true;return true;
 })().catch(error=>{status='error';console.error('Modelos de operarios:',error);return false;});
 const toggle=document.createElement('label');toggle.innerHTML='<input type="checkbox" checked> Mostrar operarios';document.querySelector('.route-controls .buttons').append(toggle);toggle.firstElementChild.onchange=()=>{group.visible=toggle.firstElementChild.checked;renderer.shadowMap.needsUpdate=true;};
 return{group,ready,actors,count:()=>group.children.length,status:()=>status};
})();

// Operarios con esqueleto: caminan cortos recorridos dentro de su zona, se agachan a revisar y miran la tablet o el equipo.
// Animación procedural sobre 17 huesos; sin sombra dinámica (sombra de mancha) para no regenerar el mapa de sombras.
(function(){
 const P=Personnel,ray=new T.Raycaster(),v1=new T.Vector3(),v2=new T.Vector3(),dn=new T.Vector3(0,-1,0),fr=new T.Frustum(),pm=new T.Matrix4(),sph=new T.Sphere();
 let obstacles=null,clock=0;
 const ez=t=>t*t*(3-2*t),ang=a=>Math.atan2(Math.sin(a),Math.cos(a)),rnd=(a,b)=>a+Math.random()*(b-a);
 function buildObstacles(){obstacles=[];scene.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh||!o.visible||o.userData.noCollide)return;let q=o.parent;while(q){if(q===P.group)return;q=q.parent;}
  const m=o.material;if(m&&(m.side===T.BackSide||m.isShaderMaterial))return;if(o.geometry.boundingSphere===null)o.geometry.computeBoundingSphere();if(o.geometry.boundingSphere.radius>60)return;obstacles.push(o);});}
 function hit(from,dir,far){ray.set(from,dir);ray.far=far;ray.camera=camera;return ray.intersectObjects(obstacles,false).length>0;}
 function groundY(x,y,z,s){v1.set(x,y,z);s.localToWorld(v1);v1.y+=1.2;ray.set(v1,dn);ray.far=3;ray.camera=camera;const h=ray.intersectObjects(obstacles,false);return h.length?h[0].point.y:null;}
 function floorOf(a){if(a.floor===undefined){a.floor=groundY(a.home.x,a.home.y,a.home.z,a.g.parent);}return a.floor;}
 function near(from,dir,far){ray.set(from,dir);ray.far=far;ray.camera=camera;const h=ray.intersectObjects(obstacles,false);return h.length?h[0].distance:Infinity;}
 // ¿se puede ir en línea recta de (x0,z0) a (x,z), con piso al mismo nivel y sitio libre alrededor?
 function freePath(a,x0,z0,x,z){
  const site=a.g.parent,fl=floorOf(a);
  const gy=groundY(x,a.home.y,z,site);if(gy===null||(fl!==null&&Math.abs(gy-fl)>.07))return false;
  const gm=groundY((x+x0)/2,a.home.y,(z+z0)/2,site);if(gm===null||(fl!==null&&Math.abs(gm-fl)>.07))return false;
  v1.set(x0,a.home.y,z0);site.localToWorld(v1);v2.set(x,a.home.y,z);site.localToWorld(v2);
  const d=v2.clone().sub(v1);d.y=0;const L=d.length();if(L<.3)return false;d.normalize();
  const sd=new T.Vector3(-d.z,0,d.x);
  for(const h of [.35,1.1])for(const off of [-.28,0,.28]){const o=v1.clone().addScaledVector(sd,off);o.y+=h+.09;if(hit(o,d,L+.45))return false;}
  for(let q=0;q<8;q++){const o=v2.clone();o.y+=.8;if(hit(o,new T.Vector3(Math.cos(q*.7854),0,Math.sin(q*.7854)),.5))return false;}
  return true;
 }
 // hacia dónde hay equipo cerca: devuelve [giro local, distancia]
 function faceNearest(a,x,z){
  const site=a.g.parent;v1.set(x,a.home.y,z);site.localToWorld(v1);v1.y+=1.15;let best=Infinity,by=a.base;
  for(let q=0;q<12;q++){const th=q*.5236,dir=new T.Vector3(Math.sin(th),0,Math.cos(th)).transformDirection(site.matrixWorld);const d=near(v1,dir,2.4);if(d<best){best=d;by=th;}}
  return [by,best];
 }
 // puestos de trabajo: el propio y hasta dos más, verificados una sola vez
 function findSpots(a){
  if(!obstacles)buildObstacles();
  a.spots=[{x:a.home.x,z:a.home.z,yaw:a.base,near:faceNearest(a,a.home.x,a.home.z)[1]}];
  for(let k=0;k<26&&a.spots.length<3;k++){
   const r=rnd(1.3,2.7),t=Math.random()*6.283,x=a.home.x+Math.cos(t)*r,z=a.home.z+Math.sin(t)*r;
   if(P.actors.some(o=>o!==a&&Math.hypot(o.home.x-x,o.home.z-z)<1.8&&Math.abs(o.home.y-a.home.y)<1))continue;
   if(a.spots.some(q=>Math.hypot(q.x-x,q.z-z)<1.1))continue;
   if(!freePath(a,a.home.x,a.home.z,x,z))continue;
   const f=faceNearest(a,x,z);if(k<20&&f[1]>1.5)continue; /* primero, sitios junto a un equipo */
   a.spots.push({x,z,yaw:f[1]<2.4?f[0]:a.base,near:f[1]});
  }
 }
 function startWork(a,first){a.state='work';a.st=0;a.dur=first?rnd(5,12)+a.i*4:rnd(14,30);a.evT=rnd(3,6);a.armW=0;a.crouchT=0;a.down=a.role==='tablet'?1:0;}
 function setup(a){a.w=0;a.c=0;a.gs=0;a.ph=0;a.t=a.i*3.1;a.look=[0,0];a.goal=[0,0];a.glance=2;a.down=0;a.dn=0;a.sp=0;a.crouchT=0;a.armW=0;a.aw=0;a.at=0;a.target=null;a.seen=0;a.bored=0;a.ready=true;startWork(a,true);}
 const L1=.43;
 function pose(a){
  const B=a.B,W=a.w,C=a.c,s=Math.sin(a.ph),tp=a.role==='tablet',al=C*.5,t=a.t,idle=1-W,k=a.i*1.7,up=a.aw||0;
  const set=(n,x,y,z)=>B[n].rotation.set(x,y||0,z||0);
  const cad=B.caderas,r=cad.userData.rest;
  cad.position.set(r.x,r.y+W*.016*Math.cos(2*a.ph)-L1*(1-Math.cos(al)),r.z-L1*Math.sin(al));
  // de pie: solo respiración y un cambio de peso lento, casi imperceptible
  set('caderas',0,W*.08*s,W*.025*s+idle*.018*Math.sin(t*.33+k));
  set('cintura',C*.3,-W*.06*s+idle*.02*Math.sin(t*.27+k+1));
  set('pecho',C*.5+W*.035+.01*Math.sin(t*1.5+k)+(tp?a.dn*.04:0)+up*.06,-W*.04*s);
  for(const q of [['a',0],['b',Math.PI]]){const side=q[0],pp=a.ph+q[1],sn=Math.sin(pp),cs=Math.cos(pp);
   const hw=-W*.36*sn,kw=W*(.05+.55*Math.max(0,cs));
   set('muslo_'+side,hw-al,0,0);set('rodilla_'+side,kw+al,0,0);set('pie_'+side,-(hw+kw)*.8,0,0);
   if(!tp){B['hombro_'+side].rotation.set(W*.3*sn+idle*.015*Math.sin(t*.5+k+q[1]),0,0);B['codo_'+side].rotation.set(-.16-W*.18*(1-sn*.5),0,0);}
  }
  if(!tp){ // la mano derecha sube a operar el tablero que tiene enfrente
   const hb=B.hombro_b.rotation,cb=B.codo_b.rotation,tap=Math.sin(t*3.1)*.035;
   hb.x=hb.x*(1-up)+(-1.02+tap)*up;hb.z=.1*up;cb.x=cb.x*(1-up)+(-.6+tap*2)*up;
  } else {
   const tap=a.dn*.02*Math.sin(t*2.6+k);B.hombro_a.rotation.set(W*.025*s,0,0);B.hombro_b.rotation.set(-W*.025*s+tap,0,0);B.codo_a.rotation.set(0,0,0);B.codo_b.rotation.set(0,0,0);
  }
  const hx=a.look[1]+a.dn*.42-C*.25,hy=a.look[0];
  set('cuello',hx*.4,hy*.4);set('cabeza',hx*.6,hy*.6);
 }
 const cl=new T.Vector3();
 function update(a,dt,visible){
  if(!a.ready)setup(a);
  a.t+=dt;a.st+=dt;
  // ¿hay alguien (la cámara) cerca? lo miran un momento y siguen con lo suyo
  cl.copy(camera.position);a.g.worldToLocal(cl);
  const pd=Math.hypot(cl.x,cl.z),pyaw=Math.atan2(cl.x,cl.z),close=pd<2.6&&cl.y>.6&&cl.y<2.6;
  let watching=false;
  if(close&&Math.abs(pyaw)<1.25){if(a.bored<=0){a.seen+=dt;watching=true;if(a.seen>(pd<1.3?9:4.5)){a.bored=rnd(7,12);a.seen=0;}}}else a.seen=0;
  if(a.bored>0&&!watching)a.bored-=dt;
  // mirada: vistazos poco frecuentes y cortos
  if(watching){a.goal=[Math.max(-1,Math.min(1,pyaw)),Math.max(-.3,Math.min(.3,-(cl.y-1.6)/Math.max(.6,pd)))];}
  else{a.glance-=dt;if(a.glance<=0){const L=a.state==='walk'?[[0,0],[0,0],[.25,0],[-.25,0]]:[[0,0],[0,0],[0,0],[.35,0],[-.35,0],[.2,-.08],[-.15,.1]];a.goal=L[Math.floor(Math.random()*L.length)];a.glance=rnd(3,7);}}
  const lk=Math.min(1,dt*(watching?4:2.5));a.look[0]+=(a.goal[0]-a.look[0])*lk;a.look[1]+=(a.goal[1]-a.look[1])*lk;
  let walking=0;
  if(a.state==='work'){
   const sp=a.spots?a.spots[a.at]:null,wy=sp?sp.yaw:a.base,df=ang(wy-a.yaw);
   if(Math.abs(df)>.02){a.yaw+=Math.min(Math.abs(df),dt*1.7)*Math.sign(df);if(Math.abs(df)>.3){walking=.55;a.ph+=dt*5;}}
   // pequeñas tareas dentro del puesto
   a.evT-=dt;if(a.evT<=0){
    a.evT=rnd(4,8);const r=Math.random();
    if(a.role==='tablet'){a.down=a.down>.5&&r<.4?0:1;a.crouchT=0;if(a.down<.5)a.evT=rnd(2,3.5);}
    else if(a.armW>0||a.crouchT>0){a.armW=0;a.crouchT=0;}
    else if(r<.3&&sp&&sp.near<1.25){a.armW=1;a.evT=rnd(2.5,4.5);}
    else if(r<.4&&sp&&sp.near<1.6){a.crouchT=.8;a.evT=rnd(3,5);}
   }
   if(a.st>a.dur&&!watching){
    if(!a.spots)findSpots(a);
    const to=a.at===0?(a.spots.length>1?1+Math.floor(Math.random()*(a.spots.length-1)):0):0,q=a.spots[to];
    const busy=P.actors.some(o=>o!==a&&o.g.visible&&Math.abs(o.home.y-a.home.y)<1&&(Math.hypot(o.g.position.x-q.x,o.g.position.z-q.z)<1.3||(o.target&&Math.hypot(o.target.x-q.x,o.target.z-q.z)<1.3)));
    v1.set(q.x,a.home.y+1.5,q.z);a.g.parent.localToWorld(v1);
    if(to===a.at||busy||v1.distanceTo(camera.position)<1.6){a.st=0;a.dur=rnd(6,12);}
    else{a.next=to;a.target=q;a.state='walk';a.st=0;a.armW=0;a.crouchT=0;a.down=0;}
   }
  }
  else if(a.state==='walk'){
   const dx=a.target.x-a.g.position.x,dz=a.target.z-a.g.position.z,d=Math.hypot(dx,dz);
   if(d<.07||a.st>20){a.g.position.x=d<.3?a.target.x:a.g.position.x;a.g.position.z=d<.3?a.target.z:a.g.position.z;a.at=d<.3?a.next:a.at;a.target=null;startWork(a);}
   else{
    const df=ang(Math.atan2(dx,dz)-a.yaw);a.yaw+=Math.min(Math.abs(df),dt*2.6)*Math.sign(df);
    const blocked=close&&pd<1.2&&Math.abs(pyaw)<.9; // no atropellan a quien tienen enfrente
    const want=blocked||Math.abs(df)>.7?0:Math.min(.95,d*1.6+.2)*Math.cos(df);
    a.sp+=(want-a.sp)*Math.min(1,dt*3);
    const st=Math.min(d,a.sp*dt);
    if(d<.4||Math.abs(df)<.15){a.g.position.x+=dx/d*st;a.g.position.z+=dz/d*st;}else{a.g.position.x+=Math.sin(a.yaw)*st;a.g.position.z+=Math.cos(a.yaw)*st;}
    a.ph+=dt*6.283*Math.max(a.sp,Math.abs(df)>.7?.45:0)/1.4;walking=blocked?0:Math.max(.5,Math.min(1,a.sp/.8));
   }
  }
  if(a.state!=='walk')a.sp+=(0-a.sp)*Math.min(1,dt*5);
  a.g.rotation.y=a.yaw;
  a.w+=(walking-a.w)*Math.min(1,dt*5);
  a.c+=((a.state==='work'?a.crouchT:0)-a.c)*Math.min(1,dt*1.8);
  a.aw+=((a.state==='work'?a.armW:0)-a.aw)*Math.min(1,dt*2.2);
  a.dn+=((a.state==='work'&&!watching?a.down:0)-a.dn)*Math.min(1,dt*2.2);
  if(visible)pose(a);
 }
 window.OperariosFrame=function(dt){
  if(!P.actors.length||!P.group.visible||window.gameMenuActive)return;
  dt=Math.min(dt,.1);clock+=dt;
  camera.updateMatrixWorld();pm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);fr.setFromProjectionMatrix(pm);
  for(const a of P.actors){a.g.getWorldPosition(v1);v1.y+=.9;sph.set(v1,1.4);const near=v1.distanceTo(camera.position)<70;if(!near)continue;update(a,dt,fr.intersectsSphere(sph));}
 };
 window.PersonnelLife={actors:P.actors,pose,step(dt){for(const a of P.actors)update(a,dt,true);}};
})();

// D24: reusable, physically scaled surface maps. No extra render loop or light.
