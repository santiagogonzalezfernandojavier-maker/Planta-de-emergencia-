// Fixed-length two-bone solver, independent of rendering and scene coordinates.
const PlayerMotion43=(()=>{
 const upper=.30,lower=.27;
 const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),mul=(a,k)=>a.map(v=>v*k),add=(a,b)=>a.map((v,i)=>v+b[i]);
 function solve(shoulder,target,pole,l1=upper,l2=lower){const delta=sub(target,shoulder),requested=Math.hypot(...delta),axis=requested>1e-8?mul(delta,1/requested):[0,0,-1],distance=Math.max(Math.abs(l1-l2)+.002,Math.min(l1+l2-.003,requested));
  let bend=sub(sub(pole,shoulder),mul(axis,dot(sub(pole,shoulder),axis)));if(Math.hypot(...bend)<1e-6){const fallback=Math.abs(axis[1])<.9?[0,-1,0]:[1,0,0];bend=sub(fallback,mul(axis,dot(fallback,axis)));}bend=mul(bend,1/Math.hypot(...bend));
  const along=(l1*l1-l2*l2+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,l1*l1-along*along));
  return{shoulder:shoulder.slice(),elbow:add(add(shoulder,mul(axis,along)),mul(bend,height)),wrist:add(shoulder,mul(axis,distance)),requested,reachable:requested<=l1+l2-.003};
 }
 function envelope(age,continuous){const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};return continuous?smooth(age/.22):age<.22?smooth(age/.22):age<.48?1:1-smooth((age-.48)/.30);}
 return{upper,lower,solve,envelope};
})();
