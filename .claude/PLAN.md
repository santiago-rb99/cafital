# PLAN — Perfil Admin (entregable hoy)

> **Contexto**: prototipo sin backend, todo mock. Hay que entregar mañana. Se prioriza alcance mínimo viable que se vea profesional y permita demostrar moderación + control de la plataforma. **No tocar flujos existentes salvo añadir el rol `admin`.**

---

## Alcance — lo esencial y nada más

5 pantallas. Una sola sesión admin (`admin-01`). Reutiliza componentes ya construidos (Sidebar de Mi Tienda, tablas, badges, toasts).

1. **Dashboard** — KPIs globales de la plataforma
2. **Usuarios** — listado de vendedores y compradores, con suspender/activar
3. **Publicaciones** — listado global con eliminar/destacar
4. **Eventos** — listado global con eliminar
5. **Suscripciones** — quién tiene qué plan, con cancelar

Si sobra tiempo (último): bloque de **Reportes / Pedidos** dentro del Dashboard.

---

## Cambios mínimos en el modelo

`src/types/index.ts`:
- Añadir `'admin'` a los roles posibles → nuevo tipo `Admin extends BaseUser { role: 'admin'; name: string }`
- `User = Buyer | Seller | Admin`
- Añadir campo opcional `suspended?: boolean` a `BaseUser` (para suspender vendedores y compradores)
- Añadir campo opcional `featured?: boolean` a `Publication` (para destacar desde admin)

`src/data/mock/users.ts`:
- Agregar 1 usuario admin:
  ```ts
  { id: 'admin-01', role: 'admin', name: 'Admin Cafital', email: 'admin@cafital.bo', ... }
  ```

`DevSessionSwitcher`: añadir la opción "Admin" en el dropdown.

`src/lib/api/`:
- Nuevo archivo `admin.ts` con funciones mock:
  - `getAdminStats()` → KPIs derivados de los mocks existentes
  - `toggleUserSuspension(userId)`
  - `deletePublication(id)` / `togglePublicationFeatured(id)`
  - `deleteEvent(id)`
  - `cancelSubscription(sellerId)`

Todas con `setTimeout` de ~300ms para simular red.

---

## Rutas

Crear grupo `(admin)` paralelo a `(shop)`:

```
src/app/(admin)/admin/
  layout.tsx          # sidebar + guard (solo admin-01 entra; otros redirect a /)
  page.tsx            # Dashboard
  usuarios/page.tsx
  publicaciones/page.tsx
  eventos/page.tsx
  suscripciones/page.tsx
```

Guard simple en el layout: si `currentUser?.role !== 'admin'`, redirect a `/`.

---

## Pantalla 1 — Dashboard (`/admin`)

**KPIs** en 4 cards arriba (grid 2x2 mobile / 4 columnas desktop):
- Total vendedores activos (excluye suspendidos)
- Total compradores activos
- Publicaciones activas
- Ingresos por suscripciones (suma mensual de los planes activos en USD)

Debajo, 2 secciones simples:
- **Actividad reciente** — últimas 5 publicaciones creadas (link a la página)
- **Suscripciones por plan** — barra horizontal o lista con conteo (Semilla: X / Cosecha: Y / Exportación: Z)

Sin gráficos complejos. Números grandes (Noto Serif) + label pequeño en Manrope.

---

## Pantalla 2 — Usuarios (`/admin/usuarios`)

Tabs: **Vendedores** (default) / **Compradores**

**Tabla de vendedores** (columnas):
- Logo + Nombre comercial
- Email
- Departamento
- Plan (badge con color del plan)
- Publicaciones activas (conteo)
- Estado (Activo / Suspendido)
- Acciones: `Ver perfil` (link a `/vendedores/[id]`) + `Suspender / Reactivar` (botón)

**Tabla de compradores**:
- Avatar + Nombre
- Email
- Departamento
- Pedidos realizados (conteo)
- Estado
- Acciones: `Suspender / Reactivar`

Buscador simple arriba (filtra por nombre o email, sin debouncing complejo).

Confirmación de suspender vía modal `ConfirmDialog` (reusar si existe, si no crear básico).

---

## Pantalla 3 — Publicaciones (`/admin/publicaciones`)

