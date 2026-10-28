// Small construction details belong to their existing component, including anatomy/exploded views.
const MechanicalDetail49=(()=>{
 const steel49=new T.MeshStandardMaterial({color:'#b0b9b9',metalness:.86,roughness:.32});steel49.userData.hdFinish='steel';
 const seal49=new T.MeshStandardMaterial({color:'#20292b',roughness:.90});seal49.userData.hdFinish='rubber';
 const weld49=new T.MeshStandardMaterial({color:'#727d7c',metalness:.70,roughness:.58});weld49.userData.hdFinish='cast';
 let count=0;
 function detail(owner,title,create){if(!owner||owner.getObjectByName(title))return;const group=new T.Group();group.name=title;group.userData.visualDetail49=true;owner.add(group);create(group);group.traverse(o=>{if(!o.isMesh)return;o.userData.visualDetail49=true;o.userData.part=owner.userData.key;o.userData.piece=owner.userData.name;o.userData.original=o.material;count++;});}
 function ring(g,radius,thickness,position,axis='x',material=steel49){const r=mesh(g,new T.TorusGeometry(radius,thickness,6,32),material,position);if(axis==='x')r.rotation.y=Math.PI/2;else if(axis==='y')r.rotation.x=Math.PI/2;return r;}
 function fastener(g,position,axis='y',radius=.018){const q=new T.Group();g.add(q);q.position.set(...position);if(axis==='x')q.rotation.z=-Math.PI/2;if(axis==='z')q.rotation.x=Math.PI/2;cyl(q,radius*1.35,.004,[0,0,0],steel49);mesh(q,new T.CylinderGeometry(radius,radius,.014,6),steel49,[0,.009,0]);cyl(q,radius*.50,.004,[0,.018,0],seal49);}
 function installPlant(){
  const find=name=>pieces.find(p=>p.userData.name===name);
  detail(find('Radiador y mangueras'),'Abrazaderas de mangueras · D49',g=>{for(const [position,axis]of [[[-2.13,2.01,.42],'x'],[[-1.51,1.72,.5],'y'],[[-1.57,.67,-.48],'x']]){ring(g,.072,.005,position,axis);box(g,[.026,.019,.018],[position[0],position[1]+.076,position[2]],steel49);}});
  detail(find('Colector y silenciador'),'Juntas, bridas y soldaduras del escape · D49',g=>{for(const x of [.02,1.31]){cyl(g,.212,.021,[x,2.4,-.8],steel49,'x');ring(g,.191,.005,[x+.013,2.4,-.8],'x',seal49);for(let j=0;j<6;j++){const a=j*Math.PI/3;fastener(g,[x+.016,2.4+Math.sin(a)*.187,-.8+Math.cos(a)*.187],'x',.011);}}for(const x of [.13,1.15])ring(g,.192,.004,[x,2.4,-.8],'x',weld49);});
  detail(find('Perfiles, travesaños y apoyos'),'Arandelas y apoyos elastoméricos · D49',g=>{for(const x of [-1.6,.3,.9,2])for(const z of [-.5,.5]){ring(g,.105,.006,[x,.465,z],'y',seal49);fastener(g,[x,.669,z],'y',.025);}for(const x of [-2.7,2.7])for(const z of [-1.1,1.1]){fastener(g,[x,.073,z],'y',.027);ring(g,.05,.004,[x,.064,z],'y',weld49);}});
  detail(find('Tapas de válvulas y fundición'),'Junta de tapas y fijaciones superiores · D49',g=>{for(let j=0;j<2;j++){const x=-1.17+j*1.12;for(const z of [-.503,.503])box(g,[1.0,.008,.009],[x,1.991,z],seal49);for(const dx of [-.38,.38])for(const z of [-.39,.39])fastener(g,[x+dx,2.284,z],'y',.020);}});
 }
 installPlant();const oldBuild=build;build=function(){oldBuild();installPlant();};
 return{stats:()=>({meshesCreated:count}),fastener,ring};
})();
