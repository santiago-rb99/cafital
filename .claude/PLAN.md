# Plan de Implementación — Cafital

> Roadmap completo del prototipo. Marcar `[x]` cada entregable al completarlo para llevar progreso entre sesiones.

---

## Arquitectura general

### Capa de "API simulada"
Crear `src/lib/api/*.ts` con funciones async (auth, publications, events, orders, etc.) que leen de `data/mock/` con `setTimeout` para simular latencia. Esto deja el swap a backend real como un cambio aislado.

### Persistencia local
Cualquier mutación (crear publicación, pedido, inscripción, etc.) se guarda en `localStorage` además del mock en memoria, así sobrevive a refresh. Patrón: cada slice tiene una key (`cafital_publications_overrides`, `cafital_orders_overrides`, ...) que se fusiona con el mock estático al cargar.

### Routing por grupos
```
app/
  (auth)/login, registro, onboarding/[role]
  (marketplace)/page, catalogo, publicacion/[id], vendedor/[id], eventos, carrito, checkout, pedido/[id]
  (account)/perfil, pedidos, favoritos, suscripciones
  (shop)/mi-tienda/{dashboard, pedidos, publicaciones, publicaciones/nueva, publicaciones/[id]/editar, eventos, eventos/nuevo, ajustes, planes, estadisticas}
```
Tres layouts: auth minimal · marketplace con header global · shop con sidebar.

### Server vs Client Components
Por defecto Server. `'use client'` solo en interactividad real (forms, modales, dropdowns, drawers, contextos). Filtros del catálogo → estado en URL (`useSearchParams`) para deep-linking.

### Decisiones pendientes
- [x] Confirmar React Hook Form + Zod para forms
- [x] Configurar `remotePatterns` en `next.config.ts` para `picsum.photos` y `i.pravatar.cc`

---

## Inventario de componentes reutilizables

### Átomos (`components/ui/`)
Button · IconButton · Input · Textarea · NumberInput · Select · MultiSelect · Toggle · Checkbox · Radio · Badge · Avatar · Tooltip · Tabs · Chip · Spinner · Skeleton · ToastRenderer

### Moléculas (`components/ui/`)
FormField (label + control + helper/error) · ImageDropzone · ImageGallery · QuantitySelector · PriceTag · CurrencyInput · DatePicker · TimePicker · SearchBar · Breadcrumbs · Pagination · EmptyState · ConfirmDialog · Modal · Drawer

### Cards (compuestos, uno por feature)
- **ProductCard** — variantes: con precio / bajo cotización / con descuento; badges descuento y recurrente; botón favorito
- **EventCard** — fecha, modalidad, cupos, precio o "Gratuito"
- **SellerCard** — destacados / grid de vendedores
- **OrderCard** — historial de pedidos
- **RecurringSubscriptionCard** — mis suscripciones
- **PlanCard** — 3 planes con CTA contratar

### Específicos por dominio
- **FilterPanel** — sidebar desktop + drawer mobile, filtros estáticos + dinámicos por subcategoría
- **AttributeRenderer** — renderiza atributos del esquema de cada subcategoría (multi/single select, número, texto)
- **WhatsAppButton** — mensaje preformateado con producto/precio
- **HeroBanner** — carousel rotativo de vendedores con plan
- **SubscriptionBadge** — Semilla / Cosecha / Exportación
- **MarketplaceHeader** — search + cart + favoritos + user menu
- **ShopSidebar** — nav de Mi Tienda

---

## FASES

### F1 — Foundation
**Objetivo**: cimiento sobre el que se construye todo.

- [x] UI kit completo (átomos + moléculas)
- [x] 3 layouts (auth, marketplace, shop)
- [x] MarketplaceHeader + Footer
- [x] ShopSidebar
- [x] ToastRenderer enganchado al `ToastContext`
- [x] `lib/api/*` con stubs para todos los recursos
- [x] Page 404 + error boundary

### F2 — Auth simulado y onboarding
**Objetivo**: simular registro y sesión completa.

- [x] Login (con lista visible de usuarios mock para acceso rápido)
- [x] Registro: paso 1 elegir rol → paso 2 datos
- [x] Onboarding del comprador (perfil personal)
- [x] Onboarding del vendedor (datos del negocio + logo + banner)
- [x] Logout
- [x] Guards de ruta (`(account)` y `(shop)` requieren sesión; `(shop)` requiere rol seller)

### F3 — Marketplace browsing (corazón del producto)
**Objetivo**: navegar y descubrir.

- [x] **Home**: hero banner rotativo, grid de categorías, vendedores destacados, publicaciones recientes, próximos eventos
- [x] **Catálogo**:
  - [x] FilterPanel con filtros estáticos (categoría, subcategoría, precio, departamento, certificaciones)
  - [x] Filtros dinámicos según subcategoría
  - [x] Búsqueda + ordenamiento
  - [x] URL como source of truth de filtros
