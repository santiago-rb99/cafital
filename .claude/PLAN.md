# Cafital — Plan de cambios (Admin + Ajustes mínimos)

Roadmap de esta tanda de cambios. Marcar checkboxes al cerrar cada subtarea.

---

## Fix transversal — Modal con scroll interno ✅

Estado actual: el `Modal` global tenía `overflow-hidden` sin límite de altura → en pantallas chicas el contenido se sale del viewport y no se puede llegar al footer ni cerrar.

- [x] [src/components/ui/Modal.tsx](src/components/ui/Modal.tsx): el dialog usa ahora `flex flex-col` + `max-h-[calc(100vh-2rem)]`. Header y footer con `shrink-0`. El cuerpo (`children`) tiene `flex-1 min-h-0 overflow-y-auto overscroll-contain` para scroll interno.
- [x] Aplica a TODOS los modales del proyecto (verificaciones, suspender usuario, rechazar solicitud, etc.) sin tocar cada uno.

---

## Fase 1 — Cuenta admin: ampliación del panel

El admin actual ya tiene KPIs básicos, lista de usuarios, publicaciones, eventos y suscripciones. Faltan tres frentes: métricas de negocio reales, flujo de verificación de vendedores y gestión de taxonomía sin código.

### 1.1 Métricas de negocio en el dashboard ✅

**Objetivo**: que el admin pueda evaluar la salud del marketplace de un vistazo.

- [x] Extender `AdminStats` en [src/lib/api/admin.ts](src/lib/api/admin.ts) con:
  - `current.gmv` — suma de `total` de pedidos completados del período
  - `current.transactionsCompleted` — número de pedidos `completed`
  - `current.funnel` — `{ views, contacts, orders }` para el embudo
  - `previous` — mismas métricas del período anterior (para comparativa)
  - `delta` — variación % por métrica vs período anterior (con manejo de divisiones por cero como `null`)
  - `period` + `periodLabel` reflejan el período activo
  - `monthlyRevenueUsd` se mantiene como conteo mensual estructural
- [x] Helpers exportados: `getAdminPeriodRanges(key)`, `adminPeriodShort(key)`, `ADMIN_PERIOD_LABEL`. `mtd` (este mes) compara contra el mes calendario anterior; los demás contra el mismo número de días previos.
- [x] Selector de período en URL (`?period=7d|30d|90d|mtd`, default 30d). Persistencia con `useRouter().replace(..., { scroll: false })`
- [x] Tipo `Publication` extendido con `whatsappContactCount?: number`. Cuando no hay seed, se aproxima como ~12 % de `views` para no requerir editar 38+ publicaciones.
- [x] Las vistas y contactos se distribuyen al período mediante `shareInPeriod()`: prorratea por solape entre vida útil de la publicación y el rango. Así el funnel cambia coherentemente con el selector.
- [x] Nuevos `StatCard` con `DeltaBadge`:
  - GMV (Bs.) con delta vs período anterior
  - Transacciones completadas con delta
  - Ingresos por suscripciones (USD) con delta (vs ingreso del mes anterior)
- [x] Cuatro tarjetas estructurales separadas (vendedores, compradores, publicaciones activas, eventos) sin delta porque no dependen del período
- [x] Componente [ConversionFunnel](src/components/admin/ConversionFunnel.tsx): 3 pasos con barras proporcionales + `DeltaBadge` por paso + tasas derivadas "Visita → contacto" y "Contacto → pedido"
- [x] Componente [DeltaBadge](src/components/admin/DeltaBadge.tsx): ↑/↓/= con tokens `bg-primary-50 text-primary-700` (verde) y `bg-error-bg text-error-dark` (rojo). Soporta `positiveIsGood` invertido.
- [x] Componente [PeriodSelector](src/components/admin/PeriodSelector.tsx): wrapper sobre `Tabs` variant=pills
- [x] `StatCard` extendido con slot opcional `delta` (badge inline con el valor)
- [x] Typecheck + `next build` verdes

### 1.2 Flujo de verificación de vendedores ✅

**Objetivo**: el badge "Vendedor verificado" deja de ser cosmético y depende de revisión del admin.

- [x] Tipo `Seller` en [src/types/index.ts](src/types/index.ts): agregar `verificationStatus`, `verificationDocs`, `verificationSubmittedAt`, `verificationReviewedAt`, `verificationRejectionReason`
- [x] Sembrar `verificationStatus` en [src/data/mock/users.ts](src/data/mock/users.ts):
  - 2 vendedores `pending` (`seller-free` sin docs, `seller-hefesto` con docs)
  - 1 `rejected` (nuevo `seller-rechazado`) con motivo
  - 5 `approved` (semilla, cosecha, exportacion, alquimia, bob)
