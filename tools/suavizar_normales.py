#!/usr/bin/env python3
"""Recalcula normales suaves (soldando vértices por posición) en un scene-data v2.
Uso: python3 tools/suavizar_normales.py ENTRADA.json.gz SALIDA.json.gz"""
import sys,gzip,json,base64,numpy as np
d=json.loads(gzip.open(sys.argv[1]).read())
for g in d['geometries']:
    P=np.frombuffer(base64.b64decode(g['p']),'<f4').reshape(-1,3).astype(np.float64)
    I=np.frombuffer(base64.b64decode(g['i']),'<u4').reshape(-1,3)
    fn=np.cross(P[I[:,1]]-P[I[:,0]],P[I[:,2]]-P[I[:,0]])  # peso por área
    q=np.round(P*1e4).astype(np.int64)
    _,inv=np.unique(q,axis=0,return_inverse=True);inv=inv.ravel()
    acc=np.zeros((inv.max()+1,3))
    for k in range(3):np.add.at(acc,inv[I[:,k]],fn)
    n=acc[inv];l=np.linalg.norm(n,axis=1,keepdims=True);l[l==0]=1;n=(n/l).astype('<f4')
    g['n']=base64.b64encode(n.tobytes()).decode()
gzip.open(sys.argv[2],'wt',compresslevel=9).write(json.dumps(d,separators=(',',':')))
