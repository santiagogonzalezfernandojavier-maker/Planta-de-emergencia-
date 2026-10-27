// Match the texture to the physical aspect ratio instead of stretching a 4:1 canvas.
const EquipmentLabels48=(()=>{
 const faces=new Set();
 function texture(text,w,h,foreground='#edf4f3',background='#203b46',border=true){
  const c=document.createElement('canvas'),ratio=w/h;
  c.width=w<.45?512:w<1.4?1024:1536;
  if(ratio>24)c.width=2048;
  c.height=Math.max(32,Math.round(c.width/ratio));
  const ctx=c.getContext('2d'),pad=Math.max(12,c.width*.025);
  ctx.fillStyle=background;ctx.fillRect(0,0,c.width,c.height);
  if(border){ctx.strokeStyle='#92a9af';ctx.lineWidth=Math.max(1,c.height*.012);ctx.strokeRect(4,4,c.width-8,c.height-8);}
  ctx.fillStyle=foreground;ctx.textAlign='center';ctx.textBaseline='middle';
  let size=c.height*.50;ctx.font='600 '+size+'px Arial';
  while(ctx.measureText(text).width>c.width-2*pad&&size>12)ctx.font='600 '+(--size)+'px Arial';
  ctx.fillText(text,c.width/2,c.height/2);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;
  map.userData.label48=true;return map;
 }
 function face(parent,text,pos,w,h,foreground,background,border=true){
  const map=texture(text,w,h,foreground,background,border);
  const o=mesh(parent,new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,toneMapped:false}),pos);
  o.name='Identificación · '+text;o.userData.labelText=text;o.castShadow=o.receiveShadow=false;faces.add(o);return o;
 }
 return{texture,face,faces};
})();
