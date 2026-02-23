export function sameUuids(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false

  const setA = new Set(a)
  for (const id of b) {
    if (!setA.has(id)) return false
  }

  return true
}
