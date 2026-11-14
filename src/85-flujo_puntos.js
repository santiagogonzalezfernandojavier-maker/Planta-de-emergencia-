// v12.26 · El flujo de corriente se ve como puntos que avanzan (antes eran flechas/conos).
(function(){
 try{
  const skip=new Set();for(const it of (substation.flowItems||[]))if(it.kind==='air'||it.kind==='exhaust')for(const d of it.dots)skip.add(d); // aire y escape conservan su flecha
  const cache=new Map();let n=0;
  scene.traverse(o=>{if(!o.isMesh||skip.has(o)||o.geometry.type!=='ConeGeometry'||!o.material||!o.material.isMeshBasicMaterial)return;
   const r=+(o.geometry.parameters.radius*1.2).toFixed(3);if(!cache.has(r))cache.set(r,new T.SphereGeometry(r,12,8));o.geometry=cache.get(r);n++;});
  window.__flujoPuntos=n;
 }catch(e){console.warn('flujo en puntos',e);}
})();
