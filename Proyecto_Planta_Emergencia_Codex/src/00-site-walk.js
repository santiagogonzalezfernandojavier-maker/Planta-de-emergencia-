// Shared civil dimensions for the rendered stairs and walkable surfaces.
const SiteWalk37=(()=>{
 const stairs={x:-5.65,width:1.66,count:36,rise:6.5/36,tread:.28,startZ:4.07,bottom:-.07,top:6.50};
 const lowEdge=stairs.startZ+.145,highEdge=stairs.startZ-(stairs.count-1)*stairs.tread-.145;
 const half=stairs.width/2-.23,maxStep=.27;
 const opening={minX:stairs.x-stairs.width/2-.17,maxX:stairs.x+stairs.width/2+.17,minZ:highEdge-.30,maxZ:lowEdge+.135};
 const landings={bottom:{minZ:lowEdge,maxZ:5.77,width:2.10},top:{minZ:highEdge-1.20,maxZ:highEdge,width:stairs.width}};
 const basement=[[-2.55,2.10,-1,1.02],[2.13,2.85,.70,1.42],[-3.62,-2.80,-3.70,-.35],[-5.85,-3.85,-4,-2.20],[1,2.9,-4.12,-2.88],[4.05,5.35,.25,1.65],[-7.45,-6.35,-5.35,-4.25],[7.25,8.35,-5.35,-4.25],[-7.45,-6.35,4.25,5.35],[7.25,8.35,4.25,5.35]];
 const yard=[[10,13.2,2.45,5.15],[22.8,26,-1.90,.90],[17,18.8,-2.45,-.75],[17.55,19.25,.45,2.15],[19.9,21.7,-1.75,-.05],[10.35,12.95,-2.95,-1.80],[23.6,25.2,-6.2,-4.6],[12,12.45,-5.1,-4.6],[15.9,16.35,-5.1,-4.6]];
 const insideFlight=(x,z)=>Math.abs(x-stairs.x)<=half&&z>=highEdge&&z<=lowEdge;
 const blocked=(x,z,boxes,r=.18)=>boxes.some(b=>x>b[0]-r&&x<b[1]+r&&z>b[2]-r&&z<b[3]+r);
 function surface(x,z,currentFloor,serviceAccess=false){
  if(insideFlight(x,z)){const step=Math.min(stairs.count-1,Math.max(0,Math.floor((lowEdge-z)/stairs.tread)));return{height:(step+1)*stairs.rise,zone:'stairs',step:step+1};}
  // Landing bridges the last tread to the slab beyond the stair opening.
  if(Math.abs(x-stairs.x)<=half&&z<highEdge&&z>=landings.top.minZ&&currentFloor>6.20)return{height:6.50,zone:'yard',step:36};
  if(currentFloor>6.20){
   if(x< -8.05||x>26.95||z< -8.35||z>5.75)return null;
   // Radius clearance around the opening prevents walking through guard rails or falling in.
   if(x>opening.minX-.23&&x<opening.maxX+.23&&z>opening.minZ-.18&&z<opening.maxZ+.20)return null;
   if(Math.abs(x-9)<.24&&(z< -7.45||z> -5.95))return null;
   if(x>=9&&x<11.10&&Math.abs(z+7.65)<.22)return null; // Parked gate leaf.
   if(blocked(x,z,yard))return null;
   for(const px of [-6,2,11,18,25])for(const pz of [-6,4]){const actualX=px===-6?-7.45:px;if(Math.abs(x-actualX)<.42&&Math.abs(z-pz)<.42)return null;}
   return{height:x>=9?6.65:6.50,zone:'yard',step:null};
  }
  if(x< -7.5||x>8.45||z< -5.45||z>5.75)return null;
  if(x>-.49&&x<.79&&z>2.57&&z<3.53||blocked(x,z,serviceAccess?basement.filter((_,i)=>i!==2):basement))return null;
  return{height:-.07,zone:'plant',step:null};
 }
 function step(from,x,z,serviceAccess=false){const next=surface(x,z,from.floor,serviceAccess);if(!next||Math.abs(next.height-from.floor)>maxStep+1e-6)return null;
  // Entry/exit through the ends only: the side handrails are solid boundaries.
  if(z>=highEdge&&z<=lowEdge&&from.z>=highEdge&&from.z<=lowEdge&&insideFlight(from.x,from.z)!==insideFlight(x,z))return null;
  return next;
 }
 return{stairs,opening,landings,lowEdge,highEdge,half,maxStep,surface,step};
})();
