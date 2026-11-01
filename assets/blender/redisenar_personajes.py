"""Blender 4.0. Rediseño de cabeza a partir de la base anatómica CC0 de MakeHuman.
Requiere la escena editable entregada y MakeHuman_base.obj junto al script.
"""
import sys
for p in ['/usr/lib/python3.12/lib-dynload','/tmp/blender-local/usr/lib/python3/dist-packages']:
 if p not in sys.path:sys.path.append(p)
import bpy,bmesh,json,gzip,base64,struct,math
from pathlib import Path
from mathutils import Vector
BASE=Path(__file__).resolve().parent
input_scene=BASE/'Operarios_Anatomicos_D26.blend'
if not input_scene.exists():input_scene=BASE/'Operarios_Planta_D25.blend'
bpy.ops.wm.open_mainfile(filepath=str(input_scene))
verts=[];uvs=[];faces=[];fuv=[];group=''
for l in (BASE/'MakeHuman_base.obj').read_text().splitlines():
 if l.startswith('v '):verts.append(tuple(map(float,l.split()[1:])))
 elif l.startswith('vt '):uvs.append(tuple(map(float,l.split()[1:])))
 elif l.startswith('g '):group=l[2:].strip()
 elif l.startswith('f ') and group=='body':
  f=[x.split('/') for x in l.split()[1:]];ids=[int(x[0])-1 for x in f]
  if all(verts[i][1]>5.3 for i in ids):faces.append(ids);fuv.append([int(x[1])-1 for x in f])
cols=[c for c in bpy.context.scene.collection.children if any(o.type=='MESH' for o in c.objects)]
colors=[(.48,.255,.14),(.63,.35,.22),(.51,.29,.17),(.32,.18,.11)]
def mat(name,color,rough=.62):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;return m
white=mat('Esclerótica natural',(.45,.47,.43));iris=mat('Iris marrón',(.08,.044,.026));black=mat('Pupila y montura',(.014,.020,.022));brow=mat('Ceja',(.07,.045,.028))
def sphere(col,name,p,size,m):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=p);o=bpy.context.object;o.name=name;o.scale=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 for c in list(o.users_collection):c.objects.unlink(o)
 col.objects.link(o);o.data.materials.append(m)
 for f in o.data.polygons:f.use_smooth=True
 return o
for j,col in enumerate(cols):
 ox=j*1.6;female=j%2==1
 for o in list(col.objects):
  if o.type!='MESH':continue
  if o.name.startswith('Cabeza anatómica'):
   bpy.data.objects.remove(o,do_unlink=True);continue
  zs=[v.co.z for v in o.data.vertices]
  if min(zs)<1.48:
   bm=bmesh.new();bm.from_mesh(o.data);oldfaces=[f for f in bm.faces if all(1.48<v.co.z<1.66 for v in f.verts)]
   if oldfaces:bmesh.ops.delete(bm,geom=oldfaces,context='FACES')
   bm.to_mesh(o.data);bm.free();o.data.update()
  if min(zs)>1.39 and max(zs)<1.67 or (o.name.startswith('Piel') and min(zs)<1.45 and max(zs)>1.69):bpy.data.objects.remove(o,do_unlink=True)
 # Base anatómica con mejillas, órbitas, nariz, labios, mentón y orejas integrados.
 used=sorted({i for f in faces for i in f});mapping={v:i for i,v in enumerate(used)}
 def tr(v):
  x=v[0]*.095*(.96 if female else 1);depth=v[2]*.095-.04
  # El recorte incluye el cuello dentro del uniforme, sin piel de hombros expuesta.
  t=max(0,min(1,(v[1]-6.0)/.15));x=max(-.045,min(.045,x))*(1-t)+x*t;depth=max(-.047,min(.047,depth))*(1-t)+depth*t
  return (x,-depth,1.708+(v[1]-8.4913)*.094)
 mesh=bpy.data.meshes.new('Topología anatómica MakeHuman');mesh.from_pydata([tr(verts[i]) for i in used],[],[[mapping[i] for i in f] for f in faces]);mesh.update();uv=mesh.uv_layers.new(name='UVMap')
 for poly,fu in zip(mesh.polygons,fuv):
  poly.use_smooth=True
  for li,u in zip(poly.loop_indices,fu):uv.data[li].uv=uvs[u]
 skin=mat('Piel anatómica '+str(j+1),colors[j],.64);o=bpy.data.objects.new('Cabeza anatómica '+str(j+1),mesh);col.objects.link(o);o.location.x=ox;o.data.materials.append(skin)
 # Sutileza de color mediante vértices: sin manchas grandes ni cara dibujada.
 color=mesh.color_attributes.new(name='SkinTint',type='FLOAT_COLOR',domain='POINT')
 for vi,v in enumerate(mesh.vertices):
  x,y,z=v.co;front=max(0,min(1,(-y-.025)/.07));lip=math.exp(-((z-1.548)/.008)**2-(x/.027)**4)*front;cheek=math.exp(-((z-1.571)/.022)**2-((abs(x)-.044)/.025)**2)*front
  color.data[vi].color=(1.0,.99-lip*.22-cheek*.045,.98-lip*.17-cheek*.04,1)
 node=skin.node_tree.nodes.new('ShaderNodeVertexColor');node.layer_name='SkinTint';mix=skin.node_tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[2].default_value=(*colors[j],1);skin.node_tree.links.new(node.outputs['Color'],mix.inputs[1]);skin.node_tree.links.new(mix.outputs[0],skin.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
 sub=o.modifiers.new('Suavizado de topología facial','SUBSURF');sub.levels=1;sub.render_levels=1;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=sub.name)
 for side in [-1,1]:
  x=side*.30775*.095*(.96 if female else 1)+ox;y=-(1.24535*.095-.04);z=1.708+(7.28415-8.4913)*.094
  sphere(col,'Globo ocular',(x,y,z),(.0114,.0114,.0114),white);sphere(col,'Iris',(x,y-.0107,z),(.0052,.0012,.0052),iris);sphere(col,'Pupila',(x,y-.0118,z),(.0023,.0005,.0023),black)
  # Gafas de seguridad con lentes transparentes ajustadas a la línea ocular.
  lens=mat('Lente transparente '+str(j)+str(side),(.78,.86,.86),.12);p=lens.node_tree.nodes.get('Principled BSDF');p.inputs['Alpha'].default_value=.12;lens.blend_method='BLEND'
  sphere(col,'Lente',(x,y-.021,z+.001),(.031,.006,.018),lens)
  curve=bpy.data.curves.new('Montura','CURVE');curve.dimensions='3D';curve.bevel_depth=.0016;curve.bevel_resolution=2;sp=curve.splines.new('POLY');pts=[(x-side*.028,y-.024,z+.012),(x,y-.026,z+.018),(x+side*.030,y-.018,z+.010),(ox+side*.079,.010,z+.006)];sp.points.add(len(pts)-1)
  for q,p in zip(sp.points,pts):q.co=(*p,1)
  ob=bpy.data.objects.new('Montura de seguridad',curve);col.objects.link(ob);ob.data.materials.append(black)
  bpy.context.view_layer.objects.active=ob;ob.select_set(True);bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.ops.object.convert(target='MESH')
