/* Tienda: rutas con # (funciona en Vercel y abriendo index.html directo), carrito, checkout por WhatsApp y chat. */
(function () {
  "use strict";
  var PF = window.PF, esc = PF.esc;
  var S = { cfg: PF.normalizar({}), categorias: [], productos: [], demo: false, cart: [], cargado: false };
  var $app = document.getElementById("app");

  // ------------------------------------------------------------ almacenamiento local (solo conveniencia)
  function ls(k, v) {
    try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
    return null;
  }
  S.cart = (ls("pf_cart") || []).filter(function (i) { return i && typeof i.slug === "string" && i.cantidad > 0; });
  function guardarCarrito() { ls("pf_cart", S.cart); pintarCabecera(); }
  var porSlug = function (slug) { return S.productos.filter(function (p) { return p.slug === slug; })[0]; };
  var m = function () { return S.cfg.tienda.moneda; };
  var $$ = function (n) { return PF.precio(n, m()); };

  function aviso(texto, error) {
    var d = document.createElement("div");
    d.className = "animate-pop-in pointer-events-auto rounded-full px-5 py-3 text-sm font-medium shadow-lift " + (error ? "bg-error text-white" : "bg-inverse-surface text-inverse-on-surface");
    d.textContent = texto;
    document.getElementById("avisos").appendChild(d);
    setTimeout(function () { d.remove(); }, 3200);
  }
  PF.aviso = aviso;

  // ------------------------------------------------------------ datos
  function aplicar(d) {
    S.cfg = PF.normalizar(d.config || {});
    S.categorias = d.categorias || [];
    S.productos = (d.productos || []).filter(function (p) { return p.activo !== false; });
    PF.aplicarColores(S.cfg);
    document.title = S.cfg.tienda.nombre + " | " + S.cfg.tienda.eslogan;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = S.cfg.tienda.descripcion;
    S.cargado = true;
  }
  PF.estado = S;
  // Vuelve a leer la tienda (lo usa el panel después de guardar, así los cambios se ven al instante).
  PF.recargarTienda = async function () {
    if (!PF.api.configurada()) return;
    var d = await PF.api.get("publico");
    ls("pf_cache", d);
    aplicar(d);
    pintarCabecera(); pintarPie(); pintarChat();
  };

  async function iniciar() {
    if (!PF.api.configurada()) {
      S.demo = true;
      aplicar({ config: {}, categorias: PF_DEMO.categorias, productos: PF_DEMO.productos });
    } else {
      var cache = ls("pf_cache"); // pinta al instante lo último que se vio y refresca en segundo plano
      if (cache) aplicar(cache);
      try {
        var d = await PF.api.get("publico");
        ls("pf_cache", d);
        aplicar(d);
      } catch (e) {
        if (!cache) {
          $app.innerHTML = '<div class="mx-auto max-w-lg p-10 text-center"><span class="material-symbols-outlined text-5xl text-error">cloud_off</span><h1 class="mt-4 font-heading text-2xl font-bold">No pudimos cargar la tienda</h1><p class="mt-2 text-on-surface-variant">Revisá que la URL de js/ajustes.js sea la de tu Apps Script (termina en /exec) y que esté implementado para «Cualquier persona».</p><p class="mt-2 text-xs text-outline">' + esc(e.message) + "</p></div>";
          return;
        }
      }
    }
    pintarCabecera(); pintarPie(); render(); pintarChat();
  }

  // ------------------------------------------------------------ cabecera y pie
  function totalCarrito() { return S.cart.reduce(function (a, i) { return a + i.cantidad; }, 0); }
  function pintarCabecera() {
    var t = S.cfg.tienda, n = totalCarrito();
    var links = t.menu.map(function (l) { return '<a href="' + esc(l.href) + '" class="font-heading text-sm font-medium text-on-surface-variant transition hover:text-primary">' + esc(l.etiqueta) + "</a>"; }).join("");
    var movil = t.menu.map(function (l) { return '<a href="' + esc(l.href) + '" class="rounded-lg px-3 py-2 font-heading text-sm hover:bg-surface-container">' + esc(l.etiqueta) + "</a>"; }).join("");
    var abierto = document.getElementById("menu-movil") && !document.getElementById("menu-movil").classList.contains("hidden");
    document.getElementById("cabecera").innerHTML =
      (S.demo ? '<div class="bg-inverse-surface px-4 py-2 text-center text-xs text-inverse-on-surface">Modo demostración: conectá tu Google (README, Paso 1) para vender de verdad. <a class="underline" href="#/admin">Panel</a></div>' : "") +
      '<header class="sticky top-0 z-40 border-b border-outline-variant/40 bg-surface/90 backdrop-blur"><div class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-8">' +
      '<button class="md:hidden" aria-label="Menú" data-acc="menu"><span class="material-symbols-outlined">menu</span></button>' +
      '<a href="#/" class="flex items-center gap-2 font-heading text-lg font-bold text-primary"><span class="material-symbols-outlined">' + esc(t.logoIcono) + "</span> " + esc(t.nombre) + "</a>" +
      '<nav class="ml-6 hidden gap-6 md:flex">' + links + "</nav>" +
      '<form id="buscar" class="ml-auto hidden items-center rounded-full bg-surface-container px-3 transition focus-within:shadow-soft md:flex"><span class="material-symbols-outlined text-[20px] text-outline">search</span><input name="q" placeholder="Buscar productos..." class="w-48 bg-transparent px-2 py-2 text-sm outline-none"></form>' +
      '<a href="#/carrito" aria-label="Carrito" class="relative ml-auto transition hover:scale-110 md:ml-0"><span class="material-symbols-outlined">shopping_cart</span>' +
      (n > 0 ? '<span class="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-on-primary">' + n + "</span>" : "") + "</a>" +
      '<a href="#/admin" aria-label="Panel de administración" title="Administración" class="text-outline transition hover:text-primary"><span class="material-symbols-outlined">admin_panel_settings</span></a>' +
      '</div><nav id="menu-movil" class="' + (abierto ? "" : "hidden ") + 'flex flex-col gap-1 border-t border-outline-variant/40 px-4 py-3 md:hidden">' + movil + "</nav></header>";
  }
  function pintarPie() {
    var t = S.cfg.tienda, w = S.cfg.whatsapp.numero;
    document.getElementById("pie").innerHTML =
      '<footer class="mt-16 bg-inverse-surface text-inverse-on-surface"><div class="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3 md:px-8">' +
      '<div><p class="flex items-center gap-2 font-heading text-lg font-bold"><span class="material-symbols-outlined">' + esc(t.logoIcono) + "</span> " + esc(t.nombre) + '</p><p class="mt-3 text-sm opacity-80">' + esc(t.footerTexto) + "</p></div>" +
      '<div><p class="font-heading font-semibold">Tienda</p><ul class="mt-3 space-y-2 text-sm opacity-80">' +
      t.menu.map(function (l) { return '<li><a class="hover:underline" href="' + esc(l.href) + '">' + esc(l.etiqueta) + "</a></li>"; }).join("") + "</ul></div>" +
      '<div><p class="font-heading font-semibold">Contacto</p><ul class="mt-3 space-y-2 text-sm opacity-80"><li>' + esc(t.email) + "</li><li>Atendemos " + esc(t.horarios) + "</li>" +
      (w ? '<li><a class="underline" target="_blank" rel="noopener" href="https://wa.me/' + esc(w) + '">WhatsApp +' + esc(w) + "</a></li>" : "") + "</ul></div></div>" +
      '<p class="border-t border-white/10 py-4 text-center text-xs opacity-60">© ' + new Date().getFullYear() + " " + esc(t.nombre) + "</p></footer>";
  }

  // ------------------------------------------------------------ componentes
  function tarjeta(p) {
    var img = PF.imgOk(p.imagen);
    return '<article class="group overflow-hidden rounded-xl bg-surface-container-lowest shadow-soft transition hover:-translate-y-1 hover:shadow-lift">' +
      '<a href="#/producto/' + esc(p.slug) + '" class="relative block aspect-square overflow-hidden bg-surface-container">' +
      (img ? '<img src="' + esc(img) + '" alt="' + esc(p.nombre) + '" loading="lazy" referrerpolicy="no-referrer" class="h-full w-full object-cover transition duration-500 group-hover:scale-105">' : "") +
      (p.etiqueta ? '<span class="absolute left-3 top-3 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-on-secondary">' + esc(p.etiqueta) + "</span>" : "") + "</a>" +
      '<div class="p-4"><p class="text-xs uppercase tracking-wide text-outline">' + esc(nombreCat(p.categoria)) + "</p>" +
      '<a href="#/producto/' + esc(p.slug) + '" class="mt-1 line-clamp-2 block min-h-[2.5rem] font-heading text-sm font-semibold hover:text-primary">' + esc(p.nombre) + "</a>" +
      '<div class="mt-3 flex items-end justify-between"><div><p class="font-heading text-lg font-bold text-primary">' + $$(p.precio) + "</p>" +
      (p.precioAnterior ? '<p class="text-xs text-outline line-through">' + $$(p.precioAnterior) + "</p>" : "") + "</div>" +
      (p.stock > 0 ? '<button data-add="' + esc(p.slug) + '" aria-label="Agregar al carrito" class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-soft transition hover:scale-110 hover:shadow-lift active:scale-95"><span class="material-symbols-outlined !text-[20px]">add_shopping_cart</span></button>' : '<span class="text-xs font-medium text-error">Sin stock</span>') +
      "</div></div></article>";
  }
  function nombreCat(slug) { var c = S.categorias.filter(function (x) { return x.slug === slug; })[0]; return c ? c.nombre : slug; }
  function agregar(slug, cant) {
    var p = porSlug(slug); if (!p) return;
    var it = S.cart.filter(function (i) { return i.slug === slug; })[0];
    var nuevo = (it ? it.cantidad : 0) + (cant || 1);
    if (nuevo > p.stock) { aviso("Solo quedan " + p.stock + " unidades de este producto", true); return; }
    if (it) it.cantidad = nuevo; else S.cart.push({ slug: slug, cantidad: nuevo });
    guardarCarrito();
    aviso("Agregado al carrito 🐾");
  }

  // ------------------------------------------------------------ páginas
  function paginaInicio() {
    var i = S.cfg.inicio, t = S.cfg.tienda, dest = S.productos.slice(0, 4);
    var hero = i.heroImagen || PF.imgOk((S.productos[0] || {}).imagen);
    var h = '<section class="bg-gradient-to-br from-primary-fixed/50 via-surface to-secondary-container/40"><div class="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:px-8 md:py-20"><div>' +
      '<span class="inline-flex items-center gap-1 rounded-full bg-primary-fixed px-3 py-1 text-xs font-medium text-on-primary-container"><span class="material-symbols-outlined !text-[16px]">' + esc(t.logoIcono) + "</span> " + esc(i.heroBadge) + "</span>" +
      '<h1 class="mt-5 font-heading text-4xl font-bold leading-tight md:text-5xl">' + esc(i.heroTitulo) + '</h1><p class="mt-4 max-w-md text-on-surface-variant">' + esc(i.heroTexto) + "</p>" +
      '<div class="mt-8 flex flex-wrap gap-3"><a href="#/tienda" class="rounded-full bg-primary px-7 py-3 font-heading font-semibold text-on-primary shadow-soft transition hover:-translate-y-0.5 hover:bg-on-primary-container hover:shadow-lift">' + esc(i.botonPrincipal) + "</a>" +
      '<a href="#/tienda" class="rounded-full bg-surface-container-high px-7 py-3 font-heading font-semibold transition hover:-translate-y-0.5 hover:shadow-soft">' + esc(i.botonSecundario) + "</a></div></div>" +
      (hero ? '<div class="relative"><img src="' + esc(hero) + '" alt="" referrerpolicy="no-referrer" class="aspect-[4/3] w-full rounded-xl object-cover shadow-lift"><div class="absolute -bottom-4 left-4 flex items-center gap-2 rounded-lg bg-surface-container-lowest px-4 py-3 shadow-soft"><span class="material-symbols-outlined text-secondary">favorite</span><p class="text-sm"><b>' + esc(i.garantiaTitulo) + '</b><br><span class="text-on-surface-variant">' + esc(i.garantiaTexto) + "</span></p></div></div>" : "") +
      "</div></section>";
    if (i.mostrarCategorias && S.categorias.length) {
      h += '<section class="mx-auto max-w-7xl px-4 py-14 md:px-8"><p class="text-xs font-medium uppercase tracking-widest text-primary">' + esc(i.categoriasSubtitulo) + '</p><div class="mt-1 flex items-end justify-between"><h2 class="font-heading text-3xl font-bold">' + esc(i.categoriasTitulo) + '</h2><a href="#/tienda" class="text-sm text-primary hover:underline">Ver todas</a></div><div class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">' +
        S.categorias.map(function (c) { return '<a href="#/tienda?categoria=' + encodeURIComponent(c.slug) + '" class="rounded-xl bg-surface-container-lowest p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lift"><span class="material-symbols-outlined rounded-lg bg-primary-fixed p-2 text-primary">' + esc(c.icono) + '</span><p class="mt-4 font-heading font-semibold">' + esc(c.nombre) + "</p></a>"; }).join("") + "</div></section>";
    }
    if (i.mostrarEstrella && dest.length) {
      h += '<section class="bg-surface-container-low py-14"><div class="mx-auto max-w-7xl px-4 md:px-8"><p class="text-xs font-medium uppercase tracking-widest text-primary">' + esc(i.estrellaSubtitulo) + '</p><div class="mt-1 flex items-end justify-between"><h2 class="font-heading text-3xl font-bold">' + esc(i.estrellaTitulo) + '</h2><a href="#/tienda" class="text-sm text-primary hover:underline">Ver la tienda</a></div><div class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">' + dest.map(tarjeta).join("") + "</div></div></section>";
    }
    if (i.mostrarBeneficios && i.beneficios.length) {
      h += '<section class="mx-auto max-w-7xl px-4 py-14 md:px-8"><h2 class="text-center font-heading text-3xl font-bold">' + esc(i.porQueTitulo) + '</h2><div class="mt-10 grid gap-6 md:grid-cols-3">' +
        i.beneficios.map(function (b) { return '<div class="rounded-xl bg-secondary-container/40 p-6 text-center transition hover:-translate-y-1 hover:shadow-soft"><span class="material-symbols-outlined rounded-full bg-secondary-container p-3 text-secondary">' + esc(b.icono) + '</span><h3 class="mt-4 font-heading font-semibold">' + esc(b.titulo) + '</h3><p class="mt-2 text-sm text-on-surface-variant">' + esc(b.texto) + "</p></div>"; }).join("") + "</div></section>";
    }
    return h;
  }

  function paginaTienda(q) {
    var cat = q.get("categoria") || "", txt = (q.get("q") || "").trim(), orden = q.get("orden") || "";
    var lista = S.productos.filter(function (p) {
      if (cat && p.categoria !== cat) return false;
      if (txt && (p.nombre + " " + p.descripcion + " " + nombreCat(p.categoria)).toLowerCase().indexOf(txt.toLowerCase()) < 0) return false;
      return true;
    });
    if (orden === "menor") lista.sort(function (a, b) { return a.precio - b.precio; });
    if (orden === "mayor") lista.sort(function (a, b) { return b.precio - a.precio; });
    var chip = function (slug, nombre) {
      var on = slug === cat;
      return '<a href="#/tienda?' + (slug ? "categoria=" + encodeURIComponent(slug) : "") + (txt ? "&q=" + encodeURIComponent(txt) : "") + '" class="rounded-full px-4 py-2 text-sm font-medium transition ' + (on ? "bg-primary text-on-primary shadow-soft" : "bg-surface-container-high hover:bg-surface-container-highest") + '">' + esc(nombre) + "</a>";
    };
    return '<div class="mx-auto max-w-7xl px-4 py-10 md:px-8"><div class="flex flex-wrap items-end justify-between gap-4"><h1 class="font-heading text-3xl font-bold">' + (txt ? "Resultados para «" + esc(txt) + "»" : cat ? esc(nombreCat(cat)) : "Tienda") + '</h1>' +
      '<label class="text-sm">Ordenar <select id="orden" class="input !w-auto !py-2"><option value="">Destacados</option><option value="menor"' + (orden === "menor" ? " selected" : "") + '>Menor precio</option><option value="mayor"' + (orden === "mayor" ? " selected" : "") + ">Mayor precio</option></select></label></div>" +
      '<div class="mt-6 flex flex-wrap gap-2">' + chip("", "Todo") + S.categorias.map(function (c) { return chip(c.slug, c.nombre); }).join("") + "</div>" +
      (lista.length ? '<div class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">' + lista.map(tarjeta).join("") + "</div>" : '<p class="mt-12 text-center text-on-surface-variant">No encontramos productos con esos filtros.</p>') + "</div>";
  }

  function paginaProducto(slug) {
    var p = porSlug(slug);
    if (!p) return noEncontrado();
    var img = PF.imgOk(p.imagen);
    var rel = S.productos.filter(function (x) { return x.categoria === p.categoria && x.slug !== p.slug; }).slice(0, 4);
    return '<div class="mx-auto max-w-7xl px-4 py-10 md:px-8"><a href="#/tienda" class="text-sm text-primary hover:underline">← Volver a la tienda</a>' +
      '<div class="mt-6 grid gap-10 md:grid-cols-2"><div class="aspect-square overflow-hidden rounded-xl bg-surface-container shadow-soft">' + (img ? '<img src="' + esc(img) + '" alt="' + esc(p.nombre) + '" referrerpolicy="no-referrer" class="h-full w-full object-cover">' : "") + "</div><div>" +
      '<p class="text-xs uppercase tracking-wide text-outline">' + esc(nombreCat(p.categoria)) + "</p>" +
      '<h1 class="mt-1 font-heading text-3xl font-bold">' + esc(p.nombre) + "</h1>" +
      (p.etiqueta ? '<span class="mt-3 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-on-secondary">' + esc(p.etiqueta) + "</span>" : "") +
      '<p class="mt-4 font-heading text-3xl font-bold text-primary">' + $$(p.precio) + "</p>" +
      (p.precioAnterior ? '<p class="text-sm text-outline line-through">' + $$(p.precioAnterior) + "</p>" : "") +
      '<p class="mt-5 whitespace-pre-line text-on-surface-variant">' + esc(p.descripcion) + "</p>" +
      '<p class="mt-4 text-sm ' + (p.stock > 0 ? "text-secondary" : "text-error") + '">' + (p.stock > 0 ? "En stock: " + p.stock + " unidades" : "Sin stock") + "</p>" +
      (p.stock > 0 ? '<div class="mt-6 flex items-center gap-3"><div class="flex items-center rounded-full bg-surface-container"><button data-qd class="h-10 w-10 text-xl">−</button><span id="qd" class="w-8 text-center font-semibold">1</span><button data-qu class="h-10 w-10 text-xl">+</button></div>' +
        '<button data-addn="' + esc(p.slug) + '" class="rounded-full bg-primary px-7 py-3 font-heading font-semibold text-on-primary shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift active:scale-95">Agregar al carrito</button></div>' : "") +
      "</div></div>" +
      (rel.length ? '<h2 class="mt-16 font-heading text-2xl font-bold">También te puede gustar</h2><div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">' + rel.map(tarjeta).join("") + "</div>" : "") + "</div>";
  }

  function lineasCarrito() {
    return S.cart.map(function (i) { return { p: porSlug(i.slug), cantidad: i.cantidad }; }).filter(function (x) { return x.p; });
  }
  function resumen() {
    var ls_ = lineasCarrito(), sub = ls_.reduce(function (a, x) { return a + x.p.precio * x.cantidad; }, 0), env = PF.costoEnvio(sub, S.cfg);
    return { lineas: ls_, sub: sub, env: env, total: sub + env };
  }
  function bloqueResumen(r) {
    var falta = S.cfg.envios.gratisDesde - r.sub;
    return '<div class="space-y-2 text-sm"><div class="flex justify-between"><span>Subtotal</span><span>' + $$(r.sub) + '</span></div><div class="flex justify-between"><span>Envío</span><span>' + (r.env === 0 ? "Gratis" : $$(r.env)) + "</span></div>" +
      (r.env > 0 && falta > 0 ? '<p class="text-xs text-secondary">Sumá ' + $$(falta) + " más y el envío es gratis 🚚</p>" : "") +
      '<div class="flex justify-between border-t border-outline-variant/60 pt-2 font-heading text-lg font-bold"><span>Total</span><span class="text-primary">' + $$(r.total) + "</span></div></div>";
  }

  function paginaCarrito() {
    var r = resumen();
    if (!r.lineas.length) return '<div class="mx-auto max-w-lg px-4 py-20 text-center"><span class="material-symbols-outlined text-6xl text-outline">shopping_cart</span><h1 class="mt-4 font-heading text-2xl font-bold">Tu carrito está vacío</h1><a href="#/tienda" class="mt-6 inline-block rounded-full bg-primary px-7 py-3 font-heading font-semibold text-on-primary shadow-soft transition hover:shadow-lift">Ir a la tienda</a></div>';
    return '<div class="mx-auto max-w-5xl px-4 py-10 md:px-8"><h1 class="font-heading text-3xl font-bold">Tu carrito</h1><div class="mt-8 grid gap-8 md:grid-cols-[1fr_20rem]"><ul class="space-y-4">' +
      r.lineas.map(function (x) {
        var img = PF.imgOk(x.p.imagen);
        return '<li class="animate-pop-in flex items-center gap-4 rounded-xl bg-surface-container-lowest p-4 shadow-soft">' + (img ? '<img src="' + esc(img) + '" alt="" referrerpolicy="no-referrer" class="h-20 w-20 rounded-lg object-cover">' : '<span class="h-20 w-20 rounded-lg bg-surface-container"></span>') +
          '<div class="flex-1"><a href="#/producto/' + esc(x.p.slug) + '" class="font-heading text-sm font-semibold hover:text-primary">' + esc(x.p.nombre) + '</a><p class="text-sm text-primary">' + $$(x.p.precio) + "</p>" +
          '<div class="mt-2 flex items-center gap-3"><div class="flex items-center rounded-full bg-surface-container"><button data-menos="' + esc(x.p.slug) + '" class="h-8 w-8">−</button><span class="w-6 text-center text-sm font-semibold">' + x.cantidad + '</span><button data-mas="' + esc(x.p.slug) + '" class="h-8 w-8">+</button></div>' +
          '<button data-quitar="' + esc(x.p.slug) + '" class="text-xs text-error underline">Quitar</button></div></div><p class="font-heading font-bold">' + $$(x.p.precio * x.cantidad) + "</p></li>";
      }).join("") +
      '</ul><aside class="h-fit rounded-xl bg-surface-container-lowest p-6 shadow-soft"><h2 class="mb-4 font-heading text-lg font-bold">Resumen</h2>' + bloqueResumen(r) +
      '<a href="#/checkout" class="mt-6 block rounded-full bg-primary py-3 text-center font-heading font-semibold text-on-primary shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">Continuar</a></aside></div></div>';
  }

  function paginaCheckout() {
    var r = resumen(), c = S.cfg.checkout;
    if (!r.lineas.length) { location.hash = "#/carrito"; return ""; }
    var campo = function (n, l, t, req, ph) { return '<label class="block text-sm font-medium">' + l + (req ? " *" : "") + '<input name="' + n + '" type="' + (t || "text") + '"' + (req ? " required" : "") + ' maxlength="200" placeholder="' + (ph || "") + '" class="input mt-1"></label>'; };
    return '<div class="mx-auto max-w-5xl px-4 py-10 md:px-8"><h1 class="font-heading text-3xl font-bold">' + esc(c.titulo) + '</h1><div class="mt-8 grid gap-8 md:grid-cols-[1fr_20rem]">' +
      '<form id="form-pedido" class="space-y-4 rounded-xl bg-surface-container-lowest p-6 shadow-soft"><div class="grid gap-4 md:grid-cols-2">' +
      campo("nombre", "Nombre y apellido", "text", true) + campo("telefono", "Teléfono", "tel", true) + "</div>" + campo("email", "Email (opcional)", "email", false) +
      '<div class="grid gap-4 md:grid-cols-2">' + campo("direccion", "Dirección", "text", true) + campo("ciudad", "Ciudad", "text", true) + "</div>" +
      '<label class="block text-sm font-medium">Notas (opcional)<textarea name="notas" rows="3" maxlength="500" class="input mt-1"></textarea></label>' +
      '<p class="rounded-lg bg-secondary-container/50 p-3 text-sm text-on-secondary-container">' + esc(c.aviso) + "</p>" +
      '<button id="btn-pedido" class="flex w-full items-center justify-center gap-2 rounded-full bg-[#25d366] py-3 font-heading font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift active:scale-95 disabled:opacity-60"><span class="material-symbols-outlined">chat</span> ' + esc(c.textoBoton || S.cfg.whatsapp.textoBoton) + "</button></form>" +
      '<aside class="h-fit rounded-xl bg-surface-container-lowest p-6 shadow-soft"><h2 class="mb-4 font-heading text-lg font-bold">Tu pedido</h2><ul class="mb-4 space-y-2 text-sm">' +
      r.lineas.map(function (x) { return '<li class="flex justify-between gap-2"><span>' + x.cantidad + " × " + esc(x.p.nombre) + "</span><span>" + $$(x.p.precio * x.cantidad) + "</span></li>"; }).join("") + "</ul>" + bloqueResumen(r) + "</aside></div></div>";
  }

  async function enviarPedido(form) {
    var btn = document.getElementById("btn-pedido");
    if (S.demo) { aviso("Modo demostración: conectá tu Apps Script para recibir pedidos.", true); return; }
    var numero = S.cfg.whatsapp.numero;
    // Se abre la pestaña ahora (dentro del clic) para que el navegador no la bloquee como ventana emergente.
    var pestana = numero ? window.open("", "_blank") : null;
    var fd = new FormData(form), cliente = {};
    fd.forEach(function (v, k) { cliente[k] = String(v); });
    btn.disabled = true;
    try {
      var r = await PF.api.post({ accion: "pedido", cliente: cliente, items: S.cart.map(function (i) { return { slug: i.slug, cantidad: i.cantidad }; }) });
      var url = numero ? PF.urlWhatsapp(numero, PF.mensajeWhatsapp(S.cfg, r)) : "";
      try { sessionStorage.setItem("pf_ped_" + r.id, JSON.stringify({ url: url, total: r.total })); } catch (e) {}
      S.cart = []; guardarCarrito();
      if (pestana) { try { pestana.location.href = url; } catch (e) {} }
      location.hash = "#/pedido/" + r.id;
    } catch (e) {
      if (pestana) pestana.close();
      aviso(e.message, true);
      btn.disabled = false;
    }
  }

  function paginaPedido(id) {
    var d = null; try { d = JSON.parse(sessionStorage.getItem("pf_ped_" + id)); } catch (e) {}
    return '<div class="mx-auto max-w-lg px-4 py-16 text-center"><span class="material-symbols-outlined animate-pop-in rounded-full bg-secondary-container p-4 text-5xl text-secondary">check_circle</span>' +
      '<h1 class="mt-6 font-heading text-3xl font-bold">¡Pedido registrado!</h1><p class="mt-2 text-on-surface-variant">Tu código es <b class="text-primary">' + esc(id) + "</b>" + (d ? " · Total " + $$(d.total) : "") + ".</p>" +
      (d && d.url ? '<p class="mt-4 text-sm text-on-surface-variant">Si no se abrió WhatsApp, tocá el botón para enviar el resumen al negocio:</p><a href="' + esc(d.url) + '" target="_blank" rel="noopener" class="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25d366] px-7 py-3 font-heading font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"><span class="material-symbols-outlined">chat</span> Enviar por WhatsApp</a>'
        : '<p class="mt-4 text-sm text-on-surface-variant">Guardá este código: te servirá para consultar el estado de tu pedido.</p>') +
      '<div class="mt-8"><a href="#/tienda" class="text-sm text-primary hover:underline">Seguir comprando</a></div></div>';
  }

  function noEncontrado() {
    return '<div class="mx-auto max-w-lg px-4 py-20 text-center"><span class="material-symbols-outlined text-6xl text-outline">search_off</span><h1 class="mt-4 font-heading text-2xl font-bold">No encontramos esa página</h1><a href="#/" class="mt-6 inline-block rounded-full bg-primary px-7 py-3 font-heading font-semibold text-on-primary shadow-soft">Volver al inicio</a></div>';
  }

  // ------------------------------------------------------------ router
  var cargandoAdmin = null;
  function cargarAdmin() {
    if (window.PF.admin) return Promise.resolve();
    if (!cargandoAdmin) cargandoAdmin = new Promise(function (ok, no) {
      var s = document.createElement("script"); s.src = "js/admin.js"; s.onload = ok; s.onerror = function () { cargandoAdmin = null; no(new Error("No se pudo cargar el panel")); };
      document.head.appendChild(s);
    });
    return cargandoAdmin;
  }

  function render() {
    if (!S.cargado) return;
    var partes = (location.hash || "#/").slice(1).split("?"), ruta = partes[0] || "/", q = new URLSearchParams(partes[1] || "");
    var seg = ruta.split("/").filter(Boolean), html = "";
    document.getElementById("chat").style.display = seg[0] === "admin" ? "none" : "";
    if (seg[0] === "admin") {
      $app.innerHTML = '<p class="p-10 text-center text-on-surface-variant">Cargando panel…</p>';
      cargarAdmin().then(function () { if (/^#\/admin/.test(location.hash)) PF.admin.montar($app); }).catch(function (e) { $app.innerHTML = '<p class="p-10 text-center text-error">' + esc(e.message) + "</p>"; });
      return;
    }
    if (!seg.length) html = paginaInicio();
    else if (seg[0] === "tienda") html = paginaTienda(q);
    else if (seg[0] === "producto" && seg[1]) html = paginaProducto(decodeURIComponent(seg[1]));
    else if (seg[0] === "carrito") html = paginaCarrito();
    else if (seg[0] === "checkout") html = paginaCheckout();
    else if (seg[0] === "pedido" && seg[1]) html = paginaPedido(decodeURIComponent(seg[1]));
    else html = noEncontrado();
    $app.innerHTML = html;
  }
  window.addEventListener("hashchange", function () { render(); window.scrollTo(0, 0); var mm = document.getElementById("menu-movil"); if (mm) mm.classList.add("hidden"); });

  // ------------------------------------------------------------ eventos (delegación)
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-add],[data-addn],[data-mas],[data-menos],[data-quitar],[data-qu],[data-qd],[data-acc]");
    if (!t) return;
    if (t.dataset.add) agregar(t.dataset.add, 1);
    else if (t.dataset.addn) { agregar(t.dataset.addn, Number(document.getElementById("qd").textContent) || 1); }
    else if (t.dataset.mas) { agregar(t.dataset.mas, 1); render(); }
    else if (t.dataset.menos) {
      var it = S.cart.filter(function (i) { return i.slug === t.dataset.menos; })[0];
      if (it) { it.cantidad -= 1; if (it.cantidad <= 0) S.cart = S.cart.filter(function (i) { return i !== it; }); guardarCarrito(); render(); }
    } else if (t.dataset.quitar) { S.cart = S.cart.filter(function (i) { return i.slug !== t.dataset.quitar; }); guardarCarrito(); render(); }
    else if (t.hasAttribute("data-qu")) { var q1 = document.getElementById("qd"); q1.textContent = Math.min(99, Number(q1.textContent) + 1); }
    else if (t.hasAttribute("data-qd")) { var q2 = document.getElementById("qd"); q2.textContent = Math.max(1, Number(q2.textContent) - 1); }
    else if (t.dataset.acc === "menu") document.getElementById("menu-movil").classList.toggle("hidden");
  });
  document.addEventListener("submit", function (e) {
    if (e.target.id === "form-pedido") { e.preventDefault(); enviarPedido(e.target); }
    if (e.target.id === "buscar") { e.preventDefault(); location.hash = "#/tienda?q=" + encodeURIComponent(e.target.q.value); }
  });
  document.addEventListener("change", function (e) {
    if (e.target.id === "orden") {
      var p = (location.hash.slice(1).split("?")[1]) || "", u = new URLSearchParams(p);
      if (e.target.value) u.set("orden", e.target.value); else u.delete("orden");
      location.hash = "#/tienda" + (u.toString() ? "?" + u.toString() : "");
    }
  });

  // ------------------------------------------------------------ chatbot
  var chat = { abierto: false, msgs: [], cargando: false, marcas: [] };
  var cuerpoChat = function (t) { return esc(t).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>"); };
  function pintarChat() {
    var cfg = S.cfg, box = document.getElementById("chat");
    if (!cfg.chatbot.activo) { box.innerHTML = ""; return; }
    var menu = PF.menuChat(cfg);
    var hist = chat.msgs.length ? chat.msgs : [{ de: "bot", texto: PF.tokens(cfg.chatbot.bienvenida, cfg), sugerencias: menu }];
    var ventana = "";
    if (chat.abierto) {
      ventana = '<section aria-label="Asistente" class="fixed bottom-24 right-4 z-50 flex h-[34rem] max-h-[calc(100vh-8rem)] w-[calc(100vw-2rem)] max-w-sm origin-bottom-right ' + (chat.anim ? "animate-window-in " : "") + 'flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-lift ring-1 ring-primary/10">' +
        '<header class="flex items-center justify-between bg-gradient-to-r from-primary to-on-primary-container px-4 py-3 text-on-primary shadow-soft"><p class="flex items-center gap-2 font-heading font-semibold"><span class="material-symbols-outlined">' + esc(cfg.tienda.logoIcono) + '</span> Asistente</p><button aria-label="Cerrar chat" data-chat="cerrar" class="rounded-full p-1 transition hover:rotate-90 hover:bg-white/20"><span class="material-symbols-outlined">close</span></button></header>' +
        '<div id="chat-cuerpo" class="flex-1 space-y-3 overflow-y-auto bg-surface-container-low/50 p-4" aria-live="polite">' +
        hist.map(function (mm, i) {
          var ult = i === hist.length - 1;
          return '<div class="' + (ult ? "animate-pop-in " : "") + (mm.de === "yo" ? "text-right" : "") + '"><p class="inline-block max-w-[85%] whitespace-pre-line rounded-xl px-3 py-2 text-left text-sm shadow-soft ' + (mm.de === "yo" ? "rounded-br-sm bg-primary text-on-primary" : "rounded-bl-sm bg-surface-container-lowest") + '">' + cuerpoChat(mm.texto) + "</p>" +
            (mm.productos ? '<ul class="mt-2 space-y-2 text-left">' + mm.productos.map(function (p, n) {
              var im = PF.imgOk(p.imagen);
              return '<li class="animate-pop-in" style="animation-delay:' + n * 70 + 'ms"><a href="#/producto/' + esc(p.slug) + '" data-chat="cerrar" class="flex items-center gap-3 rounded-lg bg-surface-container-lowest p-2 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">' + (im ? '<img src="' + esc(im) + '" alt="" referrerpolicy="no-referrer" class="h-12 w-12 rounded-lg object-cover">' : "") +
                '<span class="text-sm"><span class="line-clamp-2 block font-medium">' + esc(p.nombre) + '</span><span class="font-bold text-primary">' + $$(p.precio) + "</span></span></a></li>";
            }).join("") + "</ul>" : "") +
            (mm.sugerencias && ult ? '<div class="mt-2 flex flex-wrap gap-2">' + mm.sugerencias.map(function (s, n) {
              return '<button data-sug="' + esc(s) + '" style="animation-delay:' + n * 45 + 'ms" class="animate-pop-in rounded-full border border-primary bg-surface-container-lowest px-3 py-1 text-xs font-medium text-primary shadow-soft transition hover:-translate-y-0.5 hover:bg-primary hover:text-on-primary hover:shadow-lift active:scale-95">' + esc(s) + "</button>";
            }).join("") + "</div>" : "") + "</div>";
        }).join("") +
        (chat.cargando ? '<div class="flex w-fit items-center gap-1 rounded-xl bg-surface-container-lowest px-3 py-3 shadow-soft" aria-label="Escribiendo">' + [0, 1, 2].map(function (d) { return '<span class="h-2 w-2 animate-dot rounded-full bg-primary" style="animation-delay:' + d * 160 + 'ms"></span>'; }).join("") + "</div>" : "") +
        '</div><button data-chat="menu" class="flex items-center justify-center gap-2 border-t border-outline-variant/60 bg-surface-container-lowest py-2 text-xs font-semibold text-primary transition hover:bg-primary-fixed/50"><span class="material-symbols-outlined !text-[18px]">apps</span> ' + esc(cfg.chatbot.textoBotonMenu) + "</button>" +
        '<form id="form-chat" class="flex gap-2 border-t border-outline-variant/60 bg-surface-container-lowest p-3"><input name="m" maxlength="200" autocomplete="off" placeholder="Escribí tu consulta…" aria-label="Mensaje" class="input !py-2"><button class="rounded-full bg-primary px-4 text-on-primary shadow-soft transition hover:scale-105 hover:shadow-lift active:scale-95" aria-label="Enviar"><span class="material-symbols-outlined !text-[20px]">send</span></button></form></section>';
    }
    var foco = document.activeElement && document.activeElement.closest && document.activeElement.closest("#form-chat");
    box.innerHTML = ventana + '<button data-chat="alternar" aria-label="' + (chat.abierto ? "Cerrar asistente" : "Abrir asistente") + '" class="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-lift transition hover:scale-110 hover:bg-on-primary-container active:scale-95 ' + (chat.abierto ? "" : "animate-ring") + '"><span class="material-symbols-outlined">' + (chat.abierto ? "close" : "chat") + "</span></button>";
    chat.anim = false;
    var cuerpo = document.getElementById("chat-cuerpo"); if (cuerpo) cuerpo.scrollTop = cuerpo.scrollHeight;
    if (chat.abierto && (foco || chat.enfocar)) { var inp = document.querySelector("#form-chat input"); if (inp) inp.focus(); chat.enfocar = false; }
  }
  async function enviarChat(texto) {
    texto = String(texto || "").trim().slice(0, 200);
    if (!texto || chat.cargando) return;
    var cfg = S.cfg, ahora = Date.now();
    chat.marcas = chat.marcas.filter(function (t) { return ahora - t < 60000; });
    var base = chat.msgs.length ? chat.msgs : [{ de: "bot", texto: PF.tokens(cfg.chatbot.bienvenida, cfg), sugerencias: PF.menuChat(cfg) }];
    if (chat.marcas.length >= cfg.chatbot.limitePorMinuto) {
      chat.msgs = base.concat([{ de: "yo", texto: texto }, { de: "bot", texto: "Estás escribiendo muy rápido 🐾. Esperá un momento e intentá de nuevo.", sugerencias: PF.menuChat(cfg) }]);
      pintarChat(); return;
    }
    chat.marcas.push(ahora);
    chat.msgs = base.concat([{ de: "yo", texto: texto }]);
    chat.cargando = true; chat.enfocar = true; pintarChat();
    var r = await PF.responder(texto, cfg, S.categorias, S.productos);
    await new Promise(function (ok) { setTimeout(ok, 350); }); // pausa corta para que se vea "escribiendo"
    chat.cargando = false; chat.enfocar = true;
    chat.msgs = chat.msgs.concat([{ de: "bot", texto: r.texto, productos: r.productos, sugerencias: r.sugerencias }]);
    pintarChat();
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-chat],[data-sug]");
    if (!t) return;
    if (t.dataset.sug) { enviarChat(t.dataset.sug); return; }
    var a = t.dataset.chat;
    if (a === "alternar") { chat.abierto = !chat.abierto; chat.anim = chat.abierto; chat.enfocar = true; pintarChat(); }
    else if (a === "cerrar") { chat.abierto = false; pintarChat(); }
    else if (a === "menu") {
      var cfg = S.cfg, base = chat.msgs.length ? chat.msgs : [{ de: "bot", texto: PF.tokens(cfg.chatbot.bienvenida, cfg), sugerencias: PF.menuChat(cfg) }];
      chat.msgs = base.concat([{ de: "bot", texto: PF.tokens(cfg.chatbot.mensajeMenu, cfg), sugerencias: PF.menuChat(cfg) }]); pintarChat();
    }
  });
  document.addEventListener("submit", function (e) {
    if (e.target.id === "form-chat") { e.preventDefault(); var v = e.target.m.value; e.target.m.value = ""; enviarChat(v); }
  });

  iniciar();
})();
