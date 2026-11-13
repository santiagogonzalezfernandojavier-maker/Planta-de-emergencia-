// v12.25 · Entorno menos «de dibujo»: cielo con bruma, sol y nubes; pasto con manchas naturales; arbolado alrededor.
(function(){
 try{
 const GY=typeof gradeY==='number'?gradeY:6.5;
 let seed=90417;const R=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 // ---------- Cielo ----------
 const oldU=sky.material.uniforms,sunDir=new T.Vector3().copy(light.position).sub(light.target.position).normalize();sunDir.y=Math.max(.32,sunDir.y*.55);sunDir.normalize();
 sky.material=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:{top:oldU.top,bottom:oldU.bottom,sun:{value:sunDir},center:{value:sky.position}},
  vertexShader:'varying vec3 wp;void main(){wp=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform vec3 top;uniform vec3 bottom;uniform vec3 sun;uniform vec3 center;varying vec3 wp;
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+vec2(17.3,9.1);a*=.5;}return s;}
void main(){vec3 d=normalize(wp-center);float day=clamp(top.b*2.2,0.,1.);
 float up=clamp(d.y,0.,1.);
 vec3 zen=mix(top,top*vec3(.62,.78,1.02),up);            // el cenit, algo más profundo
 vec3 col=mix(bottom,zen,pow(up,.42));                    // bruma clara en el horizonte
 float sd=max(dot(d,sun),0.);
 col+=day*(vec3(1.,.93,.78)*pow(sd,900.)*3.+vec3(1.,.9,.72)*pow(sd,12.)*.22+vec3(.9,.88,.8)*pow(sd,3.)*.08);
 if(d.y>0.005){vec2 q=d.xz/(d.y+.18)*1.55;float c=fbm(q+vec2(3.1,1.7));float cov=smoothstep(.50,.78,c)*smoothstep(.0,.16,d.y);
  vec3 cc=mix(vec3(.74,.78,.84),vec3(1.),smoothstep(.55,.9,c))*(.25+.75*day)+vec3(.02,.03,.06)*(1.-day);
  col=mix(col,cc,cov*(.82*day+.35*(1.-day)));
  float st=step(.9965,h2(floor(d.xz/(d.y+.4)*190.)))*(1.-day)*(1.-cov)*smoothstep(.05,.3,d.y);col+=vec3(st*.8);}
 gl_FragColor=vec4(pow(col,vec3(1./2.2)),1.);}`});
 // ---------- Pasto: manchas grandes para romper la repetición ----------
 groundMat.onBeforeCompile=sh=>{
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWp80;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWp80=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vWp80;float h80(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n80(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h80(i),h80(i+vec2(1,0)),f.x),mix(h80(i+vec2(0,1)),h80(i+vec2(1,1)),f.x),f.y);}`)
   .replace('#include <map_fragment>',`#include <map_fragment>
{float a=n80(vWp80.xz*.021),b=n80(vWp80.xz*.083+7.3),c=n80(vWp80.xz*.9+2.1);float m=a*.6+b*.4;
 vec3 seco=vec3(1.12,1.02,.74),verde=vec3(.60,.84,.50),tierra=vec3(.95,.82,.66);
 vec3 t=mix(verde,seco,smoothstep(.34,.70,m));t=mix(t,tierra,smoothstep(.74,.9,b)*.55);
 diffuseColor.rgb*=t*(.9+.2*c);}`);};
 groundMat.customProgramCacheKey=()=>'pasto80';groundMat.needsUpdate=true;
 // ---------- Arbolado ----------
 scene.updateMatrixWorld(true);
 const boxes=[],bb=new T.Box3(),sz=new T.Vector3();
 for(const o of scene.children){if(o===landscapeWorld||o.isLight||o.isCamera||!o.visible&&!o.children.length)continue;bb.makeEmpty();
  try{bb.setFromObject(o);}catch(e){continue;}if(bb.isEmpty())continue;bb.getSize(sz);if(sz.x>420||sz.z>420)continue;boxes.push(bb.clone().expandByScalar(7));}
 const free=(x,z)=>{for(const b of boxes)if(x>b.min.x&&x<b.max.x&&z>b.min.z&&z<b.max.z)return false;return true;};
 function canopy(lobes,detail){const base=new T.IcosahedronGeometry(1,detail).toNonIndexed().attributes.position,P=[],N=[],C=[],A=new T.Vector3(),B=new T.Vector3(),Cc=new T.Vector3(),fn=new T.Vector3(),n=new T.Vector3(),tri=[A,B,Cc];
  let top=0;for(const l of lobes)top=Math.max(top,l[1]+l[3]);
  for(const [ox,oy,oz,r] of lobes)for(let i=0;i<base.count;i+=3){
   for(let k=0;k<3;k++){const v=tri[k];v.fromBufferAttribute(base,i+k);const w=1+.22*Math.sin(v.x*5.1+ox*3.)*Math.cos(v.y*4.3+oz)+.14*Math.sin(v.z*7.7+oy*2.);v.multiplyScalar(r*w);v.y*=.86;v.x+=ox;v.y+=oy;v.z+=oz;}
   fn.subVectors(B,A).cross(n.subVectors(Cc,A)).normalize();const tone=.72+R()*.5; /* cada cara con su tono: se lee como follaje, no como globo */
   for(const v of tri){P.push(v.x,v.y,v.z);n.set(v.x,(v.y-(top-2.2))*1.1,v.z).normalize().lerp(fn,.55).normalize();N.push(n.x,n.y,n.z);
    const sh=Math.min(1,Math.max(0,(v.y-(top-3.6))/3.4)),g=(.34+.66*sh)*tone;C.push(.105*g,.235*g,.062*g);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('normal',new T.Float32BufferAttribute(N,3));g.setAttribute('color',new T.Float32BufferAttribute(C,3));return g;}
 const leafMat=new T.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}),barkMat=new T.MeshStandardMaterial({color:'#3a2c20',roughness:1});
 const trunkGeo=new T.CylinderGeometry(.09,.19,3.4,7);trunkGeo.translate(0,1.7,0);
 const nearGeo=canopy([[0,4.6,0,1.45],[.95,3.9,.3,1.1],[-.8,4.0,-.6,1.15],[.15,3.8,1.0,1.0],[-.3,5.4,.1,1.0],[.5,4.9,-.8,.95],[-.9,4.7,.7,.9]],1),farGeo=canopy([[0,2.5,0,1.9],[.7,3.4,-.2,1.2]],1);
 const sectors=Array.from({length:8},()=>[]),far=[];let nearCount=0;
 for(let c=0;c<40;c++){const a=R()*6.283,d=55+R()*230,cx=40+Math.cos(a)*d,cz=20+Math.sin(a)*d,k=2+Math.floor(R()*5);
  for(let i=0;i<k;i++){const x=cx+(R()-.5)*30,z=cz+(R()-.5)*30;if(free(x,z)){sectors[Math.floor(((Math.atan2(z-20,x-40)+Math.PI)/6.2832)*8)%8].push([x,z,1.05+R()*.85,R()*6.283,R()]);nearCount++;}}}
 for(let i=0;i<300;i++){const a=R()*6.283,d=300+R()*380,x=40+Math.cos(a)*d,z=20+Math.sin(a)*d;far.push([x,z,1.5+R()*1.3,R()*6.283,R()]);}
 const g=new T.Group();g.name='Arbolado';landscapeWorld.add(g);const m4=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),p=new T.Vector3(),s=new T.Vector3(),col=new T.Color();
 function inst(geo,mat,list,tint){const im=new T.InstancedMesh(geo,mat,list.length);list.forEach((t,i)=>{e.set(0,t[3],0);q.setFromEuler(e);p.set(t[0],GY-.05,t[1]);s.set(t[2]*(.9+t[4]*.25),t[2],t[2]*(.9+t[4]*.25));m4.compose(p,q,s);im.setMatrixAt(i,m4);
   if(tint){col.setRGB(.8+t[4]*.5,.85+t[4]*.3,.7+t[4]*.4);im.setColorAt(i,col);}});im.instanceMatrix.needsUpdate=true;im.castShadow=false;im.receiveShadow=false;im.frustumCulled=false;g.add(im);return im;}
 for(const list of sectors)if(list.length){for(const [geo,mat,tint] of [[nearGeo,leafMat,true],[trunkGeo,barkMat,false]]){const im=inst(geo,mat,list,tint);im.computeBoundingSphere();im.frustumCulled=true;}}
 {const fs=Array.from({length:8},()=>[]);for(const t of far)fs[Math.floor(((Math.atan2(t[1]-20,t[0]-40)+Math.PI)/6.2832)*8)%8].push(t);for(const list of fs)if(list.length){const im=inst(farGeo,leafMat,list,true);im.computeBoundingSphere();im.frustumCulled=true;}}
 // sombra suave bajo cada árbol cercano
 const near=sectors.flat();
 const sc=document.createElement('canvas');sc.width=sc.height=64;const cx=sc.getContext('2d'),gr=cx.createRadialGradient(32,32,3,32,32,31);gr.addColorStop(0,'rgba(0,0,0,.5)');gr.addColorStop(.65,'rgba(0,0,0,.22)');gr.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=gr;cx.fillRect(0,0,64,64);
 const shGeo=new T.PlaneGeometry(1,1);shGeo.rotateX(-Math.PI/2);const shMat=new T.MeshBasicMaterial({map:new T.CanvasTexture(sc),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const sh=new T.InstancedMesh(shGeo,shMat,near.length);near.forEach((t,i)=>{p.set(t[0]+t[2]*1.3,GY+.04,t[1]-t[2]*.7);s.set(t[2]*6.2,1,t[2]*4.4);e.set(0,.5,0);q.setFromEuler(e);m4.compose(p,q,s);sh.setMatrixAt(i,m4);});sh.frustumCulled=false;sh.renderOrder=-1;g.add(sh);
 // bajo techo no se ven: no se dibujan
 const fBox=new T.Box3().setFromObject(factory),cw=new T.Vector3();setInterval(()=>{camera.getWorldPosition(cw);g.visible=!(fBox.containsPoint(cw)||cw.y<GY-.5);},400);
 window.Entorno80={arboles:nearCount,lejanos:far.length};
 }catch(err){console.warn('Entorno realista:',err);}
})();