# Exportación individual, conservando geometría local en cada GLB.
def pack(a,kind='f'):return base64.b64encode(struct.pack('<'+str(len(a))+kind,*a)).decode()
web=[]
for j,col in enumerate(cols):
 objects=[o for o in col.objects if o.type=='MESH'];ox=j*1.6;meshes=[]
 for o in objects:
  m=o.data.materials[0];principled=m.node_tree.nodes.get('Principled BSDF');base=list(principled.inputs['Base Color'].default_value[:3]);alpha=principled.inputs['Alpha'].default_value
  md=dict(id=m.name,name=m.name,color=base,roughness=principled.inputs['Roughness'].default_value,metalness=principled.inputs['Metallic'].default_value,opacity=alpha,transparent=alpha<.99)
  tx=next((n for n in m.node_tree.nodes if n.type=='TEX_IMAGE' and n.image),None)
  if tx:
   tx.image.filepath_raw=str(BASE/(m.name.replace('/','_')+'.png'));tx.image.file_format='PNG';tx.image.save();md['map']='data:image/png;base64,'+base64.b64encode(Path(tx.image.filepath_raw).read_bytes()).decode();md['color']=[1,1,1]
  elif m.name.startswith('Piel anatómica'):md['color']=colors[j]
  o.data.calc_loop_triangles();p=[];n=[];u=[];cc=[];ii=[];seen={};tint=o.data.color_attributes.get('SkinTint')
  for tri in o.data.loop_triangles:
   for li in tri.loops:
    loop=o.data.loops[li];v=o.data.vertices[loop.vertex_index];uv=o.data.uv_layers.active.data[li].uv if o.data.uv_layers.active else (0,0);key=(loop.vertex_index,round(uv[0],5),round(uv[1],5))
    if key not in seen:
     seen[key]=len(p)//3;co=o.matrix_world@v.co;no=o.matrix_world.to_3x3()@v.normal;p.extend([round(co.x-ox,5),round(co.z,5),round(-co.y,5)]);n.extend([round(no.x,4),round(no.z,4),round(-no.y,4)]);u.extend([round(uv[0],5),round(uv[1],5)])
     if tint:cc.extend(tint.data[loop.vertex_index].color[:3])
    ii.append(seen[key])
  d=dict(p=pack(p),n=pack(n),uv=pack(u),i=pack(ii,'I'),material=md)
  if tint:d['c']=pack(cc)
  meshes.append(d)
 # Temporarily remove the studio layout offset.
 for o in objects:o.location.x-=ox
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0];bpy.ops.export_scene.gltf(filepath=str(BASE/('Operario_'+str(j+1)+'.glb')),export_format='GLB',use_selection=True,export_yup=True,export_materials='EXPORT')
 for o in objects:o.location.x+=ox
 web.append(dict(name=col.name,role='tablet' if j%2==0 else 'observe',meshes=meshes))
bpy.ops.wm.save_as_mainfile(filepath=str(BASE/'Operarios_Anatomicos_D26.blend'),compress=True)
(BASE/'personajes_web.json.gz').write_bytes(gzip.compress(json.dumps(web,separators=(',',':')).encode(),9))
print('PERSONAJES_ANATOMICOS_EXPORTADOS',len(web))
