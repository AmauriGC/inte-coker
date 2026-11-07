"""Sillón Alba: sillón tapizado con capitonado, vivos, cojín suelto y patas torneadas.

Se ejecuta sin interfaz:  blender -b muebles.blend --python sillon_alba.py -- <repo>
Escala real en metros, apoyado en z = 0, frente hacia -Y.
"""
import math
import os
import sys

import bmesh
import bpy
import numpy as np
from mathutils import Vector

REPO = sys.argv[sys.argv.index("--") + 1]
SLUG = "sillon-alba"
SOLO_EXPORTAR = "--solo-exportar" in sys.argv
RENDER = "--render" in sys.argv
rng = np.random.default_rng(7)

# ---------------------------------------------------------------- texturas


def imagen(nombre, rgba, no_color=False):
    h, w = rgba.shape[:2]
    img = bpy.data.images.get(nombre) or bpy.data.images.new(nombre, w, h, alpha=False)
    img.scale(w, h)
    if no_color:
        img.colorspace_settings.name = "Non-Color"
    img.pixels.foreach_set(rgba.astype(np.float32).ravel())
    img.pack()
    return img


def ruido(n, escala):
    """Ruido suave que se repite: suma de senos con fases al azar."""
    y, x = np.mgrid[0:n, 0:n] / n
    r = np.zeros((n, n))
    for k in range(1, 6):
        fx, fy = rng.integers(1, escala * k, 2)
        r += np.sin(2 * np.pi * (fx * x + fy * y) + rng.uniform(0, 6.28)) / k
    return (r - r.min()) / (r.max() - r.min())


