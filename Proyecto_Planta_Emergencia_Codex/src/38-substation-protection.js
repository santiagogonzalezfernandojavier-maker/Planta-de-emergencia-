// Dedicated surge arresters and air terminals. No lightning-current or shielding calculation.
const ProtectionModel44=(()=>{
 const layout=ProtectionLayout44,outdoor=substation.yardCore.parent,sp=substation.referenceParts.surge;
 sp.clear();sp.name='Apartarrayos · llegada, TE y TP';
 const lightning=new T.Group();lightning.name='Pararrayos · cuatro mástiles de captación';outdoor.add(lightning);
 const steel=mat('#a7b6bd',.75),copper=mat('#b47d46',.78),dark=mat('#263d45'),polymer=mat('#a5aaa3'),concrete=mat('#9a9e91');
 const joints=new Map(),thermal=new T.Group();thermal.name='Lecturas térmicas simuladas · solo durante la inspección';outdoor.add(thermal);thermal.visible=false;
 function nuts(g,x,y,z,r=.075){for(let k=0;k<4;k++){const a=k*Math.PI/2;cyl(g,.009,.027,[x+Math.cos(a)*r,y,z+Math.sin(a)*r],steel);}}
 function joint(parent,id,point,front=1){const g=new T.Group();g.name=id+' · unión de prueba de bajante';g.userData.noCompact=true;g.position.set(...point);g.rotation.y=front<0?Math.PI:0;parent.add(g);box(g,[.23,.42,.034],[0,0,-.035],dark);
  for(const y of [-.14,.14]){box(g,[.09,.055,.028],[0,y,0],copper);cyl(g,.018,.026,[0,y,.025],steel,'z');}
  const pivot=new T.Group();g.add(pivot);pivot.position.set(0,-.14,.025);box(pivot,[.032,.28,.014],[0,.14,0],copper);cabinetLabel20(g,id,[0,-.27,.015],.33,.07);
  joints.set(id,{group:g,pivot,point:point.slice(),front,fault:false});return g;}
 for(const b of layout.banks){const g=new T.Group();g.name=b.id+' · '+b.equipment;sp.add(g);
  if(b.id==='AP-01'){
   for(const x of [10.6,12.7])for(const z of [-2.65,-2.05]){box(g,[.30,.14,.30],[x,6.73,z],concrete);cyl(g,.035,.95,[x,7.24,z],steel);nuts(g,x,6.84,z,.07);}box(g,[2.5,.10,.75],[11.65,7.74,-2.35],steel);
  }else{box(g,[1.68,.08,.32],[b.x,b.base-.09,b.z],steel);for(const dx of [-.66,.66]){box(g,[.065,.31,.31],[b.x+dx,b.base-.25,b.z-.12],steel);nuts(g,b.x+dx,b.base-.015,b.z,.065);}}
  for(const p of b.poles){const [x,y,z]=p.base,profile=[new T.Vector2(.052,.03)];
   for(let i=0;i<14;i++){const yy=.09+i*.056,r=i%2?.096:.117;profile.push(new T.Vector2(.052,yy),new T.Vector2(r*.90,yy+.008),new T.Vector2(r,yy+.018),new T.Vector2(.052,yy+.035));}profile.push(new T.Vector2(.050,.87));
   mesh(g,new T.LatheGeometry(profile,28),polymer,[x,y,z]);for(const dy of [0,.89]){cyl(g,.094,.045,[x,y+dy,z],steel);nuts(g,x,y+dy+.03,z,.070);}cyl(g,.020,.09,[x,y+.955,z],copper);
   const lug=box(g,[.14,.022,.07],[x,y+.98,z],copper);nuts(g,x,y+1.0,z,.042);lug.name=p.id+' · borne de fase';
   const height=Math.max(p.terminal[1],p.tip[1])+.18;tube(g,[p.terminal,[p.terminal[0],height,p.terminal[2]],[x,height,z],p.tip],.013,copper);
   tube(g,[[x,y+.01,z],[x,y-.07,z],[b.collector[0],y-.07,z],[b.collector[0],7.40,z]],.012,copper);
   cabinetLabel20(g,p.phase,[x,y-.18,z+.18],.15,.055,'#f1dfac','#263d45');
  }
  joint(g,b.id,b.collector);tube(g,[[b.collector[0],7.11,b.z],[b.collector[0],layout.gridY,b.z],b.gridTap],.014,copper);
  // Keep identification below the transformer's own label, on its support frame.
  for(const dx of [-.55,.55])box(g,[.025,.80,.025],[b.x+.24+dx,7.12,b.z+.28],steel);
  const identification=proPlate(g,b.id+' · '+b.equipment,[b.x+.24,7.46,b.z+.31],1.50,'#203e49',.16);identification.userData.equipment48=b.id;
  batchStaticGeometry(g);
 }
 for(const m of layout.masts){const g=new T.Group();g.name=m.id+' · punta captora, mástil y bajante';lightning.add(g);box(g,[.90,.32,.90],[m.x,6.78,m.z],concrete);
  const leg=(y,k)=>{const radius=.30-(y-m.foot)/(m.head-m.foot)*.23,a=k*Math.PI*2/3;return[m.x+Math.cos(a)*radius,y,m.z+Math.sin(a)*radius];};
  for(let k=0;k<3;k++){tube(g,[leg(m.foot,k),leg(m.head,k)],.025,steel);const p=leg(m.foot,k);box(g,[.22,.04,.22],[p[0],6.96,p[2]],steel);nuts(g,p[0],7.0,p[2],.065);}
  for(let n=0;n<9;n++){const y0=m.foot+n*(m.head-m.foot)/9,y1=m.foot+(n+1)*(m.head-m.foot)/9;for(let k=0;k<3;k++){tube(g,[leg(y0,k),leg(y0,(k+1)%3)],.014,steel);tube(g,[leg(y0,k),leg(y1,(k+1)%3)],.012,steel);}}
  cyl(g,.040,1.48,[m.x,19.14,m.z],copper);mesh(g,new T.ConeGeometry(.040,.22,16),copper,[m.x,19.99,m.z]);
  tube(g,[[m.x,18.40,m.z],[m.joint[0],18.40,m.joint[2]],[m.joint[0],7.39,m.joint[2]]],.014,copper);
  for(let y=8;y<18;y+=1.5)box(g,[.10,.025,.06],[m.joint[0],y,m.joint[2]],steel);
  joint(g,m.id,m.joint,m.front);tube(g,[[m.joint[0],7.11,m.joint[2]],[m.joint[0],layout.gridY,m.joint[2]],m.gridTap],.015,copper);
  const plate=cabinetLabel20(g,m.id+' · PARARRAYOS',[m.x,8.05,m.z+m.front*.29],.75,.17,'#fff0bd','#294751');if(m.front<0)plate.rotation.y=Math.PI;
  batchStaticGeometry(g);
 }
 for(let i=0;i<layout.masts.length;i++){const a=layout.masts[i],b=layout.masts[(i+1)%4];tube(lightning,[[a.x,a.head,a.z],[(a.x+b.x)/2,18.05,(a.z+b.z)/2],[b.x,b.head,b.z]],.017,steel);}
 for(const bank of layout.banks.filter(b=>b.id!=='AP-01'))for(let i=0;i<3;i++){const p=bank.terminals[i],spot=mesh(thermal,new T.SphereGeometry(.10,14,10),new T.MeshBasicMaterial({color:bank.id==='AP-TP'&&i===1?'#ff6938':'#63bcac',transparent:true,opacity:.85}),p);spot.name=bank.id+' · '+bank.poles[i].phase+' · lectura térmica';}
 SurfaceRealism.finishScene(sp);SurfaceRealism.finishScene(lightning);
 function setFault(id,on){const j=joints.get(id);if(!j)return false;j.fault=!!on;j.pivot.rotation.z=on?-.95:0;renderer.shadowMap.needsUpdate=true;return true;}
 return{surge:sp,lightning,joints,thermal,setFault,layout};
})();
