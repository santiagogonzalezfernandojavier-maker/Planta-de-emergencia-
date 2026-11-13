// v12.21 · Nivel de detalle por distancia
// Oculta lo que ocupa menos de unos pocos píxeles en pantalla (tornillos, detalles lejanos) para bajar llamadas de dibujo y triángulos.
// Se usa la capa 0 de la cámara (no `visible`), así no pisa lo que otros módulos muestran u ocultan.
(function(){
 const K=()=>renderer.domElement.clientHeight/2/Math.tan(camera.fov*Math.PI/360);
 let list=[],built=0,last=0,off=false,scale=1;const cp=new T.Vector3(),sp=new T.Sphere();
 const under=(o,g)=>{while(o){if(o===g)return true;o=o.parent;}return false;};
 const fixedToCamera=o=>{while(o){if(o===camera)return true;o=o.parent;}return false;};
 function build(){
  for(const e of list)e.o.layers.enable(0);
  const first=!built;list=[];if(first)scene.updateMatrixWorld(true);
  scene.traverse(o=>{
   if(!o.isMesh||o.isSkinnedMesh||o.isInstancedMesh||o.userData.noLod||o.userData.workTarget||o.frustumCulled===false)return;
   if(Personnel&&under(o,Personnel.group)||fixedToCamera(o))return;
   const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();if(!g.boundingSphere)return;
   sp.copy(g.boundingSphere).applyMatrix4(o.matrixWorld);
   const detail=o.name==='Detalle estático agrupado';
   list.push({o,x:sp.center.x,y:sp.center.y,z:sp.center.z,r:sp.radius,hide:detail?9:2.2,show:detail?12:3.2,culled:false});
  });
  built=performance.now();
 }
 function step(){
  const now=performance.now();if(now-last<130)return;last=now;
  if(!list.length||now-built>20000)build();
  if(off)return;
  const k=K()*scale;camera.getWorldPosition(cp);
  for(const e of list){
   const dx=e.x-cp.x,dy=e.y-cp.y,dz=e.z-cp.z,d=Math.sqrt(dx*dx+dy*dy+dz*dz)||.01,pr=e.r/d*k;
   if(e.culled){if(pr>e.show){e.o.layers.enable(0);e.culled=false;}}
   else if(pr<e.hide){e.o.layers.disable(0);e.culled=true;}
  }
  // Operarios: partes pequeñas (ojos) solo de cerca
  if(Personnel.actors)for(const a of Personnel.actors){a.g.getWorldPosition(cp);const dist=cp.distanceTo(camera.position),far=dist>30;a.g.visible=dist<110;a.g.traverse(m=>{if(m.isMesh&&m.geometry.index&&m.geometry.index.count<=1500&&!m.userData.blob)m.visible=!far;});}
 }
 window.LodDistancia={setEnabled(v){off=!v;if(off)for(const e of list){e.o.layers.enable(0);e.culled=false;}},scale:v=>{scale=v;},stats:()=>({total:list.length,ocultos:list.filter(e=>e.culled).length}),rebuild:build};
 const old=window.Performance33&&Performance33.frame;
 if(old)Performance33.frame=function(){old.apply(this,arguments);step();};
})();
