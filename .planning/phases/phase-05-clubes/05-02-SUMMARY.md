---
phase: "05-clubes"
plan: "02"
subsystem: "ui-clubs"
tags: ["flatlist", "nativewind", "expo-image", "react-query", "search"]
dependency_graph:
  requires: ["useLeagueStandings", "StandingEntry"]
  provides: ["ClubCard", "/clubs screen"]
  affects: ["clubs/[id].tsx (Wave 3)"]
tech_stack:
  added: []
  patterns: ["FlatList numColumns=2", "client-side search filter", "expo-image CDN logo"]
key_files:
  created:
    - src/components/scout/club-card.tsx
    - src/app/clubs/index.tsx
  modified: []
decisions:
  - "router.push cast as `never` para sortear typed-routes strict mode hasta que se cree la ruta clubs/[id]"
  - "flex-1 en Pressable interior para que las dos columnas ocupen igual ancho en la FlatList"
  - "useLeagueStandings reutiliza el cache del home — no se hace un fetch adicional"
metrics:
  duration: "8m"
  completed: "2026-05-29"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 0
---

# Phase 05 Plan 02: Pantalla de Clubes Summary

Pantalla `/clubs` con grilla de 2 columnas que muestra los 20 equipos de la Premier League usando datos del cache de `useLeagueStandings`, con barra de busqueda client-side y componente `ClubCard` con logo via BSD CDN.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Crear componente ClubCard | 48c196c | src/components/scout/club-card.tsx |
| 2 | Crear pantalla clubs/index.tsx | 242f8f4 | src/app/clubs/index.tsx |

## Decisions Made

- `router.push` necesita cast `as never` hasta que se cree `src/app/clubs/[id].tsx` y expo-router regenere los tipos de rutas. Sin ese cast, `tsc --noEmit` falla con TS2345.
- `flex-1` en el `Pressable` de `ClubCard` es necesario para que la FlatList con `numColumns={2}` reparta el ancho equitativamente entre las dos columnas.
- `useLeagueStandings` ya esta en cache si el usuario visito el home primero — zero fetches adicionales en ese caso.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. Los logos y datos son reales desde la API BSD. La navegacion a `/clubs/${team_id}` esta preparada; la pantalla destino se crea en Wave 3.

## Threat Flags

No new trust boundaries. Token exposure (T-05-02) es riesgo aceptado pre-existente. Filtrado de busqueda es 100% client-side sin envio a servidor (T-05-03 aceptado).

## Self-Check: PASSED

- src/components/scout/club-card.tsx: FOUND
- src/app/clubs/index.tsx: FOUND
- Commit 48c196c: FOUND
- Commit 242f8f4: FOUND
- npx tsc --noEmit: sin errores