- [x] **Página de publicación**:
  - [x] ImageGallery con lightbox
  - [x] Selector de unidad + QuantitySelector
  - [x] Toggle de compra recurrente (frecuencia + cantidad)
  - [x] WhatsAppButton para cotizar
  - [x] AttributeRenderer
  - [x] Tarjeta del vendedor
  - [x] "Productos relacionados"
- [x] **Perfil público de vendedor**: 4 variantes (sin plan, Semilla, Cosecha, Exportación)

### F4 — Carrito y checkout
**Objetivo**: cerrar el flujo de compra directa.

- [ ] Cart drawer (acceso desde header)
- [ ] Cart page completa
- [ ] Checkout (datos de envío + resumen + simulación de pago)
- [ ] Confirmación de pedido
- [ ] Detalle de pedido
- [ ] Reglas: cat D y bajo cotización **no** entran al carrito, solo WhatsApp

### F5 — Cuenta del comprador
**Objetivo**: cerrar experiencia del comprador.

- [ ] Perfil + edición de datos
- [ ] Mis pedidos (historial con filtros por estado + detalle)
- [ ] Favoritos (tabs Publicaciones / Vendedores)
- [ ] Mis suscripciones recurrentes (pausar, editar frecuencia/cantidad, cancelar)
- [ ] Ajustes generales

### F6 — Eventos
**Objetivo**: ver e inscribirse.

- [ ] Lista con filtros (tipo, modalidad, departamento, fecha)
- [ ] Detalle de evento
- [ ] Inscripción gratuita (confirmación inmediata)
- [ ] Inscripción con precio (checkout reducido)
- [ ] Mis inscripciones en perfil del comprador

### F7 — Mi Tienda (vista vendedor)
**Objetivo**: gestión operativa del vendedor.

- [ ] Dashboard (ventas del período, pedidos recibidos, publicaciones activas)
- [ ] Lista de pedidos recibidos + cambio de estado
- [ ] Tabla "Mis publicaciones" con acciones (editar, pausar, eliminar)
- [ ] Tabla "Mis eventos"
- [ ] Ajustes de tienda (datos del negocio, logo, banner)

### F8 — Formulario de publicación (pieza más compleja)
**Objetivo**: crear/editar publicaciones de las 4 categorías.

- [ ] Esquema de atributos por subcategoría en `data/schemas/`
- [ ] Multi-step:
  - [ ] Paso 1: Categoría
  - [ ] Paso 2: Subcategoría
  - [ ] Paso 3: Info base (fotos via Dropzone, título, descripción, variantes, video)
  - [ ] Paso 4: Atributos dinámicos
  - [ ] Paso 5: Precio y logística (toggle precio/cotización, tabla repetible de unidades, cobertura, inventario, descuento, recurrente)
  - [ ] Paso 6: Vista previa idéntica a la página real
  - [ ] Paso 7: Publicar / Guardar borrador
- [ ] Formulario de evento (single step)

### F9 — Suscripciones del vendedor
**Objetivo**: diferenciación visual y de capacidades por plan.

- [ ] Página de planes (3 PlanCards con comparativa)
- [ ] Flujo de contratación simulado
- [ ] Plan actual visible en Mi Tienda + cambiar plan
- [ ] Bloque "Sobre nosotros" editable (solo Exportación)
- [ ] Carrusel de imágenes adicionales (Cosecha hasta 5, Exportación hasta 10)
- [ ] Estadísticas (solo Exportación): visitas por publicación
- [ ] Perfil público y home reflejan privilegios del plan

### F10 — Polish y QA
**Objetivo**: calidad demo-ready.

- [ ] Loading states con Skeletons coherentes
- [ ] Empty states pulidos en todas las listas
- [ ] Error states (404 + generic error boundary)
- [ ] Revisión mobile completa (header colapsable, filtros como drawer, tablas responsive)
- [ ] Microanimaciones (fade-in cards, slide drawer, toast)
- [ ] A11y básico (focus visible, ARIA en modales/drawers, navegación por teclado)

---

## Dependencias entre fases

```
F1 ─┬─> F2 ─┬─> F3 ──> F4 ──> F5
    │       │
    │       └─> F6
    │
    └────────> F7 ──> F8 ──> F9 ──> F10
```

F3 y F7 pueden avanzar en paralelo apenas F1+F2 estén listas. F8 depende fuerte de F1 (forms, dropzone) y F3 (la vista previa = página de publicación).

---

## Cómo retomar en una nueva sesión

1. Abrir el proyecto (`CLAUDE.md` se auto-carga con el contexto del negocio).
2. Pedirle a Claude: **"Lee `.claude/PLAN.md` y dime en qué fase estamos"**.
3. Continuar desde el primer checkbox sin marcar.
4. Al terminar entregables, marcar `[x]` aquí.
