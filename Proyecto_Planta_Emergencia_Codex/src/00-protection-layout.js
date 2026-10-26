// Protection locations are shared by the model, inspection route and collision checks.
const ProtectionLayout44=(()=>{
 const gridY=5.875;
 const banks=[
  {id:'AP-01',equipment:'Llegada de red',x:11.63,z:-2.35,spacing:.78,base:7.86,gridX:12.6,terminals:[0,1,2].map(j=>[13.1+j*.95,9.38,-3.60])},
  {id:'AP-TE',equipment:'Elevador TE · lado MT',x:11.6,z:4.95,spacing:.53,base:8.43,gridX:12.6,terminals:[0,1,2].map(j=>[11.07+j*.53,8.90,3.60])},
  {id:'AP-TP',equipment:'Principal TP · lado MT',x:24.4,z:.55,spacing:.53,base:8.43,gridX:23.4,terminals:[0,1,2].map(j=>[23.87+j*.53,8.90,-.80])}
 ].map(b=>({...b,collector:[b.x-b.spacing-.30,7.22,b.z],gridTap:[b.gridX,gridY,b.z],poles:b.terminals.map((terminal,j)=>({id:b.id+'-L'+(j+1),phase:'L'+(j+1),base:[b.x+(j-1)*b.spacing,b.base,b.z],tip:[b.x+(j-1)*b.spacing,b.base+.98,b.z],terminal}))}));
 const masts=[[9.6,-7.9],[26.6,-7.9],[26.6,5.5],[9.6,5.5]].map(([x,z],i)=>({id:'PC-0'+(i+1),x,z,front:z<0?1:-1,foot:6.96,head:18.40,tip:20.10,joint:[x+.19,7.25,z+(z<0?.23:-.23)],gridTap:[x<18?9:27,gridY,z]}));
 const mastBounds=masts.map(m=>[m.x-.45,m.x+.45,m.z-.45,m.z+.45]);
 return{banks,masts,mastBounds,gridY,scope:'Representación didáctica; Ur/MCOV, coordinación de aislamiento y cobertura de captación pendientes de ingeniería.'};
})();
