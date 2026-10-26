// Door access is an inventory rule, not a claim of electrical isolation.
const CabinetAccess38=(()=>{
 function check(_key,distance=0){return distance>2.8?{ok:false,message:'Acércate al gabinete para abrirlo.'}:{ok:true,message:''};}
 return{check};
})();
const CabinetParts38=[];
function articulateCabinet38(owner,{id,key,x,y,z,w,h,depth,type='control',openable=true,body,front}){
 const pivot=new T.Group(),leaf=new T.Group(),interior=new T.Group(),cover=new T.Group();
 pivot.name=id+' · bisagra';pivot.userData.noCompact=true;interior.userData.noCompact=true;
 owner.add(pivot,interior);pivot.position.set(x-w/2,y,z);pivot.add(leaf);
 owner.updateWorldMatrix(true,true);
 // Keep the original buttons, handles and labels on the moving door.
 for(const child of [...owner.children]){if(child===pivot||child===interior||!child.isMesh)continue;if(body?.(child)){child.visible=false;continue;}if(front?.(child))leaf.attach(child);}
 if(!leaf.children.length)box(leaf,[w,h,.025],[w/2,0,.015],mat('#aebbb7',.2));
 const paint=mat('#a6b3ad',.16),metal=mat('#9eaaa8',.7),rubber=mat('#273235'),back=z-depth;
 box(interior,[w,.018,depth],[x,y+h/2,z-depth/2],paint);box(interior,[w,.018,depth],[x,y-h/2,z-depth/2],paint);
 for(const dx of [-w/2,w/2])box(interior,[.018,h,depth],[x+dx,y,z-depth/2],paint);
 box(interior,[w,h,.018],[x,y,back],paint);box(interior,[w*.86,h*.86,.015],[x,y,back+.035],metal);
 for(const dx of [-w/2+.02,w/2-.02])box(interior,[.009,h-.03,.012],[x+dx,y,z+.006],rubber);
 // A distinct backplane for each function, with routed conductors and ferrules.
 const dz=back+.075,rows=type==='feeder'?2:3;
 for(let r=0;r<rows;r++){const yy=y+h*.27-r*h*.25;box(interior,[w*.76,.022,.035],[x,yy,dz],metal);}
 const dark=mat('#273238'),plastic=mat('#c5c9bd'),copper=mat('#b28351',.75);
 if(type==='feeder'){
  box(interior,[w*.48,h*.36,.10],[x,y+.10,dz+.05],dark);
  for(let j=0;j<3;j++){const xx=x+(j-1)*w*.15;box(interior,[w*.105,h*.22,.022],[xx,y+.10,dz+.114],plastic);cyl(interior,.012,.01,[xx,y+h*.28,dz+.12],copper,'z');tube(interior,[[xx,y+h*.40,dz],[xx,y+h*.28,dz+.12]],.010,dark);tube(interior,[[xx,y-h*.10,dz+.12],[xx,y-h*.35,dz]],.010,dark);}
  cabinetLabel20(interior,'MCCB · SALIDA BT',[x,y+.12,dz+.132],w*.42,.045);
 }else if(type==='dc'){
  box(interior,[w*.68,h*.24,.12],[x,y-h*.22,dz+.06],dark);cabinetLabel20(interior,'BATERÍA DC',[x,y-h*.22,dz+.126],w*.55,.045);box(interior,[w*.52,h*.23,.08],[x,y+h*.20,dz+.05],plastic);cabinetLabel20(interior,'CARGADOR',[x,y+h*.20,dz+.10],w*.48,.04);tube(interior,[[x-w*.18,y-h*.07,dz+.10],[x-w*.18,y+h*.07,dz+.10]],.008,mat('#a54c3d'));
 }else{
  const count=type==='mechanism'?2:3;
  for(let j=0;j<count;j++){const xx=x+(j-(count-1)/2)*w*.21;box(interior,[w*.17,h*.21,.07],[xx,y+.12,dz+.04],type==='mechanism'?dark:plastic);box(interior,[w*.11,h*.05,.012],[xx,y+.14,dz+.083],dark);}
  cabinetLabel20(interior,type==='transfer'?'RELÉS QN / QG':type==='mechanism'?'BOBINAS · MANDO':type==='protection'?'RELÉS / TC / TP':'FUENTES / CONTROL',[x,y-.08,dz+.08],w*.72,.045);
  for(let j=0;j<5;j++){const xx=x-w*.30+j*w*.15;box(interior,[w*.10,.065,.045],[xx,y-h*.30,dz+.04],plastic);cyl(interior,.004,.01,[xx,y-h*.30,dz+.07],metal,'z');tube(interior,[[xx,y+h*.33,dz],[x+w*.37,y+h*.33,dz],[x+w*.37,y-h*.20,dz],[xx,y-h*.20,dz],[xx,y-h*.28,dz+.07]],.003,mat(j%2?'#3b718b':'#b7986a'));}
 }
 // Separate inner deadfront; removing it never removes the equipment.
 interior.add(cover);cover.name=id+' · cubierta interior';
 const windowW=w*.58,windowH=h*.43;
 for(const sign of [-1,1]){box(cover,[(w-windowW)/2,h,.012],[x+sign*(w+windowW)/4,y,z-.035],paint);box(cover,[windowW,(h-windowH)/2,.012],[x,y+sign*(h+windowH)/4,z-.035],paint);}
 const windowMaterial=new T.MeshPhysicalMaterial({color:'#c4d9d5',transparent:true,opacity:.12,roughness:.18,depthWrite:false,side:T.DoubleSide});windowMaterial.userData.glass20=true;mesh(cover,new T.PlaneGeometry(windowW,windowH),windowMaterial,[x,y,z-.027]);
 for(const dx of [-w*.42,w*.42])for(const dy of [-h*.43,h*.43])cabinetFastener20(cover,[x+dx,y+dy,z-.02]);
 const hit=mesh(interior,new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}),[x,y,z-.025]);hit.name=id+' · área de cubierta';hit.userData.cover38=id;
 box(leaf,[w*.38,h*.19,.045],[w*.49,h*.20,-.043],dark);
 tube(leaf,[[w*.48,h*.10,-.069],[w*.18,h*.10,-.075],[.06,-h*.25,-.07]],.0035,mat('#596b77'));
 tube(pivot,[[.018,-h*.32,-.08],[.09,-h*.32,-.04],[.07,-h*.32,.02]],.003,mat('#54875b'));
 const entry={id,key,type,openable,owner,pivot,leaf,interior,cover,coverHit:hit,open:false,angle:0,target:0,covered:true};
 leaf.traverse(o=>{if(o.isMesh)o.userData.cabinet38=id;});CabinetParts38.push(entry);return entry;
}
