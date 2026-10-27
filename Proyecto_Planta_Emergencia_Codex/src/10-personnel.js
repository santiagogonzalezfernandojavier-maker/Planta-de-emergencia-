const Personnel=(()=>{
 const group=new T.Group();group.name='Operarios · modelos Blender';substation.site.add(group);
 const positions=[[-1.7,-.09,3.35],[2.35,-.09,4.15],[15.15,6.62,4.85],[22.1,6.62,4.85]],angles=[-.20,-.42,.60,-.65];
 const decode=s=>{const b=atob(s),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a.buffer;};
 let status='loading';const ready=(async()=>{const response=new Response(new Blob([decode(PERSONNEL_GZIP_BASE64)]).stream().pipeThrough(new DecompressionStream('gzip'))),data=await response.json();
 const geos=data.geometries.map(o=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(decode(o.p)),3));g.setAttribute('normal',new T.BufferAttribute(new Float32Array(decode(o.n)),3));g.setAttribute('uv',new T.BufferAttribute(new Float32Array(decode(o.uv)),2));g.setIndex(new T.BufferAttribute(new Uint32Array(decode(o.i)),1));if(o.c)g.setAttribute('color',new T.BufferAttribute(new Float32Array(decode(o.c)),3));g.computeBoundingSphere();return g;});
 const maps=new Map(),mats=data.materials.map(d=>{const m=new T.MeshStandardMaterial({color:new T.Color(...d.color),roughness:d.roughness,metalness:d.metalness,transparent:d.transparent,opacity:d.opacity,depthWrite:!d.transparent});m.name=d.name;m.userData.human22=true;if(d.map){if(!maps.has(d.map)){const t=new T.TextureLoader().load(d.map,()=>renderer.shadowMap.needsUpdate=true);t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());maps.set(d.map,t);}m.map=maps.get(d.map);}return m;});
 // Keep the anatomical eyes/glasses only: the delivery also included older overlapping pairs.
 // Fine weave relief is shared across uniforms; original color textures remain intact.
 const weaveCanvas=document.createElement('canvas');weaveCanvas.width=weaveCanvas.height=128;const weaveContext=weaveCanvas.getContext('2d'),weaveImage=weaveContext.createImageData(128,128);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4;weaveImage.data[i]=128+Math.sin(x*Math.PI/2)*16;weaveImage.data[i+1]=128+Math.sin(y*Math.PI/2)*16;weaveImage.data[i+2]=252;weaveImage.data[i+3]=255;}weaveContext.putImageData(weaveImage,0,0);
 const weave=new T.CanvasTexture(weaveCanvas);weave.wrapS=weave.wrapT=T.RepeatWrapping;weave.repeat.set(12,12);weave.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
 for(const m of mats){if(/Tejido|Chaleco/.test(m.name)){m.normalMap=weave;m.normalScale.set(.16,.16);m.roughness=.94;m.metalness=0;}if(/Herraje_[34]$/.test(m.name)){m.roughness=.80;m.metalness=0;}}
 const legacyFace=new Set([10,11,12,13,14,22,23,27,28,32,33]);
 const helmet=new T.MeshStandardMaterial({color:'#e6b82e',roughness:.42,metalness:0});
 const radioMat=new T.MeshStandardMaterial({color:'#18252c',roughness:.72});
 const trimMat=new T.MeshStandardMaterial({color:'#cbd3c8',roughness:.48,metalness:.15});
 const visorFrame=new T.MeshStandardMaterial({color:'#272c2d',roughness:.68});
 function detail(parent,geo,material,position){const o=new T.Mesh(geo,material);o.position.set(...position);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function badgeTexture(i){const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');x.fillStyle='#e7ebe0';x.fillRect(0,0,256,128);x.fillStyle='#12343e';x.fillRect(0,0,256,32);x.fillStyle='#fff';x.font='bold 20px sans-serif';x.fillText('MANTENIMIENTO',16,24);x.fillStyle='#233238';x.font='bold 28px sans-serif';x.fillText('TEC · 0'+(i+1),16,76);x.font='18px sans-serif';x.fillText(i<2?'PLANTA G-01':'SUBESTACIÓN',16,108);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
 data.people.forEach((p,i)=>{const g=new T.Group();g.name=p.name;g.userData.role=p.role;g.userData.source='Blender 4.0.2';g.position.set(...positions[i]);g.rotation.y=angles[i];const height=[1,.965,1.03,.985][i];g.scale.set(height*[1,.985,1.015,.97][i],height,height);for(const [gi,mi]of p.meshes){if(legacyFace.has(mi))continue;let geometry=geos[gi].clone();const vertices=geometry.getAttribute('position');
 // Retire the coarse legacy hair cap; the anatomical scalp shell below replaces it.
 if(mi===3){const kept=[],index=geometry.index;for(let t=0;t<index.count;t+=3){const face=[index.getX(t),index.getX(t+1),index.getX(t+2)];if(!face.every(v=>vertices.getY(v)>1.50))kept.push(...face);}geometry.setIndex(kept);}
 geometry.computeBoundingBox();const facePart=geometry.boundingBox.min.y>1.39;
 for(let v=0;v<vertices.count;v++){let x=vertices.getX(v),y=vertices.getY(v),z=vertices.getZ(v);
 // Keep the eyes, lenses and head together; shorten the exposed neck and fit the helmet.
 if(facePart){x*=1.045;y-=mi===7||mi===21?.040:.022;}
 else if(y>1.64){y-=.040;}
 // Preserve the stance but bring the boots back to a normal sole length/height.
 if(y<.23){const footCenter=x<0?-.095:.095;x=footCenter+(x-footCenter)*.94;z=-.06+(z+.06)*.84;y*=.90;}
 if([4,5,6].includes(mi)&&y>1.14){const fit=Math.min(1,(y-1.14)/.20);x*=1-.035*fit;z*=1-.045*fit;}
 if(mi===4&&y>1.31&&Math.abs(x)<.10&&z>.035)y-=.025*(1-Math.abs(x)/.10);
 vertices.setXYZ(v,x,y,z);}
 vertices.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
 const o=new T.Mesh(geometry,mats[mi]);if(geos[gi].getAttribute('color'))o.material.vertexColors=true;// The original yellow helmet was exported with a skin material.
 if(mi===7||mi===21)o.material=helmet;
 if(mi===3){const color=new Float32Array(vertices.count*3);for(let v=0;v<vertices.count;v++){const glove=vertices.getY(v)>.65&&vertices.getY(v)<1.30,c=glove?new T.Color('#c4bda8'):new T.Color('#222e34');color.set([c.r,c.g,c.b],v*3);}geometry.setAttribute('color',new T.BufferAttribute(color,3));o.material.color.set('#ffffff');o.material.vertexColors=true;}
 if(o.material.name.startsWith('Piel anatómica')){o.material.roughness=.67;o.material.emissive.copy(o.material.color).multiplyScalar(.045);
 const color=new Float32Array(vertices.count*3);for(let v=0;v<vertices.count;v++){const x=vertices.getX(v),y=vertices.getY(v),z=vertices.getZ(v),cheek=Math.exp(-((Math.abs(x)-.046)**2/.0005+(y-1.535)**2/.0008))*Math.max(0,Math.min(1,(z-.025)/.05)),beard=i%2===0&&y>1.455&&y<1.53&&z>.04?.055:0;color.set([1-beard,1-cheek*.055-beard,1-cheek*.08-beard],v*3);}geometry.setAttribute('color',new T.BufferAttribute(color,3));o.material.vertexColors=true;
 // A short hair shell follows the actual head topology instead of a floating primitive.
 const hairGeometry=geometry.clone(),pos=hairGeometry.getAttribute('position'),normal=hairGeometry.getAttribute('normal'),indices=hairGeometry.index,kept=[];
 for(let f=0;f<indices.count;f+=3){const ids=[indices.getX(f),indices.getX(f+1),indices.getX(f+2)];if(ids.every(v=>pos.getY(v)>1.585&&pos.getZ(v)<.018))kept.push(...ids);}
 hairGeometry.setIndex(kept);for(let v=0;v<pos.count;v++)pos.setXYZ(v,pos.getX(v)+normal.getX(v)*.0009,pos.getY(v)+normal.getY(v)*.0009,pos.getZ(v)+normal.getZ(v)*.0009);
 const hair=new T.Mesh(hairGeometry,new T.MeshStandardMaterial({color:i%2?'#29221e':'#352b23',roughness:.98}));hair.name='Cabello ajustado';hair.castShadow=true;g.add(hair);
 }
 if(o.material.name.startsWith('Esclerótica')){o.material.color.set('#d8cec0');o.material.roughness=.48;}
 o.castShadow=o.receiveShadow=true;g.add(o);}
 // Tailored workwear follows the body instead of a bulky collar and floating trim.
 const clothMat=new T.MeshStandardMaterial({color:'#294958',roughness:.96,normalMap:weave,normalScale:new T.Vector2(.12,.12)});
 detail(g,new T.CylinderGeometry(.062,.067,.034,28,1,true,.40,Math.PI*2-.80),clothMat,[0,1.399,.002]);
 const zipper=new T.MeshStandardMaterial({color:'#aeb7b6',roughness:.65,metalness:.3});detail(g,new T.BoxGeometry(.004,.29,.004),zipper,[0,1.17,.123]);
 for(let k=0;k<20;k++)detail(g,new T.BoxGeometry(.009,.002,.003),zipper,[0,1.03+k*.012,.127]);
 const pocketMat=new T.MeshStandardMaterial({color:'#b97832',roughness:.98});for(const x of [-.11,.11]){detail(g,new T.BoxGeometry(.070,.065,.004),pocketMat,[x,1.14,.121]);detail(g,new T.BoxGeometry(.074,.012,.005),pocketMat,[x,1.178,.124]);}
 // Equipment stays local to each person and shares geometry/materials where possible.
 const badgeMat=new T.MeshStandardMaterial({map:badgeTexture(i),roughness:.85});
 detail(g,new T.BoxGeometry(.075,.047,.004),badgeMat,[-.095,1.27,.133]);
 detail(g,new T.BoxGeometry(.045,.075,.025),radioMat,[.105,1.30,.137]);
 detail(g,new T.CylinderGeometry(.002,.002,.065,6),radioMat,[.119,1.37,.137]);
 detail(g,new T.BoxGeometry(.025,.006,.004),trimMat,[.105,1.31,.153]);
 // D36: fitted suspension band, no loose vertical strips beside the face.
 const band=detail(g,new T.CylinderGeometry(.084,.084,.014,32,1,true),visorFrame,[0,1.635,.004]);band.scale.z=1.10;

 const bounds=new T.Box3().setFromObject(g);g.position.y+=(i<2?-.07:6.65)-bounds.min.y;
 g.userData.presentation='D48 · anatomía conservada, uniforme entallado, collar, guantes y variación de piel';group.add(g);});status='ready';renderer.shadowMap.needsUpdate=true;return true;
 })().catch(error=>{status='error';console.error('Modelos de operarios:',error);return false;});
 const toggle=document.createElement('label');toggle.innerHTML='<input type="checkbox" checked> Mostrar operarios';document.querySelector('.route-controls .buttons').append(toggle);toggle.firstElementChild.onchange=()=>{group.visible=toggle.firstElementChild.checked;renderer.shadowMap.needsUpdate=true;};
 return{group,ready,count:()=>group.children.length,status:()=>status};
})();

// D24: reusable, physically scaled surface maps. No extra render loop or light.
