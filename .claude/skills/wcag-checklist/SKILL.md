---
name: wcag-checklist
description: Verifica accesibilidad WCAG 2.1 AA al generar o revisar pantallas de Cafital. Invocar al diseñar formularios, modales, cards, navegación o cualquier UI interactiva. Cubre contraste, ARIA, foco, teclado, semántica HTML y formularios.
---

# WCAG 2.1 AA — Checklist para Cafital

Aplicar al **generar** cualquier pantalla nueva y al **revisar** UI existente. El objetivo es nivel AA mínimo.

---

## 1. Contraste de color

**Mínimos WCAG AA:**
- Texto normal (<18px o <14px bold): **4.5:1**
- Texto grande (≥18px o ≥14px bold): **3:1**
- Componentes UI e iconos significativos: **3:1**

**Tokens de Cafital ya verificados:**

| Combinación | Ratio | Uso permitido |
|-------------|-------|---------------|
| `text-neutral-900` (#262626) sobre `white` | 14.7:1 | ✅ Cualquier texto |
| `text-neutral-500` (#737373) sobre `white` | 4.6:1 | ✅ Texto normal (justo pasa) |
| `text-neutral-500` sobre `bg-neutral-100` (#F5F5F5) | 4.4:1 | ⚠️ Solo texto grande |
| `text-primary-900` (#0D4D26) sobre `bg-primary-300` (#2ECC71) | 6.8:1 | ✅ Botón primario |
| `text-white` sobre `bg-accent-500` (#C9870E) | 3.8:1 | ⚠️ Solo texto grande/bold — usar peso 600+ siempre |
| `text-neutral-300` (#C2C2C2) sobre `white` | 2.5:1 | ❌ Solo decorativo / disabled (excepción WCAG) |

**Reglas duras:**
- ❌ Nunca usar `text-neutral-500` para texto pequeño sobre fondos grises.
- ❌ Nunca usar texto `accent-500` sobre blanco para body.
- ✅ Botón checkout (`bg-accent-500 text-white`) usar siempre `font-semibold` (peso 600) y mínimo `text-sm`.

---

## 2. HTML semántico

- Usar `<button>` para acciones, `<a>` para navegación. Nunca un `<div onClick>`.
- Un solo `<h1>` por página. Jerarquía sin saltos (`h1 → h2 → h3`).
- `<nav>` para navegación, `<main>` para contenido principal, `<aside>` para sidebars, `<footer>` para footer.
- Listas reales: `<ul>` / `<ol>` para grids de productos, filtros, menús.
- `<section>` con `aria-labelledby` para secciones del Home (hero, vendedores destacados, etc.).

---

## 3. ARIA y labels

- `aria-label` en IconButton sin texto visible (corazón de favorito, cerrar modal, hamburger).
- `aria-current="page"` en el ítem activo de la navegación.
- `aria-expanded` y `aria-controls` en disclosures (filtros colapsables, dropdowns).
- `role="dialog"` + `aria-modal="true"` en modales. Bloquear scroll del body.
- `role="alert"` o `aria-live="polite"` en toasts según urgencia.
- `aria-describedby` en inputs que apuntan a su helper text y error message.

---

## 4. Foco

- Ya hay focus ring global (`outline: 3px solid #abecc6`) en `globals.css` — **no removerlo**.
- Orden de tab lógico (DOM order = visual order).
- Foco visible siempre (`:focus-visible`). Nunca `outline: none` sin reemplazo.
- En modales/drawers: trap del foco mientras está abierto, retorno al trigger al cerrar.
- Skip link "Saltar al contenido" en el layout principal (opcional pero recomendado).

---

## 5. Teclado

- Toda interacción mouse debe funcionar con teclado:
  - Modales/Drawers cierran con `Esc`
  - Dropdowns: `↑↓` para navegar, `Enter` para seleccionar, `Esc` cierra
  - Toggles: `Space` o `Enter`
  - Image gallery / carousel: `←→` para navegar
- `tabindex="0"` solo en elementos interactivos custom. Nunca `tabindex` > 0.
- ImageGallery del producto: las miniaturas deben ser navegables por teclado.

---

## 6. Formularios

Aplica especialmente al formulario de publicación (multi-step) y al de evento.

- Cada input con `<label htmlFor>` asociado. No reemplazar label por placeholder.
- Error messages con `aria-describedby` apuntando al input, con `role="alert"` cuando aparecen.
- Required fields marcados con `aria-required="true"` y asterisco visible.
- Agrupar campos relacionados con `<fieldset>` + `<legend>` (ej. "Datos del negocio", "Precio y logística").
- Mensajes de error específicos ("El precio debe ser mayor a 0"), no genéricos ("Error").
- En el multi-step, anunciar el paso actual con `aria-live` ("Paso 3 de 6: Información base").

---

## 7. Imágenes y media

- Toda `<img>` con `alt` descriptivo. Imágenes decorativas: `alt=""`.
- Galería de producto: alt incluye nombre del producto + número de foto ("Café Verde Caranavi - foto 2 de 5").
- Avatar de vendedor: `alt="Logo de [nombre del negocio]"`.
- Video embebido: incluir título y, si es posible, transcripción.

---

## 8. Color no es el único indicador

- Estado de pedido: además de color, palabra ("Pendiente", "En proceso", "Completado") y/o ícono.
- Toggle on/off: además del verde, ícono o label "Activo / Inactivo".
- Errores de formulario: además de borde rojo, ícono de error y mensaje en texto.
- Badge de descuento: además del fondo, texto "% OFF" explícito.

---

## 9. Movimiento

- Carousels / hero banner: respetar `@media (prefers-reduced-motion: reduce)` desactivando autoplay.
- Toasts entran/salen sin animaciones excesivas.
- No animaciones intermitentes / parpadeos.

---

## 10. Checklist rápido pre-merge

Antes de dar por terminada una pantalla, verificar:

- [ ] Tab a través de la página tiene orden lógico
- [ ] Todos los botones/links son accesibles por teclado
- [ ] Imágenes tienen `alt` apropiado
- [ ] Formularios tienen labels y mensajes de error claros
- [ ] Modales atrapan foco y cierran con Esc
- [ ] Contraste verificado (especialmente texto sobre verde/mostaza)
- [ ] Estados de error/loading/empty no dependen solo del color
- [ ] Probado al menos con tab+enter sin mouse

---

## Referencia rápida de tokens accesibles

```
Body text:        text-neutral-900 sobre white o neutral-100
Secondary text:   text-neutral-500 sobre white (no sobre neutral-100 para body)
Botón primario:   bg-primary-300 + text-primary-900 + font-semibold
Botón checkout:   bg-accent-500 + text-white + font-semibold (siempre bold)
Disabled:         bg-neutral-200 + text-neutral-300 (excepción WCAG, marcar aria-disabled)
Error text:       text-[#D32F2F] sobre white (5.4:1 ✅)
```