def tela(n=512, hilo=16):
    """Tejido liso (sarga sencilla): altura y albedo en grises claros."""
    y, x = np.mgrid[0:n, 0:n]
    celda = ((x // hilo) + (y // hilo)) % 2
    fx = np.cos(np.pi * ((x % hilo) - hilo / 2) / hilo)
    fy = np.cos(np.pi * ((y % hilo) - hilo / 2) / hilo)
    altura = np.where(celda == 0, fy, fx) ** 0.8
    altura = 0.75 * altura + 0.25 * ruido(n, 9)
    albedo = 0.86 + 0.12 * altura + 0.03 * (rng.random((n, n)) - 0.5)
    albedo = np.clip(albedo, 0, 1)
    gy, gx = np.gradient(altura)
    fuerza = 2.2
    nx, ny, nz = -gx * fuerza, gy * fuerza, np.ones_like(altura)
    largo = np.sqrt(nx**2 + ny**2 + nz**2)
    normal = np.stack([nx / largo, ny / largo, nz / largo], -1) * 0.5 + 0.5
    a = np.ones((n, n, 1))
    alb = np.concatenate([np.repeat(albedo[..., None], 3, -1), a], -1)
    nor = np.concatenate([normal, a], -1)
    return alb[::-1], nor[::-1]


def nogal(n=512):
    y, x = np.mgrid[0:n, 0:n] / n
    vetas = np.sin(2 * np.pi * (x * 9 + 0.35 * ruido(n, 4))) * 0.5 + 0.5
    vetas = vetas**3 * 0.7 + ruido(n, 20) * 0.3
    oscuro = np.array([0.105, 0.052, 0.027])
    claro = np.array([0.215, 0.118, 0.066])
    color = oscuro + (claro - oscuro) * vetas[..., None]
    return np.concatenate([color, np.ones((n, n, 1))], -1)


# --------------------------------------------------------------- materiales


def principled(m):
    m.use_nodes = True
    return next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")


def entrada(b, *nombres):
    for nombre in nombres:
        if nombre in b.inputs:
            return b.inputs[nombre]
    return None


def mat_tela():
    m = bpy.data.materials.get("GC_Color") or bpy.data.materials.new("GC_Color")
    b = principled(m)
    nt = m.node_tree
    for n in list(nt.nodes):
        if n.type not in ("BSDF_PRINCIPLED", "OUTPUT_MATERIAL"):
            nt.nodes.remove(n)
    alb, nor = tela()
    ti = nt.nodes.new("ShaderNodeTexImage")
    ti.image = imagen("alba_tela_color", alb)
    tn = nt.nodes.new("ShaderNodeTexImage")
    tn.image = imagen("alba_tela_normal", nor, no_color=True)
    mezcla = nt.nodes.new("ShaderNodeMix")
    mezcla.data_type = "RGBA"
    mezcla.blend_type = "MULTIPLY"
    mezcla.inputs["Factor"].default_value = 1.0
    # Arena #B89A6E en lineal: el front cambia este factor en vivo (fase 15).
    sock = lambda col, ident: next(x for x in col if x.identifier == ident)
    sock(mezcla.inputs, "B_Color").default_value = (0.479, 0.323, 0.159, 1)
    nt.links.new(ti.outputs["Color"], sock(mezcla.inputs, "A_Color"))
    nt.links.new(sock(mezcla.outputs, "Result_Color"), b.inputs["Base Color"])
    nm = nt.nodes.new("ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = 0.6
    nt.links.new(tn.outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
    b.inputs["Roughness"].default_value = 0.88
    s = entrada(b, "Sheen Weight", "Sheen")
    if s:
        s.default_value = 0.15
    m.diffuse_color = (0.72, 0.6, 0.43, 1)
    return m


def mat_nogal():
    m = bpy.data.materials.get("Madera_Nogal") or bpy.data.materials.new("Madera_Nogal")
    b = principled(m)
    nt = m.node_tree
    ti = nt.nodes.new("ShaderNodeTexImage")
    ti.image = imagen("alba_nogal", nogal())
    nt.links.new(ti.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.42
    c = entrada(b, "Coat Weight", "Clearcoat")
    if c:
        c.default_value = 0.25
    m.diffuse_color = (0.33, 0.2, 0.12, 1)
    return m


def mat_laton():
    m = bpy.data.materials.get("Laton")
    if m:
        return m
    m = bpy.data.materials.new("Laton")
    b = principled(m)
    b.inputs["Base Color"].default_value = (0.62, 0.45, 0.21, 1)
    b.inputs["Metallic"].default_value = 1.0
    b.inputs["Roughness"].default_value = 0.3
    return m


# ------------------------------------------------------------------ mallas

COL = bpy.data.collections.get("Sillon_Alba") or bpy.data.collections.new("Sillon_Alba")
if COL.name not in bpy.context.scene.collection.children:
    bpy.context.scene.collection.children.link(COL)
for o in list(COL.objects):
    bpy.data.objects.remove(o, do_unlink=True)

RAIZ = bpy.data.objects.new("Sillon_Alba", None)
RAIZ.empty_display_size = 0.3
COL.objects.link(RAIZ)


def objeto(nombre, bm, material, suave=True, subsurf=0):
    me = bpy.data.meshes.new(nombre)
    bm.to_mesh(me)
    bm.free()
    if suave:
        for p in me.polygons:
            p.use_smooth = True
    me.materials.append(material)
    o = bpy.data.objects.new(nombre, me)
    COL.objects.link(o)
    o.parent = RAIZ
    if subsurf:
        md = o.modifiers.new("Subsurf", "SUBSURF")
        md.levels = subsurf
        md.render_levels = subsurf
    return o


def uv_caja(bm, tam=0.06):
    """Proyección de caja en metros: la tela repite cada `tam` sin estirarse."""
    capa = bm.loops.layers.uv.verify()
    for f in bm.faces:
        n = f.normal
        eje = max(range(3), key=lambda i: abs(n[i]))
        for lp in f.loops:
            co = lp.vert.co
            if eje == 0:
                uv = (co.y, co.z)
            elif eje == 1:
                uv = (co.x, co.z)
            else:
                uv = (co.x, co.y)
            lp[capa].uv = (uv[0] / tam, uv[1] / tam)


def caja_suave(tamano, centro, cortes=(6, 6, 3), corona=0.0, panza=0.0):
    """Caja subdividida con la tapa abombada y los costados inflados (cojín)."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for i in range(3):
        if cortes[i]:
            aristas = [e for e in bm.edges if abs((e.verts[0].co - e.verts[1].co)[i]) > 0.5]
            bmesh.ops.subdivide_edges(bm, edges=aristas, cuts=cortes[i], use_grid_fill=True)
    sx, sy, sz = tamano
    for v in bm.verts:
        u, w, h = v.co.x * 2, v.co.y * 2, v.co.z * 2
        v.co.x *= sx
        v.co.y *= sy
        v.co.z *= sz
        lleno = (1 - u * u) * (1 - w * w)
        if h > 0.99:
            v.co.z += corona * lleno
        elif h < -0.99:
            v.co.z -= corona * 0.3 * lleno
        else:
            k = (1 - h * h)
            v.co.x += math.copysign(panza * k * (1 - w * w), u) if abs(u) > 0.99 else 0
            v.co.y += math.copysign(panza * k * (1 - u * u), w) if abs(w) > 0.99 else 0
    bmesh.ops.translate(bm, verts=bm.verts, vec=Vector(centro))
    bm.normal_update()
    return bm


def tubo(nombre, puntos, radio, material, ciclico=True):
    """Vivo (piping): curva con biselado convertida a malla."""
    cu = bpy.data.curves.new(nombre, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radio
    cu.bevel_resolution = 2
    cu.resolution_u = 6
    sp = cu.splines.new("POLY")
    sp.points.add(len(puntos) - 1)
    for p, co in zip(sp.points, puntos):
        p.co = (*co, 1)
    sp.use_cyclic_u = ciclico
    tmp = bpy.data.objects.new(nombre + "_tmp", cu)
    COL.objects.link(tmp)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg))
    bpy.data.objects.remove(tmp, do_unlink=True)
    bpy.data.curves.remove(cu)
    for p in me.polygons:
        p.use_smooth = True
    me.materials.append(material)
    bm = bmesh.new()
    bm.from_mesh(me)
    uv_caja(bm, 0.03)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(nombre, me)
    COL.objects.link(o)
    o.parent = RAIZ
    return o


def rect_redondo(cx, cz, ancho, alto, r, y=None, plano="xz", z=None, n=6):
    """Puntos de un rectángulo con esquinas redondas (en XZ con y fija, o en XY con z fija)."""
    pts = []
    esquinas = [(ancho / 2 - r, alto / 2 - r, 0), (-ancho / 2 + r, alto / 2 - r, 90), (-ancho / 2 + r, -alto / 2 + r, 180), (ancho / 2 - r, -alto / 2 + r, 270)]
    for ex, ez, a0 in esquinas:
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n)
            px, pz = cx + ex + r * math.cos(a), cz + ez + r * math.sin(a)
            pts.append((px, y, pz) if plano == "xz" else (px, pz, z))
    return pts


def pata(nombre, x, y, madera, laton):
    perfil = [(0.0, 0.022), (0.0175, 0.022), (0.0185, 0.05), (0.0215, 0.085), (0.026, 0.1), (0.022, 0.108), (0.0255, 0.122), (0.03, 0.135), (0.03, 0.142), (0.0, 0.142)]
    bm = bmesh.new()
    vs = [bm.verts.new((r, 0, z)) for r, z in perfil]
    es = [bm.edges.new((vs[i], vs[i + 1])) for i in range(len(vs) - 1)]
    bmesh.ops.spin(bm, geom=vs + es, cent=(0, 0, 0), axis=(0, 0, 1), angle=2 * math.pi, steps=20, use_merge=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    capa = bm.loops.layers.uv.verify()
    for f in bm.faces:
        for lp in f.loops:
            co = lp.vert.co
            lp[capa].uv = ((math.atan2(co.y, co.x) / (2 * math.pi)) % 1.0, co.z / 0.3)
    bmesh.ops.translate(bm, verts=bm.verts, vec=Vector((x, y, 0)))
    objeto(nombre, bm, madera)
    # Casquillo de latón al pie.
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=20, radius1=0.0165, radius2=0.0175, depth=0.022)
    bmesh.ops.translate(bm, verts=bm.verts, vec=Vector((x, y, 0.011)))
    objeto(nombre + "_casquillo", bm, laton)


def respaldo(material):
    """Panel capitonado: frente con hundidos en rombo y botones forrados."""
    ancho, alto, grueso = 0.6, 0.56, 0.15
    bm = caja_suave((ancho, grueso, alto), (0, 0, 0), cortes=(23, 2, 21))
    filas = [(0.2, (-0.21, -0.07, 0.07, 0.21)), (0.07, (-0.14, 0.0, 0.14)), (-0.06, (-0.21, -0.07, 0.07, 0.21))]
    botones = [(bx, bz) for bz, xs in filas for bx in xs]
    sigma = 0.027
    for v in bm.verts:
        if v.co.y < -grueso / 2 + 1e-4:
            u, w = v.co.x / (ancho / 2), v.co.z / (alto / 2)
            hinchado = 0.034 * max(0.0, (1 - u * u)) * max(0.0, (1 - w * w))
            hundido = max(math.exp(-((v.co.x - bx) ** 2 + (v.co.z - bz) ** 2) / (2 * sigma * sigma)) for bx, bz in botones)
            v.co.y -= hinchado
            v.co.y += 0.05 * hundido * (0.6 + 0.4 * (1 - u * u))
    bm.normal_update()
    uv_caja(bm)
    inclinacion = math.radians(-11)
    pos = Vector((0, 0.285, 0.33 + alto / 2))
    rot = bmesh.ops.rotate
    rot(bm, verts=bm.verts, cent=(0, 0, 0), matrix=__import__("mathutils").Matrix.Rotation(inclinacion, 3, "X"))
    bmesh.ops.translate(bm, verts=bm.verts, vec=pos)
    objeto("alba_respaldo", bm, material, subsurf=1)
    mat_rot = __import__("mathutils").Matrix.Rotation(inclinacion, 3, "X")
    for i, (bx, bz) in enumerate(botones):
        b = bmesh.new()
        bmesh.ops.create_uvsphere(b, u_segments=14, v_segments=8, radius=0.0125)
        for v in b.verts:
            v.co.y *= 0.55
        uv_caja(b, 0.03)
        local = Vector((bx, -grueso / 2 + 0.05 * 0.92 - 0.012, bz))
        bmesh.ops.rotate(b, verts=b.verts, cent=(0, 0, 0), matrix=mat_rot)
        bmesh.ops.translate(b, verts=b.verts, vec=mat_rot @ local + pos)
        objeto(f"alba_boton_{i}", b, material)


def construir():
    tela_m, madera, laton = mat_tela(), mat_nogal(), mat_laton()

    for sx in (-1, 1):
        for sy in (-1, 1):
            pata(f"alba_pata_{sx}_{sy}", sx * 0.33, sy * 0.31, madera, laton)

    # Base tapizada.
    bm = caja_suave((0.82, 0.8, 0.17), (0, 0, 0.142 + 0.085), cortes=(5, 5, 1), panza=0.006)
    uv_caja(bm)
    o = objeto("alba_base", bm, tela_m, subsurf=1)
    md = o.modifiers.new("Bevel", "BEVEL")
    md.width, md.segments, md.limit_method = 0.025, 2, "ANGLE"
    o.modifiers.move(1, 0)

    # Brazos con vivo al frente.
    for s in (-1, 1):
        cx = s * 0.355
        bm = caja_suave((0.11, 0.8, 0.5), (cx, 0, 0.142 + 0.25), cortes=(0, 4, 0))
        uv_caja(bm)
        o = objeto(f"alba_brazo_{s}", bm, tela_m)
        md = o.modifiers.new("Bevel", "BEVEL")
        md.width, md.segments, md.limit_method = 0.03, 5, "ANGLE"
        md.harden_normals = False
        tubo(f"alba_vivo_brazo_{s}", rect_redondo(cx, 0.142 + 0.25, 0.088, 0.478, 0.022, y=-0.3985), 0.005, tela_m)

    # Cojín suelto con vivos arriba y abajo.
    cz, alto_c = 0.312 + 0.065, 0.13
    bm = caja_suave((0.59, 0.66, alto_c), (0, -0.05, cz), cortes=(7, 7, 2), corona=0.018, panza=0.012)
    uv_caja(bm)
    objeto("alba_cojin", bm, tela_m, subsurf=2)
    for nombre, z in (("alba_vivo_cojin_arriba", cz + alto_c / 2 - 0.004), ("alba_vivo_cojin_abajo", cz - alto_c / 2 + 0.004)):
        tubo(nombre, rect_redondo(0, -0.05, 0.6, 0.67, 0.045, plano="xy", z=z), 0.0055, tela_m)

    respaldo(tela_m)


def contar_triangulos():
    dg = bpy.context.evaluated_depsgraph_get()
    total = 0
    for o in COL.objects:
        if o.type == "MESH":
            me = o.evaluated_get(dg).to_mesh()
            me.calc_loop_triangles()
            total += len(me.loop_triangles)
            o.evaluated_get(dg).to_mesh_clear()
    return total


def medidas():
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for o in COL.objects:
        if o.type == "MESH":
            ev = o.evaluated_get(dg)
            pts += [ev.matrix_world @ Vector(c) for c in ev.bound_box]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return mn, mx


def exportar():
    ruta = os.path.join(REPO, "blender", "export", SLUG + ".glb")
    bpy.ops.object.select_all(action="DESELECT")
    for o in COL.objects:
        o.select_set(True)
    bpy.context.view_layer.objects.active = RAIZ
    kwargs = dict(filepath=ruta, export_format="GLB", use_selection=True, export_apply=True, export_yup=True, export_cameras=False, export_lights=False)
    try:
        bpy.ops.export_scene.gltf(**kwargs, export_image_format="JPEG", export_image_quality=82)
    except TypeError:
        bpy.ops.export_scene.gltf(**kwargs, export_image_format="JPEG")
    print("GLB", ruta, round(os.path.getsize(ruta) / 1024), "KB")


def renderizar():
    sc = bpy.context.scene
    for lc in bpy.context.view_layer.layer_collection.children:
        lc.exclude = lc.name not in ("Estudio", "Sillon_Alba")
    bpy.context.view_layer.update()
    mn, mx = medidas()
    ctr, tam = (mn + mx) / 2, (mx - mn).length
    bpy.data.objects["Camara_Objetivo"].location = ctr
    cam = sc.camera
    dist = (tam / 2 * 1.25) / math.tan(cam.data.angle / 2)
    cam.location = ctr + Vector((0.9, -1.4, 0.55)).normalized() * dist
    for ln, off in (("Luz_Clave", (-2.5, -3.0, 3.5)), ("Luz_Relleno", (3.0, -2.5, 2.0)), ("Luz_Contra", (0.5, 3.0, 3.0))):
        bpy.data.objects[ln].location = ctr + Vector(off) * max(1.0, tam / 1.5)
    sc.cycles.device = "CPU"
    sc.cycles.samples = 64
    sc.cycles.use_denoising = True
    sc.render.film_transparent = True
    sc.render.resolution_x = sc.render.resolution_y = 1200
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    crudo = os.path.join(REPO, "blender", "renders", SLUG + "_crudo.png")
    sc.render.filepath = crudo
    bpy.ops.render.render(write_still=True)
    recortar(crudo)


def recortar(crudo):
    img = bpy.data.images.load(crudo)
    w, h = img.size
    px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)
    filas = np.where(px[..., 3].max(axis=1) > 0.01)[0]
    cols = np.where(px[..., 3].max(axis=0) > 0.01)[0]
    m = 12
    y0, y1 = max(0, filas[0] - m), min(h, filas[-1] + m + 1)
    x0, x1 = max(0, cols[0] - m), min(w, cols[-1] + m + 1)
    corte = px[y0:y1, x0:x1]
    out = bpy.data.images.new(SLUG + "_corte", x1 - x0, y1 - y0, alpha=True)
    out.pixels.foreach_set(corte.ravel())
    sc = bpy.context.scene
    for fmt, ext in (("PNG", ".png"), ("WEBP", ".webp")):
        sc.render.image_settings.file_format = fmt
        if fmt == "WEBP":
            sc.render.image_settings.quality = 82
        out.save_render(os.path.join(REPO, "blender", "renders", SLUG + ext), scene=sc)
    bpy.data.images.remove(img)
    os.remove(crudo)
    print("RENDER", x1 - x0, "x", y1 - y0)


construir()
mn, mx = medidas()
print("MEDIDAS cm", [round((mx[i] - mn[i]) * 100, 1) for i in range(3)], "zmin", round(mn.z, 4))
print("TRIANGULOS", contar_triangulos())
exportar()
if RENDER:
    renderizar()
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(REPO, "blender", SLUG + ".blend"), copy=True, compress=True)
print("LISTO")
