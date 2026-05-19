# Cafital — Guía de Proyecto para Claude

## ¿Qué es Cafital?

Marketplace B2B multivendor para el ecosistema completo del café en Bolivia. Conecta a todos los actores de la cadena: productores, tostadurías, proveedores de maquinaria, técnicos, baristas, cafeterías, consultores, exportadores y más. Todas las transacciones son entre negocios (B2B).

**Este es un prototipo funcional**: no hay backend. Todos los datos son mockeados y se puede simular una sesión completa para navegar todos los flujos como si existiera un backend real.

---

## Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + TypeScript
- **Estilos**: Tailwind CSS v4 con tokens semánticos del design system
- **Iconos**: Lucide React (stroke-width 1.5px, size 20px por defecto)
- **Tipografía**: Noto Serif + Manrope (Google Fonts)
- **Estado global**: React Context + localStorage para sesión simulada
- **Sin backend**: todos los datos viven en `src/data/mock/`

---

## Estructura del Proyecto

```
src/
  app/                    # App Router de Next.js
    (auth)/               # Rutas de autenticación (login, register)
    (main)/               # Rutas principales con layout base
      catalogo/           # Catálogo de publicaciones
      eventos/            # Sección de eventos
      vendedores/         # Perfiles de vendedores
      mi-tienda/          # Panel del vendedor
      perfil/             # Perfil del comprador
      favoritos/          # Favoritos del usuario
      carrito/            # Carrito de compras
      checkout/           # Flujo de checkout
      suscripciones/      # Planes de suscripción
    layout.tsx
    page.tsx              # Home / Landing
    globals.css
  components/
    ui/                   # Componentes base (Button, Badge, Input, Toggle, Toast...)
    layout/               # Header, Footer, Sidebar, Nav
    catalog/              # ProductCard, ProductGrid, Filters
    events/               # EventCard, EventGrid
    seller/               # SellerCard, SellerProfile
    shop/                 # Mi Tienda components
    forms/                # PublicationForm, EventForm
  contexts/
    AuthContext.tsx        # Sesión simulada
    CartContext.tsx        # Carrito
    ToastContext.tsx       # Sistema de toasts
  data/
    mock/
      users.ts            # Usuarios mockeados
      publications.ts     # Publicaciones mockeadas
      events.ts           # Eventos mockeados
      orders.ts           # Pedidos mockeados
      categories.ts       # Categorías y subcategorías
  hooks/
    useAuth.ts
    useCart.ts
    useToast.ts
    useFavorites.ts
  types/
    index.ts              # Tipos TypeScript globales
  lib/
    utils.ts              # Funciones utilitarias
```

---

## Tipos de Usuario

### Comprador
- Perfil: foto, nombre completo, descripción, departamento, correo
- **Puede**: explorar y comprar, contactar vendedores por WhatsApp, activar compras recurrentes, guardar favoritos (publicaciones y vendedores), ver historial de pedidos, gestionar suscripciones recurrentes

### Vendedor
- Perfil del negocio: nombre comercial, logo, departamento y municipio, descripción, correo, NIT (opcional)
- **Puede**: todo lo del comprador + crear/gestionar publicaciones + publicar/gestionar eventos + acceder a Mi Tienda
- **Perfil público sin suscripción**: logo, portada, nombre del negocio, descripción, publicaciones activas
- **Perfil público con suscripción**: según el plan activo (ver Suscripciones)

---

## Sesión Simulada

Usuarios predefinidos para testear todos los flujos. Cambiar entre ellos con el `DevSessionSwitcher` (visible solo en desarrollo, esquina inferior derecha):

| ID | Rol | Suscripción | Descripción |
|----|-----|------------|-------------|
| `buyer-01` | Comprador | — | Juan Pérez, comprador activo |
| `seller-free` | Vendedor | Sin plan | Vendedor básico sin suscripción |
| `seller-semilla` | Vendedor | Semilla ($9.99) | Vendedor con plan básico |
| `seller-cosecha` | Vendedor | Cosecha ($14.99) | Vendedor con plan intermedio |
| `seller-exportacion` | Vendedor | Exportación ($29.99) | Vendedor premium |

La sesión se persiste en `localStorage` con la clave `cafital_session`.

---

## Categorías de Publicación

### Categoría A — Café e Insumos
Productos físicos. **Compra recurrente disponible** en todas las publicaciones.

Subcategorías:
- Café verde (grano sin tostar)
- Café pergamino
- Café tostado en grano
- Café molido
- Café soluble e instantáneo
- Subproductos del café (cáscara, pulpa, harina)
- Plantas, semillas y material vegetativo
- Fertilizantes e insumos agrícolas
- Empaques y envases
- Insumos de laboratorio y cata

