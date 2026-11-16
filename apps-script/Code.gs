/**
 * PATITAS FELICES — backend completo en Google Apps Script.
 * Planilla de Google = base de datos · Drive = fotos · todo bajo tu cuenta de Gmail.
 *
 * Instalación: ver README ("Paso 1"). Resumen:
 *   1) Creá una planilla de Google nueva  2) Extensiones > Apps Script y pegá este archivo
 *   3) Implementar > Nueva implementación > Aplicación web (Ejecutar como: Yo · Acceso: Cualquier persona)
 *   4) Copiá la URL /exec en js/ajustes.js de la tienda.
 * Las pestañas Productos, Categorias, Pedidos y Config se crean solas (con productos de ejemplo).
 *
 * Usuario inicial del panel: admin / admin12345678 (se cambia desde el panel).
 */
var CARPETA_FOTOS = "Patitas Felices - Fotos";
var MAX_IMG = 4 * 1024 * 1024;
var USUARIO_DEFECTO = "admin";
var CLAVE_DEFECTO = "admin12345678";
var SESION_SEG = 6 * 3600; // 6 h
var CAB = {
  Productos: ["slug", "nombre", "categoria", "precio", "precio_anterior", "descripcion", "stock", "etiqueta", "imagen", "activo"],
  Categorias: ["slug", "nombre", "icono"],
  Pedidos: ["id", "fecha", "nombre", "email", "telefono", "direccion", "ciudad", "items", "total", "estado", "notas"],
  Config: ["clave", "valor"],
};
var EJEMPLO_CATEGORIAS = [
  ["alimentos", "Alimentos Balanceados", "nutrition"],
  ["juguetes", "Juguetes Interactivos", "sports_baseball"],
  ["camas", "Camas y Confort", "bed"],
  ["higiene", "Higiene y Cuidado", "soap"],
  ["accesorios", "Accesorios", "pets"],
];
var EJEMPLO_PRODUCTOS = [["alimento-premium-cordero-arroz","Alimento Premium Cordero & Arroz 15kg","alimentos",45990,"","Nutrición óptima adaptada a cada etapa de su vida. Cordero real como primer ingrediente, sin colorantes ni conservantes artificiales.",40,"Más Vendido","https://lh3.googleusercontent.com/aida-public/AB6AXuCcIL4D9UsAYRMEX0TJC2PVQtOX8aEiRa0WeDqBD3-8G-MiN0yxyTWKDAQdgxSWTx5RELjzV2Qh5XZVUIXVD-u01NGgcMVnalysoe1XUb58iDwPQtfGiyfgEPSRf4BHSVJ89wdhCsO3kbQ-1q8T-7ArzYq1yEVlLR2v9_E2C__KDn3fat1C-1lCRA5bKbK80uH9vE2U6QMfZvWSSozu-e__q-u5JZ87XVCHNVAlar8","TRUE"],["mordedor-interactivo-premios","Juguete Interactivo Dispensador de Premios","juguetes",19990,24990,"Estimulación mental y máximo disfrute. Dispensa premios mientras tu perro juega; materiales resistentes y seguros.",25,"-15% Descuento","https://lh3.googleusercontent.com/aida-public/AB6AXuBzRsZMazo8O8IC5Wm0JDNhtVQcv448-YGJrMRFczAa7f8NzGvhqioQ7EXsw-Qq-LcP7pw32RSIDXAuLQuucotyErCN6ZFNM0NG7eDB1cjgjM0MoRWCJctNMqf3r0kwxdsphY5rRZqtearHCTScK82Sp7n-LV02XOHRmJybsl7tQbT8hR8H-Z_9b_VF-5ab-t-Sp-NlKMiiNhV6b7fA0UavQK89Zc6qza0mXxtTmi0","TRUE"],["cama-ortopedica-memory-foam","Cama Ortopédica Memory Foam Confort XL","camas",69990,"","Descanso reparador para sus articulaciones. Funda desmontable y lavable.",12,"","https://lh3.googleusercontent.com/aida-public/AB6AXuCYJ2fQALVboPkhCmEBAdmpATyQgESwbRUZPUaXqV-OS5I4xcB0y-xPRX4TQUWUErTbStfoxnSCl01DB9GnXYRxPIktDB5vOUjLUrZ4VRV0QaLabn1qOfw3TfMqrJ_ppJwmmYViZC7KSfmf9NDwmBb3PR2MM0VmD7OqswxU-Zr6q_EF6qKobf20IG8m4ZFsHboXdZMuAJHxsn6YU_yISRh6hnTPGEHRL8g_HJ9gbWk","TRUE"],["shampoo-avena-aloe","Shampoo Orgánico de Avena y Aloe Vera 500ml","higiene",14500,"","Fórmula natural para un pelaje brillante y suave. Hipoalergénico.",60,"Nuevo","https://lh3.googleusercontent.com/aida-public/AB6AXuC6yWtI3GFtqsyg7gjYtHdLayAVj40JAFcjQWExTPr-gxLFEPnbbI__ur6fyj9eZSbT4Sfa2HfIxNJKcAQ_VpcWOdODIEbNhRgDHzA0MiS4CTVeA-K06fKFoec1IhTyQc0Q0XBehFVUY77lnJs97xVtrR1VQXilET2AM6Bc92eSFWGWXEOJxldFuLLEgwatsO6ffq1TOPHedI3Q2lN2qg4wZ-glHeU8xu3dcS10GJI","TRUE"],["abrigo-impermeable-terracota","Abrigo Impermeable de Invierno","accesorios",32900,"","Abrigo impermeable con forro polar, ideal para días fríos y lluviosos.",18,"","https://lh3.googleusercontent.com/aida-public/AB6AXuC_nkw9tohuxz9iot5VAYhDGEPC1liUXtIJQjjbUg9npGjbiZmBbv6pj-ZM6PD360ylMVtu_gv17nYFY_8U0n1XP62t--a5f4vSSl3-wJcjg1TPSR3cpCV_2-pr_G9SqMrKoM-_HqDrauPAPKRR2GPyHaEqAbSitXtrIJX_KMa1eaZ4_xK3In4Y84n_BML1qXLp_Hv1IyubL1MZGFDGqDKbOJ2Ve7M_B2UI25xJFYY","TRUE"],["hueso-nylon-pollo","Hueso de Nylon Sabor Pollo","juguetes",8900,"","Mordedor ultra resistente con sabor a pollo. Ayuda a la limpieza dental.",50,"","https://lh3.googleusercontent.com/aida-public/AB6AXuAwDjYgy4NGAyGKwskvqSChYh_aoMTh0rF4XmyWYupQ8x6CDklBOyAiCsMP7z5CCeO5E1_nNQ3zMpbyX_0ruSajYu06iDwyiJA_g4oN_MLTL2R0WOyD7yZohHAVn3T3CzJDuzNrnlrLFg_xYc_0MlugnhkUOe1yj9ZYaepu4GZdEHaox9XLi0p7B1yNNedN5Yj5JpRpiWoQ8IX6heaZ8Oe5dA9j3-HJc-LzNcvccRU","TRUE"],["snacks-dentales-naturales","Snacks Dentales Naturales","alimentos",7600,"","Bastones dentales naturales que reducen el sarro y refrescan el aliento.",80,"","https://lh3.googleusercontent.com/aida-public/AB6AXuDumBbmyXV9WQEJYCYtwK-ZZNmJLlOpL812S04gJsXVjAXoV__F5N26p-kzbURwym6f_uLry4SnVmdDhiwBXnl8tL0Pe-ozh5YZBplZrBv5ipWIJFIOm096ZTv0akuPDLgdW2v0YmR3bFHGRUcGCZ21ebTg7J6SGlQRRLWtDZrPgk-r4v-UCT3NUo-Y-tOrtoK-Pn7_KhzXk8JQPqKdzmzg5oHVxt-qOfX2nRaV1X8","TRUE"],["arnes-reflectante-correa","Arnés Reflectante con Correa","accesorios",21900,"","Arnés ergonómico con bandas reflectantes y correa a juego, para paseos seguros.",30,"","https://lh3.googleusercontent.com/aida-public/AB6AXuC6xhBroC9BCcQmZwpD_P9SqEcfiIXYDDaCDH6GZV3vH8XVdyjJqm9Z9Ph_hy7ocT0_bPa__EFxklYwmOqf2X1q0738U0V2BflN5HLZuYh9tQSl9oMM_oP9pU8nhxTMiWvKk7do-bXHPmphCq6QhXqmuYpDc-0byj4qEVaL6FfmV26kEx5QRhpaZ4vuMiECZTpdbjHEf_ecNw2xpxnJbQ18yn-Zu2GfTCmlcTHCGjU","TRUE"],["comedero-doble-antideslizante","Comedero Doble Antideslizante de Acero","accesorios",16500,"","Estación de comida y agua en acero inoxidable sobre base de bambú elevada.",22,"","https://lh3.googleusercontent.com/aida-public/AB6AXuArTVaYwDnY-0M58A6_od8bCWvJVH3r0evVGet76bRlOc7qP8syjqQoKYxmWqngqBhNA-GzuRl-Lxli-WHyf4YYPUhlwUsqFxGzI9HkhQXtAbtVZb0aJ8qNvq-fvyGbMbKF8Ucsl-EyIqJbNjBBuV29TtwuFLjtX_292IGUFlvMuNaVDCkswbHaQQ_--KNCFuRJSwGMTrWQJYdhhdRrXkBilGdZGKLUh4y3wjbMF-4","TRUE"]];

