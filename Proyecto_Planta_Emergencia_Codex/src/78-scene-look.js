// Cached reflection environments and local shadow framing; uses the existing light and RAF.
const SceneLook49=(()=>{
 SurfaceRealism.finishScene(scene);
 const generator=new T.PMREMGenerator(renderer),room=new T.Scene();room.background=new T.Color('#263239');
 function surface(size,position,rotation,color){const material=new T.MeshBasicMaterial({color,side:T.DoubleSide,toneMapped:false}),mesh=new T.Mesh(new T.PlaneGeometry(...size),material);mesh.position.set(...position);mesh.rotation.set(...rotation);room.add(mesh);return material;}
 const shell=new T.Mesh(new T.BoxGeometry(14,8,12),new T.MeshBasicMaterial({color:'#48504e',side:T.BackSide}));room.add(shell);
 surface([14,12],[0,-3.95,0],[-Math.PI/2,0,0],'#232a2c');
 for(const z of [-3,1.5])surface([6,.65],[0,3.8,z],[Math.PI/2,0,0],'#ffffff').color.setRGB(3.5,3.3,2.9);
 surface([4,2.2],[-6.9,1,0],[0,Math.PI/2,0],'#d5eaff').color.setRGB(1.1,1.5,1.8);
 surface([.65,5],[6.9,0,2],[0,-Math.PI/2,0],'#819697');
 const indoor=generator.fromScene(room,.06,.1,80);room.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
 const w=512,h=256,pixels=new Float32Array(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=y/h,sky=v<.52,t=Math.min(1,v/.52),sun=Math.exp(-((x/w-.30)**2/.003+(v-.29)**2/.005));const color=sky?[.28+.55*t,.50+.46*t,.82+.36*t]:[.18,.19,.16];for(let c=0;c<3;c++)pixels[(y*w+x)*4+c]=color[c]+sun*[5,4.3,3.3][c];pixels[(y*w+x)*4+3]=1;}
 const environment=new T.DataTexture(pixels,w,h,T.RGBAFormat,T.FloatType);environment.mapping=T.EquirectangularReflectionMapping;environment.needsUpdate=true;const outdoor=generator.fromEquirectangular(environment);environment.dispose();generator.dispose();
 let signature='',shadowKey='';
 const sunOffset=new T.Vector3(-15,26,19),focus=new T.Vector3();
 function frameLook(){
  const walk=Walk31.state(),inspection=EquipmentInspector48.state(),data=inspection.active?EquipmentInspector48.data(inspection.selected):null;
  const inHouse=walk.active&&walk.zone==='yard'&&walk.position[0]>22.8&&walk.position[0]<26&&walk.position[2]<-4.4&&walk.position[2]>-6.9;const inside=inHouse|| (inspection.active?['Planta de emergencia','Interior de fábrica'].includes(data.zone):walk.active?['plant','ccm'].includes(walk.zone):campusNav.mode==='basement');
  const powered=!!circuitState().bus,key=[inside,isNight,powered].join('|');
  scene.environment=(inside?indoor:outdoor).texture;scene.environmentIntensity=inside?(powered?(isNight?.42:.48):.045):(isNight?.065:.50);
  if(key!==signature){signature=key;for(const o of scene.children)if(o.isHemisphereLight)o.intensity=isNight?.19:.64;light.intensity=isNight?.28:2.65;rim.intensity=isNight?.10:.35;}
  if(walk.active||inspection.active){focus.copy(inspection.active?campusNav.target:camera.position);focus.y=inside?(inHouse?8:focus.x>60?3.8:1.8):8;}
  else focus.copy(campusNav.target);
  const radius=walk.active||inspection.active?(inside?12:18):55,cell=[Math.round(focus.x/4)*4,Math.round(focus.y/2)*2,Math.round(focus.z/4)*4],next=[...cell,radius].join('|');
  if(next!==shadowKey){shadowKey=next;light.target.position.set(...cell);light.position.copy(light.target.position).add(sunOffset);Object.assign(light.shadow.camera,{left:-radius,right:radius,top:radius,bottom:-radius,near:.5,far:120});light.shadow.camera.updateProjectionMatrix();light.shadow.normalBias=.006;light.shadow.bias=-.00004;light.shadow.radius=2;renderer.shadowMap.needsUpdate=true;}
 }
 const contactCanvas=document.createElement('canvas');contactCanvas.width=contactCanvas.height=128;const ctx=contactCanvas.getContext('2d'),data=ctx.createImageData(128,128);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){const d=Math.pow(Math.pow(Math.abs(x/63.5-1),4)+Math.pow(Math.abs(y/63.5-1),4),.25),alpha=Math.max(0,1-d);data.data[(y*128+x)*4+3]=Math.pow(alpha,.6)*145;}ctx.putImageData(data,0,0);
 const contactTexture=new T.CanvasTexture(contactCanvas);contactTexture.userData.sharedFinish=true;
 function contact(owner,position,width,depth,opacity=.35){const material=new T.MeshBasicMaterial({color:'#000000',map:contactTexture,transparent:true,opacity,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});const m=new T.Mesh(new T.PlaneGeometry(width,depth),material);m.name='Sombra de contacto suave · D49';m.userData.contact49=true;m.rotation.x=-Math.PI/2;m.position.set(...position);m.castShadow=m.receiveShadow=false;owner.add(m);return m;}
 const foundation=new T.Group();foundation.name='Apoyo visual de equipos · D49';substation.site.add(foundation);
 contact(foundation,[0,-.064,0],6.8,3.4,.30);
 for(const [x,z,width,depth]of [[11.6,3.6,3.1,2.4],[24.4,-.8,3.1,2.4],[18.4,1.3,2,1.9],[17.9,-1.6,2,1.9],[20.8,-.9,2,1.9]])contact(foundation,[x,6.655,z],width,depth,.28);
 for(const cell of latheCells)contact(cell,[0,-.003,0],5.5,2.9,.28);
 Personnel.ready.then(()=>{for(const person of Personnel.group.children){const bounds=new T.Box3().setFromObject(person),center=bounds.getCenter(new T.Vector3());contact(foundation,[center.x,bounds.min.y+.004,center.z],.62,.55,.38);}});
 const oldFrame=CCM34.frame;CCM34.frame=function(dt){oldFrame(dt);frameLook();};frameLook();
 const oldTimeOfDay=applyTimeOfDay;applyTimeOfDay=function(){oldTimeOfDay();signature='';frameLook();};
 return{frame:frameLook,stats:()=>({environment:scene.environment===indoor.texture?'interior':'exterior',cachedEnvironments:2,environmentIntensity:scene.environmentIntensity,shadowSpan:light.shadow.camera.right-light.shadow.camera.left,contactShadows:foundation.children.length})};
})();
window.SceneLook49=SceneLook49;
(()=>{const label=document.createElement('label');label.htmlFor='visualQuality49';label.innerHTML='Calidad visual <select id="visualQuality49"><option value="fluid">Fluido · texturas 512 px</option><option value="detail">Detalle · texturas 1024 px</option></select>';$('walkGameMenu').querySelector('.walk-menu-card').append(label);const old=Performance33.setMode;Performance33.setMode=function(mode){old(mode);$('quality33').value=Performance33.mode();$('visualQuality49').value=Performance33.mode();};$('visualQuality49').onchange=e=>Performance33.setMode(e.target.value);})();
