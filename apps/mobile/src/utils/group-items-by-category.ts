import type { CategoryView } from '@glist/views'

const UNCATEGORIZED = 'uncategorized'

type GroupedCategory<T> = {
  readonly title: string
  readonly data: T[]
  readonly categoryId: string
}

export function groupItemsByCategory<T extends { categoryId: string | null }>(
  items: T[],
  categories: CategoryView[],
  skipEmpty = false,
): GroupedCategory<T>[] {
  const map = new Map<string, T[]>()

  for (const item of items) {
    const key = item.categoryId ?? UNCATEGORIZED
    const bucket = map.get(key)

    if (bucket) {
      bucket.push(item)
    } else {
      map.set(key, [item])
    }
  }

  const result: GroupedCategory<T>[] = []

  // Uncategorized
  const uncategorized = map.get(UNCATEGORIZED) ?? []
  if (!skipEmpty || uncategorized.length > 0) {
    result.push({
      title: 'Ohne Kategorie',
      categoryId: UNCATEGORIZED,
      data: uncategorized,
    })
  }

  const knownCategoryIds = new Set(categories.map((c) => c.id))

  // Known categories (in given order)
  for (const category of categories) {
    const data = map.get(category.id) ?? []

    if (!skipEmpty || data.length > 0) {
      result.push({
        title: category.name,
        categoryId: category.id,
        data,
      })
    }
  }

  // Orphaned categories (present in items but not in categories list)
  for (const [key, data] of map.entries()) {
    if (key === UNCATEGORIZED) continue
    if (knownCategoryIds.has(key)) continue

    if (!skipEmpty || data.length > 0) {
      result.push({
        title: key,
        categoryId: key,
        data,
      })
    }
  }

  return result
}
