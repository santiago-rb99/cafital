# Design System — Cafital

Especificaciones visuales exactas para generar pantallas de Cafital.

## Tipografía

### Fuentes
| Fuente | Uso | Pesos |
|--------|-----|-------|
| **Noto Serif** | Títulos: hero, encabezados principales de página, títulos de sección destacados | 400 regular / 700 bold |
| **Manrope** | Todo lo demás: body, labels, botones, inputs, nav, tablas, badges, metadata | 400 / 500 / 600 / 700 |

### Escala de tamaños
| Tamaño | Peso | Fuente | Clase Tailwind | Uso |
|--------|------|--------|----------------|-----|
| 12px | 500 | Manrope | `text-xs font-medium` | Etiquetas, badges, metadata, helper text |
| 14px | 400 | Manrope | `text-sm font-normal` | Texto secundario, descripciones de tabla |
| 14px | 500 | Manrope | `text-sm font-medium` | Labels de formulario |
| 16px | 400 | Manrope | `text-base font-normal` | Cuerpo principal, descripciones |
| 18px | 500 | Manrope | `text-lg font-medium` | Subtítulos de sección |
| 20px | 500 | Manrope | `text-xl font-medium` | Títulos de tarjeta |
| 24px | 600 | Noto Serif | `text-2xl font-semibold font-serif` | Títulos de página y sección |
| 30px | 700 | Noto Serif | `text-3xl font-bold font-serif` | Hero, encabezados principales |

Line-height cuerpo: 1.7 (`leading-relaxed`)
Line-height encabezados: 1.2–1.4 (`leading-tight` / `leading-snug`)

---

## Paleta de Colores

### brand-neutral (Estructura y texto)
| Token | Hex | Tailwind | Uso |
|-------|-----|----------|-----|
| neutral-50 | `#FFFFFF` | `bg-white` | Fondo de página... NO — el fondo de página es neutral-100 |
| neutral-100 | `#F5F5F5` | `bg-neutral-100` | **Fondo de página siempre** |
| neutral-200 | `#EBEBEB` | `bg-neutral-200` / `border-neutral-200` | Bordes y divisores |
| neutral-300 | `#C2C2C2` | `text-neutral-300` | Placeholders y texto deshabilitado |
| neutral-500 | `#737373` | `text-neutral-500` | Texto secundario y etiquetas |
| neutral-900 | `#262626` | `text-neutral-900` | **Texto principal y encabezados** |

### brand-primary (Verde vivo)
| Token | Hex | Tailwind | Uso |
|-------|-----|----------|-----|
| primary-50 | `#F0FFF6` | `bg-primary-50` | Fondos de estados activos suaves |
| primary-100 | `#ABECC6` | `bg-primary-100` | Badges, tags, chips, focus ring |
| primary-300 | `#2ECC71` | `bg-primary-300` | **Fondo de botón primario** |
| primary-500 | `#27AE60` | `bg-primary-500` / `text-primary-500` | Hover botón primario, links activos, iconos activos |
| primary-700 | `#1E8449` | `bg-primary-700` | Pressed state |
| primary-900 | `#0D4D26` | `text-primary-900` | Texto sobre fondos claros de primary, logotipo |

### brand-accent (Mostaza — SOLO checkout)
| Token | Hex | Tailwind | Uso |
|-------|-----|----------|-----|
| accent-50 | `#FFFBF0` | `bg-accent-50` | Fondos de alerta warning |
| accent-100 | `#FDEFC2` | `bg-accent-100` | Badges de advertencia |
| accent-300 | `#F5C842` | — | Hover en CTA de pago |
| accent-500 | `#C9870E` | `bg-accent-500` | **Botón de checkout y acciones críticas de pago** |
| accent-700 | `#8C5A08` | `bg-accent-700` | Pressed state de checkout |
| accent-900 | `#4A2E04` | `text-accent-900` | Texto de alerta sobre fondo claro |

### Colores de Feedback
| Estado | Texto/Borde | Fondo | Tailwind |
|--------|------------|-------|---------|
| Error | `#D32F2F` | `#FDEAEA` | `text-red-700 bg-red-50` |
| Info | `#1565C0` | `#E3F2FD` | `text-blue-800 bg-blue-50` |

### Reglas de Uso de Color — CRÍTICAS
- El verde aparece **EXCLUSIVAMENTE** en: botón primario (fondo/hover), iconos activos, toggles activos, links activos, focus ring
- El mostaza aparece **EXCLUSIVAMENTE** en: botón de checkout/pago
- **La interfaz debe verse predominantemente neutra. 90% blanco y gris neutro.**
- El color es funcional, nunca decorativo
- **Nunca** usar verde o mostaza como fondo de sección ni como color decorativo