// ============================ Entrada HTTP ============================

function doGet(e) {
  try {
    var a = (e && e.parameter && e.parameter.accion) || "";
    if (a === "publico") return salida(publico());
    return salida({ ok: true, mensaje: "Patitas Felices: backend activo" });
  } catch (err) { return salida({ error: msg(err) }); }
}

function doPost(e) {
  try {
    var p = JSON.parse(e.postData.contents);
    switch (p.accion) {
      case "pedido": return salida(conBloqueo(function () { return crearPedido(p); }));
      case "estadoPedido": return salida(estadoPedido(p.id));
      case "login": return salida(login(p));
      case "logout": cerrarSesion(p.token); return salida({ ok: true });
    }
    if (!sesionValida(p.token)) return salida({ error: "Sesión vencida", sesion: false });
    switch (p.accion) {
      case "admin": return salida(datosAdmin());
      case "guardarConfig": return salida(conBloqueo(function () { return guardarConfig(p.config); }));
      case "guardarCatalogo": return salida(conBloqueo(function () { return guardarCatalogo(p.productos, p.categorias); }));
      case "guardarSeguridad": return salida(conBloqueo(function () { return guardarSeguridad(p); }));
      case "imagen": return salida(subirImagen(p));
    }
    return salida({ error: "Acción desconocida" });
  } catch (err) { return salida({ error: msg(err) }); }
}

