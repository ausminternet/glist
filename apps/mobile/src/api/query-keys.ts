export const queryKeys = {
  households: () => ['households'] as const,
  shoppingLists: (householdId: string | number) =>
    ['households', 'household', householdId, 'shoppingLists'] as const,
  shoppingList: (householdId: string | number, listId: string) =>
    ['households', 'household', householdId, 'shoppingLists', listId] as const,
  shoppingListItems: (householdId: string | number, listId: string) =>
    [
      'households',
      'household',
      householdId,
      'shoppingLists',
      listId,
      'items',
    ] as const,
  inventoryItems: (householdId: string | number) =>
    ['households', 'household', householdId, 'inventoryItems'] as const,
  categories: (householdId: string | number) =>
    ['households', 'household', householdId, 'categories'] as const,
  shops: (householdId: string | number) =>
    ['households', 'household', householdId, 'shops'] as const,
}