Tabla global con todas las publicaciones:
- Foto + Título
- Categoría (badge A/B/C/D)
- Vendedor (nombre, link al perfil)
- Precio (o "Bajo cotización")
- Estado (badge)
- Destacada (estrella si `featured`)
- Acciones: `Destacar / Quitar destaque` + `Eliminar` (con confirmación)

Filtro arriba por categoría (chips A/B/C/D).

---

## Pantalla 4 — Eventos (`/admin/eventos`)

Tabla simple:
- Imagen + Nombre
- Tipo (badge)
- Organizador
- Fecha
- Modalidad
- Inscritos / Cupos
- Estado
- Acciones: `Eliminar` (con confirmación)

---

## Pantalla 5 — Suscripciones (`/admin/suscripciones`)

Lista de vendedores con plan ≠ `none`:
- Logo + Nombre comercial
- Plan (badge)
- Precio mensual
- Fecha de expiración
- Apariciones usadas / asignadas en el período
- Acciones: `Cancelar plan` (con confirmación → pasa a `none`)

Arriba, resumen rápido:
- Total ingresos mensuales (USD)
- Total de suscripciones activas

---

## Componentes nuevos (mínimos)

- [`AdminSidebar`](src/components/admin/AdminSidebar.tsx) — clon ligero del Sidebar de Mi Tienda con sus links
- [`StatCard`](src/components/admin/StatCard.tsx) — card con número grande + label (reusable en todas las pantallas si conviene)
- [`AdminTable`](src/components/admin/AdminTable.tsx) — wrapper genérico de tabla con header, hover, sin paginación compleja (todo en pantalla, el dataset es pequeño)
- [`ConfirmDialog`](src/components/ui/ConfirmDialog.tsx) — si no existe, modal básico de confirmación

No crear componentes nuevos si los existentes (Button, Badge, etc.) ya sirven.

---

## Diseño — alineado al sistema actual

- Layout idéntico al patrón de Mi Tienda: sidebar fijo a la izquierda + contenido a la derecha
- Fondo `bg-neutral-100`, contenedores blancos con `border-neutral-200`
- Verde bosque solo en botón primario y nav activo
- Badges con colores semánticos: `success` (activo), `error` (suspendido/eliminar), `warning` (destacado)
- Acciones destructivas (eliminar, suspender, cancelar) → siempre con confirmación
- Toasts de éxito tras cada acción

Invocar al ejecutar: `/design-system` + `/ux-patterns-b2b` + `/responsive-patterns`.

---

## Orden de ejecución (estimado)

1. **Tipos + mock admin user + guard** (15 min)
2. **Layout `(admin)` + Sidebar + ruta `/admin`** (15 min)
3. **Dashboard con KPIs derivados** (30 min)
4. **Usuarios (tabla + suspender)** (30 min)
5. **Publicaciones (tabla + destacar/eliminar)** (30 min)
6. **Eventos (tabla + eliminar)** (20 min)
7. **Suscripciones (lista + cancelar)** (20 min)
8. **Pulido final + DevSessionSwitcher con admin** (15 min)

Total estimado: ~3 h de implementación enfocada.

---

## Fuera de alcance (no implementar)

- Edición de datos de usuarios o publicaciones desde admin (solo suspender/eliminar/destacar)
- Login/registro real de admin (la sesión vive en el switcher)
- Logs de auditoría
- Permisos granulares
- Gráficos con librerías externas
- Exportar reportes
- Notificaciones a usuarios suspendidos
- Moderación de comentarios o reseñas

---

## Checklist de entrega

- [ ] Tipo `Admin` + `suspended` + `featured` añadidos
- [ ] `admin-01` en mocks + en DevSessionSwitcher
- [ ] Guard de ruta `(admin)` funcionando
- [ ] Dashboard con 4 KPIs reales (derivados de mocks)
- [ ] Usuarios: tabs + suspender vendedores/compradores con confirmación
- [ ] Publicaciones: eliminar + destacar con confirmación
- [ ] Eventos: eliminar con confirmación
- [ ] Suscripciones: cancelar plan con confirmación
- [ ] Toasts en todas las acciones
- [ ] Responsive ok en mobile (mínimo: tablas con scroll horizontal)
- [ ] Build limpio (`npm run build` sin errores)