function salida(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function msg(e) { return String((e && e.message) || e); }
function conBloqueo(fn) {
  var l = LockService.getScriptLock();
  l.waitLock(20000);
  try { return fn(); } finally { l.releaseLock(); }
}

// ============================ Planilla ============================

function hoja(nombre) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(nombre);
  if (sh) return sh;
  sh = ss.insertSheet(nombre);
  escribir(sh, [CAB[nombre]]);
  if (nombre === "Categorias") escribir(sh, EJEMPLO_CATEGORIAS, 2);
  if (nombre === "Productos") escribir(sh, EJEMPLO_PRODUCTOS, 2);
  return sh;
}

// Todo se guarda como TEXTO PLANO: nada se interpreta como fórmula ("=..."), ni TRUE/FALSE ni números.
function escribir(sh, filas, desde) {
  if (!filas.length) return;
  var ancho = 0, i;
  for (i = 0; i < filas.length; i++) ancho = Math.max(ancho, filas[i].length);
  var m = filas.map(function (f) {
    var r = f.map(function (v) { return v === null || v === undefined ? "" : String(v); });
    while (r.length < ancho) r.push("");
    return r;
  });
  var rg = sh.getRange(desde || 1, 1, m.length, ancho);
  rg.setNumberFormat("@");
  rg.setValues(m);
}

