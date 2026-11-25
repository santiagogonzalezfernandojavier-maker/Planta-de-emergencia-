// v12.27 · En «Funcionamiento de la planta»: tensión y frecuencia del generador subiendo de 0 a su valor nominal,
// y el ATS (interruptor automático de transferencia) dibujado con su cuchilla moviéndose entre red y planta.
(function(){
 const $=id=>document.getElementById(id);
 const css=document.createElement('style');css.textContent=`
#genGauges{margin:2px 0 8px}
#genGauges .gg{margin:7px 0}
#genGauges .gg-top{display:flex;justify-content:space-between;align-items:baseline}
#genGauges .gg-top span{color:#b7b49f;font-size:12px}
#genGauges .gg-top b{font:800 20px Bahnschrift,'Segoe UI',sans-serif;color:#fff;font-variant-numeric:tabular-nums}
#genGauges .gg-top b small{font-size:12px;color:#b7b49f;margin-left:3px}
#genGauges .gg-bar{position:relative;height:9px;background:#24241e;border:1px solid #4a4734;margin-top:3px}
#genGauges .gg-bar i{position:absolute;left:0;top:0;bottom:0;background:#ffc400;transition:background .3s}
#genGauges .gg-bar em{position:absolute;top:-4px;bottom:-4px;width:2px;background:#7ee081}
#genGauges .gg.ok .gg-bar i{background:#7ee081}
#genGauges .gg-sub{display:flex;justify-content:space-between;color:#8f8c78;font-size:11px;margin-top:2px}
#genStage{font-size:12px;color:#ffc400;margin:2px 0 4px;min-height:15px}
#atsBox{border-top:1px solid #ffffff1c;margin-top:6px;padding-top:6px}
#atsBox h4{margin:0;font:800 13px Bahnschrift,Arial,sans-serif;color:#ffc400}
#atsBox p{margin:2px 0 0;font-size:12px;color:#d9d5c2;min-height:15px}
#atsTag{position:fixed;z-index:30;pointer-events:none;transform:translate(-50%,-100%);background:#0b0b0ae6;border:2px solid #ffc400;color:#fff;font:700 12px Bahnschrift,Arial,sans-serif;padding:3px 8px;white-space:nowrap;display:none}
#atsTag::after{content:'';position:absolute;left:50%;bottom:-9px;margin-left:-6px;border:6px solid transparent;border-top-color:#ffc400}
#atsTag small{display:block;font-weight:600;color:#ffc400}
`;document.head.appendChild(css);
 const NV=480,NF=60;
 function build(){
  const p=$('funcPanel');if(!p||$('genGauges'))return !!p;
  const box=document.createElement('div');box.id='genGauges';
  box.innerHTML='<div id="genStage"></div>'
   +'<div class="gg" id="ggV"><div class="gg-top"><span>Tensión del generador</span><b><output>0</output><small>V</small></b></div><div class="gg-bar"><i></i><em style="left:'+(NV/528*100)+'%"></em></div><div class="gg-sub"><span>0</span><span>nominal 480 V</span></div></div>'
   +'<div class="gg" id="ggF"><div class="gg-top"><span>Frecuencia</span><b><output>0.0</output><small>Hz</small></b></div><div class="gg-bar"><i></i><em style="left:'+(NF/66*100)+'%"></em></div><div class="gg-sub"><span>0</span><span>nominal 60 Hz</span></div></div>'
   +'<div class="gg" id="ggR"><div class="gg-top"><span>Velocidad del motor</span><b><output>0</output><small>rpm</small></b></div></div>'
   +'<div id="atsBox"><h4>ATS · interruptor automático de transferencia</h4>'
   +'<svg id="atsSvg" viewBox="0 0 270 118" width="100%" role="img" aria-label="Diagrama del ATS">'
   +'<g font-family="Bahnschrift,Arial" font-size="11" font-weight="700" text-anchor="middle">'
   +'<text x="45" y="12" fill="#d9d5c2">RED (CFE)</text><text x="225" y="12" fill="#d9d5c2">PLANTA</text><text x="135" y="114" fill="#d9d5c2">CARGA</text></g>'
   +'<path id="atsLg" d="M45 18 V40 H105 V52" stroke="#5a5638" stroke-width="4" fill="none"/>'
   +'<path id="atsLp" d="M225 18 V40 H165 V52" stroke="#5a5638" stroke-width="4" fill="none"/>'
   +'<rect x="88" y="44" width="94" height="52" fill="none" stroke="#ffc400" stroke-width="1.5" stroke-dasharray="4 3"/>'
   +'<circle cx="105" cy="54" r="4" fill="#f4f1e4"/><circle cx="165" cy="54" r="4" fill="#f4f1e4"/><circle cx="135" cy="88" r="5" fill="#f4f1e4"/>'
   +'<line id="atsBlade" x1="135" y1="88" x2="105" y2="54" stroke="#f4f1e4" stroke-width="5" stroke-linecap="round"/>'
   +'<path id="atsLl" d="M135 93 V102" stroke="#5a5638" stroke-width="4"/></svg><p id="atsTxt"></p></div>';
  p.insertBefore(box,$('fRows'));const h=p.querySelector('h3');if(h)h.textContent='PLANTA Y TRANSFERENCIA';
  if(!$('atsTag')){const t=document.createElement('div');t.id='atsTag';t.innerHTML='ATS<small></small>';document.body.appendChild(t);}
  return true;
 }
 let v=0,f=0,r=0,ang=-1,last=performance.now();
 const W=new T.Vector3();let atsPos=null;
 function atsWorld(){if(atsPos)return atsPos;try{const pc=(typeof pieces!=='undefined'?pieces:[]).find(x=>x.userData.key==='ats');if(pc){const b=new T.Box3().setFromObject(pc);if(!b.isEmpty()){atsPos=b.getCenter(new T.Vector3());atsPos.y=b.max.y+.15;}}}catch(e){}return atsPos;}
 function step(){
  const fm=document.body.classList.contains('func-mode');const tag=$('atsTag');
  if(!fm){if(tag)tag.style.display='none';return;}
  if(!build())return;
  const now=performance.now(),dt=Math.min(.3,(now-last)/1000);last=now;
  let st={};try{st=UnidadVII.state();}catch(e){}
  let sim=null;try{sim=s;}catch(e){}
  const stage=st.stage||'off',rpm=sim?sim.rpm:(st.frequency||0)*30;
  const tv=['starting','crankpause','off','fault'].includes(stage)?0:(st.genV||0),tf=rpm/30;
  const k=Math.min(1,dt*9);v+=(tv-v)*k;f+=(tf-f)*k;r+=(rpm-r)*k;
  const set=(id,val,max,nom,dec)=>{const g=$(id);g.querySelector('output').textContent=val.toFixed(dec);g.querySelector('i').style.width=Math.min(100,val/max*100)+'%';g.classList.toggle('ok',nom&&Math.abs(val-nom)<nom*.07);};
  set('ggV',v,528,NV,0);set('ggF',f,66,NF,1);$('ggR').querySelector('output').textContent=Math.round(r);
  const msg={off:'Motor detenido',crankpause:'Pausa entre intentos de arranque',starting:'Arrancando: la batería mueve el motor',warm:'Subiendo a velocidad nominal: la tensión y la frecuencia crecen',ready:'Tensión y frecuencia nominales',cool:'Enfriamiento sin carga',fault:'Detenido por protección'}[stage]||'';
  const sg=$('genStage');if(sg.textContent!==msg)sg.textContent=msg;
  // ATS
  const src=st.source||'none',moving=!!(sim&&sim.target),grid=sim?!!sim.grid:true,genOK=v>NV*.9&&Math.abs(f-NF)<NF*.05;
  const want=moving?0:src==='grid'?-1:src==='gen'?1:0;ang+=(want-ang)*Math.min(1,dt*5);
  const tx=135+ang*30,ty=54+Math.abs(ang)*0+ (1-Math.abs(ang))*-10;$('atsBlade').setAttribute('x2',tx.toFixed(1));$('atsBlade').setAttribute('y2',ty.toFixed(1));
  $('atsLg').setAttribute('stroke',grid?'#7ee081':'#5a5638');$('atsLp').setAttribute('stroke',genOK?'#ffb938':v>20?'#8a7330':'#5a5638');
  $('atsLl').setAttribute('stroke',src==='grid'?'#7ee081':src==='gen'?'#ffb938':'#5a5638');
  const txt=moving?'Transfiriendo: los contactos están abiertos un instante':src==='grid'?'Posición RED: la fábrica se alimenta de CFE':src==='gen'?'Posición PLANTA: la fábrica se alimenta del generador':grid?'Sin carga conectada':'Sin red: espera a que la planta tenga tensión y frecuencia nominales';
  if($('atsTxt').textContent!==txt)$('atsTxt').textContent=txt;
  // etiqueta sobre el gabinete en 3D
  const w=atsWorld();
  if(tag&&w){W.copy(w).project(camera);const dist=camera.position.distanceTo(w);const vis=W.z<1&&Math.abs(W.x)<1&&Math.abs(W.y)<1&&dist<28;
   tag.style.display=vis?'block':'none';if(vis){const c=renderer.domElement.getBoundingClientRect();tag.style.left=(c.left+(W.x+1)/2*c.width)+'px';tag.style.top=(c.top+(1-W.y)/2*c.height-6)+'px';
    const sm=tag.querySelector('small'),tt=moving?'transfiriendo':src==='grid'?'en RED':src==='gen'?'en PLANTA':'abierto';if(sm.textContent!==tt)sm.textContent=tt;}}
 }
 setInterval(step,60);
})();