- [x] Nueva ruta [/admin/verificaciones](src/app/(admin)/admin/verificaciones/page.tsx) con tabs Pendientes/Aprobados/Rechazados, búsqueda, detalle en modal con docs y acciones Aprobar/Rechazar (modal pide motivo)
- [x] API en [src/lib/api/admin.ts](src/lib/api/admin.ts): `listSellersByVerification`, `approveSeller`, `rejectSeller`. `AdminStats` extiende `pendingVerifications`
- [x] Helper `isSellerVerified(seller)` en [src/lib/utils.ts](src/lib/utils.ts). Badge "Vendedor verificado" ahora depende de `verificationStatus === 'approved'` en: `SellerProfileHero`, `SellerCard`, `publicacion/[id]`, `eventos/[id]`, `Step6Preview`, `HeroBanner` y filtro "Solo verificados" en `/vendedores`
- [x] Dashboard admin: banner mostaza con conteo de pendientes que linkea a `/admin/verificaciones`
- [x] Sidebar admin [src/components/admin/AdminSidebar.tsx](src/components/admin/AdminSidebar.tsx): nueva entrada "Verificaciones" con badge numérico (`bg-accent-500`) cuando hay pendientes
- [x] Componente reutilizable [VerificationStatusBadge](src/components/admin/VerificationStatusBadge.tsx) (pill pendiente/aprobado/rechazado con icono)
- [x] `upgradeBuyerToSeller` ahora inicializa `verificationStatus: 'pending'` automáticamente
- [x] Typecheck + `next build` verdes

### 1.2-bis Carga de documentos en Mi Tienda ✅

**Por qué se agregó**: la fase 1.2 implementó el lado admin (revisar/aprobar/rechazar) pero **no** el lado vendedor (subir documentos, ver estado, reenviar). Esto cierra el loop seller-side.

- [x] Nueva ruta [/mi-tienda/verificacion](src/app/(shop)/mi-tienda/verificacion/page.tsx) con 4 estados:
  - **Sin docs** → tarjeta neutral "Verificá tu negocio" + uploaders CI (requerido) y NIT (opcional). CTA "Enviar a revisión"
  - **`pending` con docs** → tarjeta mostaza "En revisión" + fecha de envío + preview de docs + opción de reemplazar
  - **`approved`** → tarjeta verde con fecha de aprobación + link al perfil público
  - **`rejected`** → alert rojo con `verificationRejectionReason` + uploaders para reenviar → vuelve a `pending`
- [x] API en [src/lib/api/users.ts](src/lib/api/users.ts): `submitVerificationDocs(sellerId, docs)` valida CI requerido, marca `pending`, setea `verificationSubmittedAt`, limpia `verificationRejectionReason` y `verificationReviewedAt`
- [x] Admin overlay [admin.ts:withOverlays](src/lib/api/admin.ts) extendido con `verificationDocs` y `verificationSubmittedAt` para que el admin vea los nuevos docs/fechas tras el envío del vendedor
- [x] Reutiliza [ImageDropzone](src/components/ui/ImageDropzone.tsx) con `maxImages={1}` para CI y NIT
- [x] Sidebar Mi Tienda [ShopSidebar.tsx](src/components/layout/ShopSidebar.tsx): entrada "Verificación" con icono `BadgeCheck` y punto de estado (rojo si rechazado, mostaza si pendiente sin docs, sin punto si aprobado o en revisión)
- [x] Dashboard Mi Tienda [page.tsx](src/app/(shop)/mi-tienda/page.tsx): nuevos alerts según estado:
  - `rejected` → alert destructive (rojo) "Tu verificación fue rechazada"
  - `pending` sin docs → alert warning (mostaza) "Completa tu verificación"
  - `AlertItem.tone` extendido con `'destructive'` usando tokens `bg-error-bg text-error-dark`
