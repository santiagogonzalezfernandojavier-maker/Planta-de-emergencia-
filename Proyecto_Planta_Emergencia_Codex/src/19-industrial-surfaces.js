// Authored assets are embedded by build.mjs, including the standalone HTML edition.
const IndustrialSurfaces49=(()=>{
 const source=INDUSTRIAL_SURFACES_49,sets=new Map(),pending=[],bindings=new Map();let resolution=512;
 const aliases={castpaint:'cast',plastic:'paint',paper:'cast'};
 function definition(kind){return source.materials[aliases[kind]||kind]||source.materials.paint;}
 function get(kind,size=resolution){
  const name=aliases[kind]||kind,key=name+':'+size;if(sets.has(key))return sets.get(key);
  const entry=definition(name),textures={};
  for(const channel of ['base','normal','orm']){
   const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d');ctx.fillStyle=channel==='normal'?'#8080ff':'#ffffff';ctx.fillRect(0,0,1,1);
   const map=new T.CanvasTexture(canvas);map.name='D49 · '+name+' · '+channel+' · '+size;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
   if(channel==='base')map.colorSpace=T.SRGBColorSpace;
   map.userData={sharedFinish:true,surface49:name,resolution49:size,channel49:channel};textures[channel]=map;
   const image=new Image();pending.push(new Promise((resolve,reject)=>{image.onload=()=>{map.image=image;map.needsUpdate=true;resolve();};image.onerror=()=>reject(new Error('No se pudo cargar el acabado '+name+'/'+channel));}));image.src=entry.levels[String(size)][channel].uri;
  }
  sets.set(key,textures);return textures;
 }
 function bind(material,kind){const maps=get(kind);if(material.map===maps.base&&material.normalMap===maps.normal&&material.roughnessMap===maps.orm){track(material);return;}material.map=maps.base;material.normalMap=maps.normal;material.bumpMap=null;material.roughnessMap=maps.orm;material.aoMap=maps.orm;material.aoMapIntensity=kind==='gravel'?.62:.38;material.userData.finish49=kind;material.needsUpdate=true;
  track(material);
 }
 function track(material){if(!bindings.has(material.uuid)){bindings.set(material.uuid,material);material.addEventListener('dispose',()=>bindings.delete(material.uuid));}}
 function setQuality(mode){const next=mode==='detail'?1024:512;if(next===resolution)return;resolution=next;for(const m of bindings.values())bind(m,m.userData.finish49);renderer.shadowMap.needsUpdate=true;}
 return{get,definition,bind,track,setQuality,ready:()=>Promise.all(pending),stats:()=>({resolution,textureSets:sets.size,boundMaterials:bindings.size,source:source.origin})};
})();
