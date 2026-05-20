---
name: ux-patterns-b2b
description: Patrones de UX específicos para marketplace B2B del café boliviano. Invocar al diseñar cualquier pantalla del producto. Cubre jerarquía visual, microcopy profesional, flujos de cotización vs compra directa, señales de confianza, estados vacíos, formato de precios en Bs., compra recurrente y WhatsApp como canal primario.
---

# UX Patterns B2B — Cafital

Cafital no es B2C. Los usuarios son profesionales del café (productores, tostadurías, cafeterías) que toman decisiones de negocio. Cada decisión de diseño debe servir a ese contexto.

---

## Principios rectores

1. **Profesionalismo > entusiasmo**. Tono neutro, claro, técnico. Sin lenguaje aspiracional de consumo.
2. **Información antes que decoración**. Especificaciones técnicas visibles, no enterradas.
3. **Confianza explícita**. NIT, certificaciones, departamento, años activo — siempre visibles.
4. **Dos canales de cierre**: compra directa (con precio) o cotización vía WhatsApp. Ambos legítimos, no priorizar uno como "second class".
5. **Volumen importa**. Cantidad mínima, descuentos por volumen, compra recurrente son centrales — no decoración.

---

## Jerarquía de CTAs

Por pantalla, definir UN CTA primario (verde). Los demás secundarios o terciarios.

**Página de publicación con precio:**
- Primario: `Agregar al carrito` (verde)
- Secundario: `Contactar por WhatsApp` (outline o ghost, NO verde)
- Terciario: `Activar compra recurrente` (toggle dentro del card de unidad)

**Página de publicación bajo cotización:**
- Primario: `Contactar por WhatsApp` (verde — único canal de cierre)
- Sin secundario de compra

**Catálogo:**
- Primario por card: ninguno (la card entera es link al detalle)
- Acciones secundarias en la card: corazón favorito (ghost)

**Mi Tienda — Mis publicaciones:**
- Primario global: `Nueva publicación` (verde)
- Por row: acciones en menú dropdown (editar, pausar, eliminar)

❌ Nunca 2 botones verdes lado a lado.

---

## Formato de precios

```
Con precio:              Bs. 7.200,00 / Quintal (46 kg)
                         desde 1 unidad

Con descuento:           Bs. 6.480,00 / Quintal  [−10% OFF]
                         <s>Bs. 7.200,00</s>

Cantidad mínima:         Mínimo 2 unidades

Bajo cotización:         "Consultar precio"  [Cotizar por WhatsApp →]
```

Reglas:
- Siempre `Bs.` antes del número (no después)
- Separador de miles: `.` (boliviano), decimales con `,`
- Unidad siempre visible junto al precio
- Para fincas (cat D): aceptar también USD ("USD 85.000" o "Bs. 595.000")
- Descuento como badge `[−X% OFF]` sobre la foto + precio original tachado

---

## Compra recurrente — UX

Disponible en Cat A y C. Tratar como **mecánica diferenciada**, no como casilla más:

- En la card de catálogo: badge sutil esquina superior izquierda "↻ Compra recurrente"
- En el detalle: bloque separado bajo el selector de unidad/cantidad
  ```
  ┌────────────────────────────────────┐
  │ ↻ Activar compra recurrente        │
  │ Recibe este producto automáticamente │
  │                                    │
  │ Frecuencia: [Mensual ▾]            │
  │ Cantidad: [5] Kg                   │
  │                                    │
  │ Próxima entrega: 12 jul 2026       │
  └────────────────────────────────────┘
  ```
- En "Mis suscripciones": estado activo/pausado claro, próxima fecha prominente

Microcopy preferido:
- "Compra recurrente" > "Suscripción" (suena B2C)
- "Próxima entrega" > "Próximo envío"
- "Pausar" > "Cancelar" como acción principal (cancelar es destructivo, pausar reversible)

---

## WhatsApp como canal

Es un canal de cierre legítimo, no de soporte. Tratarlo con peso.

Botón WhatsApp:
```
[💬 Cotizar por WhatsApp]
   con el vendedor
```

Mensaje preformateado (URL `https://wa.me/[phone]?text=...`):
```
Hola, me interesa cotizar:
"Café Verde Caranavi Gesha Natural 2025"
Cantidad estimada: [a completar]
Cafital — pub-001
```

Reglas:
- Siempre incluir título exacto de la publicación
- Siempre mencionar Cafital + ID (trazabilidad)
- Si hay cantidad seleccionada, incluirla
- Para Cat D (fincas): "Hola, me interesa la finca [nombre]. ¿Podemos coordinar visita?"

---

## Señales de confianza

Visibles en todo el journey:

**En tarjeta del vendedor (catálogo y detalle):**
- Logo + nombre del negocio
- Badge de verificado (si tiene plan Semilla+)
- Departamento + municipio
- Plan premium si Exportación

**En perfil público del vendedor:**
- Misma data + descripción + portada
- "Activo desde [año]"
- Cantidad de publicaciones activas
- Certificaciones que maneja
- Si Exportación: bloque "Sobre nosotros"

