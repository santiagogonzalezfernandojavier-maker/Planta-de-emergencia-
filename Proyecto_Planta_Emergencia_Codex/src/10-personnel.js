const Personnel=(()=>{
 const group=new T.Group();group.name='Operarios · modelos Blender';substation.site.add(group);
 const positions=[[-1.7,-.09,3.35],[2.35,-.09,4.15],[15.15,6.62,4.85],[22.1,6.62,4.85]],angles=[-.20,-.42,.60,-.65];
 const decode=s=>{const b=atob(s),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a.buffer;};
 let status='loading';const ready=(async()=>{const response=new Response(new Blob([decode(PERSONNEL_GZIP_BASE64)]).stream().pipeThrough(new DecompressionStream('gzip'))),data=await response.json();
 const geos=data.geometries.map(o=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(decode(o.p)),3));g.setAttribute('normal',new T.BufferAttribute(new Float32Array(decode(o.n)),3));g.setAttribute('uv',new T.BufferAttribute(new Float32Array(decode(o.uv)),2));g.setIndex(new T.BufferAttribute(new Uint32Array(decode(o.i)),1));if(o.c)g.setAttribute('color',new T.BufferAttribute(new Float32Array(decode(o.c)),3));g.computeBoundingSphere();return g;});
 const maps=new Map(),mats=data.materials.map(d=>{const m=new T.MeshStandardMaterial({color:new T.Color(...d.color),roughness:d.roughness,metalness:d.metalness,transparent:d.transparent,opacity:d.opacity,depthWrite:!d.transparent});m.name=d.name;m.userData.human22=true;if(d.map){if(!maps.has(d.map)){const t=new T.TextureLoader().load(d.map,()=>renderer.shadowMap.needsUpdate=true);t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());maps.set(d.map,t);}m.map=maps.get(d.map);}return m;});
 // Keep the anatomical eyes/glasses only: the delivery also included older overlapping pairs.
 const legacyFace=new Set([10,11,12,13,14,22,23,27,28,32,33]);
 const helmet=new T.MeshStandardMaterial({color:'#e6b82e',roughness:.42,metalness:0});
 const radioMat=new T.MeshStandardMaterial({color:'#18252c',roughness:.72});
 const trimMat=new T.MeshStandardMaterial({color:'#cbd3c8',roughness:.48,metalness:.15});
 const visorFrame=new T.MeshStandardMaterial({color:'#272c2d',roughness:.68});
 function detail(parent,geo,material,position){const o=new T.Mesh(geo,material);o.position.set(...position);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function badgeTexture(i){const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');x.fillStyle='#e7ebe0';x.fillRect(0,0,256,128);x.fillStyle='#12343e';x.fillRect(0,0,256,32);x.fillStyle='#fff';x.font='bold 20px sans-serif';x.fillText('MANTENIMIENTO',16,24);x.fillStyle='#233238';x.font='bold 28px sans-serif';x.fillText('TEC · 0'+(i+1),16,76);x.font='18px sans-serif';x.fillText(i<2?'PLANTA G-01':'SUBESTACIÓN',16,108);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
 data.people.forEach((p,i)=>{const g=new T.Group();g.name=p.name;g.userData.role=p.role;g.userData.source='Blender 4.0.2';g.position.set(...positions[i]);g.rotation.y=angles[i];if(i%2)g.scale.set(.96,.965,.96);for(const [gi,mi]of p.meshes){if(legacyFace.has(mi))continue;const o=new T.Mesh(geos[gi],mats[mi]);if(geos[gi].getAttribute('color'))o.material.vertexColors=true;// The original yellow helmet was exported with a skin material.
 if(mi===7||mi===21)o.material=helmet;
 if(o.material.name.startsWith('Piel anatómica'))o.material.roughness=.76;
 if(o.material.name.startsWith('Esclerótica')){o.material.color.set('#b9b7a4');o.material.roughness=.48;}
 o.castShadow=o.receiveShadow=true;g.add(o);}
 // Equipment stays local to each person and shares geometry/materials where possible.
 const badgeMat=new T.MeshStandardMaterial({map:badgeTexture(i),roughness:.85});
 detail(g,new T.BoxGeometry(.075,.047,.004),badgeMat,[-.095,1.27,.133]);
 detail(g,new T.BoxGeometry(.045,.075,.025),radioMat,[.105,1.30,.137]);
 detail(g,new T.CylinderGeometry(.002,.002,.065,6),radioMat,[.119,1.37,.137]);
 detail(g,new T.BoxGeometry(.025,.006,.004),trimMat,[.105,1.31,.153]);
 // Thin chin straps follow the sides of the face rather than crossing the eyes.
 for(const side of [-1,1]){const strap=detail(g,new T.BoxGeometry(.008,.145,.005),visorFrame,[side*.072,1.58,.006]);strap.rotation.z=side*.12;}
 const bounds=new T.Box3().setFromObject(g);g.position.y+=(i<2?-.07:6.65)-bounds.min.y;
 g.userData.presentation='D35 · rostro sin duplicados, casco, identificación y radio';group.add(g);});status='ready';renderer.shadowMap.needsUpdate=true;return true;
 })().catch(error=>{status='error';console.error('Modelos de operarios:',error);return false;});
 const toggle=document.createElement('label');toggle.innerHTML='<input type="checkbox" checked> Mostrar operarios';document.querySelector('.route-controls .buttons').append(toggle);toggle.firstElementChild.onchange=()=>{group.visible=toggle.firstElementChild.checked;renderer.shadowMap.needsUpdate=true;};
 return{group,ready,count:()=>group.children.length,status:()=>status};
})();

// D24: reusable, physically scaled surface maps. No extra render loop or light.