Atributos clave por subcategoría:
- **Proceso de beneficiado**: Lavado / Natural / Honey amarillo/rojo/negro / Anaeróbico / Semi-lavado / Doble lavado
- **Variedad botánica**: Typica / Caturra / Bourbon / Gesha-Geisha / Catuaí / Catimor / Sarchimor / Mezcla-Blend
- **Zona de origen**: Caranavi / Nor Yungas / Sud Yungas / Chapare / Franz Tamayo / Inquisivi / Santa Cruz / Cochabamba / Tarija
- **Altitud**: Hasta 1000 / 1000–1500 / 1500–2000 / Más de 2000 msnm
- **Puntuación SCA**: Sin puntaje / <80 / 80–84 / 85–89 / 90+ pts
- **Nivel de tueste** (tostado): Claro / Medio / Medio-oscuro / Oscuro / Espresso
- **Certificaciones**: Orgánico / Fair Trade / Rainforest Alliance / Sin certificación

### Categoría B — Maquinaria y Equipo
Equipos físicos para todas las etapas. **Sin compra recurrente**.

Subcategorías:
- Equipos de finca y cosecha
- Equipos de secado
- Tostadoras
- Molinos y molinillos profesionales
- Equipos de extracción y barismo
- Accesorios de barismo
- Equipos de empaque y sellado
- Equipos de laboratorio y control de calidad
- Silos y almacenamiento
- Accesorios y repuestos generales
- Servicio técnico y mantenimiento

Atributos clave:
- **Estado**: Nuevo / Usado (Reacondicionado) / Usado (En condición actual)
- **Condición de venta**: Venta directa / Arriendo-Leasing / Subasta
- **Servicios incluidos**: Instalación técnica / Capacitación / Garantía 12 meses / Servicio post-venta

### Categoría C — Servicios Profesionales
Conocimiento, formación, consultoría. **Compra recurrente disponible**.

Subcategorías:
- Consultoría agronómica y de finca
- Consultoría de calidad y trazabilidad
- Procesamiento por contrato
- Formación en barismo
- Formación en tostado
- Formación en catación y análisis sensorial
- Consultoría de negocios para café
- Diseño de marca y comunicación para café
- Logística y transporte de café

### Categoría D — Terrenos y Fincas
**Sin carrito. Solo WhatsApp. Sin compra recurrente.** Siempre bajo cotización.

Subcategorías:
- Finca cafetalera en producción
- Lote agrícola para café
- Finca con infraestructura
- Terreno apto para café (sin plantaciones)

---

## Campos Comunes a Todas las Publicaciones

**Información base:**
- Fotos (mínimo 1, hasta 8, primera = principal)
- Título (máx. 80 caracteres) — obligatorio
- Descripción (textarea) — obligatorio
- Variantes (textarea) — opcional
- Video URL (YouTube/Vimeo) — opcional

**Precio y logística** (excepto Terrenos):
- Modo de precio: Con precio / Bajo cotización
- Unidades de venta: tabla con unidad + precio Bs. + cantidad mínima
- Cobertura: 9 departamentos + Todo Bolivia
- Inventario: toggle + cantidad (opcional)
- Descuento: toggle + porcentaje % (opcional)
- Compra recurrente: toggle (solo Cat. A y C, opcional)

**Comportamiento:**
- Con precio: botón "Agregar al carrito" + botón "Contactar por WhatsApp"
- Bajo cotización: solo botón "Contactar por WhatsApp"
- Terrenos: siempre solo WhatsApp
- Con descuento: badge sobre la foto con % + precio original tachado
- Con compra recurrente: badge sobre la foto indicándolo

---

## Compra Recurrente

Disponible en Cat. A y C. El vendedor la habilita desde el formulario.

El comprador:
1. Activa desde la página del producto
2. Elige frecuencia: semanal / quincenal / mensual / bimensual
3. Elige cantidad
4. Confirma — primera orden se procesa inmediatamente
5. Siguientes órdenes se generan automáticamente

Gestión desde "Mis suscripciones" en el perfil: pausar, editar, cancelar. Notificación 3 días antes de cada orden automática.

---

## Eventos

Publicados por vendedores. Sección separada del catálogo.

**Tipos**: talleres, catas, capacitaciones, ferias, competencias, networking, tours de finca.

**Tarjeta de evento**: imagen (16:10), nombre, fecha y hora, modalidad, organizador, cupos, precio.

**Página individual**: imagen, nombre, fecha/hora/duración, modalidad + lugar/enlace, descripción, perfil del organizador, cupos, precio, botón "Inscribirme" / "Comprar entrada".