- [x] Texto del modal de cancelar plan [planes/page.tsx:124](src/app/(shop)/mi-tienda/planes/page.tsx#L124): reemplazado "badges de verificación" por mención explícita de que la verificación es independiente del plan
- [x] Typecheck + `next build` verdes

### 1.3 Gestión de categorías y subcategorías desde admin

**Objetivo**: agregar/editar zonas de origen, variedades, subcategorías sin tocar código.

Estado actual: [src/data/mock/categories.ts](src/data/mock/categories.ts) es estático. Los atributos dinámicos viven en [src/data/schemas/dynamicFilters.ts](src/data/schemas/dynamicFilters.ts).

- [ ] Nueva ruta `/admin/catalogo` con sub-secciones:
  - **Categorías y subcategorías** — árbol editable
  - **Atributos dinámicos** — listas editables (zonas de origen, variedades, procesos, etc.)
- [ ] Capa de persistencia local con localStorage (overlay sobre los mocks):
  - Key `cafital_categories_overrides`
  - Key `cafital_attributes_overrides`
  - Funciones helper en `src/lib/api/categories.ts` que mergeen overrides sobre mock base (mismo patrón que `withOverlays` en admin.ts)
- [ ] UI por subsección:
  - **Categorías**: lista con 4 categorías base (no se eliminan). Por cada una, lista de subcategorías editables (crear / renombrar / eliminar / reordenar)
  - **Atributos**: tarjetas por atributo (Zona de origen, Variedad botánica, Proceso de beneficiado, Altitud, SCA, Nivel de tueste, Certificaciones, Estado equipo, Condición de venta). Cada tarjeta = lista editable de valores
- [ ] Componentes nuevos en `components/admin/`:
  - `CategoryEditor.tsx` — árbol editable categoría → subcategorías
  - `AttributeListEditor.tsx` — lista editable genérica (input + agregar + eliminar)
  - `ConfirmDeleteModal.tsx` (si no existe ya)
- [ ] Validaciones:
  - No eliminar subcategoría si tiene publicaciones activas (mostrar conteo y bloquear)
  - No eliminar valor de atributo si está usado por publicaciones (idem)
  - IDs autogenerados al crear (slug-kebab del nombre + categoría)
- [ ] El catálogo y los formularios de publicación deben leer las categorías/atributos a través de la capa con overrides (no importar el mock directamente). Auditar:
  - [src/app/(marketplace)/catalogo/page.tsx](src/app/(marketplace)/catalogo/page.tsx)
  - [src/components/catalog/FilterPanel.tsx](src/components/catalog/FilterPanel.tsx)
  - Formularios de nueva publicación en `components/publications/`
- [ ] Sidebar admin: agregar enlace "Catálogo" (sección configuración)

---

## Fase 2 — Cambios mínimos (rápidos)

### 2.1 Corregir sede de Alquimia (Santa Cruz, no La Paz)

Estado actual: [src/data/mock/users.ts:142-166](src/data/mock/users.ts#L142-L166) tiene a `seller-alquimia` con `department: 'La Paz'` y la descripción dice "Sede en La Paz".

- [x] Cambiar `department: 'La Paz'` → `'Santa Cruz'`
- [x] Cambiar `municipality: 'La Paz'` → `'Santa Cruz de la Sierra'` (o el municipio correcto)
- [x] Actualizar texto de la descripción: "Sede en La Paz" → "Sede en Santa Cruz"
- [x] Buscar otras referencias a Alquimia + La Paz: eventos, publicaciones, mock data
  - Actualizados `evt-007` y `evt-008` (sede Alquimia) a Santa Cruz; `evt-001` se mantiene en La Paz porque es en un local externo (Café El Cedro)
- [ ] Verificar que el filtro por departamento en `/vendedores` ahora muestra a Alquimia bajo Santa Cruz

### 2.2 Filtros del catálogo y vendedores: scroll independiente

Estado actual: la sidebar de filtros usa `sticky top-20` pero **no** limita su altura, así que cuando los filtros son más altos que el viewport, el usuario no ve los filtros de abajo hasta scrollear todos los productos.

Archivos afectados:
- [src/app/(marketplace)/catalogo/page.tsx:67-70](src/app/(marketplace)/catalogo/page.tsx#L67-L70)
- [src/app/(marketplace)/vendedores/page.tsx:86-90](src/app/(marketplace)/vendedores/page.tsx#L86-L90)

**Eventos NO se toca** — confirmado por el usuario, ahí funciona bien.

- [x] En catálogo: cambiar la `aside` sticky para que tenga scroll interno
  - `sticky top-20` + `max-h-[calc(100vh-6rem)]` + `overflow-y-auto` + `overscroll-contain`
  - Mantener el padding y el shadow del contenedor blanco
- [x] Misma corrección en vendedores
- [ ] Verificar visualmente en breakpoints `lg` y `xl` que:
  - Los filtros tienen su propio scrollbar cuando se exceden
  - El scrollbar no rompe el layout
  - El borde y la sombra del contenedor blanco siguen visibles
- [ ] Probar con filtros muy largos (ej. catálogo con subcategoría seleccionada que despliega atributos dinámicos)

---

## Componentes nuevos / reutilizables

Para no duplicar trabajo:

- ✅ `DeltaBadge` — badge ↑/↓ % con color semántico (creado en `components/admin/`)
- ✅ `ConversionFunnel` — gráfico embudo 3 pasos (creado en `components/admin/`)
- ✅ `PeriodSelector` — selector 7d/30d/90d/mtd (creado en `components/admin/`)
- ✅ `VerificationStatusBadge` — pill pendiente/aprobado/rechazado (creado en `components/admin/`)
- ✅ Helper `isSellerVerified()` en `lib/utils.ts`
- `CategoryEditor` — árbol editable de categorías (uso: /admin/catalogo)
- `AttributeListEditor` — lista editable genérica (uso: /admin/catalogo)

---

## Orden sugerido de ejecución

1. ✅ Fix Modal transversal (afecta a todos los flujos)
2. ✅ **2.1** y **2.2** cambios mínimos
3. ✅ **1.2** verificación de vendedores (lado admin)
4. ✅ **1.2-bis** carga de documentos en Mi Tienda (cierra el loop seller-side)
5. ✅ **1.1** métricas de negocio
6. **1.3** gestión de taxonomía (más invasivo: toca catálogo, formularios y filtros)
