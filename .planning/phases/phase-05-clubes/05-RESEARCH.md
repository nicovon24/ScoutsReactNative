# Phase 5: Clubes - Research

**Researched:** 2026-05-29
**Domain:** React Native / Expo Router — club list + detail screens with SVG pitch layout
**Confidence:** HIGH

---

## Summary

Phase 5 adds a "Clubes" section to the app. The sidebar nav item (CLUB-01) is already partially wired: `sidebar.tsx` already imports `Shield` from `lucide-react-native` and already has the `/clubs` entry in `NAV_ITEMS`. No sidebar change is needed — that requirement is already met.

The two new route files needed are `src/app/clubs/index.tsx` (list, CLUB-02) and `src/app/clubs/[id].tsx` (detail, CLUB-03/04/05). Both screens follow the exact same structural conventions as `player/[id].tsx` and `compare.tsx`: design-token object `C`, `ScrollView` root, `inline StyleSheet`-free style objects, `expo-image` for logos, `useWindowDimensions` for responsive layout.

The API surface is fully sufficient for CLUB-02 and CLUB-03. `useLeagueStandings` already returns the 20 teams with `team_id`, `team_name`, `position`, and `pts` — no new endpoint needed for the list screen. `getTeamSquad` returns `SquadPlayer[]` with `position` in `'G' | 'D' | 'M' | 'F'` — grouping by position is a pure client-side `reduce`. The fixtures endpoint does not exist in the BSD API; CLUB-04 must be a styled placeholder card. CLUB-05 (pitch SVG) uses `react-native-svg` which is already installed at v15.15.4.

**Primary recommendation:** Reuse `useLeagueStandings` for the list; add a single new hook `useTeamSquad(teamId)` wrapping `getTeamSquad`; build two new screen files and two new component files (club-card, pitch-position-picker already scaffolded per git status).

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Team list data | React Query cache | BSD REST `/leagues/1/standings/` | Standings already fetched by home screen — will hit cache |
| Squad data per team | React Query cache | BSD REST `/teams/{id}/squad/` | Per-team fetch, staleTime 24h same as other squad queries |
| Club grid (CLUB-02) | Client / screen | — | Pure presentation of standings data |
| Squad grouped by position (CLUB-03) | Client / screen | — | Client-side groupBy on SquadPlayer[] |
| Fixtures placeholder (CLUB-04) | Client / screen | — | No API support; static UI only |
| Pitch SVG (CLUB-05) | Client / screen | react-native-svg | SVG rendered from static formation data |
| Logo images | CDN (bzzoiro img) | expo-image cache | Same URL pattern as player photos |

---

## Standard Stack

### Core (all already installed — no new packages needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-router | ~56.2.6 | File-based routing — `clubs/index.tsx` + `clubs/[id].tsx` | Already used for all routes |
| @tanstack/react-query | ^5.100.13 | Data fetching + caching for standings and squad | Already used; standings data will be cache hit |
| react-native-svg | 15.15.4 | Pitch SVG diagram (CLUB-05) | Already installed |
| expo-image | ~56.0.9 | Team logos via `https://sports.bzzoiro.com/img/team/{id}/` | Already used in PlayerCard and compare screen |
| lucide-react-native | ^1.16.0 | Icons in header and placeholder | Already used |
| nativewind | ^4.2.4 | Tailwind classes for layout | Project convention |

### No New Packages Required

All dependencies are present. Zero installation steps needed.

---

## Package Legitimacy Audit

No new packages are installed in this phase. Audit not applicable.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
  app/
    clubs/
      index.tsx          # CLUB-02: list of 20 clubs
      [id].tsx           # CLUB-03/04/05: club detail (3 tabs)
  components/
    scout/
      club-card.tsx      # Card component used in grid (already scaffolded per git status)
      pitch-position-picker.tsx  # SVG pitch diagram (already scaffolded per git status)
  hooks/
    queries/
      use-team-squad.ts  # Thin wrapper: useQuery({ queryKey: ['team-squad', teamId], queryFn: () => getTeamSquad(teamId) })