**Formulario de evento:**
- Nombre (máx. 80 chars)
- Imagen (16:10)
- Tipo: Taller / Cata / Capacitación / Feria / Competencia / Networking / Tour de finca / Otro
- Descripción
- Modalidad: Presencial / Virtual / Híbrido
- Departamento, Ciudad, Dirección (si presencial)
- Link del evento (si virtual)
- Fecha, hora inicio, hora fin
- Precio o "Gratuito"
- Cupos (número o Sin límite)
- Fecha límite de inscripción

---

## Suscripciones para Vendedores

### Plan Semilla — $9.99/mes
- 1 aparición en hero banner/mes
- Perfil: logo, portada, nombre, descripción, publicaciones activas
- Badge de vendedor verificado

### Plan Cosecha — $14.99/mes
- 3 apariciones en hero banner/mes
- Aparición en "Vendedores destacados" del Home
- Todo lo del plan Semilla
- Carrusel de hasta 5 imágenes adicionales en el perfil

### Plan Exportación — $29.99/mes
- 7 apariciones en hero banner/mes
- Aparición prioritaria en "Vendedores destacados"
- Espacios publicitarios adicionales en catálogo y otras secciones
- Etiqueta de plan premium en el perfil
- Todo lo del plan anterior + carrusel hasta 10 imágenes
- Bloque "Sobre nosotros" (misión, visión, historia)
- Estadísticas de visitas a publicaciones en Mi Tienda

---

## Mi Tienda (Panel del Vendedor)

- **Dashboard**: ventas del período, pedidos recibidos, publicaciones activas
- **Pedidos**: lista con estado (pendiente / en proceso / completado). Cada pedido: producto, comprador, cantidad, total, fecha
- **Mis publicaciones**: tabla con imagen, nombre, precio, stock, estado. Editar, pausar, eliminar
- **Mis eventos**: lista con estado. Crear, editar, eliminar
- **Nueva publicación / Nuevo evento**: acceso al formulario
- **Ajustes de tienda**: editar datos del negocio
- **Planes**: si tiene plan Exportación, también ve estadísticas de visitas

---

## Flujos Principales

1. **Comprador comprando**: Catálogo → Publicación → Elige unidad/cantidad → Carrito → Checkout → Confirmación
2. **Comprador cotizando**: Publicación → Botón WhatsApp → Conversación externa
3. **Compra recurrente**: Publicación → Activa toggle → Elige frecuencia/cantidad → Confirma → Primera orden procesada
4. **Inscripción a evento**: Eventos → Página del evento → Inscribirme/Comprar entrada → Confirmación
5. **Vendedor publica producto**: Mi Tienda → Nueva publicación → Categoría → Subcategoría → Información base → Características → Precio/logística → Vista previa → Publica
6. **Vendedor publica evento**: Mi Tienda → Mis eventos → Nuevo evento → Formulario → Publica
7. **Vendedor contrata suscripción**: Mi Tienda → Planes → Elige → Contrata → Beneficios activos

---

## Mock Data

Todos los datos viven en `src/data/mock/`. Reglas:
- Las funciones de acceso simulan delays con `setTimeout` para parecer llamadas reales
- Los datos cubren todos los estados posibles (ej. publicaciones con precio, bajo cotización, con descuento, con compra recurrente habilitada)
- Los usuarios mock cubren todos los roles y planes de suscripción
- Los pedidos mock cubren todos los estados (pendiente / en proceso / completado)

Archivos:
- `users.ts` — perfiles de todos los tipos de usuario
- `publications.ts` — publicaciones de todas las categorías
- `events.ts` — eventos de todos los tipos
- `orders.ts` — historial de pedidos
- `categories.ts` — árbol de categorías y subcategorías con etiquetas

---

## Favoritos

El usuario puede guardar con ícono de corazón:
- Publicaciones: desde tarjeta en catálogo o desde página del producto
- Perfiles de vendedores: desde el perfil público

Accesible desde "Favoritos" en la nav, con dos pestañas: Publicaciones / Vendedores.

---

## Design System

Siempre usar el comando `/design-system` al generar cualquier pantalla para tener las especificaciones exactas.

**Reglas críticas de diseño:**
- Fondo de página: siempre `#F5F5F5` (bg-neutral-100)
- Contenedores: siempre `#FFFFFF` + `border 1px solid #EBEBEB` + sombra correspondiente
- Sin gradientes, sin texturas decorativas
- Diseño flat — profundidad solo con bordes y sombras
- Verde (`#2ECC71`) SOLO en: botón primario, iconos activos, toggles activos, links activos, focus ring
- Mostaza (`#C9870E`) SOLO en: botón de checkout/pago
- 90% de la superficie debe ser blanca/gris neutro — el color es funcional, no decorativo

**Tipografía:**
- Títulos: Noto Serif (400/700)
- UI: Manrope (400/500/600/700)

**Iconos**: Lucide React, stroke-width 1.5, tamaño 20px por defecto
