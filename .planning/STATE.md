# Project State

**Last updated**: 2026-05-22

## Current Phase

Phase 2 — COMPLETED

## Completed Phases

- Phase 1: Setup y Fundación — NativeWind, React Query, BSD client
- Phase 2: Home + Detalle Jugador — Lista filtrable, PlayerCard, PlayerDetail, radar SVG

## Next Action

Run `/gsd-discuss-phase 3` to start the Liga tab phase.

## Known Issues / Notes

- La API de Bzzoiro no expone `player_image_url` en el endpoint de squad/players. Las fotos se construyen como `https://sports.bzzoiro.com/media/players/{id}.png` — si el recurso no existe se muestra placeholder gris.
- El sort por rating en el home requiere que los stats se carguen lazy por jugador — puede causar que el orden cambie mientras se cargan los datos. Para v2: prefetch de stats al cargar el squad.
- El filtro `?team=X` en `/api/v2/players/` no funciona como filtro de equipo actual. Se usa `/teams/{id}/squad/` como workaround.
