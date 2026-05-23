# Scout PL — Análisis de Jugadores

## What This Is

Una aplicación React Native para scouts y fanáticos del fútbol que quieran analizar el rendimiento de los jugadores de la Premier League. Muestra listas filtrables de jugadores con stats de la temporada actual, barras de rating, y pantallas de detalle con radar de habilidades.

## Core Value

Ver los jugadores de la Premier League con sus estadísticas reales de la temporada en curso, filtrar por posición, buscar por nombre/club, y profundizar en el perfil completo de cada jugador.

## Context

- **Runtime**: Expo SDK 56 / React Native 0.85
- **Datos**: Bzzoiro Sports Data REST API v2 (`Authorization: Token`)
- **Estilo**: NativeWind v4 (Tailwind), tema dark, acento lime #A3FF12
- **Routing**: expo-router (file-based, typedRoutes)
- **State**: @tanstack/react-query v5

## Requirements

### Validated

- ✓ Estructura base Expo SDK 56 con expo-router — existente
- ✓ NativeWind v4 instalado y configurado (babel, metro, tailwind) — fase 1
- ✓ API client Bzzoiro (auth Token, base URL v2) — fase 1
- ✓ Home con lista de jugadores Premier League + filtros — fase 2
- ✓ Detalle de jugador con radar SVG y stats — fase 2

### Active

- [ ] Explore tab: tabla de standings de la liga
- [ ] Comparar dos jugadores
- [ ] Temporadas pasadas (histórico)
- [ ] Búsqueda global

### Out of Scope

- Autenticación de usuario — app pública
- Favoritos persistentes — v2
- Notificaciones live — v2

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| NativeWind v4 en vez de StyleSheet | Desarrollo de UI más rápido, clases reutilizables | Implementado |
| Auth `Token` en `.env.local` con prefijo `EXPO_PUBLIC_` | Estándar Expo sin backend propio | Implementado — migrar a proxy en v2 |
| Estrategia standings → squads | API no tiene filtro directo por liga en /players/ | Implementado via `/leagues/1/standings/` + `/teams/{id}/squad/` |
| React Query staleTime 24h para squads | Squads no cambian diario | Implementado |

---
*Last updated: 2026-05-22 — initialization*
