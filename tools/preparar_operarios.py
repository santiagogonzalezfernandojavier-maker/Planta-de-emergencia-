"""Prepara los operarios del simulador: baja triángulos, les pone esqueleto y calcula los pesos de piel.
Uso:  python3 tools/preparar_operarios.py ENTRADA.json.gz SALIDA.json.gz
Solo necesita numpy y scipy. La entrada es el scene-data original (sin esqueleto).
Las animaciones (caminar, revisar, agacharse) se calculan en src/10-personnel.js sobre estos huesos.
"""
import sys, gzip, json, base64, hashlib
from pathlib import Path
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from qem import simplify

b64 = lambda a: base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
unb = lambda s, dt: np.frombuffer(base64.b64decode(s), dtype=dt)

# ---------- esqueleto -------------------------------------------------------------------
# Coordenadas del modelo: y arriba, el personaje mira hacia +z. s = +1 / -1 es el lado en x.
def skeleton(pose):
    J = []  # (nombre, padre, posición de reposo)
    def add(n, par, pos): J.append((n, par, pos)); return len(J) - 1
    hips = add('caderas', -1, (0, .95, 0))
    spine = add('cintura', hips, (0, 1.05, 0))
    chest = add('pecho', spine, (0, 1.22, 0))
    neck = add('cuello', chest, (0, 1.44, 0))
    head = add('cabeza', neck, (0, 1.52, 0))
    for s, side in ((1, 'a'), (-1, 'b')):
        th = add('muslo_' + side, hips, (s * .09, .93, 0))
        kn = add('rodilla_' + side, th, (s * .09, .50, 0))
        add('pie_' + side, kn, (s * .09, .10, 0))
    for s, side in ((1, 'a'), (-1, 'b')):
        sh = add('hombro_' + side, chest, (s * .21, 1.34, 0))
        if pose == 'tablet':
            el = add('codo_' + side, sh, (s * .25, 1.11, .04))
            add('mano_' + side, el, (s * .115, 1.09, .245))
        else:
            el = add('codo_' + side, sh, (s * .25, 1.12, .01))
            add('mano_' + side, el, (s * .25, .91, .03))
    return J

def segments(pose, J):
    """(índice de hueso, extremo a, extremo b, radio). Cada hueso mueve lo que está cerca de su cápsula."""
    pos = {n: np.array(p, float) for n, _, p in J}
    idx = {n: i for i, (n, _, _) in enumerate(J)}
    S = [(idx['caderas'], (0, .85, 0), (0, 1.0, 0), .17), (idx['cintura'], (0, 1.0, 0), (0, 1.2, 0), .17),
         (idx['pecho'], (0, 1.2, 0), (0, 1.42, 0), .19), (idx['pecho'], (-.19, 1.36, 0), (.19, 1.36, 0), .06),
         (idx['cuello'], (0, 1.42, 0), (0, 1.50, 0), .06), (idx['cabeza'], (0, 1.50, 0), (0, 1.77, 0), .13)]
    for s, side in ((1, 'a'), (-1, 'b')):
        S += [(idx['muslo_' + side], pos['muslo_' + side], pos['rodilla_' + side], .11),
              (idx['rodilla_' + side], pos['rodilla_' + side], pos['pie_' + side], .09),
              (idx['pie_' + side], pos['pie_' + side], pos['pie_' + side] + (0, -.06, .17), .07),
              (idx['hombro_' + side], pos['hombro_' + side], pos['codo_' + side], .07),
              (idx['codo_' + side], pos['codo_' + side], pos['mano_' + side], .06)]
        tip = pos['mano_' + side] + ((0, -.10, .02) if pose != 'tablet' else (-s * .02, -.02, .05))
        S.append((idx['mano_' + side], pos['mano_' + side], tip, .06))
    return S

def seg_dist(P, a, b):
    a = np.array(a, float); b = np.array(b, float); ab = b - a
    t = np.clip(((P - a) @ ab) / max(ab @ ab, 1e-12), 0, 1)
    return np.linalg.norm(P - (a + t[:, None] * ab), axis=1)

def skin_weights(P, pose, J, alpha=.3, sigma=.02):
    n = len(J); best = np.full((len(P), n), 1e9)
    for j, a, b, r in segments(pose, J):
        d = seg_dist(P, a, b)
        best[:, j] = np.minimum(best[:, j], np.maximum(0, d - r) + alpha * d)
    w = np.exp(-(best - best.min(1, keepdims=True)) / sigma)
    top = np.argsort(-w, 1)[:, :4]
    W = np.take_along_axis(w, top, 1); W /= W.sum(1, keepdims=True)
    return top.astype(np.uint8), W.astype(np.float32)

# ---------- reducción de triángulos -------------------------------------------------------
def target_for(tris, name):
    if tris <= 1500: return tris
    if name.startswith('Piel anat'): return 9000      # cabeza
    if tris > 30000: return 8000                      # pantalón y camisa
    if tris > 15000: return 3500                      # casco
    if tris > 4500: return 2400                       # chaleco y cintas
    return tris

def main(src, dst):
    d = json.loads(gzip.open(src).read())
    mats = d['materials']
    dec = {}
    def decimated(gi, mat_name):
        if gi in dec: return dec[gi]
        g = d['geometries'][gi]
        P = unb(g['p'], '<f4').reshape(-1, 3).astype(np.float64); N = unb(g['n'], '<f4').reshape(-1, 3)
        UV = unb(g['uv'], '<f4').reshape(-1, 2); F = unb(g['i'], '<u4').reshape(-1, 3)
        at = {'n': N, 'uv': UV}
        if 'c' in g: at['c'] = unb(g['c'], '<f4').reshape(-1, 3)
        tgt = target_for(len(F), mat_name)
        if tgt < len(F):
            P2, F2, A2 = simplify(P, F, at, tgt)
            nn = A2['n']; A2['n'] = nn / np.maximum(np.linalg.norm(nn, axis=1, keepdims=True), 1e-9)
            print(f'  g{gi} {mat_name[:20]:20} {len(F):6} -> {len(F2):6} triángulos', flush=True)
        else:
            P2, F2, A2 = P, F, at
        dec[gi] = (P2, F2, A2)
        return dec[gi]
    geos, cache, people = [], {}, []
    for p in d['people']:
        pose = 'tablet' if p['role'] == 'tablet' else 'down'
        J = skeleton(pose)
        meshes = []
        for gi, mi in p['meshes']:
            P, F, A = decimated(gi, mats[mi]['name'])
            key = (gi, pose)
            if key not in cache:
                jn, wt = skin_weights(P, pose, J)
                g = dict(p=b64(P.astype('<f4')), n=b64(A['n'].astype('<f4')), uv=b64(A['uv'].astype('<f4')), i=b64(F.astype('<u4')),
                         j=b64(jn), w=b64(wt))
                if 'c' in A: g['c'] = b64(A['c'].astype('<f4'))
                cache[key] = len(geos); geos.append(g)
            meshes.append([cache[key], mi])
        q = dict(p); q['meshes'] = meshes; q['pose'] = pose
        q['bones'] = [dict(n=n, p=par, t=list(map(float, pos))) for n, par, pos in J]
        people.append(q)
    out = dict(version=2, geometries=geos, materials=mats, people=people)
    Path(dst).write_bytes(gzip.compress(json.dumps(out, separators=(',', ':')).encode(), 9))
    tris = sum(len(unb(g['i'], '<u4')) // 3 for g in geos)
    print('geometrías', len(geos), 'triángulos totales (cada geometría una vez)', tris)

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
