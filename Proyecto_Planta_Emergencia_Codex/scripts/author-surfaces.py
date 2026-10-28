"""Author deterministic, periodic PBR materials. Optional: Python, Pillow, NumPy, SciPy.

Builds use the committed WebP assets; Python and network access are not runtime dependencies.
Heights and tile sizes are in metres. Maps contain no painted directional highlights.
"""
from pathlib import Path
import hashlib
import json
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
from scipy.spatial import cKDTree

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'assets/textures/industrial'
DEST.mkdir(parents=True, exist_ok=True)
N = 1024
rng = np.random.default_rng(49027)
yy, xx = np.mgrid[:N, :N] / N

def noise(sigma, seed):
    a = np.random.default_rng(seed).normal(size=(N, N)).astype(np.float32)
    a = gaussian_filter(a, sigma, mode='wrap')
    return a / max(a.std(), .00001)

micro, fine, medium, cloud = [noise(s, 490+i) for i, s in enumerate([.65, 2, 14, 65])]

def cells(count, seed):
    points = np.random.default_rng(seed).random((count, 2))
    distance, index = cKDTree(points, boxsize=1).query(np.stack([xx.ravel(), yy.ravel()], 1), k=2)
    return distance.reshape(N,N,2), index.reshape(N,N,2), points

specs = {
 'paint': (.30,.50,.45), 'cast': (.20,.72,.65), 'steel': (.45,.31,.45),
 'zinc': (.25,.53,.32), 'copper': (.35,.40,.36), 'concrete': (2.8,.92,.72),
 'floor': (2.0,.66,.42), 'gravel': (1.2,.94,.92), 'asphalt': (2.,.94,.75),
 'soil': (2.,.98,.68), 'rubber': (.18,.85,.45), 'ceramic': (.50,.19,.10)
}
manifest = {'revision':'D49','origin':'Materiales originales generados para este proyecto; sin fotografías ni archivos de terceros.',
 'seed':49027,'generator':'scripts/author-surfaces.py','channels':{'base':'sRGB albedo','normal':'OpenGL tangent space, linear','orm':'R ambient occlusion / G roughness / B white; linear'},'materials':{}}

for name,(tile, roughness, strength) in specs.items():
    a = .972 + .004*fine
    height = .000015*fine
    rough = roughness + .025*medium
    occlusion = np.ones((N,N))
    rgb = None
    if name == 'cast':
        a = .92 + .025*medium + .013*fine
        height = .00016*fine + .00003*micro
        rough = .77 + .035*medium
    elif name == 'steel':
        brushed = noise((.55,20), 495)
        scratches = np.maximum(noise((.4,80),499)-2.7,0)
        a = .96 + .008*brushed - scratches*.012
        height = .000004*brushed - scratches*.000003
        rough = .36 + .045*brushed + .015*cloud
    elif name == 'zinc':
        distances, ids, points = cells(400,496)
        facet = np.random.default_rng(497).uniform(-1,1,400)[ids[:,:,0]]
        a = .94 + .035*facet + .002*micro
        height = .000004*facet
        rough = .53 + .055*facet + .01*medium
    elif name == 'copper':
        tarnish = np.maximum(cloud-.4,0)
        a = .95 + .008*fine - .035*tarnish
        height = .000006*fine
        rough = .40 + .035*medium + .10*tarnish
    elif name == 'concrete':
        pores = np.maximum(noise(1.1,500)-1.9,0)
        a = .88 + .017*cloud + .013*medium + .008*fine - .10*pores
        height = .00035*medium + .00012*fine - .0018*pores
        rough = .92 + .022*medium
        occlusion = 1 - np.clip(pores*.20,0,.42)
    elif name == 'floor':
        # Trowelled cement: swirls and sparse exposed aggregate, no false tile seams.
        sweep = np.sin(18*np.hypot(xx-.5, yy-.5)+medium*.14)
        aggregate = np.maximum(micro-1.5,0)
        a = .91 + .012*cloud + .009*medium + .004*sweep - aggregate*.014
        height = .00008*fine + .00005*sweep
        rough = .66 + .06*cloud + .022*sweep
    elif name == 'gravel':
        distance, ids, points = cells(960,501)
        first, second = distance[:,:,0],distance[:,:,1]
        gap = np.clip((second-first)/.003,0,1)
        lithology = np.random.default_rng(502).uniform(.64,.96,960)[ids[:,:,0]]
        dome = np.clip(1-first/.032,0,1)
        height = .016*dome*gap + .0007*fine
        a = (.70+.30*gap)*lithology + fine*.016
        rough = .91 + .04*medium
        occlusion = .43+.57*np.sqrt(gap)
        rgb = np.stack([a*1.025,a*1.012,a*.985],2)
    elif name == 'asphalt':
        grain = noise(.9,503)
        stones = np.clip((grain-.25)*.70,0,1)
        a = .75 + .14*stones + .012*cloud
        height = .0013*stones + .00035*fine
        rough = .94+.015*medium
        occlusion = .85+.15*stones
    elif name == 'soil':
        a = .88+.025*cloud+.035*medium+.025*fine
        height = .002*medium+.0011*fine
        rough = .97+.015*fine
        occlusion = .92+.08*np.clip(medium,0,1)
    elif name == 'rubber':
        a = .97+.008*medium+.004*micro
        height = .000014*fine
        rough = .85+.025*medium
    elif name == 'ceramic':
        a = .99+.002*cloud
        height = .000001*fine
        rough = .20+.012*cloud
    if rgb is None: rgb = np.repeat(a[:,:,None],3,2)
    # Central differences on a periodic height field; normals follow metric relief.
    dx = (np.roll(height,-1,1)-np.roll(height,1,1))/(2*tile/N)
    dy = (np.roll(height,1,0)-np.roll(height,-1,0))/(2*tile/N)
    normal = np.stack([-dx,-dy,np.ones_like(height)],2)
    normal /= np.linalg.norm(normal,axis=2)[:,:,None]
    normal = normal*.5+.5
    orm = np.stack([np.clip(occlusion,0,1),np.clip(rough,.08,1),np.ones_like(height)],2)
    entry={'tileMetres':tile,'roughness':roughness,'normalStrength':strength,'levels':{}}
    for resolution in (512,1024):
        files={}
        for channel, values in [('base',rgb),('normal',normal),('orm',orm)]:
            im=Image.fromarray(np.uint8(np.clip(values,0,1)*255),'RGB')
            if resolution != N: im=im.resize((resolution,resolution),Image.Resampling.LANCZOS)
            filename=f'{name}-{resolution}-{channel}.webp'
            im.save(DEST/filename,'WEBP',quality=87 if channel=='base' else 95,method=6)
            content=(DEST/filename).read_bytes()
            files[channel]={'file':filename,'bytes':len(content),'sha256':hashlib.sha256(content).hexdigest()}
        entry['levels'][str(resolution)]=files
    manifest['materials'][name]=entry
    print(name, flush=True)
(DEST/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Total bytes:',sum(p.stat().st_size for p in DEST.glob('*.webp')))