function filas(nombre) {
  var sh = hoja(nombre);
  if (sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, CAB[nombre].length).getDisplayValues();
}

function reemplazar(nombre, datos) {
  var sh = hoja(nombre);
  sh.clearContents();
  escribir(sh, [CAB[nombre]].concat(datos));
}

function num(v) { var n = Number(String(v).replace(",", ".")); return isFinite(n) && n >= 0 ? n : 0; }
function verdadero(v) { return ["false", "no", "0"].indexOf(String(v === undefined || v === "" ? "true" : v).trim().toLowerCase()) < 0; }

function aProducto(f) {
  return { slug: f[0], nombre: f[1], categoria: f[2] || "", precio: num(f[3]), precioAnterior: f[4] ? num(f[4]) : null,
    descripcion: f[5] || "", stock: Math.floor(num(f[6])), etiqueta: f[7] || "", imagen: f[8] || "", activo: verdadero(f[9]) };
}
function productos() { return filas("Productos").filter(function (f) { return f[0] && f[1]; }).map(aProducto); }
function categorias() {
  return filas("Categorias").filter(function (f) { return f[0] && f[1]; }).map(function (f) { return { slug: f[0], nombre: f[1], icono: f[2] || "pets" }; });
}

function leerConfig() {
  var f = filas("Config").filter(function (x) { return x[0] === "config"; })[0];
  if (!f || !f[1]) return {};
  try { return JSON.parse(f[1]); } catch (e) { return {}; }
}

function guardarConfig(c) {
  if (!c || typeof c !== "object" || Array.isArray(c)) throw new Error("Configuración inválida");
  var txt = JSON.stringify(c);
  if (txt.length > 45000) throw new Error("La configuración es demasiado grande");
  var resto = filas("Config").filter(function (x) { return x[0] && x[0] !== "config"; });
  reemplazar("Config", resto.concat([["config", txt]]));
  borrarCache();
  return { ok: true };
}

// ============================ Público (caché) ============================

function publico() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get("publico");
  if (hit) return JSON.parse(hit);
  var d = {
    config: leerConfig(),
    categorias: categorias(),
    productos: productos().filter(function (p) { return p.activo; }),
  };
  try { cache.put("publico", JSON.stringify(d), 600); } catch (e) { /* demasiado grande: sin caché */ }
  return d;
}
function borrarCache() { CacheService.getScriptCache().remove("publico"); }

// ============================ Pedidos ============================

function limpiar(v, max) { return typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max) : ""; }

function crearPedido(p) {
  var c = p.cliente || {};
  var cli = { nombre: limpiar(c.nombre, 120), telefono: limpiar(c.telefono, 40), email: limpiar(c.email, 120),
    direccion: limpiar(c.direccion, 200), ciudad: limpiar(c.ciudad, 100), notas: limpiar(c.notas, 500) };
  if (!cli.nombre || !cli.telefono || !cli.direccion || !cli.ciudad) throw new Error("Completá nombre, teléfono, dirección y ciudad");
  if (cli.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cli.email)) throw new Error("El email no es válido");
  var entrada = p.items;
  if (!Array.isArray(entrada) || !entrada.length || entrada.length > 50) throw new Error("El carrito está vacío");

  var cat = {};
  productos().forEach(function (x) { cat[x.slug] = x; });
  var items = [], subtotal = 0, juntos = {};
  entrada.forEach(function (it) {
    var pr = cat[it && it.slug];
    var cant = Math.floor(Number(it && it.cantidad));
    if (!pr || !pr.activo) throw new Error("Un producto del carrito ya no está disponible");
    if (!(cant >= 1 && cant <= 99)) throw new Error("Cantidad inválida");
    juntos[pr.slug] = (juntos[pr.slug] || 0) + cant;
  });
  Object.keys(juntos).forEach(function (slug) {
    var pr = cat[slug], cant = juntos[slug];
    if (cant > pr.stock) throw new Error("Stock insuficiente de «" + pr.nombre + "» (quedan " + pr.stock + ")");
    items.push({ slug: slug, nombre: pr.nombre, precio: pr.precio, cantidad: cant });
    subtotal += pr.precio * cant;
  });

  var cfg = leerConfig(), env = cfg.envios || {};
  var costo = env.costo === undefined ? 4500 : num(env.costo);
  var gratis = env.gratisDesde === undefined ? 50000 : num(env.gratisDesde);
  var envio = subtotal >= gratis ? 0 : costo;
  var total = subtotal + envio;
  var id = "PF-" + Utilities.getUuid().replace(/-/g, "").slice(0, 8).toUpperCase();
  var fecha = new Date().toISOString();
  var sh = hoja("Pedidos");
  escribir(sh, [[id, fecha, cli.nombre, cli.email, cli.telefono, cli.direccion, cli.ciudad, JSON.stringify(items), total, "Pendiente", cli.notas]], sh.getLastRow() + 1);
  return { id: id, subtotal: subtotal, envio: envio, total: total, items: items, cliente: cli };
}

