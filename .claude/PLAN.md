# Plan — Publicidad y Previsualización de Perfil

Dos features nuevas para vendedores en Mi Tienda:

1. **Sección Publicidad** (`/mi-tienda/publicidad`) — solo habilitada con plan activo. Gestiona hero, galería, promoción de eventos y muestra apariciones consumidas/restantes.
2. **Previsualización de perfil con edición inline** (`/mi-tienda/perfil`) — renderiza el perfil público tal cual lo verá el comprador, con overlays de edición (lápiz, +, basura) sobre cada bloque editable.

---

## Decisiones tomadas

- **Alcance Publicidad**: completo — hero (imagen + copy + ubicación: home/catálogo/vendedores), galería del perfil (límite por plan), promoción de eventos en `EventsHeroBanner`, y contador de apariciones consumidas/restantes este mes.
- **Ubicación preview**: ruta nueva `/mi-tienda/perfil` con entrada propia en `ShopSidebar`. Reusa los componentes de `/vendedor/[id]` y monta overlays de edición encima.

---

## Reglas de negocio por plan

| Plan         | Hero appearances/mes | Galería extra | Hero eventos | Bloque "Sobre nosotros" |
|--------------|----------------------|---------------|--------------|-------------------------|
| Sin plan     | 0 (Publicidad bloqueada — upsell) | — | — | — |
| Semilla      | 1                    | —             | ✓            | —                       |
| Cosecha      | 3                    | hasta 5       | ✓            | —                       |
| Exportación  | 7                    | hasta 10      | ✓ prioridad  | ✓                       |

Reglas de UI:
- Si plan = `none`: la entrada "Publicidad" del sidebar lleva a un estado vacío con CTA "Ver planes".
- La galería extra solo aparece en preview/publicidad si `plan.carouselMaxImages > 0`.
- El bloque "Sobre nosotros" inline-editable solo en plan Exportación.

---

## Fase 1 — Datos y API

Base mock para que ambas features tengan estado real persistido en memoria.

- [ ] **Tipos** (`src/types/index.ts`):
  - [ ] Añadir `Seller.heroCopy?: string` (copy promocional, máx. ~140 chars).
  - [ ] Añadir `Seller.promotedEventId?: string` (id del evento elegido para `EventsHeroBanner`).
  - [ ] Añadir `Seller.adAppearancesUsed?: number` (apariciones consumidas en el mes en curso).
  - [ ] Añadir `Seller.adAppearancesPeriodStart?: string` (ISO; sirve para resetear el contador mes a mes — los mocks lo dejan en el 1 del mes actual).
- [ ] **Mock data** (`src/data/mock/users.ts`):
  - [ ] Rellenar los 3 sellers con plan (`semilla`, `cosecha`, `exportacion`) con `heroCopy`, `promotedEventId`, `adAppearancesUsed` realistas (ej. semilla 1/1 ya consumido, cosecha 2/3, exportación 4/7).
- [ ] **API capa mock** (`src/lib/api/users.ts` + nuevo `src/lib/api/advertising.ts`):
  - [ ] `getAdvertising(sellerId)` → devuelve `{ heroImage, heroCopy, profileImages, promotedEventId, adAppearancesUsed, adAppearancesMax, galleryMax }`.
  - [ ] `updateHero(sellerId, { heroImage, heroCopy })`.
  - [ ] `addProfileImage(sellerId, url)` con validación contra `galleryMax`.
  - [ ] `removeProfileImage(sellerId, url)`.
  - [ ] `reorderProfileImages(sellerId, urls[])`.
  - [ ] `setPromotedEvent(sellerId, eventId | null)` (valida que el evento sea del seller y esté `active`).
  - [ ] `updateAbout(sellerId, { mission, vision, history })` — solo Exportación.
- [ ] **`heroSlides.ts`** (`src/components/home/heroSlides.ts`):
  - [ ] `buildSellerHeroSlides` — usar `seller.heroCopy ?? seller.description` para el copy del slide.
  - [ ] `buildEventHeroSlides` — priorizar eventos cuyo `event.id === organizer.promotedEventId`.

---

## Fase 2 — Sección Publicidad (`/mi-tienda/publicidad`)

Ruta nueva bajo `src/app/(shop)/mi-tienda/publicidad/page.tsx`. Cliente.