```

### System Architecture Diagram

```
User taps "Clubes" in sidebar
        |
        v
src/app/clubs/index.tsx
  useLeagueStandings(1)   ──► React Query cache (likely already warm from home screen)
        |                              |
        | standings.standings[]        | miss → BSD GET /leagues/1/standings/
        v
  Filter by search query (client-side)
        |
        v
  FlatList / 2-col grid of ClubCard
        |
        v
  User taps a ClubCard  ──► router.push('/clubs/42')

src/app/clubs/[id].tsx
  useLeagueStandings(1)   ──► React Query cache (warm)
  useTeamSquad(id)        ──► React Query cache  ──► miss → BSD GET /teams/{id}/squad/
        |
        v
  Tab state: 'plantilla' | 'partidos' | 'alineacion'
        |
   ┌────┼────────────────────┐
   v    v                    v
Plantilla  Partidos        Alineacion
(grouped   (placeholder    (PitchPositionPicker
 by pos)    card)           SVG via react-native-svg)
```

### Pattern 1: Club List Screen (clubs/index.tsx)

**What:** ScrollView or FlatList of StandingEntry items rendered as ClubCard components, with a TextInput search bar at the top. Responsive: 2 columns on narrow, 3+ on wide.

**When to use:** Any list-of-teams screen.

**Example — data wiring:**
```typescript
// Source: existing pattern in src/app/index.tsx + src/hooks/queries/use-league.ts
const { data, isLoading } = useLeagueStandings(PREMIER_LEAGUE_ID);
const teams = data?.standings ?? [];

const filtered = search.trim()
  ? teams.filter((t) => t.team_name.toLowerCase().includes(search.toLowerCase()))
  : teams;
```

**Logo URL pattern (verified from PlayerCard and player detail):**
```typescript
const logoUrl = `https://sports.bzzoiro.com/img/team/${team_id}/`;
// Use expo-image: <Image source={{ uri: logoUrl }} contentFit="contain" />
```

### Pattern 2: Club Detail — Tab Navigation (clubs/[id].tsx)

**What:** Local `useState<'plantilla' | 'partidos' | 'alineacion'>` drives three content panels. No expo-router tabs — inline tab bar built with Pressable, matching the design-token system in `player/[id].tsx`.

**Why local state, not expo-router nested tabs:** The existing detail screens (`player/[id].tsx`, `compare.tsx`) all use local state for section switching. Nested file-based tabs would require a sub-layout file and add unnecessary complexity for three simple panels.

**Example:**
```typescript
const [tab, setTab] = useState<'plantilla' | 'partidos' | 'alineacion'>('plantilla');

// Tab bar
<View style={{ flexDirection: 'row', gap: 8, ... }}>
  {(['plantilla', 'partidos', 'alineacion'] as const).map((t) => (
    <Pressable key={t} onPress={() => setTab(t)} style={...}>
      <Text style={{ color: tab === t ? C.green : C.muted, ... }}>{TAB_LABELS[t]}</Text>
    </Pressable>
  ))}
</View>
```

### Pattern 3: Squad Grouping by Position (CLUB-03)

**What:** Client-side grouping of `SquadPlayer[]` by position string `'G' | 'D' | 'M' | 'F'`. Rendered as sections with a position header row followed by player rows.

**Position label map (Spanish, per project convention):**
```typescript
const POSITION_LABELS: Record<string, string> = {
  G: 'Porteros',
  D: 'Defensores',
  M: 'Centrocampistas',
  F: 'Delanteros',
  '': 'Sin posición',
};
const POSITION_ORDER = ['G', 'D', 'M', 'F', ''];
```

**Grouping utility:**
```typescript
function groupByPosition(players: SquadPlayer[]) {
  const groups: Record<string, SquadPlayer[]> = {};
  for (const p of players) {
    const key = p.position || '';
    (groups[key] ??= []).push(p);
  }
  return POSITION_ORDER
    .filter((k) => groups[k]?.length)
    .map((k) => ({ position: k, players: groups[k] }));
}
```

**Player row per CLUB-03 design ref:**
```typescript
// Each row: jersey_number | name | nationality
// Photo: https://sports.bzzoiro.com/img/player/{id}/ via expo-image
```

### Pattern 4: New Hook — useTeamSquad

```typescript
// src/hooks/queries/use-team-squad.ts
import { useQuery } from '@tanstack/react-query';
import { getTeamSquad } from '@/lib/bzzoiro/endpoints';

