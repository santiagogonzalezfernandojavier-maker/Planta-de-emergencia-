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
  if(skeleton){const blob=new T.Mesh(new T.PlaneGeometry(1.15,1.15),blobMat);blob.rotation.x=-Math.PI/2;blob.position.y=.025;blob.renderOrder=-1;g.add(blob);
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
 // devuelve un destino libre a menos de 1.7 m de su zona, o null
 function pickTarget(a){
  if(!obstacles)buildObstacles();
  const site=a.g.parent,fl=floorOf(a);
  for(let k=0;k<3;k++){
   const r=rnd(.7,1.6),t=Math.random()*6.283,x=a.home.x+Math.cos(t)*r,z=a.home.z+Math.sin(t)*r;
   const gy=groundY(x,a.home.y,z,site);if(gy===null||(fl!==null&&Math.abs(gy-fl)>.07))continue;
   v1.set(a.g.position.x,a.home.y,a.g.position.z);site.localToWorld(v1);v2.set(x,a.home.y,z);site.localToWorld(v2);
   const d=v2.clone().sub(v1);d.y=0;const L=d.length();if(L<.3)continue;d.normalize();
   let blocked=false;for(const h of [.35,1.1]){const o=v1.clone();o.y+=h+.09;if(hit(o,d,L+.45)){blocked=true;break;}}
   if(blocked)continue;
   for(let q=0;q<4&&!blocked;q++){const o=v2.clone();o.y+=.8;const dd=new T.Vector3(Math.cos(q*1.571),0,Math.sin(q*1.571));if(hit(o,dd,.42))blocked=true;}
   if(!blocked)return new T.Vector3(x,a.home.y,z);
  }
  return null;
 }
 function enter(a,s){a.state=s;a.st=0;
  if(s==='idle'){a.dur=rnd(1.2,3);a.want=0;a.crouchT=0;a.gestT=0;}
  else if(s==='work'){a.dur=rnd(5,9);a.workYaw=a.base+rnd(-.5,.5);a.crouchT=a.role==='tablet'?(Math.random()<.5?.55:0):(Math.random()<.65?1:.4);a.gestT=1;}
 }
 function setup(a){a.state='idle';a.dur=a.i*.9+.5;a.st=0;a.w=0;a.c=0;a.gs=0;a.ph=0;a.t=a.i*3.1;a.look=[0,0];a.lookTo=[0,0];a.lookK=1;a.lookHold=1;a.down=0;a.downT=0;a.sp=0;a.crouchT=0;a.gestT=0;a.target=null;a.wait=0;a.ready=true;}
 const L1=.43;
 function pose(a,dt){
  const B=a.B,W=a.w,C=a.c,G=a.gs,s=Math.sin(a.ph),co=Math.cos(a.ph),tp=a.role==='tablet',al=C*1.0,t=a.t;
  const set=(n,x,y,z)=>B[n].rotation.set(x,y||0,z||0);
  const cad=B.caderas,r=cad.userData.rest;
  cad.position.set(r.x,r.y+W*.018*Math.cos(2*a.ph)-L1*(1-Math.cos(al)),r.z-L1*Math.sin(al));
  set('caderas',0,W*.1*s,W*.03*s+(1-W)*.012*Math.sin(t*.6));
  set('cintura',C*.22,-W*.07*s);
  const br=.012*Math.sin(t*1.7);
  set('pecho',C*.38+W*.04+br+(tp?G*.05:0),-W*.05*s+(a.torsoTurn||0)*G);
  for(const k of [['a',0],['b',Math.PI]]){const side=k[0],pp=a.ph+k[1],sn=Math.sin(pp),cs=Math.cos(pp);
   const hw=-W*.42*sn,kw=W*(.06+.62*Math.max(0,cs));
   set('muslo_'+side,hw-al,0,0);set('rodilla_'+side,kw+al,0,0);set('pie_'+side,-(hw+kw)*.8,0,0);
   if(!tp){const sw=side==='a'?1:-1;let sx=W*.4*sn*-1,ex=-.2-W*.22*(1+sn*-1*.5);
    if(side==='b'&&a.armUp){}
    B['hombro_'+side].rotation.set(sx*-1,0,0);B['codo_'+side].rotation.set(ex,0,0);}
  }
  if(!tp){ // brazo b se levanta a señalar/operar, brazo a se apoya al costado
   const up=G*a.armW,wob=Math.sin(t*2.1)*.12;
   const hb=B.hombro_b.rotation,cb=B.codo_b.rotation;
   hb.x=hb.x*(1-up)+(-1.25+wob*.3)*up;hb.z=.12*up;cb.x=cb.x*(1-up)+(-.75+wob)*up;
   const ha=B.hombro_a.rotation,ca=B.codo_a.rotation;const up2=G*a.armW2;ha.x=ha.x*(1-up2)+(-.55)*up2;ca.x=ca.x*(1-up2)+(-1.1+Math.sin(t*1.3)*.1)*up2;
  } else {
   const bw=Math.sin(t*2.3)*.04*G;B.hombro_a.rotation.set(W*.03*s+bw,0,0);B.hombro_b.rotation.set(-W*.03*s,0,0);B.codo_a.rotation.set(0,0,0);B.codo_b.rotation.set(0,0,0);
  }
  const hx=a.look[1]+a.down*.5+C*-.3,hy=a.look[0];
  set('cuello',hx*.4,hy*.4);set('cabeza',hx*.6,hy*.6);
 }
 function update(a,dt,visible){
  if(!a.ready)setup(a);
  a.t+=dt;a.st+=dt;
  // mirada
  a.lookHold-=dt;if(a.lookHold<=0){const Ls=a.state==='walk'?[[0,0],[.3,0],[-.3,0]]:[[0,0],[.55,-.05],[-.6,0],[.3,.2],[-.25,.25],[.7,.05]],q=Ls[Math.floor(Math.random()*Ls.length)];a.lookFrom=a.look.slice();a.lookTo=q;a.lookK=0;a.lookHold=rnd(1.6,4.4);}
  if(a.lookK<1){a.lookK=Math.min(1,a.lookK+dt/.7);const e=ez(a.lookK);a.look=[a.lookFrom[0]+(a.lookTo[0]-a.lookFrom[0])*e,a.lookFrom[1]+(a.lookTo[1]-a.lookFrom[1])*e];}
  let walking=false,desired=a.yaw;
  if(a.state==='idle'){if(a.st>a.dur){const tg=pickTarget(a);if(tg){a.target=tg;a.state='walk';a.st=0;}else{enter(a,'work');}}}
  else if(a.state==='walk'){
   const dx=a.target.x-a.g.position.x,dz=a.target.z-a.g.position.z,d=Math.hypot(dx,dz);
   if(d<.06){enter(a,'work');}
   else{desired=Math.atan2(dx,dz);walking=true;const df=ang(desired-a.yaw),turn=Math.min(Math.abs(df),dt*3.2)*Math.sign(df);a.yaw+=turn;
    const sp=Math.abs(df)<.5?Math.min(1.15,d*2.5+.25):0;a.sp+=(sp-a.sp)*Math.min(1,dt*5);const step=Math.min(d,a.sp*dt);a.g.position.x+=dx/d*step;a.g.position.z+=dz/d*step;a.ph+=dt*6.283*a.sp/1.45;
    if(a.st>14){enter(a,'work');}}
  }
  else if(a.state==='work'){
   const df=ang(a.workYaw-a.yaw);a.yaw+=Math.min(Math.abs(df),dt*1.6)*Math.sign(df);walking=Math.abs(df)>.35;if(walking)a.ph+=dt*4;
   if(a.st>a.dur){a.armW=0;enter(a,'idle');}
   a.downT-=dt;if(a.downT<=0){a.down=a.role==='tablet'&&a.down<.5?1:0;a.downT=rnd(2,4.5);}
   if(a.armW===undefined||a.st<.05){a.armW=Math.random()<.6?1:0;a.armW2=Math.random()<.25?1:0;a.torsoTurn=rnd(-.15,.15);}
  }
  if(a.state!=='work'){a.down=0;}
  a.g.rotation.y=a.yaw;
  const wT=walking?1:0;a.w+=(wT-a.w)*Math.min(1,dt*6);if(!walking&&a.state!=='walk'){a.sp+=(0-a.sp)*Math.min(1,dt*6);}
  a.c+=((a.state==='work'?a.crouchT:0)-a.c)*Math.min(1,dt*2.2);
  a.gs+=((a.state==='work'?a.gestT:0)-a.gs)*Math.min(1,dt*2.5);
  if(a.armW===undefined){a.armW=0;a.armW2=0;}
  if(visible)pose(a,dt);
 }
 window.OperariosFrame=function(dt){
  if(!P.actors.length||!P.group.visible||window.gameMenuActive)return;
  dt=Math.min(dt,.1);clock+=dt;
  camera.updateMatrixWorld();pm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);fr.setFromProjectionMatrix(pm);
  for(const a of P.actors){a.g.getWorldPosition(v1);v1.y+=.9;sph.set(v1,1.4);const near=v1.distanceTo(camera.position)<70;if(!near)continue;update(a,dt,fr.intersectsSphere(sph));}
 };
 window.PersonnelLife={actors:P.actors,pose};
})();

// D24: reusable, physically scaled surface maps. No extra render loop or light.
