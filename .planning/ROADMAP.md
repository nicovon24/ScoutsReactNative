# Roadmap — Scout PL

**4 fases** | **13 requirements** | Premier League player analysis app

| # | Fase | Goal | Requirements | Estado |
|---|------|------|-------------|--------|
| 1 | Setup y Fundación | App base lista con API client y estilos configurados | SETUP-01..04 | Completado |
| 2 | Home + Detalle | Home con lista filtrable y pantalla de detalle con radar | HOME-01..05, DETAIL-01..04 | Completado |
| 3 | Liga tab | Standings de la Premier League con tabla visual | LIG-01..03 | Pendiente |
| 4 | Polish y Comparacion | Comparar jugadores, mejoras de UX, animaciones | COMP-01..03 | Pendiente |

---

## Fase 1: Setup y Fundación ✓

**Goal**: App base lista para desarrollo — NativeWind, React Query, cliente BSD, variables de entorno.

**Requirements**: SETUP-01, SETUP-02, SETUP-03, SETUP-04

**Success Criteria**:
1. `npm run web` abre sin errores
2. NativeWind aplica clases Tailwind en components
3. `bzzoiroFetch('/leagues/')` retorna data sin errores de auth
4. QueryClientProvider disponible en toda la app

---

## Fase 2: Home + Detalle Jugador ✓

**Goal**: Usuario puede explorar jugadores de la Premier League, filtrar, buscar y ver perfil completo.

**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, DETAIL-01, DETAIL-02, DETAIL-03, DETAIL-04

**Success Criteria**:
1. Home muestra cards de jugadores de los 20 equipos
2. Filtro de posición actualiza la lista instantáneamente
3. Búsqueda de texto filtra por nombre/club
4. Tap en card navega al detalle
5. Pantalla de detalle muestra radar SVG y stats

---

## Fase 3: Liga Tab (Pendiente)

**Goal**: Tab "Liga" muestra la tabla de standings de la Premier League 25/26.

**Requirements**: LIG-01 (tabla standings), LIG-02 (forma de los últimos 5 partidos), LIG-03 (xG stats)

---

## Fase 3.5: Design System Migration (Nueva)

**Goal**: Portar el design system de LDP-challenge al proyecto React Native. UI limpia, tokens semánticos, componentes modulares, paridad visual con el web.

**Requirements**: DS-01..07

---

## Fase 4: Polish y Comparación (Pendiente)

**Goal**: Comparar dos jugadores lado a lado, animaciones de carga, mejoras de UX.

**Requirements**: COMP-01 (selección de dos jugadores), COMP-02 (vista comparativa), COMP-03 (favoritos)
