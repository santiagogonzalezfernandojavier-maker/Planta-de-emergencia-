"""Simplificación de mallas por colapso de aristas con métrica de error cuádrica (Garland-Heckbert).
Solo usa numpy. Los vértices de borde y de costura UV se dejan fijos, así que no aparecen grietas
y las texturas siguen alineadas. Pensado para mallas de ropa y piel de las que se parte con ~60 000 triángulos.
"""
import heapq
import numpy as np


def simplify(P, F, attrs, target_faces, flip_cos=0.25):
    """P (V,3), F (T,3), attrs: dict nombre -> (V,k). Devuelve P, F, attrs nuevos."""
    P = P.astype(np.float64).copy()
    F = F.astype(np.int64).copy()
    V, T = len(P), len(F)
    A = {k: v.astype(np.float64).copy() for k, v in attrs.items()}
    # cuádricas por vértice (plano de cada cara, ponderado por área)
    e1, e2 = P[F[:, 1]] - P[F[:, 0]], P[F[:, 2]] - P[F[:, 0]]
    cr = np.cross(e1, e2)
    ar = np.linalg.norm(cr, axis=1)
    ok = ar > 1e-14
    n = np.zeros_like(cr)
    n[ok] = cr[ok] / ar[ok, None]
    d = -(n * P[F[:, 0]]).sum(1)
    pl = np.concatenate([n, d[:, None]], 1)
    K = (pl[:, :, None] * pl[:, None, :]) * (0.5 * ar)[:, None, None]
    Q = np.zeros((V, 4, 4))
    for c in range(3):
        np.add.at(Q, F[:, c], K)
    # aristas: las que tienen una sola cara (borde o costura) o más de dos congelan sus vértices
    ed = np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]])
    key = np.sort(ed, 1)
    uk, cnt = np.unique(key[:, 0] * V + key[:, 1], return_counts=True)
    bad = uk[cnt != 2]
    frozen = np.zeros(V, bool)
    frozen[bad // V] = True
    frozen[bad % V] = True
    # caras degeneradas también congelan
    frozen[F[~ok].ravel()] = True
    vf = [set() for _ in range(V)]
    for fi, f in enumerate(F):
        for v in f:
            vf[v].add(fi)
    alive_f = np.ones(T, bool)
    alive_v = np.ones(V, bool)
    ver = np.zeros(V, np.int64)
    faces = F.tolist()
    nf = T

    def cost_at(q, x):
        h = np.append(x, 1.0)
        return float(h @ q @ h)

    def best(u, v):
        q = Q[u] + Q[v]
        if frozen[u] and frozen[v]:
            return None
        if frozen[u]:
            c = [(cost_at(q, P[u]), 0)]
        elif frozen[v]:
            c = [(cost_at(q, P[v]), 1)]
        else:
            c = [(cost_at(q, P[u]), 0), (cost_at(q, P[v]), 1), (cost_at(q, 0.5 * (P[u] + P[v])), 2)]
        return min(c)

    heap = []
    cnt_id = 0

    def push(u, v):
        nonlocal cnt_id
        r = best(u, v)
        if r is None:
            return
        cnt_id += 1
        heapq.heappush(heap, (r[0], cnt_id, u, v, ver[u], ver[v], r[1]))

    seen = set()
    for a, b in key:
        t = (int(a), int(b))
        if t not in seen:
            seen.add(t)
            push(t[0], t[1])

    def tri_normal(p0, p1, p2):
        c = np.cross(p1 - p0, p2 - p0)
        return c, np.linalg.norm(c)

    while nf > target_faces and heap:
        cost, _, u, v, vu, vv, mode = heapq.heappop(heap)
        if not (alive_v[u] and alive_v[v]) or ver[u] != vu or ver[v] != vv:
            continue
        common = vf[u] & vf[v]
        if len(common) != 2:
            continue
        newp = P[u] if mode == 0 else P[v] if mode == 1 else 0.5 * (P[u] + P[v])
        # comprobación de volteo y de degeneración
        flip = False
        for fi in (vf[u] | vf[v]) - common:
            f = faces[fi]
            p = [P[x] for x in f]
            c0, a0 = tri_normal(*p)
            q = [newp if x in (u, v) else P[x] for x in f]
            c1, a1 = tri_normal(*q)
            if a1 < 1e-12 or a0 < 1e-12 or (c0 @ c1) / (a0 * a1) < flip_cos:
                flip = True
                break
        if flip:
            continue
        # colapsar v en u
        for fi in common:
            alive_f[fi] = False
            nf -= 1
            for x in faces[fi]:
                vf[x].discard(fi)
        for fi in list(vf[v]):
            faces[fi] = [u if x == v else x for x in faces[fi]]
            vf[u].add(fi)
        vf[v] = set()
        alive_v[v] = False
        frozen[u] = frozen[u] or frozen[v]  # el sobreviviente hereda la costura; si no, se abren grietas
        for k in A:
            if mode == 1:
                A[k][u] = A[k][v]
            elif mode == 2:
                A[k][u] = 0.5 * (A[k][u] + A[k][v])
        P[u] = newp
        Q[u] = Q[u] + Q[v]
        ver[u] += 1
        nb = set()
        for fi in vf[u]:
            nb.update(faces[fi])
        nb.discard(u)
        for w in nb:
            push(u, w) if u < w else push(w, u)
    keepf = [faces[i] for i in range(T) if alive_f[i]]
    used = np.unique(np.array(keepf).ravel())
    remap = -np.ones(V, np.int64)
    remap[used] = np.arange(len(used))
    Fn = remap[np.array(keepf)]
    out = {k: A[k][used] for k in A}
    return P[used], Fn, out