---

## Espaciado

Unidad base: 4px

| px | Tailwind | Uso |
|----|---------|-----|
| 4px | `gap-1` / `p-1` | Gap entre ícono y texto, separación mínima |
| 8px | `gap-2` / `p-2` | Padding interno de badge, gap entre elementos inline |
| 12px | `gap-3` / `p-3` | Padding de chip, gap en listas compactas |
| 16px | `gap-4` / `p-4` | Padding interno de input y tarjeta compacta |
| 20px | `gap-5` / `p-5` | Gap entre campos de formulario |
| 24px | `gap-6` / `p-6` | Padding de tarjeta, gap entre secciones compactas |
| 32px | `gap-8` / `p-8` | Padding de modal, gap entre componentes |
| 40px | `gap-10` / `p-10` | Padding de sección |
| 48px | `gap-12` / `p-12` | Padding vertical de sección grande |
| 64px | `gap-16` / `p-16` | Padding de hero, separación entre secciones mayores |

---

## Border Radius

| Token | Valor | Tailwind | Uso |
|-------|-------|---------|-----|
| sm | 4px | `rounded` | Inputs, textareas, badges, tags |
| md | 8px | `rounded-lg` | Botones, chips, selects |
| lg | 12px | `rounded-xl` | Tarjetas de publicación |
| xl | 16px | `rounded-2xl` | Modales, drawers, panels del dashboard |
| 2xl | 24px | `rounded-3xl` | Hero cards, banners de perfil público |
| full | 9999px | `rounded-full` | Avatares, toggles |

---

## Sombras

**Regla**: contenedores blancos sobre fondo gris llevan **SIEMPRE** `border 1px solid #EBEBEB` + la sombra de su nivel. Borde y sombra trabajan juntos, ninguno reemplaza al otro.

| Token | Valor CSS | Tailwind | Uso |
|-------|-----------|---------|-----|
| shadow-xs | `0px 1px 2px rgba(0,0,0,0.04)` | `shadow-xs` | Inputs en focus, chips |
| shadow-sm | `0px 1px 3px rgba(0,0,0,0.06), 0px 1px 2px rgba(0,0,0,0.04)` | `shadow-sm` | Tarjetas en reposo, rows de tabla |
| shadow-md | `0px 4px 8px rgba(0,0,0,0.06), 0px 1px 3px rgba(0,0,0,0.04)` | `shadow-md` | Tarjetas en hover, dropdowns, mega menú, tooltips |
| shadow-lg | `0px 8px 16px rgba(0,0,0,0.07), 0px 2px 4px rgba(0,0,0,0.04)` | `shadow-lg` | Modales, drawers, panels, carrito desplegable |

---

## Botones

### Primario (acción principal de la pantalla)
```
Default:  bg-primary-300 text-primary-900 font-semibold rounded-lg
Hover:    bg-primary-500
Focus:    outline-3 outline-primary-100 outline-offset-2
Disabled: bg-neutral-200 text-neutral-300 cursor-not-allowed
```

### Secundario (acción complementaria)
```
Default:  bg-white text-primary-500 border border-primary-500 rounded-lg
Hover:    bg-primary-50
Focus:    outline-3 outline-primary-100 outline-offset-2
Disabled: bg-neutral-100 text-neutral-300 border-neutral-200
```

### Checkout (SOLO para acciones de pago)
```
Default:  bg-accent-500 text-white font-semibold rounded-lg
Hover:    bg-accent-700
Disabled: bg-neutral-200 text-neutral-300
```

### Destructivo (eliminar, cancelar definitivo)
```
Default:  bg-[#D32F2F] text-white font-semibold rounded-lg
Hover:    bg-[#9A1F1F]
Disabled: bg-neutral-200 text-neutral-300
```

### Tamaños de botón
| Tamaño | Height | Padding H | Font |
|--------|--------|-----------|------|
| sm | 32px (`h-8`) | 12px (`px-3`) | 13px |
| md | 40px (`h-10`) | 16px (`px-4`) | 14px |
| lg | 48px (`h-12`) | 20px (`px-5`) | 16px |

---

## Inputs

| Estado | Clases Tailwind |
|--------|----------------|
| Default | `border border-neutral-200 bg-white rounded` |
| Hover | `border border-neutral-300 bg-white` |
| Focus | `border border-primary-500 bg-white ring-3 ring-primary-100/33` |
| Error | `border border-[#D32F2F] bg-white ring-3 ring-red-200/33` |
| Disabled | `border border-neutral-200 bg-neutral-100 text-neutral-300 cursor-not-allowed` |