- [ ] **Sidebar** (`src/components/layout/ShopSidebar.tsx`):
  - [ ] Añadir item `{ href: '/mi-tienda/publicidad', label: 'Publicidad', icon: <Megaphone /> }`.
  - [ ] No filtrar por plan — siempre visible; la página gestiona el estado bloqueado.
- [ ] **Estado bloqueado (plan `none`)**:
  - [ ] `EmptyState` con ícono `Lock`, copy "La Publicidad está disponible desde el plan Semilla" y CTA "Ver planes" → `/mi-tienda/planes`.
- [ ] **Layout de la página** (con plan activo):
  - [ ] Header: título "Publicidad" + subtítulo con plan actual + badge de apariciones (`{used}/{max} este mes`).
  - [ ] Tres secciones en `Tabs` o stack vertical:
    1. **Hero promocional** (todos los planes con suscripción).
    2. **Galería del perfil** (solo si `galleryMax > 0`).
    3. **Promocionar evento** (todos los planes con suscripción).
- [ ] **Sección Hero promocional** (`src/components/shop/advertising/HeroAdvertisingCard.tsx`):
  - [ ] Preview del slide (reusar look del `HeroBanner` a media escala).
  - [ ] `ImageDropzone` para `heroImage` (16:10 recomendado, 1400x900).
  - [ ] `Textarea` para `heroCopy` (máx. 140 chars, contador en vivo).
  - [ ] Botón "Guardar cambios" + toast de éxito.
  - [ ] Nota: "Se mostrará en Home, Catálogo y Vendedores cuando seas elegido en el rotador."
- [ ] **Sección Galería del perfil** (`src/components/shop/advertising/GalleryManagerCard.tsx`):
  - [ ] Grid de thumbnails con contador `{usadas}/{galleryMax}`.
  - [ ] Cada thumb con overlay de acciones: `Eye` (preview lightbox), `Trash` (eliminar con `ConfirmDialog`), `GripVertical` (drag para reordenar).
  - [ ] Tile "+" al final si `usadas < galleryMax` → abre `ImageDropzone`.
  - [ ] Si `galleryMax === 0`: card bloqueada con upsell "Disponible desde el plan Cosecha".
- [ ] **Sección Promocionar evento** (`src/components/shop/advertising/PromotedEventCard.tsx`):
  - [ ] `Select` con los eventos del vendedor cuyo `status === 'active'` y fecha `>= hoy`.
  - [ ] Opción "Ninguno" para desactivar.
  - [ ] Preview de la tarjeta del evento elegido + texto "Aparecerá en el hero de Eventos según tu prioridad de plan."
  - [ ] Empty state si no hay eventos activos: CTA "Crear evento" → `/mi-tienda/eventos/nuevo`.
- [ ] **Contador de apariciones** (header de la página):
  - [ ] Barra de progreso `{used}/{max}` con tooltip explicando reseteo mensual.
  - [ ] Si `used === max`: badge `warning` "Cupo agotado este mes".

---

## Fase 3 — Previsualización de perfil (`/mi-tienda/perfil`)

Ruta nueva bajo `src/app/(shop)/mi-tienda/perfil/page.tsx`. Cliente.

Concepto: renderiza una réplica del perfil público (`/vendedor/[id]`) y monta encima un sistema de overlays con iconos para editar cada bloque sin salir de la página.

- [ ] **Sidebar** (`src/components/layout/ShopSidebar.tsx`):
  - [ ] Añadir item `{ href: '/mi-tienda/perfil', label: 'Mi perfil público', icon: <UserCircle /> }` arriba de "Publicidad".
- [ ] **Componente shell** (`src/components/shop/profile-preview/ProfilePreviewShell.tsx`):
  - [ ] Toolbar superior: pill "Vista previa" + toggle "Ver como visitante" (oculta todos los overlays para ver la versión limpia).
  - [ ] Renderiza los bloques del perfil reusando `SellerProfileHero`, `SellerAbout`, `SellerImageCarousel`, `ProductCard`, `EventCard`.
