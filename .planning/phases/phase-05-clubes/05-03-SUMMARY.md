---
phase: "05-clubes"
plan: "03"
subsystem: "clubs"
tags: ["svg", "react-native-svg", "expo-router", "react-query", "nativewind"]
dependency_graph:
  requires:
    - "05-01"
    - "05-02"
  provides:
    - "clubs/[id] detail screen"
    - "PitchFormation SVG component"
  affects:
    - "src/app/clubs/"
    - "src/components/scout/"
tech_stack:
  added: []
  patterns:
    - "react-native-svg for pitch SVG rendering"
    - "generateStaticParams for static web build"
    - "groupByPosition pure function for squad grouping"
key_files:
  created:
    - "src/components/scout/pitch-formation.tsx"
    - "src/app/clubs/[id].tsx"
  modified: []
decisions:
  - "Used React.Fragment keyed by player.id inside SVG map to avoid extra SVG Group wrappers"
  - "Tab active state uses inline style borderBottomWidth/borderBottomColor since Tailwind cannot express dynamic borders"
  - "jersey_number ?? short_name.charAt(0) fallback for dot label when number is null"
metrics:
  duration: "~20 minutes"
  completed_date: "2026-05-29"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 05 Plan 03: Club Detail Screen & PitchFormation Summary

SVG pitch formation component (4-3-3) and full /clubs/[id] detail screen with Plantilla, Partidos, and Alineacion tabs.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Crear componente PitchFormation | fce06e7 | src/components/scout/pitch-formation.tsx |
| 2 | Crear pantalla clubs/[id].tsx | df42a7b | src/app/clubs/[id].tsx |

## What Was Built

### PitchFormation (Task 1)

`src/components/scout/pitch-formation.tsx` renders a football pitch SVG (300x440 viewBox) with:
- Dark green field background (`#0D2B0D`) with field lines at 20% white opacity
- Penalty areas, six-yard boxes, center circle, halfway line via `Rect`/`Line`/`Circle`
- Formation label "Formacion estimada 4-3-3" at top
- Up to 11 starters selected: 1G + 4D + 3M + 3F from the first players in each group
- Each player rendered as turquoise circle (`#64ffda`) with jersey number in black and short_name (8 chars) below

### Club Detail Screen (Task 2)

`src/app/clubs/[id].tsx` with:
- `generateStaticParams`: calls `getStandings()` and maps the 20 team_ids to `{ id: string }[]`
- Header: team logo via expo-image (`contentFit="contain"`), team name from standings, position and pts
- Back button: `router.canGoBack() ? router.back() : router.replace('/clubs')`
- Three tabs with dynamic active indicator (inline `borderBottomWidth: 2, borderBottomColor: '#64ffda'`):
  - **Plantilla**: squad grouped by G/D/M/F using `groupByPosition`, each row shows player photo, jersey number, name, nationality
  - **Partidos**: placeholder with `Clock` icon (lucide-react-native) and Spanish message
  - **Alineacion**: `<PitchFormation players={squadData?.players ?? []} />` with note below

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all tabs render real data from the API or intentional placeholders (Partidos tab is intentionally a placeholder per CLUB-04 spec).

## Threat Flags

No new unplanned security surface. T-05-04 (URL param id) mitigated: `teamId = Number(id)` and `useTeamSquad` has `enabled: teamId > 0`.

## Self-Check: PASSED

- src/components/scout/pitch-formation.tsx: EXISTS
- src/app/clubs/[id].tsx: EXISTS
- Commit fce06e7: EXISTS
- Commit df42a7b: EXISTS
- npx tsc --noEmit: no errors
