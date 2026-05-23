export function getAge(dob: string | null): string {
  if (!dob) return '—';
  return `${Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} años`;
}

export function formatValue(eur: number | null | undefined): string {
  if (!eur) return '—';
  if (eur >= 1_000_000) return `€${(eur / 1_000_000).toFixed(1)}M`;
  if (eur >= 1_000) return `€${(eur / 1_000).toFixed(0)}K`;
  return `€${eur}`;
}

export function ratingColor(r: number): string {
  if (r >= 7.5) return '#64ffda';
  if (r >= 7.0) return '#eab308';
  if (r >= 6.5) return '#f97316';
  return '#ef4444';
}
