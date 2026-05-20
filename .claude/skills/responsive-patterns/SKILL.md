---
name: responsive-patterns
description: Patrones responsive con Tailwind v4 para el marketplace Cafital. Invocar al diseñar layouts, headers, grids, tablas, sidebars o cualquier pantalla. Define breakpoints, mobile-first y patrones específicos por feature (catálogo, filtros, Mi Tienda, formularios).
---

# Responsive Patterns — Cafital

Mobile-first. Cada utilidad sin prefijo aplica a mobile; los prefijos `sm:` `md:` `lg:` `xl:` escalan hacia arriba.

---

## Breakpoints (defaults Tailwind v4)

| Prefijo | Ancho | Target |
|--------|-------|--------|
| (none) | <640px | Móvil |
| `sm:` | ≥640px | Móvil grande / phablet |
| `md:` | ≥768px | Tablet |
| `lg:` | ≥1024px | Laptop |
| `xl:` | ≥1280px | Desktop |
| `2xl:` | ≥1536px | Desktop ancho |

**Regla**: la mayoría de cambios mayores ocurren en `md:` y `lg:`. Evitar fragmentar diseño en más de 2 breakpoints.

---

## Container y anchos máximos

- Contenedor principal del marketplace: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Contenedor de Mi Tienda (con sidebar): `flex-1 max-w-6xl px-4 lg:px-8`
- Detalle de publicación: `max-w-6xl mx-auto`
- Formularios largos (publicación nueva): `max-w-3xl mx-auto`
- Cards de login/registro: `max-w-md mx-auto`

---

## Header marketplace

```
Mobile (<md):  [Logo] ............... [Hamburger]
               Drawer lateral con: search, nav, cart, favoritos, user

Desktop (md+): [Logo] [Search bar grande] [Eventos] [Vendedores] [♥] [🛒] [Avatar]
```

Implementación:
- Logo siempre visible
- Search bar: `hidden md:flex` (en mobile va al drawer)
- Nav links: `hidden lg:flex` (en md vivos en drawer también)
- Icons (cart, fav, user): siempre visibles desde md

---

## Catálogo con filtros

```
Mobile:   [Botón "Filtros"]  → Drawer full-screen lateral
          Grid 1 col

sm:       Grid 2 col

md:       Sidebar fija de filtros izquierda (240px)
          Grid 2-3 col

lg:       Sidebar 280px
          Grid 3 col

xl:       Grid 4 col
```

Pattern Tailwind:
```tsx
<div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
  <aside className="hidden lg:block">{/* FilterPanel */}</aside>
  <button className="lg:hidden">Filtros</button>
  <main className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
    {/* ProductCards */}
  </main>
</div>
```

---

## Mi Tienda (panel vendedor)

```
Mobile:   Top bar con hamburger → Drawer con nav vertical
          Contenido full-width

md+:      Sidebar fija 240px a la izquierda
          Contenido a la derecha con padding
```

Pattern:
```tsx
<div className="flex min-h-screen">
  <ShopSidebar className="hidden md:flex w-60 shrink-0" />
  {/* Mobile: <MobileShopDrawer /> con trigger en header */}
  <main className="flex-1 p-4 md:p-8">{children}</main>
</div>
```

---

## Tablas

Tablas reales (`<table>`) **no funcionan en mobile**. Patrón:

```
Mobile (<md):  Lista vertical de cards (cada row = card stack)
md+:           Tabla real
```

```tsx
{/* Mobile cards */}
<ul className="md:hidden space-y-3">
  {orders.map(o => <OrderRowCard order={o} />)}
</ul>

{/* Desktop table */}
<table className="hidden md:table w-full">...</table>
```

Aplica a: "Mis publicaciones", "Mis pedidos", "Mis eventos".

---

## Página de publicación (detalle)

```
Mobile:   [Gallery full-width]
          [Título]
          [Precio]
          [Selector unidad/cantidad]
          [Botones]
          [Descripción]
          [Atributos]
          [Vendedor]

md+:      Grid 2 columnas
          [Gallery] | [Toda la info de compra sticky]
          
          Abajo (full-width):
          [Descripción + Atributos]
          [Vendedor]
          [Relacionados]
```

```tsx
<div className="grid md:grid-cols-[1fr_400px] gap-6 lg:gap-10">
  <div>{/* Gallery */}</div>
  <div className="md:sticky md:top-20 md:self-start">{/* Info compra */}</div>
</div>
```

---

## Hero del Home

```
Mobile:   Altura ~280px, título 24px, sin imagen lateral
md:       Altura ~360px, título 30px, ilustración a la derecha
lg+:      Altura ~440px, layout amplio con CTAs visibles
```

Patrón: `h-72 md:h-96 lg:h-[28rem]`, título `text-2xl md:text-3xl lg:text-4xl`.

---

## Formulario de publicación (multi-step)

```
Mobile:   Pasos como stepper horizontal scrolleable arriba
          Un campo por fila
          Botones "Atrás / Siguiente" sticky abajo

md+:      Stepper vertical a la izquierda (240px)
          Campos en 2 columnas cuando es razonable (precio + cantidad, ciudad + departamento)
          Botones abajo, no sticky
```

```tsx
<div className="md:grid md:grid-cols-[240px_1fr] md:gap-10">
  <Stepper orientation="horizontal md:orientation-vertical" />
  <form>
    {/* Campos pueden usar md:grid-cols-2 gap-5 cuando aplique */}
  </form>
</div>
```

---

## Cart drawer

- Mobile: drawer desde la derecha, `w-full max-w-sm`
- Desktop: drawer derecha, `w-96`
- Si carrito muy lleno: `overflow-y-auto` en la lista, total y CTA sticky abajo

---

## Spacing escalado

| Element | Mobile | md+ | lg+ |
|---------|--------|-----|-----|
| Section padding-y | `py-8` | `py-12` | `py-16` |
| Section padding-x | `px-4` | `px-6` | `px-8` |
| Card padding | `p-4` | `p-6` | `p-6` |
| Grid gap | `gap-4` | `gap-5` | `gap-6` |

---

## Tipografía responsive

| Rol | Mobile | md+ |
|-----|--------|-----|
| Hero | `text-2xl` (24px) | `text-3xl md:text-4xl` |
| Page title | `text-xl` | `text-2xl` |
| Card title | `text-base` | `text-lg` |
| Body | `text-sm` | `text-base` |

Usar `font-serif` (Noto Serif) en hero y page titles. Resto `font-sans` (Manrope, default).

---

## Container queries (Tailwind v4)

Tailwind v4 soporta `@container` nativo. Útil para componentes reutilizables (ProductCard, EventCard) que aparecen en contextos de distinto ancho (catálogo, sidebar, drawer).

```tsx
<div className="@container">
  <article className="@sm:flex-row @sm:gap-4 flex flex-col gap-2">
    {/* card reorganiza según ANCHO DEL CONTENEDOR, no del viewport */}
  </article>
</div>
```

---

## Checklist responsive pre-merge

- [ ] Probado a 375px (iPhone SE), 768px (iPad), 1280px (laptop)
- [ ] Sin scroll horizontal en ningún breakpoint
- [ ] Touch targets ≥44×44px en mobile (botones, iconos)
- [ ] Sticky elements (CTA del producto, total del carrito) no tapan contenido
- [ ] Drawers y modales no rompen con el teclado mobile abierto (`max-h-[100dvh]`)
- [ ] Imágenes con `next/image` y `sizes` apropiado
