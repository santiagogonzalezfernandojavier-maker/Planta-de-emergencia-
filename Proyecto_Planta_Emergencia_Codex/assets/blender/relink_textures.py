"""En Blender, ejecutar con la escena abierta si faltan rutas de texturas.
No modifica el archivo original: guarda una copia junto a este script.
"""
import bpy
from pathlib import Path
base = Path(__file__).resolve().parent
for image in bpy.data.images:
    if image.packed_file:
        continue
    candidate = base / Path(bpy.path.abspath(image.filepath)).name
    if candidate.is_file():
        image.filepath = str(candidate)
        image.reload()
bpy.ops.wm.save_as_mainfile(filepath=str(base / 'Operarios_Rutas_Locales.blend'), compress=True)
