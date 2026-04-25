import { useState, useRef, useCallback, useEffect } from 'react';

export function useStateAsync(initialValue) {
  const [state, setState] = useState(initialValue);
  const resolversRef = useRef([]);

  const asyncSetState = useCallback((newValue) => {
    return new Promise((resolve) => {
      resolversRef.current.push(resolve);
      setState(newValue);
    });
  }, []);

  // Resolve all pending promises after state updates
  useEffect(() => {
    if (resolversRef.current.length > 0) {
      const pending = resolversRef.current;
      resolversRef.current = [];
      pending.forEach((resolve) => resolve(state));
    }
  }, [state]);

  return [state, asyncSetState];
}
