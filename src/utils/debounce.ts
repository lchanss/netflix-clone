export function debounce<T extends unknown[], R = void>(
  func: (...args: T) => R,
  delay: number
): (...args: T) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return function (this: unknown, ...args: T): void {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