function estadoPedido(id) {
  id = String(id || "").toUpperCase();
  if (!/^PF-[0-9A-F]{8}$/.test(id)) return { error: "Código inválido" };
  var f = filas("Pedidos").filter(function (x) { return x[0] === id; })[0];
  if (!f) return { encontrado: false };
  var items = [];
  try { items = JSON.parse(f[7]); } catch (e) {}
  return { encontrado: true, id: id, estado: f[9], total: num(f[8]), cantidadProductos: items.length };
}

// ============================ Seguridad ============================

function props() { return PropertiesService.getScriptProperties(); }
function hash(clave, sal) {
  var h = sal + "|" + clave, i;
  for (i = 0; i < 300; i++) {
    h = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h + sal, Utilities.Charset.UTF_8));
  }
  return h;
}
function leerSeg() {
  var raw = props().getProperty("seguridad");
  if (raw) { try { return JSON.parse(raw); } catch (e) {} }
  var sal = "inicial";
  return { usuario: USUARIO_DEFECTO, sal: sal, hash: hash(CLAVE_DEFECTO, sal), porDefecto: true };
}
function igual(a, b) {
  if (a.length !== b.length) return false;
  var r = 0, i;
  for (i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
function tokenHash(t) {
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(t), Utilities.Charset.UTF_8)).slice(0, 40);
}

function login(p) {
  var cache = CacheService.getScriptCache();
  var fallos = Number(cache.get("fallos") || 0);
  if (fallos >= 30) return { error: "Demasiados intentos. Esperá unos minutos." };
  var s = leerSeg();
  var okU = igual(String(p.usuario || ""), s.usuario);
  var okC = igual(hash(String(p.clave || ""), s.sal), s.hash);
  if (!(okU && okC)) {
    cache.put("fallos", String(fallos + 1), 600);
    Utilities.sleep(1500);
    return { error: "Usuario o clave incorrectos" };
  }
  var token = Utilities.getUuid() + Utilities.getUuid();
  cache.put("ses_" + tokenHash(token), "1", SESION_SEG);
  return { token: token, usuario: s.usuario, claveInicial: Boolean(s.porDefecto) };
}
function sesionValida(t) { return Boolean(t) && CacheService.getScriptCache().get("ses_" + tokenHash(t)) === "1"; }
function cerrarSesion(t) { if (t) CacheService.getScriptCache().remove("ses_" + tokenHash(t)); }

function guardarSeguridad(p) {
  var s = leerSeg();
  if (!igual(hash(String(p.claveActual || ""), s.sal), s.hash)) throw new Error("La clave actual no es correcta");
  var usuario = limpiar(p.usuarioNuevo, 40) || s.usuario;
  if (usuario.length < 3) throw new Error("El usuario debe tener al menos 3 caracteres");
  var nueva = String(p.claveNueva || "");
  var sal = s.sal, h = s.hash;
  if (nueva) {
    if (nueva.length < 8) throw new Error("La clave nueva debe tener al menos 8 caracteres");
    sal = Utilities.getUuid();
    h = hash(nueva, sal);
  }
  props().setProperty("seguridad", JSON.stringify({ usuario: usuario, sal: sal, hash: h, porDefecto: false }));
  return { ok: true, usuario: usuario };
}

