const Personnel=(()=>{
 const group=new T.Group();group.name='Operarios · modelos Blender';substation.site.add(group);
 const positions=[[-1.7,-.09,3.35],[2.35,-.09,4.15],[15.15,6.62,4.85],[22.1,6.62,4.85]],angles=[-.20,-.42,.60,-.65];
 const decode=s=>{const b=atob(s),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a.buffer;};
 let status='loading';const ready=(async()=>{const response=new Response(new Blob([decode(PERSONNEL_GZIP_BASE64)]).stream().pipeThrough(new DecompressionStream('gzip'))),data=await response.json();
 const geos=data.geometries.map(o=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(decode(o.p)),3));g.setAttribute('normal',new T.BufferAttribute(new Float32Array(decode(o.n)),3));g.setAttribute('uv',new T.BufferAttribute(new Float32Array(decode(o.uv)),2));g.setIndex(new T.BufferAttribute(new Uint32Array(decode(o.i)),1));if(o.c)g.setAttribute('color',new T.BufferAttribute(new Float32Array(decode(o.c)),3));g.computeBoundingSphere();return g;});
 const maps=new Map(),mats=data.materials.map(d=>{const m=new T.MeshStandardMaterial({color:new T.Color(...d.color),roughness:d.roughness,metalness:d.metalness,transparent:d.transparent,opacity:d.opacity,depthWrite:!d.transparent});m.name=d.name;m.userData.human22=true;if(d.map){if(!maps.has(d.map)){const t=new T.TextureLoader().load(d.map,()=>renderer.shadowMap.needsUpdate=true);t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());maps.set(d.map,t);}m.map=maps.get(d.map);}return m;});
 data.people.forEach((p,i)=>{const g=new T.Group();g.name=p.name;g.userData.role=p.role;g.userData.source='Blender 4.0.2';g.position.set(...positions[i]);g.rotation.y=angles[i];if(i%2)g.scale.set(.96,.965,.96);for(const [gi,mi]of p.meshes){const o=new T.Mesh(geos[gi],mats[mi]);if(geos[gi].getAttribute('color'))o.material.vertexColors=true;o.castShadow=o.receiveShadow=true;g.add(o);}group.add(g);});status='ready';renderer.shadowMap.needsUpdate=true;return true;
 })().catch(error=>{status='error';console.error('Modelos de operarios:',error);return false;});
 const toggle=document.createElement('label');toggle.innerHTML='<input type="checkbox" checked> Mostrar operarios';document.querySelector('.route-controls .buttons').append(toggle);toggle.firstElementChild.onchange=()=>{group.visible=toggle.firstElementChild.checked;renderer.shadowMap.needsUpdate=true;};
 return{group,ready,count:()=>group.children.length,status:()=>status};
})();

// D24: reusable, physically scaled surface maps. No extra render loop or light.
