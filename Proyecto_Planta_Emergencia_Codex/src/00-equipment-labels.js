// Match the texture to the physical aspect ratio instead of stretching a 4:1 canvas.
const EquipmentLabels48=(()=>{
 const faces=new Set();
 function texture(text,w,h,foreground='#edf4f3',background='#203b46',border=true){
  const c=document.createElement('canvas'),ratio=w/h;
  c.width=w<.45?512:w<1.4?1024:2048;
  if(ratio>24)c.width=2048;
  c.height=Math.max(32,Math.round(c.width/ratio));
  const ctx=c.getContext('2d'),pad=Math.max(12,c.width*.025);
  ctx.fillStyle=background;ctx.fillRect(0,0,c.width,c.height);
  if(border){ctx.strokeStyle='#92a9af';ctx.lineWidth=Math.max(1,c.height*.012);ctx.strokeRect(4,4,c.width-8,c.height-8);}
  const luminance=c=>{const v=new T.Color(c);return .2126*v.r+.7152*v.g+.0722*v.b;},bg=luminance(background),contrast=c=>(Math.max(luminance(c),bg)+.05)/(Math.min(luminance(c),bg)+.05);if(contrast(foreground)<4.5)foreground=contrast('#10252d')>contrast('#ffffff')?'#10252d':'#ffffff';ctx.fillStyle=foreground;ctx.textAlign='center';ctx.textBaseline='middle';
  let size=c.height*.64;ctx.font='700 '+size+'px Arial';
  while(ctx.measureText(text).width>c.width-2*pad&&size>12)ctx.font='700 '+(--size)+'px Arial';
  ctx.fillText(text,c.width/2,c.height/2);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());
  map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;
  map.userData.label48=true;map.userData.contrast49=contrast(foreground);return map;
 }
 function face(parent,text,pos,w,h,foreground,background,border=true){
  const map=texture(text,w,h,foreground,background,border);
  const o=mesh(parent,new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,toneMapped:false}),pos);
  o.name='Identificación · '+text;o.userData.labelText=text;o.castShadow=o.receiveShadow=false;faces.add(o);return o;
 }
 function accessBoard(parent){const c=document.createElement('canvas');c.width=1024;c.height=1120;const x=c.getContext('2d');x.fillStyle='#f4f6f0';x.fillRect(0,0,1024,1120);x.fillStyle='#173d48';x.fillRect(32,32,960,170);x.fillStyle='#ffffff';x.font='700 67px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('SE-01 · ACCESO',512,118);x.fillStyle='#173d48';x.font='700 91px Arial';x.fillText('SUBESTACIÓN',512,360);x.font='700 132px Arial';x.fillText('13.8 kV',512,523);x.strokeStyle='#b5c5c7';x.lineWidth=3;x.beginPath();x.moveTo(78,652);x.lineTo(946,652);x.stroke();x.fillStyle='#eed16d';x.fillRect(32,720,960,368);x.fillStyle='#17323d';x.font='700 66px Arial';x.fillText('PASILLO',512,794);x.fillText('PEATONAL',512,880);x.lineWidth=22;x.strokeStyle='#17323d';x.lineJoin='round';x.beginPath();x.moveTo(512,1034);x.lineTo(512,958);x.moveTo(468,996);x.lineTo(512,952);x.lineTo(556,996);x.stroke();const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());map.minFilter=T.LinearMipmapLinearFilter;map.userData.label48=true;const o=mesh(parent,new T.PlaneGeometry(.70,.766),new T.MeshBasicMaterial({map,toneMapped:false}),[0,1.55,.032]);o.name='SE-01 · cartel de acceso legible';o.userData.labelText='SE-01 · ACCESO · SUBESTACIÓN 13.8 kV · PASILLO PEATONAL';o.castShadow=o.receiveShadow=false;return o;}
 return{texture,face,faces,accessBoard};
})();
