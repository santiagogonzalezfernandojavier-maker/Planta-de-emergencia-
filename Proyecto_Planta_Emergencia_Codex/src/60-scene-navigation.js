// D43: view changes yield the camera to one controller and retain the practice pose.
(()=>{
 const selector='#viewbar [data-nav],#viewbar [data-view],#resetCamera,#basementView,#siteView,#overallView,#frontView,#yardView,#groundCutView,#undergroundView,#groundSystemView,#focusTE,#focusTP,#focusCells,#factoryFeederView';
 document.addEventListener('click',e=>{const control=e.target.closest(selector);if(!control)return;
  const nav=control.dataset.nav;if(nav==='emergency'){e.preventDefault();e.stopImmediatePropagation();Maintenance.resume33();return;}
  if(nav==='yard'){e.preventDefault();e.stopImmediatePropagation();Maintenance.suspend33();Walk31.enterZone('yard');const details=control.closest('details');if(details)details.open=false;return;}
  if(Walk31.state().active)Maintenance.suspend33();
 },true);
 const back=document.createElement('button');back.id='returnWalk43';back.textContent='Volver a mi recorrido';back.hidden=true;back.onclick=()=>Maintenance.resume33();$('viewer').append(back);
 const old=CCM34.frame;CCM34.frame=function(dt){old(dt);back.hidden=!Maintenance.state().active||Walk31.state().active;};
 const sign=new T.Group();sign.name='SE-01 · marco de acceso peatonal e identificación';substation.site.add(sign);sign.position.set(9.45,6.65,-5.3);sign.rotation.y=Math.PI;
 const frame=mat('#72878b',.65),face=mat('#d5d9cc',.12);box(sign,[.34,.10,.34],[0,.05,0],frame);cyl(sign,.035,1.65,[0,.875,-.075],frame);box(sign,[.75,.80,.045],[0,1.55,0],face);
 for(const x of [-.39,.39])box(sign,[.035,.84,.065],[x,1.55,0],frame);for(const y of [1.13,1.97])box(sign,[.81,.035,.065],[0,y,0],frame);
 for(const x of [-.32,.32])for(const y of [1.20,1.90])cyl(sign,.012,.012,[x,y,.029],frame,'z');
 cabinetLabel20(sign,'SE-01 · ACCESO',[0,1.81,.031],.66,.11,'#e6f0e9','#25444d');cabinetLabel20(sign,'SUBESTACIÓN 13.8 kV',[0,1.60,.031],.67,.09);cabinetLabel20(sign,'PASILLO PEATONAL',[0,1.38,.031],.67,.08,'#253742','#dbbb54');
 const route=new T.Group();route.name='Guía de acceso al patio · sin maniobras automáticas';substation.site.add(route);const paint=mat('#c4a23e');for(let z=-6.7;z< -3.7;z+=.65)box(route,[.08,.006,.32],[10.2,6.665,z],paint);
 const style=document.createElement('style');style.textContent='body.walking31 #sceneFooter .gesture{visibility:hidden}#returnWalk43{position:absolute;right:14px;bottom:18px;z-index:44;padding:11px 16px;border:1px solid #85b3a9;border-radius:5px;background:#173d3a;color:#d9eee7;font:600 12px system-ui}#returnWalk43[hidden]{display:none}#work26 .mission-step43{display:block;font-size:10px;color:#91cbbd;margin-top:8px}#work26 #actionResult41[data-error=true]{color:#f1bf79}.last-result43{font-size:11px;border-top:1px solid #45656866;margin:8px 0;padding-top:6px}.last-result43 summary{cursor:pointer;color:#90c9b4}.last-result43 p{font-size:11px!important}';document.head.append(style);
})();
