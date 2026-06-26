import { useCallback, useRef } from 'react';

export function useDebouncedControl(
  onControl: (action: string, value?: unknown) => void,
  delay = 80
) {
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  return useCallback((action: string, value?: unknown) => {
    clearTimeout(timers.current[action]);
    timers.current[action] = setTimeout(() => onControl(action, value), delay);
  }, [onControl, delay]);
}
