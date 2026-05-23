# PLAN — Fase 3.5: Design System Migration

**Goal**: Portar el design system de LDP-challenge al proyecto React Native. UI limpia,
tokens semánticos, componentes modulares, paridad visual con el web.

**Reference project**: `c:\Users\Nicolas\Desktop\LDP-challenge\app\frontend`
**Target project**: `src/` de este repo

---

## Contexto del design system origen (LDP-challenge)

```ts
// Colors (tailwind.config.ts de LDP)
mainBg:    "#0F0F0F"    // fondo de pantalla
surface:   "#161616"    // superficies/secciones
card:      "#1C1C1C"    // cards
card-2:    "#222222"    // inner boxes dentro de cards
border:    "#2C2C2C"    // borde estándar
border-h:  "#3C3C3C"    // borde hover
primary:   "#F2F2F2"    // texto principal
secondary: "#B8B8B8"    // texto secundario
muted:     "#717171"    // texto apagado
green:     "#00E094"    // acento principal (= lime-400 actual)
gold:      "#E8A838"    // market value / favoritos
danger:    "#F04444"    // errores / limpiar
warn:      "#F0A04B"    // advertencias / rating medio
```

---

## Tasks

### Wave 1 — Tokens y config global

**DS-01 · Tailwind tokens**
- Agregar en `tailwind.config.js` los tokens del design system de LDP
- Mapear correctamente: `card`, `card-2`, `surface`, `border`, `border-h`,
  `primary`, `secondary`, `muted`, `green`, `gold`, `danger`, `warn`, `success`
- El `green` existente (lime-400 `#84cc16`) pasa a ser el brand accent; decidir si
  se mantiene o se migra al verde LDP (`#00E094`). **Decisión**: mantener lime-400
  como `green` porque ya está en uso masivo y contrasta mejor en dark mode nativo.
- Agregar `gold`, `danger`, `warn`, `success` como nuevos tokens

**Archivos**: `tailwind.config.js`

---

### Wave 2 — Extracción de componentes compartidos

**DS-02 · `position-badge.tsx`** ✅ (ya reemplazado)
- Consolidar en un solo componente con los colores nuevos

**DS-03 · `nationality-flag.tsx`** ✅ (ya creado)
- Extraído de `player-card.tsx`

**DS-04 · `player-utils.ts`** ✅ (ya creado)
- `getAge`, `formatValue`, `ratingColor` extraídos de `player-card.tsx`

**DS-05 · `stats-by-position.tsx`** (pendiente)
- Extraer `getPositionStats` + row de stats del card a componente propio
- Props: `position: string`, `stats: AggregatedStats | undefined`
- Renderiza el inner box con `StatItem`s y separadores

**DS-06 · `rating-bar.tsx`** — upgrade
- Agregar barra con gradiente (igual al LDP: green/warn/muted según rating)
- Agregar marcadores de referencia internos (`border-h` opacity)
- Agregar badge de rating encima a la derecha

**Archivos**: `components/scout/stats-by-position.tsx`,
`components/scout/rating-bar.tsx`

---

### Wave 3 — Player Card completo

**DS-07 · Refactor `player-card.tsx`**

Borrar todos los helpers inline y reemplazar por imports de los módulos creados.
Layout final de la card (paridad con LDP):

```
┌─────────────────────────────────────────┐  bg: card, border: border
│ [GK] 🇦🇷              VALOR  €4.5M  ☆  │  border-h on hover + shadow-glow-green
│                                         │
│ ╔═══════╗  Sebastián Driussi            │  foto: rounded-xl + border: border
│ ║  foto ║  30 años · 🔵 River Plate     │  ring glow on hover
│ ╚═══════╝                               │
│                                         │
│ ┌─────────────────────────────────────┐ │  bg: card-2, border: border
│ │  GOLES    │   XG    │  ASIST │  XA │ │
│ │    3      │  4.2    │   1    │ 1.8 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  DESEMPEÑO  ████████████████     7.4   │  gradient + badge coloreado
└─────────────────────────────────────────┘
```

Cambios de estilo a aplicar:

| Elemento | Ahora | → LDP-style |
|---|---|---|
| Fondo card | `#18181b` hardcoded | token `card` |
| Borde default | `#27272a` hardcoded | token `border` |
| Borde hover | `#84cc16` (lime) | `green` token |
| Shadow hover | inline rgba | `shadow-glow-green` custom shadow |
| Inner stats box | `#27272a` / `bg-zinc-800` | `card-2` + `border` |
| Separador stats | `border-zinc-800` | `border` token |
| Foto | circular (border-radius: 32) | rounded-xl + border |
| Texto nombre | `text-white font-bold text-lg` | `text-primary font-black text-lg tracking-tight` |
| Texto edad/club | `text-zinc-400 text-xs` | `text-secondary text-xs font-medium` |
| Rating badge | pill coloreado | igual, agregar `font-black` |
| Market value | `text-white text-sm font-bold` | `text-gold font-black text-md` |
| Label "Valor" | `text-zinc-500 text-[9px]` | `text-muted text-2xs uppercase tracking-widest` |

---

### Wave 4 — Barrels y estructura

**DS-08 · Barrel `index.ts` por carpeta**

```
src/components/
├── scout/index.ts         ← exporta todo lo de scout/
├── ui/index.ts            ← exporta Select, shimmer, animated-card
└── layout/index.ts        ← exporta app-tabs (si se mueve)
```

**DS-09 · Mover archivos de animación/skeleton a `ui/`**

```
shimmer-box.tsx       → components/ui/shimmer-box.tsx
animated-card.tsx     → components/ui/animated-card.tsx
animated-card.web.tsx → components/ui/animated-card.web.tsx
skeleton-card.tsx     → components/ui/skeleton-card.tsx (usa shimmer-box)
```
Actualizar imports en `index.tsx`.

---

### Wave 5 — Resto de pantallas

**DS-10 · `scout-header.tsx`**
- Usar tokens: `text-primary font-black` para el título
- El dot indicador → `bg-green animate-pulse`
- Botones de toggle vista → tokens `card`, `border`, `primary/muted`

**DS-11 · `player-filters.tsx`**
- Search input: `bg-card border border-border` + `focus:border-green/45`
- Position chips: activo → `bg-green text-mainBg`, inactivo → `bg-card border-border`
- Sort chips: activo → `border-green text-green`, inactivo → `border-border text-muted`
- Select de equipos: ya usa `Select` component — heredará los nuevos tokens

**DS-12 · `player-table.tsx`**
- Header: `bg-surface border-border`
- Filas pares: `bg-card`, impares: `bg-card-2`
- Hover fila: `bg-border` (sutil)
- Rating: `text-green font-black`

---

## Orden de ejecución

```
Wave 1  →  Wave 2 (DS-05, DS-06)  →  Wave 3 (DS-07)
    ↓
Wave 4 (DS-08, DS-09) → Wave 5 (DS-10, DS-11, DS-12)
```

Waves 1-3 son las más impactantes visualmente. Waves 4-5 son refactor/cleanup.

---

## Verification Checklist

- [ ] `tailwind.config.js` tiene todos los tokens LDP
- [ ] `player-card.tsx` no tiene colores hexadecimales hardcodeados
- [ ] Los 4 componentes shared están en archivos propios y el card los importa
- [ ] `rating-bar.tsx` muestra gradiente y badge
- [ ] Header, filtros y tabla usan tokens semánticos
- [ ] `npm run web` sin errores
- [ ] La UI se ve comparable al LDP-challenge en densidad y contraste
