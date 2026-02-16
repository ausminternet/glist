export const queryKeys = {
  households: () => ['households'] as const,
  shoppingListItems: (householdId: string | number) =>
    ['households', 'household', householdId, 'shoppingListItems'] as const,
  inventoryItems: (householdId: string | number) =>
    ['households', 'household', householdId, 'inventoryItems'] as const,
  categories: (householdId: string | number) =>
    ['households', 'household', householdId, 'categories'] as const,
  shops: (householdId: string | number) =>
    ['households', 'household', householdId, 'shops'] as const,
}
