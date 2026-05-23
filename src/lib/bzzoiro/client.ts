const BASE_URL =
  process.env.EXPO_PUBLIC_BZZOIRO_BASE_URL ?? 'https://sports.bzzoiro.com/api/v2';

const API_KEY = process.env.EXPO_PUBLIC_BZZOIRO_API_KEY ?? '';

export async function bzzoiroFetch<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Token ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`BSD API error ${response.status}: ${await response.text()}`);
  }

  return response.json() as Promise<T>;
}
