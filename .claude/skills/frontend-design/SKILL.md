---
name: frontend-design
description: Eleva la calidad de craft en componentes y pantallas de Cafital — motion, tipografía, micro-interacciones, refinamiento — para evitar resultados genéricos "AI-generated". Invocar cuando una pantalla esté funcionalmente lista pero se sienta plana, genérica o sin alma. La dirección estética viene de /design-system; esta skill se enfoca en ejecución y detalle.
---

# Frontend Craft — Cafital

Esta skill complementa `/design-system` con principios de **ejecución y refinamiento**. La dirección estética ya está decidida (minimalismo refinado B2B, Manrope + Noto Serif, paleta neutra con acentos funcionales). Esta skill garantiza que esa decisión se ejecute con precisión, no por defecto.

## Pensamiento previo

Antes de escribir código, considerar:

- **Propósito**: ¿qué problema resuelve esta interfaz? ¿quién la usa?
- **Punto de refinamiento**: ¿dónde puede el craft elevar esto por encima del baseline? (un timing de motion específico, un detalle tipográfico, un ritmo espacial, una micro-interacción)
- **Restricciones**: framework, performance, accesibilidad (ver `/wcag-checklist`)
- **Detalle memorable**: ¿qué decisión específica notará alguien al usar esta pantalla?

El estilo de Cafital es **minimalismo refinado para B2B**: superficies 90% neutras, color funcional, diseño flat con profundidad por bordes y sombras, Noto Serif aportando calidez en títulos. Esta skill se asegura de que ese minimalismo sea **deliberado y preciso**, no perezoso ni por descarte.

## Guías de craft

### Tipografía

- Ya están elegidas: Noto Serif (títulos) + Manrope (UI). Usarlas con intención — escala de pesos completa, line-height cuidado, letter-spacing cuando aporte.
- Una jerarquía bien afinada (un título al peso/tamaño correctos + body con line-height generoso) hace más que tres familias compitiendo.
- Cada decisión tipográfica (size, weight, leading, tracking) merece pensarse, no copiarse.
- Para datos densos (tablas de Mi Tienda, atributos de producto) usar tabular-nums en Manrope si aplica.

### Motion

- Priorizar CSS-only. Usar Motion (Framer Motion para React) solo cuando lo justifique la interacción.
- Momentos de alto impacto > micro-interacciones dispersas. Una entrada de página bien orquestada con `animation-delay` escalonado deja más impresión que animar todo.
- Hover y scroll-triggers se sienten intencionales, no decorativos.
- Curvas de easing: preferir `cubic-bezier` custom suaves antes que `ease` por defecto. Para entradas, `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo) suele funcionar.
- Duración base: 200–300ms para feedback, 400–600ms para transiciones de pantalla. Nunca >800ms.
- Respetar `prefers-reduced-motion`.

### Composición espacial

- Negative space generoso es el ritmo dominante. Densidad solo cuando la info lo amerita (tablas, atributos).
- Grid estricto como baseline. Romperlo solo con propósito.
- Respetar la escala de 4px del design system. Valores arbitrarios (13px, 17px, 22px) son señal de pereza.
- Alineación de baselines entre elementos visuales — un avatar y su nombre, un ícono y su label, dos cards lado a lado deben sentirse alineadas verticalmente.

### Detalles visuales

- Default: `bg-neutral-100` página + contenedores blancos con `border + shadow`. **Sin gradientes, sin noise textures, sin grain overlays, sin glassmorphism** — anti-patrones explícitos en este design system.
- La atmósfera viene de la precisión: baselines alineadas, sombras consistentes por nivel, contraste cuidado entre superficie y contenido.
- Decoración solo cuando es funcional: una ilustración sutil en un empty state, un divider que se gana su lugar, un ícono que ancla significado.
- Bordes 1px solid `neutral-200` son baseline. Bordes más gruesos (2px) solo para selección activa, focus o estados destacados.

## Lo que esta skill rechaza

Estética "AI-generated":

- Stacks de fuente por defecto (Inter, Roboto, system-ui) — ya tenemos Manrope y Noto Serif, usarlas
- Layouts predecibles (hero 3 columnas, stack centrado de cards sin ritmo)
- Gradientes "AI slop" (especialmente lila-a-blanco)
- Animaciones decorativas que no sirven al usuario
- Spacing perezoso (valores px arbitrarios en vez de la escala del sistema)
- Sombras genéricas (las del design system existen, usarlas)
- Border-radius mezclados sin sistema (usar las 5 opciones definidas)
- Cards con padding inconsistente entre features

## Match implementación a la visión

Minimalismo refinado requiere **restricción, precisión y atención meticulosa a espaciado, tipografía y detalles sutiles**. La elegancia aquí viene de ejecutar bien la visión — no de agregar más.

Meta: cada pantalla debería verse **diseñada deliberadamente**, no generada. Alguien debería poder señalar una decisión específica (el ritmo del spacing, el timing de una animación, el contraste entre un título serif y body sans, el peso exacto de un label) y sentir que alguien lo pensó.

## Checklist craft pre-merge

- [ ] Tipografía: tamaño/peso/leading deliberados, sin defaults sin pensar
- [ ] Spacing: todos los valores caen en la escala del design system
- [ ] Sombras: nivel correcto según jerarquía visual (xs/sm/md/lg)
- [ ] Border radius: el correcto por tipo de elemento (sm/md/lg/xl/2xl/full)
- [ ] Motion: si hay, tiene curva custom y duración pensada
- [ ] Iconos: Lucide a 20px / 28px, strokeWidth 1.5 — sin excepciones
- [ ] Alineación: baselines y ejes verticales coherentes
- [ ] Nada se ve "default Tailwind starter"
