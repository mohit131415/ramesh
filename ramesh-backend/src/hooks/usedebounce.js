import { useState, useEffect } from 'react';

// Usage:
// const debouncedSearchTerm = useDebounce(searchTerm, 500);
export function useDebounce(value, delay) {
const [debouncedValue, setDebouncedValue] = useState(value);

useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedValue(value);
  }, delay);

  return () => {
    clearTimeout(handler);
  };
}, [value, delay]);

return debouncedValue;
}
