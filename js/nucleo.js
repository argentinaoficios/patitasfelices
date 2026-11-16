/* Núcleo compartido: configuración por defecto, formato, WhatsApp, chatbot y cliente del Apps Script. */
(function () {
  "use strict";
  var PF = (window.PF = window.PF || {});

  // ---------------------------------------------------------------- utilidades
  PF.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  PF.clon = function (o) { return JSON.parse(JSON.stringify(o)); };
  PF.precio = function (n, moneda) {
    n = Number(n) || 0;
    try {
      return new Intl.NumberFormat("es-AR", { style: "currency", currency: moneda || "ARS", maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
    } catch (e) { return "$" + n; }
  };
  PF.imgOk = function (u) { return typeof u === "string" && /^https:\/\/[^\s"'<>]+$/i.test(u) ? u : ""; };

  // ---------------------------------------------------------------- configuración
  PF.DEFECTO = {
    tienda: {
      nombre: "Patitas Felices", eslogan: "Tienda especializada para mascotas",
      descripcion: "Nutrición, amor y diversión para tu mejor amigo de cuatro patas.",
      logoIcono: "pets", moneda: "ARS", email: "hola@patitasfelices.com", horarios: "de lunes a sábado de 9 a 18 h",
      footerTexto: "Cuidado, amor y los mejores productos para tus fieles compañeros de cuatro patas.",
      menu: [
        { etiqueta: "Inicio", href: "#/" }, { etiqueta: "Tienda", href: "#/tienda" },
        { etiqueta: "Alimentos", href: "#/tienda?categoria=alimentos" }, { etiqueta: "Juguetes", href: "#/tienda?categoria=juguetes" },
      ],
    },
    whatsapp: { numero: "", encabezado: "🐾 *Nuevo pedido*", despedida: "¡Gracias! Quedo atento/a para coordinar el pago y la entrega.", textoBoton: "Confirmar pedido por WhatsApp" },
    envios: { costo: 4500, gratisDesde: 50000 },
    apariencia: { colorPrimario: "#9b4500", colorSecundario: "#2c694e" },
    inicio: {
      heroBadge: "Tienda especializada para mascotas",
      heroTitulo: "Nutrición, amor y diversión para tu mejor amigo de cuatro patas",
      heroTexto: "Descubrí nuestra selección curada de productos premium diseñados para garantizar la salud, el bienestar y la felicidad de tu mascota.",
      heroImagen: "", botonPrincipal: "Comprar ahora", botonSecundario: "Ver catálogo",
      garantiaTitulo: "100% Satisfacción", garantiaTexto: "Garantía de devolución",
      categoriasTitulo: "Categorías destacadas", categoriasSubtitulo: "Explorá por sección",
      estrellaTitulo: "Productos estrella", estrellaSubtitulo: "Favoritos de la manada",
      porQueTitulo: "¿Por qué elegir Patitas Felices?",
      mostrarCategorias: true, mostrarEstrella: true, mostrarBeneficios: true,
      beneficios: [
        { icono: "local_shipping", titulo: "Envíos rápidos y gratis", texto: "Recibí tu pedido en pocos días, con envío gratis en compras superiores al mínimo." },
        { icono: "support_agent", titulo: "Atención personalizada", texto: "Nuestro equipo te asesora en nutrición y bienestar animal." },
        { icono: "verified_user", titulo: "Productos 100% seguros", texto: "Cada producto es seleccionado y probado pensando en la salud de tu mascota." },
      ],
    },
    checkout: { titulo: "Finalizar compra", aviso: "Al confirmar se abre WhatsApp con el resumen de tu pedido listo para enviar. Ahí coordinamos el pago y la entrega.", textoBoton: "Confirmar pedido por WhatsApp" },
    chatbot: {
      activo: true, bienvenida: "¡Hola! 🐾 Soy el asistente de {tienda}. ¿En qué te ayudo?",
      mensajeMenu: "Estas son todas las opciones. Tocá la que necesites:",
      fueraDeTema: "Eso no corresponde a {tienda} 🐾. Puedo ayudarte con las opciones del menú o buscar un producto.",
      textoBotonMenu: "Ver todas las opciones", limitePorMinuto: 20,
      temas: [
        { id: "saludo", etiqueta: "Hola", palabras: "hola, buenas, buen dia, buenos dias, buenas tardes, buenas noches, que tal", respuesta: "", tipo: "saludo", enMenu: false },
        { id: "envios", etiqueta: "Envíos", palabras: "envio, enviar, enviamos, delivery, despacho, entrega, demora, tarda, llega, llegan, flete", respuesta: "Hacemos envíos a todo el país. El envío cuesta {costo_envio} y es **gratis en compras desde {envio_gratis}**. Coordinamos la entrega por WhatsApp.", tipo: "texto", enMenu: true },
        { id: "pagos", etiqueta: "Formas de pago", palabras: "pago, pagar, tarjeta, transferencia, efectivo, mercado pago, mercadopago, cuotas, credito, debito", respuesta: "Cerramos la compra por WhatsApp: ahí coordinamos el medio de pago que prefieras (transferencia, efectivo, etc.).", tipo: "texto", enMenu: true },
        { id: "ofertas", etiqueta: "Ver ofertas", palabras: "oferta, ofertas, descuento, descuentos, promo, promocion, promociones, rebaja, barato, economico", respuesta: "Estas son las ofertas vigentes:", tipo: "ofertas", enMenu: true },
        { id: "categorias", etiqueta: "Ver categorías", palabras: "categoria, categorias, secciones, que venden, que tienen, catalogo, que hay, productos", respuesta: "Tenemos estas categorías, tocá una para ver sus productos:", tipo: "categorias", enMenu: true },
        { id: "devoluciones", etiqueta: "Devoluciones", palabras: "devolucion, devolver, cambio, cambiar, reembolso, garantia, defectuoso, roto", respuesta: "Tenés garantía de devolución. Si el producto no te convence o llegó con algún problema, escribinos por WhatsApp y lo resolvemos. Tené a mano tu código de pedido.", tipo: "texto", enMenu: true },
        { id: "pedido", etiqueta: "Estado de mi pedido", palabras: "pedido, orden, compra, seguimiento, rastrear, estado de mi, mi pedido", respuesta: "Para consultar tu pedido escribime tu código, que empieza con PF- (por ejemplo PF-1A2B3C4D).", tipo: "pedido", enMenu: true },
        { id: "contacto", etiqueta: "Contacto", palabras: "contacto, contactar, comunicar, telefono, whatsapp, email, mail, hablar con, atencion, humano, persona", respuesta: "Escribinos por WhatsApp o a {email}. Atendemos {horarios}.", tipo: "texto", enMenu: true },
        { id: "horarios", etiqueta: "Horarios", palabras: "horario, horarios, abierto, abren, atienden, local, sucursal, donde estan, ubicacion", respuesta: "Somos una tienda online: podés comprar las 24 horas. Atendemos consultas {horarios}.", tipo: "texto", enMenu: false },
        { id: "stock", etiqueta: "Stock", palabras: "stock, disponible, disponibilidad, quedan", respuesta: "El stock se muestra en cada producto. Decime qué producto buscás y te lo muestro.", tipo: "texto", enMenu: false },
        { id: "gracias", etiqueta: "Gracias", palabras: "gracias, genial, perfecto, excelente, chau, adios, hasta luego", respuesta: "¡De nada! 🐶 Cualquier otra duda, acá estoy.", tipo: "texto", enMenu: false },
      ],
    },
  };

  // Mezcla lo guardado con los valores por defecto: nunca confiar en lo que llega de afuera.
  function fusionar(def, inp) {
    if (Array.isArray(def)) {
      if (!Array.isArray(inp)) return PF.clon(def);
      var tpl = def[0];
      if (tpl && typeof tpl === "object") {
        return inp.filter(function (x) { return x && typeof x === "object" && !Array.isArray(x); }).slice(0, 100)
          .map(function (x) { return fusionar(tpl, x); });
      }
      return PF.clon(def);
    }
    if (def && typeof def === "object") {
      var o = inp && typeof inp === "object" && !Array.isArray(inp) ? inp : {}, r = {};
      Object.keys(def).forEach(function (k) { r[k] = fusionar(def[k], o[k]); });
      return r;
    }
    if (typeof def === "string") return typeof inp === "string" ? inp.slice(0, 2000) : def;
    if (typeof def === "number") return typeof inp === "number" && isFinite(inp) ? inp : def;
    return typeof inp === typeof def ? inp : def;
  }

  var HEX = /^#[0-9a-fA-F]{6}$/;
  PF.normalizar = function (inp) {
    var c = fusionar(PF.DEFECTO, inp), d = PF.DEFECTO;
    if (!HEX.test(c.apariencia.colorPrimario)) c.apariencia.colorPrimario = d.apariencia.colorPrimario;
    if (!HEX.test(c.apariencia.colorSecundario)) c.apariencia.colorSecundario = d.apariencia.colorSecundario;
    c.whatsapp.numero = c.whatsapp.numero.replace(/\D/g, "").slice(0, 15);
    c.envios.costo = Math.max(0, c.envios.costo);
    c.envios.gratisDesde = Math.max(0, c.envios.gratisDesde);
    c.chatbot.limitePorMinuto = Math.min(200, Math.max(1, Math.round(c.chatbot.limitePorMinuto)));
    if (!/^[A-Z]{3}$/.test(c.tienda.moneda)) c.tienda.moneda = "ARS";
    c.tienda.menu = c.tienda.menu.map(function (m) {
      return { etiqueta: m.etiqueta, href: /^\//.test(m.href) ? "#" + m.href : m.href }; // migra "/tienda" -> "#/tienda"
    }).filter(function (m) { return m.etiqueta && /^(#\/|https:\/\/)/.test(m.href); });
    var tipos = ["texto", "saludo", "ofertas", "categorias", "pedido"];
    c.chatbot.temas = c.chatbot.temas.map(function (t, i) {
      return { id: t.id || "tema-" + i, etiqueta: t.etiqueta, palabras: t.palabras, respuesta: t.respuesta, enMenu: t.enMenu, tipo: tipos.indexOf(t.tipo) >= 0 ? t.tipo : "texto" };
    }).filter(function (t) { return t.etiqueta.trim(); });
    c.inicio.heroImagen = PF.imgOk(c.inicio.heroImagen);
    return c;
  };

  // ---------------------------------------------------------------- colores derivados
  function hexRgb(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgbHsl(a) {
    var r = a[0] / 255, g = a[1] / 255, b = a[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    var d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    var h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
  }
  function hslStr(h, s, l) {
    var a = s * Math.min(l, 1 - l);
    function f(n) { var k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); }
    return f(0) + " " + f(8) + " " + f(4);
  }
  PF.aplicarColores = function (cfg) {
    var p = rgbHsl(hexRgb(cfg.apariencia.colorPrimario)), s = rgbHsl(hexRgb(cfg.apariencia.colorSecundario));
    var v = {
      "--c-primary": hexRgb(cfg.apariencia.colorPrimario).join(" "),
      "--c-primary-container": hslStr(p[0], Math.max(p[1], 0.6), 0.62),
      "--c-on-primary-container": hslStr(p[0], p[1], 0.2),
      "--c-primary-fixed": hslStr(p[0], Math.max(p[1], 0.6), 0.9),
      "--c-secondary": hexRgb(cfg.apariencia.colorSecundario).join(" "),
      "--c-secondary-container": hslStr(s[0], Math.min(s[1], 0.5), 0.85),
      "--c-on-secondary-container": hslStr(s[0], s[1], 0.3),
    };
    Object.keys(v).forEach(function (k) { document.documentElement.style.setProperty(k, v[k]); });
  };

  // ---------------------------------------------------------------- negocio
  PF.costoEnvio = function (subtotal, cfg) { return subtotal === 0 || subtotal >= cfg.envios.gratisDesde ? 0 : cfg.envios.costo; };
  PF.tokens = function (t, cfg) {
    var p = function (n) { return PF.precio(n, cfg.tienda.moneda); };
    return String(t)
      .split("{tienda}").join(cfg.tienda.nombre).split("{costo_envio}").join(p(cfg.envios.costo))
      .split("{envio_gratis}").join(p(cfg.envios.gratisDesde)).split("{email}").join(cfg.tienda.email)
      .split("{horarios}").join(cfg.tienda.horarios)
      .split("{whatsapp}").join(cfg.whatsapp.numero ? "+" + cfg.whatsapp.numero : "nuestro WhatsApp");
  };

  // Mensaje de WhatsApp con el resumen del pedido (los precios vienen ya validados por el servidor).
  PF.mensajeWhatsapp = function (cfg, r) {
    var m = cfg.tienda.moneda, c = r.cliente;
    var l = [
      cfg.whatsapp.encabezado + " #" + r.id, "",
      "*Cliente:* " + c.nombre,
      c.telefono ? "*Teléfono:* " + c.telefono : null,
      c.email ? "*Email:* " + c.email : null,
      "*Entrega:* " + c.direccion + ", " + c.ciudad, "",
      "*Productos:*",
    ].concat(r.items.map(function (i) { return "• " + i.cantidad + " x " + i.nombre + " — " + PF.precio(i.precio * i.cantidad, m); }))
      .concat([
        "", "Subtotal: " + PF.precio(r.subtotal, m),
        "Envío: " + (r.envio === 0 ? "Gratis" : PF.precio(r.envio, m)),
        "*TOTAL: " + PF.precio(r.total, m) + "*",
        c.notas ? "\n*Notas:* " + c.notas : null,
        cfg.whatsapp.despedida ? "\n" + cfg.whatsapp.despedida : null,
      ]);
    return l.filter(function (x) { return typeof x === "string"; }).join("\n");
  };
  PF.urlWhatsapp = function (numero, mensaje) { return "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensaje); };

  // ---------------------------------------------------------------- API (Apps Script)
  PF.api = {
    configurada: function () { return /^(https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec|http:\/\/(localhost|127\.0\.0\.1):\d+\/exec)$/.test(window.PF_API_URL || ""); },
    async get(accion) {
      var r = await fetch(window.PF_API_URL + "?accion=" + encodeURIComponent(accion), { redirect: "follow" });
      var d = await r.json();
      if (d.error) throw new Error(d.error);
      return d;
    },
    async post(cuerpo) {
      // text/plain evita el "preflight" de CORS, que Apps Script no admite
      var r = await fetch(window.PF_API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(cuerpo), redirect: "follow" });
      var d = await r.json();
      if (d.error) { var e = new Error(d.error); e.sesion = d.sesion; throw e; }
      return d;
    },
  };

  // ---------------------------------------------------------------- chatbot (sin IA)
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim(); }
  var STOP = "quiero busco tienen tenes hay para con sin una uno unos unas del los las que por mi mis mas muy algo necesito comprar ver mostrame me de el la un en y o es si".split(" ");
  function raiz(w) { return w.length > 4 ? w.replace(/(es|s)$/, "") : w; }
  PF.menuChat = function (cfg) { return cfg.chatbot.temas.filter(function (t) { return t.enMenu; }).map(function (t) { return t.etiqueta; }); };

  /** Devuelve { texto, productos?, sugerencias? }. Usa los datos reales cargados por el dueño. */
  PF.responder = async function (mensaje, cfg, categorias, productos) {
    var $ = function (t) { return PF.tokens(t, cfg); };
    var menu = PF.menuChat(cfg);
    var fuera = { texto: $(cfg.chatbot.fueraDeTema), sugerencias: menu };
    var txt = norm(mensaje);
    if (!txt) return fuera;

    var cod = String(mensaje).toUpperCase().match(/PF-[0-9A-F]{8}/);
    if (cod) {
      try {
        var e = await PF.api.post({ accion: "estadoPedido", id: cod[0] });
        if (!e.encontrado) return { texto: "No encontré el pedido " + cod[0] + ". Revisá que esté bien escrito, o escribinos por WhatsApp.", sugerencias: menu };
        return { texto: "Pedido " + e.id + ": estado **" + e.estado + "**. " + e.cantidadProductos + " producto(s), total " + PF.precio(e.total, cfg.tienda.moneda) + ".", sugerencias: menu };
      } catch (x) { return { texto: "No pude consultar el pedido ahora. Probá más tarde.", sugerencias: menu }; }
    }

    function tema(t) {
      if (t.tipo === "saludo") return { texto: $(cfg.chatbot.bienvenida), sugerencias: menu };
      if (t.tipo === "ofertas") {
        var of = productos.filter(function (p) { return p.precioAnterior && p.precioAnterior > p.precio; }).slice(0, 4);
        return of.length ? { texto: $(t.respuesta), productos: of, sugerencias: menu } : { texto: "Por ahora no hay ofertas activas, pero mirá toda la tienda.", sugerencias: menu };
      }
      if (t.tipo === "categorias") return { texto: $(t.respuesta), sugerencias: categorias.map(function (c) { return c.nombre; }) };
      return { texto: $(t.respuesta), sugerencias: menu };
    }

    var exacto = cfg.chatbot.temas.filter(function (t) { return norm(t.etiqueta) === txt; })[0];
    if (exacto) return tema(exacto);

    var cat = categorias.filter(function (c) { return txt === norm(c.nombre) || txt === norm(c.slug); })[0];
    if (cat) {
      var lista = productos.filter(function (p) { return p.categoria === cat.slug; }).slice(0, 4);
      return lista.length ? { texto: "Productos de " + cat.nombre + ":", productos: lista, sugerencias: menu } : { texto: "Por ahora no hay productos en " + cat.nombre + ".", sugerencias: menu };
    }

    var mejor = null;
    cfg.chatbot.temas.forEach(function (t) {
      var pts = t.palabras.split(",").map(norm).filter(Boolean).filter(function (w) { return txt.indexOf(w) >= 0; }).length;
      if (pts > 0 && (!mejor || pts > mejor.pts)) mejor = { t: t, pts: pts };
    });
    if (mejor && mejor.t.tipo !== "saludo") return tema(mejor.t);

    var toks = txt.split(" ").filter(function (w) { return w.length > 2 && STOP.indexOf(w) < 0; }).map(raiz);
    if (toks.length) {
      var hallados = productos.map(function (p) {
        var hay = norm(p.nombre + " " + p.categoria + " " + p.descripcion);
        return { p: p, pts: toks.filter(function (t) { return hay.indexOf(t) >= 0; }).length };
      }).filter(function (x) { return x.pts > 0; }).sort(function (a, b) { return b.pts - a.pts; }).slice(0, 4).map(function (x) { return x.p; });
      if (hallados.length) return { texto: "Encontré esto en la tienda:", productos: hallados, sugerencias: menu };
    }
    if (mejor) return tema(mejor.t);
    return fuera;
  };
})();
