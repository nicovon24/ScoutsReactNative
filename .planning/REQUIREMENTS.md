# Requirements — Scout PL

## v1 Requirements

### Setup y Fundación
- [x] **SETUP-01**: App arranca con tema dark y tabs personalizados
- [x] **SETUP-02**: NativeWind v4 configurado (babel, metro, tailwind, global.css)
- [x] **SETUP-03**: API key guardada en `.env.local`, cliente HTTP en `src/lib/bzzoiro/`
- [x] **SETUP-04**: React Query con QueryClientProvider en layout raíz

### Home — Explorar Jugadores
- [x] **HOME-01**: Usuario puede ver lista de jugadores de Premier League (todos los equipos)
- [x] **HOME-02**: Usuario puede filtrar por posición (POR/DEF/MED/DEL)
- [x] **HOME-03**: Usuario puede buscar por nombre, club o nacionalidad
- [x] **HOME-04**: Cada card muestra posición, foto, nombre, edad, club, stats y barra de rating
- [x] **HOME-05**: Lista virtualizada con rendimiento (initialNumToRender, maxToRenderPerBatch)

### Detalle de Jugador
- [x] **DETAIL-01**: Usuario puede tocar una card y ver el detalle del jugador
- [x] **DETAIL-02**: Pantalla muestra bio (edad, altura, valor de mercado, contrato)
- [x] **DETAIL-03**: Pantalla muestra radar SVG con 5 dimensiones de rendimiento
- [x] **DETAIL-04**: Pantalla muestra stats agregados de la temporada (goles, asist, xG, partidos)

## v2 Requirements

- Tabla de standings en tab "Liga"
- Comparación de dos jugadores
- Histórico de temporadas pasadas
- Favoritos persistentes (AsyncStorage)

## Out of Scope

- Autenticación — app pública sin login
- Notificaciones push — requiere backend
- Datos live (WebSocket) — siguiente milestone

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| SETUP-01..04 | Fase 1 | Completado |
| HOME-01..05 | Fase 2 | Completado |
| DETAIL-01..04 | Fase 2 | Completado |
