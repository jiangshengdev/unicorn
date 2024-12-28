export function ascend<T>(a: T, b: T): -1 | 0 | 1 {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function descend<T>(a: T, b: T): -1 | 0 | 1 {
  return a < b ? 1 : a > b ? -1 : 0;
}