export function useTeamSquad(teamId: number) {
  return useQuery({
    queryKey: ['team-squad', teamId],
    queryFn: () => getTeamSquad(teamId),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: teamId > 0,
  });
}
```

Note: `useLeaguePlayers` in `use-league.ts` already fires `['team-squad', teamId]` queries for all 20 teams. By the time a user navigates to a club detail from the home screen (which has been open), the squad data is very likely already in the React Query cache. `useTeamSquad` will be a cache hit in the common flow.

### Pattern 5: Pitch SVG (CLUB-05)

**What:** Static SVG pitch rendered with `react-native-svg`. A simplified 4-3-3 (or configurable formation) lays out player dots at fixed percentage positions on the pitch rectangle. No live lineup data from API — uses squad positions to populate a default formation.

**Approach:** Since the BSD API provides no formation/lineup data, the pitch shows a static representative layout: pick the first G, first 4 Ds, first 3 Ms, first 3 Fs from squad. Label each dot with `jersey_number` or `short_name`.

**react-native-svg basic pattern (already used in SkillRadar, DonutCircle, RatingEvolution, CompareRadar):**
```typescript
import Svg, { Rect, Circle, Text as SvgText, Line } from 'react-native-svg';

// Pitch is a green Rect. Player dots are Circle + SvgText overlays.
// Use percentage-based coordinates × SVG viewBox width/height.
```

**Formation coordinate map (percentage of pitch, top = goalkeeper end):**
```typescript
const FORMATION_POSITIONS = {
  G:  [{ x: 0.50, y: 0.92 }],
  D:  [{ x: 0.20, y: 0.73 }, { x: 0.40, y: 0.73 }, { x: 0.60, y: 0.73 }, { x: 0.80, y: 0.73 }],
  M:  [{ x: 0.25, y: 0.52 }, { x: 0.50, y: 0.52 }, { x: 0.75, y: 0.52 }],
  F:  [{ x: 0.25, y: 0.28 }, { x: 0.50, y: 0.24 }, { x: 0.75, y: 0.28 }],
};
// Adjust y values for desired formation shape
```

### Pattern 6: Fixtures Placeholder (CLUB-04)

**What:** A Card-styled surface with a centered message indicating that match data is not yet available.

**Design ref matches existing empty states in compare.tsx:**
```typescript
<View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 32, alignItems: 'center', gap: 12 }}>
  <Calendar size={32} color={C.muted} />
  <Text style={{ color: C.primary, fontSize: 16, fontWeight: '900' }}>Próximamente</Text>
  <Text style={{ color: C.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
    Los partidos de este club no están disponibles en esta versión.
  </Text>
</View>
```

`Calendar` is available in `lucide-react-native` (already installed). [ASSUMED] — not verified via Context7 for this specific icon name, but lucide has a comprehensive icon set and `Calendar` is a common icon.

### Anti-Patterns to Avoid

- **Using `StyleSheet.create`:** Project convention prohibits it for new components. Use inline style objects with design-token constants (same as `player/[id].tsx` and `compare.tsx`).
- **Using NativeWind classes in the detail screen:** The detail screens use inline style objects with the `C` token object — not Tailwind classes. Match the existing pattern for consistency. The list screen (`clubs/index.tsx`) can use NativeWind classes since it is simpler, but the detail screen should follow `player/[id].tsx` style.
- **Creating a new `useLeaguePlayers` call for the club list:** The list screen only needs `useLeagueStandings` (teams + standings). Do not trigger 20 squad fetches from the list screen.
- **Nested expo-router tabs for club detail sections:** Use local `useState` as in all existing detail screens.
- **Hardcoding team IDs for the pitch:** The pitch populates from the actual squad data, not hardcoded player lists.
- **Using `ThemedText` / `ThemedView`:** Project convention prohibits these in scout components.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG pitch rendering | Custom Canvas / plain View layout | `react-native-svg` (already installed) | Cross-platform SVG, already used in SkillRadar/DonutCircle |
| Team logo fetching | Custom fetch | `expo-image` with BSD img URL | Handles caching, placeholders, contentFit |
| Squad data fetching | Raw `fetch` in component | `useTeamSquad` hook via React Query | Cache sharing with home screen squad queries |
| Standings data | New API call | `useLeagueStandings` (already exists) | Cache hit from home screen in normal flow |
| Position grouping | External library | Plain `reduce` / `groupBy` utility | Zero-dep, type-safe with existing `SquadPlayer` type |

---

## Common Pitfalls

### Pitfall 1: Sidebar Already Has the Clubs Entry

**What goes wrong:** Implementing CLUB-01 as if sidebar.tsx needs editing, wasting time.
**Why it happens:** The sidebar already has `{ href: '/clubs', icon: Shield, label: 'Clubes' }` in `NAV_ITEMS` (line 36 of sidebar.tsx). The `Shield` icon is already imported.
**How to avoid:** CLUB-01 is already done. The planner should mark it complete and start from CLUB-02.
**Warning signs:** If a plan task says "add Shield icon to sidebar" — it is wrong.

### Pitfall 2: Squad Cache Key Collision

**What goes wrong:** `useTeamSquad` uses a different query key than `useLeaguePlayers`, causing duplicate fetches and cache misses.
**Why it happens:** `useLeaguePlayers` already uses `['team-squad', entry.team_id]`. A new hook must use the same key format.
**How to avoid:** The new hook must use `queryKey: ['team-squad', teamId]` — exactly matching the existing keys in `use-league.ts` line 43.
**Warning signs:** Network tab shows fresh squad requests on club detail even after visiting home.

### Pitfall 3: SVG Text Clipping on Small Dots

**What goes wrong:** Player names overflow the dot circle on the pitch SVG.
**Why it happens:** `jersey_number` fits; `short_name` may be long.
**How to avoid:** Use `jersey_number` as the dot label (1-2 chars). Show `short_name` in a tooltip or separate list below the pitch.
**Warning signs:** Names overlap / get clipped at small pitch sizes.

### Pitfall 4: Empty Position Groups

**What goes wrong:** A squad may have players with `position: ''` (empty string), causing a "Sin posición" group to appear.
**Why it happens:** `SquadPlayer.position` is typed as `'G' | 'D' | 'M' | 'F' | ''`. Some squads have unclassified players.
**How to avoid:** Render the empty-string group last, or omit it from the pitch SVG. In the plantilla list, show it as "Sin posición".
**Warning signs:** Unexpected extra section in squad list.

### Pitfall 5: FlatList vs ScrollView for Club Grid

**What goes wrong:** Using plain ScrollView with `.map()` for the 20-club grid causes all items to render at once — acceptable for 20 items but inconsistent with project pattern.
**Why it happens:** 20 items is small, tempting a simple map.
**How to avoid:** Use FlatList with `numColumns` for the grid, consistent with the home screen pattern. 20 items is fine for FlatList with `initialNumToRender=20`.
**Warning signs:** No virtualization in a list that should be scrollable.

### Pitfall 6: Missing `generateStaticParams` for Web Build

**What goes wrong:** `clubs/[id].tsx` with Expo static rendering (web) needs `generateStaticParams` or the route 404s at build time.
**Why it happens:** `player/[id].tsx` exports `generateStaticParams`. If the club detail doesn't, web static export may fail.
**How to avoid:** Export `generateStaticParams` from `clubs/[id].tsx` returning the 20 team IDs derived from standings. Use `getStandings` directly (same pattern as `getLeaguePlayerIds` in `src/lib/static-params.ts`).
**Warning signs:** Web build error about dynamic routes missing static params.

---

## Code Examples

### ClubCard component skeleton
```typescript
// src/components/scout/club-card.tsx
// Source: pattern from player/[id].tsx design tokens + compare.tsx card layout

const C = {
  bg: '#0F0F0F', surface: '#161616', card: '#1C1C1C',
  border: '#2C2C2C', primary: '#F2F2F2', secondary: '#B8B8B8',
  muted: '#717171', green: '#64ffda',
};

interface ClubCardProps {
  entry: StandingEntry;  // from types.ts
}

export function ClubCard({ entry }: ClubCardProps) {
  const logoUrl = `https://sports.bzzoiro.com/img/team/${entry.team_id}/`;
  return (
    <Pressable style={{ ... }}>
      <Image source={{ uri: logoUrl }} style={{ width: 48, height: 48 }} contentFit="contain" />
      <Text style={{ color: C.primary, fontWeight: '900' }}>{entry.team_name}</Text>
      <Text style={{ color: C.muted }}>#{entry.position} · {entry.pts} pts</Text>
    </Pressable>
  );
}
```

### useTeamSquad hook
```typescript
// src/hooks/queries/use-team-squad.ts
import { useQuery } from '@tanstack/react-query';
import { getTeamSquad } from '@/lib/bzzoiro/endpoints';
import type { SquadResponse } from '@/lib/bzzoiro/types';

export function useTeamSquad(teamId: number) {
  return useQuery<SquadResponse>({
    queryKey: ['team-squad', teamId],   // matches key in use-league.ts
    queryFn: () => getTeamSquad(teamId),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: teamId > 0,
  });
}
```

### Pitch SVG skeleton
```typescript
// src/components/scout/pitch-position-picker.tsx (already scaffolded)
import Svg, { Rect, Circle, Text as SvgText, Line } from 'react-native-svg';

const PITCH_W = 300;
const PITCH_H = 440;

export function PitchPositionPicker({ groups }: { groups: PositionGroup[] }) {
  return (
    <Svg width={PITCH_W} height={PITCH_H} viewBox={`0 0 ${PITCH_W} ${PITCH_H}`}>
      {/* Pitch background */}
      <Rect x={0} y={0} width={PITCH_W} height={PITCH_H} fill="#1a3a1a" rx={12} />
      {/* Center line */}
      <Line x1={0} y1={PITCH_H / 2} x2={PITCH_W} y2={PITCH_H / 2} stroke="#2a5a2a" strokeWidth={1} />
      {/* Player dots */}
      {/* ... map FORMATION_POSITIONS × squad players */}
    </Svg>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| expo-router nested tab layout for sub-sections | Local `useState` tab switcher | Project convention from phase 2 | Simpler, matches all existing detail screens |
| StyleSheet.create | Inline style objects with design-token `C` object | Project convention from phase 3.5 | Required for all new components |
| react-native `Image` | `expo-image` with `contentFit` | Phase 1 setup | Better caching and placeholder support |

**Deprecated/outdated:**
- `ThemedText`/`ThemedView`: Not used in scout components per AGENTS.md. Already replaced by inline styles everywhere.
- NativeWind classes on detail screens: Aunque `player/[id].tsx` usa inline C tokens, la decisión del proyecto es usar solo NativeWind en todos los componentes nuevos de Fase 5 (AGENTS.md regla). Los nuevos screens clubs/ usarán clases Tailwind puras.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `Calendar` icon exists in `lucide-react-native` v1.16.0 | Pattern 6 / CLUB-04 placeholder | Use a different icon (e.g., `Clock`, `Info`) — low impact |
| A2 | BSD API has no fixtures endpoint for teams | Summary / CLUB-04 | If fixtures exist, CLUB-04 could show real data — positive surprise, low risk |
| A3 | Static export (`generateStaticParams`) is used for web | Pitfall 6 | If app is native-only deploy, this export is optional — no harm in including it |

---

## Open Questions (RESOLVED)

1. **Pitch formation — fixed or user-selectable?**
   **RESOLVED:** Static 4-3-3 formation derived from squad positions. Label "Formación estimada". No interactivity.

2. **Club detail back navigation target**
   **RESOLVED:** `router.canGoBack() ? router.back() : router.replace('/clubs')` con label "Todos los clubes".

3. **Player photos in squad list**
   **RESOLVED:** Incluir foto de jugador 32×32 con `expo-image` (`contentFit="cover"`) en cada fila de la plantilla.

---

## Environment Availability

No new external dependencies. All tools and packages confirmed installed.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| react-native-svg | CLUB-05 pitch SVG | Yes | 15.15.4 | — |
| expo-image | Club logos, player photos | Yes | ~56.0.9 | — |
| lucide-react-native | Icons | Yes | ^1.16.0 | — |
| @tanstack/react-query | Data fetching | Yes | ^5.100.13 | — |
| expo-router | Route files | Yes | ~56.2.6 | — |

---

## Validation Architecture

No automated test infrastructure detected in this project (no jest.config, no vitest.config, no `__tests__` directory). Manual verification is the testing approach.

### Phase Requirements Manual Verification Map

| Req ID | Behavior | Verification Method |
|--------|----------|---------------------|
| CLUB-01 | "Clubes" nav item with Shield icon in sidebar | Already present in sidebar.tsx — visual confirm |
| CLUB-02 | `/clubs` shows 20-team grid with search | Navigate to /clubs, verify 20 cards appear, test search filter |
| CLUB-03 | `/clubs/[id]` Plantilla tab groups players by G/D/M/F | Navigate to any club detail, tap Plantilla |
| CLUB-04 | Partidos tab shows graceful placeholder | Navigate to any club detail, tap Partidos |
| CLUB-05 | Alineacion tab shows SVG pitch with player positions | Navigate to any club detail, tap Alineacion |

---

## Security Domain

No new auth flows, no new API keys, no user input persisted. The BSD API token is already handled by `bzzoiroFetch` in `client.ts`. No ASVS categories are newly applicable for this phase beyond what already exists in the project.

---

## Sources

### Primary (HIGH confidence)
- `src/components/layout/sidebar.tsx` — CLUB-01 already implemented (Shield icon, `/clubs` route in NAV_ITEMS)
- `src/lib/bzzoiro/types.ts` — `StandingEntry`, `SquadPlayer`, `SquadResponse` types verified
- `src/lib/bzzoiro/endpoints.ts` — `getTeamSquad`, `getStandings` signatures verified
- `src/hooks/queries/use-league.ts` — `useLeagueStandings`, React Query key `['team-squad', teamId]` verified
- `package.json` — `react-native-svg@15.15.4`, `expo-image@~56.0.9`, `lucide-react-native@^1.16.0` confirmed
- `src/app/player/[id].tsx` — design token pattern `C`, inline styles, Screen structure reference
- `src/app/compare.tsx` — tab-state pattern, empty-state card pattern, `SearchSlot` pattern

### Secondary (MEDIUM confidence)
- AGENTS.md project conventions — NativeWind only, no StyleSheet.create, dark theme, Spanish UI [CITED: project file]

### Tertiary (LOW confidence — see Assumptions Log)
- `Calendar` icon availability in lucide-react-native v1.16.0 [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — all packages confirmed in package.json
- Architecture: HIGH — directly derived from existing route and hook patterns in codebase
- API surface: HIGH — types and endpoints verified from source files
- SVG pitch layout: MEDIUM — coordinate system is assumed; exact positions need visual tuning
- Pitfalls: HIGH — derived from direct code inspection

**Research date:** 2026-05-29
**Valid until:** 2026-06-28 (stable stack, 30-day window)
