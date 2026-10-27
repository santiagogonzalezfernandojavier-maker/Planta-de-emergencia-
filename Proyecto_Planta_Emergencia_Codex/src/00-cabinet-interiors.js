// Original, manufacturer-independent layouts for NEXORA educational equipment.
const CabinetInterior48=(()=>{
 function create({interior,leaf,pivot,id,type,x,y,z,w,h,back}){
  const fixed=new T.Group();fixed.name=id+' · montaje funcional interior';interior.add(fixed);
  const metal=mat('#a8b5b7',.75),dark=mat('#27353c'),plastic=mat('#d7d9d0'),blue=mat('#325d7b'),copper=mat('#ad7d49',.75),green=mat('#40875d'),red=mat('#b84b40');
  const depth=back+.10;
  function part(name){const g=new T.Group();g.name=id+' · '+name;g.userData.cabinetRole48=name;fixed.add(g);return g;}
  function wire(g,points,color=blue,r=.0025){return tube(g,points,r,color);}
  function rail(yy){box(fixed,[w*.80,.018,.026],[x,yy,depth],metal);}
  function label(g,text,xx,yy,zz,width=w*.66){return cabinetLabel20(g,text,[xx,yy,zz],width,Math.min(.032,h*.055));}
  function terminal(g,xx,yy,tag,color=plastic){box(g,[w*.071,h*.078,.045],[xx,yy,depth+.035],color);cyl(g,.005,.005,[xx,yy,depth+.061],metal,'z');label(g,tag,xx,yy-h*.065,depth+.067,w*.075);}
  function duct(xx){const g=part('Canaleta ranurada');box(g,[w*.075,h*.79,.035],[xx,y,depth+.004],plastic);for(let j=0;j<14;j++)box(g,[w*.058,.008,.006],[xx,y-h*.35+j*h*.05,depth+.025],dark);}
  duct(x-w*.43);duct(x+w*.43);
  let cam=null;
  if(type==='mechanism'){
   const springs=part('Resorte de acumulación de energía');
   rail(y+h*.26);
   for(const yy of [y+h*.18,y+h*.31]){
    const points=[];for(let i=0;i<=150;i++){const t=i/150,a=t*Math.PI*24;points.push([x-w*.22+t*w*.43,yy+Math.cos(a)*h*.037,depth+.07+Math.sin(a)*h*.037]);}
    wire(springs,points,metal,.004);for(const sign of [-1,1])box(springs,[.024,.055,.075],[x+sign*w*.24,yy,depth+.065],dark);
   }
   label(springs,'RESORTES DE CARGA',x,y+h*.41,depth+.09,w*.72);
   const motor=part('Motor y reductor de carga');cyl(motor,w*.08,.10,[x-w*.25,y-h*.05,depth+.07],blue,'z');cyl(motor,w*.065,.014,[x-w*.25,y-h*.05,depth+.127],metal,'z');box(motor,[w*.18,h*.18,.07],[x-w*.11,y+h*.01,depth+.055],metal);
   label(motor,'M · CARGA',x-w*.22,y-h*.19,depth+.13,w*.34);
   cam=new T.Group();cam.name=id+' · leva de accionamiento';interior.add(cam);cam.position.set(x,y+h*.04,depth+.105);
   cyl(cam,w*.10,.022,[0,0,0],metal,'z');box(cam,[w*.21,.025,.025],[w*.05,0,.018],dark);cyl(cam,.010,.025,[w*.14,0,.023],copper,'z');
   wire(fixed,[[x,y+h*.10,depth+.085],[x,y+h*.43,depth+.085],[x,y+h*.50,back+.18]],metal,.010);
   const coils=part('Bobinas de cierre y disparo');for(const [j,name] of [[0,'Y1 CIERRE'],[1,'Y2 DISPARO']]){const xx=x-w*.12+j*w*.23;box(coils,[w*.17,h*.14,.07],[xx,y-h*.20,depth+.055],dark);for(let k=0;k<6;k++)box(coils,[w*.15,.004,.008],[xx,y-h*.24+k*.009,depth+.095],copper);label(coils,name,xx,y-h*.31,depth+.10,w*.23);wire(coils,[[xx,y-h*.25,depth+.09],[xx,y-h*.39,depth+.04]],j?red:blue);}
   const aux=part('Contactos auxiliares 52a y 52b');box(aux,[w*.16,h*.20,.065],[x+w*.27,y+h*.02,depth+.06],plastic);for(let j=0;j<3;j++)box(aux,[w*.12,.009,.006],[x+w*.27,y-h*.04+j*.035,depth+.098],dark);label(aux,'52a / 52b',x+w*.26,y-h*.13,depth+.10,w*.27);
   const terminals=part('X1 · bornera de mando');rail(y-h*.39);for(let j=0;j<7;j++)terminal(terminals,x-w*.27+j*w*.09,y-h*.39,String(j+1),j===6?green:plastic);
   const rear=leaf;for(const [dx,dy]of [[-.15,-.13],[.02,-.12],[.12,-.12]])cyl(rear,.023,.07,[w/2+dx,dy,-.055],dark,'z');
   wire(leaf,[[w/2-.15,-.13,-.10],[.07,-.13,-.10],[.018,-h*.30,-.08]],blue);
  }else{
   const fuses=part('Protección y alimentación auxiliar DC');rail(y+h*.29);
   for(let j=0;j<4;j++){const xx=x-w*.24+j*w*.15;box(fuses,[w*.11,h*.14,.06],[xx,y+h*.29,depth+.035],plastic);box(fuses,[w*.055,h*.045,.009],[xx,y+h*.30,depth+.071],dark);label(fuses,'F'+(j+1),xx,y+h*.18,depth+.078,w*.12);}
   const relays=part('Relés auxiliares de disparo y cierre');rail(y+h*.04);
   for(let j=0;j<2;j++){const xx=x-w*.19+j*w*.31;box(relays,[w*.22,h*.16,.08],[xx,y+h*.055,depth+.05],dark);box(relays,[w*.17,h*.12,.006],[xx,y+h*.055,depth+.094],blue);label(relays,'K'+(j+1),xx,y+h*.055,depth+.10,w*.15);}
   const ct=part('X1 · bloque de prueba TC con puentes');rail(y-h*.17);
   for(let j=0;j<6;j++){const xx=x-w*.29+j*w*.075;terminal(ct,xx,y-h*.17,String(j+1),j%2?plastic:mat('#b9aa52'));if(j%2===0)box(ct,[w*.10,.009,.016],[xx+w*.036,y-h*.145,depth+.072],copper);}
   label(ct,'X1 · TC · CORTOCIRCUITABLE',x-w*.08,y-h*.08,depth+.09,w*.66);
   const vt=part('X2 · bornes seccionables de tensión');for(let j=0;j<3;j++)terminal(vt,x+w*.19+j*w*.075,y-h*.17,String(j+1));
   const terminalStrip=part('X3 · mando, alarmas y señalización');rail(y-h*.35);for(let j=0;j<9;j++)terminal(terminalStrip,x-w*.31+j*w*.078,y-h*.35,String(j+1));
   label(terminalStrip,'X3 · MANDO / ALARMAS',x,y-h*.43,depth+.09,w*.70);
   // The IED is installed in the door. The interior contains its rear connectors,
   // not current or voltage transformers squeezed into a control cabinet.
   const ied=new T.Group();ied.name=id+' · parte posterior del relé digital IED';ied.userData.cabinetRole48='IED en puerta';leaf.add(ied);
   box(ied,[w*.56,h*.22,.13],[w/2,h*.28,-.085],dark);for(let j=0;j<3;j++){box(ied,[w*.14,.048,.024],[w*.31+j*w*.18,h*.16,-.157],green);for(let k=0;k<3;k++)cyl(ied,.004,.006,[w*.27+j*w*.18+k*w*.04,h*.16,-.172],metal,'z');}
   label(ied,'IED-01 · NEXORA',w/2,h*.28,-.154,w*.47).rotation.y=Math.PI;
   wire(leaf,[[w*.30,h*.16,-.18],[.07,h*.16,-.18],[.018,-h*.32,-.08]],blue,.004);
  }
  // Routed conductors end at equipment and numbered terminal blocks.
  for(let j=0;j<6;j++){const xx=x-w*.25+j*w*.09,edge=x+(j%2?1:-1)*w*.36;
   wire(fixed,[[xx,y+h*.26,depth+.075],[edge,y+h*.26,depth+.075],[edge,y-h*.34,depth+.075],[xx,y-h*.34,depth+.075]],j%2?blue:red,.0025);
  }
  const pe=part('Barra PE y enlace de puerta');box(pe,[w*.64,.024,.025],[x,y-h*.465,depth+.06],copper);
  for(const sign of [-1,1])cyl(pe,.008,.009,[x+sign*w*.23,y-h*.465,depth+.078],metal,'z');
  wire(pe,[[x-w*.23,y-h*.465,depth+.075],[x-w*.46,y-h*.465,depth+.075],[x-w*.46,y-h*.32,z-.07]],green,.0035);
  wire(leaf,[[w*.20,-h*.37,-.025],[.035,-h*.37,-.045],[.012,-h*.32,-.07]],green,.0035);
  cyl(leaf,.008,.009,[w*.20,-h*.37,-.018],metal,'z');
  return{fixed,cam,type};
 }
 function guard(cover,{x,y,z,w,h,type}){
  const height=h*(type==='mechanism'?.15:.38),cy=y-h*(type==='mechanism'?.37:.24),width=w*.84;
  const material=new T.MeshPhysicalMaterial({color:'#d0e5e2',transparent:true,opacity:.12,roughness:.22,depthWrite:false,side:T.DoubleSide});material.userData.glass20=true;
  mesh(cover,new T.PlaneGeometry(width,height),material,[x,cy,z-.04]);
  const edge=mat('#758c8e',.5);for(const dx of [-width/2,width/2])box(cover,[.010,height,.018],[x+dx,cy,z-.045],edge);
  for(const dy of [-height/2,height/2])box(cover,[width,.010,.018],[x,cy+dy,z-.045],edge);
  for(const dx of [-width*.46,width*.46])cabinetFastener20(cover,[x+dx,cy,z-.032]);
  return{width,height,y:cy};
 }
 function update(entry,closed){if(entry.assembly48?.cam)entry.assembly48.cam.rotation.z=closed?.45:-.35;}
 return{create,guard,update};
})();
