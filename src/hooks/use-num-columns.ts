import { useWindowDimensions } from 'react-native';

export function useNumColumns(): number {
  const { width } = useWindowDimensions();
  if (width >= 1200) return 5;
  if (width >= 900) return 4;
  if (width >= 600) return 3;
  if (width >= 400) return 2;
  return 1;
}