**En el detalle de publicación:**
- Card del vendedor abajo del producto (clickeable)
- "Otras publicaciones de este vendedor" (3-4 productos)

❌ **No mostrar** reviews / ratings de estrellas — no existe en el modelo, no inventarlo.

---

## Estados vacíos

Cada lista vacía debe tener:
1. Ícono Lucide grande (40-48px) en `text-neutral-300`
2. Título corto explicativo
3. Línea de subtítulo accionable
4. CTA si aplica

Ejemplos:

```
[Search icon]
Sin resultados
No hay publicaciones que coincidan con tus filtros.
[Limpiar filtros]
```

```
[Heart icon]
Aún no guardas favoritos
Toca el corazón en cualquier publicación o vendedor para guardarlo aquí.
```

```
[Package icon]
No tienes pedidos todavía
Explora el catálogo y haz tu primera compra.
[Ver catálogo]
```

Para Mi Tienda (vendedor sin publicaciones):
```
[Store icon]
Tu tienda está lista, falta tu primera publicación
Los compradores podrán encontrarte una vez que publiques al menos un producto o servicio.
[Crear publicación]
```

---

## Estados de pedido

Tres estados, siempre con ícono + texto + color:

| Estado | Badge | Ícono |
|--------|-------|-------|
| Pendiente | `bg-accent-100 text-accent-900` | `Clock` |
| En proceso | `bg-primary-50 text-primary-700` | `Loader2` |
| Completado | `bg-primary-100 text-primary-900` | `CheckCircle2` |

❌ Nunca solo color, siempre la palabra.

---

## Filtros del catálogo

Categoría → Subcategoría → Filtros dinámicos. Patrón:

1. Filtros **siempre visibles** (en sidebar desktop):
   - Categoría (4 cards visuales)
   - Departamento (multi)
   - Rango de precio
   - Certificaciones (multi)
2. Filtros **dinámicos** que aparecen al elegir subcategoría:
   - Si café verde: proceso, variedad, altitud, puntuación SCA
   - Si maquinaria: estado, condición de venta, escala
   - Si servicio: modalidad, departamento donde se realiza
3. Chips de filtros activos arriba del grid, con `×` para quitar individualmente
4. Botón "Limpiar filtros" cuando hay alguno activo

---

## Microcopy del checkout

- Encabezado de paso: `Datos de envío` / `Resumen del pedido` / `Confirmación`
- CTA final: `Confirmar pedido` (no "Comprar ahora" ni "Pagar")
- Después de confirmar: `¡Pedido confirmado!` + "Te avisaremos cuando el vendedor lo procese"
- En el resumen, separar por vendedor si hay items de varios (orden multi-seller se split)

---

## Microcopy del catálogo

- Título: **Catálogo** (no "Tienda", no "Productos")
- Subtítulo / contexto: "X publicaciones encontradas"
- Sin precio: `Consultar precio` (no "Bajo solicitud", no "Contacta")
- Vendido por: `por [Nombre del negocio]` debajo del título de la card

---

## Microcopy de Mi Tienda

- Sección general: **Mi Tienda** (siempre con mayúscula)
- Tablas: **Mis publicaciones**, **Mis eventos**, **Pedidos recibidos**
- Botones: `Nueva publicación` / `Nuevo evento` (no "Crear", no "Agregar")
- Vacío: hablar como negocio ("Tu tienda...", "Tu primer pedido...")

---

## Densidad de información

B2B tolera densidad mayor que B2C. No abusar pero no esconder:

- **Card de publicación**: foto, título, vendedor, precio + unidad, badges (descuento, recurrente)
- **Detalle de publicación**: todos los atributos visibles (no detrás de "Ver más")
- **Lista de pedidos en Mi Tienda**: id, producto, comprador, cantidad, total, fecha, estado — todo en la row

---

## Errores y validaciones

- Validación inline al perder foco (`onBlur`), no al cada tecla.
- Errores específicos: ✅ "El precio debe ser mayor a 0" / ❌ "Campo inválido"
- Errores de red (API mock fallando): toast Error + retry
- Stock 0: badge "Sin stock" + deshabilitar botón "Agregar al carrito"

---

## Internacionalización

UI en español boliviano:
- "departamento" no "estado"
- "carrito" no "bolsa de compras"
- "tienda" no "negocio" (en contexto de Mi Tienda)
- Fechas: `12 jul 2026` o `12 de julio de 2026`
- Hora: `14:30` (24h)

---

## Checklist UX pre-merge

- [ ] Solo un CTA primario verde por pantalla
- [ ] Precios formateados con Bs. + unidad
- [ ] WhatsApp con mensaje preformateado + ID de publicación
- [ ] Estados vacíos diseñados (no listas con 0 items sin explicación)
- [ ] Estados de pedido con ícono + texto + color
- [ ] Señales de confianza visibles (vendedor, certificaciones)
- [ ] Microcopy revisado en español neutro profesional
- [ ] Sin ratings/reviews inventados
