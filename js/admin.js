/* Panel de administración (se carga solo al entrar a #/admin). Todo se guarda en tu Google Sheet vía Apps Script. */
(function () {
  "use strict";
  var PF = window.PF, esc = PF.esc;
  var TOK = "pf_tok";
  var A = { listo: false, token: "", seccion: "general", M: null, pedidos: [], usuario: "", claveInicial: false, filtro: "", subiendo: "", raiz: null };

  var SECCIONES = [
    ["general", "General", "storefront"], ["inicio", "Página de inicio", "home"], ["apariencia", "Apariencia", "palette"],
    ["envios", "Envíos y WhatsApp", "local_shipping"], ["chatbot", "Chatbot", "smart_toy"], ["productos", "Productos", "inventory_2"],
    ["categorias", "Categorías", "category"], ["pedidos", "Pedidos", "receipt_long"], ["seguridad", "Usuario y clave", "lock"],
  ];

  // ------------------------------------------------------------ helpers de formulario
  function get(o, ruta) { return ruta.split(".").reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function set(o, ruta, v) {
    var ks = ruta.split("."), last = ks.pop(), t = ks.reduce(function (a, k) { return a[k]; }, o);
    t[last] = v;
  }
  function slugify(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80); }

  function campo(ruta, label, o) {
    o = o || {};
    var v = get(A.M, ruta);
    return '<label class="block text-sm font-medium">' + label + '<input data-r="' + ruta + '" data-t="' + (o.num ? "num" : o.slug ? "slug" : "txt") + '" type="' + (o.num ? "number" : o.tipo || "text") + '" value="' + esc(v == null ? "" : v) + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : "") + (o.min !== undefined ? ' min="' + o.min + '"' : "") + ' class="input mt-1">' + (o.ayuda ? '<span class="mt-1 block text-xs font-normal text-on-surface-variant">' + o.ayuda + "</span>" : "") + "</label>";
  }
  function area(ruta, label, filas, ayuda) {
    return '<label class="block text-sm font-medium">' + label + '<textarea data-r="' + ruta + '" data-t="txt" rows="' + (filas || 3) + '" class="input mt-1">' + esc(get(A.M, ruta) || "") + "</textarea>" + (ayuda ? '<span class="mt-1 block text-xs font-normal text-on-surface-variant">' + ayuda + "</span>" : "") + "</label>";
  }
  function interruptor(ruta, label) {
    var on = Boolean(get(A.M, ruta));
    return '<label class="flex cursor-pointer items-center gap-3 text-sm font-medium"><input type="checkbox" class="peer sr-only" data-r="' + ruta + '" data-t="bool"' + (on ? " checked" : "") + '><span class="relative h-6 w-11 rounded-full bg-outline-variant transition peer-checked:bg-primary peer-focus-visible:ring-4 peer-focus-visible:ring-primary-container/40 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:left-[22px]"></span>' + label + "</label>";
  }
  function boton(texto, acc, tipo) {
    var est = { p: "bg-primary text-on-primary shadow-soft hover:-translate-y-0.5 hover:shadow-lift", s: "bg-surface-container-high hover:bg-surface-container-highest", d: "bg-error-container text-error hover:brightness-95" }[tipo || "s"];
    return '<button type="button" data-a="' + acc + '" class="rounded-full px-5 py-2 text-sm font-semibold transition disabled:opacity-60 ' + est + '">' + texto + "</button>";
  }
  function tarjeta(titulo, cuerpo, acciones) {
    return '<section class="animate-pop-in rounded-xl bg-surface-container-lowest p-6 shadow-soft"><div class="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 class="font-heading text-lg font-bold">' + titulo + "</h2>" + (acciones || "") + '</div><div class="space-y-4">' + cuerpo + "</div></section>";
  }
  var fila = function () { return '<div class="grid gap-4 md:grid-cols-2">' + [].slice.call(arguments).join("") + "</div>"; };
  var guardarCfg = boton("Guardar cambios", "guardar-cfg", "p");

  // ------------------------------------------------------------ secciones
  var VISTAS = {
    general: function () {
      var menu = A.M.cfg.tienda.menu.map(function (l, i) {
        return '<div class="flex items-end gap-2"><div class="flex-1">' + campo("cfg.tienda.menu." + i + ".etiqueta", "Texto") + '</div><div class="flex-1">' + campo("cfg.tienda.menu." + i + ".href", "Destino", { ph: "#/tienda?categoria=juguetes" }) + "</div>" + boton("✕", "del:cfg.tienda.menu:" + i, "d") + "</div>";
      }).join("");
      return tarjeta("General",
        fila(campo("cfg.tienda.nombre", "Nombre de la tienda"), campo("cfg.tienda.eslogan", "Eslogan")) +
        area("cfg.tienda.descripcion", "Descripción (para buscadores)", 2) +
        fila(campo("cfg.tienda.logoIcono", "Ícono del logo", { ayuda: 'Nombre de un ícono de <a class="underline" target="_blank" rel="noopener" href="https://fonts.google.com/icons">Material Symbols</a> (ej: pets, favorite, storefront).' }), campo("cfg.tienda.moneda", "Moneda (código)", { ph: "ARS", ayuda: "ARS, USD, EUR, MXN, CLP…" })) +
        fila(campo("cfg.tienda.email", "Email de contacto"), campo("cfg.tienda.horarios", "Horarios de atención")) +
        area("cfg.tienda.footerTexto", "Texto del pie de página", 2) +
        '<div><p class="mb-2 text-sm font-medium">Menú superior</p><div class="space-y-3">' + menu + '</div><div class="mt-3">' + boton("+ Agregar enlace", "add:menu", "s") + '</div><p class="mt-2 text-xs text-on-surface-variant">Destinos: #/ (inicio), #/tienda, #/tienda?categoria=<i>slug</i>, o un enlace https://…</p></div>', guardarCfg);
    },
    inicio: function () {
      var ben = A.M.cfg.inicio.beneficios.map(function (b, i) {
        return '<div class="space-y-3 rounded-lg border border-outline-variant/60 p-4">' + fila(campo("cfg.inicio.beneficios." + i + ".icono", "Ícono"), campo("cfg.inicio.beneficios." + i + ".titulo", "Título")) + area("cfg.inicio.beneficios." + i + ".texto", "Texto", 2) + boton("Quitar", "del:cfg.inicio.beneficios:" + i, "d") + "</div>";
      }).join("");
      return tarjeta("Portada",
        campo("cfg.inicio.heroBadge", "Etiqueta superior") + campo("cfg.inicio.heroTitulo", "Título") + area("cfg.inicio.heroTexto", "Texto", 3) +
        campo("cfg.inicio.heroImagen", "Imagen de portada (enlace https)", { ayuda: "Vacío = se usa la foto del primer producto." }) +
        fila(campo("cfg.inicio.botonPrincipal", "Botón principal"), campo("cfg.inicio.botonSecundario", "Botón secundario")) +
        fila(campo("cfg.inicio.garantiaTitulo", "Sello: título"), campo("cfg.inicio.garantiaTexto", "Sello: texto")), guardarCfg) +
        tarjeta("Secciones",
          '<div class="flex flex-wrap gap-6">' + interruptor("cfg.inicio.mostrarCategorias", "Mostrar categorías") + interruptor("cfg.inicio.mostrarEstrella", "Mostrar productos estrella") + interruptor("cfg.inicio.mostrarBeneficios", "Mostrar beneficios") + "</div>" +
          fila(campo("cfg.inicio.categoriasSubtitulo", "Categorías: subtítulo"), campo("cfg.inicio.categoriasTitulo", "Categorías: título")) +
          fila(campo("cfg.inicio.estrellaSubtitulo", "Estrella: subtítulo"), campo("cfg.inicio.estrellaTitulo", "Estrella: título")) +
          campo("cfg.inicio.porQueTitulo", "Título de beneficios") + ben + boton("+ Agregar beneficio", "add:beneficio", "s"), guardarCfg);
    },
    apariencia: function () {
      var c = function (r, l) {
        var v = get(A.M, r);
        return '<label class="block text-sm font-medium">' + l + '<span class="mt-1 flex items-center gap-3"><input type="color" data-r="' + r + '" data-t="txt" value="' + esc(v) + '" class="h-11 w-16 cursor-pointer rounded border border-outline-variant bg-white"><code class="text-xs">' + esc(v) + "</code></span></label>";
      };
      return tarjeta("Colores", fila(c("cfg.apariencia.colorPrimario", "Color principal"), c("cfg.apariencia.colorSecundario", "Color secundario")) +
        '<p class="text-sm text-on-surface-variant">El resto de la paleta (tonos claros y oscuros) se calcula sola. Guardá y mirá la tienda.</p>', guardarCfg);
    },
    envios: function () {
      return tarjeta("WhatsApp del negocio",
        campo("cfg.whatsapp.numero", "Número de WhatsApp", { ph: "5493811234567", ayuda: "Con código de país, sin + ni espacios. Argentina: 549 + código de área + número. <b>Aquí llegan los pedidos.</b>" }) +
        campo("cfg.whatsapp.encabezado", "Primera línea del mensaje") + campo("cfg.whatsapp.despedida", "Última línea del mensaje"), guardarCfg) +
        tarjeta("Envíos", fila(campo("cfg.envios.costo", "Costo de envío", { num: true, min: 0 }), campo("cfg.envios.gratisDesde", "Envío gratis desde", { num: true, min: 0, ayuda: "Poné 0 para que siempre sea gratis." })), guardarCfg) +
        tarjeta("Pantalla de compra", campo("cfg.checkout.titulo", "Título") + area("cfg.checkout.aviso", "Aviso al cliente", 2) + campo("cfg.checkout.textoBoton", "Texto del botón"), guardarCfg);
    },
    chatbot: function () {
      var cb = A.M.cfg.chatbot;
      var temas = cb.temas.map(function (t, i) {
        var r = "cfg.chatbot.temas." + i + ".";
        return '<details class="rounded-lg border border-outline-variant/60 transition open:shadow-soft"><summary class="flex cursor-pointer items-center gap-3 p-3"><span class="flex-1 font-medium">' + esc(t.etiqueta) + '</span><span class="rounded-full bg-surface-container px-2 py-0.5 text-xs">' + esc(t.tipo) + "</span>" + (t.enMenu ? '<span class="rounded-full bg-secondary-container px-2 py-0.5 text-xs">en el menú</span>' : "") + '</summary><div class="space-y-3 border-t border-outline-variant/60 p-4">' +
          fila(campo(r + "etiqueta", "Texto del botón"), '<label class="block text-sm font-medium">Tipo de respuesta<select data-r="' + r + 'tipo" data-t="txt" class="input mt-1">' + [["texto", "Texto fijo"], ["saludo", "Saludo (bienvenida)"], ["ofertas", "Muestra ofertas"], ["categorias", "Muestra categorías"], ["pedido", "Consulta de pedido"]].map(function (o) { return '<option value="' + o[0] + '"' + (t.tipo === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></label>") +
          campo(r + "palabras", "Palabras clave (separadas por coma)", { ayuda: "Si el cliente escribe alguna de estas palabras, se responde este tema." }) +
          area(r + "respuesta", "Respuesta", 3, "Podés usar {tienda} {costo_envio} {envio_gratis} {email} {horarios} {whatsapp} y **negrita**.") +
          '<div class="flex flex-wrap items-center justify-between gap-3">' + interruptor(r + "enMenu", "Mostrar en el menú de botones") + '<div class="flex gap-2">' + boton("↑", "up:cfg.chatbot.temas:" + i, "s") + boton("↓", "down:cfg.chatbot.temas:" + i, "s") + boton("Borrar", "del:cfg.chatbot.temas:" + i, "d") + "</div></div></div></details>";
      }).join("");
      return tarjeta("Asistente", interruptor("cfg.chatbot.activo", "Chatbot activo") +
        area("cfg.chatbot.bienvenida", "Mensaje de bienvenida", 2) + area("cfg.chatbot.mensajeMenu", "Mensaje al pedir las opciones", 2) + area("cfg.chatbot.fueraDeTema", "Respuesta cuando la consulta no corresponde", 2) +
        fila(campo("cfg.chatbot.textoBotonMenu", "Texto del botón «ver opciones»"), campo("cfg.chatbot.limitePorMinuto", "Mensajes por minuto (límite)", { num: true, min: 1 })), guardarCfg) +
        tarjeta("Temas y respuestas (" + cb.temas.length + ")", '<div class="space-y-3">' + temas + "</div>" + boton("+ Agregar tema", "add:tema", "s"), guardarCfg);
    },
    productos: function () {
      var m = A.M.cfg.tienda.moneda, f = A.filtro.toLowerCase();
      var lista = A.M.productos.map(function (p, i) {
        if (f && (p.nombre + " " + p.slug).toLowerCase().indexOf(f) < 0) return "";
        var r = "productos." + i + ".", img = PF.imgOk(p.imagen);
        return '<details class="rounded-lg border border-outline-variant/60 transition open:shadow-soft"><summary class="flex cursor-pointer items-center gap-3 p-3">' + (img ? '<img src="' + esc(img) + '" alt="" referrerpolicy="no-referrer" class="h-10 w-10 rounded object-cover">' : '<span class="h-10 w-10 rounded bg-surface-container"></span>') +
          '<span class="flex-1 font-medium">' + esc(p.nombre) + (p.activo ? "" : ' <span class="ml-2 rounded-full bg-outline-variant px-2 py-0.5 text-xs">oculto</span>') + '</span><span class="text-sm text-primary">' + PF.precio(p.precio, m) + '</span><span class="text-xs text-on-surface-variant">stock ' + p.stock + '</span></summary><div class="space-y-3 border-t border-outline-variant/60 p-4">' +
          fila(campo(r + "nombre", "Nombre"), campo(r + "slug", "Identificador (slug)", { slug: true, ayuda: "Va en la dirección del producto. Solo minúsculas y guiones." })) +
          fila('<label class="block text-sm font-medium">Categoría<select data-r="' + r + 'categoria" data-t="txt" class="input mt-1"><option value="">(sin categoría)</option>' + A.M.categorias.map(function (c) { return '<option value="' + esc(c.slug) + '"' + (p.categoria === c.slug ? " selected" : "") + ">" + esc(c.nombre) + "</option>"; }).join("") + "</select></label>", campo(r + "etiqueta", "Etiqueta (ej: Nuevo, Más vendido)")) +
          fila(campo(r + "precio", "Precio (" + esc(m) + ")", { num: true, min: 0 }), campo(r + "precioAnterior", "Precio anterior (para mostrar oferta)", { num: true, min: 0 })) +
          fila(campo(r + "stock", "Stock", { num: true, min: 0 }), subirImagen(i, p)) +
          area(r + "descripcion", "Descripción", 3) +
          '<div class="flex items-center justify-between">' + interruptor(r + "activo", "Visible en la tienda") + boton("Borrar producto", "del:productos:" + i, "d") + "</div></div></details>";
      }).join("");
      return tarjeta("Productos (" + A.M.productos.length + ")",
        '<input id="filtro" class="input" placeholder="Buscar producto…" value="' + esc(A.filtro) + '"><div class="space-y-3">' + lista + "</div>",
        '<div class="flex gap-2">' + boton("+ Producto", "add:producto", "s") + boton("Guardar productos", "guardar-cat", "p") + "</div>");
    },
    categorias: function () {
      var l = A.M.categorias.map(function (c, i) {
        var r = "categorias." + i + ".";
        return '<div class="flex flex-wrap items-end gap-3 rounded-lg border border-outline-variant/60 p-3"><div class="min-w-[10rem] flex-1">' + campo(r + "nombre", "Nombre") + '</div><div class="min-w-[8rem] flex-1">' + campo(r + "slug", "Identificador", { slug: true }) + '</div><div class="min-w-[8rem] flex-1">' + campo(r + "icono", "Ícono") + "</div>" + boton("Borrar", "del:categorias:" + i, "d") + "</div>";
      }).join("");
      return tarjeta("Categorías (" + A.M.categorias.length + ")", l + '<p class="text-xs text-on-surface-variant">Íconos de <a class="underline" target="_blank" rel="noopener" href="https://fonts.google.com/icons">Material Symbols</a> (ej: nutrition, bed, soap).</p>',
        '<div class="flex gap-2">' + boton("+ Categoría", "add:categoria", "s") + boton("Guardar categorías", "guardar-cat", "p") + "</div>");
    },
    pedidos: function () {
      var m = A.M.cfg.tienda.moneda;
      var l = A.pedidos.map(function (p) {
        return '<details class="rounded-lg border border-outline-variant/60"><summary class="flex cursor-pointer flex-wrap items-center gap-3 p-3"><b class="text-primary">' + esc(p.id) + '</b><span class="flex-1">' + esc(p.nombre) + " · " + esc(p.ciudad) + '</span><span class="text-xs text-on-surface-variant">' + esc(String(p.fecha).slice(0, 16).replace("T", " ")) + '</span><span class="rounded-full bg-surface-container px-2 py-0.5 text-xs">' + esc(p.estado) + '</span><b>' + PF.precio(p.total, m) + '</b></summary><div class="space-y-1 border-t border-outline-variant/60 p-4 text-sm"><p>Teléfono: ' + esc(p.telefono) + "</p><ul class='list-disc pl-5'>" + p.items.map(function (i) { return "<li>" + i.cantidad + " × " + esc(i.nombre) + " — " + PF.precio(i.precio * i.cantidad, m) + "</li>"; }).join("") + "</ul></div></details>";
      }).join("");
      return tarjeta("Últimos pedidos (" + A.pedidos.length + ")", l || '<p class="text-sm text-on-surface-variant">Todavía no hay pedidos.</p>', boton("Actualizar", "recargar", "s"));
    },
    seguridad: function () {
      return tarjeta("Usuario y clave de acceso",
        '<p class="text-sm text-on-surface-variant">Usuario actual: <b>' + esc(A.usuario) + "</b></p>" +
        '<label class="block text-sm font-medium">Usuario nuevo (dejalo vacío para no cambiarlo)<input id="sg-u" class="input mt-1" autocomplete="off" placeholder="' + esc(A.usuario) + '"></label>' +
        '<label class="block text-sm font-medium">Clave nueva (mínimo 8 caracteres; vacío para no cambiarla)<input id="sg-n" type="password" class="input mt-1" autocomplete="new-password"></label>' +
        '<label class="block text-sm font-medium">Clave actual (obligatoria para confirmar)<input id="sg-c" type="password" class="input mt-1" autocomplete="current-password"></label>',
        boton("Guardar", "guardar-seg", "p"));
    },
  };

  function subirImagen(i, p) {
    var img = PF.imgOk(p.imagen), r = "productos." + i + ".imagen";
    return '<div class="text-sm font-medium">Imagen<div class="mt-1 flex items-center gap-3">' + (img ? '<img src="' + esc(img) + '" alt="" referrerpolicy="no-referrer" class="h-14 w-14 rounded-lg object-cover shadow-soft">' : '<span class="h-14 w-14 rounded-lg bg-surface-container"></span>') +
      '<label class="cursor-pointer rounded-full bg-surface-container-high px-4 py-2 text-sm font-semibold transition hover:bg-surface-container-highest ' + (A.subiendo === String(i) ? "pointer-events-none opacity-60" : "") + '">' + (A.subiendo === String(i) ? "Subiendo a tu Drive…" : img ? "Cambiar foto" : "Subir foto") + '<input type="file" accept="image/*" class="hidden" data-subir="' + i + '"></label>' +
      (img ? boton("Quitar", "quitar-img:" + i, "d") : "") + '</div><input data-r="' + r + '" data-t="txt" value="' + esc(p.imagen || "") + '" placeholder="o pegá un enlace https://…" class="input mt-2 text-xs"></div>';
  }

  // ------------------------------------------------------------ pantalla
  function login(error) {
    A.raiz.innerHTML = '<div class="mx-auto max-w-sm px-4 py-16"><form id="adm-login" class="animate-pop-in space-y-4 rounded-xl bg-surface-container-lowest p-8 shadow-lift"><div class="text-center"><span class="material-symbols-outlined rounded-full bg-primary-fixed p-3 text-primary">lock</span><h1 class="mt-3 font-heading text-2xl font-bold">Panel de administración</h1><p class="text-sm text-on-surface-variant">Ingresá con tu usuario y clave</p></div>' +
      (error ? '<p class="rounded-lg bg-error-container p-3 text-sm text-error" role="alert">' + esc(error) + "</p>" : "") +
      '<label class="block text-sm font-medium">Usuario<input name="u" class="input mt-1" autocomplete="username" required></label><label class="block text-sm font-medium">Clave<input name="c" type="password" class="input mt-1" autocomplete="current-password" required></label>' +
      '<button class="w-full rounded-full bg-primary py-3 font-heading font-semibold text-on-primary shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift disabled:opacity-60">Entrar</button><a href="#/" class="block text-center text-sm text-primary hover:underline">← Volver a la tienda</a></form></div>';
  }

  function dibujar() {
    var nav = SECCIONES.map(function (s) {
      var on = s[0] === A.seccion;
      return '<button data-sec="' + s[0] + '" class="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition ' + (on ? "bg-primary text-on-primary shadow-soft" : "hover:bg-surface-container") + '"><span class="material-symbols-outlined !text-[20px]">' + s[2] + "</span>" + s[1] + "</button>";
    }).join("");
    A.raiz.innerHTML = '<div class="mx-auto max-w-6xl px-4 py-8 md:px-8"><div class="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 class="font-heading text-2xl font-bold">Panel de administración</h1><div class="flex gap-2"><a href="#/" class="rounded-full bg-surface-container-high px-5 py-2 text-sm font-semibold transition hover:bg-surface-container-highest">Ver tienda</a>' + boton("Salir", "salir", "s") + "</div></div>" +
      (A.claveInicial ? '<div class="mb-6 flex items-center gap-3 rounded-lg bg-error-container p-4 text-sm text-error"><span class="material-symbols-outlined">warning</span><span>Seguís usando la clave inicial, que es pública. <button data-sec="seguridad" class="font-semibold underline">Cambiala ahora</button>.</span></div>' : "") +
      '<div class="grid gap-6 md:grid-cols-[14rem_1fr]"><nav class="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">' + nav + '</nav><div class="min-w-0 space-y-6" id="adm-contenido">' + VISTAS[A.seccion]() + "</div></div></div>";
  }
  function redibujar() { var y = window.scrollY; dibujar(); window.scrollTo(0, y); }

  // ------------------------------------------------------------ acciones
  var VACIOS = {
    menu: function () { return { etiqueta: "Nuevo enlace", href: "#/tienda" }; },
    beneficio: function () { return { icono: "star", titulo: "Nuevo beneficio", texto: "" }; },
    tema: function () { return { id: "tema-" + Date.now().toString(36), etiqueta: "Nuevo tema", palabras: "", respuesta: "", tipo: "texto", enMenu: true }; },
    producto: function () { return { slug: "producto-" + Date.now().toString(36), nombre: "Nuevo producto", categoria: (A.M.categorias[0] || {}).slug || "", precio: 0, precioAnterior: null, descripcion: "", stock: 10, etiqueta: "", imagen: "", activo: true }; },
    categoria: function () { return { slug: "categoria-" + Date.now().toString(36), nombre: "Nueva categoría", icono: "pets" }; },
  };
  var DESTINO = { menu: "cfg.tienda.menu", beneficio: "cfg.inicio.beneficios", tema: "cfg.chatbot.temas", producto: "productos", categoria: "categorias" };

  function busy(b, v) { if (b) b.disabled = v; }
  async function llamar(cuerpo) {
    try { return await PF.api.post(Object.assign({ token: A.token }, cuerpo)); }
    catch (e) { if (e.sesion === false) { cerrar(); login("Tu sesión venció. Ingresá de nuevo."); } throw e; }
  }
  function cerrar() { A.listo = false; A.token = ""; try { sessionStorage.removeItem(TOK); } catch (e) {} }

  async function cargar() {
    var d = await llamar({ accion: "admin" });
    A.M = { cfg: PF.normalizar(d.config), productos: d.productos, categorias: d.categorias };
    A.pedidos = d.pedidos; A.usuario = d.usuario; A.claveInicial = d.claveInicial; A.listo = true;
  }

  async function accion(a, btn) {
    var p = a.split(":");
    try {
      if (p[0] === "add") { var arr = get(A.M, DESTINO[p[1]]); arr[p[1] === "producto" || p[1] === "categoria" ? "unshift" : "push"](VACIOS[p[1]]()); redibujar(); return; }
      if (p[0] === "del") {
        var l = get(A.M, p[1]), it = l[Number(p[2])];
        if (p[1] === "productos" || p[1] === "categorias") { if (!confirm("¿Borrar «" + (it.nombre || "") + "»? Se aplica al guardar.")) return; }
        l.splice(Number(p[2]), 1); redibujar(); return;
      }
      if (p[0] === "up" || p[0] === "down") {
        var l2 = get(A.M, p[1]), i = Number(p[2]), j = p[0] === "up" ? i - 1 : i + 1;
        if (j >= 0 && j < l2.length) { var tmp = l2[i]; l2[i] = l2[j]; l2[j] = tmp; redibujar(); }
        return;
      }
      if (p[0] === "quitar-img") { A.M.productos[Number(p[1])].imagen = ""; redibujar(); return; }
      if (a === "salir") { try { await PF.api.post({ accion: "logout", token: A.token }); } catch (e) {} cerrar(); login(); return; }
      if (a === "recargar") { busy(btn, true); await cargar(); redibujar(); PF.aviso("Pedidos actualizados"); return; }
      if (a === "guardar-cfg") {
        busy(btn, true);
        A.M.cfg = PF.normalizar(A.M.cfg);
        await llamar({ accion: "guardarConfig", config: A.M.cfg });
        await PF.recargarTienda();
        PF.aviso("Cambios guardados ✔"); redibujar(); return;
      }
      if (a === "guardar-cat") {
        busy(btn, true);
        await llamar({ accion: "guardarCatalogo", productos: A.M.productos, categorias: A.M.categorias });
        await PF.recargarTienda();
        PF.aviso("Catálogo guardado ✔"); redibujar(); return;
      }
      if (a === "guardar-seg") {
        busy(btn, true);
        var n = document.getElementById("sg-n").value, c = document.getElementById("sg-c").value, u = document.getElementById("sg-u").value;
        if (!n && !u) { PF.aviso("No hay nada para cambiar", true); busy(btn, false); return; }
        var r = await llamar({ accion: "guardarSeguridad", usuarioNuevo: u, claveNueva: n, claveActual: c });
        A.usuario = r.usuario; A.claveInicial = false;
        PF.aviso("Usuario y clave actualizados ✔"); redibujar(); return;
      }
    } catch (e) { PF.aviso(e.message, true); busy(btn, false); }
  }

  function reducir(file) {
    return createImageBitmap(file).then(function (bmp) {
      var k = Math.min(1, 1000 / Math.max(bmp.width, bmp.height)), cv = document.createElement("canvas");
      cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
      cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height);
      return new Promise(function (ok, no) { cv.toBlob(function (b) { b ? ok(b) : no(new Error("No se pudo procesar la imagen")); }, "image/jpeg", 0.85); });
    });
  }
  function aBase64(blob) {
    return new Promise(function (ok, no) { var r = new FileReader(); r.onload = function () { ok(String(r.result).split(",")[1]); }; r.onerror = no; r.readAsDataURL(blob); });
  }
  async function subir(i, file) {
    A.subiendo = String(i); redibujar();
    try {
      var blob = await reducir(file), b64 = await aBase64(blob);
      var r = await llamar({ accion: "imagen", nombre: Date.now().toString(36) + "-" + slugify(file.name.replace(/\.\w+$/, "")) + ".jpg", tipo: "image/jpeg", base64: b64 });
      A.M.productos[i].imagen = r.url;
      PF.aviso("Foto subida a tu Drive ✔ (acordate de guardar)");
    } catch (e) { PF.aviso(e.message, true); }
    A.subiendo = ""; redibujar();
  }

  // ------------------------------------------------------------ eventos (se enlazan una sola vez)
  var enlazado = false;
  function enlazar() {
    if (enlazado) return; enlazado = true;
    document.addEventListener("click", function (e) {
      if (!A.raiz || !A.raiz.contains(e.target) || !/^#\/admin/.test(location.hash)) return;
      var s = e.target.closest("[data-sec]"); if (s) { A.seccion = s.dataset.sec; redibujar(); window.scrollTo(0, 0); return; }
      var b = e.target.closest("[data-a]"); if (b) accion(b.dataset.a, b);
    });
    document.addEventListener("input", function (e) {
      var t = e.target; if (!A.raiz || !A.raiz.contains(t)) return;
      if (t.id === "filtro") { A.filtro = t.value; var pos = t.selectionStart; document.getElementById("adm-contenido").innerHTML = VISTAS.productos(); var f = document.getElementById("filtro"); f.focus(); f.setSelectionRange(pos, pos); return; }
      var r = t.dataset && t.dataset.r; if (!r) return;
      var v;
      if (t.dataset.t === "bool") v = t.checked;
      else if (t.dataset.t === "num") v = t.value === "" ? (/precioAnterior$/.test(r) ? null : 0) : Number(t.value);
      else if (t.dataset.t === "slug") v = slugify(t.value);
      else v = t.value;
      set(A.M, r, v);
      if (t.type === "color") { var code = t.parentNode.querySelector("code"); if (code) code.textContent = v; }
    });
    document.addEventListener("change", function (e) {
      var t = e.target; if (!A.raiz || !A.raiz.contains(t)) return;
      if (t.dataset.subir !== undefined && t.files && t.files[0]) { var f = t.files[0]; t.value = ""; subir(Number(t.dataset.subir), f); return; }
      if (t.dataset.r && (t.dataset.t === "bool" || t.tagName === "SELECT")) { if (/enMenu$|activo$|tipo$|imagen$/.test(t.dataset.r)) redibujar(); }
      if (t.dataset.r && /imagen$/.test(t.dataset.r)) redibujar();
    });
    document.addEventListener("submit", async function (e) {
      if (e.target.id !== "adm-login") return;
      e.preventDefault();
      var f = e.target, btn = f.querySelector("button"); btn.disabled = true;
      try {
        var r = await PF.api.post({ accion: "login", usuario: f.u.value, clave: f.c.value });
        A.token = r.token; try { sessionStorage.setItem(TOK, r.token); } catch (x) {}
        await cargar(); dibujar();
      } catch (x) { login(x.message); }
    });
  }

  PF.admin = {
    montar: async function (raiz) {
      A.raiz = raiz; enlazar();
      if (!PF.api.configurada()) {
        raiz.innerHTML = '<div class="mx-auto max-w-lg p-10 text-center"><span class="material-symbols-outlined text-5xl text-primary">link_off</span><h1 class="mt-4 font-heading text-2xl font-bold">Falta conectar tu Google</h1><p class="mt-2 text-on-surface-variant">Pegá la URL de tu Apps Script en <code>js/ajustes.js</code> (README, Paso 1). Después podés entrar acá con <b>admin</b> / <b>admin12345678</b>.</p><a href="#/" class="mt-6 inline-block text-primary hover:underline">← Volver a la tienda</a></div>';
        return;
      }
      if (A.listo) { dibujar(); return; }
      var t = ""; try { t = sessionStorage.getItem(TOK) || ""; } catch (e) {}
      if (t) {
        A.token = t; raiz.innerHTML = '<p class="p-10 text-center text-on-surface-variant">Cargando…</p>';
        try { await cargar(); dibujar(); return; } catch (e) { cerrar(); }
      }
      login();
    },
  };
})();