- [ ] **EditableBlock** (`src/components/shop/profile-preview/EditableBlock.tsx`):
  - [ ] Wrapper que recibe `children` y renderiza un botón flotante (`IconButton` con `Pencil`) en esquina superior derecha cuando se hace hover/focus.
  - [ ] Borde punteado sutil al hover (token `primary-100`).
  - [ ] Click → abre el `Modal` o `Drawer` del editor correspondiente.
- [ ] **Bloques editables y sus editores**:
  - [ ] **Logo + banner + nombre + descripción** → `BusinessIdentityEditor` (reuso de los campos de `/mi-tienda/ajustes`).
  - [ ] **Hero / imagen promocional** (si plan ≥ semilla) → atajo al editor de la sección Hero de Publicidad (modal embebido).
  - [ ] **Galería de imágenes extra** (si `galleryMax > 0`):
    - [ ] Cada imagen del carrusel envuelta con overlay: `Pencil` (reemplazar), `Trash` (eliminar con confirm).
    - [ ] Tile "+" al final del carrusel si `usadas < galleryMax`.
    - [ ] Si la galería está vacía pero el plan la permite: placeholder "Aún no has subido imágenes — añade hasta {galleryMax}" con CTA.
  - [ ] **Sobre nosotros** (solo Exportación) → `AboutEditor` con tres `Textarea` (misión, visión, historia).
  - [ ] **Publicaciones activas**: no editable inline; ícono `ExternalLink` que lleva a `/mi-tienda/publicaciones`.
  - [ ] **Próximos eventos**: no editable inline; ícono `ExternalLink` a `/mi-tienda/eventos`.
- [ ] **Persistencia**:
  - [ ] Cada editor llama al endpoint correspondiente de la Fase 1 y actualiza el `AuthContext` (`updateUser`).
  - [ ] Toast de éxito por cambio guardado.
- [ ] **Vacíos por plan**:
  - [ ] Plan `none`: la página igual carga, pero los bloques premium (hero, galería, sobre nosotros) se renderizan como placeholders con CTA "Disponible desde el plan X" en lugar del lápiz.

---

## Fase 4 — Integración y pulido

- [ ] **Home / Catálogo / Vendedores** (`src/app/(marketplace)/page.tsx`, `catalogo/page.tsx`, `vendedores/page.tsx`):
  - [ ] Confirmar que `HeroBanner` ahora consume `heroCopy` cuando existe.
- [ ] **Home / Eventos** (`src/app/(marketplace)/page.tsx`, `eventos/page.tsx`):
  - [ ] Confirmar que `EventsHeroBanner` prioriza eventos `promotedEventId`.
- [ ] **`DevSessionSwitcher`**: verificar que los 3 sellers suscritos muestran datos realistas en /publicidad y /perfil al cambiar de sesión.
- [ ] **Accesibilidad** (skill `/wcag-checklist`):
  - [ ] Botones de editar con `aria-label="Editar {bloque}"`.
  - [ ] Confirm dialogs en cada eliminar.
  - [ ] Foco visible en overlays.
- [ ] **Responsive** (skill `/responsive-patterns`):
  - [ ] Overlays de edición en móvil: tap = abre menú de acciones (en vez de hover).
  - [ ] Grid de galería: 2 col móvil, 3-4 col desktop.
- [ ] **Craft** (skill `/frontend-design`):
  - [ ] Transición suave al mostrar overlays (fade + scale).
  - [ ] Estado loading en los editores con `Spinner`.

---

## Componentes nuevos (resumen)

```
src/components/shop/
  advertising/
    HeroAdvertisingCard.tsx
    GalleryManagerCard.tsx
    PromotedEventCard.tsx
    AppearancesProgress.tsx
  profile-preview/
    ProfilePreviewShell.tsx
    EditableBlock.tsx
    BusinessIdentityEditor.tsx
    AboutEditor.tsx
    GalleryInlineEditor.tsx
```

```
src/app/(shop)/mi-tienda/
  publicidad/page.tsx
  perfil/page.tsx
```

```
src/lib/api/
  advertising.ts
```

---

## Orden sugerido de implementación

1. Fase 1 completa (tipos + mocks + API) — sin esto las dos UIs no tienen estado.
2. Fase 2 (Publicidad) — más autocontenida.
3. Fase 3 (Preview de perfil) — reusa el editor de hero/galería de la Fase 2 vía modal.
4. Fase 4 — integración + pulido + a11y + responsive.