Height estándar: 40px (`h-10`)
Padding interno: 12px horizontal (`px-3`)
Font: 14px Manrope peso 400

Label sobre el input: `text-[13px] font-medium text-neutral-900 mb-1.5`
Helper text bajo el input: `text-xs font-normal text-neutral-500`
Error text: `text-xs text-[#D32F2F]`

---

## Toggle

| Estado | Estilos |
|--------|---------|
| On | `bg-primary-300` thumb blanco, label `text-primary-700 text-[13px] font-medium` |
| Off | `bg-neutral-300` thumb blanco, label `text-neutral-500 text-[13px] font-normal` |

Dimensiones: 40px × 22px, thumb 18px diámetro, `rounded-full`

---

## Badges

Estructura base: `rounded text-xs font-medium px-2 py-0.5`

| Variante | Clases |
|----------|--------|
| Default | `bg-neutral-100 text-neutral-500` |
| Primary | `bg-primary-100 text-primary-900` |
| Warning | `bg-accent-100 text-accent-900` |
| Error | `bg-[#FDEAEA] text-[#601212]` |
| Success | `bg-primary-50 text-primary-700` |
| Neutral dark | `bg-neutral-900 text-white` |

---

## Toasts

Posición: esquina inferior derecha, z-index alto
Animación: slide desde la derecha al aparecer, fade al desaparecer
Auto-dismiss: 4s (excepto Error que requiere dismiss manual)
Estructura: `rounded-xl px-4 py-3 border-l-[3px] shadow-md`

| Tipo | Fondo | Borde izq | Título | Descripción |
|------|-------|----------|--------|-------------|
| Success | `#F0FFF6` | `#27AE60` | `#0D4D26` | `#1E8449` |
| Error | `#FDEAEA` | `#D32F2F` | `#601212` | `#9A1F1F` |
| Warning | `#FFFBF0` | `#C9870E` | `#4A2E04` | `#8C5A08` |
| Info | `#E3F2FD` | `#1565C0` | `#0D3C7A` | `#1565C0` |

Font título: `text-[13px] font-medium`
Font descripción: `text-xs font-normal`

---

## Imágenes

Todas usan `object-fit: cover` (`object-cover`).

| Tipo | Ratio | Mínimo | Tailwind |
|------|-------|--------|---------|
| Avatar / Logo vendedor | 1:1 | 80×80px | `aspect-square` |
| Foto principal publicación | 1:1 | 400×400px | `aspect-square` |
| Banner perfil público | 16:9 | 1200×675px | `aspect-video` |
| Imagen de evento | 16:10 | 800×500px | `aspect-[16/10]` |
| Miniatura en tarjeta/tabla | 1:1 | 60×60px | `aspect-square` |

---

## Iconos

- Librería: **Lucide React exclusivamente**
- Stroke-width: **1.5px** en todos
- Tamaño default: **20px** (`size={20}`)
- Tamaño en hero/secciones destacadas: **28px**
- Color inactivo: `#737373` (`text-neutral-500`)
- Color activo: `#27AE60` (`text-primary-500`)

```tsx
import { ShoppingCart } from 'lucide-react'
<ShoppingCart size={20} strokeWidth={1.5} className="text-neutral-500" />
```

---

## Reglas Generales de Diseño

1. **Fondo de página**: siempre `#F5F5F5` — clase `bg-neutral-100`
2. **Contenedores**: siempre `#FFFFFF` + `border border-neutral-200` + sombra del nivel
3. Sin gradientes en ningún elemento
4. Sin texturas decorativas
5. Diseño flat — profundidad exclusivamente con bordes y sombras
6. Tono profesional para usuarios de negocio, no consumidor final
7. Interfaz limpia, minimalista y predominantemente neutra
8. El color es funcional, nunca decorativo
9. Noto Serif aporta calidez y autoridad en títulos
10. Manrope aporta claridad y legibilidad en UI

---

## Checklist antes de generar una pantalla

- [ ] Fondo de página es `bg-neutral-100` (`#F5F5F5`)
- [ ] Todos los contenedores son blancos con borde `neutral-200` y sombra
- [ ] Sin gradientes ni texturas
- [ ] Verde solo en botón primario, iconos activos, toggles, links
- [ ] Mostaza solo en botones de pago/checkout
- [ ] Títulos en Noto Serif, UI en Manrope
- [ ] Iconos Lucide con strokeWidth 1.5
- [ ] Spacing alineado a la grilla de 4px
- [ ] Border radius correcto por tipo de elemento
