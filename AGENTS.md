# Scout Premier League — Guía para agentes de IA

## Descripción del proyecto

Aplicación React Native de análisis de jugadores de la Premier League. Consume la API REST de Bzzoiro (BSD) para mostrar stats en tiempo real, rendimiento por temporada y perfil completo de cada jugador. Diseño dark estilo Scoutpanel.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Expo SDK 56, React Native 0.85 |
| Router | expo-router v4 (file-based, typedRoutes, reactCompiler) |
| Estilos | NativeWind v4 (Tailwind CSS para RN) |
| Data fetching | @tanstack/react-query v5 |
| API | Bzzoiro Sports Data (BSD) REST v2 |
| SVG / gráficos | react-native-svg |
| Lenguaje | TypeScript strict |

## Estructura de directorios

```
src/
  app/           # Rutas expo-router (index, explore, player/[id])
  components/
    scout/       # Componentes de la app (PlayerCard, Filters, Header, etc.)
    ui/          # Primitivos reutilizables del template
  constants/     # theme.ts (Colors, Spacing, Fonts)
  hooks/
    queries/     # React Query hooks (use-premier-league-players, etc.)
  lib/
    bzzoiro/     # cliente HTTP, tipos y funciones de endpoints
```

## Convenciones de código

- **Path alias**: `@/*` apunta a `./src/*`, `@/assets/*` a `./assets/*`.
- **Nombres de archivo**: kebab-case (`player-card.tsx`, `use-premier-league-players.ts`).
- **Componentes**: PascalCase, un archivo por componente.
- **Sin emojis** en el código ni en la UI.
- **Idioma de la UI**: español.
- **Tema**: siempre dark. Acento verde lima `#A3FF12` / Tailwind `lime-400`.
- **TypeScript**: sin `any`, sin `ts-ignore`. Usar tipos de `src/lib/bzzoiro/types.ts`.
- **Estilos**: solo clases NativeWind (Tailwind). No usar `StyleSheet.create` para componentes nuevos.
- **Comentarios**: solo para lógica no obvia. No narrar lo que hace el código.

## API Bzzoiro (BSD)

### Autenticación

```
Authorization: Token X
```

El token se lee desde `process.env.EXPO_PUBLIC_BZZOIRO_API_KEY` (definido en `.env.local`, gitignoreado).

> **Nota de seguridad**: con prefijo `EXPO_PUBLIC_` el token queda embebido en el bundle. En producción se recomienda mover las llamadas a un proxy/edge function.

### Base URL

```
https://sports.bzzoiro.com/api/v2/
```

### Endpoints usados

| Función | Endpoint |
|---------|---------|
| Listar ligas | `GET /leagues/` |
| Standings Premier League | `GET /leagues/1/standings/` |
| Squad de un equipo | `GET /teams/{team_id}/squad/` |
| Detalle de jugador | `GET /players/{player_id}/` |
| Stats por partido (jugador) | `GET /players/{player_id}/stats/` |

### IDs clave

- **Premier League** league_id = `1`, season_id actual = `337` (25/26)
- Los 20 team_ids se obtienen del standings response.

### Cliente HTTP

Todo acceso a la API debe ir a través de `src/lib/bzzoiro/client.ts`. No hacer `fetch` directo en hooks o componentes.

## MCP bsd (solo para el agente de IA, no en runtime)

El servidor MCP `bsd` está configurado en `~/.cursor/mcp.json` con URL `https://sports.bzzoiro.com/mcp`. El agente puede usarlo para explorar datos durante el desarrollo. La app **no** llama al MCP en runtime; usa la REST API.

Herramientas disponibles: `list_leagues`, `list_seasons`, `get_standings`, `get_team_squad`, `search_players`, `get_player_detail`, `get_player_stats`, y más.

## GSD (Get Shit Done)

Este proyecto usa el sistema GSD para planificación estructurada. Los artefactos viven en `.planning/`.

Para avanzar en el proyecto:
- `/gsd-progress` — ver estado actual y próxima acción
- `/gsd-plan-phase N` — planificar una fase
- `/gsd-execute-phase N` — ejecutar una fase

## Comandos útiles

```bash
npm start          # Expo dev server
npm run web        # Abrir en browser
npm run android    # Emulador Android
npm run ios        # Simulador iOS
npm run lint       # ESLint via expo lint
```

## Variables de entorno

`.env.local` (gitignoreado, nunca commitear):

```
EXPO_PUBLIC_BZZOIRO_API_KEY=ebf2601064dfedc88fd5621a19656333d9fc898d
EXPO_PUBLIC_BZZOIRO_BASE_URL=https://sports.bzzoiro.com/api/v2
```

## Reglas para la UI

1. Fondo principal: `bg-black` / `bg-zinc-950`.
2. Cards: `bg-zinc-900` con `rounded-xl`.
3. Acento / ratings altos: `text-lime-400` o `bg-lime-400`.
4. Texto primario: `text-white`, secundario: `text-zinc-400`.
5. Barras de progreso / rating: componente `RatingBar` en `src/components/scout/rating-bar.tsx`.
6. Imágenes de jugadores: `expo-image` con `contentFit="cover"` y placeholder gris oscuro.
7. No usar `ThemedText`/`ThemedView` en componentes scout nuevos — usar clases NativeWind directamente.
