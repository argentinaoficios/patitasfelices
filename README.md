# Patitas Felices — tienda online con Google Sheets + Drive + WhatsApp

Tienda para mascotas **sin servidor y sin Node.js**. Solo tres piezas, todas gratis:

| Pieza | Para qué |
|---|---|
| **Google Apps Script** | Es el backend: guarda y lee en tu planilla, sube las fotos a tu Drive, valida el login y registra los pedidos |
| **Google Sheets** | Es la base de datos (productos, categorías, pedidos, configuración) |
| **Google Drive** | Guarda las fotos del catálogo (se suben desde el panel) |
| **GitHub + Vercel** | Publican los archivos (`index.html`, `css/`, `js/`) tal cual, sin compilar nada |

Todo con **la misma cuenta de Gmail**. No hay `npm`, ni `node_modules`, ni build.

- 🛒 Catálogo, carrito y checkout
- 💬 Al confirmar el pedido se abre **WhatsApp** con el resumen listo para enviar al negocio
- 🤖 Chatbot **sin IA** (por reglas), con animaciones y botón fijo «Ver todas las opciones»
- 🔐 **Panel admin** con usuario y clave: se configura todo desde ahí (textos, colores, envíos, chatbot, productos, fotos)

---

## Paso 1 — Backend en Google (5 minutos)

1. Entrá a [sheets.new](https://sheets.new) con tu Gmail y creá una planilla vacía (poné el nombre que quieras).
2. Menú **Extensiones → Apps Script**. Borrá el código que aparece y pegá **todo** el contenido de [`apps-script/Code.gs`](apps-script/Code.gs). Guardá (💾).
3. Botón **Implementar → Nueva implementación**.
   - Tipo (⚙️): **Aplicación web**
   - *Ejecutar como:* **Yo**
   - *Quién tiene acceso:* **Cualquier persona**
4. Tocá **Implementar** y aceptá los permisos (Google avisa «aplicación no verificada»: es *tu* propio script → *Avanzado → Ir a… (no seguro) → Permitir*). Pide acceso a Sheets y Drive para poder guardar datos y fotos.
5. Copiá la **URL de la aplicación web** (termina en `/exec`).
6. Abrí [`js/ajustes.js`](js/ajustes.js) y pegá la URL:

   ```js
   window.PF_API_URL = "https://script.google.com/macros/s/XXXXXXXX/exec";
   ```

Listo. Las pestañas **Productos, Categorias, Pedidos y Config** se crean solas en tu planilla (con productos de ejemplo), y la carpeta **«Patitas Felices - Fotos»** se crea en tu Drive cuando subas la primera foto.

> Si después cambiás el código de `Code.gs`: **Implementar → Administrar implementaciones → ✏️ → Versión: Nueva versión → Implementar**. La URL no cambia.

## Paso 2 — Probarlo en tu compu (opcional)

Hacé doble clic en `index.html`. Funciona abriendo el archivo directo. Sin la URL del paso 1 se muestra en **modo demostración** (datos de ejemplo, sin pedidos).

## Paso 3 — Publicarlo con GitHub + Vercel

1. En [github.com](https://github.com) → **New repository** (por ejemplo `patitas-felices`). Subí todos los archivos de esta carpeta (**Add file → Upload files**, arrastrá todo; no hace falta instalar Git).
2. En [vercel.com](https://vercel.com) iniciá sesión con GitHub → **Add New → Project** → elegí el repositorio.
3. Dejá todo por defecto: *Framework Preset:* **Other**, sin *Build Command*, sin *Output Directory*. **Deploy**.

Cada vez que cambies un archivo en GitHub, Vercel republica solo. Los **cambios de contenido** (productos, textos, colores, fotos) se hacen desde el panel y **no** requieren republicar.

## Usar el panel de administración

Entrá por el ícono de escudo del menú o por `tu-sitio/#/admin`.

**Usuario inicial:** `admin` · **Clave inicial:** `admin12345678`
⚠️ Cambialos apenas entres (*Usuario y clave*). Si subís el proyecto a un repositorio público, esos datos iniciales son públicos.

| Sección | Qué controla |
|---|---|
| General | Nombre, eslogan, logo, moneda, email, horarios, pie de página, menú |
| Página de inicio | Portada, secciones visibles, beneficios |
| Apariencia | Colores principal y secundario (la paleta se calcula sola) |
| Envíos y WhatsApp | **Número de WhatsApp del negocio**, mensaje del pedido, costo de envío y mínimo para envío gratis |
| Chatbot | Bienvenida, temas, palabras clave, respuestas, orden del menú |
| Productos | Alta, edición, borrado, stock, precios, ofertas, **subir foto a Drive** |
| Categorías | Alta, edición, borrado |
| Pedidos | Últimos pedidos recibidos |
| Usuario y clave | Cambiar usuario y clave |

> Primer paso recomendado: *Envíos y WhatsApp* → cargá el número con código de país y sin `+` (Argentina: `549` + código de área + número, ej. `5493811234567`).

## Cómo funciona la venta por WhatsApp

1. El cliente arma el carrito y completa nombre, teléfono, dirección y ciudad.
2. Al tocar **Confirmar pedido**, el backend valida el stock y **recalcula los precios desde tu planilla** (no confía en el navegador), registra el pedido en la pestaña *Pedidos* y devuelve el total.
3. Se abre `wa.me/<tu número>` con el resumen: cliente, productos, subtotal, envío y total.
4. Si el navegador bloquea la pestaña, la pantalla de confirmación tiene un botón para enviarlo.

## Estructura

```
index.html          página única (usa rutas con #, no necesita configurar Vercel)
js/ajustes.js       ← única línea que editás: la URL de tu Apps Script
js/nucleo.js        configuración por defecto, WhatsApp, chatbot, cliente de la API
js/tienda.js        tienda: inicio, catálogo, producto, carrito, checkout, chat
js/admin.js         panel de administración (se carga solo al entrar)
js/demo.js          datos de ejemplo para el modo demostración
css/estilos.css     estilos base
apps-script/Code.gs backend completo para pegar en Apps Script
vercel.json         cabeceras de seguridad
```

## Límites y cosas a saber

- **No cobra online**: el pago se coordina por WhatsApp.
- **Stock**: se valida al comprar pero no se descuenta solo; se edita en el panel.
- **Velocidad**: Apps Script tarda 1–2 s en «despertar» la primera vez; el catálogo se guarda en caché (10 min) y el navegador muestra al instante lo último que vio.
- **Fotos de Drive**: quedan como «cualquiera con el enlace puede ver» (necesario para que se vean en la tienda) y se muestran con enlaces `lh3.googleusercontent.com`, que Google no garantiza para tráfico muy alto. Para una tienda chica alcanza.
- **Cuotas de Google**: las cuentas gratuitas tienen límites diarios de ejecución de Apps Script (miles de llamadas por día); es más que suficiente para un negocio chico.
- **Seguridad**: la URL del Apps Script es pública, pero toda acción del panel exige iniciar sesión (clave con hash + sesión de 6 h) y hay un freno ante intentos fallidos. Aun así, cambiá la clave inicial.
- **Tailwind por CDN**: el diseño usa Tailwind desde un CDN para no tener compilación; es ideal para esta escala (si algún día querés optimizarlo, se puede compilar).
- **Vercel Hobby** es para uso no comercial; si vendés en serio, mirá su plan Pro o publicá el mismo sitio en Netlify/Cloudflare Pages/GitHub Pages (también es solo estático).
- Los productos y fotos de ejemplo son de muestra: reemplazalos desde el panel.
