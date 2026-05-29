---
phase: "05-clubes"
plan: "01"
subsystem: "data-layer"
tags: ["react-query", "hooks", "squad", "cache"]
dependency_graph:
  requires: []
  provides: ["useTeamSquad"]
  affects: ["clubs/[id].tsx (Wave 2)", "lineup screen (Wave 3)"]
tech_stack:
  added: []
  patterns: ["useQuery with enabled guard", "24h staleTime cache sharing"]
key_files:
  created:
    - src/hooks/queries/use-team-squad.ts
  modified: []
decisions:
  - "queryKey ['team-squad', teamId] es idéntica a la usada en useLeaguePlayers para garantizar cache sharing"
  - "enabled: teamId > 0 previene fetches con IDs inválidos"
  - "staleTime 24h alinea con el resto de squad queries del proyecto"
metrics:
  duration: "5m"
  completed: "2026-05-29"
  tasks_completed: 1
  tasks_total: 1
  files_created: 1
  files_modified: 0
---

# Phase 05 Plan 01: useTeamSquad Hook Summary

Hook `useTeamSquad` que obtiene la plantilla de un equipo via React Query con cache sharing garantizado con `useLeaguePlayers`.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Crear hook useTeamSquad | eaff998 | src/hooks/queries/use-team-squad.ts |

## Decisions Made

- Query key `['team-squad', teamId]` es literal y coincide exactamente con la usada en `use-league.ts` linea 39, garantizando que si el usuario visita el home antes que la pantalla de club, el fetch ya esta en cache (hot path).
- `enabled: teamId > 0` previene fetches con IDs invalidos o no inicializados.
- `staleTime` de 24 horas es consistente con todas las squad queries del proyecto.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

No new network endpoints, auth paths, or trust boundaries introduced. Token exposure (T-05-01) is a known accepted risk documented in AGENTS.md.

## Self-Check: PASSED

- src/hooks/queries/use-team-squad.ts exists: FOUND
- Commit eaff998 exists: FOUND
- npx tsc --noEmit: no errors
- grep "team-squad" confirms query key alignment
