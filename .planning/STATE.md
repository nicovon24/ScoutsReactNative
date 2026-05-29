---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-05-29T22:16:28.190Z"
progress:
  total_phases: 2
  completed_phases: 0
  total_plans: 3
  completed_plans: 2
  percent: 0
---

# Project State

**Last updated**: 2026-05-29

## Current Phase

Phase 5 — In Progress (Plan 1/3 complete)

## Completed Phases

- Phase 1: Setup y Fundación — NativeWind, React Query, BSD client
- Phase 2: Home + Detalle Jugador — Lista filtrable, PlayerCard, PlayerDetail, radar SVG

## Phase 5 Progress

- Plan 01: useTeamSquad hook — COMPLETED (eaff998)
- Plan 02: ClubCard + pantalla /clubs — COMPLETED (48c196c, 242f8f4)
- Plan 03: pending

## Decisions

- router.push cast as `never` para typed-routes hasta que exista clubs/[id] (05-02)

## Next Action

Ejecutar Plan 03 de Fase 5

## Known Issues / Notes

- La API de Bzzoiro no expone `player_image_url` en el endpoint de squad/players. Las fotos se construyen como `https://sports.bzzoiro.com/media/players/{id}.png` — si el recurso no existe se muestra placeholder gris.
- El sort por rating en el home requiere que los stats se carguen lazy por jugador — puede causar que el orden cambie mientras se cargan los datos. Para v2: prefetch de stats al cargar el squad.
- El filtro `?team=X` en `/api/v2/players/` no funciona como filtro de equipo actual. Se usa `/teams/{id}/squad/` como workaround.