// ============================ Panel admin ============================

function datosAdmin() {
  return { config: leerConfig(), categorias: categorias(), productos: productos(),
    pedidos: filas("Pedidos").filter(function (f) { return f[0]; }).reverse().slice(0, 100).map(function (f) {
      var items = []; try { items = JSON.parse(f[7]); } catch (e) {}
      return { id: f[0], fecha: f[1], nombre: f[2], telefono: f[4], ciudad: f[6], total: num(f[8]), estado: f[9], items: items };
    }),
    usuario: leerSeg().usuario, claveInicial: Boolean(leerSeg().porDefecto) };
}

var SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function urlImagen(v) { return v === "" || /^https:\/\/[^\s"'<>]+$/i.test(v); }

function guardarCatalogo(prods, cats) {
  if (!Array.isArray(prods) || prods.length > 1000) throw new Error("Lista de productos inválida");
  if (!Array.isArray(cats) || cats.length > 100) throw new Error("Lista de categorías inválida");
  var vistos = {}, outP = [], outC = [], i;
  for (i = 0; i < cats.length; i++) {
    var c = cats[i] || {}, cs = limpiar(c.slug, 60).toLowerCase(), cn = limpiar(c.nombre, 80);
    if (!SLUG.test(cs)) throw new Error("Slug de categoría inválido: «" + cs + "»");
    if (!cn) throw new Error("Falta el nombre de la categoría «" + cs + "»");
    if (vistos["c" + cs]) throw new Error("Categoría repetida: «" + cs + "»");
    vistos["c" + cs] = 1;
    outC.push([cs, cn, limpiar(c.icono, 40) || "pets"]);
  }
  for (i = 0; i < prods.length; i++) {
    var p = prods[i] || {}, s = limpiar(p.slug, 80).toLowerCase(), n = limpiar(p.nombre, 150), img = limpiar(p.imagen, 1000);
    if (!SLUG.test(s)) throw new Error("Slug inválido: «" + s + "» (minúsculas, números y guiones)");
    if (!n) throw new Error("Falta el nombre del producto «" + s + "»");
    if (vistos["p" + s]) throw new Error("Slug repetido: «" + s + "»");
    if (!urlImagen(img)) throw new Error("La imagen de «" + n + "» debe ser un enlace https");
    vistos["p" + s] = 1;
    outP.push([s, n, limpiar(p.categoria, 80), num(p.precio), p.precioAnterior ? num(p.precioAnterior) : "", limpiar(p.descripcion, 2000),
      Math.floor(num(p.stock)), limpiar(p.etiqueta, 40), img, p.activo === false ? "FALSE" : "TRUE"]);
  }
  reemplazar("Categorias", outC);
  reemplazar("Productos", outP);
  borrarCache();
  return { ok: true };
}

function subirImagen(p) {
  var tipo = String(p.tipo || "");
  if (!/^image\/(jpeg|png|webp|gif)$/.test(tipo)) throw new Error("Usá una imagen JPG, PNG, WEBP o GIF");
  var bytes = Utilities.base64Decode(String(p.base64 || ""));
  if (bytes.length > MAX_IMG) throw new Error("La imagen supera 4 MB");
  var it = DriveApp.getFoldersByName(CARPETA_FOTOS);
  var carpeta = it.hasNext() ? it.next() : DriveApp.createFolder(CARPETA_FOTOS);
  var nombre = limpiar(String(p.nombre || "foto").replace(/[^\w.\- ]/g, "_"), 80) || "foto";
  var archivo = carpeta.createFile(Utilities.newBlob(bytes, tipo, nombre));
  archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { url: "https://lh3.googleusercontent.com/d/" + archivo.getId() + "=w900" };
}
